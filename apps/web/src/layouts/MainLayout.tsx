import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Badge } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  InboxOutlined,
  MoneyCollectOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  SwapOutlined,
  UnorderedListOutlined,
  BellOutlined,
  BankOutlined,
  TeamOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

interface Props {
  children?: React.ReactNode;
}

const MainLayout = ({ children }: Props) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = '/' + location.pathname.split('/').filter(Boolean).join('/');

  const menuItems: MenuProps['items'] = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '经营看板' },

    {
      key: 'purchase',
      icon: <ShoppingCartOutlined />,
      label: '采购管理',
      children: [
        { key: '/purchase/orders', label: '采购订单' },
        { key: '/purchase/stock-ins', label: '采购入库' },
        { key: '/purchase/returns', label: '采购退货' },
      ],
    },

    {
      key: 'sale',
      icon: <ShopOutlined />,
      label: '销售管理',
      children: [
        { key: '/sale/orders', label: '销售订单' },
        { key: '/sale/stock-outs', label: '销售出库' },
        { key: '/sale/returns', label: '销售退货' },
      ],
    },

    {
      key: 'inventory',
      icon: <InboxOutlined />,
      label: '库存管理',
      children: [
        { key: '/inventory/list', label: '库存查询' },
        { key: '/inventory/check', label: '库存盘点' },
        { key: '/inventory/transfer', label: '库存调拨' },
        { key: '/inventory/warning', label: '库存预警' },
      ],
    },

    {
      key: 'finance',
      icon: <MoneyCollectOutlined />,
      label: '财务管理',
      children: [
        { key: '/finance/vouchers', label: '凭证管理' },
        { key: '/finance/payments', label: '收付款' },
        { key: '/finance/receivable', label: '应收应付' },
      ],
    },

    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: '报表中心',
      children: [
        { key: '/reports/sale', label: '销售报表' },
        { key: '/reports/purchase', label: '采购报表' },
        { key: '/reports/inventory', label: '库存报表' },
      ],
    },

    {
      key: 'store-group',
      icon: <ShopOutlined />,
      label: '门店管理',
      children: [
        { key: '/store/list', icon: <UnorderedListOutlined />, label: '门店列表' },
        { key: '/store/transfer', icon: <SwapOutlined />, label: '店间调拨' },
      ],
    },

    {
      key: 'settings-group',
      icon: <SettingOutlined />,
      label: '系统设置',
      children: [
        {
          key: '/settings/basic',
          icon: <AppstoreOutlined />,
          label: '基础资料',
          children: [
            { key: '/settings/basic/warehouse', label: '仓库管理' },
            { key: '/settings/basic/category', label: '商品分类' },
            { key: '/settings/basic/product', label: '商品管理' },
            { key: '/settings/basic/customer', label: '客户管理' },
            { key: '/settings/basic/supplier', label: '供应商管理' },
            { key: '/settings/basic/account', label: '账户管理' },
          ],
        },
        { key: '/settings/users', icon: <TeamOutlined />, label: '用户管理' },
        { key: '/settings/roles', icon: <BankOutlined />, label: '角色权限' },
      ],
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key.startsWith('/')) {
      navigate(key);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        style={{ borderRight: '1px solid #f0f0f0' }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {collapsed ? (
            <span style={{ fontSize: 18, fontWeight: 600 }}>ERP</span>
          ) : (
            <span style={{ fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap' }}>
              云ERP - 零售批发版
            </span>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 24,
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Badge count={3}>
            <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
          </Badge>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar style={{ backgroundColor: '#1677ff' }}>
                <UserOutlined />
              </Avatar>
              <span>管理员</span>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ margin: 0, padding: 0, background: '#f0f2f5' }}>
          <div style={{ padding: 24 }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
