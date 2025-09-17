# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

Saasfly 是一个企业级 Next.js SaaS 脚手架，使用 TurboRepo 构建为 monorepo。旨在通过现代工具和最佳实践快速构建完整的 SaaS 应用程序。

## 开发命令

### 核心开发
- `bun run dev` - 并行启动所有开发服务器
- `bun run dev:web` - 启动 Web 开发服务器（不包括 Stripe）
- `bun run build` - 构建所有包和应用程序
- `bun run clean` - 清理所有 node_modules 和构建产物
- `bun run gen` - 使用 Turbo 生成器创建新包

### 代码质量
- `bun run lint` - 在所有包上运行 ESLint
- `bun run lint:fix` - 自动修复 ESLint 问题
- `bun run format` - 运行 Prettier 进行代码格式化（检查模式）
- `bun run format:fix` - 运行 Prettier 自动修复
- `bun run typecheck` - 运行 TypeScript 类型检查

### 数据库操作
- `bun run db:push` - 推送数据库架构更改到开发数据库
- `cd ./packages/db/ && bun db:generate` - 在架构更改后生成 Prisma 客户端

### 包管理
- 使用 Bun 作为包管理器（`bun install` 而非 npm install）
- 通过 package.json 中的工作区管理依赖
- `bun run check-deps` - 检查跨包的依赖版本一致性

## 架构概述

### Monorepo 结构
- **apps/** - Next.js 应用程序（主 Web 应用、auth-proxy）
- **packages/** - 共享库（api、auth、db、ui、stripe、common）
- **tooling/** - 共享配置（eslint、prettier、tailwind、typescript）
- **turbo/generators/** - 用于创建新包的模板生成器

### 核心技术
- **Next.js 14.2.5** 使用 App Router
- **TurboRepo** 用于 monorepo 管理
- **TypeScript** 用于类型安全
- **Clerk** 用于身份验证（主要，自 2025 年 6 月起）
- **Prisma** 配合 PostgreSQL 数据库
- **tRPC** 用于类型安全的 API
- **Tailwind CSS** 用于样式
- **Stripe** 用于支付/订阅
- **Contentlayer2** 用于 MDX 内容管理
- **PostHog** 用于产品分析
- **Vercel Analytics** 用于性能监控
- **Nitro Pack** 用于 auth-proxy 边缘函数

### 数据库设置
- 使用 PostgreSQL 和 Prisma ORM
- 数据库架构在 `packages/db/prisma/schema.prisma`
- 环境变量在 `.env.local` 中（不提交）
- 使用 `bun run db:push` 在开发期间推送架构更改

### 身份验证
- Clerk 是主要身份验证提供商（自 2025 年 6 月起）
- NextAuth.js 作为备选方案
- 包含 GitHub OAuth 集成
- 身份验证逻辑在 `packages/auth/` 中
- 使用 Nitro Pack 的独立 auth-proxy 应用用于边缘函数

### API 结构
- tRPC 路由在 `packages/api/` 中
- 类型安全端点与 React Query 集成
- 服务器工具在 `packages/api/src/server/` 中

### UI 组件
- 共享组件在 `packages/ui/` 中
- 使用 shadcn/ui（Radix UI 基元）构建
- Tailwind CSS 用于样式
- Framer Motion 用于动画

### 内容管理
- **Contentlayer2** 用于 MDX 内容管理
- 内容类型：文档、指南、博客文章、作者、页面
- MDX 处理带语法高亮
- 内容在 Next.js 构建前自动构建

## 开发工作流程

### 进行更改
1. 包的更改在开发中自动热重载
2. 使用 `bun run build` 验证所有包正确编译
3. 提交前运行 `bun run lint` 和 `bun run typecheck`
4. 数据库更改需要更新 Prisma 架构并运行迁移

### 环境设置
- 复制 `.env.example` 到 `.env.local` 并填写所需值
- 必需：数据库 URL、Clerk 密钥、Stripe 密钥、Resend API 密钥
- 使用 `bun with-env` 运行带环境变量的命令
- 安装后自动运行依赖一致性检查

### 测试
- 当前未配置自动化测试框架
- 依赖 TypeScript 类型检查和 ESLint 保证代码质量
- 通过开发服务器进行手动测试

## 部署

### Vercel 部署
- 配置为 Vercel 部署
- 环境变量在 Vercel 仪表板中设置
- 主分支推送时自动构建
- 数据库迁移通过 Vercel Postgres 处理

### CI/CD
- GitHub Actions 工作流在 `.github/workflows/` 中
- 并行运行构建、lint、格式化和类型检查
- PostgreSQL 服务容器用于数据库集成
- 自动环境设置和依赖安装
- 增强缓存以加快构建速度

## 任务管理

### 任务清单
- 项目任务清单保存在 `docs/TASK_LIST.md`
- 包含3个阶段的开发任务：基础修复、核心功能开发、生产准备
- 每个任务都有明确的ID、描述、状态和验证要求

### 任务状态说明
- ✅ **已完成**: 任务代码已完成
- 🔄 **进行中**: 任务正在开发中
- ⏳ **待开始**: 任务尚未开始
- ⚠️ **需验证**: 已完成但需要验证功能
- ❌ **验证失败**: 功能验证不通过

### 手动更新流程
1. 完成任务后，手动更新 `docs/TASK_LIST.md` 中的状态
2. 验证任务后，更新验证状态从⚠️改为✅
3. 更新完成时间和验证时间
4. 添加备注说明任何问题或特殊情况

### 当前项目状态
- **AI Prompt生成SaaS平台**: 基于saasfly构建
- **核心功能**: 图片上传、AI模型选择、提示词生成
- **技术栈**: Next.js + tRPC + Supabase + Coze API
- **部署目标**: Vercel