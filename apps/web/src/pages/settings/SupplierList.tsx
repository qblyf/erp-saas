import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Input, Select, Tag, Modal, Form } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { supplierApi, Supplier } from '@/api/supplier';
import { useAuthStore } from '@/stores/auth';

const SupplierList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Supplier[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [query, setQuery] = useState({ keyword: '', status: '', page: 1, pageSize: 20 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const tenantId = useAuthStore((s) => s.tenant?.id || '');

  const fetchData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await supplierApi.list({ ...query, tenantId } as any);
      setDataSource(res.list);
      setPagination(res.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [query, tenantId]);

  const handleAdd = () => { setEditingId(null); form.resetFields(); setModalVisible(true); };
  const handleEdit = (r: Supplier) => { setEditingId(r.id); form.setFieldsValue(r); setModalVisible(true); };
  const handleDelete = async (id: string) => {
    Modal.confirm({ title: '确认删除', content: '确定删除该供应商吗？', onOk: async () => { await supplierApi.delete(id); fetchData(); } });
  };
  const handleStatusChange = async (r: Supplier) => {
    await supplierApi.updateStatus(r.id, r.status === 'active' ? 'inactive' : 'active');
    fetchData();
  };
  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      if (editingId) await supplierApi.update(editingId, values);
      else await supplierApi.create({ ...values, tenantId } as any);
      setModalVisible(false); fetchData();
    } finally { setLoading(false); }
  };

  const columns = [
    { title: '供应商编码', dataIndex: 'code', key: 'code', width: 120 },
    { title: '供应商名称', dataIndex: 'name', key: 'name' },
    { title: '联系人', dataIndex: 'contact', key: 'contact', width: 100 },
    { title: '电话', dataIndex: 'phone', key: 'phone', width: 120 },
    { title: '手机', dataIndex: 'mobile', key: 'mobile', width: 120 },
    { title: '银行', dataIndex: 'bankName', key: 'bankName', width: 120 },
    { title: '银行账号', dataIndex: 'bankAccount', key: 'bankAccount', width: 150 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{s === 'active' ? '启用' : '禁用'}</Tag> },
    { title: '操作', key: 'action', width: 150, render: (_: any, r: Supplier) => (
      <Space size="small">
        <Button type="link" size="small" onClick={() => handleEdit(r)}>编辑</Button>
        <Button type="link" size="small" onClick={() => handleStatusChange(r)}>{r.status === 'active' ? '禁用' : '启用'}</Button>
        <Button type="link" size="small" danger onClick={() => handleDelete(r.id)}>删除</Button>
      </Space>
    )},
  ];

  return (
    <>
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input.Search placeholder="搜索编码/名称/联系人" style={{ width: 200 }} onSearch={(v) => setQuery({ ...query, keyword: v })} />
          <Select placeholder="状态" allowClear style={{ width: 100 }} value={query.status || undefined}
            onChange={(v) => setQuery({ ...query, status: v || '' })}
            options={[{ label: '启用', value: 'active' }, { label: '禁用', value: 'inactive' }]} />
        </Space>
        <Table title={() => <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增供应商</Button>}
          columns={columns} dataSource={dataSource} rowKey="id" loading={loading}
          pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total,
            onChange: (p, ps) => setQuery({ ...query, page: p, pageSize: ps }) }} />
      </Card>

      <Modal title={editingId ? '编辑供应商' : '新增供应商'} open={modalVisible} onCancel={() => setModalVisible(false)}
        onOk={handleSubmit} confirmLoading={loading} width={700}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="code" label="供应商编码" rules={[{ required: true }]} style={{ width: 150 }}><Input /></Form.Item>
            <Form.Item name="name" label="供应商名称" rules={[{ required: true }]} style={{ flex: 1 }}><Input /></Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="contact" label="联系人" style={{ width: 150 }}><Input /></Form.Item>
            <Form.Item name="phone" label="电话" style={{ width: 150 }}><Input /></Form.Item>
            <Form.Item name="mobile" label="手机" style={{ width: 150 }}><Input /></Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="bankName" label="开户银行" style={{ width: 200 }}><Input /></Form.Item>
            <Form.Item name="bankAccount" label="银行账号" style={{ width: 200 }}><Input /></Form.Item>
            <Form.Item name="taxNo" label="税务登记号" style={{ width: 200 }}><Input /></Form.Item>
          </Space>
          <Form.Item name="address" label="地址"><Input /></Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SupplierList;
