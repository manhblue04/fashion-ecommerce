const crypto = require('crypto')
const User = require('../models/User')
const generateToken = require('../utils/generateToken')
const sendEmail = require('../utils/sendEmail')

exports.register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' })
    }

    const verifyToken = crypto.randomBytes(32).toString('hex')

    const user = await User.create({
      name: name || '',
      email,
      password,
      verifyToken,
      verifyTokenExpire: Date.now() + 24 * 60 * 60 * 1000,
    })

    const verifyUrl = `${process.env.CLIENT_URL}/xac-thuc-email/${verifyToken}`
    await sendEmail({
      to: email,
      subject: 'Xác thực tài khoản - Fashion Store',
      html: `
        <h2>Chào mừng bạn đến với Fashion Store!</h2>
        <p>Vui lòng nhấn vào liên kết bên dưới để xác thực tài khoản:</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#d4a574;color:#fff;text-decoration:none;border-radius:4px;">Xác thực tài khoản</a>
        <p>Liên kết có hiệu lực trong 24 giờ.</p>
      `,
    })

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
    })
  } catch (error) {
    next(error)
  }
}

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' })
    }

    user.isVerified = true
    user.verifyToken = undefined
    user.verifyTokenExpire = undefined
    await user.save()

    res.json({ success: true, message: 'Xác thực email thành công! Bạn có thể đăng nhập.' })
  } catch (error) {
    next(error)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' })
    }

    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'Vui lòng xác thực email trước khi đăng nhập' })
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' })
    }

    const token = generateToken(user._id)

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      addresses: user.addresses,
    }

    res.json({ success: true, token, user: userResponse })
  } catch (error) {
    next(error)
  }
}

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    res.json({ success: true, user })
  } catch (error) {
    next(error)
  }
}

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    })

    res.json({ success: true, message: 'Cập nhật thông tin thành công', user })
  } catch (error) {
    next(error)
  }
}

exports.updateAvatar = async (req, res, next) => {
  try {
    const cloudinary = require('../config/cloudinary')

    if (req.user.avatar?.public_id) {
      await cloudinary.uploader.destroy(req.user.avatar.public_id)
    }

    const result = await cloudinary.uploader.upload(req.body.avatar, {
      folder: 'avatars',
      width: 300,
      crop: 'scale',
    })

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: { public_id: result.public_id, url: result.secure_url } },
      { new: true }
    )

    res.json({ success: true, message: 'Cập nhật ảnh đại diện thành công', user })
  } catch (error) {
    next(error)
  }
}

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ success: false, message: 'Email không tồn tại trong hệ thống' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000
    await user.save()

    const resetUrl = `${process.env.CLIENT_URL}/dat-lai-mat-khau/${resetToken}`
    await sendEmail({
      to: email,
      subject: 'Đặt lại mật khẩu - Fashion Store',
      html: `
        <h2>Đặt lại mật khẩu</h2>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào liên kết bên dưới:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#d4a574;color:#fff;text-decoration:none;border-radius:4px;">Đặt lại mật khẩu</a>
        <p>Liên kết có hiệu lực trong 30 phút.</p>
      `,
    })

    res.json({ success: true, message: 'Email đặt lại mật khẩu đã được gửi' })
  } catch (error) {
    next(error)
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' })
    }

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    res.json({ success: true, message: 'Đặt lại mật khẩu thành công' })
  } catch (error) {
    next(error)
  }
}

exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    const { fullName, phone, addressLine, city, district, ward, isDefault } = req.body

    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false))
    }

    user.addresses.push({ fullName, phone, addressLine, city, district, ward, isDefault: isDefault || user.addresses.length === 0 })
    await user.save()

    res.json({ success: true, message: 'Thêm địa chỉ thành công', addresses: user.addresses })
  } catch (error) {
    next(error)
  }
}

exports.updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    const address = user.addresses.id(req.params.addressId)

    if (!address) {
      return res.status(404).json({ success: false, message: 'Địa chỉ không tồn tại' })
    }

    if (req.body.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false))
    }

    Object.assign(address, req.body)
    await user.save()

    res.json({ success: true, message: 'Cập nhật địa chỉ thành công', addresses: user.addresses })
  } catch (error) {
    next(error)
  }
}

exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    user.addresses = user.addresses.filter((addr) => addr._id.toString() !== req.params.addressId)
    await user.save()

    res.json({ success: true, message: 'Xóa địa chỉ thành công', addresses: user.addresses })
  } catch (error) {
    next(error)
  }
}
