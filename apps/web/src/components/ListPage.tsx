import { ReactNode } from 'react';
import { Table, Button, Space, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface Column {
  title: string;
  dataIndex: string;
  key: string;
  width?: number;
  render?: (value: any, record: any) => ReactNode;
}

interface ListPageProps {
  title: string;
  columns: Column[];
  dataSource: any[];
  loading?: boolean;
  pagination?: any;
  onTableChange?: (pagination: any, filters: any, sorter: any) => void;
  onAdd?: () => void;
  onEdit?: (record: any) => void;
  onDelete?: (record: any) => void;
  onStatusChange?: (record: any, status: string) => void;
  renderActions?: (record: any) => ReactNode;
  showAdd?: boolean;
}

const ListPage = ({
  title,
  columns,
  dataSource,
  loading,
  pagination,
  onTableChange,
  onAdd,
  onEdit,
  onDelete,
  onStatusChange,
  renderActions,
  showAdd = true,
}: ListPageProps) => {
  const actionColumn = {
    title: '操作',
    key: 'action',
    width: 150,
    render: (_: any, record: any) => (
      <Space size="small">
        <Button type="link" size="small" onClick={() => onEdit?.(record)}>
          编辑
        </Button>
        {onStatusChange && (
          <Button
            type="link"
            size="small"
            onClick={() => onStatusChange(record, record.status === 'active' ? 'inactive' : 'active')}
          >
            {record.status === 'active' ? '禁用' : '启用'}
          </Button>
        )}
        {onDelete && (
          <Button type="link" size="small" danger onClick={() => onDelete(record)}>
            删除
          </Button>
        )}
        {renderActions?.(record)}
      </Space>
    ),
  };

  return (
    <Card
      title={title}
      extra={
        showAdd && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            新增
          </Button>
        )
      }
    >
      <Table
        columns={[...columns, actionColumn]}
        dataSource={dataSource}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={onTableChange}
      />
    </Card>
  );
};

export default ListPage;
