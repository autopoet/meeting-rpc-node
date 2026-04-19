# Deployment Guide / 部署指南

## 🐳 Docker Deployment (Recommended) / Docker 部署 (推荐)

**EN**: Use Docker to deploy the entire system with one command.
**ZH**: 使用 Docker 一键部署整个系统。

### 1. Prerequisites / 前置条件
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) / 安装 Docker。

### 2. Ready to Launch / 一键启动
Run this in the project root: / 在项目根目录下运行：
```bash
docker-compose up --build -d
```

### 3. Accessing / 访问地址
- **Web Dashboard / 网页看板**: `http://localhost:8080`
- **REST API**: `http://localhost:3001/api/meetings`
- **gRPC Server**: `localhost:50051`

---

## 🛠️ Manual Deployment / 手动部署 (服务器/Linux)

### 1. Build Frontend / 构建前端
```bash
cd client-web
npm install
npm run build
```

### 2. Start Backend with PM2 / 使用 PM2 启动后端
```bash
cd ..
npm install
npx prisma db push
# Use PM2 to keep the server running
npm install -g pm2
pm2 start ts-node -- -P tsconfig.json server/index.ts --name meeting-api
```

---
*Created on: 2026-04-19*
