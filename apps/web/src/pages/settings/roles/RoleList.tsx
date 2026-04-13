import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Input, Modal, Form, Tag, message, Checkbox } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { roleApi, Role } from '@/api/role';
import { useAuthStore } from '@/stores/auth';

const PERMISSION_OPTIONS = [
  { label: '采购管理', value: 'purchase' },
  { label: '销售管理', value: 'sale' },
  { label: '库存管理', value: 'inventory' },
  { label: '财务管理', value: 'finance' },
  { label: '报表查看', value: 'reports' },
  { label: '系统设置', value: 'settings' },
  { label: '用户管理', value: 'users' },
];

const RoleList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Role[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const tenantId = useAuthStore((s) => s.tenant?.id || '');

  const fetchData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await roleApi.list(tenantId);
      setDataSource(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [tenantId]);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Role) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      permissions: record.permissions?.map((p) => p.permissionCode) || [],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定删除该角色吗？',
      onOk: async () => {
        await roleApi.delete(id);
        message.success('删除成功');
        fetchData();
      },
    });
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      if (editingId) {
        await roleApi.update(editingId, values);
      } else {
        await roleApi.create({ ...values, tenantId });
      }
      setModalVisible(false);
      fetchData();
    } finally { setLoading(false); }
  };

  const columns = [
    { title: '角色编码', dataIndex: 'code', key: 'code', width: 120 },
    { title: '角色名称', dataIndex: 'name', key: 'name', width: 150 },
    { title: '描述', dataIndex: 'description', key: 'description' },
    {
      title: '权限',
      key: 'permissions',
      render: (_: any, r: Role) => (
        <Space wrap>
          {r.permissions?.map((p) => {
            const opt = PERMISSION_OPTIONS.find((o) => o.value === p.permissionCode);
            return opt ? <Tag key={p.id}>{opt.label}</Tag> : null;
          })}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, r: Role) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleEdit(r)}>编辑</Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(r.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <Table title={() => <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增角色</Button>}
          columns={columns} dataSource={dataSource} rowKey="id" loading={loading} pagination={false} />
      </Card>

      <Modal title={editingId ? '编辑角色' : '新增角色'} open={modalVisible} onCancel={() => setModalVisible(false)}
        onOk={handleSubmit} confirmLoading={loading} width={600}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="code" label="角色编码" rules={[{ required: true }]}>
              <Input disabled={!!editingId} />
            </Form.Item>
            <Form.Item name="name" label="角色名称" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="描述">
            <Input />
          </Form.Item>
          <Form.Item name="permissions" label="权限" valuePropName="value">
            <Checkbox.Group options={PERMISSION_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default RoleList;
