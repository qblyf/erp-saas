import { useState, useEffect } from 'react';
import { Card, Table, Select, Space, Statistic, App } from 'antd';
import { inventoryApi } from '@/api/inventory';
import { useAuthStore } from '@/stores/auth';

export default function InventoryReport() {
  const [loading, setLoading] = useState(true);
  const [inventories, setInventories] = useState<any[]>([]);
  const [warehouseId, setWarehouseId] = useState<string>();
  const { message } = App.useApp();
  const tenantId = useAuthStore((s) => s.tenant?.id);

  const loadData = () => {
    if (!tenantId) return;
    setLoading(true);
    inventoryApi.list({ warehouseId, page: 1, pageSize: 500 })
      .then((res) => {
        setInventories(res.list || []);
      })
      .catch(() => message.error('加载库存数据失败'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [tenantId, warehouseId]);

  const totalAmount = inventories.reduce((sum, inv) => {
    const price = Number(inv.product?.price || 0);
    return sum + Number(inv.quantity) * price;
  }, 0);

  const columns = [
    {
      title: '商品名称',
      dataIndex: ['product', 'name'],
      key: 'product',
      render: (_: any, r: any) => r.product?.name || '-',
    },
    {
      title: '商品编码',
      dataIndex: ['product', 'code'],
      key: 'productCode',
      render: (_: any, r: any) => r.product?.code || '-',
    },
    {
      title: '仓库',
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
      render: (_: any, r: any) => r.warehouse?.name || '-',
    },
    { title: '库存数量', dataIndex: 'quantity', key: 'quantity', width: 100 },
    {
      title: '单价',
      dataIndex: ['product', 'price'],
      key: 'price',
      width: 100,
      render: (v: number) => v ? `¥${Number(v).toFixed(2)}` : '-',
    },
    {
      title: '库存金额',
      key: 'amount',
      width: 120,
      render: (_: any, r: any) => {
        const price = Number(r.product?.price || 0);
        return `¥${(Number(r.quantity) * price).toFixed(2)}`;
      },
    },
    {
      title: '预警',
      dataIndex: 'quantity',
      key: 'warning',
      width: 90,
      render: (qty: number, r: any) => {
        const min = Number(r.product?.minStock || 0);
        if (min > 0 && qty <= min) return <span style={{ color: '#cf1322' }}>⚠️ 低库存</span>;
        return <span style={{ color: '#3f8600' }}>正常</span>;
      },
    },
  ];

  return (
    <div>
      <Card title="库存报表" loading={loading}>
        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            placeholder="选择仓库"
            allowClear
            style={{ width: 180 }}
            onChange={setWarehouseId}
          >
            {/* 仓库列表由后端提供，这里简化 */}
          </Select>
          <Statistic title="商品种类" value={inventories.length} valueStyle={{ fontSize: 18 }} />
          <Statistic
            title="库存总额"
            value={totalAmount}
            precision={2}
            prefix="¥"
            valueStyle={{ fontSize: 18, color: '#1677ff' }}
          />
        </Space>
        <Table
          columns={columns}
          dataSource={inventories}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          scroll={{ x: 900 }}
          size="small"
        />
      </Card>
    </div>
  );
}
