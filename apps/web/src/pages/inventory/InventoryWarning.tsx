import { useState, useEffect } from 'react';
import { Card, Tag, Space } from 'antd';
import { inventoryApi } from '@/api/inventory';
import { useAuthStore } from '@/stores/auth';

const InventoryWarning = () => {
  const [warnings, setWarnings] = useState<any[]>([]);
  const tenantId = useAuthStore((s) => s.tenant?.id || '');

  useEffect(() => {
    if (tenantId) {
      inventoryApi.getWarnings().then(setWarnings);
    }
  }, [tenantId]);

  return (
    <Card title="库存预警">
      <Space direction="vertical" style={{ width: '100%' }}>
        {warnings.length === 0 && <span>暂无预警</span>}
        {warnings.map((w, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
            <span>{w.product?.name} - {w.message}</span>
            <Tag color={w.type === 'low' ? 'red' : 'orange'}>{w.type === 'low' ? '库存不足' : '超储'}</Tag>
          </div>
        ))}
      </Space>
    </Card>
  );
};

export default InventoryWarning;
