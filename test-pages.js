const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3000';

const pages = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: '采购订单', path: '/purchase/orders' },
  { name: '采购入库', path: '/purchase/stock-ins' },
  { name: '采购退货', path: '/purchase/returns' },
  { name: '销售订单', path: '/sale/orders' },
  { name: '销售出库', path: '/sale/stock-outs' },
  { name: '销售退货', path: '/sale/returns' },
  { name: '库存查询', path: '/inventory/list' },
  { name: '库存盘点', path: '/inventory/check' },
  { name: '库存调拨', path: '/inventory/transfer' },
  { name: '库存预警', path: '/inventory/warning' },
  { name: '店间调拨', path: '/store/transfer' },
  { name: '凭证管理', path: '/finance/vouchers' },
  { name: '收付款', path: '/finance/payments' },
  { name: '销售报表', path: '/reports/sale' },
  { name: '采购报表', path: '/reports/purchase' },
  { name: '库存报表', path: '/reports/inventory' },
  { name: '仓库管理', path: '/settings/basic/warehouse' },
  { name: '商品管理', path: '/settings/basic/product' },
  { name: '商品分类', path: '/settings/basic/category' },
  { name: '客户管理', path: '/settings/basic/customer' },
  { name: '供应商管理', path: '/settings/basic/supplier' },
  { name: '账户管理', path: '/settings/basic/account' },
  { name: '用户管理', path: '/settings/users' },
  { name: '角色管理', path: '/settings/roles' },
];

async function testPages() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];

  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`[${msg.location().url}] ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    errors.push(`Page Error: ${err.message}`);
  });

  try {
    // Login
    console.log('🔐 Logging in...');
    await page.goto(BASE_URL);
    await page.waitForSelector('input[placeholder*="用户名"]', { timeout: 10000 });
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✅ Login successful\n');

    // Test each page
    for (const p of pages) {
      try {
        console.log(`Testing: ${p.name} (${p.path})...`);
        await page.goto(BASE_URL + p.path, { waitUntil: 'networkidle', timeout: 15000 });

        // Wait for content to load
        await page.waitForTimeout(1000);

        // Check if page has content (not blank)
        const bodyText = await page.textContent('body');
        if (bodyText && bodyText.length > 50) {
          console.log(`  ✅ ${p.name} - loaded successfully`);
        } else {
          console.log(`  ⚠️  ${p.name} - might be empty`);
        }
      } catch (err) {
        console.log(`  ❌ ${p.name} - FAILED: ${err.message}`);
      }
    }

    console.log('\n--- Console Errors ---');
    if (errors.length === 0) {
      console.log('No console errors detected!');
    } else {
      errors.forEach(e => console.log(`❌ ${e}`));
    }

  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
}

testPages();
