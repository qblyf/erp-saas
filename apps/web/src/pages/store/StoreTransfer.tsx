import { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Modal, Form, Select, InputNumber,
  message, App, Tag, Popconfirm, Input,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { storeApi, Store } from '@/api/store';
import { storeTransferApi, StoreTransfer, CreateStoreTransferDto } from '@/api/storeTransfer';
import { useAuthStore } from '@/stores/auth';
import type { ColumnsType } from 'antd/es/table';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待审核', color: 'orange' },
  in_transit: { label: '调拨中', color: 'blue' },
  completed: { label: '已完成', color: 'green' },
  cancelled: { label: '已取消', color: 'red' },
};

export default function StoreTransferPage() {
  const [transfers, setTransfers] = useState<StoreTransfer[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { message: msg } = App.useApp();
  const { tenant, user } = useAuthStore();

  const loadData = () => {
    if (!tenant) return;
    setLoading(true);
    Promise.all([
      storeTransferApi.list({ tenantId: tenant.id }),
      storeApi.list({ tenantId: tenant.id, status: 'active' }),
    ]).then(([transfersData, storesData]) => {
      setTransfers(transfersData);
      setStores(storesData);
    }).catch(() => msg.error('加载失败')).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [tenant]);

  const handleCreate = () => { form.resetFields(); setModalVisible(true); };
  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (!tenant || !user) return;
    const dto: CreateStoreTransferDto = {
      tenantId: tenant.id,
      creatorId: user.id,
      fromStoreId: values.fromStoreId,
      toStoreId: values.toStoreId,
      remark: values.remark,
      items: values.items || [],
    };
    try {
      await storeTransferApi.create(dto);
      msg.success('调拨单已创建');
      setModalVisible(false);
      loadData();
    } catch { msg.error('创建失败'); }
  };

  const handleExecute = async (id: string) => {
    try {
      await storeTransferApi.execute(id);
      msg.success('调拨执行成功');
      loadData();
    } catch (e: any) { msg.error(e?.message || '执行失败'); }
  };

  const handleCancel = async (id: string) => {
    try {
      await storeTransferApi.update(id, { status: 'cancelled' });
      msg.success('已取消');
      loadData();
    } catch { msg.error('操作失败'); }
  };

  const columns: ColumnsType<StoreTransfer> = [
    { title: '调拨单号', dataIndex: 'transferNo', key: 'transferNo', width: 180 },
    {
      title: '调出门店', dataIndex: ['fromStore', 'name'],
      render: (_: any, r: StoreTransfer) => (
        <Space direction="vertical" size={0}>
          <span>{r.fromStore?.name}</span>
          <span style={{ fontSize: 12, color: '#999' }}>{r.fromStoreId}</span>
        </Space>
      ),
    },
    {
      title: '调入门店', dataIndex: ['toStore', 'name'],
      render: (_: any, r: StoreTransfer) => (
        <Space direction="vertical" size={0}>
          <span>{r.toStore?.name}</span>
          <span style={{ fontSize: 12, color: '#999' }}>{r.toStoreId}</span>
        </Space>
      ),
    },
    { title: '调拨品种', dataIndex: 'items', key: 'count',
      render: (items: any[]) => items?.length || 0 },
    {
      title: '总数量', key: 'totalQty', width: 90,
      render: (_: any, r: StoreTransfer) =>
        r.items?.reduce((s, i) => s + i.quantity, 0) || 0,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (v: string) => {
        const s = STATUS_MAP[v] || { label: v, color: 'default' };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    {
      title: '操作', key: 'action', width: 180,
      render: (_: any, r: StoreTransfer) => (
        <Space>
          {r.status === 'pending' && (
            <>
              <Button size="small" type="link" onClick={() => handleExecute(r.id)}>执行调拨</Button>
              <Popconfirm title="确定取消？" onConfirm={() => handleCancel(r.id)}>
                <Button size="small" danger type="link">取消</Button>
              </Popconfirm>
            </>
          )}
          {r.status === 'completed' && <Tag color="green">已完成</Tag>}
          {r.status === 'cancelled' && <Tag color="red">已取消</Tag>}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="店间调拨"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新建调拨单</Button>}
      >
        <Table
          columns={columns}
          dataSource={transfers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          size="small"
          expandable={{
            expandedRowRender: (r: StoreTransfer) => (
              <div style={{ padding: '4px 0' }}>
                <strong>调拨明细：</strong>
                <Table
                  dataSource={r.items}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: '商品', dataIndex: ['product', 'name'], key: 'productName' },
                    { title: '商品编码', dataIndex: ['product', 'code'], key: 'productCode' },
                    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
                    { title: '状态', dataIndex: 'status', key: 'status',
                      render: (v: string) => STATUS_MAP[v]?.label || v },
                  ]}
                />
                {r.remark && <div style={{ color: '#666', marginTop: 8 }}>备注：{r.remark}</div>}
              </div>
            ),
          }}
        />
      </Card>

      <Modal
        title="新建店间调拨单"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Space style={{ width: '100%' }} wrap>
            <Form.Item name="fromStoreId" label="调出门店" rules={[{ required: true }]}
              style={{ minWidth: 200 }}>
              <Select placeholder="选择门店" options={stores.map(s => ({ value: s.id, label: s.name }))} />
            </Form.Item>
            <Form.Item name="toStoreId" label="调入门店" rules={[{ required: true }]}
              style={{ minWidth: 200 }}>
              <Select placeholder="选择门店" options={stores.map(s => ({ value: s.id, label: s.name }))} />
            </Form.Item>
          </Space>
          <Form.Item name="remark" label="备注">
            <Input.TextArea placeholder="可选" rows={2} />
          </Form.Item>
          <div style={{ color: '#999', fontSize: 12 }}>
            💡 调拨商品可在创建后在详情页添加，或在执行时自动从各店仓库扣减/增加库存。
          </div>
        </Form>
      </Modal>
    </div>
  );
}
