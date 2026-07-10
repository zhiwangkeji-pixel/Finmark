# 估值手账

本项目是一个本地运行的 A 股股票池仪表盘，用来维护自选股票、估值区间、备注和估值调整流水。核心数据来自 TuShare，前端不会直接接触你的 API token。

## 功能

- 搜索并添加 A 股股票
- 自定义分组
- 为每只股票维护低估线、合理价值、高估线
- 每次估值调整自动保存不可修改的流水
- 手动同步每日收盘数据
- 如果目标交易日收盘价暂时获取失败，服务端会定时重试直到成功
- 股票池列表展示价格日期、收盘价、涨跌幅、估值状态和偏离幅度
- 个股详情展示价格走势、估值线、备注、估值依据、研报记录和外部资讯入口

## 运行

推荐直接运行：

```bat
start-site.bat
```

然后打开：

```text
http://localhost:3000
```

如果你的系统已经把 Node.js 加入 PATH，也可以运行：

```powershell
node server.js
```

## 配置

`.env` 中保存本地配置：

```text
TUSHARE_TOKEN=你的 TuShare token
TUSHARE_ENDPOINT=http://api.tushare.pro
PORT=3000
SYNC_RETRY_MS=180000
```

`SYNC_RETRY_MS` 是收盘价同步失败后的重试间隔，默认 3 分钟。

## 本地数据

本地数据保存在：

```text
data/store.json
```

后续如果要迁移到服务器，可以把这个文件一起迁移；也可以再升级为 SQLite 或 PostgreSQL。
