const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } = require("node:crypto");
const { URL } = require("node:url");

const rootDir = __dirname;
const publicDir = path.join(rootDir, "public");
const dataDir = path.join(rootDir, "data");
const dataFile = path.join(dataDir, "store.json");

loadEnv(path.join(rootDir, ".env"));

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = Number(process.env.PORT || 3000);
const TUSHARE_ENDPOINT = process.env.TUSHARE_ENDPOINT || "http://api.tushare.pro";
const TUSHARE_TOKEN = process.env.TUSHARE_TOKEN || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_REASONING_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_ENDPOINT = process.env.GEMINI_ENDPOINT || "https://generativelanguage.googleapis.com/v1beta";
const companyAnalysisPromptFile = path.join(rootDir, "prompts", "company-analysis.txt");
const financialValuationPromptFile = path.join(rootDir, "prompts", "financial-valuation-extract.txt");
const SHARE_USER = process.env.SHARE_USER || "friend";
const SHARE_PASSWORD = process.env.SHARE_PASSWORD || "";
const SHARE_COOKIE_NAME = "valuation_share";
const SHARE_COOKIE_MAX_AGE = 8 * 60 * 60;
const SHARE_SESSION_TOKEN = SHARE_PASSWORD ? randomUUID() : "";
const AUTH_COOKIE_NAME = "valuation_auth";
const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;
const DEFAULT_ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME || process.env.ADMIN_USERNAME || "beebee";
const DEFAULT_ADMIN_PASSWORD =
  process.env.DEFAULT_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || (NODE_ENV === "production" ? "" : "qwer1234");
const COOKIE_SECURE = parseBooleanEnv(process.env.COOKIE_SECURE, NODE_ENV === "production");
const SYNC_RETRY_MS = Number(process.env.SYNC_RETRY_MS || 3 * 60 * 1000);
const AUTO_SYNC_CHECK_MS = Number(process.env.AUTO_SYNC_CHECK_MS || 5 * 60 * 1000);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

const stockCache = {
  expiresAt: 0,
  promise: null,
  rows: [],
};

const sectorCache = {
  expiresAt: 0,
  promise: null,
  value: null,
};

const sectorLevels = ["L1", "L2", "L3"];
const sectorStrengthWindows = [1, 2, 3, 5, 7, 15, 30, 60, 90, 120, 150, 180];
const sectorStrengthSegments = [
  { key: "d1", label: "今日", from: 1, to: 1 },
  { key: "d2", label: "昨日", from: 2, to: 2 },
  { key: "d3", label: "第3日", from: 3, to: 3 },
  { key: "d4_5", label: "第4-5日", from: 4, to: 5 },
  { key: "d6_7", label: "第6-7日", from: 6, to: 7 },
  { key: "d8_15", label: "第8-15日", from: 8, to: 15 },
  { key: "d16_30", label: "第16-30日", from: 16, to: 30 },
  { key: "d31_60", label: "第31-60日", from: 31, to: 60 },
  { key: "d61_90", label: "第61-90日", from: 61, to: 90 },
  { key: "d91_120", label: "第91-120日", from: 91, to: 120 },
  { key: "d121_150", label: "第121-150日", from: 121, to: 150 },
  { key: "d151_180", label: "第151-180日", from: 151, to: 180 },
];

const moneyflowCache = new Map();
const dailyByDateCache = new Map();
const dailyBasicByDateCache = new Map();
const dailySeriesCache = new Map();
const strategyIntradayProfileCache = new Map();
const sectorStrengthCache = new Map();
const companyAnalysisJobs = new Map();
const targetTradeDateCache = {
  expiresAt: 0,
  promise: null,
  value: "",
};
const turnoverMonitorCache = {
  expiresAt: 0,
  promise: null,
  value: null,
};

let db = loadStore();
let writeQueue = Promise.resolve();
ensureDefaultAdminUser();
let retryTimer = null;
let syncState = {
  active: false,
  running: false,
  reason: "",
  target_trade_date: "",
  attempt: 0,
  total: 0,
  success_count: 0,
  pending: [],
  failures: [],
  started_at: "",
  finished_at: "",
  next_retry_at: "",
  message: "尚未同步",
};

const server = http.createServer((req, res) => {
  routeRequest(req, res).catch((error) => {
    safeConsoleError(error);
    sendJson(res, error.status || 500, {
      error: error.message || "服务端内部错误",
      apiCode: error.apiCode,
    });
  });
});

server.listen(PORT, () => {
  console.log(`Valuation diary running at http://localhost:${PORT}`);
});

setInterval(() => {
  maybeAutoSyncAfterClose().catch((error) => {
    safeConsoleError("auto sync check failed", error);
  });
}, AUTO_SYNC_CHECK_MS).unref();

async function routeRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const authContext = getAuthContext(req);
  req.user = authContext.user;
  req.session = authContext.session;

  if (url.pathname === "/api/health") {
    await handleApi(req, res, url);
    return;
  }

  if (isPublicAuthApi(req, url)) {
    await handleApi(req, res, url);
    return;
  }

  if (SHARE_PASSWORD && req.method === "POST" && url.pathname === "/share-login") {
    await handleShareLogin(req, res);
    return;
  }

  if (SHARE_PASSWORD && req.method === "POST" && url.pathname === "/share-logout") {
    clearShareCookie(res, "/share-login");
    return;
  }

  if (!authorizeSharedAccess(req, res, url)) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    if (!req.user) {
      sendJson(res, 401, { error: "需要先登录" });
      return;
    }
    await handleApi(req, res, url);
    return;
  }

  serveStatic(res, url.pathname);
}

function isPublicAuthApi(req, url) {
  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    return true;
  }
  if (req.method === "GET" && url.pathname === "/api/auth/session") {
    return true;
  }
  if (req.method === "POST" && url.pathname === "/api/auth/logout") {
    return true;
  }
  return false;
}

function ensureDefaultAdminUser() {
  let changed = false;
  db.users = Array.isArray(db.users) ? db.users : [];
  db.login_events = Array.isArray(db.login_events) ? db.login_events : [];
  db.sessions = Array.isArray(db.sessions) ? db.sessions : [];

  const normalizedAdminName = normalizeUsername(DEFAULT_ADMIN_USERNAME);
  let admin = db.users.find((user) => normalizeUsername(user.username) === normalizedAdminName);
  if (!admin) {
    if (!DEFAULT_ADMIN_PASSWORD) {
      throw new Error("生产环境首次启动必须设置 DEFAULT_ADMIN_PASSWORD");
    }
    const password = hashPassword(DEFAULT_ADMIN_PASSWORD);
    admin = {
      id: randomUUID(),
      username: DEFAULT_ADMIN_USERNAME,
      role: "admin",
      password_hash: password.passwordHash,
      password_salt: password.salt,
      created_at: nowIso(),
      updated_at: nowIso(),
      last_login_at: "",
    };
    db.users.push(admin);
    changed = true;
  } else if (!admin.password_hash || !admin.password_salt) {
    if (!DEFAULT_ADMIN_PASSWORD) {
      throw new Error("生产环境修复默认管理员必须设置 DEFAULT_ADMIN_PASSWORD");
    }
    const password = hashPassword(DEFAULT_ADMIN_PASSWORD);
    admin.role = admin.role === "admin" ? "admin" : "admin";
    admin.password_hash = password.passwordHash;
    admin.password_salt = password.salt;
    admin.updated_at = nowIso();
    changed = true;
  }

  db.sessions = db.sessions.filter((session) => new Date(session.expires_at).getTime() > Date.now());

  if (changed) {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(db, null, 2), "utf8");
  }
}

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

function validateUsername(username) {
  const normalized = normalizeUsername(username);
  if (!/^[a-z0-9_.@-]{3,32}$/.test(normalized)) {
    throw badRequest("用户名需为 3-32 位，可使用字母、数字、下划线、点、@ 或短横线");
  }
  return normalized;
}

function validatePassword(value) {
  const password = String(value || "");
  if (password.length < 6 || password.length > 72) {
    throw badRequest("密码长度需为 6-72 位");
  }
  return password;
}

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  return {
    salt,
    passwordHash: scryptSync(String(password || ""), salt, 64).toString("hex"),
  };
}

function verifyPassword(password, user) {
  if (!user?.password_hash || !user?.password_salt) {
    return false;
  }
  const expected = Buffer.from(user.password_hash, "hex");
  const actual = scryptSync(String(password || ""), user.password_salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function publicUser(user) {
  if (!user) {
    return null;
  }
  return {
    id: user.id,
    username: user.username,
    role: user.role || "user",
    created_at: user.created_at || "",
    updated_at: user.updated_at || "",
    last_login_at: user.last_login_at || "",
  };
}

function isAdminUser(user) {
  return user?.role === "admin";
}

function assertAdmin(req) {
  if (!isAdminUser(req.user)) {
    const error = new Error("需要管理员权限");
    error.status = 403;
    throw error;
  }
}

function hashSessionToken(token) {
  return createHash("sha256").update(String(token || "")).digest("hex");
}

function getAuthContext(req) {
  const token = getCookieValue(req, AUTH_COOKIE_NAME);
  if (!token) {
    return { user: null, session: null };
  }
  const tokenHash = hashSessionToken(token);
  const now = Date.now();
  const session = (db.sessions || []).find((item) => item.token_hash === tokenHash);
  if (!session || new Date(session.expires_at).getTime() <= now) {
    return { user: null, session: null };
  }
  const user = (db.users || []).find((item) => item.id === session.user_id);
  if (!user) {
    return { user: null, session: null };
  }
  return { user, session };
}

async function createAuthSession(user, req) {
  const token = `${randomUUID()}.${randomBytes(24).toString("hex")}`;
  const now = nowIso();
  const expiresAt = new Date(Date.now() + AUTH_COOKIE_MAX_AGE * 1000).toISOString();
  const session = {
    id: randomUUID(),
    user_id: user.id,
    token_hash: hashSessionToken(token),
    created_at: now,
    last_seen_at: now,
    expires_at: expiresAt,
    user_agent: String(req.headers["user-agent"] || "").slice(0, 300),
    ip: clientIp(req),
  };
  db.sessions = [
    ...(db.sessions || []).filter((item) => new Date(item.expires_at).getTime() > Date.now()),
    session,
  ];
  return { token, session };
}

function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.socket?.remoteAddress || "";
}

function parseBooleanEnv(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }
  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

function secureCookieSuffix() {
  return COOKIE_SECURE ? "; Secure" : "";
}

function authCookie(token) {
  return `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${AUTH_COOKIE_MAX_AGE}${secureCookieSuffix()}`;
}

function expiredAuthCookie() {
  return `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureCookieSuffix()}`;
}

async function handleAuthApi(req, res, url) {
  const segments = url.pathname.split("/").filter(Boolean);

  if (req.method === "GET" && url.pathname === "/api/auth/session") {
    sendJson(res, 200, {
      authenticated: Boolean(req.user),
      user: publicUser(req.user),
    });
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    const body = await readJsonBody(req);
    const username = normalizeUsername(body.username);
    const user = (db.users || []).find((item) => normalizeUsername(item.username) === username);
    if (!user || !verifyPassword(body.password, user)) {
      sendJson(res, 401, { error: "用户名或密码不正确" });
      return true;
    }

    const now = nowIso();
    const { token } = await createAuthSession(user, req);
    user.last_login_at = now;
    user.updated_at = user.updated_at || now;
    db.login_events = [
      {
        id: randomUUID(),
        user_id: user.id,
        username: user.username,
        login_at: now,
        ip: clientIp(req),
        user_agent: String(req.headers["user-agent"] || "").slice(0, 300),
      },
      ...(db.login_events || []),
    ].slice(0, 2000);
    await persistStore();
    sendJson(res, 200, { authenticated: true, user: publicUser(user) }, {
      "Set-Cookie": authCookie(token),
    });
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/auth/logout") {
    const token = getCookieValue(req, AUTH_COOKIE_NAME);
    if (token) {
      const tokenHash = hashSessionToken(token);
      db.sessions = (db.sessions || []).filter((session) => session.token_hash !== tokenHash);
      await persistStore();
    }
    sendJson(res, 200, { ok: true }, {
      "Set-Cookie": expiredAuthCookie(),
    });
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/auth/change-password") {
    const body = await readJsonBody(req);
    if (!verifyPassword(body.old_password, req.user)) {
      throw badRequest("旧密码不正确");
    }
    const password = hashPassword(validatePassword(body.new_password));
    req.user.password_hash = password.passwordHash;
    req.user.password_salt = password.salt;
    req.user.updated_at = nowIso();
    db.sessions = (db.sessions || []).filter((session) => session.user_id !== req.user.id || session.id === req.session?.id);
    await persistStore();
    sendJson(res, 200, { user: publicUser(req.user) });
    return true;
  }

  if (segments[1] === "users") {
    await handleUsersApi(req, res, segments);
    return true;
  }

  return false;
}

async function handleUsersApi(req, res, segments) {
  assertAdmin(req);

  if (req.method === "GET" && segments.length === 2) {
    const loginCounts = new Map();
    for (const event of db.login_events || []) {
      loginCounts.set(event.user_id, (loginCounts.get(event.user_id) || 0) + 1);
    }
    sendJson(res, 200, {
      users: (db.users || []).map((user) => ({
        ...publicUser(user),
        login_count: loginCounts.get(user.id) || 0,
      })),
    });
    return;
  }

  if (req.method === "POST" && segments.length === 2) {
    const body = await readJsonBody(req);
    const username = validateUsername(body.username);
    if ((db.users || []).some((user) => normalizeUsername(user.username) === username)) {
      throw badRequest("用户名已存在");
    }
    const password = hashPassword(validatePassword(body.password));
    const now = nowIso();
    const user = {
      id: randomUUID(),
      username,
      role: body.role === "admin" ? "admin" : "user",
      password_hash: password.passwordHash,
      password_salt: password.salt,
      created_at: now,
      updated_at: now,
      last_login_at: "",
    };
    db.users.push(user);
    await persistStore();
    sendJson(res, 201, { user: publicUser(user) });
    return;
  }

  const userId = decodeURIComponent(segments[2] || "");
  const user = (db.users || []).find((item) => item.id === userId);
  if (!user) {
    throw notFound("用户不存在");
  }

  if (req.method === "GET" && segments[3] === "login-events") {
    const events = (db.login_events || [])
      .filter((event) => event.user_id === user.id)
      .sort((a, b) => String(b.login_at).localeCompare(String(a.login_at)));
    sendJson(res, 200, { user: publicUser(user), events });
    return;
  }

  if (req.method === "POST" && segments[3] === "reset-password") {
    if (user.id === req.user.id) {
      throw badRequest("重置自己的密码请使用修改密码");
    }
    const body = await readJsonBody(req);
    const password = hashPassword(validatePassword(body.password));
    user.password_hash = password.passwordHash;
    user.password_salt = password.salt;
    user.updated_at = nowIso();
    db.sessions = (db.sessions || []).filter((session) => session.user_id !== user.id);
    await persistStore();
    sendJson(res, 200, { user: publicUser(user) });
    return;
  }

  if (req.method === "DELETE" && segments.length === 3) {
    if (user.id === req.user.id) {
      throw badRequest("不能删除当前登录的管理员账号");
    }
    const admins = (db.users || []).filter((item) => item.role === "admin");
    if (user.role === "admin" && admins.length <= 1) {
      throw badRequest("至少保留一个管理员账号");
    }
    db.users = db.users.filter((item) => item.id !== user.id);
    db.sessions = (db.sessions || []).filter((session) => session.user_id !== user.id);
    await persistStore();
    sendJson(res, 200, { ok: true });
    return;
  }

  sendJson(res, 404, { error: "未找到用户接口" });
}

function authorizeSharedAccess(req, res, url) {
  if (!SHARE_PASSWORD) {
    return true;
  }

  if (hasSharedAccess(req)) {
    return true;
  }

  if (url.pathname.startsWith("/api/")) {
    sendJson(res, 401, { error: "需要先登录" });
    return false;
  }

  if (req.method === "GET" && acceptsHtml(req)) {
    sendShareLoginPage(res, url.searchParams.get("error") === "1");
    return false;
  }

  sendPlain(res, 401, "Authentication required");
  return false;
}

function hasSharedAccess(req) {
  const authorization = String(req.headers.authorization || "");
  const expected = `Basic ${Buffer.from(`${SHARE_USER}:${SHARE_PASSWORD}`, "utf8").toString("base64")}`;
  if (safeStringEqual(authorization, expected)) {
    return true;
  }

  const cookieToken = getCookieValue(req, SHARE_COOKIE_NAME);
  return Boolean(cookieToken && safeStringEqual(cookieToken, SHARE_SESSION_TOKEN));
}

function safeStringEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function acceptsHtml(req) {
  const accept = String(req.headers.accept || "");
  return !accept || accept.includes("text/html") || accept.includes("*/*");
}

async function handleShareLogin(req, res) {
  const text = await readTextBody(req);
  const params = new URLSearchParams(text);
  const password = params.get("password") || "";
  const next = sanitizeShareNext(params.get("next"));

  if (!safeStringEqual(password, SHARE_PASSWORD)) {
    redirect(res, "/share-login?error=1");
    return;
  }

  res.writeHead(303, {
    "Cache-Control": "no-store",
    "Set-Cookie": `${SHARE_COOKIE_NAME}=${encodeURIComponent(SHARE_SESSION_TOKEN)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SHARE_COOKIE_MAX_AGE}${secureCookieSuffix()}`,
    Location: `/${next}`,
  });
  res.end();
}

function sanitizeShareNext(value) {
  const next = String(value || "#/dashboard").trim();
  if (next.startsWith("#/")) {
    return next;
  }
  if (next.startsWith("/#/")) {
    return next.slice(1);
  }
  return "#/dashboard";
}

function getCookieValue(req, name) {
  const cookies = String(req.headers.cookie || "").split(";");
  for (const cookie of cookies) {
    const [rawKey, ...rawValue] = cookie.trim().split("=");
    if (rawKey === name) {
      return decodeURIComponent(rawValue.join("=") || "");
    }
  }
  return "";
}

function clearShareCookie(res, location) {
  res.writeHead(303, {
    "Cache-Control": "no-store",
    "Set-Cookie": `${SHARE_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureCookieSuffix()}`,
    Location: location || "/share-login",
  });
  res.end();
}

function redirect(res, location) {
  res.writeHead(303, {
    "Cache-Control": "no-store",
    Location: location,
  });
  res.end();
}

function sendShareLoginPage(res, hasError) {
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>估值手账 - 访问验证</title>
  <style>
    * { box-sizing: border-box; }
    body {
      min-height: 100vh;
      margin: 0;
      display: grid;
      place-items: center;
      background: linear-gradient(180deg, #fdf8fb 0%, #eef8f6 56%, #f6fbff 100%);
      color: #243040;
      font-family: "Microsoft YaHei", "Segoe UI", sans-serif;
    }
    main {
      width: min(420px, calc(100vw - 32px));
      padding: 28px;
      border: 1px solid rgba(116, 201, 179, 0.28);
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.86);
      box-shadow: 0 18px 48px rgba(63, 93, 116, 0.13);
    }
    .mark {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      margin-bottom: 16px;
      border: 1px solid rgba(80, 174, 151, 0.34);
      border-radius: 12px;
      background: #dff5ef;
      color: #225f58;
      font-weight: 900;
    }
    h1 { margin: 0 0 8px; font-size: 24px; }
    p { margin: 0 0 22px; color: #697586; line-height: 1.7; }
    label { display: grid; gap: 8px; color: #697586; font-size: 13px; }
    input {
      width: 100%;
      height: 44px;
      padding: 0 12px;
      border: 1px solid #d8e5e2;
      border-radius: 8px;
      background: #fff;
      color: #243040;
      font-size: 16px;
      outline: none;
    }
    input:focus {
      border-color: #58b9a7;
      box-shadow: 0 0 0 3px rgba(88, 185, 167, 0.16);
    }
    button {
      width: 100%;
      height: 44px;
      margin-top: 16px;
      border: 0;
      border-radius: 8px;
      background: #3fa18f;
      color: #fff;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
    }
    .error {
      margin: 0 0 14px;
      padding: 10px 12px;
      border: 1px solid rgba(216, 111, 114, 0.28);
      border-radius: 8px;
      background: rgba(216, 111, 114, 0.08);
      color: #ad5558;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <main>
    <div class="mark">价</div>
    <h1>估值手账</h1>
    <p>请输入临时访问密码，进入你的投资仪表盘。</p>
    ${hasError ? '<div class="error">密码不正确，请重新输入。</div>' : ""}
    <form method="post" action="/share-login">
      <input type="hidden" name="next" id="next" value="#/dashboard">
      <label>
        访问密码
        <input name="password" type="password" autocomplete="current-password" autofocus required>
      </label>
      <button type="submit">进入系统</button>
    </form>
  </main>
  <script>
    document.querySelector("#next").value = window.location.hash || "#/dashboard";
  </script>
</body>
</html>`);
}

async function handleApi(req, res, url) {
  const segments = url.pathname.split("/").filter(Boolean);

  if (url.pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      hasToken: Boolean(TUSHARE_TOKEN),
      sync: publicSyncState(),
    });
    return;
  }

  if (await handleAuthApi(req, res, url)) {
    return;
  }

  if (!TUSHARE_TOKEN && needsTushare(url.pathname)) {
    sendJson(res, 500, { error: "缺少 TUSHARE_TOKEN，请检查 .env" });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/dashboard") {
    sendJson(res, 200, buildDashboard());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/groups") {
    sendJson(res, 200, { groups: db.groups });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/groups") {
    const body = await readJsonBody(req);
    const group = await createGroup(body.name);
    sendJson(res, 201, { group });
    return;
  }

  if (segments[1] === "groups" && segments[2]) {
    const groupId = decodeURIComponent(segments[2]);
    if (req.method === "PATCH") {
      const body = await readJsonBody(req);
      const group = await updateGroup(groupId, body.name);
      sendJson(res, 200, { group });
      return;
    }
    if (req.method === "DELETE") {
      await deleteGroup(groupId);
      sendJson(res, 200, { ok: true });
      return;
    }
  }

  if (req.method === "GET" && url.pathname === "/api/watchlist") {
    sendJson(res, 200, { items: db.watchlist.map(enrichWatchItem) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/watchlist") {
    const body = await readJsonBody(req);
    const item = await addWatchItem(body);
    sendJson(res, 201, { item: enrichWatchItem(item) });
    return;
  }

  if (segments[1] === "watchlist" && segments[2]) {
    const itemId = decodeURIComponent(segments[2]);
    if (req.method === "GET") {
      const detail = await getWatchItemDetail(itemId);
      sendJson(res, 200, detail);
      return;
    }
    if (req.method === "PATCH") {
      const body = await readJsonBody(req);
      const item = await updateWatchItem(itemId, body);
      sendJson(res, 200, { item: enrichWatchItem(item) });
      return;
    }
    if (req.method === "DELETE") {
      await deleteWatchItem(itemId);
      sendJson(res, 200, { ok: true });
      return;
    }
  }

  if (req.method === "GET" && url.pathname === "/api/sector-pool") {
    sendJson(res, 200, { items: db.sector_pool });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/sector-pool") {
    const body = await readJsonBody(req);
    const item = await addSectorPoolItem(body);
    sendJson(res, 201, { item });
    return;
  }

  if (segments[1] === "sector-pool" && segments[2]) {
    const itemId = decodeURIComponent(segments[2]);
    if (req.method === "DELETE") {
      await deleteSectorPoolItem(itemId);
      sendJson(res, 200, { ok: true });
      return;
    }
  }

  if (req.method === "GET" && url.pathname === "/api/decision-tests") {
    const payload = await getDecisionTests();
    sendJson(res, 200, payload);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/decision-tests") {
    const body = await readJsonBody(req);
    const item = await createDecisionTest(body);
    sendJson(res, 201, { item: await enrichDecisionTest(item) });
    return;
  }

  if (segments[1] === "decision-tests" && segments[2]) {
    const itemId = decodeURIComponent(segments[2]);
    if (req.method === "DELETE") {
      await deleteDecisionTest(itemId);
      sendJson(res, 200, { ok: true });
      return;
    }
  }

  if (req.method === "GET" && url.pathname === "/api/valuations") {
    const payload = await getValuations();
    sendJson(res, 200, payload);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/valuations") {
    const body = await readJsonBody(req);
    const item = await createValuation(body);
    sendJson(res, 201, { item });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/valuations/extract-pdf") {
    const body = await readJsonBody(req);
    const payload = await extractValuationInputsFromPdf(body);
    sendJson(res, 200, payload);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/valuations/fill-tushare") {
    const body = await readJsonBody(req);
    const payload = await fillValuationInputsFromTushare(body);
    sendJson(res, 200, payload);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/valuations/ai-assumptions") {
    const body = await readJsonBody(req);
    const payload = await predictValuationAssumptions(body);
    sendJson(res, 200, payload);
    return;
  }

  if (segments[1] === "valuations" && segments[2]) {
    const valuationId = decodeURIComponent(segments[2]);
    if (req.method === "GET") {
      const item = await getValuationDetail(valuationId);
      sendJson(res, 200, { item });
      return;
    }
  }

  if (req.method === "GET" && url.pathname === "/api/stocks/search") {
    const query = (url.searchParams.get("q") || "").trim();
    const rows = await searchStocks(query);
    sendJson(res, 200, { results: rows });
    return;
  }

  if (req.method === "GET" && segments[1] === "stocks" && segments[2] && segments[3] === "detail") {
    const detail = await getStockDetail(decodeURIComponent(segments[2]));
    sendJson(res, 200, detail);
    return;
  }

  if (segments[1] === "stocks" && segments[2] && segments[3] === "analysis") {
    const identifier = decodeURIComponent(segments[2]);
    if (req.method === "GET") {
      const payload = await getCompanyAnalysis(identifier);
      sendJson(res, 200, payload);
      return;
    }
    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const payload = await refreshCompanyAnalysis(identifier, body);
      sendJson(res, 201, payload);
      return;
    }
  }

  if (req.method === "GET" && segments[1] === "stocks" && segments[2] && segments[3] === "chart") {
    const tsCode = normalizeCode(decodeURIComponent(segments[2]));
    const period = (url.searchParams.get("period") || "day").trim();
    const chart = await getStockChart(tsCode, period);
    sendJson(res, 200, chart);
    return;
  }

  if (req.method === "GET" && segments[1] === "short-strategy" && segments[2]) {
    const payload = await getShortStrategyData(decodeURIComponent(segments[2]));
    sendJson(res, 200, payload);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/short-strategy-monitors") {
    sendJson(res, 200, { items: getShortStrategyMonitors() });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/short-strategy-monitors") {
    const body = await readJsonBody(req);
    const item = await upsertShortStrategyMonitor(body);
    sendJson(res, 201, { item });
    return;
  }

  if (segments[1] === "short-strategy-monitors" && segments[2]) {
    const itemId = decodeURIComponent(segments[2]);
    if (req.method === "DELETE") {
      await deleteShortStrategyMonitor(itemId);
      sendJson(res, 200, { ok: true });
      return;
    }
  }

  if (req.method === "POST" && url.pathname === "/api/sync/start") {
    startSync("manual");
    sendJson(res, 202, { sync: publicSyncState() });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/sync/status") {
    sendJson(res, 200, { sync: publicSyncState() });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/market") {
    const market = await getMarketSnapshot();
    sendJson(res, 200, market);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/turnover-monitor") {
    const payload = await getTurnoverMonitor({
      refresh: url.searchParams.get("refresh") === "1",
    });
    sendJson(res, 200, payload);
    return;
  }

  if (req.method === "GET" && segments[1] === "sectors" && segments[2] && segments[3] === "detail") {
    const payload = await getSectorDetail(decodeURIComponent(segments[2]), {
      level: url.searchParams.get("level") || "",
      trendDays: Number(url.searchParams.get("trend_days") || 30),
      rankingWindow: Number(url.searchParams.get("ranking_window") || 5),
      rankingMetric: url.searchParams.get("ranking_metric") || "return",
      stockLimit: Number(url.searchParams.get("stock_limit") || 24),
    });
    sendJson(res, 200, payload);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/sectors/fund-flow") {
    const payload = await getSectorFundFlow({
      level: url.searchParams.get("level") || "L3",
      trendDays: Number(url.searchParams.get("trend_days") || 30),
      period: url.searchParams.get("period") || "day",
      startDate: url.searchParams.get("start_date") || "",
      endDate: url.searchParams.get("end_date") || "",
    });
    sendJson(res, 200, payload);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/sectors/strength-matrix") {
    const payload = await getSectorStrengthMatrix({
      level: url.searchParams.get("level") || "L3",
      refresh: url.searchParams.get("refresh") === "1",
    });
    sendJson(res, 200, payload);
    return;
  }

  sendJson(res, 404, { error: "未找到接口" });
}

function needsTushare(pathname) {
  return [
    "/api/stocks/search",
    "/api/stocks/",
    "/api/sync/start",
    "/api/market",
    "/api/short-strategy/",
    "/api/turnover-monitor",
    "/api/decision-tests",
    "/api/valuations",
    "/api/sectors/",
  ].some((prefix) => pathname.startsWith(prefix));
}

function serveStatic(res, requestPath) {
  const relativePath = requestPath === "/" ? "index.html" : decodeURIComponent(requestPath.slice(1));
  const targetPath = path.normalize(path.join(publicDir, relativePath));
  const safePrefix = publicDir.endsWith(path.sep) ? publicDir : `${publicDir}${path.sep}`;

  if (targetPath !== publicDir && !targetPath.startsWith(safePrefix)) {
    sendPlain(res, 403, "Forbidden");
    return;
  }

  fs.readFile(targetPath, (error, data) => {
    if (error) {
      sendPlain(res, 404, "Not found");
      return;
    }

    const ext = path.extname(targetPath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": [".html", ".js", ".css"].includes(ext) ? "no-store" : "public, max-age=300",
    });
    res.end(data);
  });
}

function loadStore() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) {
    const initial = defaultStore();
    fs.writeFileSync(dataFile, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    return normalizeStore(parsed);
  } catch (error) {
    const backup = path.join(dataDir, `store.broken.${Date.now()}.json`);
    fs.copyFileSync(dataFile, backup);
    const initial = defaultStore();
    fs.writeFileSync(dataFile, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

function defaultStore() {
  const now = nowIso();
  return {
    version: 1,
    groups: [{
      id: "default",
      name: "默认股票池",
      created_at: now,
      updated_at: now,
    }],
    watchlist: [],
    valuation_history: [],
    sector_pool: [],
    short_strategy_monitors: [],
    decision_tests: [],
    company_analyses: [],
    valuations: [],
    users: [],
    login_events: [],
    sessions: [],
    prices: {},
    price_history: {},
    updated_at: now,
  };
}

function normalizeStore(store) {
  const base = defaultStore();
  const groups = Array.isArray(store.groups) && store.groups.length ? store.groups : base.groups;
  if (!groups.some((group) => group.id === "default")) {
    groups.unshift(base.groups[0]);
  }

  return {
    ...base,
    ...store,
    groups,
    watchlist: Array.isArray(store.watchlist) ? store.watchlist : [],
    valuation_history: Array.isArray(store.valuation_history) ? store.valuation_history : [],
    sector_pool: Array.isArray(store.sector_pool) ? store.sector_pool : [],
    short_strategy_monitors: Array.isArray(store.short_strategy_monitors) ? store.short_strategy_monitors : [],
    decision_tests: Array.isArray(store.decision_tests) ? store.decision_tests : [],
    company_analyses: Array.isArray(store.company_analyses) ? store.company_analyses : [],
    valuations: Array.isArray(store.valuations) ? store.valuations : [],
    users: Array.isArray(store.users) ? store.users : [],
    login_events: Array.isArray(store.login_events) ? store.login_events : [],
    sessions: Array.isArray(store.sessions) ? store.sessions : [],
    prices: store.prices && typeof store.prices === "object" ? store.prices : {},
    price_history: store.price_history && typeof store.price_history === "object" ? store.price_history : {},
  };
}

function persistStore() {
  db.updated_at = nowIso();
  writeQueue = writeQueue.then(async () => {
    fs.mkdirSync(dataDir, { recursive: true });
    const tempFile = `${dataFile}.tmp`;
    await fs.promises.writeFile(tempFile, JSON.stringify(db, null, 2), "utf8");
    await fs.promises.rename(tempFile, dataFile);
  });
  return writeQueue;
}

async function createGroup(name) {
  const cleanName = cleanText(name);
  if (!cleanName) {
    throw badRequest("分组名称不能为空");
  }

  const existing = db.groups.find((group) => group.name === cleanName);
  if (existing) {
    return existing;
  }

  const now = nowIso();
  const group = {
    id: randomUUID(),
    name: cleanName,
    created_at: now,
    updated_at: now,
  };
  db.groups.push(group);
  await persistStore();
  return group;
}

async function updateGroup(groupId, name) {
  const group = db.groups.find((item) => item.id === groupId);
  if (!group) {
    throw notFound("分组不存在");
  }

  const cleanName = cleanText(name);
  if (!cleanName) {
    throw badRequest("分组名称不能为空");
  }

  group.name = cleanName;
  group.updated_at = nowIso();
  await persistStore();
  return group;
}

async function deleteGroup(groupId) {
  if (groupId === "default") {
    throw badRequest("默认分组不能删除");
  }

  const index = db.groups.findIndex((item) => item.id === groupId);
  if (index === -1) {
    throw notFound("分组不存在");
  }

  const inUse = db.watchlist.some((item) => item.group_id === groupId);
  if (inUse) {
    const error = new Error("该分组下还有股票，不能删除");
    error.status = 409;
    throw error;
  }

  db.groups.splice(index, 1);
  await persistStore();
}

async function addWatchItem(body) {
  const tsCode = normalizeCode(body.ts_code || body.symbol || body.code);
  if (!tsCode) {
    throw badRequest("请选择要添加的股票");
  }

  const existing = db.watchlist.find((item) => item.ts_code === tsCode);
  if (existing) {
    scheduleCompanyAnalysisForWatchItem(existing, "watchlist-existing");
    return existing;
  }

  const stock = await findStock(tsCode);
  const latestValuation = latestSavedValuation(tsCode);
  const groupId = db.groups.some((group) => group.id === body.group_id) ? body.group_id : "default";
  const now = nowIso();
  const item = {
    id: randomUUID(),
    ts_code: stock.ts_code,
    symbol: stock.symbol || stock.ts_code.slice(0, 6),
    name: stock.name || stock.ts_code,
    area: stock.area || "",
    industry: stock.industry || "",
    market: stock.market || "",
    list_date: stock.list_date || "",
    group_id: groupId,
    note: cleanText(body.note),
    valuation_basis: cleanText(body.valuation_basis) || autoValuationBasis(latestValuation),
    low_price: nullableNumber(body.low_price) ?? latestValuation?.low_price ?? null,
    fair_price: nullableNumber(body.fair_price) ?? latestValuation?.fair_price ?? null,
    high_price: nullableNumber(body.high_price) ?? latestValuation?.high_price ?? null,
    valuation_updated_at: latestValuation ? now : "",
    created_at: now,
    updated_at: now,
  };

  validateValuationOrder(item);
  db.watchlist.push(item);
  await persistStore();
  scheduleCompanyAnalysisForWatchItem(item, "watchlist-added");
  return item;
}

async function updateWatchItem(itemId, body) {
  const item = findWatchItem(itemId);
  const oldValuation = pickValuation(item);
  const oldBasis = item.valuation_basis || "";

  if ("group_id" in body) {
    item.group_id = db.groups.some((group) => group.id === body.group_id) ? body.group_id : "default";
  }
  if ("note" in body) {
    item.note = cleanText(body.note);
  }
  if ("valuation_basis" in body) {
    item.valuation_basis = cleanText(body.valuation_basis);
  }
  if ("low_price" in body) {
    item.low_price = nullableNumber(body.low_price);
  }
  if ("fair_price" in body) {
    item.fair_price = nullableNumber(body.fair_price);
  }
  if ("high_price" in body) {
    item.high_price = nullableNumber(body.high_price);
  }

  validateValuationOrder(item);

  const newValuation = pickValuation(item);
  const valuationChanged = !sameValuation(oldValuation, newValuation) || oldBasis !== (item.valuation_basis || "");
  const now = nowIso();
  if (valuationChanged) {
    item.valuation_updated_at = now;
    db.valuation_history.unshift({
      id: randomUUID(),
      watchlist_id: item.id,
      ts_code: item.ts_code,
      stock_name: item.name,
      old_low_price: oldValuation.low_price,
      old_fair_price: oldValuation.fair_price,
      old_high_price: oldValuation.high_price,
      new_low_price: newValuation.low_price,
      new_fair_price: newValuation.fair_price,
      new_high_price: newValuation.high_price,
      old_basis: oldBasis,
      new_basis: item.valuation_basis || "",
      reason: cleanText(body.valuation_reason),
      created_at: now,
    });
  }

  item.updated_at = now;
  await persistStore();
  return item;
}

async function deleteWatchItem(itemId) {
  const item = findWatchItem(itemId);
  db.watchlist = db.watchlist.filter((entry) => entry.id !== item.id);
  await persistStore();
}

async function addSectorPoolItem(body) {
  const level = normalizeSectorLevel(body.level || "L3");
  const code = cleanText(body.code || body.index_code);
  const name = cleanText(body.name || body.industry_name || code);
  if (!name && !code) {
    throw badRequest("请选择要添加的板块");
  }

  const id = sectorPoolKey(level, code, name);
  const existing = db.sector_pool.find((item) => item.id === id);
  if (existing) {
    existing.name = name || existing.name;
    existing.code = code || existing.code;
    existing.level = level;
    existing.updated_at = nowIso();
    await persistStore();
    return existing;
  }

  const now = nowIso();
  const item = {
    id,
    code,
    name: name || code,
    level,
    created_at: now,
    updated_at: now,
  };
  db.sector_pool.push(item);
  db.sector_pool.sort((a, b) => `${a.level}:${a.name}`.localeCompare(`${b.level}:${b.name}`, "zh-CN"));
  await persistStore();
  return item;
}

async function deleteSectorPoolItem(itemId) {
  const index = db.sector_pool.findIndex((item) => item.id === itemId);
  if (index === -1) {
    throw notFound("板块池中没有这个板块");
  }
  db.sector_pool.splice(index, 1);
  await persistStore();
}

function getShortStrategyMonitors() {
  return (db.short_strategy_monitors || [])
    .slice()
    .sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")));
}

async function upsertShortStrategyMonitor(body) {
  const source = body && typeof body === "object" ? body : {};
  const snapshot = source.snapshot && typeof source.snapshot === "object" ? source.snapshot : source;
  const tsCode = normalizeCode(source.ts_code || source.tsCode || snapshot.ts_code || snapshot.tsCode);
  if (!tsCode) {
    throw badRequest("请先生成一只股票的策略再保存");
  }

  const now = nowIso();
  db.short_strategy_monitors = Array.isArray(db.short_strategy_monitors) ? db.short_strategy_monitors : [];
  let item = db.short_strategy_monitors.find((entry) => entry.ts_code === tsCode);
  if (!item) {
    item = {
      id: randomUUID(),
      ts_code: tsCode,
      created_at: now,
    };
    db.short_strategy_monitors.push(item);
  }

  const tplus1 = snapshot.tplus1 || {};
  const tRange = tplus1.range || {};
  const grid = snapshot.grid || {};
  const analysis = snapshot.analysis || {};
  const intraday = snapshot.intraday || snapshot.intradayStats || {};

  item.stock_name = cleanText(source.stock_name || source.stockName || snapshot.stock_name || snapshot.stockName) || tsCode;
  item.latest_trade_date = cleanText(source.latest_trade_date || source.latestTradeDate || snapshot.latest_trade_date || snapshot.latestTradeDate);
  item.current_price = nullableNumber(source.current_price ?? source.currentPrice ?? snapshot.current_price ?? snapshot.currentPrice);
  item.tplus1 = {
    next_trade_date: cleanText(tplus1.next_trade_date || tplus1.nextTradeDate || tRange.nextTradeDate),
    buy_zone_lower: nullableNumber(tplus1.buy_zone_lower ?? tplus1.buyZoneLower ?? tRange.buyZoneLower),
    buy_zone_upper: nullableNumber(tplus1.buy_zone_upper ?? tplus1.buyZoneUpper ?? tRange.buyZoneUpper),
    sell_zone_lower: nullableNumber(tplus1.sell_zone_lower ?? tplus1.sellZoneLower ?? tRange.sellZoneLower),
    sell_zone_upper: nullableNumber(tplus1.sell_zone_upper ?? tplus1.sellZoneUpper ?? tRange.sellZoneUpper),
    risk_line: nullableNumber(tplus1.risk_line ?? tplus1.riskLine ?? tRange.riskLine),
    risk_level: cleanText(tplus1.risk_level || tplus1.riskLevel),
    strategy_text: cleanText(tplus1.strategy_text || tplus1.strategyText),
  };
  item.grid = {
    horizon_days: nullableNumber(grid.horizon_days ?? grid.horizonDays),
    center_price: nullableNumber(grid.center_price ?? grid.centerPrice),
    grid_lower: nullableNumber(grid.grid_lower ?? grid.gridLower),
    grid_upper: nullableNumber(grid.grid_upper ?? grid.gridUpper),
    grid_count: nullableNumber(grid.grid_count ?? grid.gridCount),
    grid_step_percent: nullableNumber(grid.grid_step_percent ?? grid.gridStepPercent),
    suitability: cleanText(grid.suitability),
    risk_level: cleanText(grid.risk_level || grid.riskLevel),
    strategy_text: cleanText(grid.strategy_text || grid.strategyText),
  };
  item.analysis = {
    trend: cleanText(analysis.trend),
    volume_signal: cleanText(analysis.volume_signal || analysis.volumeSignal),
    limit_status: cleanText(analysis.limit_status || analysis.limitStatus),
    effective_amplitude: nullableNumber(analysis.effective_amplitude ?? analysis.effectiveAmplitude),
  };
  item.intraday = {
    type: cleanText(intraday.type),
    condition: cleanText(intraday.condition),
    strategy: cleanText(intraday.strategy),
    amplitude_basis: cleanText(intraday.amplitude_basis || intraday.amplitudeBasis),
    avg_high_from_open: nullableNumber(intraday.avg_high_from_open ?? intraday.avgHighFromOpen),
    avg_low_from_open: nullableNumber(intraday.avg_low_from_open ?? intraday.avgLowFromOpen),
    avg_drawdown_amplitude: nullableNumber(intraday.avg_drawdown_amplitude ?? intraday.avgDrawdownAmplitude),
    avg_rebound_amplitude: nullableNumber(intraday.avg_rebound_amplitude ?? intraday.avgReboundAmplitude),
    avg_potential_drawdown_amplitude: nullableNumber(intraday.avg_potential_drawdown_amplitude ?? intraday.avgPotentialDrawdownAmplitude),
    avg_potential_rebound_amplitude: nullableNumber(intraday.avg_potential_rebound_amplitude ?? intraday.avgPotentialReboundAmplitude),
    drawdown3_probability: nullableNumber(intraday.drawdown3_probability ?? intraday.drawdown3Probability),
    drawdown4_probability: nullableNumber(intraday.drawdown4_probability ?? intraday.drawdown4Probability),
    rebound1_probability: nullableNumber(intraday.rebound1_probability ?? intraday.rebound1Probability),
    rebound2_probability: nullableNumber(intraday.rebound2_probability ?? intraday.rebound2Probability),
    drawdown_dominance_probability: nullableNumber(intraday.drawdown_dominance_probability ?? intraday.drawdownDominanceProbability),
    rebound_dominance_probability: nullableNumber(intraday.rebound_dominance_probability ?? intraday.reboundDominanceProbability),
    low3_probability: nullableNumber(intraday.low3_probability ?? intraday.low3Probability),
    low4_probability: nullableNumber(intraday.low4_probability ?? intraday.low4Probability),
    high1_probability: nullableNumber(intraday.high1_probability ?? intraday.high1Probability),
    weak_close_probability: nullableNumber(intraday.weak_close_probability ?? intraday.weakCloseProbability),
    sell_prompt: cleanText(intraday.sell_prompt || intraday.sellPrompt),
    buy_prompt: cleanText(intraday.buy_prompt || intraday.buyPrompt),
  };
  item.updated_at = now;
  await persistStore();
  return item;
}

async function deleteShortStrategyMonitor(itemId) {
  const normalized = normalizeCode(itemId);
  const index = (db.short_strategy_monitors || []).findIndex((item) => item.id === itemId || (normalized && item.ts_code === normalized));
  if (index === -1) {
    throw notFound("短线监控列表中没有这只股票");
  }
  db.short_strategy_monitors.splice(index, 1);
  await persistStore();
}

async function getValuations() {
  return {
    items: (db.valuations || [])
      .slice()
      .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || ""))),
  };
}

async function getValuationDetail(valuationId) {
  const item = (db.valuations || []).find((entry) => entry.id === valuationId);
  if (!item) {
    throw notFound("没有找到这条估值记录");
  }
  return item;
}

async function createValuation(body) {
  const stock = await resolveStockInput(body.ts_code || body.symbol || body.code || body.name || body.stock_name || body.company_name);
  if (!stock?.ts_code) {
    throw badRequest("请输入股票名称");
  }
  const methods = Array.isArray(body.methods) ? body.methods.filter((method) => valuationMethodKeys().includes(method)) : [];
  if (!methods.length) {
    throw badRequest("请至少选择一种估值方法");
  }

  const fairPrice = nullableNumber(body.fair_price);
  const lowPrice = nullableNumber(body.low_price);
  const highPrice = nullableNumber(body.high_price);
  if (!Number.isFinite(Number(fairPrice))) {
    throw badRequest("估值结果不能为空");
  }

  const item = {
    id: randomUUID(),
    ts_code: stock.ts_code,
    symbol: stock.symbol || stock.ts_code.slice(0, 6),
    name: stock.name || stock.ts_code,
    area: stock.area || "",
    industry: stock.industry || "",
    market: stock.market || "",
    methods,
    inputs: body.inputs && typeof body.inputs === "object" ? body.inputs : {},
    method_results: body.method_results && typeof body.method_results === "object" ? body.method_results : {},
    fair_price: fairPrice,
    low_price: lowPrice,
    high_price: highPrice,
    safety_margin_pct: nullableNumber(body.safety_margin_pct),
    overvaluation_margin_pct: nullableNumber(body.overvaluation_margin_pct),
    source: cleanText(body.source) || "manual",
    pdf_file_name: cleanText(body.pdf_file_name),
    note: cleanText(body.note),
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  validateValuationOrder(item);
  db.valuations.unshift(item);
  await persistStore();
  return item;
}

async function extractValuationInputsFromPdf(body) {
  if (!GEMINI_API_KEY) {
    throw badRequest("缺少 GEMINI_API_KEY，请检查 .env");
  }
  const pdfBase64 = cleanText(body.pdf_base64);
  if (!pdfBase64) {
    throw badRequest("请上传 PDF 文件");
  }
  if (Buffer.byteLength(pdfBase64, "utf8") > 18 * 1024 * 1024) {
    throw badRequest("PDF 太大，请上传更精简的财报或摘录版 PDF");
  }
  const companyName = cleanText(body.company_name) || cleanText(body.name) || "未知公司";
  const prompt = buildFinancialValuationPrompt(companyName);
  const payload = await callGeminiJsonWithParts([
    { text: prompt },
    {
      inlineData: {
        mimeType: cleanText(body.mime_type) || "application/pdf",
        data: pdfBase64,
      },
    },
  ]);
  return normalizeValuationExtractPayload(payload);
}

async function predictValuationAssumptions(body) {
  if (!GEMINI_API_KEY) {
    throw badRequest("缺少 GEMINI_API_KEY，请检查 .env");
  }
  const companyName = cleanText(body.name || body.company_name);
  const stock = await resolveStockInput(body.ts_code || body.symbol || body.code || companyName).catch(() => null);
  const name = stock?.name || companyName || cleanText(body.ts_code) || "未知公司";
  const payload = compactValuationAssumptionInput({
    ts_code: stock?.ts_code || cleanText(body.ts_code),
    name,
    methods: Array.isArray(body.methods) ? body.methods : [],
    inputs: body.inputs && typeof body.inputs === "object" ? body.inputs : {},
  });
  if (!payload.financial_periods.length) {
    throw badRequest("请先提供财报数据，再让 AI 预测估值假设");
  }

  const prompt = [
    "你是谨慎的 A 股价值投资估值助手。请根据用户提供的公司名称、估值方法、财报原始字段和推导指标，为 DCF 模型预测永续增长率与折现率/WACC。",
    "要求：",
    "1. 只返回合法 JSON 对象，不要 Markdown，不要解释正文。",
    "2. terminal_growth_rate 和 discount_rate 均使用百分数口径，例如 2.5 表示 2.5%。",
    "3. terminal_growth_rate 应谨慎，通常不高于长期名义 GDP 增速；成熟或周期公司更低，缺乏数据时保守取 1.5-2.5。",
    "4. discount_rate 应反映 A 股股权风险、行业周期性、现金流稳定性、杠杆与公司质量；通常在 7-14 之间，风险越高越大。",
    "5. 必须保证 discount_rate 明显高于 terminal_growth_rate。",
    "6. 不要编造未提供的数据；如果数据不足，请说明并给保守值。",
    "返回 JSON schema：",
    "{\"terminal_growth_rate\": number, \"discount_rate\": number, \"confidence\": number, \"reason\": \"不超过120字的中文依据\", \"risk_notes\": [\"风险点\"]}",
    "输入数据：",
    JSON.stringify(payload),
  ].join("\n");

  const result = await callGeminiJson(prompt);
  const terminalGrowth = normalizeAssumptionPercent(result.terminal_growth_rate ?? result.terminalGrowthRate, -1, 6);
  const discountRate = normalizeAssumptionPercent(result.discount_rate ?? result.discountRate ?? result.wacc, 5, 20);
  if (!Number.isFinite(Number(terminalGrowth)) || !Number.isFinite(Number(discountRate))) {
    throw badGateway("Gemini 没有返回有效的永续增长率或折现率");
  }
  const safeTerminalGrowth = Math.min(terminalGrowth, discountRate - 1);
  return {
    terminal_growth_rate: round(safeTerminalGrowth, 2),
    discount_rate: round(discountRate, 2),
    confidence: clampNumber(result.confidence, 0, 1, null),
    reason: cleanText(result.reason || result.rationale || "AI 根据财报趋势、现金流稳定性和风险溢价给出保守 DCF 假设。").slice(0, 180),
    risk_notes: Array.isArray(result.risk_notes) ? result.risk_notes.map(cleanText).filter(Boolean).slice(0, 5) : [],
  };
}

function compactValuationAssumptionInput(source) {
  const inputs = source.inputs || {};
  const periods = Array.isArray(inputs.financial_periods) ? inputs.financial_periods : [];
  const cleanPeriod = (period) => {
    const item = {};
    [
      "period",
      "report_type",
      "revenue",
      "gross_profit",
      "net_profit_parent",
      "income_tax_expense",
      "interest_expense",
      "depreciation_amortization",
      "ebitda_reported",
      "operating_cash_flow",
      "capital_expenditure",
      "cash_and_equivalents",
      "short_term_borrowing",
      "non_current_liab_due_1y",
      "long_term_borrowing",
      "total_shares",
      "eps_reported",
      "cash_dividend",
      "dividend_per_share_reported",
    ].forEach((key) => {
      const value = period?.[key];
      if (value !== undefined && value !== null && value !== "") {
        item[key] = value;
      }
    });
    return item;
  };
  const cleanObject = (object, keys) => {
    const item = {};
    keys.forEach((key) => {
      const value = object?.[key];
      if (value !== undefined && value !== null && value !== "") {
        item[key] = value;
      }
    });
    return item;
  };
  return {
    ts_code: source.ts_code || "",
    name: source.name || "",
    methods: source.methods || [],
    unit: "亿元；股本为亿股；比例字段为百分数",
    financial_periods: periods.map(cleanPeriod).filter((period) => Object.keys(period).length > 2).slice(0, 6),
    derived: cleanObject(inputs.derived || {}, [
      "free_cash_flow",
      "free_cash_flow_growth_rate",
      "revenue_growth_rate",
      "net_profit_growth_rate",
      "eps",
      "eps_growth_rate",
      "net_debt",
      "ebitda",
      "gross_margin",
      "net_margin",
    ]),
    current_dcf: cleanObject(inputs.dcf || {}, ["growth_rate", "years", "terminal_growth_rate", "discount_rate"]),
  };
}

function normalizeAssumptionPercent(value, min, max) {
  let number = nullableNumber(value);
  if (!Number.isFinite(Number(number))) return null;
  if (Math.abs(number) > 0 && Math.abs(number) <= 0.2 && max > 1) {
    number *= 100;
  }
  return clampNumber(number, min, max, null);
}

async function fillValuationInputsFromTushare(body) {
  const stock = await resolveStockInput(body.ts_code || body.symbol || body.code || body.name || body.company_name);
  if (!stock?.ts_code) {
    throw badRequest("请先选择股票");
  }

  const range = getDateRange(3650);
  const params = { ts_code: stock.ts_code, start_date: range.start, end_date: range.end };
  const dividendParams = { ts_code: stock.ts_code };
  const requests = await Promise.all([
    callTushareOptional("income", params, [
      "ts_code",
      "ann_date",
      "end_date",
      "total_revenue",
      "revenue",
      "oper_cost",
      "n_income_attr_p",
      "income_tax",
      "int_exp",
    ].join(","), "ts_code,ann_date,end_date,total_revenue,revenue,n_income_attr_p"),
    callTushareOptional("cashflow", params, [
      "ts_code",
      "ann_date",
      "end_date",
      "n_cashflow_act",
      "c_pay_acq_const_fiolta",
    ].join(","), "ts_code,ann_date,end_date,n_cashflow_act"),
    callTushareOptional("balancesheet", params, [
      "ts_code",
      "ann_date",
      "end_date",
      "total_share",
      "money_cap",
      "st_borr",
      "non_cur_liab_due_1y",
      "lt_borr",
      "bond_payable",
    ].join(","), "ts_code,ann_date,end_date,total_share,money_cap"),
    callTushareOptional("fina_indicator", params, [
      "ts_code",
      "ann_date",
      "end_date",
      "eps",
      "ebitda",
    ].join(","), "ts_code,ann_date,end_date,eps"),
    callTushareOptional("dividend", dividendParams, [
      "ts_code",
      "end_date",
      "ann_date",
      "div_proc",
      "cash_div",
      "cash_div_tax",
      "base_share",
      "record_date",
      "ex_date",
      "pay_date",
    ].join(","), "ts_code,end_date,ann_date,cash_div,cash_div_tax,base_share"),
  ]);

  const periodMap = new Map();
  const ensurePeriod = (row) => {
    const endDate = cleanText(row.end_date);
    if (!endDate) return null;
    if (!periodMap.has(endDate)) {
      periodMap.set(endDate, {
        period: valuationPeriodLabelFromEndDate(endDate),
        report_type: valuationReportTypeFromEndDate(endDate),
        _end_date: endDate,
      });
    }
    return periodMap.get(endDate);
  };
  const setAmount = (period, key, value) => {
    if (!period || period[key] !== undefined && period[key] !== null && period[key] !== "") return;
    const number = nullableNumber(value);
    if (Number.isFinite(Number(number))) period[key] = toHundredMillion(number);
  };
  const setNumber = (period, key, value) => {
    if (!period || period[key] !== undefined && period[key] !== null && period[key] !== "") return;
    const number = nullableNumber(value);
    if (Number.isFinite(Number(number))) period[key] = round(number, 4);
  };
  const sortedRows = (rows) => rows
    .slice()
    .sort((a, b) => String(b.end_date || "").localeCompare(String(a.end_date || ""))
      || String(b.ann_date || "").localeCompare(String(a.ann_date || "")));
  const dividendProcScore = (row) => {
    const proc = cleanText(row.div_proc);
    if (proc.includes("实施")) return 3;
    if (proc.includes("股东大会")) return 2;
    if (proc.includes("预案")) return 1;
    return 0;
  };
  const pickDividendRowsByPeriod = (rows) => {
    const grouped = new Map();
    for (const row of rows || []) {
      const endDate = cleanText(row.end_date);
      if (!endDate) continue;
      const current = grouped.get(endDate);
      const score = dividendProcScore(row);
      const currentScore = current ? dividendProcScore(current) : -1;
      if (!current
        || score > currentScore
        || score === currentScore && String(row.ann_date || "").localeCompare(String(current.ann_date || "")) > 0) {
        grouped.set(endDate, row);
      }
    }
    return Array.from(grouped.values())
      .sort((a, b) => String(b.end_date || "").localeCompare(String(a.end_date || ""))
        || String(b.ann_date || "").localeCompare(String(a.ann_date || "")));
  };

  const income = requests.find((item) => item.api_name === "income");
  for (const row of sortedRows(income?.rows || [])) {
    const period = ensurePeriod(row);
    const revenue = firstFiniteServer(row.total_revenue, row.revenue);
    setAmount(period, "revenue", revenue);
    const cost = nullableNumber(row.oper_cost);
    if (period && period.gross_profit === undefined && Number.isFinite(Number(revenue)) && Number.isFinite(Number(cost))) {
      period.gross_profit = toHundredMillion(Number(revenue) - Number(cost));
    }
    setAmount(period, "net_profit_parent", row.n_income_attr_p);
    setAmount(period, "income_tax_expense", row.income_tax);
    setAmount(period, "interest_expense", row.int_exp);
  }

  const cashflow = requests.find((item) => item.api_name === "cashflow");
  for (const row of sortedRows(cashflow?.rows || [])) {
    const period = ensurePeriod(row);
    setAmount(period, "operating_cash_flow", row.n_cashflow_act);
    const capex = nullableNumber(row.c_pay_acq_const_fiolta);
    if (Number.isFinite(Number(capex))) {
      setAmount(period, "capital_expenditure", Math.abs(Number(capex)));
    }
  }

  const balancesheet = requests.find((item) => item.api_name === "balancesheet");
  for (const row of sortedRows(balancesheet?.rows || [])) {
    const period = ensurePeriod(row);
    setNumber(period, "total_shares", toHundredMillionShares(row.total_share));
    setAmount(period, "cash_and_equivalents", row.money_cap);
    setAmount(period, "short_term_borrowing", row.st_borr);
    setAmount(period, "non_current_liab_due_1y", row.non_cur_liab_due_1y);
    setAmount(period, "long_term_borrowing", row.lt_borr);
    setAmount(period, "bonds_payable", row.bond_payable);
  }

  const indicator = requests.find((item) => item.api_name === "fina_indicator");
  for (const row of sortedRows(indicator?.rows || [])) {
    const period = ensurePeriod(row);
    setNumber(period, "eps_reported", row.eps);
    const ebitda = nullableNumber(row.ebitda);
    if (Number.isFinite(Number(ebitda)) && Number(ebitda) > 0) {
      setAmount(period, "ebitda_reported", ebitda);
    }
  }

  const dividend = requests.find((item) => item.api_name === "dividend");
  for (const row of pickDividendRowsByPeriod(dividend?.rows || [])) {
    const period = ensurePeriod(row);
    const perShare = firstFiniteServer(row.cash_div_tax, row.cash_div);
    if (!period || !Number.isFinite(Number(perShare)) || Number(perShare) <= 0) {
      continue;
    }
    setNumber(period, "dividend_per_share_reported", perShare);
    const baseShare = nullableNumber(row.base_share);
    const baseShareHundredMillion = Number.isFinite(Number(baseShare))
      ? toHundredMillionShares(Number(baseShare) * 10000)
      : nullableNumber(period.total_shares);
    if (Number.isFinite(Number(baseShareHundredMillion)) && Number(baseShareHundredMillion) > 0) {
      setNumber(period, "cash_dividend", Number(perShare) * Number(baseShareHundredMillion));
    }
  }

  const sortedPeriods = Array.from(periodMap.values())
    .sort((a, b) => String(b._end_date || "").localeCompare(String(a._end_date || "")));
  const latestPeriod = sortedPeriods[0] || null;
  const latestEndDate = latestPeriod?._end_date || "";
  const annualPeriods = sortedPeriods
    .filter((period) => period.report_type === "annual" && period._end_date !== latestEndDate)
    .slice(0, 5);
  const periods = [latestPeriod, ...annualPeriods]
    .filter(Boolean)
    .map(({ _end_date, ...period }) => period);

  const availableApis = requests.filter((item) => item.rows.length).map((item) => item.api_name);
  const failedApis = requests
    .filter((item) => item.error)
    .map((item) => ({ api_name: item.api_name, message: item.error }));

  if (!periods.length) {
    throw badRequest("TuShare 暂时没有返回可用财报字段，可能是权限不足或该股票财报数据缺失。可以继续手动填写或上传 PDF。");
  }

  return {
    company_name: stock.name || stock.ts_code,
    ts_code: stock.ts_code,
    report_period: periods[0]?.period || "",
    currency: "人民币",
    unit: "亿元",
    source: "tushare",
    confidence: failedApis.length ? 0.58 : 0.72,
    periods,
    extracted: { periods },
    notes: [
      `TuShare 已返回 ${periods.length} 期财务数据：最新一期 + 过去 ${Math.max(0, periods.length - 1)} 年年报。`,
      failedApis.length ? `部分接口不可用：${failedApis.map((item) => item.api_name).join("、")}。` : "",
      "自动回填采用亿元/亿股口径，关键字段仍建议与财报 PDF 复核。",
    ].filter(Boolean),
    available_apis: availableApis,
    failed_apis: failedApis,
  };
}

async function callTushareOptional(apiName, params, fields, fallbackFields = "") {
  try {
    return { api_name: apiName, rows: await callTushare(apiName, params, fields), error: "" };
  } catch (error) {
    if (fallbackFields && fallbackFields !== fields) {
      try {
        return { api_name: apiName, rows: await callTushare(apiName, params, fallbackFields), error: error.message };
      } catch (fallbackError) {
        return { api_name: apiName, rows: [], error: fallbackError.message || error.message };
      }
    }
    return { api_name: apiName, rows: [], error: error.message };
  }
}

function valuationReportTypeFromEndDate(endDate) {
  const raw = cleanText(endDate);
  const monthDay = raw.slice(4, 8);
  if (monthDay === "0331") return "q1";
  if (monthDay === "0630") return "h1";
  if (monthDay === "0930") return "q3";
  return "annual";
}

function valuationPeriodLabelFromEndDate(endDate) {
  const raw = cleanText(endDate);
  const year = raw.slice(0, 4) || "";
  const type = valuationReportTypeFromEndDate(raw);
  if (type === "q1") return `${year}Q1`;
  if (type === "h1") return `${year}H1`;
  if (type === "q3") return `${year}Q3`;
  return year;
}

function firstFiniteServer(...values) {
  for (const value of values) {
    const number = nullableNumber(value);
    if (Number.isFinite(Number(number))) {
      return Number(number);
    }
  }
  return null;
}

function toHundredMillion(value) {
  const number = nullableNumber(value);
  if (!Number.isFinite(Number(number))) return null;
  const abs = Math.abs(Number(number));
  return round(abs > 1000000 ? Number(number) / 100000000 : Number(number), 4);
}

function toHundredMillionShares(value) {
  const number = nullableNumber(value);
  if (!Number.isFinite(Number(number))) return null;
  const abs = Math.abs(Number(number));
  if (abs > 100000000) return round(Number(number) / 100000000, 4);
  if (abs > 1000) return round(Number(number) / 10000, 4);
  return round(Number(number), 4);
}

function valuationMethodKeys() {
  return ["dcf", "ddm", "pe", "peg", "ev_ebitda"];
}

function latestSavedValuation(tsCode) {
  const normalized = normalizeCode(tsCode);
  return (db.valuations || [])
    .filter((entry) => entry.ts_code === normalized && Number.isFinite(Number(entry.fair_price)))
    .slice()
    .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")))[0] || null;
}

function autoValuationBasis(valuation) {
  if (!valuation) {
    return "";
  }
  const methodText = (valuation.methods || []).map(valuationMethodLabel).join("、") || "估值模型";
  return `自动带入最近一次估值结果：${methodText}，合理价值 ${round(valuation.fair_price, 2)} 元，低估线 ${round(valuation.low_price, 2)} 元，高估线 ${round(valuation.high_price, 2)} 元。`;
}

function valuationMethodLabel(method) {
  return {
    dcf: "DCF",
    ddm: "DDM",
    pe: "PE",
    peg: "PEG",
    ev_ebitda: "EV/EBITDA",
  }[method] || method;
}

function buildFinancialValuationPrompt(companyName) {
  let template = "";
  try {
    template = fs.readFileSync(financialValuationPromptFile, "utf8");
  } catch {
    template = "请从上传的财报 PDF 中提取估值模型需要的关键字段，并只返回合法 JSON。公司：{{company_name}}";
  }
  return template.replaceAll("{{company_name}}", companyName || "未知公司");
}

function normalizeValuationExtractPayload(payload) {
  const value = payload && typeof payload === "object" ? payload : {};
  const extracted = value.extracted && typeof value.extracted === "object" ? value.extracted : {};
  const periods = Array.isArray(value.periods)
    ? value.periods
    : Array.isArray(extracted.periods)
      ? extracted.periods
      : [];
  return {
    company_name: value.company_name || "",
    report_period: value.report_period || "",
    currency: value.currency || "人民币",
    unit: value.unit || "亿元",
    confidence: nullableNumber(value.confidence),
    periods,
    extracted,
    notes: Array.isArray(value.notes) ? value.notes : [],
  };
}

async function getDecisionTests() {
  await repairDecisionStockInputs();
  const source = db.decision_tests
    .slice()
    .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
  const items = await mapWithConcurrency(source, 4, enrichDecisionTest);
  return {
    items,
    summary: summarizeDecisionTests(items),
  };
}

async function createDecisionTest(body) {
  const stock = await resolveStockInput(body.ts_code || body.symbol || body.code);
  if (!stock?.ts_code) {
    throw badRequest("请输入要验证的股票代码");
  }
  const mode = ["paper_buy", "next_day"].includes(body.mode) ? body.mode : "paper_buy";
  const entryRule = normalizeDecisionEntryRule(body.entry_rule, mode);
  let entryPrice = nullableNumber(body.entry_price);
  if (entryRule === "custom" && !Number.isFinite(Number(entryPrice))) {
    throw badRequest("自定义买入价不能为空");
  }

  const now = nowIso();
  const item = {
    id: randomUUID(),
    mode,
    ts_code: stock.ts_code,
    symbol: stock.symbol || stock.ts_code.slice(0, 6),
    name: stock.name || stock.ts_code,
    area: stock.area || "",
    industry: stock.industry || "",
    market: stock.market || "",
    signal_date: normalizeDecisionDate(body.signal_date),
    entry_rule: entryRule,
    entry_price: entryPrice,
    horizon_days: Math.round(clampNumber(body.horizon_days, 1, 120, mode === "next_day" ? 3 : 5)),
    thesis: cleanText(body.thesis),
    created_at: now,
    updated_at: now,
  };

  db.decision_tests.unshift(item);
  await persistStore();
  return item;
}

async function deleteDecisionTest(itemId) {
  const index = db.decision_tests.findIndex((item) => item.id === itemId);
  if (index === -1) {
    throw notFound("没有找到这条决策验证");
  }
  db.decision_tests.splice(index, 1);
  await persistStore();
}

async function repairDecisionStockInputs() {
  let changed = false;
  for (const item of db.decision_tests || []) {
    if (/^\d{6}\.(SH|SZ|BJ)$/.test(String(item.ts_code || ""))) {
      continue;
    }
    const stock = await resolveStockInput(item.ts_code || item.name || item.symbol);
    if (!stock?.ts_code || stock.ts_code === item.ts_code) {
      continue;
    }
    item.ts_code = stock.ts_code;
    item.symbol = stock.symbol || stock.ts_code.slice(0, 6);
    item.name = stock.name || stock.ts_code;
    item.area = stock.area || "";
    item.industry = stock.industry || "";
    item.market = stock.market || "";
    item.updated_at = nowIso();
    changed = true;
  }
  if (changed) {
    await persistStore();
  }
}

async function enrichDecisionTest(item) {
  try {
    return {
      ...item,
      evaluation: await evaluateDecisionTest(item),
    };
  } catch (error) {
    return {
      ...item,
      evaluation: {
        status: "error",
        status_label: "读取失败",
        message: error.message || "行情读取失败",
      },
    };
  }
}

async function evaluateDecisionTest(item) {
  const today = formatDateCompactShanghai();
  const targetTradeDate = await getTargetTradeDate();
  const requestedSignalDate = normalizeDecisionDate(item.signal_date);
  let signalDate = requestedSignalDate;

  if (requestedSignalDate > targetTradeDate) {
    if (item.mode === "paper_buy" && requestedSignalDate === today && targetTradeDate) {
      signalDate = targetTradeDate;
    } else {
      return {
        status: "waiting",
        status_label: "等待信号日",
        message: "信号日还没有可用日线数据",
      };
    }
  }

  if (signalDate > today) {
    return {
      status: "waiting",
      status_label: "等待信号日",
      message: "信号日还没有到",
    };
  }

  const rows = await getDailySeries(item.ts_code, shiftCompactDate(signalDate, -45), today);
  if (!rows.length) {
    return {
      status: "waiting",
      status_label: "等待行情",
      message: "还没有读取到信号日之后的日线",
    };
  }

  const entry = resolveDecisionEntry(item, rows, signalDate);
  if (!entry || !Number.isFinite(Number(entry.price))) {
    return {
      status: "waiting",
      status_label: "等待买入价",
      message: entryRuleLabel(item.entry_rule, item.mode) + "尚未形成",
    };
  }

  const entryPrice = Number(entry.price);
  const trackRows = decisionTrackRows(item.entry_rule, rows, entry.trade_date);
  const latestRow = trackRows.at(-1) || entry.row;
  const holdingDays = trackRows.length;
  const horizonDays = Math.round(clampNumber(item.horizon_days, 1, 120, item.mode === "next_day" ? 3 : 5));
  const high = trackRows.length ? Math.max(...trackRows.map((row) => Number(row.high || row.close || entryPrice))) : entryPrice;
  const low = trackRows.length ? Math.min(...trackRows.map((row) => Number(row.low || row.close || entryPrice))) : entryPrice;
  const firstDayRow = trackRows[0] || null;
  const endRow = holdingDays >= horizonDays ? trackRows[horizonDays - 1] : null;
  const currentReturnPct = returnPct(latestRow?.close, entryPrice);
  const resultReturnPct = endRow ? returnPct(endRow.close, entryPrice) : null;
  const maxGainPct = returnPct(high, entryPrice);
  const maxDrawdownPct = returnPct(low, entryPrice);
  const firstDayReturnPct = firstDayRow ? returnPct(firstDayRow.close, entryPrice) : null;
  const completed = holdingDays >= horizonDays;
  const status = completed ? "completed" : "tracking";

  return {
    status,
    status_label: completed ? "已完成" : "验证中",
    verdict: decisionVerdict({ completed, resultReturnPct, currentReturnPct }),
    signal_date: requestedSignalDate,
    effective_signal_date: signalDate,
    entry_date: entry.trade_date,
    entry_price: round(entryPrice, 3),
    entry_label: entryRuleLabel(item.entry_rule, item.mode),
    latest_date: latestRow?.trade_date || "",
    latest_close: nullableNumber(latestRow?.close),
    holding_days: holdingDays,
    remaining_days: Math.max(0, horizonDays - holdingDays),
    current_return_pct: round(currentReturnPct, 2),
    max_gain_pct: round(maxGainPct, 2),
    max_drawdown_pct: round(maxDrawdownPct, 2),
    first_day_return_pct: round(firstDayReturnPct, 2),
    result_date: endRow?.trade_date || "",
    result_return_pct: round(resultReturnPct, 2),
    days: decisionDailyStates(trackRows, entryPrice, horizonDays),
  };
}

function summarizeDecisionTests(items) {
  const completed = items.filter((item) => item.evaluation?.status === "completed");
  const tracking = items.filter((item) => item.evaluation?.status === "tracking");
  const wins = completed.filter((item) => isDecisionWin(item.evaluation));
  const resultReturns = completed
    .map((item) => item.evaluation?.result_return_pct)
    .filter((value) => Number.isFinite(Number(value)));
  return {
    total: items.length,
    tracking: tracking.length,
    completed: completed.length,
    wins: wins.length,
    win_rate: completed.length ? round((wins.length / completed.length) * 100, 2) : null,
    avg_result_return_pct: resultReturns.length
      ? round(resultReturns.reduce((sum, value) => sum + Number(value), 0) / resultReturns.length, 2)
      : null,
  };
}

function resolveDecisionEntry(item, rows, signalDate) {
  const rule = normalizeDecisionEntryRule(item.entry_rule, item.mode);
  const row = item.mode === "next_day"
    ? rows.find((entry) => entry.trade_date > signalDate)
    : rows.find((entry) => entry.trade_date >= signalDate);

  if (!row) {
    return null;
  }
  return {
    row,
    trade_date: row.trade_date,
    price: decisionEntryPrice(rule, row, item.entry_price),
  };
}

function decisionTrackRows(entryRule, rows, entryDate) {
  const rule = normalizeDecisionEntryRule(entryRule, "");
  if (rule === "close") {
    return rows.filter((row) => row.trade_date > entryDate);
  }
  return rows.filter((row) => row.trade_date >= entryDate);
}

function decisionEntryPrice(rule, row, customPrice) {
  if (rule === "custom") {
    return customPrice;
  }
  return rule === "open" ? row.open : row.close;
}

function decisionDailyStates(trackRows, entryPrice, horizonDays) {
  const displayLimit = Math.max(60, Math.min(240, Number(horizonDays) || 60));
  return trackRows.slice(0, displayLimit).map((row, index) => {
    const closeReturn = returnPct(row.close, entryPrice);
    const highReturn = returnPct(row.high, entryPrice);
    const lowReturn = returnPct(row.low, entryPrice);
    return {
      day: index + 1,
      trade_date: row.trade_date,
      open: nullableNumber(row.open),
      high: nullableNumber(row.high),
      low: nullableNumber(row.low),
      close: nullableNumber(row.close),
      pct_chg: nullableNumber(row.pct_chg),
      return_pct: round(closeReturn, 2),
      high_return_pct: round(highReturn, 2),
      low_return_pct: round(lowReturn, 2),
      status: decisionDayStatus(closeReturn),
    };
  });
}

function decisionDayStatus(returnPctValue) {
  const value = Number(returnPctValue);
  if (!Number.isFinite(value)) {
    return "等待";
  }
  if (value >= 5) {
    return "强盈利";
  }
  if (value > 0) {
    return "盈利";
  }
  if (value <= -5) {
    return "明显亏损";
  }
  return "小幅回撤";
}

function decisionVerdict({ completed, resultReturnPct, currentReturnPct }) {
  if (!completed) {
    return Number(currentReturnPct) >= 0 ? "暂时正确" : "暂时承压";
  }
  return Number(resultReturnPct) > 0 ? "方向正确" : "验证失败";
}

function isDecisionWin(evaluation) {
  if (!evaluation) {
    return false;
  }
  return Number(evaluation.result_return_pct) > 0;
}

function normalizeDecisionEntryRule(rule, mode) {
  const value = String(rule || "").trim();
  if (["open", "close", "custom"].includes(value)) {
    return value;
  }
  return {
    today_close: "close",
    next_open: "open",
    next_close: "close",
  }[value] || (mode === "next_day" ? "open" : "close");
}

function entryRuleLabel(rule, mode) {
  const dayLabel = mode === "next_day" ? "次日" : "信号日";
  return {
    open: `${dayLabel}开盘价`,
    close: `${dayLabel}收盘价`,
    custom: "自定义买入价",
  }[normalizeDecisionEntryRule(rule, mode)] || `${dayLabel}收盘价`;
}

function normalizeDecisionDate(value) {
  const compact = compactDate(value);
  return /^\d{8}$/.test(compact) ? compact : formatDateCompactShanghai();
}

function shiftCompactDate(value, days) {
  const raw = String(value || "");
  if (!/^\d{8}$/.test(raw)) {
    return raw;
  }
  const date = new Date(Date.UTC(
    Number(raw.slice(0, 4)),
    Number(raw.slice(4, 6)) - 1,
    Number(raw.slice(6, 8)),
  ));
  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return formatDateCompactUtc(date);
}

function returnPct(price, entryPrice) {
  if (!Number.isFinite(Number(price)) || !Number.isFinite(Number(entryPrice)) || Number(entryPrice) === 0) {
    return null;
  }
  return ((Number(price) - Number(entryPrice)) / Number(entryPrice)) * 100;
}

function sectorPoolKey(level, code, name) {
  return `${normalizeSectorLevel(level)}:${cleanText(code || name)}`;
}

function findWatchItem(itemId) {
  const item = findWatchItemMaybe(itemId);
  if (!item) {
    throw notFound("股票池中没有这只股票");
  }
  return item;
}

function findWatchItemMaybe(itemId) {
  const normalized = normalizeCode(itemId);
  return db.watchlist.find((entry) => entry.id === itemId || (normalized && entry.ts_code === normalized)) || null;
}

async function getWatchItemDetail(itemId) {
  const item = findWatchItem(itemId);
  const reportsResult = await getReports(item.ts_code).catch((error) => ({
    reports: [],
    reportError: error.message,
  }));

  return {
    item: enrichWatchItem(item),
    history: (db.price_history[item.ts_code] || []).slice(0, 180),
    valuation_history: db.valuation_history
      .filter((entry) => entry.watchlist_id === item.id || entry.ts_code === item.ts_code)
      .slice(0, 80),
    reports: reportsResult.reports || [],
    reportError: reportsResult.reportError || "",
    links: buildInfoLinks(item),
    company_analysis_latest: latestCompanyAnalysis(item.ts_code),
    company_analysis_history: companyAnalysisHistory(item.ts_code),
    company_analysis_status: companyAnalysisStatus(item.ts_code),
    in_watchlist: true,
  };
}

async function getStockDetail(identifier) {
  const watchItem = findWatchItemMaybe(identifier);
  if (watchItem) {
    return getWatchItemDetail(watchItem.id);
  }

  const tsCode = normalizeCode(identifier);
  if (!tsCode) {
    throw badRequest("请提供股票代码");
  }

  const stock = await findStock(tsCode);
  const latestPrice = await getLatestPriceForStock(tsCode).catch(() => null);
  const item = buildStockDetailItem(stock, latestPrice);
  const reportsResult = await getReports(tsCode).catch((error) => ({
    reports: [],
    reportError: error.message,
  }));

  return {
    item,
    history: (db.price_history[tsCode] || []).slice(0, 180),
    valuation_history: [],
    reports: reportsResult.reports || [],
    reportError: reportsResult.reportError || "",
    links: buildInfoLinks(item),
    company_analysis_latest: latestCompanyAnalysis(item.ts_code),
    company_analysis_history: companyAnalysisHistory(item.ts_code),
    company_analysis_status: companyAnalysisStatus(item.ts_code),
    in_watchlist: false,
  };
}

async function getCompanyAnalysis(identifier) {
  const stock = await resolveStockForAnalysis(identifier);
  return {
    latest: latestCompanyAnalysis(stock.ts_code),
    history: companyAnalysisHistory(stock.ts_code),
    status: companyAnalysisStatus(stock.ts_code),
  };
}

async function refreshCompanyAnalysis(identifier, body = {}) {
  if (!GEMINI_API_KEY) {
    throw badRequest("缺少 GEMINI_API_KEY，请检查 .env");
  }

  const stock = await resolveStockForAnalysis(identifier);
  const inputCompanyName = cleanText(body.company_name) || stock.name || stock.ts_code;
  const record = await createCompanyAnalysisRecord(stock, inputCompanyName);
  return {
    latest: record,
    history: companyAnalysisHistory(stock.ts_code),
    status: companyAnalysisStatus(stock.ts_code),
  };
}

async function createCompanyAnalysisRecord(stock, inputCompanyName) {
  const promptCompanyName = cleanText(inputCompanyName) || stock.name || stock.ts_code;
  const prompt = buildCompanyAnalysisPrompt(promptCompanyName);
  const analysis = normalizeCompanyAnalysisPayload(
    await callGeminiJson(prompt),
    promptCompanyName,
  );
  const record = {
    id: randomUUID(),
    ts_code: stock.ts_code,
    stock_name: stock.name || stock.ts_code,
    input_company_name: promptCompanyName,
    model: GEMINI_MODEL,
    prompt_version: "company-analysis-v1",
    created_at: nowIso(),
    analysis,
  };

  db.company_analyses.unshift(record);
  await persistStore();
  return record;
}

async function resolveStockForAnalysis(identifier) {
  const rawIdentifier = cleanText(identifier);
  const watchItem = findWatchItemMaybe(identifier);
  if (watchItem) {
    return {
      ts_code: watchItem.ts_code,
      symbol: watchItem.symbol,
      name: watchItem.name,
      area: watchItem.area,
      industry: watchItem.industry,
      market: watchItem.market,
      list_date: watchItem.list_date,
    };
  }

  const tsCode = looksLikeStockCode(identifier) ? normalizeCode(identifier) : "";
  if (!tsCode) {
    const watchItemByName = db.watchlist.find((entry) => entry.name === rawIdentifier);
    if (watchItemByName) {
      return {
        ts_code: watchItemByName.ts_code,
        symbol: watchItemByName.symbol,
        name: watchItemByName.name,
        area: watchItemByName.area,
        industry: watchItemByName.industry,
        market: watchItemByName.market,
        list_date: watchItemByName.list_date,
      };
    }
    const stocks = await getStockBasics();
    const stockByName = stocks.find((item) => item.name === rawIdentifier);
    if (stockByName) {
      return stockByName;
    }
    throw badRequest("请提供股票代码或公司名称");
  }
  return findStock(tsCode);
}

function looksLikeStockCode(value) {
  const raw = String(value || "").trim().toUpperCase();
  return /^\d{6}(\.(SH|SZ|BJ))?$/.test(raw);
}

function companyAnalysisRecords(tsCode) {
  const normalized = normalizeCode(tsCode);
  return (db.company_analyses || [])
    .filter((record) => record.ts_code === normalized)
    .slice()
    .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
}

function latestCompanyAnalysis(tsCode) {
  return companyAnalysisRecords(tsCode)[0] || null;
}

function companyAnalysisHistory(tsCode) {
  return companyAnalysisRecords(tsCode).map((record) => ({
    id: record.id,
    ts_code: record.ts_code,
    stock_name: record.stock_name,
    input_company_name: record.input_company_name || record.stock_name,
    model: record.model,
    prompt_version: record.prompt_version,
    created_at: record.created_at,
  }));
}

function companyAnalysisStatus(tsCode) {
  const normalized = normalizeCode(tsCode);
  const job = companyAnalysisJobs.get(normalized);
  if (job && ["pending", "running", "failed"].includes(job.status)) {
    return { ...job };
  }
  const latest = latestCompanyAnalysis(normalized);
  if (latest) {
    return {
      status: "ready",
      label: "已生成",
      ts_code: normalized,
      stock_name: latest.stock_name,
      record_id: latest.id,
      updated_at: latest.created_at,
      error: "",
    };
  }
  return {
    status: "empty",
    label: "尚未生成",
    ts_code: normalized,
    stock_name: "",
    record_id: "",
    updated_at: "",
    error: "",
  };
}

function scheduleCompanyAnalysisForWatchItem(item, reason) {
  const tsCode = normalizeCode(item?.ts_code);
  if (!tsCode || !GEMINI_API_KEY || latestCompanyAnalysis(tsCode)) {
    return;
  }

  const current = companyAnalysisJobs.get(tsCode);
  if (current && ["pending", "running"].includes(current.status)) {
    return;
  }

  const job = {
    status: "pending",
    label: "等待自动分析",
    ts_code: tsCode,
    stock_name: item.name || tsCode,
    input_company_name: item.name || tsCode,
    reason: reason || "watchlist-added",
    record_id: "",
    created_at: nowIso(),
    updated_at: nowIso(),
    error: "",
  };
  companyAnalysisJobs.set(tsCode, job);

  const timer = setTimeout(() => {
    runScheduledCompanyAnalysis(item, job).catch((error) => {
      console.error("auto company analysis failed", error);
    });
  }, 0);
  timer.unref?.();
}

async function runScheduledCompanyAnalysis(item, job) {
  const tsCode = normalizeCode(item?.ts_code);
  if (!tsCode) {
    return;
  }
  if (latestCompanyAnalysis(tsCode)) {
    companyAnalysisJobs.delete(tsCode);
    return;
  }

  job.status = "running";
  job.label = "自动分析中";
  job.updated_at = nowIso();
  job.error = "";
  companyAnalysisJobs.set(tsCode, job);

  try {
    const record = await createCompanyAnalysisRecord({
      ts_code: item.ts_code,
      symbol: item.symbol,
      name: item.name,
      area: item.area,
      industry: item.industry,
      market: item.market,
      list_date: item.list_date,
    }, item.name || item.ts_code);
    companyAnalysisJobs.set(tsCode, {
      ...job,
      status: "ready",
      label: "已自动生成",
      record_id: record.id,
      updated_at: nowIso(),
      error: "",
    });
  } catch (error) {
    companyAnalysisJobs.set(tsCode, {
      ...job,
      status: "failed",
      label: "自动分析失败",
      updated_at: nowIso(),
      error: error.message || "公司分析生成失败",
    });
  }
}

function buildCompanyAnalysisPrompt(companyName) {
  let template = "";
  try {
    template = fs.readFileSync(companyAnalysisPromptFile, "utf8");
  } catch {
    template = "请分析上市公司 {{company_name}}，并只返回一个合法 JSON 对象。";
  }
  return template.replaceAll("{{company_name}}", companyName || "未知");
}

async function callGeminiJson(prompt) {
  return callGeminiJsonWithParts([{ text: prompt }]);
}

async function callGeminiJsonWithParts(parts) {
  const modelPath = GEMINI_MODEL.startsWith("models/") ? GEMINI_MODEL : `models/${GEMINI_MODEL}`;
  const url = `${GEMINI_ENDPOINT}/${encodeURIComponent(modelPath).replaceAll("%2F", "/")}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const safeParts = Array.isArray(parts) && parts.length ? parts : [{ text: "" }];
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: safeParts,
        }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          maxOutputTokens: 12000,
        },
      }),
      signal: AbortSignal.timeout(120000),
    });
  } catch (cause) {
    if (process.platform === "win32") {
      return callGeminiJsonViaPowerShell(safeParts, cause);
    }
    const error = new Error(`Gemini 网络请求失败：${cause.message}`);
    error.status = 502;
    throw error;
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || `Gemini HTTP ${response.status}`;
    const error = new Error(message);
    error.status = 502;
    throw error;
  }

  return parseGeminiPayload(payload);
}

async function callGeminiJsonViaPowerShell(parts, fetchError) {
  const script = `
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$OutputEncoding = [Text.Encoding]::UTF8
$partsJson = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($env:GEMINI_PARTS_B64))
$model = $env:GEMINI_MODEL
$endpoint = $env:GEMINI_ENDPOINT.TrimEnd('/')
$modelPath = if ($model.StartsWith('models/')) { $model } else { "models/$model" }
$uri = $endpoint + '/' + $modelPath + ':generateContent?key=' + [Uri]::EscapeDataString($env:GEMINI_API_KEY)
$generationConfig = @{
  temperature = 0.2
  responseMimeType = 'application/json'
  maxOutputTokens = 12000
} | ConvertTo-Json -Depth 10 -Compress
$body = '{"contents":[{"role":"user","parts":' + $partsJson + '}],"generationConfig":' + $generationConfig + '}'
try {
  $response = Invoke-RestMethod -Uri $uri -Method Post -ContentType 'application/json; charset=utf-8' -Body $body -TimeoutSec 120
} catch {
  $errorText = ''
  if ($_.Exception.Response) {
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream) {
      $reader = New-Object System.IO.StreamReader($stream)
      $errorText = $reader.ReadToEnd()
    }
  }
  if ($errorText) {
    throw $errorText
  }
  throw
}
$response | ConvertTo-Json -Depth 100 -Compress
`;
  const payloadText = await runPowerShell(script, {
    GEMINI_API_KEY,
    GEMINI_MODEL,
    GEMINI_ENDPOINT,
    GEMINI_PARTS_B64: Buffer.from(JSON.stringify(parts), "utf8").toString("base64"),
  }).catch((error) => {
    const wrapped = new Error(`Gemini 网络请求失败：${fetchError?.message || error.message}；PowerShell 兜底也失败：${error.message}`);
    wrapped.status = 502;
    throw wrapped;
  });

  let payload;
  try {
    payload = JSON.parse(payloadText);
  } catch {
    throw badGateway("Gemini PowerShell 兜底返回解析失败");
  }
  return parseGeminiPayload(payload);
}

function parseGeminiPayload(payload) {
  const text = (payload.candidates || [])
    .flatMap((candidate) => candidate?.content?.parts || [])
    .map((part) => part.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
  if (!text) {
    const error = new Error("Gemini 没有返回可解析内容");
    error.status = 502;
    throw error;
  }

  return parseJsonObject(text);
}

function runPowerShell(script, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const encodedCommand = Buffer.from(script, "utf16le").toString("base64");
    const child = spawn("powershell.exe", [
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-EncodedCommand",
      encodedCommand,
    ], {
      env: {
        ...process.env,
        ...extraEnv,
      },
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("PowerShell 调用超时"));
    }, 130000);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0 && stdout.trim()) {
        resolve(stdout.trim());
        return;
      }
      reject(new Error((stderr || stdout || `PowerShell 退出码 ${code}`).trim()));
    });
  });
}

function parseJsonObject(text) {
  const cleaned = String(text || "")
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw badGateway("Gemini 返回内容不是 JSON 对象");
  }
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw badGateway("Gemini 返回 JSON 解析失败");
  }
}

function normalizeCompanyAnalysisPayload(payload, fallbackCompanyName) {
  const value = payload && typeof payload === "object" ? payload : {};
  return {
    company_name: value.company_name || fallbackCompanyName || "未知",
    modules: Array.isArray(value.modules) ? value.modules : [],
  };
}

function buildStockDetailItem(stock, price) {
  const item = {
    id: "",
    ts_code: stock.ts_code,
    symbol: stock.symbol || stock.ts_code.slice(0, 6),
    name: stock.name || stock.ts_code,
    area: stock.area || "",
    industry: stock.industry || "",
    market: stock.market || "",
    list_date: stock.list_date || "",
    group_id: "",
    group: null,
    note: "",
    valuation_basis: "",
    low_price: null,
    fair_price: null,
    high_price: null,
    valuation_updated_at: "",
    created_at: "",
    updated_at: "",
    price: price || null,
  };

  return {
    ...item,
    valuation: computeValuation(item, price),
    sync: syncStateForCode(item.ts_code),
  };
}

async function getLatestPriceForStock(tsCode) {
  if (db.prices[tsCode]) {
    return db.prices[tsCode];
  }

  const range = getDateRange(45);
  const [dailyRows, metricRows] = await Promise.all([
    callTushare("daily", {
      ts_code: tsCode,
      start_date: range.start,
      end_date: range.end,
    }, "ts_code,trade_date,open,high,low,close,pre_close,change,pct_chg,vol,amount"),
    callTushare("daily_basic", {
      ts_code: tsCode,
      start_date: range.start,
      end_date: range.end,
    }, "ts_code,trade_date,turnover_rate,volume_ratio,pe,pb,ps,total_mv,circ_mv"),
  ]);

  const daily = dailyRows.map(normalizeDailyRow).sort(sortTradeDateDesc);
  const metrics = metricRows.map(normalizeMetricRow).sort(sortTradeDateDesc);
  const latest = daily[0];
  if (!latest) {
    return null;
  }

  const metric = metrics.find((row) => row.trade_date === latest.trade_date) || metrics[0] || {};
  return {
    ...latest,
    turnover_rate: metric.turnover_rate ?? null,
    volume_ratio: metric.volume_ratio ?? null,
    pe: metric.pe ?? null,
    pb: metric.pb ?? null,
    ps: metric.ps ?? null,
    total_mv: metric.total_mv ?? null,
    circ_mv: metric.circ_mv ?? null,
    synced_at: nowIso(),
  };
}

async function getStockChart(tsCode, period) {
  const normalized = normalizeCode(tsCode);
  const safePeriod = ["intraday", "day", "week", "month", "quarter", "year"].includes(period)
    ? period
    : "day";

  if (safePeriod === "intraday") {
    return getIntradayChart(normalized);
  }

  if (safePeriod === "week") {
    const range = getDateRange(1200);
    const rows = await callTushare("weekly", {
      ts_code: normalized,
      start_date: range.start,
      end_date: range.end,
    }, "ts_code,trade_date,open,high,low,close,vol,amount");
    return {
      ts_code: normalized,
      period: safePeriod,
      rows: normalizeBarRows(rows).slice(-240),
    };
  }

  if (safePeriod === "month" || safePeriod === "quarter" || safePeriod === "year") {
    const range = getDateRange(3650);
    const rows = await callTushare("monthly", {
      ts_code: normalized,
      start_date: range.start,
      end_date: range.end,
    }, "ts_code,trade_date,open,high,low,close,vol,amount");
    const monthly = normalizeBarRows(rows);
    const output = safePeriod === "month"
      ? monthly.slice(-180)
      : aggregateBars(monthly, safePeriod).slice(-160);
    return {
      ts_code: normalized,
      period: safePeriod,
      rows: output,
    };
  }

  const range = getDateRange(540);
  const rows = await callTushare("daily", {
    ts_code: normalized,
    start_date: range.start,
    end_date: range.end,
  }, "ts_code,trade_date,open,high,low,close,vol,amount");
  return {
    ts_code: normalized,
    period: "day",
    rows: normalizeBarRows(rows).slice(-260),
  };
}

async function getShortStrategyData(identifier) {
  const stock = await resolveStockInput(identifier);
  const tsCode = normalizeCode(stock?.ts_code || identifier);
  if (!tsCode) {
    throw badRequest("请先选择或输入有效股票代码");
  }

  const range = getDateRange(240);
  const [dailyResult, dailyBasicResult] = await Promise.allSettled([
    getStrategyDailyRows(tsCode, range.start, range.end),
    callTushare("daily_basic", {
      ts_code: tsCode,
      start_date: range.start,
      end_date: range.end,
    }, "ts_code,trade_date,turnover_rate,turnover_rate_f,volume_ratio,pe,pb,total_mv,circ_mv"),
  ]);

  if (dailyResult.status === "rejected") {
    throw badGateway("行情数据加载失败，请稍后重试");
  }

  const dailySource = dailyResult.value || { rows: [], source: "daily", adj: "" };
  const daily = dailySource.rows
    .map(normalizeStrategyDailyRow)
    .filter((row) => row.trade_date)
    .sort((a, b) => Number(a.trade_date) - Number(b.trade_date));
  const dailyBasic = settledValue(dailyBasicResult, [])
    .map(normalizeStrategyDailyBasicRow)
    .filter((row) => row.trade_date)
    .sort((a, b) => Number(a.trade_date) - Number(b.trade_date));

  const latest = daily.at(-1) || null;
  const latestMetric = latest
    ? dailyBasic.find((row) => row.trade_date === latest.trade_date) || dailyBasic.at(-1) || {}
    : {};
  const intradayDates = daily.slice(-20).map((row) => row.trade_date).filter(Boolean);
  const [limitResult, nextTradeDateResult, intradayResult] = await Promise.allSettled([
    latest ? getStrategyLimit(tsCode, latest.trade_date) : Promise.resolve(null),
    latest ? getNextOpenTradeDate(latest.trade_date) : Promise.resolve(""),
    intradayDates.length ? getStrategyIntradayProfiles(tsCode, intradayDates) : Promise.resolve({ rows: [], source: "" }),
  ]);
  const intradayPayload = settledValue(intradayResult, { rows: [], source: "", warning: "" }) || { rows: [], source: "", warning: "" };

  const realtimeQuote = latest
    ? {
        tsCode,
        stockName: stock?.name || tsCode,
        currentPrice: latest.close,
        open: latest.open,
        high: latest.high,
        low: latest.low,
        preClose: latest.pre_close,
        changePercent: latest.pct_chg,
        volume: latest.vol,
        amount: latest.amount,
        turnoverRate: latestMetric.turnover_rate ?? latestMetric.turnover_rate_f ?? null,
        volumeRatio: latestMetric.volume_ratio ?? null,
        updateTime: nowIso(),
        isRealtime: false,
      }
    : null;

  return {
    stock: {
      tsCode,
      stockName: stock?.name || tsCode,
      industry: stock?.industry || "",
      area: stock?.area || "",
    },
    daily,
    dailyBasic,
    intradayProfiles: Array.isArray(intradayPayload.rows) ? intradayPayload.rows : [],
    limit: settledValue(limitResult, null),
    realtimeQuote,
    tradeCalendar: settledValue(nextTradeDateResult, "")
      ? [{ calDate: settledValue(nextTradeDateResult, ""), isOpen: true }]
      : [],
    meta: {
      startDate: range.start,
      endDate: range.end,
      adj: dailySource.adj || "",
      source: dailySource.source || "daily",
      intradaySource: intradayPayload.source || "",
      nextTradeDate: settledValue(nextTradeDateResult, ""),
      updateTime: nowIso(),
      warnings: [
        dailyBasicResult.status === "rejected" ? "每日基础指标暂未获取到，量能和换手率会使用可用行情降级测算。" : "",
        limitResult.status === "rejected" ? "涨跌停价格暂未获取到，涨跌停状态按未知处理。" : "",
        intradayResult.status === "rejected" ? "分钟线暂未获取到，日内做T概率将使用日线保守近似。" : "",
        intradayPayload.warning || "",
        dailySource.warning || "",
      ].filter(Boolean),
    },
  };
}

async function getStrategyIntradayProfiles(tsCode, tradeDates) {
  const dates = Array.from(new Set((tradeDates || []).map((date) => compactDate(date)).filter(Boolean))).slice(-20);
  if (!dates.length) {
    return { rows: [], source: "" };
  }

  const cacheKey = `${tsCode}:${dates.join(",")}`;
  const cached = strategyIntradayProfileCache.get(cacheKey);
  if (cached?.value && cached.expiresAt > Date.now()) {
    return cached.value;
  }
  if (cached?.promise) {
    return cached.promise;
  }

  const promise = (async () => {
    const packages = await mapWithConcurrency(dates, 2, async (tradeDate, index) => {
      if (index > 0) {
        await sleep(120);
      }
      try {
        const rows = await getStrategyMinuteRows(tsCode, tradeDate);
        return buildStrategyIntradayProfile(tsCode, tradeDate, rows);
      } catch (error) {
        return null;
      }
    });
    const rows = packages.filter(Boolean).sort((a, b) => String(a.trade_date).localeCompare(String(b.trade_date)));
    const value = {
      rows,
      source: rows.length ? "stk_mins" : "",
      warning: rows.length ? "" : "分钟线暂未获取到，日内做T概率将使用日线保守近似。",
    };
    strategyIntradayProfileCache.set(cacheKey, {
      value,
      expiresAt: Date.now() + 20 * 60 * 1000,
    });
    return value;
  })();

  strategyIntradayProfileCache.set(cacheKey, {
    promise,
    expiresAt: Date.now() + 90 * 1000,
  });

  try {
    return await promise;
  } finally {
    const current = strategyIntradayProfileCache.get(cacheKey);
    if (current?.promise === promise && !current.value) {
      strategyIntradayProfileCache.delete(cacheKey);
    }
  }
}

async function getStrategyMinuteRows(tsCode, tradeDate) {
  const day = formatDateHuman(tradeDate);
  const rows = await callTushare("stk_mins", {
    ts_code: tsCode,
    freq: "1min",
    start_date: `${day} 09:30:00`,
    end_date: `${day} 15:00:00`,
  }, "ts_code,trade_time,open,close,high,low,vol,amount");

  return rows
    .map((row) => ({
      ts_code: row.ts_code,
      trade_time: String(row.trade_time || ""),
      open: nullableNumber(row.open),
      high: nullableNumber(row.high),
      low: nullableNumber(row.low),
      close: nullableNumber(row.close),
      vol: nullableNumber(row.vol),
      amount: nullableNumber(row.amount),
    }))
    .filter((row) => row.trade_time
      && Number.isFinite(Number(row.open))
      && Number.isFinite(Number(row.high))
      && Number.isFinite(Number(row.low))
      && Number.isFinite(Number(row.close))
      && Number(row.open) > 0
      && Number(row.high) >= Number(row.low)
      && Number(row.close) > 0)
    .sort((a, b) => String(a.trade_time).localeCompare(String(b.trade_time)));
}

function buildStrategyIntradayProfile(tsCode, tradeDate, rows) {
  if (!Array.isArray(rows) || rows.length < 10) {
    return null;
  }

  const first = rows[0];
  const last = rows.at(-1);
  const open = Number(first.open);
  const close = Number(last.close);
  const dayHigh = Math.max(...rows.map((row) => Number(row.high)).filter(Number.isFinite));
  const dayLow = Math.min(...rows.map((row) => Number(row.low)).filter(Number.isFinite));
  if (![open, close, dayHigh, dayLow].every(Number.isFinite) || open <= 0 || dayHigh <= 0 || dayLow <= 0) {
    return null;
  }

  let peakPrice = open;
  let peakTime = first.trade_time;
  let bestDrawdown = 0;
  let drawdownSellPrice = open;
  let drawdownBuyPrice = open;
  let drawdownSellTime = first.trade_time;
  let drawdownBuyTime = first.trade_time;

  let troughPrice = open;
  let troughTime = first.trade_time;
  let bestRebound = 0;
  let reboundBuyPrice = open;
  let reboundSellPrice = open;
  let reboundBuyTime = first.trade_time;
  let reboundSellTime = first.trade_time;

  for (const row of rows) {
    const high = Number(row.high);
    const low = Number(row.low);

    if (peakPrice > 0 && Number.isFinite(low)) {
      const drawdown = Math.max(0, (peakPrice - low) / peakPrice);
      if (drawdown > bestDrawdown) {
        bestDrawdown = drawdown;
        drawdownSellPrice = peakPrice;
        drawdownBuyPrice = low;
        drawdownSellTime = peakTime;
        drawdownBuyTime = row.trade_time;
      }
    }
    if (Number.isFinite(high) && high > peakPrice) {
      peakPrice = high;
      peakTime = row.trade_time;
    }

    if (troughPrice > 0 && Number.isFinite(high)) {
      const rebound = Math.max(0, (high - troughPrice) / troughPrice);
      if (rebound > bestRebound) {
        bestRebound = rebound;
        reboundBuyPrice = troughPrice;
        reboundSellPrice = high;
        reboundBuyTime = troughTime;
        reboundSellTime = row.trade_time;
      }
    }
    if (Number.isFinite(low) && low < troughPrice) {
      troughPrice = low;
      troughTime = row.trade_time;
    }
  }

  return {
    ts_code: tsCode,
    trade_date: tradeDate,
    source: "stk_mins",
    sample_count: rows.length,
    open: round(open, 4),
    close: round(close, 4),
    high: round(dayHigh, 4),
    low: round(dayLow, 4),
    high_from_open: round(dayHigh / open - 1, 6),
    low_from_open: round(dayLow / open - 1, 6),
    close_from_open: round(close / open - 1, 6),
    drawdown_amplitude: round(bestDrawdown, 6),
    rebound_amplitude: round(bestRebound, 6),
    potential_drawdown_amplitude: round(Math.max(0, (dayHigh - dayLow) / dayHigh), 6),
    potential_rebound_amplitude: round(Math.max(0, (dayHigh - dayLow) / dayLow), 6),
    drawdown_sell_price: round(drawdownSellPrice, 4),
    drawdown_buy_price: round(drawdownBuyPrice, 4),
    drawdown_sell_time: drawdownSellTime,
    drawdown_buy_time: drawdownBuyTime,
    rebound_buy_price: round(reboundBuyPrice, 4),
    rebound_sell_price: round(reboundSellPrice, 4),
    rebound_buy_time: reboundBuyTime,
    rebound_sell_time: reboundSellTime,
  };
}

async function getStrategyDailyRows(tsCode, startDate, endDate) {
  try {
    const rows = await callTushare("pro_bar", {
      ts_code: tsCode,
      start_date: startDate,
      end_date: endDate,
      adj: "qfq",
      ma: [5, 10, 20],
    }, "ts_code,trade_date,open,high,low,close,pre_close,change,pct_chg,vol,amount,ma5,ma10,ma20,ma_5,ma_10,ma_20");
    if (rows.length) {
      return { rows, source: "pro_bar", adj: "qfq" };
    }
  } catch (error) {
    // pro_bar is not available for every token/API mode. Fall back to daily and compute MA on the client.
  }

  const rows = await callTushare("daily", {
    ts_code: tsCode,
    start_date: startDate,
    end_date: endDate,
  }, "ts_code,trade_date,open,high,low,close,pre_close,change,pct_chg,vol,amount");

  return {
    rows,
    source: "daily",
    adj: "",
    warning: "前复权行情暂未获取到，当前使用日线行情并在页面内计算均线。",
  };
}

async function getStrategyLimit(tsCode, tradeDate) {
  const rows = await callTushare("stk_limit", {
    ts_code: tsCode,
    trade_date: tradeDate,
  }, "ts_code,trade_date,up_limit,down_limit");
  const row = rows[0];
  if (!row) {
    return null;
  }
  return {
    ts_code: row.ts_code,
    trade_date: String(row.trade_date || ""),
    up_limit: nullableNumber(row.up_limit),
    down_limit: nullableNumber(row.down_limit),
  };
}

async function getNextOpenTradeDate(afterDate) {
  const startDate = addCompactDays(afterDate, 1);
  const endDate = addCompactDays(afterDate, 45);
  const rows = await callTushare("trade_cal", {
    exchange: "SSE",
    start_date: startDate,
    end_date: endDate,
  }, "exchange,cal_date,is_open,pretrade_date");

  return rows
    .filter((row) => row.is_open === 1 && String(row.cal_date || "") > String(afterDate || ""))
    .map((row) => String(row.cal_date || ""))
    .sort()[0] || "";
}

function normalizeStrategyDailyRow(row) {
  return {
    ts_code: row.ts_code,
    trade_date: String(row.trade_date || ""),
    open: nullableNumber(row.open),
    high: nullableNumber(row.high),
    low: nullableNumber(row.low),
    close: nullableNumber(row.close),
    pre_close: nullableNumber(row.pre_close),
    change: nullableNumber(row.change),
    pct_chg: nullableNumber(row.pct_chg),
    vol: nullableNumber(row.vol),
    amount: nullableNumber(row.amount),
    ma5: nullableNumber(row.ma5 ?? row.ma_5),
    ma10: nullableNumber(row.ma10 ?? row.ma_10),
    ma20: nullableNumber(row.ma20 ?? row.ma_20),
  };
}

function normalizeStrategyDailyBasicRow(row) {
  return {
    ts_code: row.ts_code,
    trade_date: String(row.trade_date || ""),
    turnover_rate: nullableNumber(row.turnover_rate),
    turnover_rate_f: nullableNumber(row.turnover_rate_f),
    volume_ratio: nullableNumber(row.volume_ratio),
    pe: nullableNumber(row.pe),
    pb: nullableNumber(row.pb),
    total_mv: nullableNumber(row.total_mv),
    circ_mv: nullableNumber(row.circ_mv),
  };
}

function addCompactDays(value, days) {
  const raw = String(value || "");
  const year = Number(raw.slice(0, 4));
  const month = Number(raw.slice(4, 6));
  const day = Number(raw.slice(6, 8));
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return formatDateCompactShanghai();
  }
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + Number(days || 0));
  return formatDateCompact(date);
}

async function getIntradayChart(tsCode) {
  const targetDate = db.prices[tsCode]?.trade_date || await getTargetTradeDate();
  const day = formatDateHuman(targetDate);
  const rows = await callTushare("stk_mins", {
    ts_code: tsCode,
    freq: "1min",
    start_date: `${day} 09:30:00`,
    end_date: `${day} 15:00:00`,
  }, "ts_code,trade_time,open,close,high,low,vol,amount");

  return {
    ts_code: tsCode,
    period: "intraday",
    trade_date: targetDate,
    rows: rows
      .map((row) => ({
        ts_code: row.ts_code,
        trade_time: row.trade_time,
        trade_date: String(row.trade_time || "").slice(0, 10).replaceAll("-", ""),
        open: nullableNumber(row.open),
        high: nullableNumber(row.high),
        low: nullableNumber(row.low),
        close: nullableNumber(row.close),
        vol: nullableNumber(row.vol),
        amount: nullableNumber(row.amount),
      }))
      .sort((a, b) => String(a.trade_time || "").localeCompare(String(b.trade_time || ""))),
  };
}

function normalizeBarRows(rows) {
  return rows
    .map((row) => ({
      ts_code: row.ts_code,
      trade_date: String(row.trade_date || ""),
      open: nullableNumber(row.open),
      high: nullableNumber(row.high),
      low: nullableNumber(row.low),
      close: nullableNumber(row.close),
      vol: nullableNumber(row.vol),
      amount: nullableNumber(row.amount),
    }))
    .filter((row) => row.trade_date && Number.isFinite(Number(row.close)))
    .sort((a, b) => String(a.trade_date).localeCompare(String(b.trade_date)));
}

function aggregateBars(rows, period) {
  const groups = new Map();
  for (const row of rows) {
    const key = period === "quarter" ? quarterKey(row.trade_date) : row.trade_date.slice(0, 4);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(row);
  }

  return Array.from(groups.entries()).map(([key, groupRows]) => {
    const sorted = groupRows.slice().sort((a, b) => String(a.trade_date).localeCompare(String(b.trade_date)));
    const first = sorted[0];
    const last = sorted.at(-1);
    return {
      ts_code: last.ts_code,
      trade_date: last.trade_date,
      label: key,
      open: first.open,
      high: Math.max(...sorted.map((row) => Number(row.high)).filter(Number.isFinite)),
      low: Math.min(...sorted.map((row) => Number(row.low)).filter(Number.isFinite)),
      close: last.close,
      vol: round(sorted.reduce((sum, row) => sum + Number(row.vol || 0), 0), 2),
      amount: round(sorted.reduce((sum, row) => sum + Number(row.amount || 0), 0), 2),
    };
  });
}

function quarterKey(tradeDate) {
  const month = Number(String(tradeDate || "").slice(4, 6));
  const quarter = Math.max(1, Math.ceil(month / 3));
  return `${String(tradeDate).slice(0, 4)}Q${quarter}`;
}

function enrichWatchItem(item) {
  const price = db.prices[item.ts_code] || null;
  const group = db.groups.find((entry) => entry.id === item.group_id) || db.groups[0];
  return {
    ...item,
    group,
    price,
    valuation: computeValuation(item, price),
    sync: syncStateForCode(item.ts_code),
  };
}

function computeValuation(item, price) {
  const close = Number(price?.close);
  const low = Number(item.low_price);
  const fair = Number(item.fair_price);
  const high = Number(item.high_price);
  const hasPrice = Number.isFinite(close);
  const hasValuation = Number.isFinite(low) && Number.isFinite(fair) && Number.isFinite(high);

  if (!hasPrice || !hasValuation) {
    return {
      status: "unpriced",
      label: hasValuation ? "等待价格" : "未估值",
      deviation_pct: null,
      low_gap_pct: null,
      high_gap_pct: null,
    };
  }

  const deviationPct = ((close - fair) / fair) * 100;
  const lowGapPct = ((close - low) / low) * 100;
  const highGapPct = ((high - close) / high) * 100;
  let status = "fair";
  let label = "合理";
  if (close <= low) {
    status = "undervalued";
    label = "低估";
  } else if (close >= high) {
    status = "overvalued";
    label = "高估";
  }

  return {
    status,
    label,
    deviation_pct: round(deviationPct, 2),
    low_gap_pct: round(lowGapPct, 2),
    high_gap_pct: round(highGapPct, 2),
  };
}

function buildDashboard() {
  const items = db.watchlist.map(enrichWatchItem);
  const priced = items.filter((item) => item.price);
  const stats = {
    total: items.length,
    undervalued: items.filter((item) => item.valuation.status === "undervalued").length,
    fair: items.filter((item) => item.valuation.status === "fair").length,
    overvalued: items.filter((item) => item.valuation.status === "overvalued").length,
    unpriced: items.filter((item) => item.valuation.status === "unpriced").length,
    latest_price_date: priced.map((item) => item.price.trade_date).filter(Boolean).sort().at(-1) || "",
    updated_at: db.updated_at,
  };

  const withDeviation = items.filter((item) => typeof item.valuation.deviation_pct === "number");
  const undervalued = withDeviation
    .filter((item) => item.valuation.status === "undervalued")
    .sort((a, b) => a.valuation.deviation_pct - b.valuation.deviation_pct)
    .slice(0, 8);
  const overvalued = withDeviation
    .filter((item) => item.valuation.status === "overvalued")
    .sort((a, b) => b.valuation.deviation_pct - a.valuation.deviation_pct)
    .slice(0, 8);
  const movers = priced
    .filter((item) => typeof item.price.pct_chg === "number")
    .slice()
    .sort((a, b) => Math.abs(b.price.pct_chg) - Math.abs(a.price.pct_chg))
    .slice(0, 8);
  const nearLow = withDeviation
    .filter((item) => item.valuation.status === "fair" && typeof item.valuation.low_gap_pct === "number")
    .sort((a, b) => Math.abs(a.valuation.low_gap_pct) - Math.abs(b.valuation.low_gap_pct))
    .slice(0, 8);
  const recentHistory = db.valuation_history.slice(0, 8);

  return {
    stats,
    undervalued,
    overvalued,
    movers,
    nearLow,
    recentHistory,
    sync: publicSyncState(),
  };
}

async function searchStocks(query) {
  const normalized = normalizeSearch(query);
  if (!normalized) {
    return [];
  }

  const stocks = await getStockBasics();
  return stocks
    .filter((stock) => {
      const text = [
        stock.ts_code,
        stock.symbol,
        stock.name,
        stock.area,
        stock.industry,
        stock.market,
      ].join(" ").toUpperCase();
      return text.includes(normalized);
    })
    .slice(0, 25);
}

async function getStockBasics() {
  const now = Date.now();
  if (stockCache.rows.length && stockCache.expiresAt > now) {
    return stockCache.rows;
  }

  if (stockCache.promise) {
    return stockCache.promise;
  }

  stockCache.promise = callTushare("stock_basic", { list_status: "L" }, [
    "ts_code",
    "symbol",
    "name",
    "area",
    "industry",
    "market",
    "list_date",
  ].join(","))
    .then((rows) => {
      stockCache.rows = rows;
      stockCache.expiresAt = Date.now() + 12 * 60 * 60 * 1000;
      return rows;
    })
    .finally(() => {
      stockCache.promise = null;
    });

  return stockCache.promise;
}

async function findStock(tsCode) {
  const stocks = await getStockBasics();
  const stock = stocks.find((item) => item.ts_code === tsCode);
  if (stock) {
    return stock;
  }

  return {
    ts_code: tsCode,
    symbol: tsCode.slice(0, 6),
    name: tsCode,
    area: "",
    industry: "",
    market: "",
    list_date: "",
  };
}

async function resolveStockInput(value) {
  const raw = String(value || "").trim();
  const tsCode = normalizeCode(raw);
  if (!raw && !tsCode) {
    return null;
  }

  const stocks = await getStockBasics();
  const exactCode = stocks.find((item) => item.ts_code === tsCode || item.symbol === raw);
  if (exactCode) {
    return exactCode;
  }

  const normalized = normalizeSearch(raw);
  const exactName = stocks.find((item) => normalizeSearch(item.name) === normalized);
  if (exactName) {
    return exactName;
  }

  const fuzzy = stocks.find((item) => normalizeSearch(item.name).includes(normalized));
  if (fuzzy) {
    return fuzzy;
  }

  return findStock(tsCode || raw);
}

function startSync(reason) {
  if (syncState.running) {
    return;
  }
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  runSyncAttempt(reason).catch((error) => {
    syncState.running = false;
    syncState.active = true;
    syncState.message = `同步失败：${error.message}`;
    syncState.failures = [{ ts_code: "__sync__", message: error.message }];
    scheduleRetry();
  });
}

async function runSyncAttempt(reason) {
  if (syncState.running) {
    return;
  }

  const items = db.watchlist.slice();
  if (!items.length) {
    syncState = {
      ...syncState,
      active: false,
      running: false,
      reason,
      total: 0,
      success_count: 0,
      pending: [],
      failures: [],
      next_retry_at: "",
      message: "股票池为空，无需同步",
    };
    return;
  }

  syncState.running = true;
  syncState.active = true;
  syncState.reason = reason;
  syncState.attempt += 1;
  syncState.total = items.length;
  syncState.success_count = 0;
  syncState.pending = [];
  syncState.failures = [];
  syncState.started_at = nowIso();
  syncState.finished_at = "";
  syncState.next_retry_at = "";
  syncState.message = "正在同步收盘价";

  const targetTradeDate = await getTargetTradeDate();
  syncState.target_trade_date = targetTradeDate;

  for (const item of items) {
    try {
      const result = await syncOneStock(item, targetTradeDate);
      if (result.ok) {
        syncState.success_count += 1;
      } else {
        syncState.pending.push(result);
      }
    } catch (error) {
      syncState.failures.push({
        ts_code: item.ts_code,
        name: item.name,
        message: error.message,
      });
    }
  }

  syncState.running = false;
  syncState.finished_at = nowIso();

  const unfinished = syncState.pending.length + syncState.failures.length;
  if (unfinished > 0) {
    syncState.active = true;
    syncState.message = `目标交易日 ${formatDateHuman(targetTradeDate)} 的收盘价尚未全部成功，稍后继续重试`;
    scheduleRetry();
  } else {
    syncState.active = false;
    syncState.next_retry_at = "";
    syncState.message = `已同步 ${formatDateHuman(targetTradeDate)} 收盘价`;
  }

  await persistStore();
}

async function syncOneStock(item, targetTradeDate) {
  const range = getDateRange(60);
  const [dailyRows, metricRows] = await Promise.all([
    callTushare("daily", {
      ts_code: item.ts_code,
      start_date: range.start,
      end_date: range.end,
    }, [
      "ts_code",
      "trade_date",
      "open",
      "high",
      "low",
      "close",
      "pre_close",
      "change",
      "pct_chg",
      "vol",
      "amount",
    ].join(",")),
    callTushare("daily_basic", {
      ts_code: item.ts_code,
      start_date: range.start,
      end_date: range.end,
    }, [
      "ts_code",
      "trade_date",
      "turnover_rate",
      "volume_ratio",
      "pe",
      "pb",
      "ps",
      "total_mv",
      "circ_mv",
    ].join(",")),
  ]);

  const daily = dailyRows.map(normalizeDailyRow).sort(sortTradeDateDesc);
  const metrics = metricRows.map(normalizeMetricRow).sort(sortTradeDateDesc);
  const latest = daily[0];

  if (!latest) {
    return {
      ts_code: item.ts_code,
      name: item.name,
      ok: false,
      trade_date: "",
      message: "TuShare 暂无日线数据",
    };
  }

  const latestMetric = metrics.find((row) => row.trade_date === latest.trade_date) || metrics[0] || {};
  const price = {
    ...latest,
    turnover_rate: latestMetric.turnover_rate ?? null,
    volume_ratio: latestMetric.volume_ratio ?? null,
    pe: latestMetric.pe ?? null,
    pb: latestMetric.pb ?? null,
    ps: latestMetric.ps ?? null,
    total_mv: latestMetric.total_mv ?? null,
    circ_mv: latestMetric.circ_mv ?? null,
    synced_at: nowIso(),
  };

  db.prices[item.ts_code] = price;
  mergePriceHistory(item.ts_code, daily, metrics);

  const ok = latest.trade_date === targetTradeDate;
  return {
    ts_code: item.ts_code,
    name: item.name,
    ok,
    trade_date: latest.trade_date,
    message: ok
      ? "成功"
      : `最新价格日期是 ${formatDateHuman(latest.trade_date)}，目标是 ${formatDateHuman(targetTradeDate)}`,
  };
}

function mergePriceHistory(tsCode, dailyRows, metricRows) {
  const existing = db.price_history[tsCode] || [];
  const metricByDate = new Map(metricRows.map((row) => [row.trade_date, row]));
  const byDate = new Map(existing.map((row) => [row.trade_date, row]));

  for (const row of dailyRows) {
    const metric = metricByDate.get(row.trade_date) || {};
    byDate.set(row.trade_date, {
      ...row,
      turnover_rate: metric.turnover_rate ?? row.turnover_rate ?? null,
      pe: metric.pe ?? row.pe ?? null,
      pb: metric.pb ?? row.pb ?? null,
      ps: metric.ps ?? row.ps ?? null,
      total_mv: metric.total_mv ?? row.total_mv ?? null,
      circ_mv: metric.circ_mv ?? row.circ_mv ?? null,
    });
  }

  db.price_history[tsCode] = Array.from(byDate.values())
    .sort(sortTradeDateDesc)
    .slice(0, 180);
}

function scheduleRetry() {
  if (retryTimer) {
    clearTimeout(retryTimer);
  }

  const nextRetry = Date.now() + SYNC_RETRY_MS;
  syncState.next_retry_at = new Date(nextRetry).toISOString();
  retryTimer = setTimeout(() => {
    retryTimer = null;
    runSyncAttempt("retry").catch((error) => {
      syncState.running = false;
      syncState.active = true;
      syncState.message = `重试失败：${error.message}`;
      syncState.failures = [{ ts_code: "__retry__", message: error.message }];
      scheduleRetry();
    });
  }, SYNC_RETRY_MS);
  retryTimer.unref();
}

async function maybeAutoSyncAfterClose() {
  if (!TUSHARE_TOKEN || syncState.running || syncState.active || !db.watchlist.length) {
    return;
  }

  const parts = getShanghaiParts();
  const afterClose = parts.hour > 15 || (parts.hour === 15 && parts.minute >= 10);
  if (!afterClose) {
    return;
  }

  const targetTradeDate = await getTargetTradeDate();
  const alreadyDone = db.watchlist.every((item) => db.prices[item.ts_code]?.trade_date === targetTradeDate);
  if (!alreadyDone) {
    startSync("auto");
  }
}

async function getTargetTradeDate() {
  const now = Date.now();
  if (targetTradeDateCache.value && targetTradeDateCache.expiresAt > now) {
    return targetTradeDateCache.value;
  }
  if (targetTradeDateCache.promise) {
    return targetTradeDateCache.promise;
  }

  targetTradeDateCache.promise = (async () => {
    const today = formatDateCompactShanghai();
    const range = getDateRange(25);
    const rows = await callTushare("trade_cal", {
      exchange: "SSE",
      start_date: range.start,
      end_date: today,
    }, "exchange,cal_date,is_open,pretrade_date");

    const sorted = rows.slice().sort((a, b) => String(a.cal_date).localeCompare(String(b.cal_date)));
    const todayRow = sorted.find((row) => row.cal_date === today);
    const parts = getShanghaiParts();
    const afterClose = parts.hour > 15 || (parts.hour === 15 && parts.minute >= 10);
    if (todayRow?.is_open === 1 && afterClose) {
      return today;
    }

    const openDays = sorted.filter((row) => row.is_open === 1 && row.cal_date < today);
    return openDays.at(-1)?.cal_date || today;
  })()
    .then((value) => {
      targetTradeDateCache.value = value;
      targetTradeDateCache.expiresAt = Date.now() + 5 * 60 * 1000;
      return value;
    })
    .finally(() => {
      targetTradeDateCache.promise = null;
    });

  return targetTradeDateCache.promise;
}

function publicSyncState() {
  return {
    ...syncState,
    retry_ms: SYNC_RETRY_MS,
  };
}

function syncStateForCode(tsCode) {
  const pending = syncState.pending.find((item) => item.ts_code === tsCode);
  const failure = syncState.failures.find((item) => item.ts_code === tsCode);
  if (pending) {
    return { status: "pending", message: pending.message };
  }
  if (failure) {
    return { status: "failed", message: failure.message };
  }
  if (syncState.active || syncState.running) {
    return { status: "ok", message: "本轮已成功或等待下一轮" };
  }
  return { status: "", message: "" };
}

async function getReports(tsCode) {
  if (!TUSHARE_TOKEN) {
    return { reports: [], reportError: "缺少 TuShare token" };
  }

  const range = getDateRange(900);
  const reports = await callTushare("report_rc", {
    ts_code: tsCode,
    start_date: range.start,
    end_date: range.end,
  }, [
    "ts_code",
    "name",
    "report_date",
    "report_title",
    "report_type",
    "org_name",
    "author_name",
    "quarter",
    "op_rt",
    "np_rt",
    "tp",
  ].join(","));

  return {
    reports: groupResearchReports(reports).slice(0, 30),
    reportError: "",
  };
}

function groupResearchReports(rows) {
  const grouped = new Map();
  for (const row of rows || []) {
    const key = [
      row.ts_code,
      row.report_date,
      normalizeReportText(row.report_title),
      normalizeReportText(row.org_name),
      normalizeReportText(row.author_name),
      normalizeReportText(row.report_type),
    ].join("|");
    const target = grouped.get(key) || {
      ts_code: row.ts_code,
      name: row.name,
      report_date: row.report_date,
      report_title: row.report_title,
      report_type: row.report_type,
      org_name: row.org_name,
      author_name: row.author_name,
      forecasts: [],
    };

    if (hasReportNumber(row.op_rt) || hasReportNumber(row.tp)) {
      const forecastKey = String(row.quarter || "未标注");
      if (!target.forecasts.some((item) => String(item.quarter || "未标注") === forecastKey)) {
        target.forecasts.push({
          quarter: row.quarter || "",
          op_rt: nullableNumber(row.op_rt),
          tp: nullableNumber(row.tp),
        });
      }
    }

    grouped.set(key, target);
  }

  return Array.from(grouped.values())
    .map((report) => ({
      ...report,
      forecasts: report.forecasts
        .slice()
        .sort((a, b) => String(a.quarter || "").localeCompare(String(b.quarter || ""))),
    }))
    .sort((a, b) => String(b.report_date || "").localeCompare(String(a.report_date || "")));
}

function normalizeReportText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/＿/g, "_")
    .trim()
    .toLowerCase();
}

function hasReportNumber(value) {
  return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
}

function buildInfoLinks(item) {
  const symbol = item.symbol || item.ts_code.slice(0, 6);
  const marketPrefix = item.ts_code.endsWith(".SH") ? "sh" : item.ts_code.endsWith(".BJ") ? "bj" : "sz";
  return {
    news: [
      {
        title: "东方财富个股页",
        description: "查看公开新闻、行情和讨论入口",
        url: `https://quote.eastmoney.com/${marketPrefix}${symbol}.html`,
      },
    ],
    announcements: [
      {
        title: "巨潮资讯公告搜索",
        description: "进入后可搜索股票代码或公司简称",
        url: "https://www.cninfo.com.cn/new/index",
      },
    ],
    research: [
      {
        title: "东方财富研报中心",
        description: "公开研报检索入口",
        url: "https://data.eastmoney.com/report/",
      },
    ],
  };
}

async function getSectorFundFlow(options) {
  const level = normalizeSectorLevel(options.level);
  const trendDays = clampNumber(options.trendDays, 30, 180, 30);
  const period = ["day", "week", "month", "range"].includes(options.period) ? options.period : "day";
  const candidateTradeDates = await getRecentOpenTradeDates(trendDays + 8);
  const sectorMeta = await getSectorMembers(level);
  const flowPackages = await mapWithConcurrency(candidateTradeDates, 4, async (tradeDate) => {
    const rows = await getMoneyflowByDate(tradeDate);
    return aggregateMoneyflowBySector(tradeDate, rows, sectorMeta);
  });
  const flowByDate = flowPackages.filter(sectorFlowHasData).slice(-trendDays);
  const tradeDates = flowByDate.map((item) => item.trade_date);

  const trend = flowByDate.map((item) => ({
    trade_date: item.trade_date,
    sectors: item.sectors,
  }));

  const rankingDates = selectRankingDates(tradeDates, period, options);
  const rankingSource = flowByDate.filter((item) => rankingDates.includes(item.trade_date));
  const ranking = buildSectorRanking(rankingSource, sectorMeta.sectors);

  return {
    level,
    trend_days: trendDays,
    period,
    start_date: rankingDates[0] || "",
    end_date: rankingDates.at(-1) || "",
    trade_dates: tradeDates,
    sectors: sectorMeta.sectors,
    trend,
    ranking,
  };
}

function sectorFlowHasData(day) {
  return Object.values(day?.sectors || {}).some((item) => (
    Number(item.stock_count || 0) > 0
    || Number(item.gross_amount || 0) > 0
  ));
}

async function getSectorStrengthMatrix(options = {}) {
  const level = normalizeSectorLevel(options.level);
  const cacheKey = level;
  const cached = sectorStrengthCache.get(cacheKey);
  if (!options.refresh && cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  if (cached?.promise) {
    return cached.promise;
  }

  const promise = buildSectorStrengthMatrix(level)
    .then((value) => {
      sectorStrengthCache.set(cacheKey, {
        value,
        expiresAt: Date.now() + (value.error_count ? 5 * 60 * 1000 : 6 * 60 * 60 * 1000),
        promise: null,
      });
      return value;
    })
    .catch((error) => {
      sectorStrengthCache.delete(cacheKey);
      throw error;
    });

  sectorStrengthCache.set(cacheKey, {
    value: cached?.value || null,
    expiresAt: 0,
    promise,
  });
  return promise;
}

async function buildSectorStrengthMatrix(level) {
  const targetTradeDate = await getTargetTradeDate();
  const tradeDates = (await getRecentOpenTradeDates(190))
    .filter((tradeDate) => tradeDate <= targetTradeDate)
    .slice(-180);
  const sectorMeta = await getSectorMembers(level);
  const errors = [];
  const flowByDate = await mapWithConcurrency(tradeDates, 4, async (tradeDate) => {
    try {
      const rows = await getMoneyflowByDate(tradeDate);
      return aggregateStrengthMoneyflowBySector(tradeDate, rows, sectorMeta);
    } catch (error) {
      errors.push({ trade_date: tradeDate, message: error.message });
      return aggregateStrengthMoneyflowBySector(tradeDate, [], sectorMeta);
    }
  });
  const priceConfirmation = await buildSectorPriceConfirmation(sectorMeta, tradeDates).catch(() => new Map());

  const dailyBySector = new Map(sectorMeta.sectors.map((sector) => [sector.name, []]));
  for (const day of flowByDate) {
    for (const [name, item] of Object.entries(day.sectors)) {
      dailyBySector.get(name)?.push({
        trade_date: day.trade_date,
        ...item,
      });
    }
  }

  const rows = sectorMeta.sectors.map((sector) => {
    const dailyRows = dailyBySector.get(sector.name) || [];
    const windows = {};
    for (const days of sectorStrengthWindows) {
      windows[days] = summarizeSectorStrengthWindow(dailyRows, days);
    }
    const segments = {};
    for (const segment of sectorStrengthSegments) {
      segments[segment.key] = summarizeSectorStrengthSegment(dailyRows, segment);
    }
    const price = priceConfirmation.get(sector.name) || {
      return_pct: null,
      covered_count: 0,
    };
    return {
      code: sector.code,
      name: sector.name,
      level: sector.level,
      member_count: sectorMeta.sectorMembers.get(sector.code)?.length || 0,
      windows,
      segments,
      price_return_pct: price.return_pct,
      price_covered_count: price.covered_count,
    };
  });

  addWindowRankScores(rows);
  addSegmentRankScores(rows);
  addCategoryScores(rows);
  rows.sort((a, b) => Number(b.overall_score || 0) - Number(a.overall_score || 0));
  rows.forEach((row, index) => {
    row.rank = index + 1;
  });

  const summary = buildSectorStrengthSummary(rows);
  return {
    generated_at: nowIso(),
    level,
    windows: sectorStrengthWindows,
    segments: sectorStrengthSegments,
    weights: {
      fund: 35,
      persistence: 35,
      diffusion: 20,
      price: 10,
    },
    start_date: tradeDates[0] || "",
    end_date: tradeDates.at(-1) || "",
    trade_dates: tradeDates,
    summary,
    rows,
    errors: errors.sort((a, b) => String(a.trade_date).localeCompare(String(b.trade_date))).slice(0, 12),
    error_count: errors.length,
  };
}

function aggregateStrengthMoneyflowBySector(tradeDate, rows, sectorMeta) {
  const sectors = {};
  for (const sector of sectorMeta.sectors) {
    sectors[sector.name] = {
      code: sector.code,
      name: sector.name,
      net_amount: 0,
      gross_amount: 0,
      inflow_count: 0,
      outflow_count: 0,
      stock_count: 0,
    };
  }

  for (const row of rows || []) {
    const sectorName = sectorMeta.stockToSector.get(row.ts_code);
    const item = sectorName ? sectors[sectorName] : null;
    if (!item) {
      continue;
    }
    const net = Number(row.net_mf_amount || 0);
    item.net_amount += net;
    item.gross_amount += Math.abs(net);
    item.stock_count += 1;
    if (net > 0) {
      item.inflow_count += 1;
    } else if (net < 0) {
      item.outflow_count += 1;
    }
  }

  for (const item of Object.values(sectors)) {
    item.net_amount = round(item.net_amount, 2);
    item.gross_amount = round(item.gross_amount, 2);
    item.positive = item.net_amount > 0;
    item.diffusion_pct = item.stock_count > 0
      ? round((item.inflow_count / item.stock_count) * 100, 2)
      : null;
    item.intensity_pct = item.gross_amount > 0
      ? round((item.net_amount / item.gross_amount) * 100, 2)
      : null;
  }

  return { trade_date: tradeDate, sectors };
}

function summarizeSectorStrengthWindow(dailyRows, days) {
  const rows = (dailyRows || []).slice(-days);
  const netAmount = rows.reduce((sum, row) => sum + Number(row.net_amount || 0), 0);
  const grossAmount = rows.reduce((sum, row) => sum + Number(row.gross_amount || 0), 0);
  const stockObservations = rows.reduce((sum, row) => sum + Number(row.stock_count || 0), 0);
  const inflowObservations = rows.reduce((sum, row) => sum + Number(row.inflow_count || 0), 0);
  const positiveDays = rows.filter((row) => Number(row.net_amount || 0) > 0).length;
  const maxPositiveStreak = maxPositiveNetStreak(rows);
  const stockCount = rows.reduce((max, row) => Math.max(max, Number(row.stock_count || 0)), 0);

  return {
    days,
    start_date: rows[0]?.trade_date || "",
    end_date: rows.at(-1)?.trade_date || "",
    net_amount: round(netAmount, 2),
    gross_amount: round(grossAmount, 2),
    intensity_pct: grossAmount > 0 ? round((netAmount / grossAmount) * 100, 2) : null,
    positive_days: positiveDays,
    positive_day_ratio: rows.length ? round((positiveDays / rows.length) * 100, 2) : null,
    max_positive_streak: maxPositiveStreak,
    diffusion_pct: stockObservations > 0
      ? round((inflowObservations / stockObservations) * 100, 2)
      : null,
    covered_stock_count: stockCount,
    net_score: 0,
    intensity_score: 0,
  };
}

function summarizeSectorStrengthSegment(dailyRows, segment) {
  const source = dailyRows || [];
  const endIndex = source.length - Number(segment.from || 1) + 1;
  const startIndex = Math.max(0, source.length - Number(segment.to || segment.from || 1));
  const rows = endIndex > startIndex ? source.slice(startIndex, endIndex) : [];
  const netAmount = rows.reduce((sum, row) => sum + Number(row.net_amount || 0), 0);
  const grossAmount = rows.reduce((sum, row) => sum + Number(row.gross_amount || 0), 0);
  const stockObservations = rows.reduce((sum, row) => sum + Number(row.stock_count || 0), 0);
  const inflowObservations = rows.reduce((sum, row) => sum + Number(row.inflow_count || 0), 0);
  const positiveDays = rows.filter((row) => Number(row.net_amount || 0) > 0).length;
  const maxPositiveStreak = maxPositiveNetStreak(rows);
  const stockCount = rows.reduce((max, row) => Math.max(max, Number(row.stock_count || 0)), 0);

  return {
    key: segment.key,
    label: segment.label,
    from: segment.from,
    to: segment.to,
    days: rows.length,
    start_date: rows[0]?.trade_date || "",
    end_date: rows.at(-1)?.trade_date || "",
    net_amount: round(netAmount, 2),
    gross_amount: round(grossAmount, 2),
    intensity_pct: grossAmount > 0 ? round((netAmount / grossAmount) * 100, 2) : null,
    positive_days: positiveDays,
    positive_day_ratio: rows.length ? round((positiveDays / rows.length) * 100, 2) : null,
    max_positive_streak: maxPositiveStreak,
    diffusion_pct: stockObservations > 0
      ? round((inflowObservations / stockObservations) * 100, 2)
      : null,
    covered_stock_count: stockCount,
    net_score: 0,
    intensity_score: 0,
  };
}

function maxPositiveNetStreak(rows) {
  let best = 0;
  let current = 0;
  for (const row of rows || []) {
    if (Number(row.net_amount || 0) > 0) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}

async function buildSectorPriceConfirmation(sectorMeta, tradeDates) {
  if (!tradeDates.length) {
    return new Map();
  }
  const startDate = tradeDates.at(-30) || tradeDates[0];
  const endDate = tradeDates.at(-1);
  const [startRows, endRows] = await Promise.all([
    getDailyByDate(startDate),
    getDailyByDate(endDate),
  ]);
  const startByCode = rowsByCode(startRows);
  const endByCode = rowsByCode(endRows);
  const result = new Map();

  for (const sector of sectorMeta.sectors) {
    const members = sectorMeta.sectorMembers.get(sector.code) || [];
    const returns = [];
    for (const member of members) {
      const startClose = Number(startByCode.get(member.ts_code)?.close);
      const endClose = Number(endByCode.get(member.ts_code)?.close);
      if (Number.isFinite(startClose) && startClose > 0 && Number.isFinite(endClose)) {
        returns.push(((endClose - startClose) / startClose) * 100);
      }
    }
    result.set(sector.name, {
      return_pct: returns.length
        ? round(returns.reduce((sum, value) => sum + value, 0) / returns.length, 2)
        : null,
      covered_count: returns.length,
    });
  }
  return result;
}

function addWindowRankScores(rows) {
  for (const days of sectorStrengthWindows) {
    const netScores = percentileScoreMap(rows, (row) => row.windows[days]?.net_amount);
    const intensityScores = percentileScoreMap(rows, (row) => row.windows[days]?.intensity_pct);
    const ranked = rows
      .slice()
      .sort((a, b) => Number(b.windows[days]?.net_amount || 0) - Number(a.windows[days]?.net_amount || 0));
    ranked.forEach((row, index) => {
      row.windows[days].net_rank = index + 1;
    });
    for (const row of rows) {
      row.windows[days].net_score = round(netScores.get(row) || 0, 0);
      row.windows[days].intensity_score = round(intensityScores.get(row) || 0, 0);
    }
  }
}

function addSegmentRankScores(rows) {
  for (const segment of sectorStrengthSegments) {
    const netScores = percentileScoreMap(rows, (row) => row.segments[segment.key]?.net_amount);
    const intensityScores = percentileScoreMap(rows, (row) => row.segments[segment.key]?.intensity_pct);
    const ranked = rows
      .slice()
      .sort((a, b) => Number(b.segments[segment.key]?.net_amount || 0) - Number(a.segments[segment.key]?.net_amount || 0));
    ranked.forEach((row, index) => {
      row.segments[segment.key].net_rank = index + 1;
    });
    for (const row of rows) {
      row.segments[segment.key].net_score = round(netScores.get(row) || 0, 0);
      row.segments[segment.key].intensity_score = round(intensityScores.get(row) || 0, 0);
    }
  }
}

function addCategoryScores(rows) {
  const priceScores = percentileScoreMap(rows, (row) => row.price_return_pct);
  for (const row of rows) {
    row.fund_score = round(weightedAverage([
      [row.windows[15].net_score * 0.55 + row.windows[15].intensity_score * 0.45, 1],
      [row.windows[30].net_score * 0.55 + row.windows[30].intensity_score * 0.45, 2],
      [row.windows[60].net_score * 0.55 + row.windows[60].intensity_score * 0.45, 2],
      [row.windows[90].net_score * 0.55 + row.windows[90].intensity_score * 0.45, 1],
    ]), 0);

    row.persistence_score = round(clampNumber(
      weightedAverage([
        [Number(row.windows[15].positive_day_ratio || 0), 1],
        [Number(row.windows[30].positive_day_ratio || 0), 2],
        [Number(row.windows[60].positive_day_ratio || 0), 1.5],
        [Math.min(Number(row.windows[30].max_positive_streak || 0) / 8, 1) * 100, 1],
      ]),
      0,
      100,
      0,
    ), 0);

    row.diffusion_score = round(clampNumber(
      weightedAverage([
        [Number(row.windows[15].diffusion_pct || 0), 1],
        [Number(row.windows[30].diffusion_pct || 0), 2],
        [Number(row.windows[60].diffusion_pct || 0), 1],
      ]),
      0,
      100,
      0,
    ), 0);

    row.price_score = round(priceScores.get(row) || 0, 0);
    row.overall_score = round(
      row.fund_score * 0.35
      + row.persistence_score * 0.35
      + row.diffusion_score * 0.20
      + row.price_score * 0.10,
      0,
    );
    row.status_tags = classifySectorStrengthTags(row);
    row.status = row.status_tags[0] || "观察";
    row.trend_tags = classifySectorStrengthTrendTags(row);
    row.trend_status = row.trend_tags[0] || row.status || "观察";
  }
}

function classifySectorStrengthTrend(row) {
  return classifySectorStrengthTrendTags(row)[0] || row.status || "观察";
}

function classifySectorStrengthTrendTags(row) {
  const segmentNet = (key) => Number(row.segments?.[key]?.net_amount || 0);
  const d1 = segmentNet("d1");
  const d2 = segmentNet("d2");
  const d3 = segmentNet("d3");
  const d4To5 = segmentNet("d4_5");
  const d6To7 = segmentNet("d6_7");
  const d8To15 = segmentNet("d8_15");
  const d16To30 = segmentNet("d16_30");
  const d31To60 = segmentNet("d31_60");
  const d61To90 = segmentNet("d61_90");
  const d91To120 = segmentNet("d91_120");
  const d121To150 = segmentNet("d121_150");
  const d151To180 = segmentNet("d151_180");
  const recent3 = d1 + d2 + d3;
  const recent7 = recent3 + d4To5 + d6To7;
  const previous23 = d8To15 + d16To30;
  const middle60 = d31To60 + d61To90;
  const long90 = d91To120 + d121To150 + d151To180;
  const shortBase = Math.max(Math.abs(d4To5 + d6To7), 1);
  const tags = [];
  const sustained = recent3 > 0 && d4To5 > 0 && d6To7 > 0 && d8To15 > 0 && d16To30 > 0;
  const newMoney = recent3 > 0 && recent3 >= shortBase * 0.8 && previous23 <= 0;
  const repair = recent7 > 0 && previous23 < 0 && (middle60 > 0 || long90 > 0);
  const warning = (middle60 > 0 || long90 > 0) && recent3 < 0 && d4To5 < 0;
  const pulse = d1 > 0 && recent7 <= 0;
  const extension = recent3 > 0 && previous23 > 0;
  const cool = recent3 < 0 && previous23 > 0;

  if (sustained) {
    tags.push("持续增强");
  }
  if (newMoney) {
    tags.push("新资金启动");
  }
  if (repair) {
    tags.push("回流修复");
  }
  if (warning) {
    tags.push("退潮预警");
  }
  if (pulse && !newMoney) {
    tags.push("单日脉冲");
  }
  if (extension && !sustained) {
    tags.push("偏强延续");
  }
  if (cool) {
    tags.push("短线降温");
  }
  return uniqueTags(tags);
}

function percentileScoreMap(rows, accessor) {
  const values = rows
    .map((row) => ({ row, value: Number(accessor(row)) }))
    .filter((item) => Number.isFinite(item.value))
    .sort((a, b) => a.value - b.value);
  const scores = new Map();
  if (!values.length) {
    return scores;
  }
  if (values.length === 1) {
    scores.set(values[0].row, 50);
    return scores;
  }
  values.forEach((item, index) => {
    scores.set(item.row, (index / (values.length - 1)) * 100);
  });
  return scores;
}

function weightedAverage(pairs) {
  let total = 0;
  let weightSum = 0;
  for (const [value, weight] of pairs) {
    const number = Number(value);
    const w = Number(weight);
    if (Number.isFinite(number) && Number.isFinite(w) && w > 0) {
      total += number * w;
      weightSum += w;
    }
  }
  return weightSum ? total / weightSum : 0;
}

function classifySectorStrength(row) {
  return classifySectorStrengthTags(row)[0] || "观察";
}

function classifySectorStrengthTags(row) {
  const net = (days) => Number(row.windows[days]?.net_amount || 0);
  const tags = [];
  const mainline = [15, 30, 60, 90].every((days) => net(days) > 0) && [3, 5, 7].every((days) => net(days) > 0);
  const newStart = [3, 5, 7, 15].every((days) => net(days) > 0) && (net(60) <= 0 || net(90) <= 0);
  const warning = (net(60) > 0 || net(90) > 0 || net(120) > 0) && net(3) < 0 && net(5) < 0;
  const repair = (net(60) > 0 || net(90) > 0) && net(3) > 0 && net(5) > 0;
  const pulse = net(3) > 0 && net(15) <= 0;

  if (mainline) {
    tags.push("主线增强");
  }
  if (newStart) {
    tags.push("新启动");
  }
  if (warning) {
    tags.push("退潮预警");
  }
  if (repair && !mainline) {
    tags.push("回流修复");
  }
  if (pulse) {
    tags.push("一日脉冲");
  }
  if (!tags.length) {
    tags.push(row.overall_score >= 70 ? "偏强观察" : "观察");
  }
  return uniqueTags(tags);
}

function uniqueTags(tags) {
  return Array.from(new Set((tags || []).filter(Boolean)));
}

function buildSectorStrengthSummary(rows) {
  const statusCounts = {};
  for (const row of rows) {
    statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
  }
  return {
    total: rows.length,
    top: rows[0] ? {
      code: rows[0].code,
      name: rows[0].name,
      overall_score: rows[0].overall_score,
      status: rows[0].status,
    } : null,
    status_counts: statusCounts,
    mainline_count: statusCounts["主线增强"] || 0,
    new_start_count: statusCounts["新启动"] || 0,
    warning_count: statusCounts["退潮预警"] || 0,
  };
}

async function getSectorDetail(sectorCode, options) {
  const normalizedCode = String(sectorCode || "").trim().toUpperCase();
  const requestedLevel = normalizeSectorLevel(options.level || "");
  let level = requestedLevel;
  let sectorMeta = await getSectorMembers(level);
  let sector = sectorMeta.sectorByCode.get(normalizedCode);
  if (!sector && !options.level) {
    for (const candidateLevel of sectorLevels) {
      const candidateMeta = await getSectorMembers(candidateLevel);
      const candidateSector = candidateMeta.sectorByCode.get(normalizedCode);
      if (candidateSector) {
        level = candidateLevel;
        sectorMeta = candidateMeta;
        sector = candidateSector;
        break;
      }
    }
  }
  if (!sector) {
    throw notFound("未找到板块");
  }

  const trendDays = clampNumber(options.trendDays, 30, 180, 30);
  const rankingWindow = [5, 10, 30].includes(Number(options.rankingWindow))
    ? Number(options.rankingWindow)
    : 5;
  const rankingMetric = ["return", "fund"].includes(options.rankingMetric)
    ? options.rankingMetric
    : "return";
  const stockLimit = clampNumber(options.stockLimit, 8, 160, 24);
  const tradeDates = await getRecentOpenTradeDates(Math.max(trendDays, rankingWindow));
  const trendDates = tradeDates.slice(-trendDays);
  const rankingDates = tradeDates.slice(-rankingWindow);
  const members = (sectorMeta.sectorMembers.get(normalizedCode) || [])
    .slice()
    .sort((a, b) => a.ts_code.localeCompare(b.ts_code));

  if (!rankingDates.length || !trendDates.length) {
    return {
      sector: { ...sector, member_count: members.length },
      level,
      trend_days: trendDays,
      ranking_window: rankingWindow,
      ranking_metric: rankingMetric,
      trade_dates: trendDates,
      ranking: [],
      series: [],
    };
  }

  const shortReturnDates = tradeDates.slice(-5);
  const [startDailyRows, endDailyRows, rankingFlowRows, shortReturnDailyRows] = await Promise.all([
    getDailyByDate(rankingDates[0]),
    getDailyByDate(rankingDates.at(-1)),
    mapWithConcurrency(rankingDates, 4, async (tradeDate) => ({
      trade_date: tradeDate,
      rows: await getMoneyflowByDate(tradeDate),
    })),
    mapWithConcurrency(shortReturnDates, 4, async (tradeDate) => ({
      trade_date: tradeDate,
      rows: await getDailyByDate(tradeDate),
    })),
  ]);

  const startDaily = rowsByCode(startDailyRows);
  const endDaily = rowsByCode(endDailyRows);
  const netFundByStock = new Map();
  const memberCodes = new Set(members.map((item) => item.ts_code));
  const shortReturnRowsByStock = new Map();

  for (const day of rankingFlowRows) {
    for (const row of day.rows) {
      if (!memberCodes.has(row.ts_code)) {
        continue;
      }
      const previous = netFundByStock.get(row.ts_code) || 0;
      netFundByStock.set(row.ts_code, previous + Number(row.net_mf_amount || 0));
    }
  }

  for (const day of shortReturnDailyRows) {
    for (const row of day.rows) {
      if (!memberCodes.has(row.ts_code)) {
        continue;
      }
      if (!shortReturnRowsByStock.has(row.ts_code)) {
        shortReturnRowsByStock.set(row.ts_code, []);
      }
      shortReturnRowsByStock.get(row.ts_code).push(row);
    }
  }
  for (const rows of shortReturnRowsByStock.values()) {
    rows.sort((a, b) => String(a.trade_date || "").localeCompare(String(b.trade_date || "")));
  }

  const ranking = members
    .map((member) => {
      const start = startDaily.get(member.ts_code);
      const end = endDaily.get(member.ts_code);
      const startClose = Number(start?.close || 0);
      const endClose = Number(end?.close || 0);
      const shortRows = shortReturnRowsByStock.get(member.ts_code) || [];
      const returnPct = startClose > 0 && endClose > 0
        ? round(((endClose - startClose) / startClose) * 100, 2)
        : null;
      const netAmount = round(netFundByStock.get(member.ts_code) || 0, 2);
      return {
        ts_code: member.ts_code,
        name: member.name,
        return_pct: returnPct,
        return_1d_pct: computeTrailingReturnPct(shortRows, 1, rankingDates.at(-1)),
        return_2d_pct: computeTrailingReturnPct(shortRows, 2, rankingDates.at(-1)),
        return_3d_pct: computeTrailingReturnPct(shortRows, 3, rankingDates.at(-1)),
        return_4d_pct: computeTrailingReturnPct(shortRows, 4, rankingDates.at(-1)),
        net_amount: netAmount,
        close: end?.close ?? null,
        price_date: end?.trade_date || "",
      };
    })
    .sort((a, b) => {
      if (rankingMetric === "fund") {
        return Number(b.net_amount || 0) - Number(a.net_amount || 0);
      }
      return Number(b.return_pct ?? -Infinity) - Number(a.return_pct ?? -Infinity);
    })
    .map((item, index) => ({ ...item, rank: index + 1 }));

  const chartStocks = ranking.slice(0, stockLimit);
  const chartCodes = new Set(chartStocks.map((item) => item.ts_code));
  const [priceSeriesRows, chartFlowRows] = await Promise.all([
    mapWithConcurrency(chartStocks, 5, async (stock) => ({
      stock,
      rows: await getDailySeries(stock.ts_code, trendDates[0], trendDates.at(-1)),
    })),
    mapWithConcurrency(trendDates, 4, async (tradeDate) => ({
      trade_date: tradeDate,
      rows: await getMoneyflowByDate(tradeDate),
    })),
  ]);

  const flowByStockAndDate = new Map();
  for (const day of chartFlowRows) {
    for (const row of day.rows) {
      if (!chartCodes.has(row.ts_code)) {
        continue;
      }
      if (!flowByStockAndDate.has(row.ts_code)) {
        flowByStockAndDate.set(row.ts_code, new Map());
      }
      flowByStockAndDate.get(row.ts_code).set(day.trade_date, Number(row.net_mf_amount || 0));
    }
  }

  const series = priceSeriesRows.map(({ stock, rows }) => {
    const priceByDate = rowsByCodeAndDate(rows);
    const firstClose = rows.find((row) => Number(row.close) > 0)?.close || 0;
    let cumulativeNet = 0;
    return {
      ts_code: stock.ts_code,
      name: stock.name,
      rank: stock.rank,
      values: trendDates.map((tradeDate) => {
        const price = priceByDate.get(tradeDate);
        const close = price?.close ?? null;
        const netAmount = Number(flowByStockAndDate.get(stock.ts_code)?.get(tradeDate) || 0);
        cumulativeNet += netAmount;
        return {
          trade_date: tradeDate,
          close,
          return_pct: firstClose > 0 && close != null
            ? round(((close - firstClose) / firstClose) * 100, 2)
            : null,
          net_amount: round(netAmount, 2),
          cumulative_net_amount: round(cumulativeNet, 2),
        };
      }),
    };
  });

  return {
    sector: { ...sector, member_count: members.length },
    level,
    trend_days: trendDays,
    ranking_window: rankingWindow,
    ranking_metric: rankingMetric,
    start_date: rankingDates[0] || "",
    end_date: rankingDates.at(-1) || "",
    trade_dates: trendDates,
    ranking,
    series,
  };
}

async function getSectorMembers(level = "L3") {
  const normalizedLevel = normalizeSectorLevel(level);
  if (sectorCache.value && sectorCache.expiresAt > Date.now()) {
    return sectorCache.value[normalizedLevel];
  }

  if (sectorCache.promise) {
    const value = await sectorCache.promise;
    return value[normalizedLevel];
  }

  sectorCache.promise = (async () => {
    const l1Industries = await callTushare("index_classify", {
      src: "SW2021",
      level: "L1",
    }, "index_code,industry_name,level,industry_code,is_pub,parent_code");

    const l1Sectors = l1Industries
      .map((item) => ({
        code: item.index_code,
        name: item.industry_name,
        level: "L1",
      }))
      .filter((item) => item.code && item.name);

    const memberLists = await mapWithConcurrency(l1Sectors, 4, async (sector) => {
      const members = await callTushare("index_member_all", {
        l1_code: sector.code,
      }, "l1_code,l1_name,l2_code,l2_name,l3_code,l3_name,ts_code,name,in_date,out_date,is_new");
      return { sector, members };
    });

    const levels = Object.fromEntries(sectorLevels.map((item) => [item, createEmptySectorMeta(item)]));
    for (const item of memberLists) {
      for (const member of item.members) {
        if (member.ts_code && (!member.out_date || member.is_new === "Y")) {
          const stockBase = {
            ts_code: member.ts_code,
            name: member.name || member.ts_code,
          };
          addSectorMember(levels.L1, member.l1_code || item.sector.code, member.l1_name || item.sector.name, stockBase);
          addSectorMember(levels.L2, member.l2_code, member.l2_name, stockBase);
          addSectorMember(levels.L3, member.l3_code, member.l3_name, stockBase);
        }
      }
    }

    for (const meta of Object.values(levels)) {
      meta.sectors = Array.from(meta.sectorByCode.values()).sort((a, b) => a.code.localeCompare(b.code));
      for (const list of meta.sectorMembers.values()) {
        list.sort((a, b) => a.ts_code.localeCompare(b.ts_code));
      }
    }

    sectorCache.value = levels;
    sectorCache.expiresAt = Date.now() + 12 * 60 * 60 * 1000;
    return levels;
  })().finally(() => {
    sectorCache.promise = null;
  });

  const value = await sectorCache.promise;
  return value[normalizedLevel];
}

function normalizeSectorLevel(level) {
  const normalized = String(level || "").trim().toUpperCase();
  return sectorLevels.includes(normalized) ? normalized : "L3";
}

function createEmptySectorMeta(level) {
  return {
    level,
    sectors: [],
    stockToSector: new Map(),
    stockToSectorCode: new Map(),
    stockMeta: new Map(),
    sectorMembers: new Map(),
    sectorByCode: new Map(),
  };
}

function addSectorMember(meta, sectorCode, sectorName, stockBase) {
  if (!sectorCode || !sectorName || !stockBase.ts_code) {
    return;
  }

  if (!meta.sectorByCode.has(sectorCode)) {
    const sector = {
      code: sectorCode,
      name: sectorName,
      level: meta.level,
    };
    meta.sectorByCode.set(sectorCode, sector);
    meta.sectorMembers.set(sectorCode, []);
  }

  meta.stockToSector.set(stockBase.ts_code, sectorName);
  meta.stockToSectorCode.set(stockBase.ts_code, sectorCode);
  meta.stockMeta.set(stockBase.ts_code, {
    ts_code: stockBase.ts_code,
    name: stockBase.name,
  });

  const members = meta.sectorMembers.get(sectorCode);
  if (!members.some((item) => item.ts_code === stockBase.ts_code)) {
    members.push({
      ts_code: stockBase.ts_code,
      name: stockBase.name,
      sector_code: sectorCode,
      sector_name: sectorName,
    });
  }
}

async function getMoneyflowByDate(tradeDate) {
  const cached = moneyflowCache.get(tradeDate);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.rows;
  }

  const rows = await callTushare("moneyflow", {
    trade_date: tradeDate,
  }, [
    "ts_code",
    "trade_date",
    "net_mf_vol",
    "net_mf_amount",
    "buy_lg_amount",
    "buy_elg_amount",
    "sell_lg_amount",
    "sell_elg_amount",
  ].join(","));

  moneyflowCache.set(tradeDate, {
    expiresAt: Date.now() + 6 * 60 * 60 * 1000,
    rows,
  });
  return rows;
}

async function getDailyByDate(tradeDate) {
  const cached = dailyByDateCache.get(tradeDate);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.rows;
  }

  const rows = await callTushare("daily", {
    trade_date: tradeDate,
  }, "ts_code,trade_date,open,high,low,close,pct_chg,vol,amount");

  const normalized = rows.map(normalizeDailyRow);
  dailyByDateCache.set(tradeDate, {
    expiresAt: Date.now() + 6 * 60 * 60 * 1000,
    rows: normalized,
  });
  return normalized;
}

async function getDailyBasicByDate(tradeDate) {
  const cached = dailyBasicByDateCache.get(tradeDate);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.rows;
  }

  const rows = await callTushare("daily_basic", {
    trade_date: tradeDate,
  }, "ts_code,trade_date,close,turnover_rate,total_mv,circ_mv");

  const normalized = rows.map(normalizeTurnoverDailyBasicRow);
  dailyBasicByDateCache.set(tradeDate, {
    expiresAt: Date.now() + 6 * 60 * 60 * 1000,
    rows: normalized,
  });
  return normalized;
}

async function getTurnoverMonitor(options = {}) {
  if (!options.refresh && turnoverMonitorCache.value && turnoverMonitorCache.expiresAt > Date.now()) {
    return turnoverMonitorCache.value;
  }

  if (turnoverMonitorCache.promise) {
    return turnoverMonitorCache.promise;
  }

  turnoverMonitorCache.promise = buildTurnoverMonitor()
    .then((value) => {
      turnoverMonitorCache.value = value;
      turnoverMonitorCache.expiresAt = Date.now() + (value.error_count ? 5 * 60 * 1000 : 6 * 60 * 60 * 1000);
      return value;
    })
    .finally(() => {
      turnoverMonitorCache.promise = null;
    });

  return turnoverMonitorCache.promise;
}

async function buildTurnoverMonitor() {
  const targetTradeDate = await getTargetTradeDate();
  const tradeDates = (await getRecentOpenTradeDates(240))
    .filter((tradeDate) => tradeDate <= targetTradeDate)
    .slice(-230);
  const weeks = buildTradeWeeks(tradeDates);
  const weekIndexByDate = new Map();
  const tradeIndexByDate = new Map();
  weeks.forEach((week, index) => {
    week.trade_dates.forEach((tradeDate) => {
      weekIndexByDate.set(tradeDate, index);
    });
  });
  tradeDates.forEach((tradeDate, index) => {
    tradeIndexByDate.set(tradeDate, index);
  });

  const errors = [];
  const [stocks, dayPackages] = await Promise.all([
    getStockBasics(),
    loadTurnoverDailyPackages(tradeDates, errors),
  ]);

  const stockByCode = new Map(stocks.map((stock) => [stock.ts_code, stock]));
  const byStock = new Map();

  for (const day of dayPackages) {
    const weekIndex = weekIndexByDate.get(day.trade_date);
    const tradeIndex = tradeIndexByDate.get(day.trade_date);
    if (!Number.isInteger(weekIndex) || !Number.isInteger(tradeIndex)) {
      continue;
    }

    for (const row of day.rows || []) {
      const close = Number(row.close);
      if (!row.ts_code || !Number.isFinite(close)) {
        continue;
      }

      const turnoverRate = Number(row.turnover_rate);
      let stock = byStock.get(row.ts_code);
      if (!stock) {
        stock = {
          ts_code: row.ts_code,
          daily: [],
          weekly: new Map(),
        };
        byStock.set(row.ts_code, stock);
      }

      stock.daily.push({
        trade_date: day.trade_date,
        trade_index: tradeIndex,
        week_index: weekIndex,
        close,
        turnover_rate: Number.isFinite(turnoverRate) ? turnoverRate : null,
      });

      let week = stock.weekly.get(weekIndex);
      if (!week) {
        week = {
          week_index: weekIndex,
          first_date: day.trade_date,
          last_date: day.trade_date,
          first_close: close,
          close,
          turnover_rate: 0,
          trade_count: 0,
        };
        stock.weekly.set(weekIndex, week);
      }

      if (day.trade_date < week.first_date) {
        week.first_date = day.trade_date;
        week.first_close = close;
      }
      if (day.trade_date >= week.last_date) {
        week.last_date = day.trade_date;
        week.close = close;
      }
      if (Number.isFinite(turnoverRate)) {
        week.turnover_rate += turnoverRate;
      }
      week.trade_count += 1;
    }
  }

  const scanStartWeek = Math.max(0, weeks.length - 24);
  const rows = [];

  for (const stock of byStock.values()) {
    stock.daily.sort((a, b) => a.trade_date.localeCompare(b.trade_date));
    const weekly = weeks.map((week, index) => {
      const source = stock.weekly.get(index);
      if (!source) {
        return null;
      }
      return {
        ...source,
        week_key: week.key,
        start_date: week.start_date,
        end_date: week.end_date,
      };
    });

    let best = null;
    for (let start = scanStartWeek; start <= weeks.length - 3; start += 1) {
      if (start + 3 >= weeks.length) {
        continue;
      }

      const trio = [weekly[start], weekly[start + 1], weekly[start + 2]];
      if (trio.some((week) => !week || Number(week.turnover_rate) <= 15)) {
        continue;
      }

      const firstClose = Number(trio[0].first_close);
      const lastClose = Number(trio[2].close);
      if (!Number.isFinite(firstClose) || firstClose <= 0 || !Number.isFinite(lastClose)) {
        continue;
      }

      const setupGainPct = ((lastClose - firstClose) / firstClose) * 100;
      if (setupGainPct <= 20) {
        continue;
      }

      const signal = findTurnoverDryUpSignal(stock.daily, weekly, start + 3, Math.min(start + 10, weeks.length - 1));
      if (!signal) {
        continue;
      }

      const latest = stock.daily.at(-1) || {};
      const meta = stockByCode.get(stock.ts_code) || {};
      const candidate = {
        ts_code: stock.ts_code,
        symbol: meta.symbol || stock.ts_code.slice(0, 6),
        name: meta.name || stock.ts_code,
        area: meta.area || "",
        industry: meta.industry || "",
        market: meta.market || "",
        setup_start_week: trio[0].start_date,
        setup_end_week: trio[2].end_date,
        setup_gain_pct: round(setupGainPct, 2),
        weekly_turnover_rates: trio.map((week) => round(week.turnover_rate, 2)),
        avg_weekly_turnover_rate: round(trio.reduce((sum, week) => sum + Number(week.turnover_rate || 0), 0) / 3, 2),
        signal_first_date: signal.first.trade_date,
        signal_date: signal.second.trade_date,
        signal_close: round(signal.second.close, 2),
        signal_turnover_rate: round(signal.second.turnover_rate, 2),
        ma20: round(signal.second.ma20, 2),
        gap_to_ma20_pct: round(((signal.second.close - signal.second.ma20) / signal.second.ma20) * 100, 2),
        latest_trade_date: latest.trade_date || "",
        latest_close: round(latest.close, 2),
        latest_pct_from_signal: Number.isFinite(Number(latest.close)) && Number(signal.second.close) > 0
          ? round(((Number(latest.close) - Number(signal.second.close)) / Number(signal.second.close)) * 100, 2)
          : null,
      };

      if (!best || compareTurnoverCandidates(candidate, best) < 0) {
        best = candidate;
      }
    }

    if (best) {
      rows.push(best);
    }
  }

  rows.sort(compareTurnoverCandidates);

  return {
    generated_at: nowIso(),
    start_date: tradeDates[0] || "",
    end_date: tradeDates.at(-1) || "",
    scan_weeks: Math.min(24, weeks.length),
    lookback_weeks: weeks.length,
    criteria: {
      setup_window_weeks: 24,
      setup_consecutive_weeks: 3,
      setup_weekly_turnover_gt: 15,
      setup_gain_gt_pct: 20,
      dry_up_week_from: 4,
      dry_up_week_to: 11,
      dry_up_consecutive_days: 2,
      dry_up_daily_turnover_lt: 10,
      ma20_floor_pct: -2,
    },
    rows,
    errors: errors.sort((a, b) => String(a.trade_date).localeCompare(String(b.trade_date))).slice(0, 12),
    error_count: errors.length,
  };
}

async function loadTurnoverDailyPackages(tradeDates, errors) {
  const packages = [];
  for (const tradeDate of tradeDates) {
    const fromCache = hasFreshDailyBasicCache(tradeDate);
    try {
      packages.push({ trade_date: tradeDate, rows: await getDailyBasicByDate(tradeDate) });
    } catch (error) {
      errors.push({ trade_date: tradeDate, message: error.message });
      packages.push({ trade_date: tradeDate, rows: [] });
    }

    if (!fromCache) {
      await sleep(340);
    }
  }
  return packages;
}

function hasFreshDailyBasicCache(tradeDate) {
  const cached = dailyBasicByDateCache.get(tradeDate);
  return Boolean(cached && cached.expiresAt > Date.now());
}

function findTurnoverDryUpSignal(dailyRows, weeklyRows, startWeek, endWeek) {
  let previous = null;

  for (const row of dailyRows) {
    if (row.week_index < startWeek || row.week_index > endWeek) {
      continue;
    }

    const ma20 = weekMa20(weeklyRows, row.week_index);
    const close = Number(row.close);
    const turnoverRate = Number(row.turnover_rate);
    const qualifies = Number.isFinite(ma20)
      && Number.isFinite(close)
      && Number.isFinite(turnoverRate)
      && turnoverRate < 10
      && close >= ma20 * 0.98;
    const current = { ...row, ma20 };

    if (qualifies && previous && row.trade_index === previous.trade_index + 1) {
      return { first: previous, second: current };
    }

    previous = qualifies ? current : null;
  }

  return null;
}

function weekMa20(weeklyRows, weekIndex) {
  const closes = [];
  for (let index = weekIndex - 20; index < weekIndex; index += 1) {
    const close = Number(weeklyRows[index]?.close);
    if (Number.isFinite(close)) {
      closes.push(close);
    }
  }
  if (closes.length < 20) {
    return null;
  }
  return closes.reduce((sum, value) => sum + value, 0) / closes.length;
}

function compareTurnoverCandidates(left, right) {
  const dateCompare = String(right.signal_date || "").localeCompare(String(left.signal_date || ""));
  if (dateCompare) {
    return dateCompare;
  }
  return Number(right.setup_gain_pct || 0) - Number(left.setup_gain_pct || 0);
}

function buildTradeWeeks(tradeDates) {
  const weeks = [];
  const byKey = new Map();
  for (const tradeDate of tradeDates || []) {
    const key = weekStartKey(tradeDate);
    let week = byKey.get(key);
    if (!week) {
      week = {
        key,
        start_date: tradeDate,
        end_date: tradeDate,
        trade_dates: [],
      };
      byKey.set(key, week);
      weeks.push(week);
    }
    week.end_date = tradeDate;
    week.trade_dates.push(tradeDate);
  }
  return weeks;
}

function weekStartKey(tradeDate) {
  const raw = String(tradeDate || "");
  const year = Number(raw.slice(0, 4));
  const month = Number(raw.slice(4, 6));
  const day = Number(raw.slice(6, 8));
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return raw;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  const mondayOffset = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - mondayOffset);
  return formatDateCompactUtc(date);
}

function formatDateCompactUtc(date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("");
}

async function getDailySeries(tsCode, startDate, endDate) {
  const key = `${tsCode}:${startDate}:${endDate}`;
  const cached = dailySeriesCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.rows;
  }

  const rows = await callTushare("daily", {
    ts_code: tsCode,
    start_date: startDate,
    end_date: endDate,
  }, "ts_code,trade_date,open,high,low,close,pct_chg,vol,amount");

  const normalized = rows
    .map(normalizeDailyRow)
    .sort((a, b) => a.trade_date.localeCompare(b.trade_date));
  dailySeriesCache.set(key, {
    expiresAt: Date.now() + 6 * 60 * 60 * 1000,
    rows: normalized,
  });
  return normalized;
}

function rowsByCode(rows) {
  const map = new Map();
  for (const row of rows || []) {
    if (row.ts_code) {
      map.set(row.ts_code, row);
    }
  }
  return map;
}

function rowsByCodeAndDate(rows) {
  const map = new Map();
  for (const row of rows || []) {
    if (row.trade_date) {
      map.set(row.trade_date, row);
    }
  }
  return map;
}

function computeTrailingReturnPct(rows, days, latestTradeDate) {
  const sortedRows = (rows || [])
    .filter((row) => Number(row.close) > 0)
    .sort((a, b) => String(a.trade_date || "").localeCompare(String(b.trade_date || "")));
  const latest = sortedRows.at(-1);
  if (!latest || String(latest.trade_date || "") !== String(latestTradeDate || "")) {
    return null;
  }

  if (Number(days) === 1 && Number.isFinite(Number(latest.pct_chg))) {
    return round(latest.pct_chg, 2);
  }

  const baseIndex = sortedRows.length - 1 - Number(days);
  const base = baseIndex >= 0 ? sortedRows[baseIndex] : null;
  const baseClose = Number(base?.close || 0);
  const latestClose = Number(latest.close || 0);
  if (baseClose <= 0 || latestClose <= 0) {
    return null;
  }
  return round(((latestClose - baseClose) / baseClose) * 100, 2);
}

function aggregateMoneyflowBySector(tradeDate, rows, sectorMeta) {
  const sectors = {};
  for (const sector of sectorMeta.sectors) {
    sectors[sector.name] = {
      net_amount: 0,
      gross_amount: 0,
      inflow_count: 0,
      outflow_count: 0,
      stock_count: 0,
      top_inflow_stock: null,
      top_outflow_stock: null,
    };
  }

  for (const row of rows) {
    const sectorName = sectorMeta.stockToSector.get(row.ts_code);
    if (!sectorName || !sectors[sectorName]) {
      continue;
    }
    const net = Number(row.net_mf_amount || 0);
    const item = sectors[sectorName];
    item.net_amount += net;
    item.gross_amount += Math.abs(net);
    item.stock_count += 1;
    if (net > 0) {
      item.inflow_count += 1;
    } else if (net < 0) {
      item.outflow_count += 1;
    }
    if (net > 0 && (!item.top_inflow_stock || net > item.top_inflow_stock.net_amount)) {
      item.top_inflow_stock = {
        ts_code: row.ts_code,
        name: sectorMeta.stockMeta.get(row.ts_code)?.name || row.ts_code,
        net_amount: round(net, 2),
      };
    }
    if (net < 0 && (!item.top_outflow_stock || net < item.top_outflow_stock.net_amount)) {
      item.top_outflow_stock = {
        ts_code: row.ts_code,
        name: sectorMeta.stockMeta.get(row.ts_code)?.name || row.ts_code,
        net_amount: round(net, 2),
      };
    }
  }

  for (const value of Object.values(sectors)) {
    value.net_amount = round(value.net_amount, 2);
    value.gross_amount = round(value.gross_amount, 2);
    value.positive = value.net_amount > 0;
    value.diffusion_pct = value.stock_count > 0
      ? round((value.inflow_count / value.stock_count) * 100, 2)
      : null;
    value.intensity_pct = value.gross_amount > 0
      ? round((value.net_amount / value.gross_amount) * 100, 2)
      : null;
  }

  return { trade_date: tradeDate, sectors };
}

function selectRankingDates(tradeDates, period, options) {
  if (period === "week") {
    return tradeDates.slice(-5);
  }
  if (period === "month") {
    return tradeDates.slice(-20);
  }
  if (period === "range") {
    const start = compactDate(options.startDate) || tradeDates[0];
    const end = compactDate(options.endDate) || tradeDates.at(-1);
    return tradeDates.filter((date) => date >= start && date <= end);
  }
  return tradeDates.slice(-1);
}

function buildSectorRanking(flowByDate, sectors) {
  const ranking = new Map();
  for (const sector of sectors) {
    ranking.set(sector.name, {
      code: sector.code,
      name: sector.name,
      net_amount: 0,
      gross_amount: 0,
      inflow_count: 0,
      outflow_count: 0,
      stock_count: 0,
      days: flowByDate.length,
      top_inflow_stock: null,
      top_outflow_stock: null,
    });
  }

  for (const day of flowByDate) {
    for (const [name, item] of Object.entries(day.sectors)) {
      const target = ranking.get(name);
      if (!target) {
        continue;
      }
      target.net_amount += Number(item.net_amount || 0);
      target.gross_amount += Number(item.gross_amount || 0);
      target.inflow_count += Number(item.inflow_count || 0);
      target.outflow_count += Number(item.outflow_count || 0);
      target.stock_count = Math.max(target.stock_count, Number(item.stock_count || 0));
      if (item.top_inflow_stock && (!target.top_inflow_stock || item.top_inflow_stock.net_amount > target.top_inflow_stock.net_amount)) {
        target.top_inflow_stock = item.top_inflow_stock;
      }
      if (item.top_outflow_stock && (!target.top_outflow_stock || item.top_outflow_stock.net_amount < target.top_outflow_stock.net_amount)) {
        target.top_outflow_stock = item.top_outflow_stock;
      }
    }
  }

  return Array.from(ranking.values())
    .map((item) => ({
      ...item,
      net_amount: round(item.net_amount, 2),
      gross_amount: round(item.gross_amount, 2),
    }))
    .sort((a, b) => b.net_amount - a.net_amount);
}

async function getRecentOpenTradeDates(count) {
  const daysBack = Math.max(80, count * 2 + 30);
  const range = getDateRange(daysBack);
  const today = formatDateCompactShanghai();
  const rows = await callTushare("trade_cal", {
    exchange: "SSE",
    start_date: range.start,
    end_date: today,
  }, "exchange,cal_date,is_open,pretrade_date");

  return rows
    .filter((row) => row.is_open === 1 && row.cal_date <= today)
    .map((row) => row.cal_date)
    .sort()
    .slice(-count);
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function compactDate(value) {
  return String(value || "").replaceAll("-", "").trim();
}

async function getMarketSnapshot() {
  const targetTradeDate = await getTargetTradeDate();

  const [topList, hsgtTop] = await Promise.allSettled([
    callTushare("top_list", {
      trade_date: targetTradeDate,
    }, [
      "trade_date",
      "ts_code",
      "name",
      "close",
      "pct_change",
      "turnover_rate",
      "amount",
      "l_sell",
      "l_buy",
      "l_amount",
      "net_amount",
      "reason",
    ].join(",")),
    callTushare("hsgt_top10", {
      trade_date: targetTradeDate,
      market_type: "1",
    }, [
      "trade_date",
      "ts_code",
      "name",
      "close",
      "change",
      "rank",
      "market_type",
      "amount",
      "net_amount",
      "buy",
      "sell",
    ].join(",")),
  ]);

  const stockMeta = await getStockBasics().catch(() => []);
  const stockMetaByCode = new Map(stockMeta.map((stock) => [stock.ts_code, stock]));
  const enrichMarketRow = (row) => {
    const meta = stockMetaByCode.get(row.ts_code) || {};
    return {
      ...row,
      name: row.name || meta.name || row.ts_code,
      industry: meta.industry || "",
      area: meta.area || "",
      market: meta.market || "",
    };
  };

  const topRows = settledValue(topList, [])
    .map(enrichMarketRow)
    .slice()
    .sort((a, b) => Math.abs(Number(b.net_amount || b.amount || 0)) - Math.abs(Number(a.net_amount || a.amount || 0)));
  const hsgtRows = settledValue(hsgtTop, [])
    .map(enrichMarketRow)
    .slice()
    .sort((a, b) => Number(a.rank || 999) - Number(b.rank || 999));

  return {
    target_trade_date: targetTradeDate,
    topList: topRows.slice(0, 30),
    hsgtTop: hsgtRows.slice(0, 10),
    errors: {
      topList: settledError(topList),
      hsgtTop: settledError(hsgtTop),
    },
  };
}

async function callTushare(apiName, params, fields) {
  let response;
  try {
    response = await fetch(TUSHARE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_name: apiName,
        token: TUSHARE_TOKEN,
        params,
        fields,
      }),
      signal: AbortSignal.timeout(20000),
    });
  } catch (cause) {
    const error = new Error(`TuShare 网络请求失败：${cause.message}`);
    error.status = 502;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(`TuShare HTTP ${response.status}`);
    error.status = 502;
    throw error;
  }

  const payload = await response.json();
  if (payload.code !== 0) {
    const error = new Error(payload.msg || `${apiName} 调用失败`);
    error.status = 502;
    error.apiCode = payload.code;
    throw error;
  }

  const data = payload.data || {};
  const resultFields = data.fields || [];
  const items = data.items || [];
  return items.map((row) => {
    const item = {};
    resultFields.forEach((field, index) => {
      item[field] = row[index];
    });
    return item;
  });
}

async function readJsonBody(req) {
  const text = await readTextBody(req);
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw badRequest("请求体不是合法 JSON");
  }
}

async function readTextBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return "";
  }

  return Buffer.concat(chunks).toString("utf8");
}

function normalizeDailyRow(row) {
  return {
    ts_code: row.ts_code,
    trade_date: String(row.trade_date || ""),
    open: nullableNumber(row.open),
    high: nullableNumber(row.high),
    low: nullableNumber(row.low),
    close: nullableNumber(row.close),
    pre_close: nullableNumber(row.pre_close),
    change: nullableNumber(row.change),
    pct_chg: nullableNumber(row.pct_chg),
    vol: nullableNumber(row.vol),
    amount: nullableNumber(row.amount),
  };
}

function normalizeMetricRow(row) {
  return {
    ts_code: row.ts_code,
    trade_date: String(row.trade_date || ""),
    turnover_rate: nullableNumber(row.turnover_rate),
    volume_ratio: nullableNumber(row.volume_ratio),
    pe: nullableNumber(row.pe),
    pb: nullableNumber(row.pb),
    ps: nullableNumber(row.ps),
    total_mv: nullableNumber(row.total_mv),
    circ_mv: nullableNumber(row.circ_mv),
  };
}

function normalizeTurnoverDailyBasicRow(row) {
  return {
    ts_code: row.ts_code,
    trade_date: String(row.trade_date || ""),
    close: nullableNumber(row.close),
    turnover_rate: nullableNumber(row.turnover_rate),
    total_mv: nullableNumber(row.total_mv),
    circ_mv: nullableNumber(row.circ_mv),
  };
}

function validateValuationOrder(item) {
  const values = [item.low_price, item.fair_price, item.high_price];
  if (values.every((value) => value === null || value === undefined)) {
    return;
  }

  if (!values.every((value) => Number.isFinite(Number(value)))) {
    return;
  }

  if (!(Number(item.low_price) <= Number(item.fair_price) && Number(item.fair_price) <= Number(item.high_price))) {
    throw badRequest("估值区间需要满足：低估线 <= 合理价值 <= 高估线");
  }
}

function pickValuation(item) {
  return {
    low_price: nullableNumber(item.low_price),
    fair_price: nullableNumber(item.fair_price),
    high_price: nullableNumber(item.high_price),
  };
}

function sameValuation(left, right) {
  return left.low_price === right.low_price
    && left.fair_price === right.fair_price
    && left.high_price === right.high_price;
}

function normalizeCode(value) {
  const raw = String(value || "").trim().toUpperCase();
  if (!raw) {
    return "";
  }

  if (/^\d{6}$/.test(raw)) {
    if (/^(6|9)/.test(raw)) {
      return `${raw}.SH`;
    }
    if (/^(4|8)/.test(raw)) {
      return `${raw}.BJ`;
    }
    return `${raw}.SZ`;
  }

  return raw;
}

function normalizeSearch(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function cleanText(value) {
  return String(value || "").trim();
}

function nullableNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, number));
}

function round(value, digits) {
  if (!Number.isFinite(Number(value))) {
    return null;
  }
  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
}

function sortTradeDateDesc(a, b) {
  return String(b.trade_date || "").localeCompare(String(a.trade_date || ""));
}

function settledValue(entry, fallback) {
  return entry.status === "fulfilled" ? entry.value : fallback;
}

function settledError(entry) {
  return entry.status === "rejected" ? entry.reason.message : "";
}

function getDateRange(days) {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);
  return {
    start: formatDateCompact(startDate),
    end: formatDateCompact(endDate),
  };
}

function formatDateCompact(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function formatDateCompactShanghai(date = new Date()) {
  const parts = getShanghaiParts(date);
  return `${parts.year}${String(parts.month).padStart(2, "0")}${String(parts.day).padStart(2, "0")}`;
}

function getShanghaiParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
  };
}

function formatDateHuman(value) {
  const raw = String(value || "");
  if (!/^\d{8}$/.test(raw)) {
    return raw || "--";
  }
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function safeConsoleError(...args) {
  try {
    console.error(...args);
  } catch {
    // Detached local runs can lose stderr; never let logging terminate the app.
  }
}

function notFound(message) {
  const error = new Error(message);
  error.status = 404;
  return error;
}

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function badGateway(message) {
  const error = new Error(message);
  error.status = 502;
  return error;
}

function sendJson(res, status, payload, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(JSON.stringify(payload));
}

function sendPlain(res, status, text) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(text);
}

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
