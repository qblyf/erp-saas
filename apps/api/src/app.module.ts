import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { ProductCategoryModule } from './modules/product-category/product-category.module';
import { ProductModule } from './modules/product/product.module';
import { CustomerModule } from './modules/customer/customer.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { AccountModule } from './modules/account/account.module';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { SaleModule } from './modules/sale/sale.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { FinanceModule } from './modules/finance/finance.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { ReportModule } from './modules/report/report.module';
import { StoreModule } from './modules/store/store.module';
import { StoreTransferModule } from './modules/store-transfer/store-transfer.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    AuthModule,
    WarehouseModule,
    ProductCategoryModule,
    ProductModule,
    CustomerModule,
    SupplierModule,
    AccountModule,
    PurchaseModule,
    SaleModule,
    InventoryModule,
    FinanceModule,
    UserModule,
    RoleModule,
    ReportModule,
    StoreModule,
    StoreTransferModule,
  ],
})
export class AppModule {}
