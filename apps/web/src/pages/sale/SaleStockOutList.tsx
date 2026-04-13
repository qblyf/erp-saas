import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Input, Select, Tag, Modal, Form, DatePicker, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { saleApi, SaleStockOut } from '@/api/sale';
import { customerApi } from '@/api/customer';
import { warehouseApi } from '@/api/warehouse';
import { productApi } from '@/api/product';
import { useAuthStore } from '@/stores/auth';
import { formatMoney } from '@/utils/format';

const statusMap: Record<string, { color: string; label: string }> = {
  pending: { color: 'orange', label: '待审核' },
  approved: { color: 'green', label: '已审核' },
};

const SaleStockOutList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<SaleStockOut[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [query, setQuery] = useState<any>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [items, setItems] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const tenantId = useAuthStore((s) => s.tenant?.id || '');

  const fetchCustomers = async () => {
    const res = await customerApi.list({ status: 'active', pageSize: 100 } as any);
    setCustomers(res.list);
  };

  const fetchWarehouses = async () => {
    const res = await warehouseApi.list({ status: 'active', pageSize: 100 } as any);
    setWarehouses(res.list);
  };

  const fetchProducts = async () => {
    const res = await productApi.list({ status: 'active', pageSize: 100 } as any);
    setProducts(res.list);
  };

  const fetchData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await saleApi.listStockOuts({ ...query, tenantId } as any);
      setDataSource(res.list);
      setPagination(res.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [query, tenantId]);

  const handleAdd = () => {
    form.resetFields();
    setItems([]);
    fetchCustomers();
    fetchWarehouses();
    fetchProducts();
    setModalVisible(true);
  };

  const handleAudit = async (id: string) => {
    await saleApi.auditStockOut(id);
    message.success('审核成功');
    fetchData();
  };

  const addItem = () => {
    setItems([...items, { productId: '', warehouseId: '', quantity: 1, price: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'price') {
      newItems[index].amount = (newItems[index].quantity || 0) * (newItems[index].price || 0);
    }
    setItems(newItems);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      const data = {
        ...values,
        stockOutDate: values.stockOutDate.format('YYYY-MM-DD'),
        items,
      };
      await saleApi.createStockOut(data as any);
      setModalVisible(false);
      fetchData();
    } finally { setLoading(false); }
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  const columns = [
    { title: '单据编号', dataIndex: 'orderNo', key: 'orderNo', width: 150 },
    { title: '日期', dataIndex: 'stockOutDate', key: 'stockOutDate', width: 100, render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    { title: '客户', dataIndex: ['customer', 'name'], key: 'customer', width: 150 },
    { title: '仓库', dataIndex: ['warehouse', 'name'], key: 'warehouse', width: 100 },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 120, render: (v: unknown) => formatMoney(v) },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (s: string) => <Tag {...statusMap[s]}>{statusMap[s]?.label || s}</Tag> },
    {
      title: '操作', key: 'action', width: 100,
      render: (_: any, r: SaleStockOut) => (
        <Space size="small">
          {r.status === 'pending' && <Button type="link" size="small" onClick={() => handleAudit(r.id)}>审核</Button>}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input.Search placeholder="搜索单据编号" style={{ width: 200 }} onSearch={(v) => setQuery({ ...query, keyword: v })} />
          <Select placeholder="客户" allowClear style={{ width: 150 }} onChange={(v) => setQuery({ ...query, customerId: v })}>
            {customers.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
          </Select>
          <Select placeholder="状态" allowClear style={{ width: 100 }} onChange={(v) => setQuery({ ...query, status: v })}>
            {Object.entries(statusMap).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
          </Select>
        </Space>
        <Table title={() => <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增销售出库</Button>}
          columns={columns} dataSource={dataSource} rowKey="id" loading={loading}
          pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total,
            onChange: (p, ps) => setQuery({ ...query, page: p, pageSize: ps }) }} />
      </Card>

      <Modal title="新增销售出库" open={modalVisible} onCancel={() => setModalVisible(false)}
        onOk={handleSubmit} confirmLoading={loading} width={900}>
        <Form form={form} layout="vertical">
          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="customerId" label="客户" rules={[{ required: true }]} style={{ width: 200 }}>
              <Select>
                {customers.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="warehouseId" label="仓库" rules={[{ required: true }]} style={{ width: 150 }}>
              <Select>
                {warehouses.map(w => <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="stockOutDate" label="出库日期" rules={[{ required: true }]} style={{ width: 150 }}>
              <DatePicker />
            </Form.Item>
          </Space>

          <div style={{ marginBottom: 8 }}>
            <Button type="dashed" onClick={addItem}>+ 添加商品</Button>
          </div>
          <Table
            dataSource={items.map((item, i) => ({ ...item, key: i }))}
            columns={[
              { title: '商品', width: 200, render: (_: any, __: any, i: number) => (
                <Select style={{ width: '100%' }} value={items[i]?.productId} onChange={(v) => updateItem(i, 'productId', v)}>
                  {products.map(p => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
                </Select>
              )},
              { title: '仓库', width: 120, render: (_: any, __: any, i: number) => (
                <Select style={{ width: '100%' }} value={items[i]?.warehouseId} onChange={(v) => updateItem(i, 'warehouseId', v)}>
                  {warehouses.map(w => <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>)}
                </Select>
              )},
              { title: '数量', width: 100, render: (_: any, __: any, i: number) => (
                <Input type="number" value={items[i]?.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} />
              )},
              { title: '单价', width: 100, render: (_: any, __: any, i: number) => (
                <Input type="number" value={items[i]?.price} onChange={(e) => updateItem(i, 'price', e.target.value)} />
              )},
              { title: '金额', render: (_: any, __: any, i: number) => <span>¥{((items[i]?.amount) || 0).toFixed(2)}</span> },
              { title: '', width: 50, render: (_: any, __: any, i: number) => (
                <Button type="link" danger size="small" onClick={() => removeItem(i)}>删除</Button>
              )},
            ]}
            pagination={false}
            size="small"
          />
          <div style={{ textAlign: 'right', marginTop: 8, fontSize: 16 }}>
            合计: <span style={{ color: '#1677ff', fontWeight: 600 }}>¥{totalAmount.toFixed(2)}</span>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default SaleStockOutList;
