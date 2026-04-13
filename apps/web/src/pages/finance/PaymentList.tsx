import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Input, Select, Tag, Modal, Form, DatePicker, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { financeApi, Payment } from '@/api/finance';
import { customerApi } from '@/api/customer';
import { supplierApi } from '@/api/supplier';
import { accountApi } from '@/api/account';
import { useAuthStore } from '@/stores/auth';
import { formatMoney } from '@/utils/format';

const statusMap: Record<string, { color: string; label: string }> = {
  pending: { color: 'orange', label: '待审核' },
  approved: { color: 'green', label: '已审核' },
};

const typeMap: Record<string, { color: string; label: string }> = {
  receipt: { color: 'green', label: '收款' },
  payment: { color: 'red', label: '付款' },
  other: { color: 'blue', label: '其他' },
};

const PaymentList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [query, setQuery] = useState<any>({});
  const tenantId = useAuthStore((s) => s.tenant?.id || '');

  const fetchCustomers = async () => {
    const res = await customerApi.list({ status: 'active', pageSize: 100 } as any);
    setCustomers(res.list);
  };

  const fetchSuppliers = async () => {
    const res = await supplierApi.list({ status: 'active', pageSize: 100 } as any);
    setSuppliers(res.list);
  };

  const fetchAccounts = async () => {
    const res = await accountApi.listSimple();
    setAccounts(res);
  };

  const fetchData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await financeApi.listPayments({ ...query, tenantId } as any);
      setDataSource(res.list);
      setPagination(res.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [query, tenantId]);

  const handleAdd = () => {
    form.resetFields();
    fetchCustomers();
    fetchSuppliers();
    fetchAccounts();
    setModalVisible(true);
  };

  const handleAudit = async (id: string) => {
    await financeApi.auditPayment(id);
    message.success('审核成功');
    fetchData();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      const data = {
        ...values,
        paymentDate: values.paymentDate.format('YYYY-MM-DD'),
      };
      await financeApi.createPayment(data as any);
      setModalVisible(false);
      fetchData();
    } finally { setLoading(false); }
  };

  const columns = [
    { title: '单据编号', dataIndex: 'paymentNo', key: 'paymentNo', width: 150 },
    { title: '日期', dataIndex: 'paymentDate', key: 'paymentDate', width: 100, render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    { title: '类型', dataIndex: 'paymentType', key: 'paymentType', width: 80, render: (t: string) => <Tag {...typeMap[t]}>{typeMap[t]?.label || t}</Tag> },
    { title: '金额', dataIndex: 'amount', key: 'amount', width: 120, render: (v: unknown) => formatMoney(v) },
    { title: '账户', dataIndex: ['account', 'name'], key: 'account', width: 120 },
    { title: '对方', key: 'counterparty', width: 120, render: (_: any, r: Payment) => r.customer?.name || r.supplier?.name || '-' },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (s: string) => <Tag {...statusMap[s]}>{statusMap[s]?.label || s}</Tag> },
    {
      title: '操作', key: 'action', width: 100,
      render: (_: any, r: Payment) => (
        <Space size="small">
          {r.status === 'pending' && <Button type="link" size="small" onClick={() => handleAudit(r.id)}>审核</Button>}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input.Search placeholder="搜索单据编号" style={{ width: 200 }} onSearch={(v) => setQuery({ ...query, keyword: v })} />
          <Select placeholder="类型" allowClear style={{ width: 100 }} onChange={(v) => setQuery({ ...query, paymentType: v })}>
            {Object.entries(typeMap).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
          </Select>
          <Select placeholder="状态" allowClear style={{ width: 100 }} onChange={(v) => setQuery({ ...query, status: v })}>
            {Object.entries(statusMap).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
          </Select>
        </Space>
        <Table title={() => <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增收付款</Button>}
          columns={columns} dataSource={dataSource} rowKey="id" loading={loading}
          pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total,
            onChange: (p, ps) => setQuery({ ...query, page: p, pageSize: ps }) }} />
      </Card>

      <Modal title="新增收付款" open={modalVisible} onCancel={() => setModalVisible(false)}
        onOk={handleSubmit} confirmLoading={loading}>
        <Form form={form} layout="vertical">
          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="paymentType" label="类型" rules={[{ required: true }]} style={{ width: 100 }}>
              <Select>
                <Select.Option value="receipt">收款</Select.Option>
                <Select.Option value="payment">付款</Select.Option>
                <Select.Option value="other">其他</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="paymentDate" label="日期" rules={[{ required: true }]} style={{ width: 150 }}>
              <DatePicker />
            </Form.Item>
            <Form.Item name="amount" label="金额" rules={[{ required: true }]} style={{ width: 150 }}>
              <Input type="number" prefix="¥" />
            </Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="accountId" label="收款账户" rules={[{ required: true }]} style={{ width: 200 }}>
              <Select>
                {accounts.map(a => <Select.Option key={a.id} value={a.id}>{a.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="customerId" label="客户" style={{ width: 200 }}>
              <Select allowClear>
                {customers.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="supplierId" label="供应商" style={{ width: 200 }}>
              <Select allowClear>
                {suppliers.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
              </Select>
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export default PaymentList;
