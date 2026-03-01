require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const User = require('./models/User')
const Category = require('./models/Category')
const Product = require('./models/Product')
const Banner = require('./models/Banner')
const Coupon = require('./models/Coupon')
const Review = require('./models/Review')
const Order = require('./models/Order')
const OrderLog = require('./models/OrderLog')
const Wishlist = require('./models/Wishlist')
const Setting = require('./models/Setting')

const unsplash = (id, w = 800) => `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`

/* ─── CATEGORIES (12) ─── */
const categoriesData = [
  { name: 'Áo sơ mi', description: 'Áo sơ mi nam nữ thanh lịch, phù hợp công sở và dạo phố', image: { public_id: 'seed_cat_1', url: unsplash('photo-1596755094514-f87e34085b2c') } },
  { name: 'Áo thun & Polo', description: 'Áo thun, áo polo thoải mái cho mọi hoạt động', image: { public_id: 'seed_cat_2', url: unsplash('photo-1521572163474-6864f9cf17ab') } },
  { name: 'Áo khoác & Blazer', description: 'Áo khoác, blazer thời trang mùa lạnh và công sở', image: { public_id: 'seed_cat_3', url: unsplash('photo-1591047139829-d91aecb6caea') } },
  { name: 'Quần tây', description: 'Quần tây công sở lịch lãm cho nam và nữ', image: { public_id: 'seed_cat_4', url: unsplash('photo-1594938298603-c8148c4dae35') } },
  { name: 'Quần jeans', description: 'Quần jeans đa dạng kiểu dáng từ slim fit đến wide leg', image: { public_id: 'seed_cat_5', url: unsplash('photo-1542272604-787c3835535d') } },
  { name: 'Váy & Đầm', description: 'Váy đầm nữ tính, thanh lịch cho mọi dịp', image: { public_id: 'seed_cat_6', url: unsplash('photo-1595777457583-95e059d581b8') } },
  { name: 'Áo len & Cardigan', description: 'Áo len, cardigan ấm áp phong cách mùa đông', image: { public_id: 'seed_cat_7', url: unsplash('photo-1576566588028-4147f3842f27') } },
  { name: 'Đồ thể thao', description: 'Trang phục thể thao năng động, thoáng mát', image: { public_id: 'seed_cat_8', url: unsplash('photo-1571019613454-1cb2f99b2d8b') } },
  { name: 'Phụ kiện thời trang', description: 'Thắt lưng, khăn quàng, mũ, kính mắt thời trang', image: { public_id: 'seed_cat_9', url: unsplash('photo-1606760227091-3dd870d97f1d') } },
  { name: 'Giày dép', description: 'Giày sneaker, giày tây, sandal đa phong cách', image: { public_id: 'seed_cat_10', url: unsplash('photo-1549298916-b41d501d3772') } },
  { name: 'Túi xách', description: 'Túi xách, balo thời trang nam nữ', image: { public_id: 'seed_cat_11', url: unsplash('photo-1584917865442-de89df76afd3') } },
  { name: 'Đồ ngủ & Nội y', description: 'Đồ ngủ, nội y thoải mái chất liệu cao cấp', image: { public_id: 'seed_cat_12', url: unsplash('photo-1616048056617-93b94a339009') } },
]

/* ─── USERS (15) ─── */
const usersData = [
  { name: 'Admin', email: 'admin@fashion.vn', password: 'Admin@123', role: 'admin', phone: '0901000001', isVerified: true, addresses: [{ fullName: 'Quản trị viên', phone: '0901000001', addressLine: '123 Nguyễn Huệ', city: 'TP. Hồ Chí Minh', district: 'Quận 1', ward: 'Phường Bến Nghé', isDefault: true }] },
  { name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', password: 'User@123', role: 'user', phone: '0901000002', isVerified: true, addresses: [{ fullName: 'Nguyễn Văn An', phone: '0901000002', addressLine: '45 Lê Lợi', city: 'TP. Hồ Chí Minh', district: 'Quận 1', ward: 'Phường Bến Thành', isDefault: true }] },
  { name: 'Trần Thị Bích', email: 'bich.tran@gmail.com', password: 'User@123', role: 'user', phone: '0901000003', isVerified: true, addresses: [{ fullName: 'Trần Thị Bích', phone: '0901000003', addressLine: '78 Trần Hưng Đạo', city: 'Hà Nội', district: 'Quận Hoàn Kiếm', ward: 'Phường Hàng Bài', isDefault: true }] },
  { name: 'Lê Minh Cường', email: 'cuong.le@gmail.com', password: 'User@123', role: 'user', phone: '0901000004', isVerified: true, addresses: [{ fullName: 'Lê Minh Cường', phone: '0901000004', addressLine: '12 Hoàng Diệu', city: 'Đà Nẵng', district: 'Quận Hải Châu', ward: 'Phường Thạch Thang', isDefault: true }] },
  { name: 'Phạm Thu Dung', email: 'dung.pham@gmail.com', password: 'User@123', role: 'user', phone: '0901000005', isVerified: true, addresses: [{ fullName: 'Phạm Thu Dung', phone: '0901000005', addressLine: '56 Bà Triệu', city: 'Hà Nội', district: 'Quận Hai Bà Trưng', ward: 'Phường Nguyễn Du', isDefault: true }] },
  { name: 'Hoàng Đức Em', email: 'em.hoang@gmail.com', password: 'User@123', role: 'user', phone: '0901000006', isVerified: true, addresses: [{ fullName: 'Hoàng Đức Em', phone: '0901000006', addressLine: '89 Nguyễn Trãi', city: 'TP. Hồ Chí Minh', district: 'Quận 5', ward: 'Phường 2', isDefault: true }] },
  { name: 'Vũ Thị Phương', email: 'phuong.vu@gmail.com', password: 'User@123', role: 'user', phone: '0901000007', isVerified: true, addresses: [{ fullName: 'Vũ Thị Phương', phone: '0901000007', addressLine: '34 Hai Bà Trưng', city: 'TP. Hồ Chí Minh', district: 'Quận 3', ward: 'Phường 6', isDefault: true }] },
  { name: 'Đặng Quang Hải', email: 'hai.dang@gmail.com', password: 'User@123', role: 'user', phone: '0901000008', isVerified: true, addresses: [{ fullName: 'Đặng Quang Hải', phone: '0901000008', addressLine: '67 Lý Thường Kiệt', city: 'Hà Nội', district: 'Quận Ba Đình', ward: 'Phường Trúc Bạch', isDefault: true }] },
  { name: 'Bùi Ngọc Lan', email: 'lan.bui@gmail.com', password: 'User@123', role: 'user', phone: '0901000009', isVerified: true, addresses: [{ fullName: 'Bùi Ngọc Lan', phone: '0901000009', addressLine: '21 Pasteur', city: 'TP. Hồ Chí Minh', district: 'Quận 1', ward: 'Phường Nguyễn Thái Bình', isDefault: true }] },
  { name: 'Ngô Thanh Tùng', email: 'tung.ngo@gmail.com', password: 'User@123', role: 'user', phone: '0901000010', isVerified: true, addresses: [{ fullName: 'Ngô Thanh Tùng', phone: '0901000010', addressLine: '99 Võ Văn Tần', city: 'TP. Hồ Chí Minh', district: 'Quận 3', ward: 'Phường 7', isDefault: true }] },
  { name: 'Trịnh Hoài Nam', email: 'nam.trinh@gmail.com', password: 'User@123', role: 'user', phone: '0901000011', isVerified: true, addresses: [{ fullName: 'Trịnh Hoài Nam', phone: '0901000011', addressLine: '15 Điện Biên Phủ', city: 'Đà Nẵng', district: 'Quận Thanh Khê', ward: 'Phường Chính Gián', isDefault: true }] },
  { name: 'Lý Thị Mai', email: 'mai.ly@gmail.com', password: 'User@123', role: 'user', phone: '0901000012', isVerified: true, addresses: [{ fullName: 'Lý Thị Mai', phone: '0901000012', addressLine: '42 Cách Mạng Tháng 8', city: 'TP. Hồ Chí Minh', district: 'Quận 10', ward: 'Phường 12', isDefault: true }] },
  { name: 'Đỗ Hữu Phúc', email: 'phuc.do@gmail.com', password: 'User@123', role: 'user', phone: '0901000013', isVerified: true, addresses: [{ fullName: 'Đỗ Hữu Phúc', phone: '0901000013', addressLine: '8 Phạm Ngọc Thạch', city: 'TP. Hồ Chí Minh', district: 'Quận 3', ward: 'Phường 6', isDefault: true }] },
  { name: 'Cao Yến Nhi', email: 'nhi.cao@gmail.com', password: 'User@123', role: 'user', phone: '0901000014', isVerified: true, addresses: [{ fullName: 'Cao Yến Nhi', phone: '0901000014', addressLine: '31 Tôn Đức Thắng', city: 'Hà Nội', district: 'Quận Đống Đa', ward: 'Phường Hàng Bột', isDefault: true }] },
  { name: 'Phan Văn Khoa', email: 'khoa.phan@gmail.com', password: 'User@123', role: 'user', phone: '0901000015', isVerified: true, addresses: [{ fullName: 'Phan Văn Khoa', phone: '0901000015', addressLine: '55 Nguyễn Đình Chiểu', city: 'TP. Hồ Chí Minh', district: 'Quận 3', ward: 'Phường 5', isDefault: true }] },
]

/* ─── PRODUCTS (60) ─── */
const brands = ['ZARA', 'H&M', 'Uniqlo', 'Mango', 'COS', 'Massimo Dutti', 'Pull&Bear', 'Ivy Moda', 'Canifa', 'Routine']
const materials = ['Cotton 100%', 'Cotton pha Polyester', 'Linen', 'Silk', 'Denim', 'Kaki', 'Vải tweed', 'Vải thun lạnh', 'Vải gió', 'Nỉ', 'Len cashmere', 'Vải rib', 'Vải chiffon', 'Da PU', 'Canvas']
const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const allColors = ['Đen', 'Trắng', 'Beige', 'Xám', 'Nâu', 'Xanh navy', 'Xanh rêu', 'Đỏ đô', 'Hồng pastel', 'Xanh dương']

const productsRaw = [
  // ── Áo sơ mi (catIdx=0, 5 SP) ──
  { catIdx: 0, name: 'Áo Sơ Mi Oxford Trắng Classic', price: 599000, discountPrice: 499000, gender: 'men', brand: 'Massimo Dutti', material: 'Cotton 100%', sizes: ['S','M','L','XL'], colors: ['Trắng','Xanh dương'], stock: 80, isFeatured: true, images: [{ public_id: 'p1a', url: unsplash('photo-1602810318383-e386cc2a3ccf') }, { public_id: 'p1b', url: unsplash('photo-1598032895397-b9472444bf93') }], description: 'Áo sơ mi Oxford cổ điển, chất vải cotton dày dặn, phù hợp mặc công sở lẫn dạo phố. Thiết kế slim fit tôn dáng.' },
  { catIdx: 0, name: 'Áo Sơ Mi Linen Oversize', price: 650000, discountPrice: 0, gender: 'unisex', brand: 'COS', material: 'Linen', sizes: ['S','M','L','XL','XXL'], colors: ['Beige','Trắng','Xanh rêu'], stock: 55, isFeatured: false, images: [{ public_id: 'p2a', url: unsplash('photo-1607345366928-199ea26cfe3e') }], description: 'Áo sơ mi linen oversize thoáng mát, phong cách tối giản Bắc Âu. Chất vải linen tự nhiên, thoáng khí.' },
  { catIdx: 0, name: 'Áo Sơ Mi Sọc Xanh Công Sở', price: 520000, discountPrice: 420000, gender: 'men', brand: 'Routine', material: 'Cotton pha Polyester', sizes: ['M','L','XL'], colors: ['Xanh dương','Xanh navy'], stock: 65, isFeatured: false, images: [{ public_id: 'p3a', url: unsplash('photo-1563389234808-252b6b3b3aca') }], description: 'Áo sơ mi sọc nhẹ nhàng, phom regular fit thoải mái. Lý tưởng cho phong cách công sở hàng ngày.' },
  { catIdx: 0, name: 'Áo Sơ Mi Nữ Tay Phồng Satin', price: 750000, discountPrice: 0, gender: 'women', brand: 'Mango', material: 'Silk', sizes: ['XS','S','M','L'], colors: ['Đen','Trắng','Hồng pastel'], stock: 40, isFeatured: true, images: [{ public_id: 'p4a', url: unsplash('photo-1618354691373-d851c5c3a990') }], description: 'Áo sơ mi nữ chất satin mềm mại, tay phồng nữ tính. Phù hợp đi tiệc và sự kiện sang trọng.' },
  { catIdx: 0, name: 'Áo Sơ Mi Denim Vintage', price: 680000, discountPrice: 580000, gender: 'unisex', brand: 'Pull&Bear', material: 'Denim', sizes: ['S','M','L','XL'], colors: ['Xanh dương'], stock: 45, isFeatured: false, images: [{ public_id: 'p5a', url: unsplash('photo-1626497764746-6dc36546b388') }], description: 'Áo sơ mi denim wash nhẹ, phong cách vintage. Có thể mặc đơn hoặc layering.' },

  // ── Áo thun & Polo (catIdx=1, 5 SP) ──
  { catIdx: 1, name: 'Áo Thun Basic Cotton', price: 250000, discountPrice: 199000, gender: 'unisex', brand: 'Uniqlo', material: 'Cotton 100%', sizes: ['XS','S','M','L','XL','XXL'], colors: ['Đen','Trắng','Xám','Beige','Xanh navy'], stock: 200, isFeatured: true, images: [{ public_id: 'p6a', url: unsplash('photo-1521572163474-6864f9cf17ab') }, { public_id: 'p6b', url: unsplash('photo-1583743814966-8936f5b7be1a') }], description: 'Áo thun basic chất cotton mềm mại, co giãn nhẹ. Thiết kế cổ tròn tối giản, dễ phối đồ.' },
  { catIdx: 1, name: 'Áo Polo Pique Nam', price: 450000, discountPrice: 0, gender: 'men', brand: 'Routine', material: 'Cotton pha Polyester', sizes: ['M','L','XL','XXL'], colors: ['Đen','Trắng','Xanh navy','Xanh rêu'], stock: 90, isFeatured: false, images: [{ public_id: 'p7a', url: unsplash('photo-1625910513413-5fc09b67e846') }], description: 'Áo polo pique cổ bẻ, chất vải thoáng mát. Phù hợp đi làm casual Friday và đi chơi.' },
  { catIdx: 1, name: 'Áo Thun Oversize Graphic', price: 350000, discountPrice: 280000, gender: 'unisex', brand: 'H&M', material: 'Cotton 100%', sizes: ['S','M','L','XL'], colors: ['Đen','Trắng','Beige'], stock: 120, isFeatured: false, images: [{ public_id: 'p8a', url: unsplash('photo-1576566588028-4147f3842f27') }], description: 'Áo thun oversize in graphic minimalist, phong cách streetwear hiện đại.' },
  { catIdx: 1, name: 'Áo Thun Nữ Crop Top', price: 280000, discountPrice: 0, gender: 'women', brand: 'ZARA', material: 'Vải rib', sizes: ['XS','S','M','L'], colors: ['Đen','Trắng','Hồng pastel','Beige'], stock: 75, isFeatured: false, images: [{ public_id: 'p9a', url: unsplash('photo-1594223274512-ad4803739b7c') }], description: 'Áo thun crop top nữ chất rib co giãn, ôm body. Dễ mix-match với quần jeans hoặc chân váy.' },
  { catIdx: 1, name: 'Áo Polo Nữ Đính Nút Vàng', price: 550000, discountPrice: 450000, gender: 'women', brand: 'Mango', material: 'Cotton pha Polyester', sizes: ['XS','S','M','L'], colors: ['Trắng','Đen','Beige'], stock: 50, isFeatured: true, images: [{ public_id: 'p10a', url: unsplash('photo-1618354691438-25bc04584c23') }], description: 'Áo polo nữ thanh lịch với nút kim loại vàng sang trọng. Phom regular fit.' },

  // ── Áo khoác & Blazer (catIdx=2, 5 SP) ──
  { catIdx: 2, name: 'Blazer Oversize Nữ', price: 1250000, discountPrice: 990000, gender: 'women', brand: 'ZARA', material: 'Vải tweed', sizes: ['XS','S','M','L'], colors: ['Đen','Beige','Xám'], stock: 35, isFeatured: true, images: [{ public_id: 'p11a', url: unsplash('photo-1591047139829-d91aecb6caea') }, { public_id: 'p11b', url: unsplash('photo-1594938298603-c8148c4dae35') }], description: 'Blazer oversize phong cách Hàn Quốc, vai rộng, có lót trong. Phù hợp mix cùng quần ống rộng hoặc váy ngắn.' },
  { catIdx: 2, name: 'Áo Khoác Bomber Jacket', price: 890000, discountPrice: 0, gender: 'men', brand: 'Pull&Bear', material: 'Vải gió', sizes: ['M','L','XL','XXL'], colors: ['Đen','Xanh navy','Xanh rêu'], stock: 45, isFeatured: false, images: [{ public_id: 'p12a', url: unsplash('photo-1591085686350-798c0f9faa7f') }], description: 'Áo khoác bomber classic, chất vải gió nhẹ chống nước nhẹ. Có lớp lót mỏng bên trong.' },
  { catIdx: 2, name: 'Blazer Nam Slim Fit', price: 1500000, discountPrice: 1290000, gender: 'men', brand: 'Massimo Dutti', material: 'Cotton pha Polyester', sizes: ['S','M','L','XL'], colors: ['Đen','Xanh navy','Xám'], stock: 30, isFeatured: true, images: [{ public_id: 'p13a', url: unsplash('photo-1507679799987-c73779587ccf') }], description: 'Blazer nam phom slim fit, 2 nút cài. Chất vải dày dặn nhưng thoáng. Lý tưởng cho công sở.' },
  { catIdx: 2, name: 'Áo Khoác Da PU Biker', price: 1100000, discountPrice: 0, gender: 'unisex', brand: 'H&M', material: 'Da PU', sizes: ['S','M','L','XL'], colors: ['Đen','Nâu'], stock: 40, isFeatured: false, images: [{ public_id: 'p14a', url: unsplash('photo-1551028719-00167b16eac5') }], description: 'Áo khoác da biker kinh điển, chất da PU cao cấp mềm mại. Phong cách mạnh mẽ, cá tính.' },
  { catIdx: 2, name: 'Áo Khoác Gió Unisex Nhẹ', price: 490000, discountPrice: 390000, gender: 'unisex', brand: 'Canifa', material: 'Vải gió', sizes: ['S','M','L','XL','XXL'], colors: ['Đen','Xanh navy','Beige','Trắng'], stock: 100, isFeatured: false, images: [{ public_id: 'p15a', url: unsplash('photo-1544022613-e87ca75a784a') }], description: 'Áo khoác gió siêu nhẹ, gấp gọn bỏ túi. Chống nước nhẹ, phù hợp du lịch và hoạt động ngoài trời.' },

  // ── Quần tây (catIdx=3, 5 SP) ──
  { catIdx: 3, name: 'Quần Tây Slim Fit Đen', price: 650000, discountPrice: 550000, gender: 'men', brand: 'Massimo Dutti', material: 'Cotton pha Polyester', sizes: ['29','30','31','32','33','34'], colors: ['Đen','Xanh navy'], stock: 70, isFeatured: true, images: [{ public_id: 'p16a', url: unsplash('photo-1594938298603-c8148c4dae35') }], description: 'Quần tây nam slim fit, lưng có dây kéo. Vải co giãn nhẹ, thoải mái suốt ngày dài.' },
  { catIdx: 3, name: 'Quần Tây Nữ Ống Đứng', price: 580000, discountPrice: 0, gender: 'women', brand: 'Mango', material: 'Cotton pha Polyester', sizes: ['XS','S','M','L','XL'], colors: ['Đen','Xám','Beige'], stock: 55, isFeatured: false, images: [{ public_id: 'p17a', url: unsplash('photo-1506629082955-511b1aa562c8') }], description: 'Quần tây nữ ống đứng thanh lịch, cạp cao tôn dáng. Phù hợp công sở và đi chơi.' },
  { catIdx: 3, name: 'Quần Âu Nam Regular', price: 490000, discountPrice: 0, gender: 'men', brand: 'Routine', material: 'Kaki', sizes: ['30','31','32','33','34'], colors: ['Xám','Nâu','Beige'], stock: 60, isFeatured: false, images: [{ public_id: 'p18a', url: unsplash('photo-1473966968600-fa801b869a1a') }], description: 'Quần âu nam phom regular, chất kaki mềm thoáng. Lý chinh xác cho smart casual.' },
  { catIdx: 3, name: 'Quần Culottes Nữ', price: 520000, discountPrice: 420000, gender: 'women', brand: 'Ivy Moda', material: 'Cotton pha Polyester', sizes: ['S','M','L'], colors: ['Đen','Beige','Xanh navy'], stock: 45, isFeatured: false, images: [{ public_id: 'p19a', url: unsplash('photo-1509631179647-0177331693ae') }], description: 'Quần culottes ống rộng thanh lịch, cạp chun thoải mái. Phong cách minimalist hiện đại.' },
  { catIdx: 3, name: 'Quần Tây Wide Leg Unisex', price: 690000, discountPrice: 0, gender: 'unisex', brand: 'COS', material: 'Cotton pha Polyester', sizes: ['S','M','L','XL'], colors: ['Đen','Beige','Xám'], stock: 50, isFeatured: false, images: [{ public_id: 'p20a', url: unsplash('photo-1541099649105-f69ad21f3246') }], description: 'Quần tây ống rộng phong cách Hàn Quốc, cạp cao. Phom rộng thoải mái, dễ phối đồ.' },

  // ── Quần jeans (catIdx=4, 5 SP) ──
  { catIdx: 4, name: 'Quần Jeans Slim Fit Xanh Đậm', price: 590000, discountPrice: 490000, gender: 'men', brand: 'Pull&Bear', material: 'Denim', sizes: ['29','30','31','32','33','34'], colors: ['Xanh dương'], stock: 85, isFeatured: true, images: [{ public_id: 'p21a', url: unsplash('photo-1542272604-787c3835535d') }], description: 'Quần jeans nam slim fit wash đậm, co giãn tốt. Kiểu dáng classic phù hợp mọi phong cách.' },
  { catIdx: 4, name: 'Quần Jeans Nữ Skinny', price: 550000, discountPrice: 0, gender: 'women', brand: 'ZARA', material: 'Denim', sizes: ['XS','S','M','L'], colors: ['Xanh dương','Đen'], stock: 65, isFeatured: false, images: [{ public_id: 'p22a', url: unsplash('photo-1541099649105-f69ad21f3246') }], description: 'Quần jeans nữ skinny cạp cao, co giãn 4 chiều. Ôm dáng tự nhiên, thoải mái vận động.' },
  { catIdx: 4, name: 'Quần Jeans Baggy Unisex', price: 620000, discountPrice: 520000, gender: 'unisex', brand: 'H&M', material: 'Denim', sizes: ['S','M','L','XL'], colors: ['Xanh dương','Xám'], stock: 70, isFeatured: false, images: [{ public_id: 'p23a', url: unsplash('photo-1604176354204-9268737828e4') }], description: 'Quần jeans baggy phong cách Y2K, ống rộng suông. Wash nhẹ vintage.' },
  { catIdx: 4, name: 'Quần Jeans Rách Gối Nam', price: 580000, discountPrice: 0, gender: 'men', brand: 'Pull&Bear', material: 'Denim', sizes: ['30','31','32','33','34'], colors: ['Xanh dương'], stock: 50, isFeatured: false, images: [{ public_id: 'p24a', url: unsplash('photo-1582552938357-32b906df40cb') }], description: 'Quần jeans rách gối phong cách street style. Chất denim dày dặn, wash xước tự nhiên.' },
  { catIdx: 4, name: 'Quần Jeans Mom Fit Nữ', price: 650000, discountPrice: 550000, gender: 'women', brand: 'Mango', material: 'Denim', sizes: ['XS','S','M','L'], colors: ['Xanh dương','Beige'], stock: 45, isFeatured: true, images: [{ public_id: 'p25a', url: unsplash('photo-1565084888279-aca607ecce0c') }], description: 'Quần jeans mom fit cạp cao, ống suông nhẹ. Phong cách vintage cổ điển dễ phối.' },

  // ── Váy & Đầm (catIdx=5, 5 SP) ──
  { catIdx: 5, name: 'Đầm Midi Satin Thanh Lịch', price: 1200000, discountPrice: 950000, gender: 'women', brand: 'Mango', material: 'Silk', sizes: ['XS','S','M','L'], colors: ['Đen','Đỏ đô','Beige'], stock: 30, isFeatured: true, images: [{ public_id: 'p26a', url: unsplash('photo-1595777457583-95e059d581b8') }, { public_id: 'p26b', url: unsplash('photo-1566174053879-31528523f8ae') }], description: 'Đầm midi chất satin mềm mại, dáng A-line thanh lịch. Phù hợp dự tiệc, event sang trọng.' },
  { catIdx: 5, name: 'Váy Liền Hoa Nhí Vintage', price: 680000, discountPrice: 0, gender: 'women', brand: 'ZARA', material: 'Vải chiffon', sizes: ['XS','S','M','L'], colors: ['Trắng','Hồng pastel'], stock: 40, isFeatured: false, images: [{ public_id: 'p27a', url: unsplash('photo-1572804013309-59a88b7e92f1') }], description: 'Váy liền hoạ tiết hoa nhí vintage, tay phồng nhẹ. Phong cách cottage core lãng mạn.' },
  { catIdx: 5, name: 'Đầm Blazer Công Sở', price: 980000, discountPrice: 850000, gender: 'women', brand: 'Ivy Moda', material: 'Cotton pha Polyester', sizes: ['S','M','L'], colors: ['Đen','Beige','Xanh navy'], stock: 35, isFeatured: false, images: [{ public_id: 'p28a', url: unsplash('photo-1583496661160-fb5886a0aaaa') }], description: 'Đầm blazer phong cách công sở quyền lực. Thiết kế cổ vest, tay dài chuyên nghiệp.' },
  { catIdx: 5, name: 'Chân Váy Xếp Ly Midi', price: 450000, discountPrice: 0, gender: 'women', brand: 'H&M', material: 'Cotton pha Polyester', sizes: ['XS','S','M','L'], colors: ['Đen','Beige','Xám','Xanh rêu'], stock: 60, isFeatured: false, images: [{ public_id: 'p29a', url: unsplash('photo-1583496661160-fb5886a0aaaa') }], description: 'Chân váy xếp ly midi thanh lịch, cạp chun thoải mái. Dễ phối với áo thun hoặc áo sơ mi.' },
  { catIdx: 5, name: 'Đầm Maxi Boho Đi Biển', price: 750000, discountPrice: 620000, gender: 'women', brand: 'ZARA', material: 'Vải chiffon', sizes: ['S','M','L'], colors: ['Trắng','Beige','Hồng pastel'], stock: 35, isFeatured: false, images: [{ public_id: 'p30a', url: unsplash('photo-1515886657613-9f3515b0c78f') }], description: 'Đầm maxi phong cách boho bay bổng, chất chiffon thoáng nhẹ. Lý tưởng cho kỳ nghỉ biển.' },

  // ── Áo len & Cardigan (catIdx=6, 5 SP) ──
  { catIdx: 6, name: 'Áo Len Cashmere Cổ Tròn', price: 1800000, discountPrice: 1500000, gender: 'unisex', brand: 'COS', material: 'Len cashmere', sizes: ['S','M','L','XL'], colors: ['Beige','Xám','Đen','Nâu'], stock: 25, isFeatured: true, images: [{ public_id: 'p31a', url: unsplash('photo-1576566588028-4147f3842f27') }], description: 'Áo len cashmere cao cấp, siêu mềm mại và ấm áp. Phom regular fit unisex.' },
  { catIdx: 6, name: 'Cardigan Dáng Dài Nữ', price: 750000, discountPrice: 0, gender: 'women', brand: 'Mango', material: 'Len cashmere', sizes: ['XS','S','M','L'], colors: ['Beige','Xám','Đen'], stock: 40, isFeatured: false, images: [{ public_id: 'p32a', url: unsplash('photo-1434389677669-e08b4cda3a38') }], description: 'Cardigan dáng dài nữ tính, có nút cài phía trước. Lớp khoác hoàn hảo cho mùa thu đông.' },
  { catIdx: 6, name: 'Áo Len Cổ Lọ Nam', price: 680000, discountPrice: 580000, gender: 'men', brand: 'Uniqlo', material: 'Len cashmere', sizes: ['M','L','XL','XXL'], colors: ['Đen','Xanh navy','Nâu','Xám'], stock: 50, isFeatured: false, images: [{ public_id: 'p33a', url: unsplash('photo-1578587018452-892bacefd3f2') }], description: 'Áo len cổ lọ nam ấm áp, chất len mịn. Phong cách thanh lịch cho mùa lạnh.' },
  { catIdx: 6, name: 'Áo Sweater Hoodie Unisex', price: 520000, discountPrice: 0, gender: 'unisex', brand: 'H&M', material: 'Nỉ', sizes: ['S','M','L','XL','XXL'], colors: ['Đen','Xám','Beige','Xanh rêu'], stock: 90, isFeatured: false, images: [{ public_id: 'p34a', url: unsplash('photo-1556821840-3a63f95609a7') }], description: 'Áo sweater hoodie nỉ dày, bên trong lót lông. Phong cách casual thoải mái.' },
  { catIdx: 6, name: 'Cardigan Len Ngắn Crop', price: 480000, discountPrice: 380000, gender: 'women', brand: 'ZARA', material: 'Len cashmere', sizes: ['XS','S','M','L'], colors: ['Trắng','Hồng pastel','Beige'], stock: 45, isFeatured: false, images: [{ public_id: 'p35a', url: unsplash('photo-1583743814966-8936f5b7be1a') }], description: 'Cardigan len ngắn crop dáng xinh, cài nút trước. Phù hợp layer cùng áo thun bên trong.' },

  // ── Đồ thể thao (catIdx=7, 5 SP) ──
  { catIdx: 7, name: 'Bộ Thể Thao Nam Running', price: 650000, discountPrice: 550000, gender: 'men', brand: 'Canifa', material: 'Vải thun lạnh', sizes: ['M','L','XL','XXL'], colors: ['Đen','Xám','Xanh navy'], stock: 60, isFeatured: false, images: [{ public_id: 'p36a', url: unsplash('photo-1571019613454-1cb2f99b2d8b') }], description: 'Bộ thể thao nam gồm áo và quần, chất vải thun lạnh co giãn, thấm hút mồ hôi tốt.' },
  { catIdx: 7, name: 'Áo Tank Top Gym Nữ', price: 280000, discountPrice: 0, gender: 'women', brand: 'H&M', material: 'Vải thun lạnh', sizes: ['XS','S','M','L'], colors: ['Đen','Trắng','Hồng pastel'], stock: 80, isFeatured: false, images: [{ public_id: 'p37a', url: unsplash('photo-1518310383802-640c2de311b2') }], description: 'Áo tank top gym nữ thoáng mát, thoát ẩm nhanh. Thiết kế racerback năng động.' },
  { catIdx: 7, name: 'Quần Legging Yoga Nữ', price: 450000, discountPrice: 380000, gender: 'women', brand: 'Canifa', material: 'Vải thun lạnh', sizes: ['XS','S','M','L','XL'], colors: ['Đen','Xám','Xanh navy'], stock: 70, isFeatured: true, images: [{ public_id: 'p38a', url: unsplash('photo-1506629082955-511b1aa562c8') }], description: 'Quần legging yoga cạp cao nâng mông, co giãn 4 chiều. Chất vải mịn, không xuyên thấu.' },
  { catIdx: 7, name: 'Áo Thun Thể Thao Dry Fit', price: 320000, discountPrice: 0, gender: 'men', brand: 'Routine', material: 'Vải thun lạnh', sizes: ['M','L','XL','XXL'], colors: ['Đen','Trắng','Xanh dương'], stock: 100, isFeatured: false, images: [{ public_id: 'p39a', url: unsplash('photo-1556906781-9a412961c28c') }], description: 'Áo thun thể thao dry fit, khô nhanh chóng, nhẹ thoáng. Phù hợp chạy bộ và tập gym.' },
  { catIdx: 7, name: 'Quần Short Thể Thao Unisex', price: 290000, discountPrice: 250000, gender: 'unisex', brand: 'Canifa', material: 'Vải gió', sizes: ['S','M','L','XL'], colors: ['Đen','Xám','Xanh navy'], stock: 95, isFeatured: false, images: [{ public_id: 'p40a', url: unsplash('photo-1562886889-40ea6f498c01') }], description: 'Quần short thể thao gió nhẹ, có lớp lót mesh bên trong. Có túi khóa kéo tiện lợi.' },

  // ── Phụ kiện thời trang (catIdx=8, 5 SP) ──
  { catIdx: 8, name: 'Thắt Lưng Da Bò Cao Cấp', price: 650000, discountPrice: 0, gender: 'men', brand: 'Massimo Dutti', material: 'Da PU', sizes: ['95cm','100cm','105cm','110cm'], colors: ['Đen','Nâu'], stock: 50, isFeatured: false, images: [{ public_id: 'p41a', url: unsplash('photo-1606760227091-3dd870d97f1d') }], description: 'Thắt lưng da bò cao cấp, khóa kim loại sáng bóng. Phong cách lịch lãm cho quý ông.' },
  { catIdx: 8, name: 'Khăn Quàng Cổ Len Cashmere', price: 480000, discountPrice: 380000, gender: 'unisex', brand: 'COS', material: 'Len cashmere', sizes: ['Free size'], colors: ['Beige','Xám','Đen','Đỏ đô'], stock: 40, isFeatured: false, images: [{ public_id: 'p42a', url: unsplash('photo-1520903920243-00d872a2d1c9') }], description: 'Khăn quàng cổ len cashmere mềm mịn, giữ ấm tuyệt vời. Phụ kiện không thể thiếu mùa đông.' },
  { catIdx: 8, name: 'Mũ Bucket Hat', price: 280000, discountPrice: 0, gender: 'unisex', brand: 'H&M', material: 'Cotton 100%', sizes: ['Free size'], colors: ['Đen','Beige','Xanh navy'], stock: 70, isFeatured: false, images: [{ public_id: 'p43a', url: unsplash('photo-1588850561407-ed78c334e67a') }], description: 'Mũ bucket hat vải cotton dày, phong cách streetwear. Che nắng tốt, dễ gấp gọn.' },
  { catIdx: 8, name: 'Kính Mát Aviator Classic', price: 850000, discountPrice: 690000, gender: 'unisex', brand: 'Massimo Dutti', material: 'Kim loại', sizes: ['Free size'], colors: ['Đen','Nâu'], stock: 30, isFeatured: true, images: [{ public_id: 'p44a', url: unsplash('photo-1511499767150-a48a237f0083') }], description: 'Kính mát aviator gọng kim loại, tròng polarized chống UV 400. Phong cách phi công kinh điển.' },
  { catIdx: 8, name: 'Tất Cổ Cao Gân Cotton', price: 120000, discountPrice: 0, gender: 'unisex', brand: 'Uniqlo', material: 'Cotton 100%', sizes: ['Free size'], colors: ['Đen','Trắng','Xám','Beige'], stock: 150, isFeatured: false, images: [{ public_id: 'p45a', url: unsplash('photo-1586350977771-b3b0abd50c82') }], description: 'Set 3 đôi tất cổ cao cotton gân, co giãn tốt. Phong cách basic dễ phối mọi outfit.' },

  // ── Giày dép (catIdx=9, 5 SP) ──
  { catIdx: 9, name: 'Giày Sneaker Trắng Classic', price: 1200000, discountPrice: 990000, gender: 'unisex', brand: 'H&M', material: 'Da PU', sizes: ['38','39','40','41','42','43','44'], colors: ['Trắng','Đen'], stock: 55, isFeatured: true, images: [{ public_id: 'p46a', url: unsplash('photo-1549298916-b41d501d3772') }, { public_id: 'p46b', url: unsplash('photo-1595950653106-6c9ebd614d3a') }], description: 'Giày sneaker trắng phom cổ thấp, đế cao su. Kiểu dáng minimalist phù hợp mọi phong cách.' },
  { catIdx: 9, name: 'Giày Tây Oxford Nam', price: 1500000, discountPrice: 0, gender: 'men', brand: 'Massimo Dutti', material: 'Da PU', sizes: ['39','40','41','42','43','44'], colors: ['Đen','Nâu'], stock: 35, isFeatured: false, images: [{ public_id: 'p47a', url: unsplash('photo-1614252369475-531eba835eb1') }], description: 'Giày tây Oxford da bóng, lót da êm ái. Phong cách quý ông cho đi làm và sự kiện.' },
  { catIdx: 9, name: 'Sandal Nữ Quai Mảnh', price: 480000, discountPrice: 0, gender: 'women', brand: 'ZARA', material: 'Da PU', sizes: ['35','36','37','38','39','40'], colors: ['Đen','Beige','Nâu'], stock: 50, isFeatured: false, images: [{ public_id: 'p48a', url: unsplash('photo-1543163521-1bf539c55dd2') }], description: 'Sandal nữ quai mảnh thanh lịch, gót vuông 5cm. Phù hợp đi làm lẫn đi chơi.' },
  { catIdx: 9, name: 'Giày Loafer Da Nam', price: 980000, discountPrice: 850000, gender: 'men', brand: 'COS', material: 'Da PU', sizes: ['39','40','41','42','43'], colors: ['Đen','Nâu'], stock: 40, isFeatured: false, images: [{ public_id: 'p49a', url: unsplash('photo-1533867617858-e7b97e060509') }], description: 'Giày loafer da phom đẹp, không dây. Phong cách smart casual lịch lãm và tiện lợi.' },
  { catIdx: 9, name: 'Giày Cao Gót Nữ Mũi Nhọn', price: 890000, discountPrice: 750000, gender: 'women', brand: 'Ivy Moda', material: 'Da PU', sizes: ['35','36','37','38','39'], colors: ['Đen','Đỏ đô','Beige'], stock: 35, isFeatured: true, images: [{ public_id: 'p50a', url: unsplash('photo-1543163521-1bf539c55dd2') }], description: 'Giày cao gót mũi nhọn 7cm, da bóng sang trọng. Tôn dáng tuyệt đối cho các buổi tiệc.' },

  // ── Túi xách (catIdx=10, 5 SP) ──
  { catIdx: 10, name: 'Túi Xách Tay Da Nữ', price: 1500000, discountPrice: 1250000, gender: 'women', brand: 'Mango', material: 'Da PU', sizes: ['Free size'], colors: ['Đen','Nâu','Beige'], stock: 30, isFeatured: true, images: [{ public_id: 'p51a', url: unsplash('photo-1584917865442-de89df76afd3') }], description: 'Túi xách tay da phom cứng cáp, có quai đeo chéo đi kèm. Ngăn chứa rộng rãi, tiện lợi.' },
  { catIdx: 10, name: 'Balo Thời Trang Nam', price: 750000, discountPrice: 0, gender: 'men', brand: 'Pull&Bear', material: 'Canvas', sizes: ['Free size'], colors: ['Đen','Xanh navy','Xám'], stock: 45, isFeatured: false, images: [{ public_id: 'p52a', url: unsplash('photo-1553062407-98eeb64c6a62') }], description: 'Balo thời trang chất canvas dày, ngăn laptop 15 inch. Phù hợp đi học và đi làm.' },
  { catIdx: 10, name: 'Túi Đeo Chéo Mini Nữ', price: 480000, discountPrice: 380000, gender: 'women', brand: 'ZARA', material: 'Da PU', sizes: ['Free size'], colors: ['Đen','Trắng','Hồng pastel','Beige'], stock: 55, isFeatured: false, images: [{ public_id: 'p53a', url: unsplash('photo-1566150905458-1bf1fc113f0d') }], description: 'Túi đeo chéo mini gọn nhẹ, khóa kim loại vàng. Phụ kiện hoàn hảo cho dạo phố.' },
  { catIdx: 10, name: 'Túi Tote Canvas Unisex', price: 350000, discountPrice: 0, gender: 'unisex', brand: 'H&M', material: 'Canvas', sizes: ['Free size'], colors: ['Beige','Đen','Trắng'], stock: 80, isFeatured: false, images: [{ public_id: 'p54a', url: unsplash('photo-1544816155-12df9643f363') }], description: 'Túi tote canvas rộng rãi, nhẹ nhàng. Phù hợp đi học, đi biển và mua sắm hàng ngày.' },
  { catIdx: 10, name: 'Clutch Dự Tiệc Nữ', price: 680000, discountPrice: 550000, gender: 'women', brand: 'Mango', material: 'Da PU', sizes: ['Free size'], colors: ['Đen','Đỏ đô','Beige'], stock: 25, isFeatured: false, images: [{ public_id: 'p55a', url: unsplash('photo-1594223274512-ad4803739b7c') }], description: 'Clutch dự tiệc da bóng, khóa cài kim loại. Kích thước vừa đủ cho điện thoại và son.' },

  // ── Đồ ngủ & Nội y (catIdx=11, 5 SP) ──
  { catIdx: 11, name: 'Bộ Đồ Ngủ Lụa Nữ', price: 650000, discountPrice: 550000, gender: 'women', brand: 'COS', material: 'Silk', sizes: ['S','M','L','XL'], colors: ['Hồng pastel','Đen','Trắng','Beige'], stock: 40, isFeatured: false, images: [{ public_id: 'p56a', url: unsplash('photo-1616048056617-93b94a339009') }], description: 'Bộ đồ ngủ lụa gồm áo cộc tay và quần dài, chất lụa mềm mát. Sang trọng và thoải mái.' },
  { catIdx: 11, name: 'Áo Choàng Tắm Cotton', price: 480000, discountPrice: 0, gender: 'unisex', brand: 'Uniqlo', material: 'Cotton 100%', sizes: ['M','L','XL'], colors: ['Trắng','Xám','Beige'], stock: 35, isFeatured: false, images: [{ public_id: 'p57a', url: unsplash('photo-1631730486572-226d1f595b68') }], description: 'Áo choàng tắm cotton dày, thấm nước tốt. Có dây thắt eo và 2 túi tiện lợi.' },
  { catIdx: 11, name: 'Bộ Pyjama Nam Kẻ Sọc', price: 420000, discountPrice: 350000, gender: 'men', brand: 'H&M', material: 'Cotton 100%', sizes: ['M','L','XL','XXL'], colors: ['Xanh navy','Xám'], stock: 50, isFeatured: false, images: [{ public_id: 'p58a', url: unsplash('photo-1617137968427-85924c800a22') }], description: 'Bộ pyjama nam cotton kẻ sọc cổ điển, áo dài tay quần dài. Thoải mái cho giấc ngủ ngon.' },
  { catIdx: 11, name: 'Set Nội Y Ren Nữ', price: 380000, discountPrice: 0, gender: 'women', brand: 'Ivy Moda', material: 'Vải rib', sizes: ['S','M','L'], colors: ['Đen','Trắng','Hồng pastel'], stock: 45, isFeatured: false, images: [{ public_id: 'p59a', url: unsplash('photo-1616048056617-93b94a339009') }], description: 'Set nội y ren mềm mại, thiết kế tinh tế nữ tính. Có đệm mỏng thoải mái.' },
  { catIdx: 11, name: 'Đồ Ngủ Áo Sơ Mi Dài Nữ', price: 520000, discountPrice: 420000, gender: 'women', brand: 'Mango', material: 'Silk', sizes: ['XS','S','M','L'], colors: ['Trắng','Hồng pastel','Beige'], stock: 30, isFeatured: false, images: [{ public_id: 'p60a', url: unsplash('photo-1618354691373-d851c5c3a990') }], description: 'Áo ngủ dáng sơ mi dài, chất lụa trơn sang trọng. Cài nút phía trước, độ dài qua gối.' },
]

/* ─── BANNERS (5) ─── */
const bannersData = [
  { title: 'Bộ Sưu Tập Xuân Hè 2026', subtitle: 'Thời trang mới nhất', image: { public_id: 'banner1', url: unsplash('photo-1490481651871-ab68de25d43d', 1400) }, link: '/san-pham?sort=-createdAt', type: 'home', order: 1 },
  { title: 'Flash Sale Cuối Tuần', subtitle: 'Giảm đến 50%', image: { public_id: 'banner2', url: unsplash('photo-1483985988355-763728e1935b', 1400) }, link: '/san-pham?sort=-sold', type: 'home', order: 2 },
  { title: 'Phong Cách Minimalist', subtitle: 'Less is more', image: { public_id: 'banner3', url: unsplash('photo-1479064555552-3ef4979f8908', 1400) }, link: '/san-pham', type: 'home', order: 3 },
  { title: 'Blazer & Áo Khoác', subtitle: 'Bộ sưu tập Thu Đông', image: { public_id: 'banner4', url: unsplash('photo-1591047139829-d91aecb6caea', 1400) }, link: '/san-pham?category=ao-khoac', type: 'home', order: 4 },
  { title: 'Đồ Thể Thao Active', subtitle: 'Năng động mỗi ngày', image: { public_id: 'banner5', url: unsplash('photo-1571019613454-1cb2f99b2d8b', 1400) }, link: '/san-pham?category=do-the-thao', type: 'promotion', order: 5 },
]

/* ─── COUPONS (8) ─── */
const couponsData = [
  { code: 'WELCOME10', discountType: 'percent', value: 10, minOrderValue: 200000, maxDiscount: 100000, expiresAt: new Date('2026-12-31'), usageLimit: 100, isActive: true },
  { code: 'FASHION50K', discountType: 'fixed', value: 50000, minOrderValue: 500000, maxDiscount: 0, expiresAt: new Date('2026-12-31'), usageLimit: 200, isActive: true },
  { code: 'SALE20', discountType: 'percent', value: 20, minOrderValue: 300000, maxDiscount: 200000, expiresAt: new Date('2026-09-30'), usageLimit: 50, isActive: true },
  { code: 'SUMMER15', discountType: 'percent', value: 15, minOrderValue: 400000, maxDiscount: 150000, expiresAt: new Date('2026-08-31'), usageLimit: 80, isActive: true },
  { code: 'FREESHIP', discountType: 'fixed', value: 30000, minOrderValue: 0, maxDiscount: 0, expiresAt: new Date('2026-12-31'), usageLimit: 500, isActive: true },
  { code: 'VIP100K', discountType: 'fixed', value: 100000, minOrderValue: 1000000, maxDiscount: 0, expiresAt: new Date('2026-06-30'), usageLimit: 30, isActive: true },
  { code: 'NEWYEAR25', discountType: 'percent', value: 25, minOrderValue: 500000, maxDiscount: 300000, expiresAt: new Date('2027-01-31'), usageLimit: 100, isActive: true },
  { code: 'BLACKFRI30', discountType: 'percent', value: 30, minOrderValue: 800000, maxDiscount: 500000, expiresAt: new Date('2026-11-30'), usageLimit: 40, isActive: true },
]

/* ─── REVIEW COMMENTS ─── */
const reviewComments = [
  'Chất lượng rất tốt, vải mềm mịn. Sẽ mua thêm màu khác.',
  'Đúng size, form đẹp. Giao hàng nhanh, đóng gói cẩn thận.',
  'Giá hơi cao nhưng chất lượng xứng đáng. Rất hài lòng!',
  'Màu sắc đẹp như hình, chất vải thoáng mát. 10 điểm!',
  'Form hơi rộng so với bảng size, nên lấy nhỏ hơn 1 size.',
  'Sản phẩm ổn, nhưng đường may có vài chỗ chưa gọn lắm.',
  'Mặc lên rất sang, được nhiều người khen. Sẽ ủng hộ tiếp.',
  'Vải dày dặn, giặt máy không bị xù. Chất lượng cao.',
  'Mua cho người yêu, bạn ấy rất thích. Sẽ quay lại.',
  'Đẹp hơn mong đợi. Phối đồ rất dễ, mặc đi làm hay đi chơi đều ok.',
  'Thiết kế đẹp, hiện đại. Phù hợp phong cách của mình.',
  'Giao hàng nhanh, sản phẩm đúng mô tả. Shop uy tín.',
  'Chất vải co giãn tốt, mặc rất thoải mái. Sẽ mua thêm.',
  'Sản phẩm đẹp nhưng giao chậm hơn dự kiến. Chất lượng vẫn ok.',
  'Đã mua lần 2, vẫn rất ưng ý. Giá cả hợp lý.',
  'Kiểu dáng thanh lịch, phù hợp đi công sở. Rất thích!',
  'Vải hơi mỏng so với giá tiền. Nhưng form đẹp nên vẫn cho 4 sao.',
  'Tuyệt vời! Đúng như kỳ vọng. Sẽ giới thiệu cho bạn bè.',
  'Màu thực tế đẹp hơn hình. Chất lượng cao, đáng mua.',
  'Rất vừa vặn, thoải mái. Chất vải mát, thích hợp mùa hè.',
  'Sản phẩm ok, nhưng mình thấy có thể cải thiện phần cổ áo.',
  'Mua sale nên giá rất tốt. Chất lượng vượt mong đợi.',
  'Kiểu dáng basic nhưng rất dễ phối. Mua 3 màu luôn!',
  'Shop tư vấn nhiệt tình, sản phẩm đẹp. 5 sao!',
  'Đã thử nhiều shop, chỗ này chất lượng tốt nhất trong tầm giá.',
]

/* ─── UTILITY ─── */
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = (arr) => arr[rand(0, arr.length - 1)]
const pickN = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n)

/* ─── MAIN SEED ─── */
async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✓ Kết nối MongoDB thành công')

    // xóa dữ liệu cũ
    await Promise.all([
      User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({}),
      Banner.deleteMany({}), Coupon.deleteMany({}), Review.deleteMany({}),
      Order.deleteMany({}), OrderLog.deleteMany({}), Wishlist.deleteMany({}),
      Setting.deleteMany({}),
    ])
    console.log('✓ Đã xóa dữ liệu cũ')

    // Setting
    await Setting.create({
      storeName: 'LUXE Fashion',
      tagline: 'Thời trang cao cấp',
      contactEmail: 'hello@luxefashion.vn',
      contactPhone: '1900 6868',
      address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
      shipping: { fee: 30000, freeShippingThreshold: 500000 },
      paymentMethods: { cod: true, momo: true, vnpay: true },
    })
    console.log('✓ Setting')

    // Users
    const users = await User.create(usersData)
    const adminUser = users[0]
    const normalUsers = users.slice(1)
    console.log(`✓ ${users.length} Users`)

    // Categories
    const categories = await Category.create(categoriesData)
    console.log(`✓ ${categories.length} Categories`)

    // Products
    const productsToCreate = productsRaw.map((p) => ({
      ...p,
      category: categories[p.catIdx]._id,
    }))
    for (const p of productsToCreate) delete p.catIdx
    const products = await Product.create(productsToCreate)
    console.log(`✓ ${products.length} Products`)

    // Banners
    const banners = await Banner.create(bannersData)
    console.log(`✓ ${banners.length} Banners`)

    // Coupons
    const coupons = await Coupon.create(couponsData)
    console.log(`✓ ${coupons.length} Coupons`)

    // Reviews (120)
    const reviewsToCreate = []
    const reviewSet = new Set()
    let attempts = 0
    while (reviewsToCreate.length < 120 && attempts < 500) {
      attempts++
      const user = pick(normalUsers)
      const product = pick(products)
      const key = `${user._id}_${product._id}`
      if (reviewSet.has(key)) continue
      reviewSet.add(key)
      reviewsToCreate.push({
        user: user._id,
        product: product._id,
        rating: rand(3, 5),
        comment: pick(reviewComments),
      })
    }
    const reviews = await Review.create(reviewsToCreate)
    console.log(`✓ ${reviews.length} Reviews`)

    // cập nhật rating & numReviews cho product
    const productReviewMap = {}
    for (const rev of reviews) {
      const pid = rev.product.toString()
      if (!productReviewMap[pid]) productReviewMap[pid] = { total: 0, count: 0 }
      productReviewMap[pid].total += rev.rating
      productReviewMap[pid].count += 1
    }
    for (const [pid, data] of Object.entries(productReviewMap)) {
      await Product.findByIdAndUpdate(pid, {
        rating: Math.round((data.total / data.count) * 10) / 10,
        numReviews: data.count,
      })
    }
    console.log('✓ Cập nhật rating products')

    // Orders (30)
    const statuses = ['pending', 'processing', 'shipping', 'delivered', 'delivered', 'delivered', 'cancelled']
    const ordersToCreate = []

    for (let i = 0; i < 30; i++) {
      const user = pick(normalUsers)
      const addr = user.addresses[0]
      const numItems = rand(1, 4)
      const orderProducts = pickN(products, numItems)

      const orderItems = orderProducts.map((p) => ({
        product: p._id,
        name: p.name,
        image: p.images[0]?.url || '',
        price: p.discountPrice > 0 ? p.discountPrice : p.price,
        quantity: rand(1, 2),
        size: p.sizes.length > 0 ? pick(p.sizes) : '',
        color: p.colors.length > 0 ? pick(p.colors) : '',
      }))

      const itemsPrice = orderItems.reduce((s, it) => s + it.price * it.quantity, 0)
      const shippingPrice = itemsPrice >= 500000 ? 0 : 30000
      const totalPrice = itemsPrice + shippingPrice
      const orderStatus = pick(statuses)
      const paymentMethod = pick(['COD', 'COD', 'MOMO', 'VNPAY'])
      const paymentStatus = orderStatus === 'delivered' ? 'paid' : (orderStatus === 'cancelled' ? 'failed' : 'pending')

      const createdAt = new Date(Date.now() - rand(1, 90) * 24 * 60 * 60 * 1000)

      ordersToCreate.push({
        user: user._id,
        orderItems,
        shippingAddress: { fullName: addr.fullName, phone: addr.phone, addressLine: addr.addressLine, city: addr.city, district: addr.district, ward: addr.ward },
        paymentMethod,
        paymentStatus,
        orderStatus,
        itemsPrice,
        shippingPrice,
        totalPrice,
        paidAt: paymentStatus === 'paid' ? createdAt : undefined,
        deliveredAt: orderStatus === 'delivered' ? new Date(createdAt.getTime() + rand(2, 7) * 24 * 60 * 60 * 1000) : undefined,
        createdAt,
        updatedAt: createdAt,
      })
    }

    const orders = await Order.insertMany(ordersToCreate)
    console.log(`✓ ${orders.length} Orders`)

    // OrderLogs
    const logsToCreate = orders.map((o) => ({
      order: o._id,
      status: o.orderStatus,
      changedBy: adminUser._id,
      note: o.orderStatus === 'cancelled' ? 'Đơn hàng đã bị hủy' : 'Đơn hàng được tạo',
      changedAt: o.createdAt,
    }))
    await OrderLog.insertMany(logsToCreate)
    console.log(`✓ ${logsToCreate.length} OrderLogs`)

    // Wishlists (15)
    const wishlistUsers = pickN(normalUsers, 15)
    const wishlistsToCreate = wishlistUsers.map((u) => ({
      user: u._id,
      products: pickN(products, rand(2, 6)).map((p) => p._id),
    }))
    const wishlists = await Wishlist.create(wishlistsToCreate)
    console.log(`✓ ${wishlists.length} Wishlists`)

    console.log('\n══════════════════════════════════════')
    console.log('  SEED HOÀN TẤT - Tổng kết:')
    console.log('══════════════════════════════════════')
    console.log(`  Setting:    1`)
    console.log(`  Users:      ${users.length} (admin: admin@fashion.vn / Admin@123)`)
    console.log(`  Categories: ${categories.length}`)
    console.log(`  Products:   ${products.length}`)
    console.log(`  Banners:    ${banners.length}`)
    console.log(`  Coupons:    ${coupons.length}`)
    console.log(`  Reviews:    ${reviews.length}`)
    console.log(`  Orders:     ${orders.length}`)
    console.log(`  OrderLogs:  ${logsToCreate.length}`)
    console.log(`  Wishlists:  ${wishlists.length}`)
    console.log('══════════════════════════════════════')
    console.log('  User test:  user bất kỳ / User@123')
    console.log('══════════════════════════════════════\n')

    process.exit(0)
  } catch (error) {
    console.error('Lỗi seed:', error)
    process.exit(1)
  }
}

seed()
