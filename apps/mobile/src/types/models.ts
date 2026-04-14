// ERP System Type Definitions

export interface Tenant {
  id: string;
  name: string;
  code: string;
  status: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  realName?: string;
  phone?: string;
  email?: string;
  status: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Store {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  manager?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  address?: string;
  principal?: string;
  sortOrder: number;
  status: string;
  storeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  tenantId: string;
  categoryId?: string;
  code: string;
  name: string;
  spec?: string;
  unit?: string;
  purchasePrice?: number;
  salePrice?: number;
  costPrice?: number;
  minStock: number;
  maxStock: number;
  status: string;
  imageUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  contact?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  customerType?: string;
  creditLimit?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  contact?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  bankName?: string;
  bankAccount?: string;
  taxNo?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type?: string;
  bankName?: string;
  bankAccount?: string;
  initialBalance: number;
  currentBalance: number;
  status: string;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Order related types
export interface SaleOrder {
  id: string;
  tenantId: string;
  orderNo: string;
  orderDate: string;
  customerId: string;
  warehouseId: string;
  storeId?: string;
  contact?: string;
  phone?: string;
  totalAmount: number;
  receivedAmount: number;
  status: string;
  deliveryDate?: string;
  remark?: string;
  createdById?: string;
  auditedById?: string;
  auditedAt?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  warehouse?: Warehouse;
  items?: SaleOrderItem[];
}

export interface SaleOrderItem {
  id: string;
  tenantId: string;
  orderId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  price: number;
  amount: number;
  deliveredQty: number;
  taxRate: number;
  taxAmount: number;
  remark?: string;
  product?: Product;
}

export interface PurchaseOrder {
  id: string;
  tenantId: string;
  orderNo: string;
  orderDate: string;
  supplierId: string;
  warehouseId: string;
  storeId?: string;
  contact?: string;
  phone?: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  deliveryDate?: string;
  remark?: string;
  createdById?: string;
  auditedById?: string;
  auditedAt?: string;
  createdAt: string;
  updatedAt: string;
  supplier?: Supplier;
  warehouse?: Warehouse;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  tenantId: string;
  orderId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  price: number;
  amount: number;
  receivedQty: number;
  taxRate: number;
  taxAmount: number;
  remark?: string;
  product?: Product;
}

// Stock In/Out
export interface PurchaseStockIn {
  id: string;
  tenantId: string;
  orderNo: string;
  stockInDate: string;
  supplierId: string;
  warehouseId: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  remark?: string;
  createdById?: string;
  auditedById?: string;
  auditedAt?: string;
  createdAt: string;
  updatedAt: string;
  supplier?: Supplier;
  warehouse?: Warehouse;
  items?: PurchaseStockInItem[];
}

export interface PurchaseStockInItem {
  id: string;
  tenantId: string;
  stockInId: string;
  productId: string;
  purchaseOrderId?: string;
  purchaseOrderItemId?: string;
  quantity: number;
  price: number;
  amount: number;
  product?: Product;
}

export interface SaleStockOut {
  id: string;
  tenantId: string;
  orderNo: string;
  stockOutDate: string;
  customerId: string;
  warehouseId: string;
  totalAmount: number;
  receivedAmount: number;
  status: string;
  remark?: string;
  createdById?: string;
  auditedById?: string;
  auditedAt?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  warehouse?: Warehouse;
  items?: SaleStockOutItem[];
}

export interface SaleStockOutItem {
  id: string;
  tenantId: string;
  stockOutId: string;
  productId: string;
  saleOrderId?: string;
  saleOrderItemId?: string;
  quantity: number;
  price: number;
  amount: number;
  product?: Product;
}

// Inventory
export interface Inventory {
  id: string;
  tenantId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  frozenQuantity: number;
  avgCostPrice: number;
  lastInPrice?: number;
  lastOutPrice?: number;
  updatedAt: string;
  product?: Product;
  warehouse?: Warehouse;
}

export interface StockCheck {
  id: string;
  tenantId: string;
  orderNo: string;
  checkDate: string;
  warehouseId: string;
  totalAmount: number;
  status: string;
  remark?: string;
  createdById?: string;
  auditedById?: string;
  auditedAt?: string;
  createdAt: string;
  updatedAt: string;
  warehouse?: Warehouse;
  items?: StockCheckItem[];
}

export interface StockCheckItem {
  id: string;
  tenantId: string;
  checkId: string;
  productId: string;
  bookQuantity: number;
  checkQuantity: number;
  diffQuantity: number;
  costPrice?: number;
  diffAmount?: number;
  reason?: string;
  product?: Product;
}

export interface StockTransfer {
  id: string;
  tenantId: string;
  orderNo: string;
  transferDate: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  totalAmount: number;
  status: string;
  remark?: string;
  createdById?: string;
  auditedById?: string;
  auditedAt?: string;
  createdAt: string;
  updatedAt: string;
  fromWarehouse?: Warehouse;
  toWarehouse?: Warehouse;
  items?: StockTransferItem[];
}

export interface StockTransferItem {
  id: string;
  tenantId: string;
  transferId: string;
  productId: string;
  quantity: number;
  costPrice?: number;
  amount?: number;
  product?: Product;
}

// Finance
export interface Payment {
  id: string;
  tenantId: string;
  paymentNo: string;
  paymentDate: string;
  paymentType: string;
  amount: number;
  accountId: string;
  customerId?: string;
  supplierId?: string;
  relateBusinessType?: string;
  relateBusinessId?: string;
  relateBusinessNo?: string;
  status: string;
  remark?: string;
  createdById?: string;
  auditedById?: string;
  auditedAt?: string;
  createdAt: string;
  updatedAt: string;
  account?: Account;
  customer?: Customer;
  supplier?: Supplier;
}

export interface Voucher {
  id: string;
  tenantId: string;
  voucherNo: string;
  voucherDate: string;
  voucherType: string;
  totalDebit: number;
  totalCredit: number;
  attachmentCount: number;
  status: string;
  remark?: string;
  createdById?: string;
  auditedById?: string;
  postedById?: string;
  auditedAt?: string;
  postedAt?: string;
  createdAt: string;
  updatedAt: string;
  items?: VoucherItem[];
}

export interface VoucherItem {
  id: string;
  tenantId: string;
  voucherId: string;
  accountId: string;
  direction: string;
  amount: number;
  summary?: string;
  account?: Account;
}

// Dashboard
export interface DashboardStats {
  todaySale: number;
  todayPurchase: number;
  todayReceived: number;
  todayPaid: number;
  pendingSaleOrders: number;
  pendingPurchaseOrders: number;
  pendingStockChecks: number;
  lowStockProducts: number;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
