require('dotenv').config()
const mongoose = require('mongoose')
const Product = require('../models/Product')
const Outfit = require('../models/Outfit')

const unsplash = (id, w = 900) => `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✓ Kết nối MongoDB')

    await Outfit.deleteMany({})

    const products = await Product.find({ isActive: true, isDeleted: false }).lean()
    const bySlug = (partial) => products.find((p) => p.slug.includes(partial))

    const blazerNu = bySlug('blazer-oversize-nu')
    const thunBasic = bySlug('thun-basic-cotton')
    const jeansBaggy = bySlug('jeans-baggy')
    const sneakerTrang = bySlug('sneaker-trang')
    const bucketHat = bySlug('bucket-hat')

    const blazerNam = bySlug('blazer-nam-slim')
    const taySlim = bySlug('tay-slim-fit-den')
    const oxfordTrang = bySlug('so-mi-oxford-trang')
    const oxfordNam = bySlug('tay-oxford-nam') || bySlug('loafer-da-nam')
    const thatLung = bySlug('that-lung-da')

    const damMidi = bySlug('dam-midi-satin')
    const caoGot = bySlug('cao-got-nu')
    const tuiXachTay = bySlug('tui-xach-tay-da')
    const kinhMat = bySlug('kinh-mat-aviator')

    const outfits = []

    if (blazerNu && thunBasic && jeansBaggy && sneakerTrang) {
      outfits.push({
        name: 'Street Smart',
        description: 'Phong cách đường phố hiện đại, thanh lịch',
        image: { public_id: 'outfit_1', url: unsplash('photo-1552374196-1ab2a1c593e8') },
        items: [
          { product: blazerNu._id, label: 'Blazer Oversize', posX: 48, posY: 28 },
          { product: thunBasic._id, label: 'Áo Thun Basic', posX: 45, posY: 42 },
          { product: jeansBaggy._id, label: 'Jeans Baggy', posX: 42, posY: 62 },
          { product: sneakerTrang._id, label: 'Sneaker Trắng', posX: 44, posY: 88 },
        ],
        order: 1,
      })
    }

    if (blazerNam && taySlim && oxfordTrang) {
      const items = [
        { product: blazerNam._id, label: 'Blazer Slim Fit', posX: 50, posY: 25 },
        { product: oxfordTrang._id, label: 'Sơ Mi Oxford', posX: 48, posY: 40 },
        { product: taySlim._id, label: 'Quần Tây Slim', posX: 46, posY: 65 },
      ]
      if (oxfordNam) items.push({ product: oxfordNam._id, label: 'Giày Loafer Da', posX: 48, posY: 90 })
      if (thatLung) items.push({ product: thatLung._id, label: 'Thắt Lưng Da', posX: 50, posY: 52 })

      outfits.push({
        name: 'Gentleman Classic',
        description: 'Quý ông lịch lãm, chuẩn mực công sở',
        image: { public_id: 'outfit_2', url: unsplash('photo-1507679799987-c73779587ccf') },
        items,
        order: 2,
      })
    }

    if (damMidi && caoGot && tuiXachTay) {
      const items = [
        { product: damMidi._id, label: 'Đầm Midi Satin', posX: 50, posY: 35 },
        { product: caoGot._id, label: 'Giày Cao Gót', posX: 45, posY: 88 },
        { product: tuiXachTay._id, label: 'Túi Xách Tay', posX: 28, posY: 55 },
      ]
      if (kinhMat) items.push({ product: kinhMat._id, label: 'Kính Mát Aviator', posX: 50, posY: 10 })

      outfits.push({
        name: 'Evening Elegance',
        description: 'Dạ tiệc sang trọng, nổi bật mọi ánh nhìn',
        image: { public_id: 'outfit_3', url: unsplash('photo-1566174053879-31528523f8ae') },
        items,
        order: 3,
      })
    }

    if (outfits.length === 0) {
      console.log('Không tìm đủ sản phẩm để tạo outfit. Tạo outfit mẫu từ random products...')
      const sample = products.slice(0, 12)
      outfits.push({
        name: 'Casual Weekend',
        description: 'Thoải mái cuối tuần',
        image: { public_id: 'outfit_f', url: unsplash('photo-1552374196-1ab2a1c593e8') },
        items: sample.slice(0, 4).map((p, i) => ({
          product: p._id,
          label: p.name,
          posX: 30 + i * 12,
          posY: 20 + i * 20,
        })),
        order: 1,
      })
    }

    const created = await Outfit.create(outfits)
    console.log(`✓ ${created.length} Outfits đã được tạo`)
    created.forEach((o) => console.log(`  - ${o.name} (${o.items.length} items)`))

    process.exit(0)
  } catch (error) {
    console.error('Lỗi:', error)
    process.exit(1)
  }
}

seed()
