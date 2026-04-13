import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Modal } from 'antd';
import { warehouseApi } from '@/api/warehouse';
import { useAuthStore } from '@/stores/auth';

interface WarehouseFormProps {
  open: boolean;
  id?: string | null;
  onCancel: () => void;
  onOk: () => void;
}

const WarehouseForm = ({ open, id, onCancel, onOk }: WarehouseFormProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const tenantId = useAuthStore((s) => s.tenant?.id || '');

  useEffect(() => {
    if (open) {
      if (id) {
        setInitLoading(true);
        warehouseApi.get(id).then((res) => {
          form.setFieldsValue(res);
          setInitLoading(false);
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, id, form]);

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      setLoading(true);
      try {
        if (id) {
          await warehouseApi.update(id, values);
        } else {
          await warehouseApi.create({ ...values, tenantId } as any);
        }
        onOk();
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <Modal
      title={id ? '编辑仓库' : '新增仓库'}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="code" label="仓库编码" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="name" label="仓库名称" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="address" label="地址">
          <Input />
        </Form.Item>
        <Form.Item name="principal" label="负责人">
          <Input />
        </Form.Item>
        <Form.Item name="sortOrder" label="排序" initialValue={0}>
          <InputNumber min={0} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default WarehouseForm;
