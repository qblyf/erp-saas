import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Input, Select, Tag, Modal, Form, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { userApi, User } from '@/api/user';
import { useAuthStore } from '@/stores/auth';

const statusMap: Record<string, { color: string; label: string }> = {
  active: { color: 'green', label: '启用' },
  inactive: { color: 'red', label: '禁用' },
};

const UserList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [query, setQuery] = useState({ keyword: '', status: '', page: 1, pageSize: 20 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resetPwdId, setResetPwdId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();
  const tenantId = useAuthStore((s) => s.tenant?.id || '');

  const fetchData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await userApi.list({ ...query, tenantId } as any);
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

  const handleEdit = (record: User) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定删除该用户吗？',
      onOk: async () => {
        await userApi.delete(id);
        message.success('删除成功');
        fetchData();
      },
    });
  };

  const handleStatusChange = async (record: User) => {
    await userApi.updateStatus(record.id, record.status === 'active' ? 'inactive' : 'active');
    message.success('状态更新成功');
    fetchData();
  };

  const handleResetPassword = (record: User) => {
    setResetPwdId(record.id);
    pwdForm.resetFields();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      if (editingId) {
        await userApi.update(editingId, values);
      } else {
        await userApi.create({ ...values, tenantId });
      }
      setModalVisible(false);
      fetchData();
    } finally { setLoading(false); }
  };

  const handleResetPwdSubmit = async () => {
    const values = await pwdForm.validateFields();
    if (!resetPwdId) return;
    await userApi.resetPassword(resetPwdId, values.password);
    message.success('密码重置成功');
    setResetPwdId(null);
  };

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username', width: 120 },
    { title: '姓名', dataIndex: 'realName', key: 'realName', width: 100 },
    { title: '手机', dataIndex: 'phone', key: 'phone', width: 120 },
    { title: '邮箱', dataIndex: 'email', key: 'email', width: 150 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (s: string) => <Tag {...statusMap[s]}>{statusMap[s]?.label || s}</Tag>,
    },
    { title: '最后登录', dataIndex: 'lastLoginAt', key: 'lastLoginAt', width: 160, render: (d: string) => d ? new Date(d).toLocaleString() : '-' },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, r: User) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleEdit(r)}>编辑</Button>
          <Button type="link" size="small" onClick={() => handleStatusChange(r)}>{r.status === 'active' ? '禁用' : '启用'}</Button>
          <Button type="link" size="small" onClick={() => handleResetPassword(r)}>重置密码</Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(r.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input.Search placeholder="搜索用户名/姓名" style={{ width: 200 }} onSearch={(v) => setQuery({ ...query, keyword: v })} />
          <Select placeholder="状态" allowClear style={{ width: 100 }} value={query.status || undefined}
            onChange={(v) => setQuery({ ...query, status: v || '' })}
            options={[{ label: '启用', value: 'active' }, { label: '禁用', value: 'inactive' }]} />
        </Space>

        <Table title={() => <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增用户</Button>}
          columns={columns} dataSource={dataSource} rowKey="id" loading={loading}
          pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total,
            onChange: (p, ps) => setQuery({ ...query, page: p, pageSize: ps }) }} />
      </Card>

      <Modal title={editingId ? '编辑用户' : '新增用户'} open={modalVisible} onCancel={() => setModalVisible(false)}
        onOk={handleSubmit} confirmLoading={loading}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input disabled={!!editingId} />
          </Form.Item>
          {!editingId && (
            <Form.Item name="password" label="密码" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="realName" label="姓名" style={{ width: 150 }}><Input /></Form.Item>
            <Form.Item name="phone" label="手机" style={{ width: 150 }}><Input /></Form.Item>
          </Space>
          <Form.Item name="email" label="邮箱"><Input /></Form.Item>
        </Form>
      </Modal>

      <Modal title="重置密码" open={!!resetPwdId} onCancel={() => setResetPwdId(null)}
        onOk={handleResetPwdSubmit}>
        <Form form={pwdForm} layout="vertical">
          <Form.Item name="password" label="新密码" rules={[{ required: true }, { min: 6, message: '密码至少6位' }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserList;
