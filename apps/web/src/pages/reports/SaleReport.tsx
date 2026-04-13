import { useState, useEffect } from 'react';
import { Card, Row, Col, Table, DatePicker, Space, Statistic, Spin, App } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { reportApi, SalesSummary } from '@/api/report';
import { saleApi, SaleOrder } from '@/api/sale';
import { useAuthStore } from '@/stores/auth';

const { RangePicker } = DatePicker;

export default function SaleReport() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [orders, setOrders] = useState<SaleOrder[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const { message } = App.useApp();
  const tenantId = useAuthStore((s) => s.tenant?.id);

  const loadData = (start?: string, end?: string) => {
    if (!tenantId) return;
    setLoading(true);
    Promise.all([
      reportApi.getSalesSummary({ startDate: start!, endDate: end! }),
      saleApi.listOrders({ page: 1, pageSize: 100, startDate: start, endDate: end, status: 'completed' }),
    ])
      .then(([sum, orderRes]) => {
        setSummary(sum);
        setOrders(orderRes.list);
      })
      .catch(() => message.error('加载销售数据失败'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const start = dayjs().startOf('month').format('YYYY-MM-DD');
    const end = dayjs().endOf('month').format('YYYY-MM-DD');
    setDateRange([dayjs(start), dayjs(end)]);
    loadData(start, end);
  }, [tenantId]);

  const onSearch = () => {
    if (!dateRange) return;
    const start = dateRange[0].format('YYYY-MM-DD');
    const end = dateRange[1].format('YYYY-MM-DD');
    loadData(start, end);
  };

  const columns = [
    { title: '单据编号', dataIndex: 'orderNo', key: 'orderNo', width: 160 },
    {
      title: '客户', dataIndex: ['customer', 'name'], key: 'customer',
      render: (v: string, r: SaleOrder) => r.customer?.name || '-',
    },
    { title: '单据日期', dataIndex: 'orderDate', key: 'orderDate', width: 120,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD') },
    { title: '总金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 120,
      render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (v: string) => ({ pending: '待审核', approved: '已审核', completed: '已完成', cancelled: '已取消' }[v] || v) },
  ];

  return (
    <div>
      <Card title="销售报表" loading={loading}>
        <Space style={{ marginBottom: 16 }} wrap>
          <RangePicker
            value={dateRange || undefined}
            onChange={(dates) => {
              if (dates) setDateRange(dates as [Dayjs, Dayjs]);
            }}
          />
          <Statistic
            title="销售单数"
            value={summary?.totalOrders || 0}
            valueStyle={{ fontSize: 18 }}
          />
          <Statistic
            title="销售总额"
            value={summary?.totalAmount || 0}
            precision={2}
            prefix="¥"
            valueStyle={{ fontSize: 18, color: '#3f8600' }}
          />
          <Statistic
            title="销售总量"
            value={summary?.totalQuantity || 0}
            suffix="件"
            valueStyle={{ fontSize: 18 }}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          scroll={{ x: 800 }}
          size="small"
        />
      </Card>
    </div>
  );
}
