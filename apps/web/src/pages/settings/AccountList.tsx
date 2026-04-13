import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Input, Select, Tag, Modal, Form, InputNumber, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { accountApi, Account } from '@/api/account';
import { useAuthStore } from '@/stores/auth';
import { formatMoney } from '@/utils/format';

const AccountList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Account[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [query, setQuery] = useState({ keyword: '', type: '', status: '', page: 1, pageSize: 20 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const tenantId = useAuthStore((s) => s.tenant?.id || '');

  const fetchData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await accountApi.list({ ...query, tenantId } as any);
      setDataSource(res.list);
      setPagination(res.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [query, tenantId]);

  const handleAdd = () => { setEditingId(null); form.resetFields(); setModalVisible(true); };
  const handleEdit = (r: Account) => { setEditingId(r.id); form.setFieldsValue(r); setModalVisible(true); };
  const handleDelete = async (id: string) => {
    Modal.confirm({ title: '确认删除', content: '确定删除该账户吗？', onOk: async () => { await accountApi.delete(id); fetchData(); } });
  };
  const handleStatusChange = async (r: Account) => {
    await accountApi.updateStatus(r.id, r.status === 'active' ? 'inactive' : 'active');
    fetchData();
  };
  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      if (editingId) await accountApi.update(editingId, values);
      else await accountApi.create({ ...values, tenantId } as any);
      setModalVisible(false); fetchData();
    } finally { setLoading(false); }
  };

  const typeMap: Record<string, string> = { cash: '现金', bank: '银行', other: '其他' };
  const columns = [
    { title: '账户编码', dataIndex: 'code', key: 'code', width: 120 },
    { title: '账户名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type', width: 80, render: (t: string) => typeMap[t] || t },
    { title: '银行', dataIndex: 'bankName', key: 'bankName', width: 120 },
    { title: '账号', dataIndex: 'bankAccount', key: 'bankAccount', width: 180 },
    { title: '期初余额', dataIndex: 'initialBalance', key: 'initialBalance', width: 120, render: (v: unknown) => formatMoney(v) },
    { title: '当前余额', dataIndex: 'currentBalance', key: 'currentBalance', width: 120, render: (v: unknown) => formatMoney(v) },
    { title: '默认', dataIndex: 'isDefault', key: 'isDefault', width: 60, render: (v: boolean) => v ? <Tag color="blue">是</Tag> : '' },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{s === 'active' ? '启用' : '禁用'}</Tag> },
    { title: '操作', key: 'action', width: 150, render: (_: any, r: Account) => (
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
          <Input.Search placeholder="搜索编码/名称" style={{ width: 200 }} onSearch={(v) => setQuery({ ...query, keyword: v })} />
          <Select placeholder="类型" allowClear style={{ width: 100 }} value={query.type || undefined}
            onChange={(v) => setQuery({ ...query, type: v || '' })}
            options={[{ label: '现金', value: 'cash' }, { label: '银行', value: 'bank' }, { label: '其他', value: 'other' }]} />
          <Select placeholder="状态" allowClear style={{ width: 100 }} value={query.status || undefined}
            onChange={(v) => setQuery({ ...query, status: v || '' })}
            options={[{ label: '启用', value: 'active' }, { label: '禁用', value: 'inactive' }]} />
        </Space>
        <Table title={() => <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增账户</Button>}
          columns={columns} dataSource={dataSource} rowKey="id" loading={loading}
          pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total,
            onChange: (p, ps) => setQuery({ ...query, page: p, pageSize: ps }) }} />
      </Card>

      <Modal title={editingId ? '编辑账户' : '新增账户'} open={modalVisible} onCancel={() => setModalVisible(false)}
        onOk={handleSubmit} confirmLoading={loading}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="code" label="账户编码" rules={[{ required: true }]} style={{ width: 150 }}><Input /></Form.Item>
            <Form.Item name="name" label="账户名称" rules={[{ required: true }]} style={{ flex: 1 }}><Input /></Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="type" label="账户类型" style={{ width: 150 }}>
              <Select options={[{ label: '现金', value: 'cash' }, { label: '银行', value: 'bank' }, { label: '其他', value: 'other' }]} />
            </Form.Item>
            <Form.Item name="bankName" label="开户银行" style={{ width: 200 }}><Input /></Form.Item>
            <Form.Item name="bankAccount" label="银行账号" style={{ width: 200 }}><Input /></Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="initialBalance" label="期初余额" style={{ width: 150 }}>
              <InputNumber min={0} precision={2} prefix="¥" />
            </Form.Item>
            <Form.Item name="isDefault" label="默认账户" valuePropName="checked" style={{ width: 100 }}>
              <input type="checkbox" />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export default AccountList;
