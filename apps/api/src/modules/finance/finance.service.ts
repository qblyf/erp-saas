import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVoucherDto, UpdateVoucherDto, VoucherQueryDto,
  CreatePaymentDto, PaymentQueryDto,
  CreateAccountSubjectDto, AccountSubjectQueryDto } from './dto/finance.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // ========== 会计科目 ==========
  async findSubjects(tenantId: string, query: AccountSubjectQueryDto) {
    const { keyword, type } = query;

    const where: any = { tenantId };
    if (keyword) {
      where.OR = [
        { code: { contains: keyword } },
        { name: { contains: keyword } },
      ];
    }
    if (type) where.type = type;

    const subjects = await this.prisma.accountSubject.findMany({
      where,
      orderBy: { code: 'asc' },
    });

    return this.buildTree(subjects);
  }

  private buildTree(subjects: any[]) {
    const map = new Map<string, any>();
    const roots: any[] = [];

    subjects.forEach(s => map.set(s.id, { ...s, children: [] }));
    subjects.forEach(s => {
      const node = map.get(s.id);
      if (s.parentId && map.has(s.parentId)) {
        map.get(s.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  async createSubject(tenantId: string, dto: CreateAccountSubjectDto) {
    return this.prisma.accountSubject.create({
      data: { tenantId, ...dto },
    });
  }

  async initDefaultSubjects(tenantId: string) {
    const existing = await this.prisma.accountSubject.count({ where: { tenantId } });
    if (existing > 0) return;

    const defaults = [
      { code: '1001', name: '库存商品', type: 'asset', direction: '借' },
      { code: '1002', name: '应收账款', type: 'asset', direction: '借' },
      { code: '1003', name: '其他应收款', type: 'asset', direction: '借' },
      { code: '2001', name: '应付账款', type: 'liability', direction: '贷' },
      { code: '2002', name: '其他应付款', type: 'liability', direction: '贷' },
      { code: '4001', name: '主营业务收入', type: 'revenue', direction: '贷' },
      { code: '5001', name: '主营业务成本', type: 'expense', direction: '借' },
      { code: '1004', name: '银行存款', type: 'asset', direction: '借' },
      { code: '1005', name: '库存现金', type: 'asset', direction: '借' },
    ];

    for (const d of defaults) {
      await this.prisma.accountSubject.create({ data: { tenantId, ...d } });
    }
  }

  // ========== 凭证管理 ==========
  async createVoucher(tenantId: string, dto: CreateVoucherDto) {
    const totalDebit = dto.items.filter(i => i.direction === 'debit').reduce((s, i) => s + i.amount, 0);
    const totalCredit = dto.items.filter(i => i.direction === 'credit').reduce((s, i) => s + i.amount, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException('借贷不平衡');
    }

    return this.prisma.$transaction(async (tx) => {
      const voucher = await tx.voucher.create({
        data: {
          tenantId,
          voucherNo: `VZ${Date.now()}`,
          voucherDate: new Date(dto.voucherDate),
          voucherType: dto.voucherType || '记',
          totalDebit,
          totalCredit,
          remark: dto.remark,
          items: {
            create: dto.items.map(item => ({
              tenantId,
              accountId: item.accountId,
              direction: item.direction,
              amount: item.amount,
              summary: item.summary,
            })),
          },
        },
        include: { items: { include: { account: true } } },
      });

      return voucher;
    });
  }

  async findVouchers(tenantId: string, query: VoucherQueryDto) {
    const { keyword, status, startDate, endDate, page = 1, pageSize = 20 } = query;

    const where: any = { tenantId };
    if (keyword) where.OR = [{ voucherNo: { contains: keyword } }, { remark: { contains: keyword } }];
    if (status) where.status = status;
    if (startDate || endDate) {
      where.voucherDate = {};
      if (startDate) where.voucherDate.gte = new Date(startDate);
      if (endDate) where.voucherDate.lte = new Date(endDate);
    }

    const [list, total] = await Promise.all([
      this.prisma.voucher.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { voucherDate: 'desc' },
      }),
      this.prisma.voucher.count({ where }),
    ]);

    return { list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async findVoucherById(tenantId: string, id: string) {
    return this.prisma.voucher.findFirst({
      where: { id, tenantId },
      include: { items: { include: { account: true } } },
    });
  }

  async auditVoucher(tenantId: string, id: string, userId: string) {
    const voucher = await this.prisma.voucher.findFirst({ where: { id, tenantId } });
    if (!voucher) throw new BadRequestException('凭证不存在');
    if (voucher.status !== 'draft') throw new BadRequestException('只能审核草稿状态的凭证');

    return this.prisma.voucher.update({
      where: { id },
      data: { status: 'audited', auditedById: userId, auditedAt: new Date() },
    });
  }

  async postVoucher(tenantId: string, id: string, userId: string) {
    const voucher = await this.prisma.voucher.findFirst({ where: { id, tenantId } });
    if (!voucher) throw new BadRequestException('凭证不存在');
    if (voucher.status !== 'audited') throw new BadRequestException('只能过账已审核的凭证');

    return this.prisma.voucher.update({
      where: { id },
      data: { status: 'posted', postedById: userId, postedAt: new Date() },
    });
  }

  async deleteVoucher(tenantId: string, id: string) {
    const voucher = await this.prisma.voucher.findFirst({ where: { id, tenantId } });
    if (!voucher) throw new BadRequestException('凭证不存在');
    if (voucher.status !== 'draft') throw new BadRequestException('只能删除草稿状态的凭证');

    await this.prisma.voucherItem.deleteMany({ where: { voucherId: id } });
    await this.prisma.voucher.delete({ where: { id } });
  }

  // ========== 收付款 ==========
  async createPayment(tenantId: string, dto: CreatePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          tenantId,
          paymentNo: `PAY${Date.now()}`,
          paymentDate: new Date(dto.paymentDate),
          paymentType: dto.paymentType,
          amount: dto.amount,
          accountId: dto.accountId,
          customerId: dto.customerId,
          supplierId: dto.supplierId,
          relateBusinessType: dto.relateBusinessType,
          relateBusinessId: dto.relateBusinessId,
          relateBusinessNo: dto.relateBusinessNo,
          remark: dto.remark,
        },
      });

      // 更新账户余额
      const account = await tx.account.findFirst({ where: { id: dto.accountId } });
      if (account) {
        const balanceChange = dto.paymentType === 'receipt' ? dto.amount : -dto.amount;
        await tx.account.update({
          where: { id: dto.accountId },
          data: { currentBalance: { increment: balanceChange } },
        });
      }

      return payment;
    });
  }

  async findPayments(tenantId: string, query: PaymentQueryDto) {
    const { keyword, paymentType, accountId, customerId, supplierId, status, page = 1, pageSize = 20 } = query;

    const where: any = { tenantId };
    if (keyword) where.OR = [{ paymentNo: { contains: keyword } }];
    if (paymentType) where.paymentType = paymentType;
    if (accountId) where.accountId = accountId;
    if (customerId) where.customerId = customerId;
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;

    const [list, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: { account: true, customer: true, supplier: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { paymentDate: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async auditPayment(tenantId: string, id: string, userId: string) {
    const payment = await this.prisma.payment.findFirst({ where: { id, tenantId } });
    if (!payment) throw new BadRequestException('收付款单不存在');
    if (payment.status !== 'pending') throw new BadRequestException('只能审核待审核单据');

    return this.prisma.payment.update({
      where: { id },
      data: { status: 'approved', auditedById: userId, auditedAt: new Date() },
    });
  }

  // ========== 财务报表 ==========
  async getProfitStatement(tenantId: string, startDate: string, endDate: string) {
    // 简化实现
    const revenues = await this.prisma.voucherItem.aggregate({
      where: {
        tenantId,
        direction: 'credit',
        voucher: {
          voucherDate: { gte: new Date(startDate), lte: new Date(endDate) },
          status: 'posted',
        },
      },
      _sum: { amount: true },
    });

    const expenses = await this.prisma.voucherItem.aggregate({
      where: {
        tenantId,
        direction: 'debit',
        voucher: {
          voucherDate: { gte: new Date(startDate), lte: new Date(endDate) },
          status: 'posted',
        },
      },
      _sum: { amount: true },
    });

    return {
      title: '利润表',
      period: `${startDate} ~ ${endDate}`,
      items: [
        { name: '营业收入', current: Number(revenues._sum.amount || 0), previous: 0 },
        { name: '减:营业成本', current: Number(expenses._sum.amount || 0), previous: 0 },
        { name: '营业利润', current: Number(revenues._sum.amount || 0) - Number(expenses._sum.amount || 0), previous: 0 },
      ],
    };
  }
}
