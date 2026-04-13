import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Input, Select, Tag, Modal, Form, DatePicker, Table as AntTable } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { financeApi, Voucher, VoucherItem } from '@/api/finance';
import { useAuthStore } from '@/stores/auth';
import { message } from 'antd';
import { formatMoney } from '@/utils/format';

const statusMap: Record<string, { color: string; label: string }> = {
  draft: { color: 'default', label: '草稿' },
  audited: { color: 'blue', label: '已审核' },
  posted: { color: 'green', label: '已过账' },
};

const VoucherList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Voucher[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [items, setItems] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [query, setQuery] = useState<any>({});
  const tenantId = useAuthStore((s) => s.tenant?.id || '');

  const fetchSubjects = async () => {
    await financeApi.initSubjects();
    const res = await financeApi.listSubjects();
    setSubjects(res);
  };

  const flattenSubjects = (subs: any[], prefix = ''): any[] => {
    let result: any[] = [];
    for (const s of subs) {
      result.push({ ...s, label: prefix + s.code + ' ' + s.name });
      if (s.children?.length) {
        result = result.concat(flattenSubjects(s.children, prefix + '  '));
      }
    }
    return result;
  };

  const fetchData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await financeApi.listVouchers({ ...query, tenantId } as any);
      setDataSource(res.list);
      setPagination(res.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [query, tenantId]);

  const handleAdd = () => {
    form.resetFields();
    setItems([{ accountId: '', direction: 'debit', amount: 0, summary: '' }]);
    fetchSubjects();
    setModalVisible(true);
  };

  const handleAudit = async (id: string) => {
    await financeApi.auditVoucher(id);
    message.success('审核成功');
    fetchData();
  };

  const handlePost = async (id: string) => {
    await financeApi.postVoucher(id);
    message.success('过账成功');
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await financeApi.deleteVoucher(id);
    message.success('删除成功');
    fetchData();
  };

  const addItem = () => {
    setItems([...items, { accountId: '', direction: 'debit', amount: 0, summary: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      const data = {
        ...values,
        voucherDate: values.voucherDate.format('YYYY-MM-DD'),
        items,
      };
      await financeApi.createVoucher(data as any);
      setModalVisible(false);
      fetchData();
    } finally { setLoading(false); }
  };

  const flatSubjects = flattenSubjects(subjects);

  const columns = [
    { title: '凭证号', dataIndex: 'voucherNo', key: 'voucherNo', width: 120 },
    { title: '日期', dataIndex: 'voucherDate', key: 'voucherDate', width: 100, render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    { title: '凭证字', dataIndex: 'voucherType', key: 'voucherType', width: 60 },
    { title: '借方金额', dataIndex: 'totalDebit', key: 'totalDebit', width: 120, render: (v: unknown) => formatMoney(v) },
    { title: '贷方金额', dataIndex: 'totalCredit', key: 'totalCredit', width: 120, render: (v: unknown) => formatMoney(v) },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (s: string) => <Tag {...statusMap[s]}>{statusMap[s]?.label || s}</Tag> },
    {
      title: '操作', key: 'action', width: 150,
      render: (_: any, r: Voucher) => (
        <Space size="small">
          {r.status === 'draft' && <>
            <Button type="link" size="small" onClick={() => handleAudit(r.id)}>审核</Button>
            <Button type="link" size="small" danger onClick={() => handleDelete(r.id)}>删除</Button>
          </>}
          {r.status === 'audited' && <Button type="link" size="small" onClick={() => handlePost(r.id)}>过账</Button>}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input.Search placeholder="搜索凭证号/摘要" style={{ width: 200 }} onSearch={(v) => setQuery({ ...query, keyword: v })} />
          <Select placeholder="状态" allowClear style={{ width: 100 }} onChange={(v) => setQuery({ ...query, status: v })}>
            {Object.entries(statusMap).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
          </Select>
        </Space>
        <Table title={() => <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增凭证</Button>}
          columns={columns} dataSource={dataSource} rowKey="id" loading={loading}
          pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total,
            onChange: (p, ps) => setQuery({ ...query, page: p, pageSize: ps }) }} />
      </Card>

      <Modal title="新增凭证" open={modalVisible} onCancel={() => setModalVisible(false)}
        onOk={handleSubmit} confirmLoading={loading} width={700}>
        <Form form={form} layout="vertical">
          <Space style={{ display: 'flex' }} align="start" size="large">
            <Form.Item name="voucherType" label="凭证字" initialValue="记" style={{ width: 80 }}>
              <Select options={[{ label: '记', value: '记' }, { label: '收', value: '收' }, { label: '付', value: '付' }]} />
            </Form.Item>
            <Form.Item name="voucherDate" label="凭证日期" rules={[{ required: true }]} style={{ width: 150 }}>
              <DatePicker />
            </Form.Item>
          </Space>

          <div style={{ marginBottom: 8 }}>
            <Button type="dashed" onClick={addItem}>+ 添加分录</Button>
          </div>
          <AntTable
            dataSource={items.map((item, i) => ({ ...item, key: i }))}
            columns={[
              { title: '科目', width: 200, render: (_: any, __: any, i: number) => (
                <Select style={{ width: '100%' }} value={items[i]?.accountId} onChange={(v) => updateItem(i, 'accountId', v)}>
                  {flatSubjects.map(s => <Select.Option key={s.id} value={s.id}>{s.label}</Select.Option>)}
                </Select>
              )},
              { title: '方向', width: 80, render: (_: any, __: any, i: number) => (
                <Select value={items[i]?.direction} onChange={(v) => updateItem(i, 'direction', v)}>
                  <Select.Option value="debit">借</Select.Option>
                  <Select.Option value="credit">贷</Select.Option>
                </Select>
              )},
              { title: '金额', width: 120, render: (_: any, __: any, i: number) => (
                <Input type="number" value={items[i]?.amount} onChange={(e) => updateItem(i, 'amount', e.target.value)} />
              )},
              { title: '摘要', render: (_: any, __: any, i: number) => (
                <Input value={items[i]?.summary} onChange={(e) => updateItem(i, 'summary', e.target.value)} />
              )},
              { title: '', width: 50, render: (_: any, __: any, i: number) => (
                <Button type="link" danger size="small" onClick={() => removeItem(i)}>删除</Button>
              )},
            ]}
            pagination={false}
            size="small"
          />
        </Form>
      </Modal>
    </>
  );
};

export default VoucherList;
