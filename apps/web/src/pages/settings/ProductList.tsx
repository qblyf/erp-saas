import { useState, useEffect } from 'react';
import { Input, Select, Button, Space, Tag, Table, Card, Modal, Form, InputNumber, TreeSelect, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { productApi, productCategoryApi, Product, ProductCategory } from '@/api/product';
import { warehouseApi } from '@/api/warehouse';
import { useAuthStore } from '@/stores/auth';

const ProductList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [query, setQuery] = useState({ keyword: '', categoryId: '', status: '', page: 1, pageSize: 20 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const tenantId = useAuthStore((s) => s.tenant?.id || '');

  const fetchCategories = async () => {
    const res = await productCategoryApi.list();
    setCategories(res);
  };

  const fetchData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await productApi.list({ ...query, tenantId } as any);
      setDataSource(res.list);
      setPagination(res.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchData();
  }, [query, tenantId]);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Product) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定删除该商品吗？',
      onOk: async () => {
        await productApi.delete(id);
        message.success('删除成功');
        fetchData();
      },
    });
  };

  const handleStatusChange = async (record: Product) => {
    const newStatus = record.status === 'active' ? 'inactive' : 'active';
    await productApi.updateStatus(record.id, newStatus);
    fetchData();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      if (editingId) {
        await productApi.update(editingId, values);
      } else {
        await productApi.create({ ...values, tenantId } as any);
      }
      setModalVisible(false);
      fetchData();
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: '商品编码', dataIndex: 'code', key: 'code', width: 120 },
    { title: '商品名称', dataIndex: 'name', key: 'name' },
    { title: '规格', dataIndex: 'spec', key: 'spec', width: 100 },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
    { title: '分类', dataIndex: ['category', 'name'], key: 'category', width: 100 },
    { title: '采购价', dataIndex: 'purchasePrice', key: 'purchasePrice', width: 100 },
    { title: '零售价', dataIndex: 'salePrice', key: 'salePrice', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Product) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" size="small" onClick={() => handleStatusChange(record)}>
            {record.status === 'active' ? '禁用' : '启用'}
          </Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input.Search placeholder="搜索编码/名称/规格" style={{ width: 200 }} onSearch={(v) => setQuery({ ...query, keyword: v })} />
          <TreeSelect
            placeholder="选择分类"
            allowClear
            treeData={categories}
            onChange={(v) => setQuery({ ...query, categoryId: v })}
            style={{ width: 200 }}
          />
          <Select
            placeholder="状态"
            allowClear
            style={{ width: 100 }}
            value={query.status || undefined}
            onChange={(v) => setQuery({ ...query, status: v || '' })}
            options={[
              { label: '启用', value: 'active' },
              { label: '停用', value: 'inactive' },
            ]}
          />
        </Space>

        <Table
          title={() => (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增商品</Button>
          )}
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => setQuery({ ...query, page, pageSize }),
          }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑商品' : '新增商品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={loading}
        width={700}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="code" label="商品编码" rules={[{ required: true }]} style={{ width: 200 }}>
              <Input />
            </Form.Item>
            <Form.Item name="name" label="商品名称" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>

          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="categoryId" label="商品分类" style={{ width: 200 }}>
              <TreeSelect treeData={categories} placeholder="选择分类" allowClear />
            </Form.Item>
            <Form.Item name="spec" label="规格" style={{ width: 150 }}>
              <Input />
            </Form.Item>
            <Form.Item name="unit" label="单位" style={{ width: 80 }}>
              <Input />
            </Form.Item>
          </Space>

          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="purchasePrice" label="采购价" style={{ width: 120 }}>
              <InputNumber min={0} precision={2} prefix="¥" />
            </Form.Item>
            <Form.Item name="salePrice" label="零售价" style={{ width: 120 }}>
              <InputNumber min={0} precision={2} prefix="¥" />
            </Form.Item>
            <Form.Item name="costPrice" label="成本价" style={{ width: 120 }}>
              <InputNumber min={0} precision={2} prefix="¥" />
            </Form.Item>
          </Space>

          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="minStock" label="最低库存预警" style={{ width: 120 }}>
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="maxStock" label="最高库存预警" style={{ width: 120 }}>
              <InputNumber min={0} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export default ProductList;
