import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Modal, Form, Input, InputNumber, TreeSelect } from 'antd';

import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { productCategoryApi, ProductCategory } from '@/api/product';
import { useAuthStore } from '@/stores/auth';

const CategoryManage = () => {
  const [dataSource, setDataSource] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const tenantId = useAuthStore((s) => s.tenant?.id || '');

  const fetchData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await productCategoryApi.list();
      setDataSource(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: ProductCategory) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定删除该分类吗？',
      onOk: async () => {
        await productCategoryApi.delete(id);
        fetchData();
      },
    });
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      if (editingId) {
        await productCategoryApi.update(editingId, values);
      } else {
        await productCategoryApi.create({ ...values, tenantId } as any);
      }
      setModalVisible(false);
      fetchData();
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: '分类名称', dataIndex: 'name', key: 'name' },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 100 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: ProductCategory) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="商品分类管理"
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增分类</Button>}
    >
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingId ? '编辑分类' : '新增分类'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="parentId" label="上级分类">
            <TreeSelect
              treeData={dataSource as any}
              placeholder="不选则为顶级分类"
              allowClear
              treeDefaultExpandAll
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item name="name" label="分类名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序" initialValue={0}>
            <InputNumber min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CategoryManage;
