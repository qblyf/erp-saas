import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Spin, Progress } from 'antd';
import {
  BarChartOutlined,
  ShoppingCartOutlined,
  UnorderedListOutlined,
  WarningOutlined,
  TeamOutlined,
  ApartmentOutlined,
  TrophyOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { reportApi, DashboardStats } from '@/api/report';
import { useAuthStore } from '@/stores/auth';

const StatCard = ({
  title,
  value,
  prefix,
  suffix,
  precision = 2,
  color,
  onClick,
}: {
  title: string;
  value: number;
  prefix?: React.ReactNode;
  suffix?: string;
  precision?: number;
  color?: string;
  onClick?: () => void;
}) => (
  <Card
    hoverable={!!onClick}
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
    styles={{ body: { padding: '20px 24px' } }}
  >
    <Statistic
      title={<span style={{ color: '#666', fontSize: 14 }}>{title}</span>}
      value={value}
      precision={precision}
      prefix={prefix}
      suffix={suffix}
      valueStyle={{ color: color || '#333', fontSize: 26, fontWeight: 600 }}
    />
  </Card>
);

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const tenantId = useAuthStore((s) => s.tenant?.id);

  useEffect(() => {
    if (!tenantId) return;
    reportApi.getDashboardStats()
      .then(setStats)
      .catch(() => {/* 错误已在拦截器处理 */})
      .finally(() => setLoading(false));
  }, [tenantId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#666' }}>加载中...</div>
      </div>
    );
  }

  const s = stats!;

  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* 统计卡片第一行 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="今日销售额"
            value={s.todaySales}
            prefix={<DollarOutlined />}
            color="#cf1322"
            onClick={() => navigate('/reports/sale')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="本月销售额"
            value={s.monthSales}
            prefix={<TrophyOutlined />}
            color="#3f8600"
            onClick={() => navigate('/reports/sale')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="今日采购额"
            value={s.todayPurchases}
            prefix={<ShoppingCartOutlined />}
            color="#1677ff"
            onClick={() => navigate('/reports/purchase')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="本月采购额"
            value={s.monthPurchases}
            prefix={<BarChartOutlined />}
            color="#1677ff"
            onClick={() => navigate('/reports/purchase')}
          />
        </Col>
      </Row>

      {/* 统计卡片第二行 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} lg={4}>
          <StatCard
            title="商品种类"
            value={s.productCount}
            prefix={<UnorderedListOutlined />}
          />
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <StatCard
            title="有库存商品"
            value={s.inventoryCount}
            prefix={<ApartmentOutlined />}
            onClick={() => navigate('/inventory/list')}
          />
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <StatCard
            title="待处理销售单"
            value={s.pendingSaleOrders}
            prefix={<ShoppingCartOutlined />}
            color="#faad14"
            onClick={() => navigate('/sale/orders')}
          />
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <StatCard
            title="待处理采购单"
            value={s.pendingPurchaseOrders}
            prefix={<ShoppingCartOutlined />}
            color="#faad14"
            onClick={() => navigate('/purchase/orders')}
          />
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <StatCard
            title="低库存预警"
            value={s.lowStockCount}
            prefix={<WarningOutlined />}
            color={s.lowStockCount > 0 ? '#cf1322' : '#3f8600'}
            onClick={() => navigate('/inventory/warning')}
          />
        </Col>
      </Row>

      {/* 快捷入口 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            title="客户管理"
            extra={<TeamOutlined />}
            hoverable
            onClick={() => navigate('/settings/basic/customer')}
          >
            共 {s.customerCount} 个客户
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            title="供应商管理"
            extra={<TeamOutlined />}
            hoverable
            onClick={() => navigate('/settings/basic/supplier')}
          >
            共 {s.supplierCount} 个供应商
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            title="销售订单"
            extra={<ShoppingCartOutlined />}
            hoverable
            onClick={() => navigate('/sale/orders')}
          >
            {s.pendingSaleOrders > 0
              ? `待处理 ${s.pendingSaleOrders} 单`
              : '暂无待处理订单'}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            title="库存预警"
            extra={<WarningOutlined />}
            hoverable
            onClick={() => navigate('/inventory/warning')}
          >
            {s.lowStockCount > 0
              ? `${s.lowStockCount} 个商品需要补货`
              : '库存状态良好'}
          </Card>
        </Col>
      </Row>

      {/* 经营概览提示 */}
      <Card style={{ marginTop: 16 }}>
        <div style={{ color: '#666', textAlign: 'center' }}>
          <p style={{ margin: 0 }}>
            💡 欢迎使用云ERP系统 | 本月净利润 =
            <span style={{ color: s.monthSales - s.monthPurchases >= 0 ? '#3f8600' : '#cf1322', fontWeight: 600 }}>
              ¥{(s.monthSales - s.monthPurchases).toFixed(2)}
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
}
