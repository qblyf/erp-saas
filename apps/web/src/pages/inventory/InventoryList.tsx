import { useState, useEffect } from 'react';
import { Table, Card, Space, Input, Select, Tag } from 'antd';
import { warehouseApi } from '@/api/warehouse';
import { inventoryApi, Inventory } from '@/api/inventory';
import { useAuthStore } from '@/stores/auth';
import { formatMoney } from '@/utils/format';

const InventoryList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Inventory[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [query, setQuery] = useState<any>({});
  const tenantId = useAuthStore((s) => s.tenant?.id || '');

  const fetchWarehouses = async () => {
    const res = await warehouseApi.list({ status: 'active', pageSize: 100 } as any);
    setWarehouses(res.list);
  };

  const fetchData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await inventoryApi.list({ ...query, tenantId } as any);
      setDataSource(res.list);
      setPagination(res.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchWarehouses(); }, []);
  useEffect(() => { fetchData(); }, [query, tenantId]);

  const getStockStatus = (record: Inventory) => {
    if (record.quantity === 0) return { color: 'red', label: '缺货' };
    if (record.quantity < 100) return { color: 'orange', label: '低库存' };
    if (record.quantity > 1000) return { color: 'blue', label: '超储' };
    return { color: 'green', label: '正常' };
  };

  const columns = [
    { title: '商品编码', dataIndex: ['product', 'code'], key: 'code', width: 120 },
    { title: '商品名称', dataIndex: ['product', 'name'], key: 'name' },
    { title: '规格', dataIndex: ['product', 'spec'], key: 'spec', width: 100 },
    { title: '仓库', dataIndex: ['warehouse', 'name'], key: 'warehouse', width: 100 },
    { title: '库存数量', dataIndex: 'quantity', key: 'quantity', width: 100 },
    { title: '冻结数量', dataIndex: 'frozenQuantity', key: 'frozenQuantity', width: 80 },
    { title: '成本价', dataIndex: 'avgCostPrice', key: 'avgCostPrice', width: 100, render: (v: unknown) => formatMoney(v) },
    { title: '库存金额', key: 'amount', width: 120, render: (_: any, r: Inventory) => formatMoney((r.quantity || 0) * (r.avgCostPrice || 0)) },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: (_: any, r: Inventory) => {
        const status = getStockStatus(r);
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
  ];

  return (
    <Card>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search placeholder="搜索商品编码/名称" style={{ width: 200 }} onSearch={(v) => setQuery({ ...query, keyword: v })} />
        <Select placeholder="仓库" allowClear style={{ width: 150 }} onChange={(v) => setQuery({ ...query, warehouseId: v })}>
          {warehouses.map(w => <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>)}
        </Select>
        <Select placeholder="库存状态" allowClear style={{ width: 120 }} onChange={(v) => setQuery({ ...query, stockStatus: v })}>
          <Select.Option value="normal">正常</Select.Option>
          <Select.Option value="low">低库存</Select.Option>
          <Select.Option value="over">超储</Select.Option>
          <Select.Option value="zero">缺货</Select.Option>
        </Select>
      </Space>
      <Table columns={columns} dataSource={dataSource} rowKey="id" loading={loading}
        pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total,
          onChange: (p, ps) => setQuery({ ...query, page: p, pageSize: ps }) }} />
    </Card>
  );
};

export default InventoryList;
