import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WarehouseList from './pages/settings/WarehouseList';
import ProductList from './pages/settings/ProductList';
import CategoryManage from './pages/settings/CategoryManage';
import CustomerList from './pages/settings/CustomerList';
import SupplierList from './pages/settings/SupplierList';
import AccountList from './pages/settings/AccountList';
import UserList from './pages/settings/users/UserList';
import RoleList from './pages/settings/roles/RoleList';
import PurchaseOrderList from './pages/purchase/PurchaseOrderList';
import PurchaseStockInList from './pages/purchase/PurchaseStockInList';
import PurchaseReturnList from './pages/purchase/PurchaseReturnList';
import SaleOrderList from './pages/sale/SaleOrderList';
import SaleStockOutList from './pages/sale/SaleStockOutList';
import SaleReturnList from './pages/sale/SaleReturnList';
import InventoryList from './pages/inventory/InventoryList';
import StockCheckList from './pages/inventory/StockCheckList';
import StockTransferList from './pages/inventory/StockTransferList';
import InventoryWarning from './pages/inventory/InventoryWarning';
import StoreList from './pages/store/StoreList';
import StoreTransfer from './pages/store/StoreTransfer';
import VoucherList from './pages/finance/VoucherList';
import PaymentList from './pages/finance/PaymentList';
import SaleReport from './pages/reports/SaleReport';
import PurchaseReport from './pages/reports/PurchaseReport';
import InventoryReport from './pages/reports/InventoryReport';

function App() {
  const { token } = useAuthStore();

  if (!token) {
    return <Login />;
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 采购管理 */}
        <Route path="/purchase/orders" element={<PurchaseOrderList />} />
        <Route path="/purchase/stock-ins" element={<PurchaseStockInList />} />
        <Route path="/purchase/returns" element={<PurchaseReturnList />} />

        {/* 销售管理 */}
        <Route path="/sale/orders" element={<SaleOrderList />} />
        <Route path="/sale/stock-outs" element={<SaleStockOutList />} />
        <Route path="/sale/returns" element={<SaleReturnList />} />

        {/* 库存管理 */}
        <Route path="/inventory/list" element={<InventoryList />} />
        <Route path="/inventory/check" element={<StockCheckList />} />
        <Route path="/inventory/transfer" element={<StockTransferList />} />
        <Route path="/inventory/warning" element={<InventoryWarning />} />
        <Route path="/store/list" element={<StoreList />} />
        <Route path="/store/transfer" element={<StoreTransfer />} />

        {/* 财务管理 */}
        <Route path="/finance/vouchers" element={<VoucherList />} />
        <Route path="/finance/payments" element={<PaymentList />} />

        {/* 报表中心 */}
        <Route path="/reports/sale" element={<SaleReport />} />
        <Route path="/reports/purchase" element={<PurchaseReport />} />
        <Route path="/reports/inventory" element={<InventoryReport />} />

        {/* 基础资料 */}
        <Route path="/settings/basic/warehouse" element={<WarehouseList />} />
        <Route path="/settings/basic/product" element={<ProductList />} />
        <Route path="/settings/basic/category" element={<CategoryManage />} />
        <Route path="/settings/basic/customer" element={<CustomerList />} />
        <Route path="/settings/basic/supplier" element={<SupplierList />} />
        <Route path="/settings/basic/account" element={<AccountList />} />
        <Route path="/settings/users" element={<UserList />} />
        <Route path="/settings/roles" element={<RoleList />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
