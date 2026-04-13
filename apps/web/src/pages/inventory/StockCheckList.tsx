import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Input, Select, Tag, Modal, Form, DatePicker, Table as AntTable } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { inventoryApi, StockCheck } from '@/api/inventory';
import { warehouseApi } from '@/api/warehouse';
import { productApi } from '@/api/product';
import { useAuthStore } from '@/stores/auth';
import { message } from 'antd';
import { formatMoney } from '@/utils/format';

const statusMap: Record<string, { color: string; label: string }> = {
  pending: { color: 'orange', label: '待审核' },
  approved: { color: 'blue', label: '已审核' },
  completed: { color: 'green', label: '已完成' },
};

const StockCheckList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<StockCheck[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [items, setItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [query, setQuery] = useState<any>({});
  const tenantId = useAuthStore((s) => s.tenant?.id || '');

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
      const res = await inventoryApi.listChecks({ ...query, tenantId } as any);
      setDataSource(res.list);
      setPagination(res.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [query, tenantId]);

  const handleAdd = () => {
    form.resetFields();
    setItems([]);
    fetchWarehouses();
    fetchProducts();
    setModalVisible(true);
  };

  const handleAudit = async (id: string) => {
    await inventoryApi.auditCheck(id);
    message.success('审核成功');
    fetchData();
  };

  const handleApprove = async (id: string) => {
    await inventoryApi.approveCheck(id);
    message.success('确认成功');
    fetchData();
  };

  const addItem = () => {
    setItems([...items, { productId: '', bookQuantity: 0, checkQuantity: 0, diffQuantity: 0, costPrice: 0, diffAmount: 0, reason: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'bookQuantity' || field === 'checkQuantity') {
      newItems[index].diffQuantity = (newItems[index].checkQuantity || 0) - (newItems[index].bookQuantity || 0);
      newItems[index].diffAmount = newItems[index].diffQuantity * (newItems[index].costPrice || 0);
    }
    setItems(newItems);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      const data = {
        ...values,
        checkDate: values.checkDate.format('YYYY-MM-DD'),
        items,
      };
      await inventoryApi.createCheck(data as any);
      setModalVisible(false);
      fetchData();
    } finally { setLoading(false); }
  };

  const columns = [
    { title: '单据编号', dataIndex: 'orderNo', key: 'orderNo', width: 150 },
    { title: '盘点日期', dataIndex: 'checkDate', key: 'checkDate', width: 100, render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    { title: '仓库', dataIndex: ['warehouse', 'name'], key: 'warehouse', width: 100 },
    { title: '差异金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 120, render: (v: unknown) => formatMoney(v) },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (s: string) => <Tag {...statusMap[s]}>{statusMap[s]?.label || s}</Tag> },
    {
      title: '操作', key: 'action', width: 150,
      render: (_: any, r: StockCheck) => (
        <Space size="small">
          {r.status === 'pending' && <Button type="link" size="small" onClick={() => handleAudit(r.id)}>审核</Button>}
          {r.status === 'approved' && <Button type="link" size="small" onClick={() => handleApprove(r.id)}>确认</Button>}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input.Search placeholder="搜索单据编号" style={{ width: 200 }} onSearch={(v) => setQuery({ ...query, keyword: v })} />
          <Select placeholder="状态" allowClear style={{ width: 100 }} onChange={(v) => setQuery({ ...query, status: v })}>
            {Object.entries(statusMap).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
          </Select>
        </Space>
        <Table title={() => <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增盘点单</Button>}
          columns={columns} dataSource={dataSource} rowKey="id" loading={loading}
          pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total,
            onChange: (p, ps) => setQuery({ ...query, page: p, pageSize: ps }) }} />
      </Card>

      <Modal title="新增盘点单" open={modalVisible} onCancel={() => setModalVisible(false)}
        onOk={handleSubmit} confirmLoading={loading} width={900}>
        <Form form={form} layout="vertical">
          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="warehouseId" label="仓库" rules={[{ required: true }]} style={{ width: 200 }}>
              <Select>
                {warehouses.map(w => <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="checkDate" label="盘点日期" rules={[{ required: true }]} style={{ width: 150 }}>
              <DatePicker />
            </Form.Item>
          </Space>

          <div style={{ marginBottom: 8 }}>
            <Button type="dashed" onClick={addItem}>+ 添加商品</Button>
          </div>
          <AntTable
            dataSource={items.map((item, i) => ({ ...item, key: i }))}
            columns={[
              { title: '商品', width: 200, render: (_: any, __: any, i: number) => (
                <Select style={{ width: '100%' }} value={items[i]?.productId} onChange={(v) => updateItem(i, 'productId', v)}>
                  {products.map(p => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
                </Select>
              )},
              { title: '账面数量', width: 100, render: (_: any, __: any, i: number) => (
                <Input type="number" value={items[i]?.bookQuantity} onChange={(e) => updateItem(i, 'bookQuantity', e.target.value)} />
              )},
              { title: '盘点数量', width: 100, render: (_: any, __: any, i: number) => (
                <Input type="number" value={items[i]?.checkQuantity} onChange={(e) => updateItem(i, 'checkQuantity', e.target.value)} />
              )},
              { title: '差异数量', render: (_: any, __: any, i: number) => <span style={{ color: (items[i]?.diffQuantity || 0) < 0 ? '#cf1322' : '#52c41a' }}>{items[i]?.diffQuantity || 0}</span> },
              { title: '差异原因', width: 150, render: (_: any, __: any, i: number) => (
                <Input value={items[i]?.reason} onChange={(e) => updateItem(i, 'reason', e.target.value)} />
              )},
              { title: '', width: 50, render: (_: any, __: any, i: number) => (
                <Button type="link" danger size="small" onClick={() => removeItem(i)}>删除</Button>
              )},
            ]}
            pagination={false}
            size="small"
          />
        </Form>
      </Modal>
    </>
  );
};

export default StockCheckList;
