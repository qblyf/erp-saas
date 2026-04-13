import { ReactNode } from 'react';
import { Form, Card, Button, Space, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';

interface FormItem {
  name: string;
  label: string;
  required?: boolean;
  component: ReactNode;
}

interface FormPageProps {
  title: string;
  items: FormItem[];
  form: any;
  loading?: boolean;
  initialValues?: any;
  onSubmit?: (values: any) => void;
  onCancel?: () => void;
  width?: number;
}

const FormPage = ({
  title,
  items,
  form,
  loading,
  initialValues,
  onSubmit,
  onCancel,
  width = 600,
}: FormPageProps) => {
  const navigate = useNavigate();

  const handleSubmit = () => {
    form.validateFields().then((values: any) => {
      onSubmit?.(values);
    });
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <Card title={title}>
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          style={{ maxWidth: width }}
        >
          {items.map((item) => (
            <Form.Item
              key={item.name}
              name={item.name}
              label={item.label}
              required={item.required}
            >
              {item.component}
            </Form.Item>
          ))}

          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button type="primary" onClick={handleSubmit} loading={loading}>
                保存
              </Button>
              <Button onClick={handleCancel}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Spin>
    </Card>
  );
};

export default FormPage;
