import { useState, useEffect } from 'react';
import { Input, Select, Space, Tag, Modal } from 'antd';
import { warehouseApi, Warehouse, WarehouseQuery } from '@/api/warehouse';
import ListPage from '@/components/ListPage';
import WarehouseForm from './WarehouseForm';
import { useAuthStore } from '@/stores/auth';

const statusOptions = [
  { label: '全部', value: '' },
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' },
];

const WarehouseList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Warehouse[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [query, setQuery] = useState<WarehouseQuery>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const tenantId = useAuthStore((s) => s.tenant?.id || '');

  const fetchData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await warehouseApi.list({ ...query, tenantId } as any);
      setDataSource(res.list);
      setPagination(res.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [query, tenantId]);

  const handleAdd = () => {
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEdit = (record: Warehouse) => {
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleDelete = async (record: Warehouse) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定删除仓库"${record.name}"吗？`,
      onOk: async () => {
        await warehouseApi.delete(record.id);
        fetchData();
      },
    });
  };

  const handleStatusChange = async (record: Warehouse, status: string) => {
    await warehouseApi.updateStatus(record.id, status);
    fetchData();
  };

  const handleModalOk = () => {
    setModalVisible(false);
    fetchData();
  };

  const columns = [
    { title: '仓库编码', dataIndex: 'code', key: 'code', width: 120 },
    { title: '仓库名称', dataIndex: 'name', key: 'name' },
    { title: '地址', dataIndex: 'address', key: 'address' },
    { title: '负责人', dataIndex: 'principal', key: 'principal', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input.Search
          placeholder="搜索编码/名称"
          style={{ width: 200 }}
          onSearch={(v) => setQuery({ ...query, keyword: v })}
        />
        <Select
          options={statusOptions}
          value={query.status || ''}
          onChange={(v) => setQuery({ ...query, status: v })}
          style={{ width: 120 }}
        />
      </div>

      <ListPage
        title="仓库管理"
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
        }}
        onTableChange={(p) =>
          setQuery({ ...query, page: p.current, pageSize: p.pageSize })
        }
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />

      <WarehouseForm
        open={modalVisible}
        id={editingId}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
      />
    </>
  );
};

export default WarehouseList;
