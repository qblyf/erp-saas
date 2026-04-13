import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Input, Select, Tag, Modal, Form, DatePicker, message, Popconfirm } from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { purchaseApi, PurchaseOrder, PurchaseQuery } from '@/api/purchase';
import { supplierApi } from '@/api/supplier';
import { warehouseApi } from '@/api/warehouse';
import { productApi } from '@/api/product';
import { useAuthStore } from '@/stores/auth';
import { formatMoney } from '@/utils/format';

const { confirm } = Modal;

const statusMap: Record<string, { color: string; label: string }> = {
  pending: { color: 'orange', label: '待审核' },
  approved: { color: 'green', label: '已审核' },
  completed: { color: 'blue', label: '已完成' },
  cancelled: { color: 'gray', label: '已取消' },
};

const PurchaseOrderList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<PurchaseOrder[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [query, setQuery] = useState<PurchaseQuery>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [items, setItems] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const tenantId = useAuthStore((s) => s.tenant?.id || '');

  const fetchSuppliers = async () => {
    const res = await supplierApi.list({ status: 'active', pageSize: 100 } as any);
    setSuppliers(res.list);
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
      const res = await purchaseApi.listOrders({ ...query, tenantId } as any);
      setDataSource(res.list);
      setPagination(res.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [query, tenantId]);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setItems([]);
    fetchSuppliers();
    fetchWarehouses();
    fetchProducts();
    setModalVisible(true);
  };

  const handleEdit = async (record: PurchaseOrder) => {
    setEditingId(record.id);
    fetchSuppliers();
    fetchWarehouses();
    fetchProducts();
    const res = await purchaseApi.getOrder(record.id);
    form.setFieldsValue({
      ...res,
      orderDate: dayjs(res.orderDate),
      deliveryDate: res.deliveryDate ? dayjs(res.deliveryDate) : null,
    });
    setItems(res.items || []);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    await purchaseApi.deleteOrder(id);
    message.success('删除成功');
    fetchData();
  };

  const handleAudit = async (id: string) => {
    await purchaseApi.auditOrder(id);
    message.success('审核成功');
    fetchData();
  };

  const handleCancel = async (id: string) => {
    await purchaseApi.cancelOrder(id);
    message.success('取消成功');
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
        orderDate: values.orderDate.format('YYYY-MM-DD'),
        deliveryDate: values.deliveryDate?.format('YYYY-MM-DD'),
        items,
      };
      if (editingId) {
        await purchaseApi.updateOrder(editingId, data);
      } else {
        await purchaseApi.createOrder(data as any);
      }
      setModalVisible(false);
      fetchData();
    } finally { setLoading(false); }
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  const columns = [
    { title: '单据编号', dataIndex: 'orderNo', key: 'orderNo', width: 150 },
    { title: '日期', dataIndex: 'orderDate', key: 'orderDate', width: 100, render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    { title: '供应商', dataIndex: ['supplier', 'name'], key: 'supplier', width: 150 },
    { title: '仓库', dataIndex: ['warehouse', 'name'], key: 'warehouse', width: 100 },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 120, render: (v: unknown) => formatMoney(v) },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (s: string) => <Tag {...statusMap[s]}>{statusMap[s]?.label || s}</Tag> },
    {
      title: '操作', key: 'action', width: 180,
      render: (_: any, r: PurchaseOrder) => (
        <Space size="small">
          {r.status === 'pending' && <>
            <Button type="link" size="small" onClick={() => handleEdit(r)}>编辑</Button>
            <Button type="link" size="small" onClick={() => handleAudit(r.id)}>审核</Button>
            <Button type="link" size="small" danger onClick={() => handleCancel(r.id)}>取消</Button>
          </>}
          {r.status === 'pending' && <Button type="link" size="small" danger onClick={() => handleDelete(r.id)}>删除</Button>}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input.Search placeholder="搜索单据编号" style={{ width: 200 }} onSearch={(v) => setQuery({ ...query, keyword: v })} />
          <Select placeholder="供应商" allowClear style={{ width: 150 }} onChange={(v) => setQuery({ ...query, supplierId: v })}>
            {suppliers.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
          </Select>
          <Select placeholder="状态" allowClear style={{ width: 100 }} onChange={(v) => setQuery({ ...query, status: v })}>
            {Object.entries(statusMap).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
          </Select>
        </Space>
        <Table title={() => <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增采购订单</Button>}
          columns={columns} dataSource={dataSource} rowKey="id" loading={loading}
          pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total,
            onChange: (p, ps) => setQuery({ ...query, page: p, pageSize: ps }) }} />
      </Card>

      <Modal title={editingId ? '编辑采购订单' : '新增采购订单'} open={modalVisible} onCancel={() => setModalVisible(false)}
        onOk={handleSubmit} confirmLoading={loading} width={900}>
        <Form form={form} layout="vertical">
          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="supplierId" label="供应商" rules={[{ required: true }]} style={{ width: 200 }}>
              <Select>
                {suppliers.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="warehouseId" label="仓库" rules={[{ required: true }]} style={{ width: 150 }}>
              <Select>
                {warehouses.map(w => <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="orderDate" label="订单日期" rules={[{ required: true }]} style={{ width: 150 }}>
              <DatePicker />
            </Form.Item>
            <Form.Item name="deliveryDate" label="交货日期" style={{ width: 150 }}>
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

export default PurchaseOrderList;
