import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 检查是否已有数据
  const existingTenant = await prisma.tenant.findFirst();
  if (existingTenant) {
    console.log('Data already exists, skipping seed.');
    return;
  }

  // 创建租户
  const tenant = await prisma.tenant.create({
    data: {
      name: '演示公司',
      code: 'DEMO',
      status: 'active',
    },
  });
  console.log('Created tenant:', tenant.name);

  // 创建管理员用户 (密码: admin123)
  const passwordHash = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      username: 'admin',
      passwordHash,
      realName: '系统管理员',
      status: 'active',
    },
  });
  console.log('Created user:', user.username);

  // 创建仓库
  await prisma.warehouse.createMany({
    data: [
      { tenantId: tenant.id, code: 'WH001', name: '主仓库', address: '地址待填写', principal: '仓库管理员', status: 'active', sortOrder: 1 },
      { tenantId: tenant.id, code: 'WH002', name: '分销仓库', address: '地址待填写', principal: '仓库管理员', status: 'active', sortOrder: 2 },
    ],
  });
  console.log('Created warehouses');

  // 创建商品分类
  const cat1 = await prisma.productCategory.create({
    data: { tenantId: tenant.id, name: '服装', sortOrder: 1 },
  });
  const cat2 = await prisma.productCategory.create({
    data: { tenantId: tenant.id, name: '鞋帽', sortOrder: 2 },
  });
  console.log('Created categories');

  // 创建商品
  await prisma.product.createMany({
    data: [
      { tenantId: tenant.id, categoryId: cat1.id, code: 'P001', name: 'T恤', spec: '红色/M', unit: '件', purchasePrice: 25, salePrice: 45, status: 'active' },
      { tenantId: tenant.id, categoryId: cat1.id, code: 'P002', name: 'T恤', spec: '蓝色/L', unit: '件', purchasePrice: 28, salePrice: 50, status: 'active' },
      { tenantId: tenant.id, categoryId: cat1.id, code: 'P003', name: '牛仔裤', spec: '32码', unit: '条', purchasePrice: 80, salePrice: 150, status: 'active' },
      { tenantId: tenant.id, categoryId: cat2.id, code: 'P004', name: '运动鞋', spec: '白色/42', unit: '双', purchasePrice: 120, salePrice: 220, status: 'active' },
      { tenantId: tenant.id, categoryId: cat2.id, code: 'P005', name: '帽子', spec: '均码', unit: '个', purchasePrice: 15, salePrice: 35, status: 'active' },
    ],
  });
  console.log('Created products');

  // 创建客户
  await prisma.customer.createMany({
    data: [
      { tenantId: tenant.id, code: 'C001', name: '客户A', contact: '张三', phone: '13800138001', customerType: 'wholesale', status: 'active' },
      { tenantId: tenant.id, code: 'C002', name: '客户B', contact: '李四', phone: '13800138002', customerType: 'retail', status: 'active' },
      { tenantId: tenant.id, code: 'C003', name: '客户C', contact: '王五', phone: '13800138003', customerType: 'wholesale', status: 'active' },
    ],
  });
  console.log('Created customers');

  // 创建供应商
  await prisma.supplier.createMany({
    data: [
      { tenantId: tenant.id, code: 'S001', name: '供应商A', contact: '赵六', phone: '13900139001', status: 'active' },
      { tenantId: tenant.id, code: 'S002', name: '供应商B', contact: '钱七', phone: '13900139002', status: 'active' },
    ],
  });
  console.log('Created suppliers');

  // 创建账户
  await prisma.account.createMany({
    data: [
      { tenantId: tenant.id, code: 'A001', name: '银行账户', type: 'bank', bankName: '工商银行', bankAccount: '6222021234567890', initialBalance: 100000, currentBalance: 100000, isDefault: true, status: 'active', sortOrder: 1 },
      { tenantId: tenant.id, code: 'A002', name: '现金', type: 'cash', initialBalance: 5000, currentBalance: 5000, isDefault: false, status: 'active', sortOrder: 2 },
    ],
  });
  console.log('Created accounts');

  // 创建会计科目
  await prisma.accountSubject.createMany({
    data: [
      { tenantId: tenant.id, code: '1001', name: '库存商品', type: 'asset', direction: '借' },
      { tenantId: tenant.id, code: '1002', name: '应收账款', type: 'asset', direction: '借' },
      { tenantId: tenant.id, code: '1004', name: '银行存款', type: 'asset', direction: '借' },
      { tenantId: tenant.id, code: '1005', name: '库存现金', type: 'asset', direction: '借' },
      { tenantId: tenant.id, code: '2001', name: '应付账款', type: 'liability', direction: '贷' },
      { tenantId: tenant.id, code: '4001', name: '主营业务收入', type: 'revenue', direction: '贷' },
      { tenantId: tenant.id, code: '5001', name: '主营业务成本', type: 'expense', direction: '借' },
    ],
  });
  console.log('Created account subjects');

  console.log('Seed completed!');
  console.log('Login credentials: admin / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
