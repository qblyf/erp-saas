# 云ERP - 零售批发版

## 项目结构

```
erp-saas/
├── apps/
│   ├── web/          # 前端 (React + Ant Design)
│   └── api/          # 后端 (NestJS + Prisma)
├── docker/           # Docker 配置
└── docs/             # 文档
```

## 快速开始

### 1. 环境要求

- Node.js 18+
- PostgreSQL 16+
- pnpm (推荐) 或 npm

### 2. 启动数据库

```bash
cd docker
docker-compose up -d
```

### 3. 初始化后端

```bash
cd apps/api
pnpm install
pnpm prisma generate
pnpm prisma migrate dev --name init
pnpm dev
```

### 4. 启动前端

```bash
cd apps/web
pnpm install
pnpm dev
```

### 5. 访问

- 前端: http://localhost:3000
- 后端 API: http://localhost:4000/api/v1

## 默认账号

- 用户名: admin
- 密码: admin123

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Ant Design 5 + Vite |
| 后端 | NestJS + Prisma + PostgreSQL |
| 认证 | JWT |
