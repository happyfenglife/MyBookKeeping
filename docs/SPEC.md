# 网页记账系统 · 需求规格（v1）

> 本文是需求拷问（10 题）的结论汇总，作为开发的唯一依据。
> 确认后即按此实现；任何改动请先改本文。

## 1. 定位

- **实际用途**：自用工具（单用户），解决"记下每天花了什么、还剩多少"。
- **代码结构**：按可扩展多用户设计（所有业务表预留 `user_id`），但 v1 不做登录认证。
- **部署形态**：本机运行（A）起步；局域网访问（B）作为低成本增强；公网部署（C）延后。

## 2. 核心概念

| 概念 | 说明 |
|---|---|
| 账户 | 现金 / 银行卡 / 信用卡等，记录其当前余额 |
| 分类 | 用户自定义，与账户独立；收入与支出分类分开 |
| 记录 | 三种类型：`EXPENSE`（支出）、`INCOME`（收入）、`TRANSFER`（转账） |
| 转账 | 一条记录含 `from_account → to_account`，**不计入收入，也不计入支出** |

记账方式：**流水账 + 账户维度**（非复式记账）。
币种：**仅人民币（CNY）**，金额以「分」为单位存整数，不做汇率折算。

## 3. 数据模型

### users（v1 仅一条默认用户，为 v2 多用户预留）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | PK | |
| name | text | |
| created_at | datetime | |

### accounts

| 字段 | 类型 | 说明 |
|---|---|---|
| id | PK | |
| user_id | FK → users.id | |
| name | text | 如「招行卡」 |
| type | enum | `CASH` / `DEBIT` / `CREDIT` / `OTHER` |
| initial_balance | integer | 初始余额（分） |
| archived | boolean | 归档而非删除，避免历史记录悬空 |
| created_at | datetime | |

> 当前余额 = `initial_balance` + 该账户相关的收入 − 支出 ± 转账方向金额。由查询实时计算，不冗余存储。

### categories

| 字段 | 类型 | 说明 |
|---|---|---|
| id | PK | |
| user_id | FK → users.id | |
| name | text | |
| kind | enum | `INCOME` / `EXPENSE` |
| parent_id | FK → categories.id, nullable | v1 不用，为二层分类预留 |
| archived | boolean | |
| created_at | datetime | |

### transactions

| 字段 | 类型 | 说明 |
|---|---|---|
| id | PK | |
| user_id | FK → users.id | |
| type | enum | `EXPENSE` / `INCOME` / `TRANSFER` |
| amount | integer | 正数，单位「分」 |
| date | date | 发生日期（用户可改，非创建时间） |
| category_id | FK → categories.id, nullable | `TRANSFER` 时为空 |
| account_id | FK → accounts.id, nullable | `EXPENSE`/`INCOME` 的所属账户 |
| from_account_id | FK → accounts.id, nullable | 仅 `TRANSFER` |
| to_account_id | FK → accounts.id, nullable | 仅 `TRANSFER` |
| note | text, nullable | |
| created_at | datetime | |
| updated_at | datetime | |

**约束（应用层校验）**
- `EXPENSE`/`INCOME`：`category_id` 与 `account_id` 必填，转账字段为空。
- `TRANSFER`：`from_account_id`、`to_account_id` 必填且不相等，`category_id` 为空。
- `amount > 0`；方向由 `type` 与账户字段决定。
- 分类的 `kind` 必须与记录 `type` 匹配。

**索引**：`transactions(user_id, date desc)`；`transactions(account_id)`；`transactions(category_id)`。

## 4. 技术选型

| 层 | 选型 |
|---|---|
| 框架 | Next.js（App Router）+ TypeScript，单仓库含前后端 |
| ORM | Prisma |
| 数据库 | SQLite（文件型）；日后切 Postgres 仅改连接串与 provider |
| 样式 | Tailwind CSS |
| 图表 | Recharts（或同类轻量库） |
| 校验 | Zod（API 入参边界校验） |
| 导出 | CSV（服务端生成，UTF-8 带 BOM 防 Excel 中文乱码） |

明确排除：纯前端 + localStorage 的零后端方案（数据易失、余额/转账难做）。

## 5. v1 范围（P0 + P1）

### P0 — 最小可用闭环
1. 记一笔：支出 / 收入 / 转账；字段含账户、分类、金额、日期、备注
2. 流水列表：按日期倒序、分页、可编辑、可删除
3. 账户管理：增删改、归档、显示各账户当前余额
4. 分类管理：增删改、归档，收入与支出分类分开
5. CSV 导出

### P1 — 让它有用
6. 月度统计：本月收入 / 支出 / 结余
7. 分类占比：本月各分类金额及占比（图表）
8. 账户余额总览（净资产）

### 验收标准
能连续一周用它记账，并在月底看到一张说得清的月报。

## 6. v2 待办（v1 明确不做）

- 预算：分类月度上限 + 使用进度
- 周期账单：房租/订阅自动生成
- CSV 导入：针对实际使用的平台做定点适配（含去重）
- 多用户登录与权限
- 公网部署（认证 + HTTPS + 备份）
- 移动端交互优化

## 7. 默认约定（未特别指定，按此执行）

- 时区：Asia/Shanghai；日期存本地日期，不入库时区偏移。
- 金额：一律整数「分」，仅展示层转元。
- 删除策略：账户 / 分类用归档，记录用硬删除（带二次确认）。
- 初始数据：首次启动写入默认用户 + 几个常用账户/分类作为种子数据。