import { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Input, Modal, Form, Input as InputAnt,
  message, Popconfirm, Tag, App, Select,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { storeApi, Store } from '@/api/store';
import { useAuthStore } from '@/stores/auth';

export default function StoreList() {
  const [data, setData] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const { message: msg } = App.useApp();
  const tenantId = useAuthStore((s) => s.tenant?.id);

  const loadData = (keyword?: string) => {
    if (!tenantId) return;
    setLoading(true);
    storeApi.list({ tenantId, keyword }).then(setData).catch(() => msg.error('加载失败')).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [tenantId]);

  const handleCreate = () => { setEditingId(null); form.resetFields(); setModalVisible(true); };
  const handleEdit = (row: Store) => { setEditingId(row.id); form.setFieldsValue(row); setModalVisible(true); };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (!tenantId) return;
    try {
      if (editingId) {
        await storeApi.update(editingId, values);
        msg.success('修改成功');
      } else {
        await storeApi.create({ ...values, tenantId });
        msg.success('创建成功');
      }
      setModalVisible(false);
      loadData();
    } catch { msg.error('操作失败'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await storeApi.remove(id);
      msg.success('删除成功');
      loadData();
    } catch (e: any) {
      msg.error(e?.message || '删除失败');
    }
  };

  const columns = [
    { title: '门店编码', dataIndex: 'code', key: 'code', width: 120 },
    { title: '门店名称', dataIndex: 'name', key: 'name' },
    { title: '地址', dataIndex: 'address', key: 'address', render: (v: string) => v || '-' },
    { title: '联系电话', dataIndex: 'phone', key: 'phone', render: (v: string) => v || '-' },
    { title: '店长', dataIndex: 'manager', key: 'manager', render: (v: string) => v || '-' },
    {
      title: '仓库数',
      key: 'warehouseCount',
      width: 90,
      render: (_: any, r: Store) => r.warehouses?.length || 0,
    },
    {
      title: '店员数',
      key: 'staffCount',
      width: 90,
      render: (_: any, r: Store) => r._count?.userStores || 0,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (v: string) => v === 'active'
        ? <Tag color="green">营业中</Tag>
        : <Tag color="red">已停业</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, r: Store) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="门店管理"
        extra={
          <Space>
            <Input.Search placeholder="搜索门店" onSearch={(v) => loadData(v)} style={{ width: 200 }} />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新增门店</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingId ? '编辑门店' : '新增门店'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="code" label="门店编码" rules={[{ required: true, message: '请输入编码' }]}>
            <InputAnt disabled={!!editingId} placeholder="如：STORE-001" />
          </Form.Item>
          <Form.Item name="name" label="门店名称" rules={[{ required: true, message: '请输入名称' }]}>
            <InputAnt placeholder="如：晋城旗舰店" />
          </Form.Item>
          <Form.Item name="address" label="门店地址">
            <InputAnt placeholder="详细地址" />
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <InputAnt placeholder="固定电话或手机" />
          </Form.Item>
          <Form.Item name="manager" label="店长">
            <InputAnt placeholder="店长姓名" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="active">
            <Select>
              <Select.Option value="active">营业中</Select.Option>
              <Select.Option value="inactive">已停业</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
