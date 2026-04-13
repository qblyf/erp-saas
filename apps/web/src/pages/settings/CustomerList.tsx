import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Input, Select, Tag, Modal, Form, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { customerApi, Customer } from '@/api/customer';
import { useAuthStore } from '@/stores/auth';

const CustomerList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Customer[]>([]);
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
      const res = await customerApi.list({ ...query, tenantId } as any);
      setDataSource(res.list);
      setPagination(res.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [query, tenantId]);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Customer) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({ title: '确认删除', content: '确定删除该客户吗？', onOk: async () => {
      await customerApi.delete(id);
      fetchData();
    }});
  };

  const handleStatusChange = async (record: Customer) => {
    await customerApi.updateStatus(record.id, record.status === 'active' ? 'inactive' : 'active');
    fetchData();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      if (editingId) await customerApi.update(editingId, values);
      else await customerApi.create({ ...values, tenantId } as any);
      setModalVisible(false);
      fetchData();
    } finally { setLoading(false); }
  };

  const columns = [
    { title: '客户编码', dataIndex: 'code', key: 'code', width: 120 },
    { title: '客户名称', dataIndex: 'name', key: 'name' },
    { title: '联系人', dataIndex: 'contact', key: 'contact', width: 100 },
    { title: '电话', dataIndex: 'phone', key: 'phone', width: 120 },
    { title: '手机', dataIndex: 'mobile', key: 'mobile', width: 120 },
    { title: '类型', dataIndex: 'customerType', key: 'customerType', width: 80 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{s === 'active' ? '启用' : '禁用'}</Tag>
    },
    {
      title: '操作', key: 'action', width: 150,
      render: (_: any, r: Customer) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleEdit(r)}>编辑</Button>
          <Button type="link" size="small" onClick={() => handleStatusChange(r)}>{r.status === 'active' ? '禁用' : '启用'}</Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(r.id)}>删除</Button>
        </Space>
      )
    },
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

        <Table title={() => <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增客户</Button>}
          columns={columns} dataSource={dataSource} rowKey="id" loading={loading}
          pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total,
            onChange: (p, ps) => setQuery({ ...query, page: p, pageSize: ps }) }} />
      </Card>

      <Modal title={editingId ? '编辑客户' : '新增客户'} open={modalVisible} onCancel={() => setModalVisible(false)}
        onOk={handleSubmit} confirmLoading={loading} width={700}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="code" label="客户编码" rules={[{ required: true }]} style={{ width: 150 }}>
              <Input />
            </Form.Item>
            <Form.Item name="name" label="客户名称" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="contact" label="联系人" style={{ width: 150 }}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="电话" style={{ width: 150 }}>
              <Input />
            </Form.Item>
            <Form.Item name="mobile" label="手机" style={{ width: 150 }}>
              <Input />
            </Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="customerType" label="客户类型" style={{ width: 150 }}>
              <Select options={[{ label: '零售', value: 'retail' }, { label: '批发', value: 'wholesale' }]} />
            </Form.Item>
            <Form.Item name="creditLimit" label="信用额度" style={{ width: 150 }}>
              <InputNumber min={0} precision={2} prefix="¥" />
            </Form.Item>
          </Space>
          <Form.Item name="address" label="地址">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CustomerList;
