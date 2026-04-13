import { useState, useEffect } from 'react';
import { Card, Table, DatePicker, Space, Statistic, App } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { purchaseApi, PurchaseOrder } from '@/api/purchase';
import { useAuthStore } from '@/stores/auth';

const { RangePicker } = DatePicker;

export default function PurchaseReport() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const { message } = App.useApp();
  const tenantId = useAuthStore((s) => s.tenant?.id);

  const loadData = (start?: string, end?: string) => {
    if (!tenantId) return;
    setLoading(true);
    purchaseApi.listOrders({ page: 1, pageSize: 100, startDate: start, endDate: end, status: 'completed' })
      .then((res) => {
        setOrders(res.list);
      })
      .catch(() => message.error('加载采购数据失败'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const start = dayjs().startOf('month').format('YYYY-MM-DD');
    const end = dayjs().endOf('month').format('YYYY-MM-DD');
    setDateRange([dayjs(start), dayjs(end)]);
    loadData(start, end);
  }, [tenantId]);

  const totalAmount = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const columns = [
    { title: '单据编号', dataIndex: 'orderNo', key: 'orderNo', width: 160 },
    {
      title: '供应商', dataIndex: ['supplier', 'name'], key: 'supplier',
      render: (_: any, r: PurchaseOrder) => r.supplier?.name || '-',
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
      <Card title="采购报表" loading={loading}>
        <Space style={{ marginBottom: 16 }} wrap>
          <RangePicker
            value={dateRange || undefined}
            onChange={(dates) => {
              if (dates) setDateRange(dates as [Dayjs, Dayjs]);
            }}
          />
          <Statistic title="采购单数" value={orders.length} valueStyle={{ fontSize: 18 }} />
          <Statistic
            title="采购总额"
            value={totalAmount}
            precision={2}
            prefix="¥"
            valueStyle={{ fontSize: 18, color: '#1677ff' }}
          />
        </Space>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          scroll={{ x: 700 }}
          size="small"
        />
      </Card>
    </div>
  );
}
