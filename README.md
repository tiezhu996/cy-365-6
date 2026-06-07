# 企业福利积分商城系统

面向企业HR部门，提供员工福利积分发放、积分商城兑换和福利账单管理的一站式平台。

## Docker Compose 快速启动

首次启动前复制环境变量文件：

```bash
cp .env.example .env
docker compose up -d
```

访问地址：

- 前端：http://localhost:28505
- 后端健康检查：http://localhost:29505/health
- API 示例：http://localhost:28505/api/overview

## 项目主要功能

- 积分发放规则配置：HR配置积分获取规则，如考勤全勤、绩效优秀、入职周年、节日福利等，系统自动计算并发放积分到员工账户。
- 积分商城商品上架：管理员上架可兑换商品（实物/虚拟卡券/服务），设置所需积分、库存数量和兑换限制（如每人限兑数量）。
- 秒杀与限时兑换：设置限时秒杀活动，指定活动时段和库存，员工在活动期间抢购，先到先得，增强福利趣味性。
- 积分抽奖转盘：员工消耗积分参与抽奖，配置奖项概率和奖品池（积分/实物/谢谢参与），记录每次抽奖结果和中奖名单。
- 订单发货与福利账单：兑换成功后生成订单，管理员处理发货并更新物流状态，HR可查看月度福利积分支出账单和兑换统计。

## 本地开发方式

前端：

```bash
cd frontend
npm install
npm run dev
```

后端：

```bash
cd backend
pip install -r requirements.txt
python manage.py runserver 0.0.0.0:29505
```

## 技术栈

| 分层 | 技术 |
| --- | --- |
| 前端 | React 18 + TypeScript、Material UI、Vite |
| 后端 | Django + Python |
| 数据库 | PostgreSQL |
| 认证 | JWT |
| 依赖 | Django ORM、djangorestframework-simplejwt |

## 项目目录结构

```text
.
├── backend/              # 后端服务
├── database/             # 数据库脚本
├── frontend/             # 前端应用
├── docker-compose.yml    # 一键部署编排
├── .env.example          # 环境变量示例
└── README.md
```

## 环境变量说明

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| COMPOSE_PROJECT_NAME | Compose 项目名，避免中文目录名导致项目名为空 | ldwelfaremall |
| DB_NAME | 数据库名称 | app |
| DB_USER | 数据库用户 | app |
| DB_PASSWORD | 数据库密码 | app_pwd |
| DB_ROOT_PASSWORD | 数据库 root 密码 | root_pwd |
| JWT_SECRET | JWT 签名密钥 | change_me_to_a_long_random_string |
| FRONTEND_PORT | 前端宿主机端口 | 28505 |
| BACKEND_PORT | 后端宿主机端口 | 29505 |
| DB_PORT | 数据库宿主机端口 | 5432 |

## Docker 部署说明

- 使用 `docker compose up -d` 启动，不需要额外传入 `-p`。
- `docker-compose.yml` 顶层已声明 `name: ldwelfaremall`，并且 `.env` 包含 `COMPOSE_PROJECT_NAME=ldwelfaremall`，可在中文目录名下启动。
- 数据库数据保存在命名卷 `db_data` 中，不依赖当前目录名。
- 前端容器由 Nginx 托管静态资源，并把 `/api/` 反向代理到 `backend:29505`。
- 若本地端口冲突，可修改 `.env` 中的 `FRONTEND_PORT`、`BACKEND_PORT`、`DB_PORT`。

常用命令：

```bash
docker compose config --quiet
docker compose ps
docker compose down
```

## License

MIT
