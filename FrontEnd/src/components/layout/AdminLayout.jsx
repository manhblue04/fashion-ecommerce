import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button, Dropdown, Avatar, theme } from 'antd'
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  OrderedListOutlined,
  UserOutlined,
  StarOutlined,
  PictureOutlined,
  TagOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import useAuthStore from '../../store/authStore'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/admin', icon: <DashboardOutlined />, label: <Link to="/admin">Tổng quan</Link> },
  { key: '/admin/san-pham', icon: <ShoppingOutlined />, label: <Link to="/admin/san-pham">Sản phẩm</Link> },
  { key: '/admin/danh-muc', icon: <AppstoreOutlined />, label: <Link to="/admin/danh-muc">Danh mục</Link> },
  { key: '/admin/don-hang', icon: <OrderedListOutlined />, label: <Link to="/admin/don-hang">Đơn hàng</Link> },
  { key: '/admin/nguoi-dung', icon: <UserOutlined />, label: <Link to="/admin/nguoi-dung">Người dùng</Link> },
  { key: '/admin/danh-gia', icon: <StarOutlined />, label: <Link to="/admin/danh-gia">Đánh giá</Link> },
  { key: '/admin/banner', icon: <PictureOutlined />, label: <Link to="/admin/banner">Banner</Link> },
  { key: '/admin/ma-giam-gia', icon: <TagOutlined />, label: <Link to="/admin/ma-giam-gia">Mã giảm giá</Link> },
  { key: '/admin/cai-dat', icon: <SettingOutlined />, label: <Link to="/admin/cai-dat">Cài đặt</Link> },
]

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken()

  const dropdownItems = [
    { key: 'home', icon: <HomeOutlined />, label: 'Về trang chủ', onClick: () => navigate('/') },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: () => { logout(); navigate('/dang-nhap') } },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} breakpoint="lg" onBreakpoint={(broken) => setCollapsed(broken)}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Link to="/admin" style={{ color: '#fff', fontSize: collapsed ? 16 : 18, fontWeight: 700, letterSpacing: 2 }}>
            {collapsed ? 'FS' : 'FASHION'}
          </Link>
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} />
          <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar src={user?.avatar?.url} icon={<UserOutlined />} />
              <span style={{ fontWeight: 500 }}>{user?.name || 'Admin'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: colorBgContainer, borderRadius: borderRadiusLG, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
