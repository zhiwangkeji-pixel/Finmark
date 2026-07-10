# GitHub + AWS EC2 公网部署指南

这个项目是一个 Node.js 服务，前端静态文件和后端 API 都由 `server.js` 提供。推荐部署方式：

- GitHub 保存代码，不保存 `.env`、`data/store.json`、日志和密钥。
- AWS EC2 运行 Node.js 服务。
- Nginx 负责公网访问和 HTTPS。
- 真实密钥放在 `/etc/valuation-diary.env`。

## 1. 推送到 GitHub

建议使用私有仓库。公网仓库也可以，但不要提交 `.env` 和 `data/store.json`。

```bash
git init
git add .
git commit -m "Initial deployable version"
git branch -M main
git remote add origin git@github.com:YOUR_NAME/valuation-diary.git
git push -u origin main
```

如果你之前已经把数据文件加入过 Git，需要先从 Git 索引移除，但保留本地文件：

```bash
git rm --cached -r data
git rm --cached .env
git commit -m "Remove local secrets and data from repository"
```

如果本机没有安装 Git，也可以使用项目自带的 GitHub API 发布脚本。需要准备一个 GitHub Personal Access Token，至少具备目标仓库 Contents 读写权限：

```bash
GH_TOKEN=你的 GitHub token npm run publish:github -- zhiwangkeji-pixel/Finmark
```

Windows PowerShell：

```powershell
$env:GH_TOKEN="你的 GitHub token"
npm run publish:github -- zhiwangkeji-pixel/Finmark
```

## 2. 创建 AWS EC2

推荐配置：

- Ubuntu 24.04 LTS 或 Ubuntu 22.04 LTS
- t3.small 起步；数据和图表多时可以用 t3.medium
- 安全组开放：22、80、443
- 不建议开放 3000 端口到公网，3000 只给本机 Nginx 访问

## 3. 安装运行环境

登录 EC2 后执行：

```bash
sudo apt update
sudo apt install -y git curl nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
```

## 4. 拉取代码

```bash
sudo useradd --system --home /opt/valuation-diary --shell /usr/sbin/nologin valuation || true
sudo git clone git@github.com:YOUR_NAME/valuation-diary.git /opt/valuation-diary
sudo mkdir -p /opt/valuation-diary/data
sudo chown -R valuation:valuation /opt/valuation-diary
```

如果仓库是私有仓库，需要给 EC2 配置 GitHub Deploy Key，或先用 HTTPS + token 拉取。

## 5. 配置环境变量

```bash
sudo cp /opt/valuation-diary/.env.example /etc/valuation-diary.env
sudo nano /etc/valuation-diary.env
```

至少要修改：

```text
NODE_ENV=production
TUSHARE_TOKEN=你的真实 TuShare token
GEMINI_API_KEY=你的真实 Gemini key
DEFAULT_ADMIN_USERNAME=beebee
DEFAULT_ADMIN_PASSWORD=一个强密码
COOKIE_SECURE=true
```

第一次启动时如果没有 `DEFAULT_ADMIN_PASSWORD`，生产环境会拒绝创建默认管理员，避免默认密码暴露到公网。

## 6. 启动 systemd 服务

```bash
sudo cp /opt/valuation-diary/deploy/valuation-diary.service /etc/systemd/system/valuation-diary.service
sudo systemctl daemon-reload
sudo systemctl enable valuation-diary
sudo systemctl start valuation-diary
sudo systemctl status valuation-diary
```

检查服务：

```bash
curl http://127.0.0.1:3000/api/health
```

## 7. 配置 Nginx

```bash
sudo cp /opt/valuation-diary/deploy/nginx.conf.example /etc/nginx/sites-available/valuation-diary
sudo nano /etc/nginx/sites-available/valuation-diary
```

把 `server_name your-domain.example.com;` 改成你的域名。

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/valuation-diary /etc/nginx/sites-enabled/valuation-diary
sudo nginx -t
sudo systemctl reload nginx
```

如果暂时没有域名，可以把 `server_name` 改成服务器公网 IP，但 HTTPS 证书最好绑定域名。

## 8. 配置 HTTPS

域名解析到 EC2 公网 IP 后：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.example.com
```

证书成功后访问：

```text
https://your-domain.example.com
```

## 9. 后续更新

本地改完后推送 GitHub：

```bash
git add .
git commit -m "Update app"
git push
```

EC2 上更新：

```bash
cd /opt/valuation-diary
sudo git pull --ff-only
sudo systemctl restart valuation-diary
```

## 10. 数据备份

核心数据在：

```text
/opt/valuation-diary/data/store.json
```

建议定时备份：

```bash
sudo cp /opt/valuation-diary/data/store.json /opt/valuation-diary/data/store-$(date +%F-%H%M).json
```

公网部署后，务必在系统里把默认管理员密码改掉，并定期备份 `data/store.json`。
