const state = {
  route: parseRoute(),
  locale: initialLocale(),
  auth: {
    checked: false,
    authenticated: false,
    user: null,
  },
  loginLoading: false,
  loginError: "",
  users: [],
  usersLoading: false,
  usersError: "",
  selectedUserId: "",
  selectedUserLogins: null,
  selectedUserLoginsLoading: false,
  dashboard: null,
  groups: [],
  watchlist: [],
  sync: null,
  searchQuery: "",
  searchResults: [],
  searchLoading: false,
  searchError: "",
  stockSuggestKind: "",
  stockSuggestQuery: "",
  stockSuggestResults: [],
  stockSuggestLoading: false,
  stockSuggestError: "",
  dashboardQuery: "",
  poolListQuery: "",
  marketQuery: "",
  sectorQuery: "",
  turnoverQuery: "",
  strengthQuery: "",
  valuationQuery: "",
  detail: null,
  detailLoading: false,
  detailError: "",
  detailId: "",
  detailTab: "analysis",
  companyAnalysisLoading: false,
  companyAnalysisPollTimer: 0,
  valuations: null,
  valuationsLoading: false,
  valuationsError: "",
  valuationDraft: null,
  valuationSaving: false,
  valuationPdfLoading: false,
  valuationTushareLoading: false,
  valuationAiAssumptionLoading: false,
  valuationAiPreview: null,
  valuationAiError: null,
  valuationStockResults: [],
  valuationStockLoading: false,
  valuationStockError: "",
  chartPeriod: "day",
  chartRows: [],
  chartLoading: false,
  chartError: "",
  chartKey: "",
  chartLoadedKey: "",
  market: null,
  marketLoading: false,
  marketError: "",
  decisions: null,
  decisionsLoading: false,
  decisionsError: "",
  decisionQuery: "",
  decisionPage: 1,
  decisionDraftCode: "",
  turnoverMonitor: null,
  turnoverLoading: false,
  turnoverError: "",
  turnoverPage: 1,
  strategySearch: "",
  strategyCode: "",
  strategyData: null,
  strategyLoading: false,
  strategyError: "",
  strategyTab: "tplus1",
  strategyMonitors: [],
  strategyMonitorQuery: "",
  strategyMonitorSaving: false,
  strategyTParams: {
    period: 20,
    basePriceType: "latestClose",
    holdingCost: "",
    customBasePrice: "",
    safetyMargin: 0.003,
    enableTrendFilter: true,
    enableVolumeFilter: true,
    enableLimitFilter: true,
  },
  strategyGridParams: {
    horizonDays: 10,
    gridMode: "standard",
    gridCount: "",
    centerPriceType: "auto",
    holdingCost: "",
    customCenterPrice: "",
    feeRate: 0.0003,
    slippageRate: 0.0005,
    safetyMargin: 0.003,
    enableTrendFilter: true,
    enableVolumeFilter: true,
    enableLimitFilter: true,
  },
  strengthMatrix: null,
  strengthLoading: false,
  strengthError: "",
  strengthLevel: "L3",
  strengthSort: "overall",
  strengthStatus: [],
  strengthView: "segment",
  strengthInfoTab: "score",
  strengthInfoOpen: false,
  strengthPage: 1,
  sectorFlow: null,
  sectorLoading: false,
  sectorError: "",
  sectorLevel: "L3",
  sectorTrendDays: 30,
  sectorPeriod: "day",
  sectorStartDate: "",
  sectorEndDate: "",
  sectorVisibility: {},
  sectorVisibilityQuery: "",
  sectorPool: [],
  sectorPoolError: "",
  sectorPoolQuery: "",
  sectorPoolLevel: "all",
  sectorPoolTrendDays: 180,
  sectorPoolTrendFlow: null,
  sectorPoolTrendLoading: false,
  sectorPoolTrendError: "",
  sectorPoolTrendKey: "",
  sectorPoolVisibility: {},
  sectorPoolChartPoints: [],
  sectorChartPoints: [],
  sectorDetail: null,
  sectorDetailLoading: false,
  sectorDetailError: "",
  sectorDetailCode: "",
  sectorStockTrendDays: 30,
  sectorStockWindow: 5,
  sectorStockMetric: "return",
  sectorStockChartMode: "return",
  sectorStockVisibility: {},
  sectorStockChartPoints: [],
  sectorStockQuery: "",
  sectorStockPage: 1,
  filters: {
    group: "all",
    status: "all",
  },
  poolTab: "stocks",
  editing: null,
  toast: "",
  coreLoading: true,
  coreError: "",
};

const app = document.querySelector("#app");
const modalRoot = document.querySelector("#modal-root");
const DEFAULT_VALUATION_BAND_PCT = 20;
const LOCALE_KEY = "valuation_diary_locale";
const LOCALES = [
  { code: "zh-CN", label: "简体中文" },
  { code: "zh-TW", label: "繁體中文" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
];
let valuationStockSearchTimer = 0;
let stockSuggestTimer = 0;
let syncPollingTimer = 0;

const I18N = {
  "zh-CN": {
    appName: "估值手账",
    appSubtitle: "A 股股票池与估值纪律",
    localRunning: "本地运行",
    localRunningNote: "TuShare token 只在服务端读取，前端不会暴露。",
    quickSearch: "搜索股票、板块或估值记录",
    localeLabel: "语言",
    navDashboard: "仪表盘",
    navMonitor: "我的监控",
    navPool: "我的股票池",
    navSectorPool: "我的板块池",
    navValuations: "估值列表",
    navAnomaly: "异动监控",
    navMarket: "市场观察",
    navTurnover: "换手率异动",
    navShortStrategy: "短线监控列表",
    navDecisions: "决策复盘",
    navSector: "板块监控",
    navSectors: "板块资金",
    navStrength: "资金强弱矩阵",
    dashboardEyebrow: "Value Investing Dashboard",
    dashboardTitle: "价值投资仪表盘",
    dashboardSubtitle: "围绕企业价值、价格偏离和长期跟踪，把你的股票池变成一套可复盘的投资纪律。",
    reload: "刷新页面",
    syncClose: "同步收盘数据",
    searchDashboard: "输入股票名称或代码，筛选仪表盘列表",
    watchPool: "股票池",
    undervalued: "低估",
    fair: "合理",
    overvalued: "高估",
    stockUnit: "只",
    watchPoolHint: "总关注数量",
    undervaluedHint: "低于或等于低估线",
    fairHint: "位于估值区间内",
    overvaluedHint: "高于或等于高估线",
    underAlert: "低估提醒",
    overAlert: "高估提醒",
    nearLow: "接近低估线",
    todayMoves: "今日动态",
    emptyUnder: "暂时没有进入低估区的股票",
    emptyOver: "暂时没有进入高估区的股票",
    emptyNearLow: "还没有接近低估线的股票",
    emptyMoves: "同步价格后会显示涨跌幅动态",
    methodologyLabel: "价值投资方法论",
    methodologyTitle: "先理解企业，再讨论价格",
    methodologySubtitle: "价值投资不是买低 PE，也不是长期不动。它是一套持续评估企业质量、现金流、估值假设和安全边际的工作流。",
    methodologyWhatTitle: "什么是价值投资？",
    methodologyWhatText: "以企业内在价值为锚，比较市场价格和合理价值之间的差距，只在赔率和确定性同时足够时行动。",
    methodologyWhyTitle: "为什么要做价值投资？",
    methodologyWhyText: "它把注意力从短期波动转回企业经营结果，帮助你用纪律降低情绪化交易和追涨杀跌。",
    methodologyHowTitle: "价值投资怎么做？",
    methodologyHowText: "建立股票池，理解商业模式，估算合理价值，设置低估和高估区间，并在假设变化时更新估值流水。",
    methodologySkillTitle: "需要掌握什么技能？",
    methodologySkillText: "财报阅读、行业比较、现金流折现、估值倍数、竞争格局判断，以及对价格趋势和资金环境的风险识别。",
    syncFallback: "尚未同步",
    targetTradeDate: "目标交易日",
    success: "成功",
    nextRetry: "下次重试",
    syncRetryHint: "价格失败时会持续重试，直到目标交易日收盘价同步成功。",
    countSuffix: "条",
    search: "搜索",
  },
  "zh-TW": {
    appName: "估值手帳",
    appSubtitle: "A 股股票池與估值紀律",
    localRunning: "本機執行",
    localRunningNote: "TuShare token 只在服務端讀取，前端不會暴露。",
    quickSearch: "搜尋股票、板塊或估值紀錄",
    localeLabel: "語言",
    navDashboard: "儀表板",
    navMonitor: "我的監控",
    navPool: "我的股票池",
    navSectorPool: "我的板塊池",
    navValuations: "估值列表",
    navAnomaly: "異動監控",
    navMarket: "市場觀察",
    navTurnover: "換手率異動",
    navShortStrategy: "短線監控列表",
    navDecisions: "決策復盤",
    navSector: "板塊監控",
    navSectors: "板塊資金",
    navStrength: "資金強弱矩陣",
    dashboardEyebrow: "Value Investing Dashboard",
    dashboardTitle: "價值投資儀表板",
    dashboardSubtitle: "圍繞企業價值、價格偏離和長期追蹤，把你的股票池變成一套可復盤的投資紀律。",
    reload: "重新整理",
    syncClose: "同步收盤資料",
    searchDashboard: "輸入股票名稱或代碼，篩選儀表板列表",
    watchPool: "股票池",
    undervalued: "低估",
    fair: "合理",
    overvalued: "高估",
    stockUnit: "檔",
    watchPoolHint: "總關注數量",
    undervaluedHint: "低於或等於低估線",
    fairHint: "位於估值區間內",
    overvaluedHint: "高於或等於高估線",
    underAlert: "低估提醒",
    overAlert: "高估提醒",
    nearLow: "接近低估線",
    todayMoves: "今日動態",
    emptyUnder: "暫時沒有進入低估區的股票",
    emptyOver: "暫時沒有進入高估區的股票",
    emptyNearLow: "還沒有接近低估線的股票",
    emptyMoves: "同步價格後會顯示漲跌幅動態",
    methodologyLabel: "價值投資方法論",
    methodologyTitle: "先理解企業，再討論價格",
    methodologySubtitle: "價值投資不是買低 PE，也不是長期不動。它是一套持續評估企業品質、現金流、估值假設和安全邊際的工作流。",
    methodologyWhatTitle: "什麼是價值投資？",
    methodologyWhatText: "以企業內在價值為錨，比較市場價格和合理價值之間的差距，只在賠率和確定性同時足夠時行動。",
    methodologyWhyTitle: "為什麼要做價值投資？",
    methodologyWhyText: "它把注意力從短期波動轉回企業經營結果，幫助你用紀律降低情緒化交易和追漲殺跌。",
    methodologyHowTitle: "價值投資怎麼做？",
    methodologyHowText: "建立股票池，理解商業模式，估算合理價值，設定低估和高估區間，並在假設變化時更新估值流水。",
    methodologySkillTitle: "需要掌握什麼技能？",
    methodologySkillText: "財報閱讀、行業比較、現金流折現、估值倍數、競爭格局判斷，以及對價格趨勢和資金環境的風險識別。",
    syncFallback: "尚未同步",
    targetTradeDate: "目標交易日",
    success: "成功",
    nextRetry: "下次重試",
    syncRetryHint: "價格失敗時會持續重試，直到目標交易日收盤價同步成功。",
    countSuffix: "筆",
    search: "搜尋",
  },
  en: {
    appName: "Fin Diary",
    appSubtitle: "A-share watchlist and valuation discipline",
    localRunning: "Local",
    localRunningNote: "TuShare token is read only by the server and is never exposed in the browser.",
    quickSearch: "Search stocks, sectors, or valuations",
    localeLabel: "Language",
    navDashboard: "Dashboard",
    navMonitor: "My Monitor",
    navPool: "Stock Pool",
    navSectorPool: "Sector Pool",
    navValuations: "Valuations",
    navAnomaly: "Anomaly Monitor",
    navMarket: "Market Watch",
    navTurnover: "Turnover Monitor",
    navShortStrategy: "Short Watchlist",
    navDecisions: "Decision Review",
    navSector: "Sector Monitor",
    navSectors: "Sector Flows",
    navStrength: "Strength Matrix",
    dashboardEyebrow: "Value Investing Dashboard",
    dashboardTitle: "Value Investing Dashboard",
    dashboardSubtitle: "Track intrinsic value, price deviation, and long-term discipline across your watchlist.",
    reload: "Refresh",
    syncClose: "Sync Close Prices",
    searchDashboard: "Search dashboard lists by stock name or code",
    watchPool: "Watchlist",
    undervalued: "Undervalued",
    fair: "Fair",
    overvalued: "Overvalued",
    stockUnit: "",
    watchPoolHint: "Total tracked stocks",
    undervaluedHint: "At or below your low line",
    fairHint: "Inside valuation range",
    overvaluedHint: "At or above your high line",
    underAlert: "Undervalue Alerts",
    overAlert: "Overvalue Alerts",
    nearLow: "Near Low Line",
    todayMoves: "Today",
    emptyUnder: "No stocks are in the undervalued zone yet",
    emptyOver: "No stocks are in the overvalued zone yet",
    emptyNearLow: "No stocks are near the low line yet",
    emptyMoves: "Price moves appear after close-price sync",
    methodologyLabel: "Value Investing Method",
    methodologyTitle: "Understand the business before the price",
    methodologySubtitle: "Value investing is not simply buying low PE or holding forever. It is a workflow for evaluating business quality, cash flows, valuation assumptions, and margin of safety.",
    methodologyWhatTitle: "What Is Value Investing?",
    methodologyWhatText: "Anchor decisions on intrinsic value, compare it with market price, and act only when odds and confidence are both sufficient.",
    methodologyWhyTitle: "Why Do It?",
    methodologyWhyText: "It shifts attention from short-term volatility to business results, reducing emotional trades and trend chasing.",
    methodologyHowTitle: "How To Practice It?",
    methodologyHowText: "Build a watchlist, understand the business model, estimate fair value, set low and high zones, and update assumptions when facts change.",
    methodologySkillTitle: "What Skills Matter?",
    methodologySkillText: "Financial statement reading, industry comparison, DCF, valuation multiples, competitive analysis, and risk awareness around price trends and capital flows.",
    syncFallback: "Not synced yet",
    targetTradeDate: "Target date",
    success: "Success",
    nextRetry: "Next retry",
    syncRetryHint: "The system keeps retrying failed prices until the target close price is synced.",
    countSuffix: "",
    search: "Search",
  },
  ja: {
    appName: "Fin Diary",
    appSubtitle: "A株ウォッチリストとバリュエーション規律",
    localRunning: "ローカル実行",
    localRunningNote: "TuShare token はサーバー側のみで読み取られ、ブラウザには表示されません。",
    quickSearch: "銘柄、セクター、評価記録を検索",
    localeLabel: "言語",
    navDashboard: "ダッシュボード",
    navMonitor: "マイ監視",
    navPool: "銘柄プール",
    navSectorPool: "セクタープール",
    navValuations: "評価リスト",
    navAnomaly: "異常監視",
    navMarket: "市場観察",
    navTurnover: "回転率監視",
    navShortStrategy: "短期監視リスト",
    navDecisions: "意思決定レビュー",
    navSector: "セクター監視",
    navSectors: "セクター資金",
    navStrength: "資金強弱マトリクス",
    dashboardEyebrow: "Value Investing Dashboard",
    dashboardTitle: "バリュー投資ダッシュボード",
    dashboardSubtitle: "企業価値、価格乖離、長期追跡を軸に、ウォッチリストを再現可能な投資規律へ変えます。",
    reload: "更新",
    syncClose: "終値を同期",
    searchDashboard: "銘柄名またはコードでダッシュボードを絞り込み",
    watchPool: "銘柄プール",
    undervalued: "割安",
    fair: "適正",
    overvalued: "割高",
    stockUnit: "件",
    watchPoolHint: "追跡銘柄数",
    undervaluedHint: "低評価ライン以下",
    fairHint: "評価レンジ内",
    overvaluedHint: "高評価ライン以上",
    underAlert: "割安アラート",
    overAlert: "割高アラート",
    nearLow: "低評価ライン接近",
    todayMoves: "本日の動き",
    emptyUnder: "割安ゾーンの銘柄はまだありません",
    emptyOver: "割高ゾーンの銘柄はまだありません",
    emptyNearLow: "低評価ラインに近い銘柄はまだありません",
    emptyMoves: "終値同期後に値動きが表示されます",
    methodologyLabel: "バリュー投資メソッド",
    methodologyTitle: "価格の前に事業を理解する",
    methodologySubtitle: "バリュー投資は低 PER を買うことでも、ただ長期保有することでもありません。事業品質、キャッシュフロー、評価仮定、安全域を継続的に検証するワークフローです。",
    methodologyWhatTitle: "バリュー投資とは？",
    methodologyWhatText: "企業の本質価値を軸に市場価格との差を比較し、勝算と確信度が十分な時だけ行動します。",
    methodologyWhyTitle: "なぜ必要？",
    methodologyWhyText: "短期変動ではなく事業成果に意識を戻し、感情的な売買や追随取引を減らします。",
    methodologyHowTitle: "どう実践する？",
    methodologyHowText: "銘柄プールを作り、ビジネスモデルを理解し、公正価値を見積もり、割安・割高ゾーンを設定し、仮定が変われば記録を更新します。",
    methodologySkillTitle: "必要なスキルは？",
    methodologySkillText: "財務諸表の読解、業界比較、DCF、評価倍率、競争環境の判断、価格トレンドと資金環境のリスク認識です。",
    syncFallback: "未同期",
    targetTradeDate: "対象取引日",
    success: "成功",
    nextRetry: "次回再試行",
    syncRetryHint: "対象日の終値が同期されるまで、失敗した価格は自動的に再試行されます。",
    countSuffix: "件",
    search: "検索",
  },
};

const DOM_TRANSLATIONS = {
  "我的股票池": { "zh-TW": "我的股票池", en: "Stock Pool", ja: "銘柄プール" },
  "我的板块池": { "zh-TW": "我的板塊池", en: "Sector Pool", ja: "セクタープール" },
  "估值列表": { "zh-TW": "估值列表", en: "Valuations", ja: "評価リスト" },
  "市场观察": { "zh-TW": "市場觀察", en: "Market Watch", ja: "市場観察" },
  "换手率异动监控": { "zh-TW": "換手率異動監控", en: "Turnover Anomaly Monitor", ja: "回転率異常監視" },
  "资金强弱矩阵": { "zh-TW": "資金強弱矩陣", en: "Capital Strength Matrix", ja: "資金強弱マトリクス" },
  "板块资金趋势": { "zh-TW": "板塊資金趨勢", en: "Sector Fund Flow", ja: "セクター資金トレンド" },
  "决策复盘": { "zh-TW": "決策復盤", en: "Decision Review", ja: "意思決定レビュー" },
  "分组管理": { "zh-TW": "分組管理", en: "Group Management", ja: "グループ管理" },
  "搜索": { "zh-TW": "搜尋", en: "Search", ja: "検索" },
  "刷新页面": { "zh-TW": "重新整理", en: "Refresh", ja: "更新" },
  "同步收盘数据": { "zh-TW": "同步收盤資料", en: "Sync Close Prices", ja: "終値を同期" },
  "新建估值": { "zh-TW": "新增估值", en: "New Valuation", ja: "新規評価" },
  "保存估值结果": { "zh-TW": "儲存估值結果", en: "Save Valuation", ja: "評価結果を保存" },
  "重新计算": { "zh-TW": "重新計算", en: "Recalculate", ja: "再計算" },
  "低估线": { "zh-TW": "低估線", en: "Low Line", ja: "割安ライン" },
  "合理价值": { "zh-TW": "合理價值", en: "Fair Value", ja: "適正価値" },
  "高估线": { "zh-TW": "高估線", en: "High Line", ja: "割高ライン" },
};

const UI_TRANSLATIONS = {
  ...DOM_TRANSLATIONS,
  "估值手账": { "zh-TW": "估值手帳", en: "Fin Diary", ja: "Fin Diary" },
  "A 股股票池与估值纪律": { "zh-TW": "A 股股票池與估值紀律", en: "A-share watchlist and valuation discipline", ja: "A株ウォッチリストと評価規律" },
  "本地运行": { "zh-TW": "本機執行", en: "Local", ja: "ローカル実行" },
  "TuShare token 只在服务端读取，前端不会暴露。": { "zh-TW": "TuShare token 只在服務端讀取，前端不會暴露。", en: "TuShare token is read only by the server and is never exposed in the browser.", ja: "TuShare token はサーバー側のみで読み取られ、ブラウザには表示されません。" },
  "语言": { "zh-TW": "語言", en: "Language", ja: "言語" },
  "仪表盘": { "zh-TW": "儀表板", en: "Dashboard", ja: "ダッシュボード" },
  "我的监控": { "zh-TW": "我的監控", en: "My Monitor", ja: "マイ監視" },
  "异动监控": { "zh-TW": "異動監控", en: "Anomaly Monitor", ja: "異常監視" },
  "板块监控": { "zh-TW": "板塊監控", en: "Sector Monitor", ja: "セクター監視" },
  "板块资金": { "zh-TW": "板塊資金", en: "Sector Flows", ja: "セクター資金" },
  "短线策略参考": { "zh-TW": "短線策略參考", en: "Short-term Strategy", ja: "短期戦略参考" },
  "换手率异动": { "zh-TW": "換手率異動", en: "Turnover Monitor", ja: "回転率監視" },
  "龙虎榜观察": { "zh-TW": "龍虎榜觀察", en: "Dragon-Tiger Watch", ja: "龍虎榜ウォッチ" },
  "价值投资仪表盘": { "zh-TW": "價值投資儀表板", en: "Value Investing Dashboard", ja: "バリュー投資ダッシュボード" },
  "围绕企业价值、价格偏离和长期跟踪，把你的股票池变成一套可复盘的投资纪律。": { "zh-TW": "圍繞企業價值、價格偏離和長期追蹤，把你的股票池變成一套可復盤的投資紀律。", en: "Track intrinsic value, price deviation, and long-term discipline across your watchlist.", ja: "企業価値、価格乖離、長期追跡を軸に、ウォッチリストを再現可能な投資規律へ変えます。" },
  "刷新页面": { "zh-TW": "重新整理", en: "Refresh", ja: "更新" },
  "刷新": { "zh-TW": "重新整理", en: "Refresh", ja: "更新" },
  "重新加载": { "zh-TW": "重新載入", en: "Reload", ja: "再読み込み" },
  "查看服务状态": { "zh-TW": "查看服務狀態", en: "View Service Status", ja: "サービス状態を見る" },
  "同步收盘数据": { "zh-TW": "同步收盤資料", en: "Sync Close Prices", ja: "終値を同期" },
  "刷新验证结果": { "zh-TW": "重新整理驗證結果", en: "Refresh Results", ja: "検証結果を更新" },
  "刷新观察榜": { "zh-TW": "重新整理觀察榜", en: "Refresh Watch List", ja: "ウォッチリストを更新" },
  "刷新监控": { "zh-TW": "重新整理監控", en: "Refresh Monitor", ja: "監視を更新" },
  "刷新矩阵": { "zh-TW": "重新整理矩陣", en: "Refresh Matrix", ja: "マトリクスを更新" },
  "刷新板块资金": { "zh-TW": "重新整理板塊資金", en: "Refresh Sector Flows", ja: "セクター資金を更新" },
  "读取策略数据": { "zh-TW": "讀取策略資料", en: "Load Strategy Data", ja: "戦略データを読み込む" },
  "读取中...": { "zh-TW": "讀取中...", en: "Loading...", ja: "読み込み中..." },
  "生成参考": { "zh-TW": "生成參考", en: "Generate Reference", ja: "参考を生成" },
  "搜索": { "zh-TW": "搜尋", en: "Search", ja: "検索" },
  "搜索股票、板块或估值记录": { "zh-TW": "搜尋股票、板塊或估值紀錄", en: "Search stocks, sectors, or valuations", ja: "銘柄、セクター、評価記録を検索" },
  "股票池": { "zh-TW": "股票池", en: "Watchlist", ja: "銘柄プール" },
  "股票列表": { "zh-TW": "股票列表", en: "Stock List", ja: "銘柄リスト" },
  "分组管理": { "zh-TW": "分組管理", en: "Group Management", ja: "グループ管理" },
  "搜索股票": { "zh-TW": "搜尋股票", en: "Search Stock", ja: "銘柄検索" },
  "搜索股票池": { "zh-TW": "搜尋股票池", en: "Search Watchlist", ja: "銘柄プール検索" },
  "输入代码或名称，例如 600519 或 贵州茅台": { "zh-TW": "輸入代碼或名稱，例如 600519 或 貴州茅台", en: "Enter code or name, e.g. 600519 or Kweichow Moutai", ja: "コードまたは名称を入力、例: 600519 / 貴州茅台" },
  "输入股票名称或代码": { "zh-TW": "輸入股票名稱或代碼", en: "Enter stock name or code", ja: "銘柄名またはコードを入力" },
  "输入股票名称、代码或估值备注": { "zh-TW": "輸入股票名稱、代碼或估值備註", en: "Enter stock name, code, or valuation note", ja: "銘柄名、コード、評価メモを入力" },
  "输入股票、理由或验证结论": { "zh-TW": "輸入股票、理由或驗證結論", en: "Enter stock, reason, or result", ja: "銘柄、理由、検証結果を入力" },
  "输入板块名称或代码": { "zh-TW": "輸入板塊名稱或代碼", en: "Enter sector name or code", ja: "セクター名またはコードを入力" },
  "股票代码": { "zh-TW": "股票代碼", en: "Stock Code", ja: "銘柄コード" },
  "股票名称": { "zh-TW": "股票名稱", en: "Stock Name", ja: "銘柄名" },
  "股票名称或代码": { "zh-TW": "股票名稱或代碼", en: "Stock name or code", ja: "銘柄名またはコード" },
  "例如 300274 或 300274.SZ": { "zh-TW": "例如 300274 或 300274.SZ", en: "e.g. 300274 or 300274.SZ", ja: "例: 300274 または 300274.SZ" },
  "例如 阳光电源 或 300274.SZ": { "zh-TW": "例如 陽光電源 或 300274.SZ", en: "e.g. Sungrow or 300274.SZ", ja: "例: 陽光電源 または 300274.SZ" },
  "分组": { "zh-TW": "分組", en: "Group", ja: "グループ" },
  "全部分组": { "zh-TW": "全部分組", en: "All Groups", ja: "すべてのグループ" },
  "全部状态": { "zh-TW": "全部狀態", en: "All Statuses", ja: "すべての状態" },
  "全部": { "zh-TW": "全部", en: "All", ja: "すべて" },
  "估值状态": { "zh-TW": "估值狀態", en: "Valuation Status", ja: "評価状態" },
  "未估值": { "zh-TW": "未估值", en: "Unpriced", ja: "未評価" },
  "未估值/待价格": { "zh-TW": "未估值/待價格", en: "Unpriced / Waiting Price", ja: "未評価 / 価格待ち" },
  "低估": { "zh-TW": "低估", en: "Undervalued", ja: "割安" },
  "合理": { "zh-TW": "合理", en: "Fair", ja: "適正" },
  "高估": { "zh-TW": "高估", en: "Overvalued", ja: "割高" },
  "低估提醒": { "zh-TW": "低估提醒", en: "Undervalue Alerts", ja: "割安アラート" },
  "高估提醒": { "zh-TW": "高估提醒", en: "Overvalue Alerts", ja: "割高アラート" },
  "接近低估线": { "zh-TW": "接近低估線", en: "Near Low Line", ja: "割安ライン接近" },
  "低估线": { "zh-TW": "低估線", en: "Low Line", ja: "割安ライン" },
  "合理价值": { "zh-TW": "合理價值", en: "Fair Value", ja: "適正価値" },
  "高估线": { "zh-TW": "高估線", en: "High Line", ja: "割高ライン" },
  "估值区间": { "zh-TW": "估值區間", en: "Valuation Range", ja: "評価レンジ" },
  "估值依据": { "zh-TW": "估值依據", en: "Valuation Basis", ja: "評価根拠" },
  "估值备注": { "zh-TW": "估值備註", en: "Valuation Note", ja: "評価メモ" },
  "本次调整原因": { "zh-TW": "本次調整原因", en: "Reason for Change", ja: "今回の調整理由" },
  "备注": { "zh-TW": "備註", en: "Note", ja: "メモ" },
  "默认股票池": { "zh-TW": "預設股票池", en: "Default Watchlist", ja: "デフォルト銘柄プール" },
  "未加入股票池": { "zh-TW": "未加入股票池", en: "Not in Watchlist", ja: "未追加" },
  "加入股票池": { "zh-TW": "加入股票池", en: "Add to Watchlist", ja: "銘柄プールに追加" },
  "加入验证": { "zh-TW": "加入驗證", en: "Add Test", ja: "検証に追加" },
  "编辑估值": { "zh-TW": "編輯估值", en: "Edit Valuation", ja: "評価を編集" },
  "返回股票池": { "zh-TW": "返回股票池", en: "Back to Watchlist", ja: "銘柄プールに戻る" },
  "最新收盘": { "zh-TW": "最新收盤", en: "Latest Close", ja: "最新終値" },
  "最新收盘价": { "zh-TW": "最新收盤價", en: "Latest Close", ja: "最新終値" },
  "涨跌幅": { "zh-TW": "漲跌幅", en: "Change", ja: "騰落率" },
  "偏离合理价值": { "zh-TW": "偏離合理價值", en: "Deviation from Fair Value", ja: "適正価値からの乖離" },
  "基于你的估值区间": { "zh-TW": "基於你的估值區間", en: "Based on your valuation range", ja: "あなたの評価レンジに基づく" },
  "现价相对合理价值": { "zh-TW": "現價相對合理價值", en: "Current price vs fair value", ja: "現在値と適正価値の比較" },
  "价格日期": { "zh-TW": "價格日期", en: "Price date", ja: "価格日" },
  "价格与估值线": { "zh-TW": "價格與估值線", en: "Price and Valuation Lines", ja: "価格と評価ライン" },
  "分时": { "zh-TW": "分時", en: "Intraday", ja: "分足" },
  "日线": { "zh-TW": "日線", en: "Daily", ja: "日足" },
  "周线": { "zh-TW": "週線", en: "Weekly", ja: "週足" },
  "月线": { "zh-TW": "月線", en: "Monthly", ja: "月足" },
  "季线": { "zh-TW": "季線", en: "Quarterly", ja: "四半期足" },
  "年线": { "zh-TW": "年線", en: "Yearly", ja: "年足" },
  "公司分析": { "zh-TW": "公司分析", en: "Company Analysis", ja: "企業分析" },
  "估值流水": { "zh-TW": "估值流水", en: "Valuation History", ja: "評価履歴" },
  "研报记录": { "zh-TW": "研報紀錄", en: "Research Reports", ja: "レポート記録" },
  "新闻与公告入口": { "zh-TW": "新聞與公告入口", en: "News and Announcements", ja: "ニュースと公告" },
  "重新分析": { "zh-TW": "重新分析", en: "Analyze Again", ja: "再分析" },
  "公司简介与业务": { "zh-TW": "公司簡介與業務", en: "Company Profile and Business", ja: "会社概要と事業" },
  "主要产品或服务": { "zh-TW": "主要產品或服務", en: "Main Products or Services", ja: "主な製品・サービス" },
  "应用场景": { "zh-TW": "應用場景", en: "Use Cases", ja: "用途" },
  "行业位置": { "zh-TW": "行業位置", en: "Industry Position", ja: "業界ポジション" },
  "产业链全景图与公司位置": { "zh-TW": "產業鏈全景圖與公司位置", en: "Industry Chain and Company Position", ja: "産業チェーンと会社位置" },
  "最终产品成本拆解": { "zh-TW": "最終產品成本拆解", en: "Final Product Cost Breakdown", ja: "最終製品コスト分解" },
  "产业链毛利率与净利率": { "zh-TW": "產業鏈毛利率與淨利率", en: "Industry Chain Margins", ja: "産業チェーンの利益率" },
  "历史分析记录": { "zh-TW": "歷史分析紀錄", en: "Analysis History", ja: "分析履歴" },
  "先估值，再谈买入": { "zh-TW": "先估值，再談買入", en: "Value First, Then Buy", ja: "まず評価し、買いを考える" },
  "价值投资的核心不是预测明天涨跌，而是持续回答三个问题：企业值多少钱、现在价格给了多少安全边际、当假设变化时估值是否也要变化。": { "zh-TW": "價值投資的核心不是預測明天漲跌，而是持續回答三個問題：企業值多少錢、現在價格給了多少安全邊際、當假設變化時估值是否也要變化。", en: "Value investing is not about predicting tomorrow. It keeps answering three questions: what the business is worth, how much margin of safety the price offers, and whether valuation should change when assumptions change.", ja: "バリュー投資の核心は明日の値動きを予測することではなく、企業価値、安全域、前提変更時の評価更新を継続的に確認することです。" },
  "估值结果列表": { "zh-TW": "估值結果列表", en: "Valuation Results", ja: "評価結果リスト" },
  "还没有保存过估值结果": { "zh-TW": "還沒有儲存過估值結果", en: "No valuation results saved yet", ja: "保存された評価結果はまだありません" },
  "新建估值": { "zh-TW": "新增估值", en: "New Valuation", ja: "新規評価" },
  "查看估值结果": { "zh-TW": "查看估值結果", en: "View Valuation", ja: "評価結果を見る" },
  "返回估值列表": { "zh-TW": "返回估值列表", en: "Back to Valuations", ja: "評価リストに戻る" },
  "估值不是为了得到一个精确数字，而是让买入决策有边界：低估线保护安全边际，合理价值约束预期，高估线提醒兑现或复核假设。": { "zh-TW": "估值不是為了得到一個精確數字，而是讓買入決策有邊界：低估線保護安全邊際，合理價值約束預期，高估線提醒兌現或複核假設。", en: "Valuation is not about one precise number. It gives boundaries: the low line protects margin of safety, fair value anchors expectations, and the high line reminds you to realize gains or review assumptions.", ja: "評価は正確な一点を出すためではなく、買い判断に境界を作るためのものです。割安ライン、安全域、適正価値、割高ラインで前提を管理します。" },
  "保存估值结果": { "zh-TW": "儲存估值結果", en: "Save Valuation", ja: "評価結果を保存" },
  "重新计算": { "zh-TW": "重新計算", en: "Recalculate", ja: "再計算" },
  "基础信息与数据回填": { "zh-TW": "基礎資訊與資料回填", en: "Basic Info and Data Fill", ja: "基本情報とデータ入力" },
  "可手动填写，也可上传财报 PDF 让 Gemini 提取字段": { "zh-TW": "可手動填寫，也可上傳財報 PDF 讓 Gemini 提取欄位", en: "Fill manually or upload a PDF report for Gemini extraction", ja: "手入力またはPDF財報をアップロードして Gemini で抽出できます" },
  "上传财报 PDF": { "zh-TW": "上傳財報 PDF", en: "Upload Financial PDF", ja: "財報PDFをアップロード" },
  "用 Gemini 回填财报字段": { "zh-TW": "用 Gemini 回填財報欄位", en: "Fill with Gemini", ja: "Geminiで入力" },
  "提取中...": { "zh-TW": "提取中...", en: "Extracting...", ja: "抽出中..." },
  "选择估值方法": { "zh-TW": "選擇估值方法", en: "Choose Valuation Methods", ja: "評価方法を選択" },
  "财报原始字段": { "zh-TW": "財報原始欄位", en: "Raw Financial Fields", ja: "財務原始項目" },
  "推导后的估值字段": { "zh-TW": "推導後的估值欄位", en: "Derived Valuation Fields", ja: "推定評価項目" },
  "估值结果": { "zh-TW": "估值結果", en: "Valuation Result", ja: "評価結果" },
  "估值方法": { "zh-TW": "估值方法", en: "Valuation Method", ja: "評価方法" },
  "方法": { "zh-TW": "方法", en: "Method", ja: "方法" },
  "来源": { "zh-TW": "來源", en: "Source", ja: "ソース" },
  "时间": { "zh-TW": "時間", en: "Time", ja: "時刻" },
  "操作": { "zh-TW": "操作", en: "Actions", ja: "操作" },
  "查看": { "zh-TW": "查看", en: "View", ja: "表示" },
  "股票": { "zh-TW": "股票", en: "Stock", ja: "銘柄" },
  "股票池与估值纪律": { "zh-TW": "股票池與估值紀律", en: "Watchlist and valuation discipline", ja: "銘柄プールと評価規律" },
  "只": { "zh-TW": "檔", en: " stocks", ja: "銘柄" },
  "条": { "zh-TW": "條", en: " records", ja: "件" },
  "个": { "zh-TW": "個", en: " items", ja: "件" },
  "周": { "zh-TW": "週", en: " weeks", ja: "週" },
  "天": { "zh-TW": "天", en: " days", ja: "日" },
  "元": { "zh-TW": "元", en: " CNY", ja: "元" },
  "亿": { "zh-TW": "億", en: "00M", ja: "億" },
  "万": { "zh-TW": "萬", en: "0K", ja: "万" },
  "尚未同步": { "zh-TW": "尚未同步", en: "Not synced yet", ja: "未同期" },
  "股票池列表": { "zh-TW": "股票池列表", en: "Watchlist Table", ja: "銘柄プール一覧" },
  "状态": { "zh-TW": "狀態", en: "Status", ja: "状態" },
  "收盘价": { "zh-TW": "收盤價", en: "Close Price", ja: "終値" },
  "编辑": { "zh-TW": "編輯", en: "Edit", ja: "編集" },
  "搜索添加 A 股，维护估值区间、备注和估值依据。每次估值调整都会留下不可修改的流水。": { "zh-TW": "搜尋添加 A 股，維護估值區間、備註和估值依據。每次估值調整都會留下不可修改的流水。", en: "Search and add A-shares, maintain valuation ranges, notes, and valuation basis. Every valuation change leaves an immutable audit trail.", ja: "A株を検索して追加し、評価レンジ、メモ、評価根拠を管理します。評価調整は変更不可の履歴として残ります。" },
  "关注企业价值，而不是只关注K线波动。": { "zh-TW": "關注企業價值，而不是只關注K線波動。", en: "Focus on business value, not only candlestick swings.", ja: "ローソク足だけでなく企業価値に注目します。" },
  "用合理价值、低估区、合理区、高估区管理买卖纪律。": { "zh-TW": "用合理價值、低估區、合理區、高估區管理買賣紀律。", en: "Use fair value, undervalued, fair, and overvalued zones to manage discipline.", ja: "適正価値、割安・適正・割高ゾーンで売買規律を管理します。" },
  "把估值依据、调整流水和价格日期记录下来，避免事后凭感觉改判断。": { "zh-TW": "把估值依據、調整流水和價格日期記錄下來，避免事後憑感覺改判斷。", en: "Record valuation basis, adjustment history, and price date to avoid rewriting judgment afterward.", ja: "評価根拠、調整履歴、価格日を記録し、後から感覚で判断を書き換えないようにします。" },
  "承认估值一定有误差，所以要依赖区间和安全边际，而不是单点价格。": { "zh-TW": "承認估值一定有誤差，所以要依賴區間和安全邊際，而不是單點價格。", en: "Accept valuation error and rely on ranges and margin of safety rather than one point price.", ja: "評価には誤差があるため、一点価格ではなくレンジと安全域に依拠します。" },
  "帮助你把注意力从每天涨跌，转移到企业质量、估值和风险收益比。": { "zh-TW": "幫助你把注意力從每天漲跌，轉移到企業品質、估值和風險收益比。", en: "Shift attention from daily moves to business quality, valuation, and risk-reward.", ja: "日々の値動きから企業品質、評価、リスクリワードへ意識を移します。" },
  "在市场恐慌时，用估值区间判断是否进入可观察区域。": { "zh-TW": "在市場恐慌時，用估值區間判斷是否進入可觀察區域。", en: "In panics, use valuation ranges to judge whether a stock enters an observable zone.", ja: "市場が恐慌状態の時、評価レンジで観察可能ゾーンに入ったかを判断します。" },
  "在市场亢奋时，用高估区提醒自己不要把好公司买成坏价格。": { "zh-TW": "在市場亢奮時，用高估區提醒自己不要把好公司買成壞價格。", en: "In euphoria, use the overvalued zone to avoid buying a good company at a bad price.", ja: "市場が過熱する時、割高ゾーンで良い会社を悪い価格で買わないよう注意します。" },
  "通过记录估值变化，复盘自己是因为基本面变化调整，还是被价格情绪带着走。": { "zh-TW": "透過記錄估值變化，復盤自己是因為基本面變化調整，還是被價格情緒帶著走。", en: "Review valuation changes to distinguish fundamental updates from price-driven emotion.", ja: "評価変更を記録し、ファンダメンタル変化による調整か価格感情に流されたかを振り返ります。" },
  "先建立股票池，只跟踪自己愿意长期理解的公司。": { "zh-TW": "先建立股票池，只跟蹤自己願意長期理解的公司。", en: "Build a watchlist first and track only companies you are willing to understand long term.", ja: "まず銘柄プールを作り、長期的に理解したい会社だけを追跡します。" },
  "每只股票写清楚估值依据，例如利润假设、增长率、折现率、合理PE或股息假设。": { "zh-TW": "每檔股票寫清楚估值依據，例如利潤假設、成長率、折現率、合理PE或股息假設。", en: "Write the valuation basis for each stock, such as profit assumptions, growth, discount rate, fair PE, or dividends.", ja: "各銘柄に利益仮定、成長率、割引率、適正PER、配当仮定などの評価根拠を明記します。" },
  "根据估值结果设置低估、合理、高估区间，而不是每天临时判断。": { "zh-TW": "根據估值結果設定低估、合理、高估區間，而不是每天臨時判斷。", en: "Set undervalued, fair, and overvalued ranges from valuation results instead of judging ad hoc every day.", ja: "評価結果に基づいて割安・適正・割高レンジを設定し、毎日場当たり的に判断しません。" },
  "收盘后同步价格，观察当前价格相对估值区间的偏离幅度。": { "zh-TW": "收盤後同步價格，觀察當前價格相對估值區間的偏離幅度。", en: "Sync prices after close and observe deviation from the valuation range.", ja: "引け後に価格を同期し、評価レンジからの乖離を確認します。" },
  "当财报、行业景气度或竞争格局变化时，更新估值并保留调整流水。": { "zh-TW": "當財報、行業景氣度或競爭格局變化時，更新估值並保留調整流水。", en: "When reports, industry cycle, or competition changes, update valuation and keep the adjustment history.", ja: "財報、業界景況、競争環境が変わった時は評価を更新し、調整履歴を残します。" },
  "读财报：理解收入、利润、现金流、资产负债表和资本开支。": { "zh-TW": "讀財報：理解收入、利潤、現金流、資產負債表和資本開支。", en: "Read reports: understand revenue, profit, cash flow, balance sheet, and capex.", ja: "財報を読む: 売上、利益、CF、貸借対照表、設備投資を理解します。" },
  "看行业：判断行业空间、周期位置、竞争格局和政策变量。": { "zh-TW": "看行業：判斷行業空間、週期位置、競爭格局和政策變量。", en: "Study the industry: market size, cycle position, competition, and policy variables.", ja: "業界を見る: 市場余地、サイクル位置、競争環境、政策変数を判断します。" },
  "做估值：知道不同估值方法适合什么企业，并能保守设置关键假设。": { "zh-TW": "做估值：知道不同估值方法適合什麼企業，並能保守設定關鍵假設。", en: "Build valuation: know which methods fit which businesses and set key assumptions conservatively.", ja: "評価する: 手法ごとの適用企業を理解し、主要前提を保守的に設定します。" },
  "控风险：识别估值陷阱、基本面恶化、流动性风险和过度集中持仓。": { "zh-TW": "控風險：識別估值陷阱、基本面惡化、流動性風險和過度集中持倉。", en: "Control risk: identify value traps, deteriorating fundamentals, liquidity risk, and concentration.", ja: "リスク管理: 評価の罠、ファンダ悪化、流動性リスク、集中投資を識別します。" },
  "做复盘：记录每次估值变化和判断理由，让决策逐步变得可解释、可改进。": { "zh-TW": "做復盤：記錄每次估值變化和判斷理由，讓決策逐步變得可解釋、可改進。", en: "Review: record every valuation change and reason so decisions become explainable and improvable.", ja: "振り返る: 評価変更と理由を記録し、判断を説明可能で改善可能にします。" },
  "为什么觉得这只票值得验证？当时看到的信号是什么？": { "zh-TW": "為什麼覺得這檔股票值得驗證？當時看到的訊號是什麼？", en: "Why is this stock worth testing? What signal did you see?", ja: "なぜこの銘柄を検証する価値があると思いましたか？当時見たシグナルは？" },
  "创建后会按真实日线持续更新每天状态、当前收益、最高浮盈和最大回撤。": { "zh-TW": "建立後會按真實日線持續更新每天狀態、當前收益、最高浮盈和最大回撤。", en: "After creation, real daily data updates status, current return, max gain, and max drawdown.", ja: "作成後、実際の日足で日次状態、現在リターン、最大含み益、最大ドローダウンを更新します。" },
  "已锁定的买入假设": { "zh-TW": "已鎖定的買入假設", en: "Locked buying hypotheses", ja: "固定された買い仮説" },
  "尚未达到观察周期": { "zh-TW": "尚未達到觀察週期", en: "Observation period not reached", ja: "観察期間未到達" },
  "只统计已完成记录": { "zh-TW": "只統計已完成紀錄", en: "Completed records only", ja: "完了記録のみ集計" },
  "假定买入": { "zh-TW": "假定買入", en: "Paper Buy", ja: "仮想買い" },
  "信号日收盘价": { "zh-TW": "訊號日收盤價", en: "Signal-day close", ja: "シグナル日終値" },
  "次日开盘价": { "zh-TW": "次日開盤價", en: "Next-day open", ja: "翌日始値" },
  "次日收盘价": { "zh-TW": "次日收盤價", en: "Next-day close", ja: "翌日終値" },
  "暂时承压": { "zh-TW": "暫時承壓", en: "Temporarily pressured", ja: "一時的に弱含み" },
  "小幅回撤": { "zh-TW": "小幅回撤", en: "Slight drawdown", ja: "小幅下落" },
  "估值先从财报原始字段开始，再推导自由现金流、EPS、增长率、净债务等关键指标，最后进入模型假设。数字可以自动推导，也可以人工修正。": { "zh-TW": "估值先從財報原始欄位開始，再推導自由現金流、EPS、成長率、淨債務等關鍵指標，最後進入模型假設。數字可以自動推導，也可以人工修正。", en: "Valuation starts from raw financial fields, derives FCF, EPS, growth, net debt, and other key metrics, then enters model assumptions. Numbers can be auto-derived or manually adjusted.", ja: "評価は財務原始項目から始まり、FCF、EPS、成長率、純負債などを推定し、最後にモデル前提へ進みます。数値は自動推定も手動修正も可能です。" },
  "推导财报指标": { "zh-TW": "推導財報指標", en: "Derive Financial Metrics", ja: "財務指標を推定" },
  "第一步：选择股票": { "zh-TW": "第一步：選擇股票", en: "Step 1: Select Stock", ja: "ステップ1: 銘柄選択" },
  "只输入股票名称；从联想结果选择后会自动带出股票代码。": { "zh-TW": "只輸入股票名稱；從聯想結果選擇後會自動帶出股票代碼。", en: "Enter only the stock name; selecting a suggestion fills the code automatically.", ja: "銘柄名だけを入力し、候補から選ぶとコードが自動入力されます。" },
  "输入后从联想结果中选择股票，代码会自动带入。": { "zh-TW": "輸入後從聯想結果中選擇股票，代碼會自動帶入。", en: "Choose a stock from suggestions; the code will be filled automatically.", ja: "候補から銘柄を選ぶとコードが自動入力されます。" },
  "第二步：选择估值方法": { "zh-TW": "第二步：選擇估值方法", en: "Step 2: Choose Valuation Methods", ja: "ステップ2: 評価方法選択" },
  "勾选后才显示对应填写模块。": { "zh-TW": "勾選後才顯示對應填寫模組。", en: "The corresponding input module appears only after selection.", ja: "選択後に対応する入力モジュールが表示されます。" },
  "第三步：填写估值数据": { "zh-TW": "第三步：填寫估值資料", en: "Step 3: Fill Valuation Data", ja: "ステップ3: 評価データ入力" },
  "先选择估值方法，系统会只展示该方法真正需要的财报字段。": { "zh-TW": "先選擇估值方法，系統會只展示該方法真正需要的財報欄位。", en: "Choose methods first; only the financial fields needed by those methods will be shown.", ja: "先に評価方法を選ぶと、その方法に必要な財務項目だけが表示されます。" },
  "选择估值方法后，这里会出现对应模型假设。": { "zh-TW": "選擇估值方法後，這裡會出現對應模型假設。", en: "Model assumptions appear here after you select valuation methods.", ja: "評価方法を選ぶと、対応するモデル前提がここに表示されます。" },
  "请选择 DCF、DDM、PE、PEG 或 EV/EBITDA 中至少一种方法。": { "zh-TW": "請至少選擇 DCF、DDM、PE、PEG 或 EV/EBITDA 中一種方法。", en: "Select at least one of DCF, DDM, PE, PEG, or EV/EBITDA.", ja: "DCF、DDM、PE、PEG、EV/EBITDAのうち少なくとも1つを選択してください。" },
  "记录关键假设、可比公司、风险点或调参原因": { "zh-TW": "記錄關鍵假設、可比公司、風險點或調參原因", en: "Record key assumptions, peers, risks, or parameter changes", ja: "主要前提、類似企業、リスク、調整理由を記録" },
  "低估线/高估线使用系统默认上下 20% 区间，保存后会自动用于新增股票时的股票池估值。": { "zh-TW": "低估線/高估線使用系統預設上下 20% 區間，保存後會自動用於新增股票時的股票池估值。", en: "Low/high lines use the default ±20% band and will be used automatically when adding this stock to the watchlist.", ja: "割安/割高ラインは既定の±20%レンジを使い、保存後は銘柄追加時の評価に自動利用されます。" },
  "合理价值下浮 20%": { "zh-TW": "合理價值下浮 20%", en: "Fair value -20%", ja: "適正価値 -20%" },
  "合理价值上浮 20%": { "zh-TW": "合理價值上浮 20%", en: "Fair value +20%", ja: "適正価値 +20%" },
  "输入股票名称或代码，例如 牧原股份 / 002714": { "zh-TW": "輸入股票名稱或代碼，例如 牧原股份 / 002714", en: "Enter stock name or code, e.g. Muyuan Foods / 002714", ja: "銘柄名またはコードを入力、例: 牧原股份 / 002714" },
  "回到仪表盘": { "zh-TW": "回到儀表板", en: "Back to Dashboard", ja: "ダッシュボードへ戻る" },
  "主导航": { "zh-TW": "主導覽", en: "Main Navigation", ja: "メインナビゲーション" },
  "全局搜索": { "zh-TW": "全域搜尋", en: "Global Search", ja: "グローバル検索" },
  "Entry后每日Status": { "zh-TW": "Entry 後每日狀態", en: "Daily Status after Entry", ja: "エントリー後の日次状態" },
  "股票池快速切换": { "zh-TW": "股票池快速切換", en: "Watchlist Quick Switch", ja: "銘柄プールのクイック切替" },
  "Watchlist快速切换": { "zh-TW": "Watchlist 快速切換", en: "Watchlist Quick Switch", ja: "ウォッチリストのクイック切替" },
  "资金强弱矩阵说明": { "zh-TW": "資金強弱矩陣說明", en: "Capital Strength Matrix Guide", ja: "資金強弱マトリクス説明" },
  "Capital Strength Matrix说明": { "zh-TW": "Capital Strength Matrix 說明", en: "Capital Strength Matrix Guide", ja: "Capital Strength Matrix 説明" },
  "把企业未来能产生的自由现金流折现回今天，强调企业本身能赚到的现金。": { "zh-TW": "把企業未來能產生的自由現金流折現回今天，強調企業本身能賺到的現金。", en: "Discounts future free cash flow back to today and focuses on the cash the business itself can generate.", ja: "将来のフリーキャッシュフローを現在価値に割り引き、企業自身が生み出す現金に注目します。" },
  "适合现金流稳定、资本开支可预测、经营生命周期较长的企业。": { "zh-TW": "適合現金流穩定、資本開支可預測、經營生命週期較長的企業。", en: "Best for companies with stable cash flow, predictable capex, and long operating lives.", ja: "安定したCF、予測可能な設備投資、長い事業寿命を持つ企業に適します。" },
  "每股价值 = (未来自由现金流现值 + 终值现值 - 净债务) / 总股本": { "zh-TW": "每股價值 = (未來自由現金流現值 + 終值現值 - 淨債務) / 總股本", en: "Value per share = (PV of future FCF + PV of terminal value - net debt) / total shares", ja: "1株価値 = (将来FCF現在価値 + ターミナル価値現在価値 - 純負債) / 総株式数" },
  "把未来股息折现成今天的价值，适合把分红视作主要回报来源的公司。": { "zh-TW": "把未來股息折現成今天的價值，適合把分紅視作主要回報來源的公司。", en: "Discounts future dividends into present value, fitting companies where dividends are the main return source.", ja: "将来配当を現在価値に割り引き、配当を主要リターンとする企業に適します。" },
  "适合高分红、分红政策稳定的银行、公用事业、成熟消费类企业。": { "zh-TW": "適合高分紅、分紅政策穩定的銀行、公用事業、成熟消費類企業。", en: "Best for banks, utilities, and mature consumer companies with high and stable dividends.", ja: "高配当で配当方針が安定した銀行、公益、成熟消費企業に適します。" },
  "每股价值 = 下一年每股股利 / (股权成本 - 股利增长率)": { "zh-TW": "每股價值 = 下一年每股股利 / (股權成本 - 股利成長率)", en: "Value per share = next-year DPS / (cost of equity - dividend growth)", ja: "1株価値 = 来期DPS / (株主資本コスト - 配当成長率)" },
  "用市场愿意给这类利润的倍数估算价值，简单直观但依赖可比倍数质量。": { "zh-TW": "用市場願意給這類利潤的倍數估算價值，簡單直觀但依賴可比倍數品質。", en: "Estimates value from the earnings multiple the market pays for similar profits; simple, but peer quality matters.", ja: "類似利益に市場が付ける倍率で価値を見積もる手法です。直感的ですが比較倍率の質に依存します。" },
  "适合盈利稳定、行业可比公司较多、商业模式成熟的企业。": { "zh-TW": "適合盈利穩定、行業可比公司較多、商業模式成熟的企業。", en: "Best for mature businesses with stable earnings and enough comparable companies.", ja: "収益が安定し、比較企業が多く、事業モデルが成熟した企業に適します。" },
  "每股价值 = 每股收益 EPS × 目标 PE": { "zh-TW": "每股價值 = 每股收益 EPS × 目標 PE", en: "Value per share = EPS × target PE", ja: "1株価値 = EPS × 目標PER" },
  "把 PE 与增长速度放在一起看，避免只看高增长而忽略估值过贵。": { "zh-TW": "把 PE 與成長速度放在一起看，避免只看高成長而忽略估值過貴。", en: "Looks at PE together with growth so high growth does not hide expensive valuation.", ja: "PERと成長率を一緒に見て、高成長だけで割高を見落とさないようにします。" },
  "适合成长股，尤其是盈利增速仍较高但需要约束估值泡沫的公司。": { "zh-TW": "適合成長股，尤其是盈利增速仍較高但需要約束估值泡沫的公司。", en: "Best for growth stocks with strong earnings growth where valuation discipline is still needed.", ja: "高い利益成長が続く一方で、評価バブルを抑える必要がある成長株に適します。" },
  "每股价值 = EPS × 目标 PEG × 未来盈利增速百分数": { "zh-TW": "每股價值 = EPS × 目標 PEG × 未來盈利增速百分數", en: "Value per share = EPS × target PEG × future earnings growth percentage", ja: "1株価値 = EPS × 目標PEG × 将来利益成長率" },
  "从企业整体价值出发，再扣除债务分配给股东，便于比较杠杆不同的公司。": { "zh-TW": "從企業整體價值出發，再扣除債務分配給股東，便於比較槓桿不同的公司。", en: "Starts from enterprise value, subtracts debt, and compares companies with different leverage.", ja: "企業価値から出発し、負債を差し引いて株主価値を見ます。レバレッジの異なる企業比較に便利です。" },
  "适合重资产、跨资本结构比较、折旧摊销差异较大的企业。": { "zh-TW": "適合重資產、跨資本結構比較、折舊攤銷差異較大的企業。", en: "Best for asset-heavy companies, capital-structure comparisons, and firms with different D&A profiles.", ja: "重資産企業、資本構成比較、減価償却差が大きい企業に適します。" },
  "每股价值 = (EBITDA × 目标倍数 - 净债务) / 总股本": { "zh-TW": "每股價值 = (EBITDA × 目標倍數 - 淨債務) / 總股本", en: "Value per share = (EBITDA × target multiple - net debt) / total shares", ja: "1株価値 = (EBITDA × 目標倍率 - 純負債) / 総株式数" },
  "所选有效模型的平均值": { "zh-TW": "所選有效模型的平均值", en: "Average of selected valid models", ja: "選択した有効モデルの平均値" },
  "填写财报字段和模型假设后点击“重新计算”。": { "zh-TW": "填寫財報欄位和模型假設後點擊「重新計算」。", en: "Fill financial fields and model assumptions, then click Recalculate.", ja: "財務項目とモデル前提を入力し、「再計算」をクリックしてください。" },
  "中短期资金共振流入": { "zh-TW": "中短期資金共振流入", en: "Mid- and short-term inflow alignment", ja: "中短期資金の共振流入" },
  "短周期明显转强": { "zh-TW": "短週期明顯轉強", en: "Short-term flow strengthened", ja: "短期資金が明確に強化" },
  "中长期仍强但短期转弱": { "zh-TW": "中長期仍強但短期轉弱", en: "Longer-term strong, short-term weakening", ja: "中長期は強いが短期は弱化" },
  "评分口径与标签说明": { "zh-TW": "評分口徑與標籤說明", en: "Scoring and Label Guide", ja: "スコアとラベル説明" },
  "状态与趋势说明": { "zh-TW": "狀態與趨勢說明", en: "Status and Trend Guide", ja: "状態とトレンド説明" },
  "综合评分公式": { "zh-TW": "綜合評分公式", en: "Overall Score Formula", ja: "総合スコア式" },
  "综合分 = 资金强度 35% + 持续性 35% + 扩散度 20% + 价格确认 10%；需要细看时再展开。": { "zh-TW": "綜合分 = 資金強度 35% + 持續性 35% + 擴散度 20% + 價格確認 10%；需要細看時再展開。", en: "Overall = capital strength 35% + persistence 35% + diffusion 20% + price confirmation 10%. Expand only when you need details.", ja: "総合 = 資金強度35% + 持続性35% + 拡散度20% + 価格確認10%。詳細が必要な時だけ展開します。" },
  "综合评分 = 资金强度 × 35% + 持续性 × 35% + 扩散度 × 20% + 价格确认 × 10%。所有单项分都归一到 0-100 分，同级板块之间横向比较，分数越高表示相对越强。": { "zh-TW": "綜合評分 = 資金強度 × 35% + 持續性 × 35% + 擴散度 × 20% + 價格確認 × 10%。所有單項分都歸一到 0-100 分，同級板塊之間橫向比較，分數越高表示相對越強。", en: "Overall score = capital strength × 35% + persistence × 35% + diffusion × 20% + price confirmation × 10%. Each category is normalized to 0-100 within the same sector level; higher means relatively stronger.", ja: "総合スコア = 資金強度×35% + 持続性×35% + 拡散度×20% + 価格確認×10%。各項目は同階層セクター内で0-100に正規化し、高いほど相対的に強いことを示します。" },
  "底层资金数据来自板块成分股资金流聚合：每日把成分股 net_mf_amount 加总为板块净流入，同时统计绝对资金流、净流入股票数、覆盖股票数等字段。": { "zh-TW": "底層資金資料來自板塊成分股資金流聚合：每日把成分股 net_mf_amount 加總為板塊淨流入，同時統計絕對資金流、淨流入股票數、覆蓋股票數等欄位。", en: "Underlying flow data aggregates constituent stock flows: each day sums constituent net_mf_amount into sector net inflow, while also tracking absolute flow, positive-inflow stock count, and coverage.", ja: "基礎資金データは構成銘柄資金フローの集計です。日次で構成銘柄の net_mf_amount をセクター純流入に合算し、絶対資金流、純流入銘柄数、カバレッジも集計します。" },
  "用于列表里的“综合”列，是对资金强度、持续性、扩散度、价格确认的加权结果。": { "zh-TW": "用於列表裡的「綜合」欄，是對資金強度、持續性、擴散度、價格確認的加權結果。", en: "Used by the table's Overall column; it is the weighted result of capital strength, persistence, diffusion, and price confirmation.", ja: "表の「総合」列に使われ、資金強度・持続性・拡散度・価格確認の加重結果です。" },
  "先计算 15 / 30 / 60 / 90 天累计净流入和资金强度，再做同级板块横向排名。": { "zh-TW": "先計算 15 / 30 / 60 / 90 天累計淨流入和資金強度，再做同級板塊橫向排名。", en: "First calculate 15/30/60/90-day cumulative net inflow and flow strength, then rank within the same sector level.", ja: "15/30/60/90日の累計純流入と資金強度を計算し、同階層セクター内で横比較します。" },
  "单窗口资金分 = 净流入排名分 55% + 强度排名分 45%；四个窗口按 15天:30天:60天:90天 = 1:2:2:1 加权。强度 = 净流入 / 绝对资金流总额，用来识别资金方向是否足够集中。": { "zh-TW": "單窗口資金分 = 淨流入排名分 55% + 強度排名分 45%；四個窗口按 15天:30天:60天:90天 = 1:2:2:1 加權。強度 = 淨流入 / 絕對資金流總額，用來識別資金方向是否足夠集中。", en: "Single-window flow score = net-inflow rank 55% + strength rank 45%. The four windows are weighted 15D:30D:60D:90D = 1:2:2:1. Strength = net inflow / absolute total flow, showing whether flow direction is concentrated.", ja: "単一ウィンドウ資金点 = 純流入順位55% + 強度順位45%。4期間は15日:30日:60日:90日 = 1:2:2:1で加重。強度 = 純流入 / 絶対資金流総額で、資金方向の集中度を見ます。" },
  "看 15 / 30 / 60 天流入天数占比，以及近 30 天最长连续净流入天数。": { "zh-TW": "看 15 / 30 / 60 天流入天數占比，以及近 30 天最長連續淨流入天數。", en: "Uses the share of inflow days over 15/30/60 days plus the longest net-inflow streak in the last 30 days.", ja: "15/30/60日の流入日比率と直近30日の最長連続純流入日数を見ます。" },
  "加权口径为 15天流入占比 1、30天流入占比 2、60天流入占比 1.5、最长连续流入折算分 1。它更重视资金是否连续推进，而不是单日大额流入。": { "zh-TW": "加權口徑為 15天流入占比 1、30天流入占比 2、60天流入占比 1.5、最長連續流入折算分 1。它更重視資金是否連續推進，而不是單日大額流入。", en: "Weights: 15D inflow-day share 1, 30D share 2, 60D share 1.5, longest inflow streak score 1. It values continuity over one-day large inflows.", ja: "重みは15日流入比率1、30日2、60日1.5、最長連続流入換算点1。単日の大口流入より資金の継続性を重視します。" },
  "看板块内成分股净流入的覆盖比例，按 15 / 30 / 60 天观察。": { "zh-TW": "看板塊內成分股淨流入的覆蓋比例，按 15 / 30 / 60 天觀察。", en: "Measures how broadly positive inflow covers constituents over 15/30/60 days.", ja: "15/30/60日で構成銘柄への純流入カバレッジを見ます。" },
  "扩散度 = 成分股净流入观察次数 / 成分股资金观察总次数；15天、30天、60天权重为 1:2:1。扩散度高说明不是少数权重股单独拉动，而是板块内部更多股票得到资金确认。": { "zh-TW": "擴散度 = 成分股淨流入觀察次數 / 成分股資金觀察總次數；15天、30天、60天權重為 1:2:1。擴散度高說明不是少數權重股單獨拉動，而是板塊內部更多股票得到資金確認。", en: "Diffusion = positive constituent-flow observations / total constituent-flow observations. 15D/30D/60D weights are 1:2:1. High diffusion means more constituents confirm the flow, not just a few heavyweights.", ja: "拡散度 = 構成銘柄の純流入観察回数 / 構成銘柄の資金観察総数。15日/30日/60日は1:2:1で加重。高拡散は少数大型株だけでなく、より多くの銘柄に資金確認があることを示します。" },
  "看近 30 个交易日板块内成分股平均涨幅，并在同级板块中做百分位排名。": { "zh-TW": "看近 30 個交易日板塊內成分股平均漲幅，並在同級板塊中做百分位排名。", en: "Uses the average constituent return over the last 30 trading days and percentile-ranks it within the same sector level.", ja: "直近30取引日の構成銘柄平均騰落率を見て、同階層セクター内で百分位順位化します。" },
  "资金流入如果没有价格响应，可能只是承接或低效流入；价格确认权重较低，只作为验证项，不让涨幅本身盖过资金和持续性。": { "zh-TW": "資金流入如果沒有價格響應，可能只是承接或低效流入；價格確認權重較低，只作為驗證項，不讓漲幅本身蓋過資金和持續性。", en: "If inflow has no price response, it may be passive absorption or inefficient flow. Price confirmation is lightly weighted as a check, so return does not overpower flow and persistence.", ja: "資金流入に価格反応がない場合、受け皿や非効率流入の可能性があります。価格確認は検証項目として低めに重み付けし、騰落率が資金と持続性を覆い隠さないようにします。" },
  "矩阵读法": { "zh-TW": "矩陣讀法", en: "How to Read the Matrix", ja: "マトリクスの読み方" },
  "解释表格右侧每个资金窗口怎么看，以及为什么分段趋势更适合判断主线节奏。": { "zh-TW": "解釋表格右側每個資金窗口怎麼看，以及為什麼分段趨勢更適合判斷主線節奏。", en: "Explains how to read each flow window and why segment trends are better for judging theme rhythm.", ja: "各資金ウィンドウの読み方と、分段トレンドが主線リズム判断に適する理由を説明します。" },
  "分段趋势视角": { "zh-TW": "分段趨勢視角", en: "Segment Trend View", ja: "分段トレンド視点" },
  "累计资金视角": { "zh-TW": "累計資金視角", en: "Cumulative Flow View", ja: "累計資金視点" },
  "矩阵单元格": { "zh-TW": "矩陣單元格", en: "Matrix Cell", ja: "マトリクスセル" },
  "今日、昨日、第3日、第4-5日、第6-7日、第8-15日等列互不重叠。": { "zh-TW": "今日、昨日、第3日、第4-5日、第6-7日、第8-15日等欄互不重疊。", en: "Today, yesterday, day 3, days 4-5, days 6-7, and days 8-15 do not overlap.", ja: "今日、昨日、3日目、4-5日目、6-7日目、8-15日目などの列は互いに重複しません。" },
  "适合观察资金节奏是否从远端持续推进到近端，也能看出突然放大、短线降温或回流修复。": { "zh-TW": "適合觀察資金節奏是否從遠端持續推進到近端，也能看出突然放大、短線降溫或回流修復。", en: "Good for seeing whether flow moves from older windows into recent windows, and for spotting surges, cooling, or recovery.", ja: "遠い期間から近い期間へ資金が継続的に進んでいるか、急増・短期冷却・回帰修復を観察できます。" },
  "1 / 2 / 3 / 5 / 7 / 15 / 30 / 60 / 90 / 120 / 150 / 180 天为向前累计求和。": { "zh-TW": "1 / 2 / 3 / 5 / 7 / 15 / 30 / 60 / 90 / 120 / 150 / 180 天為向前累計求和。", en: "1/2/3/5/7/15/30/60/90/120/150/180-day columns are rolling cumulative sums.", ja: "1/2/3/5/7/15/30/60/90/120/150/180日は過去方向への累計合計です。" },
  "适合看某个板块在固定窗口内累计吸金能力，但长窗口会包含短窗口，所以趋势判断更建议优先看分段趋势。": { "zh-TW": "適合看某個板塊在固定窗口內累計吸金能力，但長窗口會包含短窗口，所以趨勢判斷更建議優先看分段趨勢。", en: "Good for cumulative attraction within a window, but long windows include short ones, so segment trends are preferred for trend judgment.", ja: "固定期間内の累計吸金力を見るのに適しますが、長期ウィンドウは短期を含むため、トレンド判断は分段トレンドを優先します。" },
  "每格显示该窗口净流入、正流入天数、资金排名。": { "zh-TW": "每格顯示該窗口淨流入、正流入天數、資金排名。", en: "Each cell shows net inflow, positive-inflow days, and flow rank for that window.", ja: "各セルはそのウィンドウの純流入、正流入日数、資金順位を表示します。" },
  "最近 3 日资金均值相对前段波动基准放大，适合用来捕捉刚开始被资金关注的细分方向。": { "zh-TW": "最近 3 日資金均值相對前段波動基準放大，適合用來捕捉剛開始被資金關注的細分方向。", en: "The recent 3-day average flow has expanded versus the prior baseline, useful for catching newly noticed niche sectors.", ja: "直近3日の平均資金が前段の基準より拡大しており、資金が注目し始めた細分方向の検出に使えます。" },
  "申万一级行业": { "zh-TW": "申萬一級行業", en: "SW Level 1 Sector", ja: "申万レベル1業種" },
  "申万二级行业": { "zh-TW": "申萬二級行業", en: "SW Level 2 Sector", ja: "申万レベル2業種" },
  "申万三级行业": { "zh-TW": "申萬三級行業", en: "SW Level 3 Sector", ja: "申万レベル3業種" },
  "行业资金趋势": { "zh-TW": "行業資金趨勢", en: "Sector Flow Trend", ja: "業種資金トレンド" },
  "点击行可进入板块内个股趋势。": { "zh-TW": "點擊行可進入板塊內個股趨勢。", en: "Click a row to view constituent stock trends.", ja: "行をクリックすると構成銘柄トレンドを表示できます。" },
  "当前为申万三级行业，点击行可进入板块内个股趋势。": { "zh-TW": "目前為申萬三級行業，點擊行可進入板塊內個股趨勢。", en: "Currently using SW Level 3 sectors. Click a row to view constituent stock trends.", ja: "現在は申万レベル3業種です。行をクリックすると構成銘柄トレンドを表示できます。" },
  "统计周期内板块成分股 net_mf_amount 合计，单位按万元换算展示。": { "zh-TW": "統計週期內板塊成分股 net_mf_amount 合計，單位按萬元換算展示。", en: "Sum of constituent net_mf_amount during the period, displayed after converting from ten-thousand yuan units.", ja: "期間内の構成銘柄 net_mf_amount 合計を、万元単位から換算して表示します。" },
  "按天累计的个股净流入/净流出次数，不是去重股票数；周、月、区间会大于覆盖股票数。": { "zh-TW": "按天累計的個股淨流入/淨流出次數，不是去重股票數；週、月、區間會大於覆蓋股票數。", en: "Counts daily positive/negative stock-flow observations, not unique stocks; weekly/monthly/range counts can exceed coverage.", ja: "日次の個別株純流入/純流出回数であり、重複排除銘柄数ではありません。週/月/区間ではカバレッジ数を超えることがあります。" },
  "这个板块当前能匹配到资金流数据的成分股数量。": { "zh-TW": "這個板塊目前能匹配到資金流資料的成分股數量。", en: "Number of constituents in this sector with matched flow data.", ja: "このセクターで資金フローデータに一致した構成銘柄数です。" },
  "统计周期内单日净流入最高和单日净流出最低的成分股。": { "zh-TW": "統計週期內單日淨流入最高和單日淨流出最低的成分股。", en: "Constituents with the highest single-day inflow and lowest single-day outflow during the period.", ja: "期間内で単日純流入が最大、単日純流出が最小の構成銘柄です。" },
  "趋势：": { "zh-TW": "趨勢：", en: "Trend: ", ja: "トレンド: " },
  "移出": { "zh-TW": "移出", en: "Remove", ja: "削除" },
  "查看详情": { "zh-TW": "查看詳情", en: "View Details", ja: "詳細を見る" },
  "详情": { "zh-TW": "詳情", en: "Details", ja: "詳細" },
  "历史回看": { "zh-TW": "歷史回看", en: "Lookback", ja: "過去確認" },
  "三周放量上涨 + 两天缩量企稳": { "zh-TW": "三週放量上漲 + 兩天縮量企穩", en: "3 rising high-turnover weeks + 2 stabilizing low-turnover days", ja: "3週高回転上昇 + 2日低回転安定" },
  "数据读取正常": { "zh-TW": "資料讀取正常", en: "Data loaded normally", ja: "データ読込正常" },
  "周换手率按日换手率求和，20 周线按周收盘均线计算": { "zh-TW": "週換手率按日換手率求和，20 週線按週收盤均線計算", en: "Weekly turnover is summed from daily turnover; the 20-week line is calculated from weekly closes.", ja: "週回転率は日次回転率の合計、20週線は週終値平均で計算します。" },
  "连续 3 周换手率 > 15%": { "zh-TW": "連續 3 週換手率 > 15%", en: "3 consecutive weeks with turnover > 15%", ja: "3週連続で回転率 > 15%" },
  "3 周股价总涨幅 > 20%": { "zh-TW": "3 週股價總漲幅 > 20%", en: "3-week total price gain > 20%", ja: "3週合計株価上昇 > 20%" },
  "第 4-11 周出现连续 2 天换手率 < 10%": { "zh-TW": "第 4-11 週出現連續 2 天換手率 < 10%", en: "During weeks 4-11, two consecutive days with turnover < 10%", ja: "4-11週目に2日連続で回転率 < 10%" },
  "信号日收盘价不低于 20 周线下方 2%": { "zh-TW": "信號日收盤價不低於 20 週線下方 2%", en: "Signal-day close is not more than 2% below the 20-week line", ja: "シグナル日終値が20週線の2%下を下回らない" },
  "放量上涨": { "zh-TW": "放量上漲", en: "High-turnover Rise", ja: "高回転上昇" },
  "缩量信号": { "zh-TW": "縮量訊號", en: "Low-turnover Signal", ja: "低回転シグナル" },
  "20 周线位置": { "zh-TW": "20 週線位置", en: "20-week Line", ja: "20週線位置" },
  "最新价": { "zh-TW": "最新價", en: "Latest Price", ja: "最新価格" },
  "行业": { "zh-TW": "行業", en: "Industry", ja: "業種" },
  "周换手": { "zh-TW": "週換手", en: "Weekly turnover", ja: "週回転率" },
  "连续日": { "zh-TW": "連續日", en: "Consecutive days", ja: "連続日" },
  "输入股票名称、代码或行业": { "zh-TW": "輸入股票名稱、代碼或行業", en: "Enter stock name, code, or industry", ja: "銘柄名、コード、業種を入力" },
  "适合：": { "zh-TW": "適合：", en: "Best for: ", ja: "適用: " },
  "条件：": { "zh-TW": "條件：", en: "Rule: ", ja: "条件: " },
  "解读：": { "zh-TW": "解讀：", en: "Read: ", ja: "解釈: " },
  "展开": { "zh-TW": "展開", en: "Expand", ja: "展開" },
  "收起": { "zh-TW": "收起", en: "Collapse", ja: "閉じる" },
  "成长调整市盈率": { "zh-TW": "成長調整本益比", en: "Growth-adjusted PE", ja: "成長調整PER" },
  "暂无备注": { "zh-TW": "暫無備註", en: "No note", ja: "メモなし" },
  "暂无估值依据": { "zh-TW": "暫無估值依據", en: "No valuation basis", ja: "評価根拠なし" },
  "Gemini 公司信息分析": { "zh-TW": "Gemini 公司資訊分析", en: "Gemini Company Analysis", ja: "Gemini企業分析" },
  "最近更新": { "zh-TW": "最近更新", en: "Last updated", ja: "最終更新" },
  "输入板块名称、代码、状态或趋势": { "zh-TW": "輸入板塊名稱、代碼、狀態或趨勢", en: "Enter sector name, code, status, or trend", ja: "セクター名、コード、状態、トレンドを入力" },
  "当前视角": { "zh-TW": "當前視角", en: "Current View", ja: "現在の視点" },
  "当前列是互不重叠的分段窗口，便于看资金趋势节奏。": { "zh-TW": "目前欄位是互不重疊的分段窗口，便於看資金趨勢節奏。", en: "Current columns are non-overlapping segment windows, useful for reading flow rhythm.", ja: "現在の列は重複しない分段ウィンドウで、資金トレンドのリズムを見るのに役立ちます。" },
  "当前列是累计窗口，便于对照综合评分。": { "zh-TW": "目前欄位是累計窗口，便於對照綜合評分。", en: "Current columns are cumulative windows, useful for comparing with the overall score.", ja: "現在の列は累計ウィンドウで、総合スコアとの比較に役立ちます。" },
  "综合评分本身始终按累计窗口和价格确认计算；切换上方视角只改变矩阵列的展示方式，不改变评分结果。": { "zh-TW": "綜合評分本身始終按累計窗口和價格確認計算；切換上方視角只改變矩陣欄的展示方式，不改變評分結果。", en: "The overall score is always calculated from cumulative windows and price confirmation; changing the view only changes matrix columns, not the score.", ja: "総合スコアは常に累計ウィンドウと価格確認で計算されます。上部の視点切替は列表示だけを変え、スコアは変えません。" },
  "正流入天数是窗口内“板块每日净流入 > 0”的交易日数量，不是金额增长率。背景颜色深浅来自该窗口净流入的同级排名分；红色代表窗口净流入为正，绿色代表窗口净流出。排名越靠前，说明相对同级板块资金更强。": { "zh-TW": "正流入天數是窗口內「板塊每日淨流入 > 0」的交易日數量，不是金額成長率。背景顏色深淺來自該窗口淨流入的同級排名分；紅色代表窗口淨流入為正，綠色代表窗口淨流出。排名越靠前，說明相對同級板塊資金更強。", en: "Positive-inflow days count trading days where sector daily net inflow is above zero, not amount growth. Cell intensity comes from peer ranking of window net inflow; red means positive net inflow, green means net outflow. Higher rank means stronger relative sector flow.", ja: "正流入日数は、ウィンドウ内でセクター日次純流入が0を超えた取引日数であり、金額成長率ではありません。背景濃淡は同階層内の純流入順位に基づき、赤は純流入、緑は純流出を示します。順位が高いほど相対的に資金が強いことを意味します。" },
  "持续增强": { "zh-TW": "持續增強", en: "Sustained Strengthening", ja: "持続的強化" },
  "新资金启动": { "zh-TW": "新資金啟動", en: "New Flow Start", ja: "新資金始動" },
  "单日脉冲": { "zh-TW": "單日脈衝", en: "One-day Pulse", ja: "単日パルス" },
  "偏强延续": { "zh-TW": "偏強延續", en: "Strong Continuation", ja: "強め継続" },
  "短线降温": { "zh-TW": "短線降溫", en: "Short-term Cooling", ja: "短期冷却" },
  "资": { "zh-TW": "資", en: "Flow", ja: "資" },
  "续": { "zh-TW": "續", en: "Persist.", ja: "続" },
  "扩": { "zh-TW": "擴", en: "Diffuse", ja: "拡" },
  "价": { "zh-TW": "價", en: "Price", ja: "価" },
  "稳": { "zh-TW": "穩", en: "Stable", ja: "安定" },
  "已加入": { "zh-TW": "已加入", en: "Added", ja: "追加済み" },
  "加入": { "zh-TW": "加入", en: "Add", ja: "追加" },
  "趋势": { "zh-TW": "趨勢", en: "Trend", ja: "トレンド" },
  "兼具": { "zh-TW": "兼具", en: "Also", ja: "兼ねる" },
  "正在计算板块资金强弱矩阵，首次读取 180 个交易日可能需要一点时间...": { "zh-TW": "正在計算板塊資金強弱矩陣，首次讀取 180 個交易日可能需要一點時間...", en: "Calculating the sector strength matrix. The first 180-trading-day load may take a moment...", ja: "セクター資金強弱マトリクスを計算中です。初回の180取引日読み込みには少し時間がかかります..." },
  "全选": { "zh-TW": "全選", en: "Select All", ja: "全選択" },
  "清空": { "zh-TW": "清空", en: "Clear", ja: "クリア" },
  "只看资金前十": { "zh-TW": "只看資金前十", en: "Top 10 by Flow", ja: "資金上位10のみ" },
  "只看异动放大": { "zh-TW": "只看異動放大", en: "Surge Only", ja: "急増のみ" },
  "资金异动放大": { "zh-TW": "資金異動放大", en: "Flow Surge", ja: "資金急増" },
  "查找并切换板块": { "zh-TW": "查找並切換板塊", en: "Find and Toggle Sectors", ja: "セクター検索と切替" },
  "只看搜索结果": { "zh-TW": "只看搜尋結果", en: "Search Results Only", ja: "検索結果のみ" },
  "输入板块名、代码或股票名": { "zh-TW": "輸入板塊名、代碼或股票名", en: "Enter sector name, code, or stock name", ja: "セクター名、コード、銘柄名を入力" },
  "已显示": { "zh-TW": "已顯示", en: "Shown", ja: "表示中" },
  "板块": { "zh-TW": "板塊", en: "Sector", ja: "セクター" },
  "综合": { "zh-TW": "綜合", en: "Overall", ja: "総合" },
  "单项评分": { "zh-TW": "單項評分", en: "Category Scores", ja: "個別スコア" },
  "图表": { "zh-TW": "圖表", en: "Chart", ja: "チャート" },
  "今日": { "zh-TW": "今日", en: "Today", ja: "今日" },
  "昨日": { "zh-TW": "昨日", en: "Yesterday", ja: "昨日" },
  "第3日": { "zh-TW": "第3日", en: "Day 3", ja: "3日目" },
  "第4-5日": { "zh-TW": "第4-5日", en: "Days 4-5", ja: "4-5日目" },
  "第6-7日": { "zh-TW": "第6-7日", en: "Days 6-7", ja: "6-7日目" },
  "第8-15日": { "zh-TW": "第8-15日", en: "Days 8-15", ja: "8-15日目" },
  "第16-30日": { "zh-TW": "第16-30日", en: "Days 16-30", ja: "16-30日目" },
  "第31-60日": { "zh-TW": "第31-60日", en: "Days 31-60", ja: "31-60日目" },
  "第61-90日": { "zh-TW": "第61-90日", en: "Days 61-90", ja: "61-90日目" },
  "第91-120日": { "zh-TW": "第91-120日", en: "Days 91-120", ja: "91-120日目" },
  "第121-150日": { "zh-TW": "第121-150日", en: "Days 121-150", ja: "121-150日目" },
  "第151-180日": { "zh-TW": "第151-180日", en: "Days 151-180", ja: "151-180日目" },
  "输入股票名称、代码、行业或上榜原因": { "zh-TW": "輸入股票名稱、代碼、行業或上榜原因", en: "Enter stock name, code, industry, or list reason", ja: "銘柄名、コード、業種、掲載理由を入力" },
  "买": { "zh-TW": "買", en: "Buy", ja: "買い" },
  "卖": { "zh-TW": "賣", en: "Sell", ja: "売り" },
  "正在扫描全市场换手率异动，首次运行可能需要一两分钟...": { "zh-TW": "正在掃描全市場換手率異動，首次執行可能需要一兩分鐘...", en: "Scanning market-wide turnover anomalies. The first run may take a minute or two...", ja: "市場全体の回転率異常をスキャン中です。初回は1〜2分かかる場合があります..." },
  "输入股票名称或代码，从联想结果中选择后生成 T+1 和网格策略参考。": { "zh-TW": "輸入股票名稱或代碼，從聯想結果中選擇後生成 T+1 和網格策略參考。", en: "Enter a stock name or code, choose from suggestions, then generate T+1 and grid strategy references.", ja: "銘柄名またはコードを入力し、候補から選択するとT+1とグリッド戦略参考を生成します。" },
  "前端只请求本地后端接口，不展示 Tushare token": { "zh-TW": "前端只請求本地後端接口，不展示 Tushare token", en: "The frontend only calls local backend APIs and never shows the Tushare token", ja: "フロントエンドはローカルAPIのみを呼び出し、Tushare token は表示しません" },
  "本工具仅根据历史价格波动、均线、成交量、ATR、支撑压力和涨跌停价格进行区间测算，不构成任何投资建议。T+1做T策略和7-15日网格策略均不代表未来价格一定会触达相关区间。历史波动不代表未来走势，极端行情、重大消息、涨跌停、停牌、流动性不足等情况下模型可能失效。用户应结合自身风险承受能力独立判断。": { "zh-TW": "本工具僅根據歷史價格波動、均線、成交量、ATR、支撐壓力和漲跌停價格進行區間測算，不構成任何投資建議。T+1做T策略和7-15日網格策略均不代表未來價格一定會觸達相關區間。歷史波動不代表未來走勢，極端行情、重大消息、漲跌停、停牌、流動性不足等情況下模型可能失效。用戶應結合自身風險承受能力獨立判斷。", en: "This tool only estimates ranges from historical volatility, moving averages, volume, ATR, support/resistance, and limit prices. It is not investment advice. T+1 and 7-15 day grid references do not imply future prices will reach those ranges. Historical volatility does not predict future movement, and the model may fail under extreme moves, major news, limit moves, suspension, or poor liquidity. Make independent decisions based on your own risk tolerance.", ja: "本ツールは過去の価格変動、移動平均、出来高、ATR、支持抵抗、制限値幅に基づくレンジ測算のみを行い、投資助言ではありません。T+1および7〜15日グリッド戦略は、将来価格が必ず該当レンジに到達することを意味しません。極端な相場、重大ニュース、制限値幅、停止、流動性不足ではモデルが失効する可能性があります。自身のリスク許容度に基づき独立して判断してください。" },
  "现金流折现": { "zh-TW": "現金流折現", en: "DCF", ja: "DCF" },
  "股利折现": { "zh-TW": "股利折現", en: "DDM", ja: "DDM" },
  "市盈率估值": { "zh-TW": "本益比估值", en: "PE Valuation", ja: "PER評価" },
  "成长估值": { "zh-TW": "成長估值", en: "Growth Valuation", ja: "成長評価" },
  "企业价值倍数": { "zh-TW": "企業價值倍數", en: "EV/EBITDA", ja: "EV/EBITDA" },
  "利润表": { "zh-TW": "損益表", en: "Income Statement", ja: "損益計算書" },
  "现金流量表": { "zh-TW": "現金流量表", en: "Cash Flow Statement", ja: "キャッシュフロー計算書" },
  "资产负债表": { "zh-TW": "資產負債表", en: "Balance Sheet", ja: "貸借対照表" },
  "股本与分红": { "zh-TW": "股本與分紅", en: "Shares and Dividends", ja: "株式と配当" },
  "永续增长率": { "zh-TW": "永續成長率", en: "Terminal Growth", ja: "永久成長率" },
  "折现率": { "zh-TW": "折現率", en: "Discount Rate", ja: "割引率" },
  "AI预测增长率": { "zh-TW": "AI 預測成長率", en: "AI Forecast Growth", ja: "AI成長率予測" },
  "确认 AI 估值假设": { "zh-TW": "確認 AI 估值假設", en: "Confirm AI Assumptions", ja: "AI評価前提を確認" },
  "AI 预测失败": { "zh-TW": "AI 預測失敗", en: "AI Forecast Failed", ja: "AI予測失敗" },
  "知道了": { "zh-TW": "知道了", en: "OK", ja: "了解" },
  "取消": { "zh-TW": "取消", en: "Cancel", ja: "キャンセル" },
  "确认填入": { "zh-TW": "確認填入", en: "Apply", ja: "適用" },
  "风险提示": { "zh-TW": "風險提示", en: "Risk Notes", ja: "リスク注意" },
  "市场观察": { "zh-TW": "市場觀察", en: "Market Watch", ja: "市場観察" },
  "以龙虎榜为主视角，右侧用北向十大成交补充板块线索。": { "zh-TW": "以龍虎榜為主視角，右側用北向十大成交補充板塊線索。", en: "Use the Dragon-Tiger list as the main view, with northbound top trades as sector clues.", ja: "龍虎榜を主軸に、北向き上位取引でセクターの手掛かりを補足します。" },
  "龙虎榜": { "zh-TW": "龍虎榜", en: "Dragon-Tiger List", ja: "龍虎榜" },
  "北向十大成交": { "zh-TW": "北向十大成交", en: "Northbound Top 10", ja: "北向き上位10" },
  "北向板块线索": { "zh-TW": "北向板塊線索", en: "Northbound Sector Clues", ja: "北向きセクター手掛かり" },
  "观察席位净额、成交强度和上榜原因，点击股票可进入详情。": { "zh-TW": "觀察席位淨額、成交強度和上榜原因，點擊股票可進入詳情。", en: "Track net seat amount, turnover strength, and list reasons. Click a stock for details.", ja: "席位純額、取引強度、掲載理由を確認し、銘柄クリックで詳細へ移動できます。" },
  "按 TuShare 榜单顺序展示，辅助判断外资关注方向。": { "zh-TW": "按 TuShare 榜單順序展示，輔助判斷外資關注方向。", en: "Shown in TuShare ranking order to infer foreign capital focus.", ja: "TuShareの順位順に表示し、外資の関心方向を補助的に判断します。" },
  "仅汇总右侧十大成交股票所属行业。": { "zh-TW": "僅彙總右側十大成交股票所屬行業。", en: "Summarizes industries from the top-10 list only.", ja: "右側上位10銘柄の業種だけを集計します。" },
  "成交": { "zh-TW": "成交", en: "Turnover", ja: "売買代金" },
  "成交额": { "zh-TW": "成交額", en: "Turnover", ja: "売買代金" },
  "买入/卖出": { "zh-TW": "買入/賣出", en: "Buy / Sell", ja: "買い / 売り" },
  "净额": { "zh-TW": "淨額", en: "Net", ja: "純額" },
  "上榜原因": { "zh-TW": "上榜原因", en: "Reason", ja: "掲載理由" },
  "暂无龙虎榜数据": { "zh-TW": "暫無龍虎榜資料", en: "No Dragon-Tiger data", ja: "龍虎榜データなし" },
  "暂无北向榜数据": { "zh-TW": "暫無北向榜資料", en: "No northbound data", ja: "北向きデータなし" },
  "换手率异动监控": { "zh-TW": "換手率異動監控", en: "Turnover Anomaly Monitor", ja: "回転率異常監視" },
  "最近 24 周内寻找三周连续放量上涨，随后 4-11 周出现两天缩量但仍守在 20 周线附近的股票。": { "zh-TW": "最近 24 週內尋找三週連續放量上漲，隨後 4-11 週出現兩天縮量但仍守在 20 週線附近的股票。", en: "Find stocks that had three consecutive high-turnover rising weeks in the last 24 weeks, then two low-turnover days while holding near the 20-week MA.", ja: "直近24週で3週連続の高回転上昇後、4〜11週目に2日連続低回転ながら20週線近辺を維持した銘柄を探します。" },
  "命中股票": { "zh-TW": "命中股票", en: "Matches", ja: "該当銘柄" },
  "扫描窗口": { "zh-TW": "掃描窗口", en: "Scan Window", ja: "走査期間" },
  "规则": { "zh-TW": "規則", en: "Rule", ja: "ルール" },
  "生成时间": { "zh-TW": "生成時間", en: "Generated", ja: "生成時刻" },
  "监控口径": { "zh-TW": "監控口徑", en: "Monitoring Criteria", ja: "監視条件" },
  "异动股票列表": { "zh-TW": "異動股票列表", en: "Anomaly Stocks", ja: "異常銘柄リスト" },
  "决策复盘": { "zh-TW": "決策復盤", en: "Decision Review", ja: "意思決定レビュー" },
  "先锁定买入假设和判断理由，再用后续真实行情验证方法是否有效。": { "zh-TW": "先鎖定買入假設和判斷理由，再用後續真實行情驗證方法是否有效。", en: "Lock the buying hypothesis and reason first, then validate it with later real price action.", ja: "買い仮説と判断理由を固定し、その後の実際の値動きで有効性を検証します。" },
  "新增一次验证": { "zh-TW": "新增一次驗證", en: "Add a Test", ja: "検証を追加" },
  "记录买入假设和判断理由，后面用真实行情按交易日生成状态日历。": { "zh-TW": "記錄買入假設和判斷理由，後面用真實行情按交易日生成狀態日曆。", en: "Record the buying hypothesis and reason, then generate a trading-day status calendar from real market data.", ja: "買い仮説と理由を記録し、実際の相場で取引日ごとの状態カレンダーを生成します。" },
  "原始判断会保留，不做事后改写": { "zh-TW": "原始判斷會保留，不做事後改寫", en: "Original judgment is preserved and not rewritten afterward", ja: "元の判断は保存され、後から書き換えません" },
  "验证模式": { "zh-TW": "驗證模式", en: "Test Mode", ja: "検証モード" },
  "假定买入跟踪": { "zh-TW": "假定買入跟蹤", en: "Paper Buy Tracking", ja: "仮想買い追跡" },
  "明日预测验证": { "zh-TW": "明日預測驗證", en: "Tomorrow Prediction", ja: "翌日予測検証" },
  "信号日期": { "zh-TW": "訊號日期", en: "Signal Date", ja: "シグナル日" },
  "买入价格": { "zh-TW": "買入價格", en: "Entry Price", ja: "買い価格" },
  "收盘价": { "zh-TW": "收盤價", en: "Close Price", ja: "終値" },
  "开盘价": { "zh-TW": "開盤價", en: "Open Price", ja: "始値" },
  "自定义价格": { "zh-TW": "自訂價格", en: "Custom Price", ja: "カスタム価格" },
  "输入你的假定买入价": { "zh-TW": "輸入你的假定買入價", en: "Enter your assumed entry price", ja: "仮定買い価格を入力" },
  "观察周期": { "zh-TW": "觀察週期", en: "Observation Period", ja: "観察期間" },
  "判断理由": { "zh-TW": "判斷理由", en: "Reason", ja: "判断理由" },
  "加入验证": { "zh-TW": "加入驗證", en: "Add Test", ja: "検証に追加" },
  "验证记录": { "zh-TW": "驗證紀錄", en: "Tests", ja: "検証記録" },
  "验证中": { "zh-TW": "驗證中", en: "Tracking", ja: "検証中" },
  "已完成": { "zh-TW": "已完成", en: "Completed", ja: "完了" },
  "平均到期收益": { "zh-TW": "平均到期收益", en: "Average Final Return", ja: "平均終了リターン" },
  "验证列表": { "zh-TW": "驗證列表", en: "Test List", ja: "検証リスト" },
  "买入": { "zh-TW": "買入", en: "Entry", ja: "買い" },
  "当前": { "zh-TW": "當前", en: "Current", ja: "現在" },
  "最高/回撤": { "zh-TW": "最高/回撤", en: "High / Drawdown", ja: "最高 / ドローダウン" },
  "进度": { "zh-TW": "進度", en: "Progress", ja: "進捗" },
  "删除": { "zh-TW": "刪除", en: "Delete", ja: "削除" },
  "短线策略参考": { "zh-TW": "短線策略參考", en: "Short-term Strategy Reference", ja: "短期戦略参考" },
  "基于历史振幅、均线、量能、ATR、支撑压力和涨跌停价格做区间测算，只提供可观察的参考条件，不做交易下单和确定性判断。": { "zh-TW": "基於歷史振幅、均線、量能、ATR、支撐壓力和漲跌停價格做區間測算，只提供可觀察的參考條件，不做交易下單和確定性判斷。", en: "Estimate reference ranges from historical amplitude, moving averages, volume, ATR, support/resistance, and limit prices. It only provides observable conditions, not orders or certainty.", ja: "過去の値幅、移動平均、出来高、ATR、支持抵抗、制限値幅から参考レンジを測算します。取引指示や確定判断ではありません。" },
  "选择股票": { "zh-TW": "選擇股票", en: "Select Stock", ja: "銘柄を選択" },
  "正在加载行情数据...": { "zh-TW": "正在載入行情資料...", en: "Loading market data...", ja: "相場データを読み込み中..." },
  "行情数据加载失败，请稍后重试": { "zh-TW": "行情資料載入失敗，請稍後重試", en: "Market data failed to load. Please try again later", ja: "相場データの読み込みに失敗しました。後でもう一度お試しください" },
  "请选择一只股票生成短线策略参考。": { "zh-TW": "請選擇一檔股票生成短線策略參考。", en: "Select a stock to generate a short-term strategy reference.", ja: "銘柄を選択して短期戦略参考を生成してください。" },
  "暂无行情数据。": { "zh-TW": "暫無行情資料。", en: "No market data.", ja: "相場データがありません。" },
  "当前股票可能处于停牌状态，无法生成策略。": { "zh-TW": "當前股票可能處於停牌狀態，無法生成策略。", en: "This stock may be suspended, so no strategy can be generated.", ja: "この銘柄は停止中の可能性があり、戦略を生成できません。" },
  "历史交易数据不足，暂无法生成可靠策略。至少需要 20 个有效交易日。": { "zh-TW": "歷史交易資料不足，暫無法生成可靠策略。至少需要 20 個有效交易日。", en: "Historical data is insufficient. At least 20 valid trading days are required.", ja: "過去データが不足しています。少なくとも20有効取引日が必要です。" },
  "行情数据暂无法完成测算。": { "zh-TW": "行情資料暫無法完成測算。", en: "Market data is insufficient for calculation.", ja: "相場データが不足して測算できません。" },
  "当前价格": { "zh-TW": "當前價格", en: "Current Price", ja: "現在価格" },
  "今日高低价": { "zh-TW": "今日高低價", en: "Today High / Low", ja: "本日高値 / 安値" },
  "昨收价": { "zh-TW": "昨收價", en: "Previous Close", ja: "前日終値" },
  "成交量": { "zh-TW": "成交量", en: "Volume", ja: "出来高" },
  "换手率": { "zh-TW": "換手率", en: "Turnover Rate", ja: "回転率" },
  "量比": { "zh-TW": "量比", en: "Volume Ratio", ja: "出来高倍率" },
  "数据更新时间": { "zh-TW": "資料更新時間", en: "Updated", ja: "更新時刻" },
  "平均振幅": { "zh-TW": "平均振幅", en: "Average Amplitude", ja: "平均値幅" },
  "中位数振幅": { "zh-TW": "中位數振幅", en: "Median Amplitude", ja: "中央値幅" },
  "最大振幅": { "zh-TW": "最大振幅", en: "Max Amplitude", ja: "最大値幅" },
  "最小振幅": { "zh-TW": "最小振幅", en: "Min Amplitude", ja: "最小値幅" },
  "有效振幅": { "zh-TW": "有效振幅", en: "Effective Amplitude", ja: "有効値幅" },
  "基础风险等级": { "zh-TW": "基礎風險等級", en: "Base Risk", ja: "基本リスク" },
  "风险等级": { "zh-TW": "風險等級", en: "Risk Level", ja: "リスク水準" },
  "策略提示": { "zh-TW": "策略提示", en: "Strategy Notes", ja: "戦略メモ" },
  "基准价格": { "zh-TW": "基準價格", en: "Base Price", ja: "基準価格" },
  "网格周期": { "zh-TW": "網格週期", en: "Grid Horizon", ja: "グリッド期間" },
  "网格模式": { "zh-TW": "網格模式", en: "Grid Mode", ja: "グリッドモード" },
  "中枢价格": { "zh-TW": "中樞價格", en: "Center Price", ja: "中心価格" },
  "网格适配性": { "zh-TW": "網格適配性", en: "Grid Suitability", ja: "グリッド適合度" },
  "每格价差": { "zh-TW": "每格價差", en: "Grid Step", ja: "グリッド幅" },
  "每格百分比": { "zh-TW": "每格百分比", en: "Step Percent", ja: "幅率" },
  "周期波动率": { "zh-TW": "週期波動率", en: "Horizon Volatility", ja: "期間ボラティリティ" },
  "资金强弱矩阵": { "zh-TW": "資金強弱矩陣", en: "Capital Strength Matrix", ja: "資金強弱マトリクス" },
  "用多个周期的资金流入流出、持续性、扩散度和价格确认，观察板块是否正在形成主线。": { "zh-TW": "用多個週期的資金流入流出、持續性、擴散度和價格確認，觀察板塊是否正在形成主線。", en: "Use multi-period capital flows, persistence, diffusion, and price confirmation to observe whether a sector is becoming a main theme.", ja: "複数期間の資金流入出、持続性、拡散度、価格確認でセクターが主線化しているかを観察します。" },
  "板块颗粒度": { "zh-TW": "板塊顆粒度", en: "Sector Level", ja: "セクター粒度" },
  "排序": { "zh-TW": "排序", en: "Sort", ja: "並び替え" },
  "矩阵视角": { "zh-TW": "矩陣視角", en: "Matrix View", ja: "マトリクス表示" },
  "状态筛选": { "zh-TW": "狀態篩選", en: "Status Filter", ja: "状態フィルター" },
  "申万一级": { "zh-TW": "申萬一級", en: "SW Level 1", ja: "申万レベル1" },
  "申万二级": { "zh-TW": "申萬二級", en: "SW Level 2", ja: "申万レベル2" },
  "申万三级": { "zh-TW": "申萬三級", en: "SW Level 3", ja: "申万レベル3" },
  "申万三级（最细）": { "zh-TW": "申萬三級（最細）", en: "SW Level 3 (finest)", ja: "申万レベル3（最細）" },
  "综合评分": { "zh-TW": "綜合評分", en: "Overall Score", ja: "総合スコア" },
  "资金强度": { "zh-TW": "資金強度", en: "Capital Strength", ja: "資金強度" },
  "持续性": { "zh-TW": "持續性", en: "Persistence", ja: "持続性" },
  "扩散度": { "zh-TW": "擴散度", en: "Diffusion", ja: "拡散度" },
  "价格确认": { "zh-TW": "價格確認", en: "Price Confirmation", ja: "価格確認" },
  "今日净流入": { "zh-TW": "今日淨流入", en: "Today Net Inflow", ja: "本日純流入" },
  "30天净流入": { "zh-TW": "30天淨流入", en: "30D Net Inflow", ja: "30日純流入" },
  "90天净流入": { "zh-TW": "90天淨流入", en: "90D Net Inflow", ja: "90日純流入" },
  "分段趋势": { "zh-TW": "分段趨勢", en: "Segment Trend", ja: "分段トレンド" },
  "累计资金": { "zh-TW": "累計資金", en: "Cumulative Flow", ja: "累計資金" },
  "板块数量": { "zh-TW": "板塊數量", en: "Sector Count", ja: "セクター数" },
  "主线增强": { "zh-TW": "主線增強", en: "Mainline Strengthening", ja: "主線強化" },
  "新启动": { "zh-TW": "新啟動", en: "New Start", ja: "新規始動" },
  "回流修复": { "zh-TW": "回流修復", en: "Inflow Recovery", ja: "資金回帰" },
  "退潮预警": { "zh-TW": "退潮預警", en: "Fade Warning", ja: "退潮警戒" },
  "一日脉冲": { "zh-TW": "一日脈衝", en: "One-day Pulse", ja: "一日パルス" },
  "偏强观察": { "zh-TW": "偏強觀察", en: "Strong Watch", ja: "強め観察" },
  "观察": { "zh-TW": "觀察", en: "Watch", ja: "観察" },
  "板块资金趋势": { "zh-TW": "板塊資金趨勢", en: "Sector Fund Flow", ja: "セクター資金トレンド" },
  "基于申万一级行业成分股和 TuShare 个股资金流聚合，观察最近一段时间行业资金流入流出。": { "zh-TW": "基於申萬一級行業成分股和 TuShare 個股資金流聚合，觀察最近一段時間行業資金流入流出。", en: "Aggregate TuShare stock fund flows by SW sectors to observe recent sector inflows and outflows.", ja: "TuShareの個別株資金フローを申万セクターで集計し、最近の資金流入出を観察します。" },
  "趋势图": { "zh-TW": "趨勢圖", en: "Trend Chart", ja: "トレンドチャート" },
  "排行周期": { "zh-TW": "排行週期", en: "Ranking Period", ja: "ランキング期間" },
  "开始日期": { "zh-TW": "開始日期", en: "Start Date", ja: "開始日" },
  "结束日期": { "zh-TW": "結束日期", en: "End Date", ja: "終了日" },
  "正在聚合板块资金，这一步会读取多天资金流...": { "zh-TW": "正在聚合板塊資金，這一步會讀取多天資金流...", en: "Aggregating sector flows across multiple days...", ja: "複数日の資金フローを集計中..." },
  "点击刷新板块资金读取数据": { "zh-TW": "點擊重新整理板塊資金讀取資料", en: "Refresh sector flows to load data", ja: "セクター資金を更新してデータを読み込む" },
  "我的板块池": { "zh-TW": "我的板塊池", en: "My Sector Pool", ja: "マイセクタープール" },
  "把你想长期盯的细分方向单独收在这里，板块资金页只负责观察市场资金变化。": { "zh-TW": "把你想長期盯的細分方向單獨收在這裡，板塊資金頁只負責觀察市場資金變化。", en: "Keep the sectors you want to track long term here, while sector flow pages monitor broad market capital changes.", ja: "長期監視したい細分方向をここに集め、セクター資金ページでは市場資金の変化を観察します。" },
  "去板块资金添加": { "zh-TW": "去板塊資金添加", en: "Add from Sector Flows", ja: "セクター資金から追加" },
  "趋势范围": { "zh-TW": "趨勢範圍", en: "Trend Range", ja: "トレンド範囲" },
  "搜索板块": { "zh-TW": "搜尋板塊", en: "Search Sector", ja: "セクター検索" },
  "板块池资金趋势": { "zh-TW": "板塊池資金趨勢", en: "Sector Pool Flow Trend", ja: "セクタープール資金トレンド" },
  "关注板块": { "zh-TW": "關注板塊", en: "Watched Sectors", ja: "監視セクター" },
  "等待数据": { "zh-TW": "等待資料", en: "Waiting for data", ja: "データ待ち" },
  "没有匹配的板块": { "zh-TW": "沒有匹配的板塊", en: "No matching sectors", ja: "一致するセクターなし" },
  "还没有加入板块，可以去板块资金页从榜单里加入。": { "zh-TW": "還沒有加入板塊，可以去板塊資金頁從榜單裡加入。", en: "No sectors added yet. Add sectors from the sector flow rankings.", ja: "セクターはまだ追加されていません。セクター資金ランキングから追加できます。" },
  "请选择至少一个板块": { "zh-TW": "請至少選擇一個板塊", en: "Select at least one sector", ja: "少なくとも1つのセクターを選択してください" },
  "请选择至少一只股票": { "zh-TW": "請至少選擇一檔股票", en: "Select at least one stock", ja: "少なくとも1銘柄を選択してください" },
  "什么是价值投资？": { "zh-TW": "什麼是價值投資？", en: "What Is Value Investing?", ja: "バリュー投資とは？" },
  "为什么要做价值投资？": { "zh-TW": "為什麼要做價值投資？", en: "Why Do Value Investing?", ja: "なぜ必要？" },
  "价值投资怎么做？": { "zh-TW": "價值投資怎麼做？", en: "How To Practice It?", ja: "どう実践する？" },
  "需要掌握什么技能？": { "zh-TW": "需要掌握什麼技能？", en: "What Skills Matter?", ja: "必要なスキルは？" },
  "价值投资不是单纯寻找低市盈率，也不是因为股价下跌就认为便宜。它的核心是把股票当作企业所有权的一部分，先理解企业能长期创造多少现金流、利润和竞争优势，再用合理估值判断当前价格是否留下足够容错空间。": { "zh-TW": "價值投資不是單純尋找低本益比，也不是因為股價下跌就認為便宜。它的核心是把股票當作企業所有權的一部分，先理解企業能長期創造多少現金流、利潤和競爭優勢，再用合理估值判斷當前價格是否留下足夠容錯空間。", en: "Value investing is not just buying low PE or calling a falling stock cheap. It treats a stock as business ownership, first understanding long-term cash flow, profit, and moat, then judging whether the current price leaves enough room for error.", ja: "バリュー投資は低PER探しでも、下落したから安いと見ることでもありません。株式を企業所有権の一部として捉え、長期的なキャッシュフロー、利益、競争優位を理解したうえで、価格に十分な余裕があるかを判断します。" },
  "A股波动很大，短期情绪、题材和资金会不断放大价格偏离。价值投资的意义，是让你在波动里有一套可复盘的判断系统：知道自己为什么关注一家公司，知道价格偏离价值时应该观察什么，也知道什么时候需要承认判断失效。": { "zh-TW": "A股波動很大，短期情緒、題材和資金會不斷放大價格偏離。價值投資的意義，是讓你在波動裡有一套可復盤的判斷系統：知道自己為什麼關注一家公司，知道價格偏離價值時應該觀察什麼，也知道什麼時候需要承認判斷失效。", en: "A-shares are volatile. Sentiment, themes, and flows can magnify price gaps. Value investing gives you a reviewable judgment system: why you follow a company, what to observe when price diverges from value, and when to admit the thesis failed.", ja: "A株は変動が大きく、短期心理・テーマ・資金が価格乖離を拡大します。バリュー投資は、なぜ企業を見るのか、価格が価値から乖離した時に何を見るのか、判断が失効した時にどう認めるかを整理する仕組みです。" },
  "更稳妥的流程是先选公司，再估价值，最后等价格。先确认商业模式、竞争格局、盈利质量和成长空间；再用DCF、PE、PEG、DDM、EV/EBITDA等方法交叉验证；最后把结果落成低估线、合理价值和高估线，并持续跟踪价格与基本面变化。": { "zh-TW": "更穩妥的流程是先選公司，再估價值，最後等價格。先確認商業模式、競爭格局、盈利品質和成長空間；再用DCF、PE、PEG、DDM、EV/EBITDA等方法交叉驗證；最後把結果落成低估線、合理價值和高估線，並持續跟蹤價格與基本面變化。", en: "A steadier process is: choose the company, estimate value, then wait for price. Validate business model, competition, earnings quality, and growth; cross-check with DCF, PE, PEG, DDM, and EV/EBITDA; then turn results into low, fair, and high lines and track price and fundamentals.", ja: "より安定した手順は、会社を選び、価値を見積もり、最後に価格を待つことです。事業モデル、競争環境、収益品質、成長余地を確認し、DCF、PE、PEG、DDM、EV/EBITDAで検証し、割安・適正・割高ラインに落とし込みます。" },
  "价值投资需要的不是预测明天涨跌，而是持续提升企业分析、财务理解、估值建模、行业判断和情绪管理能力。工具可以帮你记录、提醒和计算，但最终仍然要靠你对企业和风险的独立判断。": { "zh-TW": "價值投資需要的不是預測明天漲跌，而是持續提升企業分析、財務理解、估值建模、行業判斷和情緒管理能力。工具可以幫你記錄、提醒和計算，但最終仍然要靠你對企業和風險的獨立判斷。", en: "Value investing is less about predicting tomorrow and more about improving business analysis, financial understanding, valuation modeling, industry judgment, and emotional discipline. Tools can record, remind, and calculate, but the final judgment is still yours.", ja: "バリュー投資に必要なのは明日の予測ではなく、企業分析、財務理解、評価モデル、業界判断、感情管理を高め続けることです。ツールは記録・通知・計算を助けますが、最後は企業とリスクへの独自判断です。" },
};

const sectorPoolStrengthWindows = [1, 2, 3, 5, 7, 15, 30, 60, 90, 120, 150, 180];
const sectorPoolStrengthSegments = [
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

window.addEventListener("hashchange", () => {
  state.route = parseRoute();
  render();
});

window.addEventListener("resize", debounce(() => {
  drawDetailChart();
  drawSectorChart();
  drawSectorPoolChart();
  drawSectorStockChart();
}, 120));

document.addEventListener("DOMContentLoaded", async () => {
  if (!location.hash) {
    location.hash = "#/dashboard";
  }
  render();
  try {
    await loadSession();
    if (state.auth.authenticated) {
      await loadCore();
    }
  } catch (error) {
    state.coreError = error.message;
  } finally {
    state.coreLoading = false;
  }
  render();
  if (state.auth.authenticated) {
    startSyncPolling();
  }
});

document.addEventListener("submit", handleSubmit);
document.addEventListener("click", handleClick);
document.addEventListener("change", handleChange);
document.addEventListener("input", handleInput);
document.addEventListener("toggle", handleToggle, true);
window.addEventListener("error", (event) => {
  state.coreError = event.message || "页面脚本运行失败";
  state.coreLoading = false;
  render();
});
window.addEventListener("unhandledrejection", (event) => {
  state.coreError = event.reason?.message || String(event.reason || "页面请求失败");
  state.coreLoading = false;
  render();
});

async function loadSession() {
  const data = await api("/api/auth/session");
  state.auth = {
    checked: true,
    authenticated: Boolean(data.authenticated),
    user: data.user || null,
  };
  state.loginError = "";
}

async function loadCore() {
  state.coreError = "";
  const [dashboard, groups, watchlist, sync, sectorPool, valuations, strategyMonitors] = await Promise.all([
    withTimeout(api("/api/dashboard"), 8000, "仪表盘接口超时"),
    withTimeout(api("/api/groups"), 8000, "分组接口超时"),
    withTimeout(api("/api/watchlist"), 8000, "股票池接口超时"),
    withTimeout(api("/api/sync/status"), 8000, "同步状态接口超时"),
    withTimeout(api("/api/sector-pool"), 8000, "板块池接口超时"),
    withTimeout(api("/api/valuations"), 8000, "估值列表接口超时"),
    withTimeout(api("/api/short-strategy-monitors"), 8000, "短线监控列表接口超时"),
  ]);
  state.dashboard = dashboard;
  state.groups = groups.groups || [];
  state.watchlist = watchlist.items || [];
  state.sync = sync.sync;
  state.sectorPool = sectorPool.items || [];
  state.valuations = valuations.items || [];
  state.strategyMonitors = strategyMonitors.items || [];
}

function render() {
  updateNav();
  updateShell();
  renderModal();
  requestAnimationFrame(applyLanguage);

  if (!state.auth.checked) {
    app.innerHTML = `<section class="loading">${state.coreLoading ? "正在检查登录状态..." : "正在进入系统..."}</section>`;
    return;
  }

  if (!state.auth.authenticated) {
    app.innerHTML = renderLoginPage();
    return;
  }

  if (!state.dashboard) {
    app.innerHTML = state.coreError
      ? renderBootError()
      : `<section class="loading">${state.coreLoading ? "正在翻开估值手账..." : "正在等待初始化数据..."}</section>`;
    return;
  }

  if (state.route.page === "pool") {
    renderPool();
    return;
  }

  if (state.route.page === "stock") {
    renderStockDetail(state.route.id);
    return;
  }

  if (state.route.page === "valuations") {
    renderValuationList();
    return;
  }

  if (state.route.page === "valuation") {
    renderValuationWorkspace(state.route.id);
    return;
  }

  if (state.route.page === "market") {
    renderMarket();
    return;
  }

  if (state.route.page === "decisions") {
    renderDecisionReview();
    return;
  }

  if (state.route.page === "turnover") {
    renderTurnoverMonitor();
    return;
  }

  if (state.route.page === "short-strategies") {
    renderShortStrategyMonitorList();
    return;
  }

  if (state.route.page === "short-strategy") {
    renderShortStrategyPage();
    return;
  }

  if (state.route.page === "strength") {
    renderStrengthMatrix();
    return;
  }

  if (state.route.page === "sectors") {
    renderSectors();
    return;
  }

  if (state.route.page === "sector-pool") {
    renderSectorPoolPage();
    return;
  }

  if (state.route.page === "sector") {
    renderSectorDetail(state.route.id);
    return;
  }

  if (state.route.page === "users") {
    renderUserManagement();
    return;
  }

  if (state.route.page === "groups") {
    state.poolTab = "groups";
    location.hash = "#/pool";
    renderPool();
    return;
  }

  renderDashboard();
}

function renderDashboard() {
  const dashboard = state.dashboard;
  const stats = dashboard.stats || {};
  const dashboardUndervalued = filterStockItems(dashboard.undervalued || [], state.dashboardQuery);
  app.innerHTML = `
    ${renderToast()}
    <section class="page-head dashboard-head">
      <div>
        <p class="eyebrow">${escapeHtml(t("dashboardEyebrow"))}</p>
        <h1 class="page-title">${escapeHtml(t("dashboardTitle"))}</h1>
        <p class="page-subtitle">${escapeHtml(t("dashboardSubtitle"))}</p>
      </div>
      <div class="head-actions">
        <button class="button soft" data-action="reload">${escapeHtml(t("reload"))}</button>
        <button class="button primary" data-action="start-sync">${escapeHtml(t("syncClose"))}</button>
      </div>
    </section>

    <section class="dashboard-admin-grid">
      <div class="dashboard-admin-main">
        <section class="stat-grid dashboard-stat-grid">
          ${renderStat(t("watchPool"), stats.total, t("stockUnit"), t("watchPoolHint"))}
          ${renderStat(t("undervalued"), stats.undervalued, t("stockUnit"), t("undervaluedHint"))}
          ${renderStat(t("fair"), stats.fair, t("stockUnit"), t("fairHint"))}
          ${renderStat(t("overvalued"), stats.overvalued, t("stockUnit"), t("overvaluedHint"))}
        </section>
        ${renderSyncPanel()}
      </div>
      <div class="dashboard-alert-panel">
        ${renderMiniList(t("underAlert"), dashboardUndervalued, t("emptyUnder"), renderCompactStock)}
      </div>
    </section>

    ${renderValueInvestingMethodology()}
  `;
}

function renderValueInvestingMethodology() {
  const cards = valueInvestingMethodologyDetails();
  return `
    <section class="panel value-method-card expanded">
      <div class="panel-head value-method-head">
        <div>
          <span>${escapeHtml(t("methodologyLabel"))}</span>
          <h2>${escapeHtml(t("methodologyTitle"))}</h2>
          <p>${escapeHtml(t("methodologySubtitle"))}</p>
        </div>
      </div>
      <div class="value-method-grid">
        ${cards.map((card) => `
          <article>
            <strong>${escapeHtml(card.title)}</strong>
            <p>${escapeHtml(card.text)}</p>
            <ul>
              ${card.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
            </ul>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function valueInvestingMethodologyDetails() {
  return [
    {
      title: "什么是价值投资？",
      text: "价值投资不是单纯寻找低市盈率，也不是因为股价下跌就认为便宜。它的核心是把股票当作企业所有权的一部分，先理解企业能长期创造多少现金流、利润和竞争优势，再用合理估值判断当前价格是否留下足够容错空间。",
      points: [
        "关注企业价值，而不是只关注K线波动。",
        "用合理价值、低估区、合理区、高估区管理买卖纪律。",
        "把估值依据、调整流水和价格日期记录下来，避免事后凭感觉改判断。",
        "承认估值一定有误差，所以要依赖区间和安全边际，而不是单点价格。",
      ],
    },
    {
      title: "为什么要做价值投资？",
      text: "A股波动很大，短期情绪、题材和资金会不断放大价格偏离。价值投资的意义，是让你在波动里有一套可复盘的判断系统：知道自己为什么关注一家公司，知道价格偏离价值时应该观察什么，也知道什么时候需要承认判断失效。",
      points: [
        "帮助你把注意力从每天涨跌，转移到企业质量、估值和风险收益比。",
        "在市场恐慌时，用估值区间判断是否进入可观察区域。",
        "在市场亢奋时，用高估区提醒自己不要把好公司买成坏价格。",
        "通过记录估值变化，复盘自己是因为基本面变化调整，还是被价格情绪带着走。",
      ],
    },
    {
      title: "价值投资怎么做？",
      text: "更稳妥的流程是先选公司，再估价值，最后等价格。先确认商业模式、竞争格局、盈利质量和成长空间；再用DCF、PE、PEG、DDM、EV/EBITDA等方法交叉验证；最后把结果落成低估线、合理价值和高估线，并持续跟踪价格与基本面变化。",
      points: [
        "先建立股票池，只跟踪自己愿意长期理解的公司。",
        "每只股票写清楚估值依据，例如利润假设、增长率、折现率、合理PE或股息假设。",
        "根据估值结果设置低估、合理、高估区间，而不是每天临时判断。",
        "收盘后同步价格，观察当前价格相对估值区间的偏离幅度。",
        "当财报、行业景气度或竞争格局变化时，更新估值并保留调整流水。",
      ],
    },
    {
      title: "需要掌握什么技能？",
      text: "价值投资需要的不是预测明天涨跌，而是持续提升企业分析、财务理解、估值建模、行业判断和情绪管理能力。工具可以帮你记录、提醒和计算，但最终仍然要靠你对企业和风险的独立判断。",
      points: [
        "读财报：理解收入、利润、现金流、资产负债表和资本开支。",
        "看行业：判断行业空间、周期位置、竞争格局和政策变量。",
        "做估值：知道不同估值方法适合什么企业，并能保守设置关键假设。",
        "控风险：识别估值陷阱、基本面恶化、流动性风险和过度集中持仓。",
        "做复盘：记录每次估值变化和判断理由，让决策逐步变得可解释、可改进。",
      ],
    },
  ];
}

function valuationMethodDefinitions() {
  return [
    {
      key: "dcf",
      label: "DCF",
      name: "现金流折现",
      suitable: "适合现金流稳定、资本开支可预测、经营生命周期较长的企业。",
      formula: "每股价值 = (未来自由现金流现值 + 终值现值 - 净债务) / 总股本",
      meaning: "把企业未来能产生的自由现金流折现回今天，强调企业本身能赚到的现金。",
    },
    {
      key: "ddm",
      label: "DDM",
      name: "股利折现",
      suitable: "适合高分红、分红政策稳定的银行、公用事业、成熟消费类企业。",
      formula: "每股价值 = 下一年每股股利 / (股权成本 - 股利增长率)",
      meaning: "把未来股息折现成今天的价值，适合把分红视作主要回报来源的公司。",
    },
    {
      key: "pe",
      label: "PE",
      name: "市盈率估值",
      suitable: "适合盈利稳定、行业可比公司较多、商业模式成熟的企业。",
      formula: "每股价值 = 每股收益 EPS × 目标 PE",
      meaning: "用市场愿意给这类利润的倍数估算价值，简单直观但依赖可比倍数质量。",
    },
    {
      key: "peg",
      label: "PEG",
      name: "成长调整市盈率",
      suitable: "适合成长股，尤其是盈利增速仍较高但需要约束估值泡沫的公司。",
      formula: "每股价值 = EPS × 目标 PEG × 未来盈利增速百分数",
      meaning: "把 PE 与增长速度放在一起看，避免只看高增长而忽略估值过贵。",
    },
    {
      key: "ev_ebitda",
      label: "EV/EBITDA",
      name: "企业价值倍数",
      suitable: "适合重资产、跨资本结构比较、折旧摊销差异较大的企业。",
      formula: "每股价值 = (EBITDA × 目标倍数 - 净债务) / 总股本",
      meaning: "从企业整体价值出发，再扣除债务分配给股东，便于比较杠杆不同的公司。",
    },
  ];
}

function defaultValuationInputs() {
  return {
    dcf: { free_cash_flow: "", growth_rate: "", years: 5, terminal_growth_rate: "", discount_rate: "", net_debt: "", shares_outstanding: "" },
    ddm: { dividend_per_share: "", dividend_growth_rate: "", cost_of_equity: "" },
    pe: { eps: "", target_pe: "" },
    peg: { eps: "", eps_growth_rate: "", target_peg: 1 },
    ev_ebitda: { ebitda: "", target_ev_ebitda: "", net_debt: "", shares_outstanding: "" },
  };
}

function createValuationDraft(source = {}) {
  return {
    _route_id: source._route_id || source.id || "new",
    id: source.id || "",
    ts_code: source.ts_code || "",
    name: source.name || "",
    methods: source.methods?.length ? source.methods : ["dcf", "pe"],
    inputs: mergeValuationInputs(defaultValuationInputs(), source.inputs || {}),
    method_results: source.method_results || {},
    fair_price: source.fair_price ?? null,
    low_price: source.low_price ?? null,
    high_price: source.high_price ?? null,
    safety_margin_pct: source.safety_margin_pct ?? 20,
    overvaluation_margin_pct: source.overvaluation_margin_pct ?? 20,
    source: source.source || "manual",
    pdf_file_name: source.pdf_file_name || "",
    note: source.note || "",
  };
}

function mergeValuationInputs(base, extra) {
  const output = JSON.parse(JSON.stringify(base));
  Object.entries(extra || {}).forEach(([method, values]) => {
    output[method] = { ...(output[method] || {}), ...(values || {}) };
  });
  return output;
}

function renderValuationList() {
  const rows = filterRowsByQuery(state.valuations || [], state.valuationQuery, ["name", "ts_code", "methods", "note"]);
  app.innerHTML = `
    ${renderToast()}
    <section class="valuation-hero">
      <div>
        <p class="eyebrow">Valuation Workbench</p>
        <h1>先估值，再谈买入</h1>
        <p>价值投资的核心不是预测明天涨跌，而是持续回答三个问题：企业值多少钱、现在价格给了多少安全边际、当假设变化时估值是否也要变化。</p>
      </div>
      <a class="button primary" href="#/valuation/new">新建估值</a>
    </section>

    <section class="panel valuation-list-panel">
      <div class="panel-head">
        <h2>估值结果列表</h2>
        <span>${rows.length} / ${(state.valuations || []).length} 条</span>
      </div>
      ${renderListSearch("valuation", state.valuationQuery, "输入股票名称、代码或估值备注")}
      ${renderValuationRows(rows)}
    </section>
  `;
}

function renderValuationRows(rows) {
  if (!rows.length) {
    return `<div class="empty-inline">还没有保存过估值结果</div>`;
  }
  return `
    <div class="valuation-result-table">
      <div class="valuation-result-head">
        <span>股票</span>
        <span>估值区间</span>
        <span>方法</span>
        <span>来源</span>
        <span>时间</span>
        <span>操作</span>
      </div>
      ${rows.map((item) => `
        <article class="valuation-result-row">
          <span><strong>${escapeHtml(item.name || item.ts_code)}</strong><small>${escapeHtml(item.ts_code || "")}</small></span>
          <span><strong>${formatCurrency(item.fair_price)}</strong><small>低 ${formatCurrency(item.low_price)} / 高 ${formatCurrency(item.high_price)}</small></span>
          <span>${renderValuationMethodTags(item.methods || [])}</span>
          <span>${escapeHtml(valuationSourceLabelClient(item.source))}</span>
          <span>${formatDateTime(item.created_at)}</span>
          <span class="row-actions">
            <a class="button small" href="#/valuation/${encodeURIComponent(item.id)}">查看</a>
            <button class="button small" data-action="open-stock" data-code="${escapeAttr(item.ts_code || "")}">股票</button>
          </span>
        </article>
      `).join("")}
    </div>
  `;
}

function renderValuationMethodTags(methods) {
  return `<span class="analysis-tags">${(methods || []).map((method) => `<span>${escapeHtml(valuationMethodLabelClient(method))}</span>`).join("")}</span>`;
}

function renderValuationWorkspace(id) {
  const routeId = id || "new";
  if (!state.valuationDraft || state.valuationDraft._route_id !== routeId) {
    const source = id && id !== "new" ? (state.valuations || []).find((item) => item.id === id) || {} : {};
    state.valuationDraft = { ...createValuationDraft(source), _route_id: routeId };
  }
  const draft = state.valuationDraft;
  app.innerHTML = `
    ${renderToast()}
    <section class="valuation-hero">
      <div>
        <a class="back-link" href="#/valuations">返回估值列表</a>
        <p class="eyebrow">Intrinsic Value</p>
        <h1>${draft.id ? "查看估值结果" : "新建估值"}</h1>
        <p>估值不是为了得到一个精确数字，而是让买入决策有边界：低估线保护安全边际，合理价值约束预期，高估线提醒兑现或复核假设。</p>
      </div>
      <div class="head-actions">
        <button class="button soft" data-action="calculate-valuation">重新计算</button>
        <button class="button primary" data-action="save-valuation" ${state.valuationSaving ? "disabled" : ""}>保存估值结果</button>
      </div>
    </section>

    ${renderValuationForm(draft)}
  `;
}

function renderValuationMethodGuide() {
  return `
    <section class="valuation-guide">
      ${valuationMethodDefinitions().map((method) => `
        <article>
          <span>${method.label}</span>
          <h3>${method.name}</h3>
          <p>${method.meaning}</p>
          <small>适合：${method.suitable}</small>
          <code>${method.formula}</code>
        </article>
      `).join("")}
    </section>
  `;
}

function renderValuationForm(draft) {
  return `
    <form class="valuation-workbench" data-form="valuation-workbench">
      <section class="panel valuation-input-panel">
        <div class="panel-head">
          <h2>基础信息与数据回填</h2>
          <span>可手动填写，也可上传财报 PDF 让 Gemini 提取字段</span>
        </div>
        <div class="valuation-basic-grid">
          <label><span>股票代码</span><input class="input" name="ts_code" value="${escapeAttr(draft.ts_code)}" placeholder="例如 300274.SZ" required></label>
          <label><span>股票名称</span><input class="input" name="name" value="${escapeAttr(draft.name)}" placeholder="例如 阳光电源"></label>
          <label><span>安全边际</span><input class="input" name="safety_margin_pct" type="number" step="0.1" value="${escapeAttr(draft.safety_margin_pct)}"></label>
          <label><span>高估溢价</span><input class="input" name="overvaluation_margin_pct" type="number" step="0.1" value="${escapeAttr(draft.overvaluation_margin_pct)}"></label>
        </div>
        <div class="valuation-pdf-row">
          <label><span>上传财报 PDF</span><input class="input" type="file" name="valuation_pdf" accept="application/pdf"></label>
          <button class="button soft" type="button" data-action="extract-valuation-pdf" ${state.valuationPdfLoading ? "disabled" : ""}>${state.valuationPdfLoading ? "提取中..." : "用 Gemini 回填数据"}</button>
          <small>${draft.pdf_file_name ? `已回填：${escapeHtml(draft.pdf_file_name)}` : "建议上传年报或半年报 PDF，回填后仍需人工复核。"}</small>
        </div>
      </section>

      <section class="panel valuation-input-panel">
        <div class="panel-head">
          <h2>选择估值方法</h2>
          <span>可多选，最终合理价值取有效方法的平均值</span>
        </div>
        <div class="valuation-method-picker">
          ${valuationMethodDefinitions().map((method) => `
            <label>
              <input type="checkbox" name="methods" value="${method.key}" ${draft.methods.includes(method.key) ? "checked" : ""}>
              <strong>${method.label}</strong>
              <span>${method.name}</span>
            </label>
          `).join("")}
        </div>
      </section>

      <section class="valuation-model-grid">
        ${renderValuationModelFields("dcf", "DCF 现金流折现", [
          ["free_cash_flow", "当前自由现金流（亿元）"],
          ["growth_rate", "显性期年增长率（%）"],
          ["years", "显性预测年数"],
          ["terminal_growth_rate", "永续增长率（%）"],
          ["discount_rate", "折现率/WACC（%）"],
          ["net_debt", "净债务（亿元，可为负）"],
          ["shares_outstanding", "总股本（亿股）"],
        ], draft)}
        ${renderValuationModelFields("ddm", "DDM 股利折现", [
          ["dividend_per_share", "下一年每股股利（元）"],
          ["dividend_growth_rate", "股利长期增长率（%）"],
          ["cost_of_equity", "股权成本（%）"],
        ], draft)}
        ${renderValuationModelFields("pe", "PE 市盈率估值", [
          ["eps", "每股收益 EPS（元）"],
          ["target_pe", "目标 PE（倍）"],
        ], draft)}
        ${renderValuationModelFields("peg", "PEG 成长估值", [
          ["eps", "每股收益 EPS（元）"],
          ["eps_growth_rate", "未来盈利增速（%）"],
          ["target_peg", "目标 PEG"],
        ], draft)}
        ${renderValuationModelFields("ev_ebitda", "EV/EBITDA 企业价值倍数", [
          ["ebitda", "EBITDA（亿元）"],
          ["target_ev_ebitda", "目标 EV/EBITDA（倍）"],
          ["net_debt", "净债务（亿元，可为负）"],
          ["shares_outstanding", "总股本（亿股）"],
        ], draft)}
      </section>

      <section class="panel valuation-output-panel">
        <div class="panel-head">
          <h2>估值结果</h2>
          <span>保存后会进入估值列表，也会在新增股票时自动带入股票池估值区间</span>
        </div>
        ${renderValuationOutput(draft)}
        <label class="valuation-note"><span>估值备注</span><textarea class="textarea" name="note" rows="4" placeholder="记录关键假设、可比公司、风险点或调参原因">${escapeHtml(draft.note || "")}</textarea></label>
      </section>
    </form>
  `;
}

function renderValuationModelFields(methodKey, title, fields, draft) {
  const active = draft.methods.includes(methodKey);
  return `
    <article class="panel valuation-model-card ${active ? "active" : ""}">
      <div class="panel-head"><h2>${title}</h2><span>${active ? "已纳入计算" : "未选择"}</span></div>
      <div class="valuation-field-grid">
        ${fields.map(([key, label]) => `
          <label>
            <span>${label}</span>
            <input class="input" name="${methodKey}.${key}" type="number" step="0.0001" value="${escapeAttr(draft.inputs?.[methodKey]?.[key] ?? "")}">
          </label>
        `).join("")}
      </div>
    </article>
  `;
}

function renderValuationOutput(draft) {
  const results = draft.method_results || {};
  const resultRows = Object.entries(results).filter(([, value]) => Number.isFinite(Number(value)));
  return `
    <div class="valuation-final-grid">
      ${renderStat("低估线", formatCurrency(draft.low_price), "", "合理价值扣除安全边际")}
      ${renderStat("合理价值", formatCurrency(draft.fair_price), "", "所选有效模型的平均值")}
      ${renderStat("高估线", formatCurrency(draft.high_price), "", "合理价值加上高估溢价")}
    </div>
    <div class="valuation-method-results">
      ${resultRows.length ? resultRows.map(([method, value]) => `
        <span><b>${escapeHtml(valuationMethodLabelClient(method))}</b>${formatCurrency(value)}</span>
      `).join("") : `<div class="empty-inline">填写数据后点击“重新计算”</div>`}
    </div>
  `;
}

function valuationMethodLabelClient(method) {
  return {
    dcf: "DCF",
    ddm: "DDM",
    pe: "PE",
    peg: "PEG",
    ev_ebitda: "EV/EBITDA",
  }[method] || method;
}

function valuationSourceLabelClient(source) {
  if (source === "pdf") return "PDF 回填";
  if (source === "tushare") return "TuShare 回填";
  return "手动录入";
}

function collectValuationDraftFromForm() {
  const form = document.querySelector('[data-form="valuation-workbench"]');
  const draft = state.valuationDraft || createValuationDraft();
  if (!form) {
    return draft;
  }
  const data = new FormData(form);
  const methods = data.getAll("methods").map(String);
  const inputs = defaultValuationInputs();
  for (const [key, value] of data.entries()) {
    if (!key.includes(".")) {
      continue;
    }
    const [method, field] = key.split(".");
    if (!inputs[method]) {
      inputs[method] = {};
    }
    inputs[method][field] = value;
  }
  return {
    ...draft,
    ts_code: String(data.get("ts_code") || "").trim(),
    name: String(data.get("name") || "").trim(),
    methods,
    inputs,
    safety_margin_pct: Number(data.get("safety_margin_pct") || 20),
    overvaluation_margin_pct: Number(data.get("overvaluation_margin_pct") || 20),
    note: String(data.get("note") || "").trim(),
  };
}

function calculateValuationDraft(draft) {
  const methodResults = {};
  for (const method of draft.methods || []) {
    const value = calculateValuationMethod(method, draft.inputs?.[method] || {});
    if (Number.isFinite(Number(value)) && Number(value) > 0) {
      methodResults[method] = roundClient(value, 2);
    }
  }
  const values = Object.values(methodResults).map(Number).filter(Number.isFinite);
  const fair = values.length ? roundClient(values.reduce((sum, value) => sum + value, 0) / values.length, 2) : null;
  const safety = Number(draft.safety_margin_pct || 0) / 100;
  const over = Number(draft.overvaluation_margin_pct || 0) / 100;
  return {
    ...draft,
    method_results: methodResults,
    fair_price: fair,
    low_price: fair == null ? null : roundClient(fair * (1 - safety), 2),
    high_price: fair == null ? null : roundClient(fair * (1 + over), 2),
  };
}

function calculateValuationMethod(method, inputs) {
  const n = (key) => Number(inputs?.[key]);
  if (method === "dcf") {
    const fcf = n("free_cash_flow");
    const growth = n("growth_rate") / 100;
    const years = Math.max(1, Math.min(20, Math.round(n("years") || 5)));
    const terminalGrowth = n("terminal_growth_rate") / 100;
    const discount = n("discount_rate") / 100;
    const netDebt = n("net_debt") || 0;
    const shares = n("shares_outstanding");
    if (![fcf, growth, terminalGrowth, discount, shares].every(Number.isFinite) || shares <= 0 || discount <= terminalGrowth) {
      return null;
    }
    let pv = 0;
    let current = fcf;
    for (let year = 1; year <= years; year += 1) {
      current *= (1 + growth);
      pv += current / ((1 + discount) ** year);
    }
    const terminalValue = (current * (1 + terminalGrowth)) / (discount - terminalGrowth);
    const terminalPv = terminalValue / ((1 + discount) ** years);
    return (pv + terminalPv - netDebt) / shares;
  }
  if (method === "ddm") {
    const dividend = n("dividend_per_share");
    const growth = n("dividend_growth_rate") / 100;
    const cost = n("cost_of_equity") / 100;
    if (![dividend, growth, cost].every(Number.isFinite) || dividend <= 0 || cost <= growth) {
      return null;
    }
    return dividend / (cost - growth);
  }
  if (method === "pe") {
    const eps = n("eps");
    const pe = n("target_pe");
    return Number.isFinite(eps) && Number.isFinite(pe) && eps > 0 && pe > 0 ? eps * pe : null;
  }
  if (method === "peg") {
    const eps = n("eps");
    const growthPct = n("eps_growth_rate");
    const peg = n("target_peg");
    return Number.isFinite(eps) && Number.isFinite(growthPct) && Number.isFinite(peg) && eps > 0 && growthPct > 0 && peg > 0
      ? eps * growthPct * peg
      : null;
  }
  if (method === "ev_ebitda") {
    const ebitda = n("ebitda");
    const multiple = n("target_ev_ebitda");
    const netDebt = n("net_debt") || 0;
    const shares = n("shares_outstanding");
    return Number.isFinite(ebitda) && Number.isFinite(multiple) && Number.isFinite(shares) && ebitda > 0 && multiple > 0 && shares > 0
      ? ((ebitda * multiple) - netDebt) / shares
      : null;
  }
  return null;
}

function mergeValuationExtractToDraft(draft, payload, fileName) {
  const extracted = payload?.extracted || {};
  const next = createValuationDraft({
    ...draft,
    source: "pdf",
    pdf_file_name: fileName || draft.pdf_file_name,
    inputs: draft.inputs,
  });
  const setIfValue = (method, key, value) => {
    if (value !== null && value !== undefined && value !== "") {
      next.inputs[method][key] = value;
    }
  };
  setIfValue("dcf", "free_cash_flow", extracted.free_cash_flow);
  setIfValue("dcf", "net_debt", extracted.net_debt);
  setIfValue("dcf", "shares_outstanding", extracted.shares_outstanding);
  setIfValue("ddm", "dividend_per_share", extracted.dividend_per_share);
  setIfValue("pe", "eps", extracted.eps);
  setIfValue("peg", "eps", extracted.eps);
  setIfValue("peg", "eps_growth_rate", extracted.eps_growth_rate || extracted.net_profit_growth_rate);
  setIfValue("ev_ebitda", "ebitda", extracted.ebitda);
  setIfValue("ev_ebitda", "net_debt", extracted.net_debt);
  setIfValue("ev_ebitda", "shares_outstanding", extracted.shares_outstanding);
  if (!next.note && payload?.notes?.length) {
    next.note = payload.notes.join("；");
  }
  return next;
}

function valuationMethodDefinitions() {
  return [
    {
      key: "dcf",
      label: "DCF",
      name: "现金流折现",
      suitable: "适合现金流稳定、资本开支可预测、经营生命周期较长的企业。",
      formula: "每股价值 = (未来自由现金流现值 + 终值现值 - 净债务) / 总股本",
      meaning: "把企业未来能产生的自由现金流折现回今天，强调企业本身能赚到的现金。",
    },
    {
      key: "ddm",
      label: "DDM",
      name: "股利折现",
      suitable: "适合高分红、分红政策稳定的银行、公用事业、成熟消费类企业。",
      formula: "每股价值 = 下一年每股股利 / (股权成本 - 股利增长率)",
      meaning: "把未来股息折现成今天的价值，适合把分红视作主要回报来源的公司。",
    },
    {
      key: "pe",
      label: "PE",
      name: "市盈率估值",
      suitable: "适合盈利稳定、行业可比公司较多、商业模式成熟的企业。",
      formula: "每股价值 = 每股收益 EPS × 目标 PE",
      meaning: "用市场愿意给这类利润的倍数估算价值，简单直观但依赖可比倍数质量。",
    },
    {
      key: "peg",
      label: "PEG",
      name: "成长调整市盈率",
      suitable: "适合成长股，尤其是盈利增速仍较高但需要约束估值泡沫的公司。",
      formula: "每股价值 = EPS × 目标 PEG × 未来盈利增速百分数",
      meaning: "把 PE 与增长速度放在一起看，避免只看高增长而忽略估值过贵。",
    },
    {
      key: "ev_ebitda",
      label: "EV/EBITDA",
      name: "企业价值倍数",
      suitable: "适合重资产、跨资本结构比较、折旧摊销差异较大的企业。",
      formula: "每股价值 = (EBITDA × 目标倍数 - 净债务) / 总股本",
      meaning: "从企业整体价值出发，再扣除债务分配给股东，便于比较杠杆不同的公司。",
    },
  ];
}

function defaultValuationInputs() {
  return {
    financial: {
      report_period: "",
      revenue: "",
      revenue_prev: "",
      gross_profit: "",
      net_profit_parent: "",
      net_profit_parent_prev: "",
      income_tax_expense: "",
      interest_expense: "",
      depreciation_amortization: "",
      ebitda_reported: "",
      operating_cash_flow: "",
      operating_cash_flow_prev: "",
      capital_expenditure: "",
      capital_expenditure_prev: "",
      free_cash_flow_reported: "",
      cash_and_equivalents: "",
      short_term_borrowing: "",
      non_current_liab_due_1y: "",
      long_term_borrowing: "",
      bonds_payable: "",
      lease_liabilities: "",
      total_shares: "",
      eps_reported: "",
      eps_prev: "",
      cash_dividend: "",
      dividend_per_share_reported: "",
      dividend_per_share_prev: "",
    },
    derived: {
      free_cash_flow: "",
      free_cash_flow_growth_rate: "",
      revenue_growth_rate: "",
      net_profit_growth_rate: "",
      eps: "",
      eps_growth_rate: "",
      dividend_per_share: "",
      dividend_growth_rate: "",
      net_debt: "",
      ebitda: "",
      gross_margin: "",
      net_margin: "",
    },
    dcf: { growth_rate: "", years: 5, terminal_growth_rate: 2, discount_rate: 10 },
    ddm: { cost_of_equity: 8, dividend_growth_rate: "" },
    pe: { target_pe: "" },
    peg: { target_peg: 1, eps_growth_rate: "" },
    ev_ebitda: { target_ev_ebitda: "" },
  };
}

function valuationFinancialFieldGroups() {
  return [
    {
      title: "利润表",
      fields: [
        ["report_period", "报告期"],
        ["revenue", "营业收入（亿元）"],
        ["revenue_prev", "上年同期营业收入（亿元）"],
        ["gross_profit", "毛利（亿元）"],
        ["net_profit_parent", "归母净利润（亿元）"],
        ["net_profit_parent_prev", "上年同期归母净利润（亿元）"],
        ["income_tax_expense", "所得税费用（亿元）"],
        ["interest_expense", "利息费用（亿元）"],
        ["depreciation_amortization", "折旧摊销（亿元）"],
        ["ebitda_reported", "披露 EBITDA（亿元）"],
      ],
    },
    {
      title: "现金流量表",
      fields: [
        ["operating_cash_flow", "经营活动现金流净额（亿元）"],
        ["operating_cash_flow_prev", "上年经营现金流净额（亿元）"],
        ["capital_expenditure", "购建长期资产现金支出（亿元）"],
        ["capital_expenditure_prev", "上年购建长期资产现金支出（亿元）"],
        ["free_cash_flow_reported", "披露自由现金流（亿元）"],
      ],
    },
    {
      title: "资产负债表",
      fields: [
        ["cash_and_equivalents", "货币资金及现金等价物（亿元）"],
        ["short_term_borrowing", "短期借款（亿元）"],
        ["non_current_liab_due_1y", "一年内到期非流动负债（亿元）"],
        ["long_term_borrowing", "长期借款（亿元）"],
        ["bonds_payable", "应付债券（亿元）"],
        ["lease_liabilities", "租赁负债（亿元）"],
      ],
    },
    {
      title: "股本与分红",
      fields: [
        ["total_shares", "总股本（亿股）"],
        ["eps_reported", "披露 EPS（元）"],
        ["eps_prev", "上年 EPS（元）"],
        ["cash_dividend", "现金分红总额（亿元）"],
        ["dividend_per_share_reported", "披露每股股利（元）"],
        ["dividend_per_share_prev", "上年每股股利（元）"],
      ],
    },
  ];
}

function valuationDerivedFieldGroups() {
  return [
    {
      title: "自动推导指标",
      fields: [
        ["free_cash_flow", "5年规范化自由现金流（亿元）"],
        ["free_cash_flow_growth_rate", "5年自由现金流趋势（%）"],
        ["revenue_growth_rate", "5年收入趋势（%）"],
        ["net_profit_growth_rate", "5年归母净利润趋势（%）"],
        ["eps", "每股收益 EPS（元）"],
        ["eps_growth_rate", "5年 EPS 趋势（%）"],
        ["dividend_per_share", "每股股利（元）"],
        ["dividend_growth_rate", "5年股利趋势（%）"],
        ["net_debt", "净债务（亿元）"],
        ["ebitda", "EBITDA（亿元）"],
        ["gross_margin", "毛利率（%）"],
        ["net_margin", "净利率（%）"],
      ],
    },
  ];
}

function valuationModelFieldDefinitions(methodKey) {
  return {
    dcf: {
      title: "DCF 现金流折现",
      fields: [
        ["growth_rate", "显性期自由现金流增速（%）"],
        ["years", "显性预测年数"],
        ["terminal_growth_rate", "永续增长率（%）"],
        ["discount_rate", "折现率 WACC（%）"],
      ],
    },
    ddm: {
      title: "DDM 股利折现",
      fields: [
        ["dividend_growth_rate", "长期股利增长率（%）"],
        ["cost_of_equity", "股权成本（%）"],
      ],
    },
    pe: { title: "PE 市盈率估值", fields: [["target_pe", "目标 PE（倍）"]] },
    peg: {
      title: "PEG 成长估值",
      fields: [
        ["eps_growth_rate", "未来盈利增速（%）"],
        ["target_peg", "目标 PEG"],
      ],
    },
    ev_ebitda: { title: "EV/EBITDA 企业价值倍数", fields: [["target_ev_ebitda", "目标 EV/EBITDA（倍）"]] },
  }[methodKey];
}

function createValuationDraft(source = {}) {
  return {
    _route_id: source._route_id || source.id || "new",
    id: source.id || "",
    ts_code: source.ts_code || "",
    name: source.name || "",
    methods: source.methods?.length ? source.methods : ["dcf", "pe"],
    inputs: mergeValuationInputs(defaultValuationInputs(), source.inputs || {}),
    method_results: source.method_results || {},
    fair_price: source.fair_price ?? null,
    low_price: source.low_price ?? null,
    high_price: source.high_price ?? null,
    safety_margin_pct: DEFAULT_VALUATION_BAND_PCT,
    overvaluation_margin_pct: DEFAULT_VALUATION_BAND_PCT,
    source: source.source || "manual",
    pdf_file_name: source.pdf_file_name || "",
    note: source.note || "",
  };
}

function mergeValuationInputs(base, extra) {
  const output = JSON.parse(JSON.stringify(base));
  Object.entries(extra || {}).forEach(([group, values]) => {
    output[group] = { ...(output[group] || {}), ...(values || {}) };
  });

  const legacyDcf = extra?.dcf || {};
  const legacyPe = extra?.pe || {};
  const legacyPeg = extra?.peg || {};
  const legacyDdm = extra?.ddm || {};
  const legacyEv = extra?.ev_ebitda || {};
  if (legacyDcf.free_cash_flow) output.derived.free_cash_flow = output.derived.free_cash_flow || legacyDcf.free_cash_flow;
  if (legacyDcf.net_debt) output.derived.net_debt = output.derived.net_debt || legacyDcf.net_debt;
  if (legacyDcf.shares_outstanding) output.financial.total_shares = output.financial.total_shares || legacyDcf.shares_outstanding;
  if (legacyPe.eps) output.derived.eps = output.derived.eps || legacyPe.eps;
  if (legacyPeg.eps_growth_rate) output.derived.eps_growth_rate = output.derived.eps_growth_rate || legacyPeg.eps_growth_rate;
  if (legacyDdm.dividend_per_share) output.derived.dividend_per_share = output.derived.dividend_per_share || legacyDdm.dividend_per_share;
  if (legacyDdm.dividend_growth_rate) output.derived.dividend_growth_rate = output.derived.dividend_growth_rate || legacyDdm.dividend_growth_rate;
  if (legacyEv.ebitda) output.derived.ebitda = output.derived.ebitda || legacyEv.ebitda;
  if (legacyEv.net_debt) output.derived.net_debt = output.derived.net_debt || legacyEv.net_debt;
  if (legacyEv.shares_outstanding) output.financial.total_shares = output.financial.total_shares || legacyEv.shares_outstanding;
  return output;
}

function renderValuationList() {
  const rows = filterRowsByQuery(state.valuations || [], state.valuationQuery, ["name", "ts_code", "methods", "note"]);
  app.innerHTML = `
    ${renderToast()}
    <section class="valuation-hero">
      <div>
        <p class="eyebrow">Valuation Workbench</p>
        <h1>先估值，再谈买入</h1>
        <p>价值投资的核心不是预测明天涨跌，而是持续回答三个问题：企业值多少钱、现在价格给了多少安全边际、当假设变化时估值是否也要变化。</p>
      </div>
      <a class="button primary" href="#/valuation/new">新建估值</a>
    </section>

    <section class="panel valuation-list-panel">
      <div class="panel-head">
        <h2>估值结果列表</h2>
        <span>${rows.length} / ${(state.valuations || []).length} 条</span>
      </div>
      ${renderListSearch("valuation", state.valuationQuery, "输入股票名称、代码或估值备注")}
      ${renderValuationRows(rows)}
    </section>
  `;
}

function renderValuationRows(rows) {
  if (!rows.length) {
    return `<div class="empty-inline">还没有保存过估值结果</div>`;
  }
  return `
    <div class="valuation-result-table">
      <div class="valuation-result-head">
        <span>股票</span>
        <span>估值区间</span>
        <span>方法</span>
        <span>来源</span>
        <span>时间</span>
        <span>操作</span>
      </div>
      ${rows.map((item) => `
        <article class="valuation-result-row">
          <span><strong>${escapeHtml(item.name || item.ts_code)}</strong><small>${escapeHtml(item.ts_code || "")}</small></span>
          <span><strong>${formatCurrency(item.fair_price)}</strong><small>低 ${formatCurrency(item.low_price)} / 高 ${formatCurrency(item.high_price)}</small></span>
          <span>${renderValuationMethodTags(item.methods || [])}</span>
          <span>${escapeHtml(item.source === "pdf" ? "PDF 回填" : "手动录入")}</span>
          <span>${formatDateTime(item.created_at)}</span>
          <span class="row-actions">
            <a class="button small" href="#/valuation/${encodeURIComponent(item.id)}">查看</a>
            <button class="button small" data-action="open-stock" data-code="${escapeAttr(item.ts_code || "")}">股票</button>
          </span>
        </article>
      `).join("")}
    </div>
  `;
}

function renderValuationMethodTags(methods) {
  return `<span class="analysis-tags">${(methods || []).map((method) => `<span>${escapeHtml(valuationMethodLabelClient(method))}</span>`).join("")}</span>`;
}

function renderValuationWorkspace(id) {
  const routeId = id || "new";
  if (!state.valuationDraft || state.valuationDraft._route_id !== routeId) {
    const source = id && id !== "new" ? (state.valuations || []).find((item) => item.id === id) || {} : {};
    state.valuationDraft = { ...createValuationDraft(source), _route_id: routeId };
    state.valuationStockResults = [];
    state.valuationStockError = "";
  }
  const draft = state.valuationDraft;
  app.innerHTML = `
    ${renderToast()}
    <section class="valuation-hero">
      <div>
        <a class="back-link" href="#/valuations">返回估值列表</a>
        <p class="eyebrow">Intrinsic Value</p>
        <h1>${draft.id ? "查看估值结果" : "新建估值"}</h1>
        <p>估值先从财报原始字段开始，再推导自由现金流、EPS、增长率、净债务等关键指标，最后进入模型假设。数字可以自动推导，也可以人工修正。</p>
      </div>
      <div class="head-actions">
        <button class="button soft" data-action="derive-valuation-inputs">推导财报指标</button>
        <button class="button primary" data-action="save-valuation" ${state.valuationSaving ? "disabled" : ""}>保存估值结果</button>
      </div>
    </section>

    ${renderValuationForm(draft)}
  `;
}

function renderValuationForm(draft) {
  return `
    <form class="valuation-workbench" data-form="valuation-workbench">
      <section class="panel valuation-input-panel">
        <div class="panel-head">
          <h2>基础信息与数据回填</h2>
          <span>只输入股票名称即可；联想结果会自动带出股票代码。</span>
        </div>
        <div class="valuation-basic-grid single">
          ${renderValuationStockSearch(draft)}
        </div>
        <div class="valuation-pdf-row">
          <label><span>上传财报 PDF</span><input class="input" type="file" name="valuation_pdf" accept="application/pdf"></label>
          <button class="button soft" type="button" data-action="extract-valuation-pdf" ${state.valuationPdfLoading ? "disabled" : ""}>${state.valuationPdfLoading ? "提取中..." : "用 Gemini 回填财报字段"}</button>
          <small>${draft.pdf_file_name ? `已回填：${escapeHtml(draft.pdf_file_name)}` : "上传年报或半年报 PDF，系统会尽量抽取最细财报字段，回填后仍建议人工复核。"}</small>
        </div>
      </section>

      <section class="panel valuation-input-panel">
        <div class="panel-head">
          <h2>财报原始字段</h2>
          <span>金额单位默认亿元；股本单位默认亿股。越接近原始财报口径，推导越可复核。</span>
        </div>
        ${valuationFinancialFieldGroups().map((group) => renderValuationDataGroup("financial", group, draft)).join("")}
      </section>

      <section class="panel valuation-input-panel">
        <div class="panel-head">
          <h2>推导指标</h2>
          <span>由财报字段自动推导，可直接修改；修改后模型会使用你的修正值。</span>
        </div>
        ${valuationDerivedFieldGroups().map((group) => renderValuationDataGroup("derived", group, draft)).join("")}
      </section>

      ${renderValuationMethodSelector(draft)}

      <section class="valuation-model-grid">
        ${(draft.methods || []).length
          ? draft.methods.map((method) => renderValuationModelFields(method, draft)).join("")
          : `<div class="empty-inline">先勾选至少一种估值方法，再填写对应模型假设。</div>`}
      </section>

      <section class="panel valuation-output-panel">
        <div class="panel-head">
          <h2>估值结果</h2>
          <span>低估线/高估线使用系统默认上下 20% 区间，保存后会自动用于新增股票时的股票池估值。</span>
        </div>
        ${renderValuationOutput(draft)}
        <label class="valuation-note"><span>估值备注</span><textarea class="textarea" name="note" rows="4" placeholder="记录关键假设、可比公司、风险点或调参原因">${escapeHtml(draft.note || "")}</textarea></label>
      </section>
    </form>
  `;
}

function renderValuationStockSearch(draft) {
  return `
    <div class="valuation-stock-search">
      <label>
        <span>股票名称</span>
        <input class="input" name="name" data-valuation-stock-search="1" value="${escapeAttr(draft.name || "")}" placeholder="输入股票名称或代码，例如 牧原股份 / 002714" autocomplete="off" required>
        <input type="hidden" name="ts_code" value="${escapeAttr(draft.ts_code || "")}">
      </label>
      <small>${draft.ts_code ? `已选择：${escapeHtml(draft.ts_code)}` : state.valuationStockLoading ? "正在搜索股票..." : "输入后从联想结果中选择股票，代码会自动带入。"}</small>
      ${renderValuationStockSuggestions()}
    </div>
  `;
}

function renderValuationStockSuggestions() {
  if (state.valuationStockError) {
    return `<div class="valuation-suggestions muted">${escapeHtml(state.valuationStockError)}</div>`;
  }
  if (!state.valuationStockResults.length) {
    return "";
  }
  return `
    <div class="valuation-suggestions">
      ${state.valuationStockResults.map((stock) => `
        <button type="button" data-action="select-valuation-stock" data-code="${escapeAttr(stock.ts_code)}" data-name="${escapeAttr(stock.name)}">
          <strong>${escapeHtml(stock.name)}</strong>
          <span>${escapeHtml([stock.ts_code, stock.industry || stock.area].filter(Boolean).join(" / "))}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function renderValuationDataGroup(sectionKey, group, draft) {
  return `
    <div class="valuation-data-group">
      <h3>${escapeHtml(group.title)}</h3>
      <div class="valuation-data-grid">
        ${group.fields.map(([key, label]) => `
          <label>
            <span>${escapeHtml(label)}</span>
            <input class="input" name="${sectionKey}.${key}" ${key === "report_period" ? "type=\"text\"" : "type=\"number\" step=\"0.0001\""} value="${escapeAttr(draft.inputs?.[sectionKey]?.[key] ?? "")}">
          </label>
        `).join("")}
      </div>
    </div>
  `;
}

function renderValuationMethodSelector(draft) {
  return `
    <section class="panel valuation-method-panel">
      <div class="panel-head">
        <h2>第二步：选择估值方法</h2>
        <span>勾选后才显示对应填写模块。</span>
      </div>
      <div class="valuation-method-picker">
        ${valuationMethodDefinitions().map((method) => `
          <label>
            <input type="checkbox" name="methods" value="${method.key}" ${draft.methods.includes(method.key) ? "checked" : ""}>
            <strong>${method.label} · ${method.name}</strong>
            <span>${method.meaning}</span>
            <small>适合：${method.suitable}</small>
            <code>${method.formula}</code>
          </label>
        `).join("")}
      </div>
    </section>
  `;
}

function renderValuationModelFields(methodKey, draft) {
  const definition = valuationModelFieldDefinitions(methodKey);
  if (!definition) {
    return "";
  }
  const aiReason = draft.inputs?.dcf?.ai_reason || "";
  return `
    <article class="panel valuation-model-card active">
      <div class="panel-head">
        <div>
          <h2>${definition.title}</h2>
          <span>${escapeHtml(valuationMethodLabelClient(methodKey))}</span>
        </div>
        ${methodKey === "dcf" ? `
          <button class="button soft small" type="button" data-action="ai-valuation-assumptions" ${state.valuationAiAssumptionLoading ? "disabled" : ""}>${state.valuationAiAssumptionLoading ? "AI 推理中..." : "AI预测增长率"}</button>
        ` : ""}
      </div>
      <div class="valuation-field-grid">
        ${definition.fields.map(([key, label]) => `
          <label>
            <span>${escapeHtml(label)}</span>
            <input class="input" name="${methodKey}.${key}" type="number" step="0.0001" value="${escapeAttr(draft.inputs?.[methodKey]?.[key] ?? "")}">
          </label>
        `).join("")}
      </div>
      ${methodKey === "dcf" ? `
        ${renderDcfIndustryAssumptionGuide()}
        <input type="hidden" name="dcf.ai_reason" value="${escapeAttr(aiReason)}">
        ${aiReason ? `<p class="valuation-ai-reason">${escapeHtml(aiReason)}</p>` : ""}
      ` : ""}
    </article>
  `;
}

function dcfIndustryAssumptionBenchmarks() {
  return [
    {
      industry: "公用事业 / 电力运营",
      terminal: "0.5% - 1.5%",
      discount: "6.5% - 8.5%",
      note: "现金流稳定但长期成长低，永续增长不宜乐观。",
    },
    {
      industry: "成熟消费 / 医药龙头",
      terminal: "1.5% - 2.5%",
      discount: "7.5% - 9.5%",
      note: "品牌、渠道和现金流质量较好，可给中等偏低折现率。",
    },
    {
      industry: "金融 / 银行 / 保险",
      terminal: "1.0% - 2.5%",
      discount: "8.0% - 11.0%",
      note: "更适合用股权成本口径，需额外关注资产质量和资本约束。",
    },
    {
      industry: "传统制造 / 工业设备",
      terminal: "1.0% - 2.0%",
      discount: "8.5% - 11.0%",
      note: "看订单稳定性、资本开支强度和利润率波动。",
    },
    {
      industry: "成长科技 / 新能源设备",
      terminal: "2.0% - 3.5%",
      discount: "9.0% - 12.0%",
      note: "显性期增长可以较高，但永续增长仍应回归长期经济增速附近。",
    },
    {
      industry: "周期资源 / 化工 / 材料",
      terminal: "0% - 1.5%",
      discount: "10.0% - 14.0%",
      note: "利润受价格周期影响大，DCF 应尽量用周期中枢现金流。",
    },
    {
      industry: "小盘 / 高不确定成长",
      terminal: "0% - 2.0%",
      discount: "12.0% - 16.0%",
      note: "折现率需要补偿商业模式、融资和兑现风险。",
    },
  ];
}

function renderDcfIndustryAssumptionGuide() {
  return `
    <div class="dcf-assumption-guide">
      <div class="dcf-assumption-guide-head">
        <strong>行业参考假设</strong>
        <span>用于校验永续增长率和折现率，不是自动估值结论。</span>
      </div>
      <div class="dcf-assumption-table">
        <div class="dcf-assumption-row head">
          <span>行业类型</span>
          <span>永续增长率</span>
          <span>折现率 / WACC</span>
          <span>使用提醒</span>
        </div>
        ${dcfIndustryAssumptionBenchmarks().map((item) => `
          <div class="dcf-assumption-row">
            <strong>${escapeHtml(item.industry)}</strong>
            <span>${escapeHtml(item.terminal)}</span>
            <span>${escapeHtml(item.discount)}</span>
            <em>${escapeHtml(item.note)}</em>
          </div>
        `).join("")}
      </div>
      <p>原则：永续增长率通常不应长期高于名义 GDP 增速；折现率必须显著高于永续增长率。成长股的高增速主要放在显性预测期，不应全部放进永续期。</p>
    </div>
  `;
}

function renderValuationOutput(draft) {
  const results = draft.method_results || {};
  const resultRows = Object.entries(results).filter(([, value]) => Number.isFinite(Number(value)));
  return `
    <div class="valuation-final-grid">
      ${renderStat("低估线", formatCurrency(draft.low_price), "", "合理价值下浮 20%")}
      ${renderStat("合理价值", formatCurrency(draft.fair_price), "", "所选有效模型的平均值")}
      ${renderStat("高估线", formatCurrency(draft.high_price), "", "合理价值上浮 20%")}
    </div>
    <div class="valuation-method-results">
      ${resultRows.length ? resultRows.map(([method, value]) => `
        <span><b>${escapeHtml(valuationMethodLabelClient(method))}</b>${formatCurrency(value)}</span>
      `).join("") : `<div class="empty-inline">填写财报字段和模型假设后点击“重新计算”。</div>`}
    </div>
  `;
}

function valuationMethodLabelClient(method) {
  return {
    dcf: "DCF",
    ddm: "DDM",
    pe: "PE",
    peg: "PEG",
    ev_ebitda: "EV/EBITDA",
  }[method] || method;
}

function collectValuationDraftFromForm() {
  const form = document.querySelector('[data-form="valuation-workbench"]');
  const draft = state.valuationDraft || createValuationDraft();
  if (!form) {
    return draft;
  }
  const data = new FormData(form);
  const methods = data.getAll("methods").map(String);
  const inputs = defaultValuationInputs();
  for (const [key, value] of data.entries()) {
    if (!key.includes(".")) {
      continue;
    }
    const [group, field] = key.split(".");
    if (!inputs[group]) {
      inputs[group] = {};
    }
    inputs[group][field] = value;
  }
  return {
    ...draft,
    ts_code: String(data.get("ts_code") || "").trim(),
    name: String(data.get("name") || "").trim(),
    methods,
    inputs,
    safety_margin_pct: DEFAULT_VALUATION_BAND_PCT,
    overvaluation_margin_pct: DEFAULT_VALUATION_BAND_PCT,
    note: String(data.get("note") || "").trim(),
  };
}

function calculateValuationDraft(draft) {
  const inputs = deriveValuationInputs(draft.inputs || {}, { overwrite: false });
  const methodResults = {};
  for (const method of draft.methods || []) {
    const value = calculateValuationMethod(method, inputs);
    if (Number.isFinite(Number(value)) && Number(value) > 0) {
      methodResults[method] = roundClient(value, 2);
    }
  }
  const values = Object.values(methodResults).map(Number).filter(Number.isFinite);
  const fair = values.length ? roundClient(values.reduce((sum, value) => sum + value, 0) / values.length, 2) : null;
  const band = DEFAULT_VALUATION_BAND_PCT / 100;
  return {
    ...draft,
    inputs,
    method_results: methodResults,
    fair_price: fair,
    low_price: fair == null ? null : roundClient(fair * (1 - band), 2),
    high_price: fair == null ? null : roundClient(fair * (1 + band), 2),
    safety_margin_pct: DEFAULT_VALUATION_BAND_PCT,
    overvaluation_margin_pct: DEFAULT_VALUATION_BAND_PCT,
  };
}

function deriveValuationInputs(inputs, options = {}) {
  const next = mergeValuationInputs(defaultValuationInputs(), inputs || {});
  const f = next.financial || {};
  const d = next.derived || {};
  const overwrite = Boolean(options.overwrite);
  const setDerived = (key, value) => setValuationValue(d, key, value, overwrite);
  const setModel = (group, key, value) => setValuationValue(next[group], key, value, overwrite);
  const revenue = valuationNumber(f.revenue);
  const revenuePrev = valuationNumber(f.revenue_prev);
  const netProfit = valuationNumber(f.net_profit_parent);
  const netProfitPrev = valuationNumber(f.net_profit_parent_prev);
  const ocf = valuationNumber(f.operating_cash_flow);
  const ocfPrev = valuationNumber(f.operating_cash_flow_prev);
  const capex = valuationNumber(f.capital_expenditure);
  const capexPrev = valuationNumber(f.capital_expenditure_prev);
  const shares = valuationNumber(f.total_shares);
  const cash = valuationNumber(f.cash_and_equivalents);
  const debtParts = [f.short_term_borrowing, f.non_current_liab_due_1y, f.long_term_borrowing, f.bonds_payable, f.lease_liabilities].map(valuationNumber).filter((value) => value !== null);
  const debt = debtParts.length ? debtParts.reduce((sum, value) => sum + value, 0) : null;
  const reportedFcf = valuationNumber(f.free_cash_flow_reported);
  const currentFcf = reportedFcf ?? (ocf !== null && capex !== null ? ocf - Math.abs(capex) : null);
  const previousFcf = ocfPrev !== null && capexPrev !== null ? ocfPrev - Math.abs(capexPrev) : null;
  const eps = valuationNumber(f.eps_reported) ?? (netProfit !== null && shares ? netProfit / shares : null);
  const dividend = valuationNumber(f.dividend_per_share_reported)
    ?? (valuationNumber(f.cash_dividend) !== null && shares ? valuationNumber(f.cash_dividend) / shares : null);
  const ebitda = valuationNumber(f.ebitda_reported)
    ?? sumIfAllFinite([netProfit, valuationNumber(f.income_tax_expense), valuationNumber(f.interest_expense), valuationNumber(f.depreciation_amortization)]);

  setDerived("free_cash_flow", currentFcf);
  setDerived("free_cash_flow_growth_rate", pctChange(currentFcf, previousFcf));
  setDerived("revenue_growth_rate", pctChange(revenue, revenuePrev));
  setDerived("net_profit_growth_rate", pctChange(netProfit, netProfitPrev));
  setDerived("eps", eps);
  setDerived("eps_growth_rate", pctChange(eps, valuationNumber(f.eps_prev)));
  setDerived("dividend_per_share", dividend);
  setDerived("dividend_growth_rate", pctChange(dividend, valuationNumber(f.dividend_per_share_prev)));
  setDerived("net_debt", debt !== null && cash !== null ? debt - cash : null);
  setDerived("ebitda", ebitda);
  setDerived("gross_margin", revenue ? (valuationNumber(f.gross_profit) / revenue) * 100 : null);
  setDerived("net_margin", revenue && netProfit !== null ? (netProfit / revenue) * 100 : null);
  setModel("dcf", "growth_rate", firstValuationNumber(d.free_cash_flow_growth_rate, d.net_profit_growth_rate, d.revenue_growth_rate));
  setModel("ddm", "dividend_growth_rate", d.dividend_growth_rate);
  setModel("peg", "eps_growth_rate", d.eps_growth_rate);
  return next;
}

function setValuationValue(target, key, value, overwrite) {
  if (!target || value === null || value === undefined || !Number.isFinite(Number(value))) {
    return;
  }
  if (!overwrite && valuationNumber(target[key]) !== null) {
    return;
  }
  target[key] = roundClient(value, 4);
}

function valuationNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function firstValuationNumber(...values) {
  for (const value of values) {
    const number = valuationNumber(value);
    if (number !== null) {
      return number;
    }
  }
  return null;
}

function sumIfAllFinite(values) {
  if (values.some((value) => value === null || !Number.isFinite(Number(value)))) {
    return null;
  }
  return values.reduce((sum, value) => sum + Number(value), 0);
}

function pctChange(current, previous) {
  if (current === null || previous === null || !Number.isFinite(Number(current)) || !Number.isFinite(Number(previous)) || Number(previous) === 0) {
    return null;
  }
  return ((Number(current) - Number(previous)) / Math.abs(Number(previous))) * 100;
}

function calculateValuationMethod(method, inputs) {
  const f = inputs.financial || {};
  const d = inputs.derived || {};
  const m = inputs[method] || {};
  if (method === "dcf") {
    const fcf = valuationNumber(d.free_cash_flow);
    const growth = valuationNumber(m.growth_rate) / 100;
    const years = Math.max(1, Math.min(20, Math.round(valuationNumber(m.years) || 5)));
    const terminalGrowth = valuationNumber(m.terminal_growth_rate) / 100;
    const discount = valuationNumber(m.discount_rate) / 100;
    const netDebt = valuationNumber(d.net_debt) || 0;
    const shares = valuationNumber(f.total_shares);
    if (![fcf, growth, terminalGrowth, discount, shares].every(Number.isFinite) || shares <= 0 || discount <= terminalGrowth) {
      return null;
    }
    let pv = 0;
    let current = fcf;
    for (let year = 1; year <= years; year += 1) {
      current *= (1 + growth);
      pv += current / ((1 + discount) ** year);
    }
    const terminalValue = (current * (1 + terminalGrowth)) / (discount - terminalGrowth);
    const terminalPv = terminalValue / ((1 + discount) ** years);
    return (pv + terminalPv - netDebt) / shares;
  }
  if (method === "ddm") {
    const dividend = valuationNumber(d.dividend_per_share);
    const growth = valuationNumber(m.dividend_growth_rate) / 100;
    const cost = valuationNumber(m.cost_of_equity) / 100;
    if (![dividend, growth, cost].every(Number.isFinite) || dividend <= 0 || cost <= growth) {
      return null;
    }
    return dividend / (cost - growth);
  }
  if (method === "pe") {
    const eps = valuationNumber(d.eps);
    const pe = valuationNumber(m.target_pe);
    return eps !== null && pe !== null && eps > 0 && pe > 0 ? eps * pe : null;
  }
  if (method === "peg") {
    const eps = valuationNumber(d.eps);
    const growthPct = valuationNumber(m.eps_growth_rate);
    const peg = valuationNumber(m.target_peg);
    return eps !== null && growthPct !== null && peg !== null && eps > 0 && growthPct > 0 && peg > 0
      ? eps * growthPct * peg
      : null;
  }
  if (method === "ev_ebitda") {
    const ebitda = valuationNumber(d.ebitda);
    const multiple = valuationNumber(m.target_ev_ebitda);
    const netDebt = valuationNumber(d.net_debt) || 0;
    const shares = valuationNumber(f.total_shares);
    return ebitda !== null && multiple !== null && shares !== null && ebitda > 0 && multiple > 0 && shares > 0
      ? ((ebitda * multiple) - netDebt) / shares
      : null;
  }
  return null;
}

function mergeValuationExtractToDraft(draft, payload, fileName) {
  const extracted = payload?.extracted || {};
  const next = createValuationDraft({ ...draft, source: "pdf", pdf_file_name: fileName || draft.pdf_file_name, inputs: draft.inputs });
  const setFinancial = (key, ...values) => {
    const value = firstDefined(values);
    if (value !== undefined) next.inputs.financial[key] = value;
  };
  const setDerived = (key, ...values) => {
    const value = firstDefined(values);
    if (value !== undefined) next.inputs.derived[key] = value;
  };
  setFinancial("report_period", extracted.report_period || payload?.report_period);
  setFinancial("revenue", extracted.revenue);
  setFinancial("revenue_prev", extracted.revenue_prev, extracted.previous_revenue);
  setFinancial("gross_profit", extracted.gross_profit);
  setFinancial("net_profit_parent", extracted.net_profit_parent, extracted.net_profit);
  setFinancial("net_profit_parent_prev", extracted.net_profit_parent_prev, extracted.previous_net_profit);
  setFinancial("income_tax_expense", extracted.income_tax_expense);
  setFinancial("interest_expense", extracted.interest_expense);
  setFinancial("depreciation_amortization", extracted.depreciation_amortization);
  setFinancial("ebitda_reported", extracted.ebitda);
  setFinancial("operating_cash_flow", extracted.operating_cash_flow);
  setFinancial("operating_cash_flow_prev", extracted.operating_cash_flow_prev);
  setFinancial("capital_expenditure", extracted.capital_expenditure);
  setFinancial("capital_expenditure_prev", extracted.capital_expenditure_prev);
  setFinancial("free_cash_flow_reported", extracted.free_cash_flow);
  setFinancial("cash_and_equivalents", extracted.cash_and_equivalents);
  setFinancial("short_term_borrowing", extracted.short_term_borrowing);
  setFinancial("non_current_liab_due_1y", extracted.non_current_liab_due_1y);
  setFinancial("long_term_borrowing", extracted.long_term_borrowing);
  setFinancial("bonds_payable", extracted.bonds_payable);
  setFinancial("lease_liabilities", extracted.lease_liabilities);
  setFinancial("total_shares", extracted.total_shares, extracted.shares_outstanding);
  setFinancial("eps_reported", extracted.eps);
  setFinancial("eps_prev", extracted.eps_prev);
  setFinancial("cash_dividend", extracted.cash_dividend);
  setFinancial("dividend_per_share_reported", extracted.dividend_per_share);
  setFinancial("dividend_per_share_prev", extracted.dividend_per_share_prev);
  setDerived("net_debt", extracted.net_debt);
  next.inputs = deriveValuationInputs(next.inputs, { overwrite: true });
  if (!next.note && payload?.notes?.length) {
    next.note = payload.notes.join("；");
  }
  return next;
}

function firstDefined(values) {
  return values.find((value) => value !== null && value !== undefined && value !== "");
}

function valuationPeriodTypeOptions() {
  return [
    { value: "annual", label: "年报", months: 12 },
    { value: "q1", label: "一季报", months: 3 },
    { value: "h1", label: "中报", months: 6 },
    { value: "q3", label: "三季报", months: 9 },
    { value: "ttm", label: "TTM", months: 12 },
  ];
}

function valuationPeriodTypeLabel(type) {
  return valuationPeriodTypeOptions().find((item) => item.value === type)?.label || "年报";
}

function valuationPeriodMonths(period) {
  const type = period?.report_type || "annual";
  return valuationPeriodTypeOptions().find((item) => item.value === type)?.months || 12;
}

function normalizeValuationPeriodCount(value) {
  const number = Math.round(Number(value || 3));
  if (!Number.isFinite(number)) return 3;
  return Math.max(1, Math.min(8, number));
}

function valuationFinancialTableGroups() {
  return [
    {
      title: "利润表",
      fields: [
        ["revenue", "营业收入"],
        ["gross_profit", "毛利"],
        ["net_profit_parent", "归母净利润"],
        ["income_tax_expense", "所得税费用"],
        ["interest_expense", "利息费用"],
        ["depreciation_amortization", "折旧摊销"],
        ["ebitda_reported", "披露 EBITDA"],
      ],
    },
    {
      title: "现金流量表",
      fields: [
        ["operating_cash_flow", "经营现金流净额"],
        ["capital_expenditure", "购建长期资产现金支出"],
        ["free_cash_flow_reported", "披露自由现金流"],
      ],
    },
    {
      title: "资产负债表",
      fields: [
        ["cash_and_equivalents", "货币资金及现金等价物"],
        ["short_term_borrowing", "短期借款"],
        ["non_current_liab_due_1y", "一年内到期非流动负债"],
        ["long_term_borrowing", "长期借款"],
        ["bonds_payable", "应付债券"],
        ["lease_liabilities", "租赁负债"],
      ],
    },
    {
      title: "股本与分红",
      fields: [
        ["total_shares", "总股本"],
        ["eps_reported", "披露 EPS"],
        ["cash_dividend", "现金分红总额"],
        ["dividend_per_share_reported", "披露每股股利"],
      ],
    },
  ];
}

function createDefaultValuationPeriod(index = 0) {
  return {
    period: "",
    report_type: "annual",
    revenue: "",
    gross_profit: "",
    net_profit_parent: "",
    income_tax_expense: "",
    interest_expense: "",
    depreciation_amortization: "",
    ebitda_reported: "",
    operating_cash_flow: "",
    capital_expenditure: "",
    free_cash_flow_reported: "",
    cash_and_equivalents: "",
    short_term_borrowing: "",
    non_current_liab_due_1y: "",
    long_term_borrowing: "",
    bonds_payable: "",
    lease_liabilities: "",
    total_shares: "",
    eps_reported: "",
    cash_dividend: "",
    dividend_per_share_reported: "",
  };
}

function createDefaultValuationPeriods(count = 3) {
  return Array.from({ length: normalizeValuationPeriodCount(count) }, (_, index) => createDefaultValuationPeriod(index));
}

function normalizeValuationPeriod(period, index = 0) {
  const base = createDefaultValuationPeriod(index);
  const source = period && typeof period === "object" ? period : {};
  Object.keys(base).forEach((key) => {
    if (source[key] !== undefined && source[key] !== null) {
      base[key] = source[key];
    }
  });
  if (!valuationPeriodTypeOptions().some((item) => item.value === base.report_type)) {
    base.report_type = "annual";
  }
  return base;
}

function normalizeValuationPeriods(periods, count = 3) {
  const source = Array.isArray(periods) ? periods : [];
  const targetCount = normalizeValuationPeriodCount(count || source.length || 3);
  return Array.from({ length: targetCount }, (_, index) => normalizeValuationPeriod(source[index], index));
}

const VALUATION_FIXED_ANNUAL_YEARS = 5;

function valuationFixedPeriodCount() {
  return 1 + VALUATION_FIXED_ANNUAL_YEARS;
}

function normalizeFixedValuationPeriods(periods) {
  const source = Array.isArray(periods) ? periods : [];
  const normalized = normalizeValuationPeriods(
    source,
    Math.max(source.length, valuationFixedPeriodCount()),
  );
  const latest = normalizeValuationPeriod(normalized[0], 0);
  const annuals = normalized
    .slice(1)
    .filter((period) => normalizeValuationPeriod(period).report_type === "annual");
  const fixed = [latest];
  for (let index = 0; index < VALUATION_FIXED_ANNUAL_YEARS; index += 1) {
    fixed.push(normalizeValuationPeriod({ ...(annuals[index] || {}), report_type: "annual" }, index + 1));
  }
  return fixed;
}

function valuationPeriodColumnTitle(index) {
  return index === 0 ? "最新一期" : `近 ${index} 年年报`;
}

function valuationPeriodColumnLabel(period, index) {
  const label = String(period?.period || "").trim();
  if (label) return label;
  return index === 0 ? "等待回填" : "等待年报";
}

function legacyFinancialToPeriods(financial, count = 3) {
  const periods = createDefaultValuationPeriods(count);
  const f = financial && typeof financial === "object" ? financial : {};
  const setLatest = (key, value) => {
    if (value !== undefined && value !== null && value !== "") periods[0][key] = value;
  };
  const setComparable = (key, value) => {
    if (!periods[1]) return;
    if (value !== undefined && value !== null && value !== "") periods[1][key] = value;
  };
  setLatest("period", f.report_period);
  [
    "revenue",
    "gross_profit",
    "net_profit_parent",
    "income_tax_expense",
    "interest_expense",
    "depreciation_amortization",
    "ebitda_reported",
    "operating_cash_flow",
    "capital_expenditure",
    "free_cash_flow_reported",
    "cash_and_equivalents",
    "short_term_borrowing",
    "non_current_liab_due_1y",
    "long_term_borrowing",
    "bonds_payable",
    "lease_liabilities",
    "total_shares",
    "eps_reported",
    "cash_dividend",
    "dividend_per_share_reported",
  ].forEach((key) => setLatest(key, f[key]));
  setComparable("revenue", f.revenue_prev);
  setComparable("net_profit_parent", f.net_profit_parent_prev);
  setComparable("operating_cash_flow", f.operating_cash_flow_prev);
  setComparable("capital_expenditure", f.capital_expenditure_prev);
  setComparable("eps_reported", f.eps_prev);
  setComparable("dividend_per_share_reported", f.dividend_per_share_prev);
  return periods;
}

function defaultValuationInputs() {
  return {
    financial_period_count: valuationFixedPeriodCount(),
    financial_periods: createDefaultValuationPeriods(valuationFixedPeriodCount()),
    financial: {
      report_period: "",
      revenue: "",
      revenue_prev: "",
      gross_profit: "",
      net_profit_parent: "",
      net_profit_parent_prev: "",
      income_tax_expense: "",
      interest_expense: "",
      depreciation_amortization: "",
      ebitda_reported: "",
      operating_cash_flow: "",
      operating_cash_flow_prev: "",
      capital_expenditure: "",
      capital_expenditure_prev: "",
      free_cash_flow_reported: "",
      cash_and_equivalents: "",
      short_term_borrowing: "",
      non_current_liab_due_1y: "",
      long_term_borrowing: "",
      bonds_payable: "",
      lease_liabilities: "",
      total_shares: "",
      eps_reported: "",
      eps_prev: "",
      cash_dividend: "",
      dividend_per_share_reported: "",
      dividend_per_share_prev: "",
    },
    derived: {
      free_cash_flow: "",
      free_cash_flow_growth_rate: "",
      revenue_growth_rate: "",
      net_profit_growth_rate: "",
      eps: "",
      eps_growth_rate: "",
      dividend_per_share: "",
      dividend_growth_rate: "",
      net_debt: "",
      ebitda: "",
      gross_margin: "",
      net_margin: "",
    },
    dcf: { growth_rate: "", years: 5, terminal_growth_rate: 2, discount_rate: 10 },
    ddm: { cost_of_equity: 8, dividend_growth_rate: "" },
    pe: { target_pe: "" },
    peg: { target_peg: 1, eps_growth_rate: "" },
    ev_ebitda: { target_ev_ebitda: "" },
  };
}

function mergeValuationInputs(base, extra) {
  const output = JSON.parse(JSON.stringify(base));
  Object.entries(extra || {}).forEach(([group, values]) => {
    if (group === "financial_periods") {
      return;
    }
    if (Array.isArray(values)) {
      output[group] = values.slice();
      return;
    }
    if (values && typeof values === "object") {
      output[group] = { ...(output[group] || {}), ...values };
      return;
    }
    if (values !== undefined) {
      output[group] = values;
    }
  });

  const requestedCount = valuationFixedPeriodCount();
  output.financial_periods = Array.isArray(extra?.financial_periods) && extra.financial_periods.length
    ? normalizeFixedValuationPeriods(extra.financial_periods)
    : normalizeFixedValuationPeriods(legacyFinancialToPeriods(output.financial, requestedCount));
  output.financial_period_count = requestedCount;

  const legacyDcf = extra?.dcf || {};
  const legacyPe = extra?.pe || {};
  const legacyPeg = extra?.peg || {};
  const legacyDdm = extra?.ddm || {};
  const legacyEv = extra?.ev_ebitda || {};
  if (legacyDcf.free_cash_flow) output.derived.free_cash_flow = output.derived.free_cash_flow || legacyDcf.free_cash_flow;
  if (legacyDcf.net_debt) output.derived.net_debt = output.derived.net_debt || legacyDcf.net_debt;
  if (legacyDcf.shares_outstanding) output.financial.total_shares = output.financial.total_shares || legacyDcf.shares_outstanding;
  if (legacyPe.eps) output.derived.eps = output.derived.eps || legacyPe.eps;
  if (legacyPeg.eps_growth_rate) output.derived.eps_growth_rate = output.derived.eps_growth_rate || legacyPeg.eps_growth_rate;
  if (legacyDdm.dividend_per_share) output.derived.dividend_per_share = output.derived.dividend_per_share || legacyDdm.dividend_per_share;
  if (legacyDdm.dividend_growth_rate) output.derived.dividend_growth_rate = output.derived.dividend_growth_rate || legacyDdm.dividend_growth_rate;
  if (legacyEv.ebitda) output.derived.ebitda = output.derived.ebitda || legacyEv.ebitda;
  if (legacyEv.net_debt) output.derived.net_debt = output.derived.net_debt || legacyEv.net_debt;
  if (legacyEv.shares_outstanding) output.financial.total_shares = output.financial.total_shares || legacyEv.shares_outstanding;
  return output;
}

function renderValuationForm(draft) {
  return `
    <form class="valuation-workbench" data-form="valuation-workbench">
      <section class="panel valuation-input-panel">
        <div class="panel-head">
          <h2>基础信息与数据回填</h2>
          <span>只输入股票名称即可；联想结果会自动带出股票代码。</span>
        </div>
        <div class="valuation-basic-grid single">
          ${renderValuationStockSearch(draft)}
        </div>
        <div class="valuation-pdf-row">
          <label><span>上传财报 PDF</span><input class="input" type="file" name="valuation_pdf" accept="application/pdf"></label>
          <button class="button soft" type="button" data-action="extract-valuation-pdf" ${state.valuationPdfLoading ? "disabled" : ""}>${state.valuationPdfLoading ? "提取中..." : "用 Gemini 回填财报字段"}</button>
          <small>${draft.pdf_file_name ? `已回填：${escapeHtml(draft.pdf_file_name)}` : "上传年报、半年报或季报 PDF；系统会优先抽取多期财报列，回填后仍建议人工复核。"}</small>
        </div>
      </section>

      <section class="panel valuation-input-panel">
        <div class="panel-head">
          <h2>财报原始字段</h2>
          <span>从左到右填写最新期到更早期；金额单位默认亿元，股本单位默认亿股。</span>
        </div>
        ${renderValuationFinancialTable(draft)}
      </section>

      <section class="panel valuation-input-panel">
        <div class="panel-head">
          <h2>推导指标</h2>
          <span>由多期财报自动推导；你可以直接修改，模型会使用修正后的数值。</span>
        </div>
        ${valuationDerivedFieldGroups().map((group) => renderValuationDataGroup("derived", group, draft)).join("")}
      </section>

      ${renderValuationMethodSelector(draft)}

      <section class="valuation-model-grid">
        ${(draft.methods || []).length
          ? draft.methods.map((method) => renderValuationModelFields(method, draft)).join("")
          : `<div class="empty-inline">先勾选至少一种估值方法，再填写对应模型假设。</div>`}
      </section>

      <section class="panel valuation-output-panel">
        <div class="panel-head">
          <h2>估值结果</h2>
          <span>低估线/高估线使用系统默认上下 20% 区间，保存后会自动用于新增股票时的股票池估值。</span>
        </div>
        ${renderValuationOutput(draft)}
        <label class="valuation-note"><span>估值备注</span><textarea class="textarea" name="note" rows="4" placeholder="记录关键假设、可比公司、风险点或调参原因">${escapeHtml(draft.note || "")}</textarea></label>
      </section>
    </form>
  `;
}

function renderValuationFinancialTable(draft) {
  const inputs = mergeValuationInputs(defaultValuationInputs(), draft.inputs || {});
  const periods = normalizeValuationPeriods(inputs.financial_periods, inputs.financial_period_count);
  return `
    <div class="valuation-period-toolbar">
      <label>
        <span>财报列数</span>
        <input class="input" name="financial_period_count" type="number" min="1" max="8" step="1" value="${escapeAttr(periods.length)}">
      </label>
      <p>建议填 3 年或 5 年。最新期如果是季报，选择一季报/中报/三季报，系统会年化经营数据，并优先用同口径同比计算增长。</p>
    </div>
    <div class="valuation-period-table-wrap">
      <table class="valuation-period-table">
        <thead>
          <tr>
            <th>项目</th>
            ${periods.map((period, index) => `
              <th>
                <span>${index === 0 ? "最新期" : `对比期 ${index}`}</span>
                <input class="input" name="financial_periods.${index}.period" value="${escapeAttr(period.period || "")}" placeholder="${index === 0 ? "2026Q1 / TTM" : "2025 / 2025Q1"}">
              </th>
            `).join("")}
          </tr>
        </thead>
        <tbody>
          <tr class="valuation-period-meta-row">
            <th>报表类型</th>
            ${periods.map((period, index) => `
              <td>
                <select class="input" name="financial_periods.${index}.report_type">
                  ${valuationPeriodTypeOptions().map((option) => `<option value="${option.value}" ${period.report_type === option.value ? "selected" : ""}>${option.label}</option>`).join("")}
                </select>
              </td>
            `).join("")}
          </tr>
          ${valuationFinancialTableGroups().map((group) => `
            <tr class="valuation-period-group-row"><th colspan="${periods.length + 1}">${escapeHtml(group.title)}</th></tr>
            ${group.fields.map(([key, label]) => `
              <tr>
                <th>${escapeHtml(label)}</th>
                ${periods.map((period, index) => `
                  <td><input class="input" name="financial_periods.${index}.${key}" type="number" step="0.0001" value="${escapeAttr(period[key] ?? "")}"></td>
                `).join("")}
              </tr>
            `).join("")}
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function collectValuationDraftFromForm() {
  const form = document.querySelector('[data-form="valuation-workbench"]');
  const draft = state.valuationDraft || createValuationDraft();
  if (!form) {
    return draft;
  }
  const data = new FormData(form);
  const methods = data.getAll("methods").map(String);
  let inputs = mergeValuationInputs(defaultValuationInputs(), draft.inputs || {});
  inputs.financial_period_count = valuationFixedPeriodCount();
  inputs.financial_periods = normalizeFixedValuationPeriods(inputs.financial_periods);
  for (const [key, value] of data.entries()) {
    if (key === "financial_period_count") {
      continue;
    }
    if (key.startsWith("financial_periods.")) {
      const [, indexText, field] = key.split(".");
      const index = Number(indexText);
      if (Number.isInteger(index) && inputs.financial_periods[index] && field) {
        inputs.financial_periods[index][field] = value;
      }
      continue;
    }
    if (!key.includes(".")) {
      continue;
    }
    const [group, field] = key.split(".");
    if (!inputs[group]) {
      inputs[group] = {};
    }
    inputs[group][field] = value;
  }
  inputs = mergeValuationInputs(defaultValuationInputs(), inputs);
  inputs.financial_period_count = valuationFixedPeriodCount();
  inputs.financial_periods = normalizeFixedValuationPeriods(inputs.financial_periods);
  return {
    ...draft,
    ts_code: String(data.get("ts_code") || "").trim(),
    name: String(data.get("name") || "").trim(),
    methods,
    inputs,
    safety_margin_pct: DEFAULT_VALUATION_BAND_PCT,
    overvaluation_margin_pct: DEFAULT_VALUATION_BAND_PCT,
    note: String(data.get("note") || "").trim(),
  };
}

function valuationPeriodHasData(period) {
  if (!period) return false;
  if (String(period.period || "").trim()) return true;
  return valuationFinancialTableGroups()
    .flatMap((group) => group.fields.map(([key]) => key))
    .some((key) => valuationNumber(period[key]) !== null);
}

function valuationUsablePeriods(periods) {
  return (periods || []).filter(valuationPeriodHasData);
}

function isAnnualizedValuationField(field) {
  return [
    "revenue",
    "gross_profit",
    "net_profit_parent",
    "income_tax_expense",
    "interest_expense",
    "depreciation_amortization",
    "ebitda_reported",
    "operating_cash_flow",
    "capital_expenditure",
    "free_cash_flow_reported",
    "eps_reported",
  ].includes(field);
}

function valuationPeriodValue(period, field, options = {}) {
  const number = valuationNumber(period?.[field]);
  if (number === null) return null;
  if (!options.annualized || !isAnnualizedValuationField(field)) {
    return number;
  }
  const months = valuationPeriodMonths(period);
  if (!months || months >= 12 || period?.report_type === "ttm") {
    return number;
  }
  return number * (12 / months);
}

function valuationComparablePeriod(periods, latest) {
  if (!latest || !periods.length) return null;
  return periods.slice(1).find((period) => period.report_type === latest.report_type)
    || periods.slice(1).find((period) => period.report_type === "annual")
    || periods[1]
    || null;
}

function valuationAnnualPeriods(periods) {
  return (periods || []).filter((period) => period?.report_type === "annual" && valuationPeriodHasData(period));
}

function valuationBasePeriodForAnnualMetrics(periods, latest) {
  if (latest?.report_type === "annual" || latest?.report_type === "ttm") {
    return latest;
  }
  return valuationAnnualPeriods(periods)[0] || latest || null;
}

function valuationPreviousAnnualPeriod(periods, basePeriod) {
  const annuals = valuationAnnualPeriods(periods);
  return annuals.find((period) => period !== basePeriod && String(period.period || "") !== String(basePeriod?.period || ""))
    || annuals.find((period) => period !== basePeriod)
    || null;
}

function valuationAnnualWindow(periods, count = 5) {
  return valuationAnnualPeriods(periods).slice(0, count);
}

function medianClient(values) {
  const numbers = (values || [])
    .map(Number)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  if (!numbers.length) return null;
  const middle = Math.floor(numbers.length / 2);
  return numbers.length % 2 ? numbers[middle] : (numbers[middle - 1] + numbers[middle]) / 2;
}

function valuationNormalizedAnnualValue(periods, accessor) {
  const values = valuationAnnualWindow(periods)
    .map((period) => accessor(period))
    .filter((value) => value !== null && Number.isFinite(Number(value)));
  return medianClient(values);
}

function valuationAnnualGrowth(periods, accessor) {
  const annuals = valuationAnnualWindow(periods);
  const values = annuals
    .map((period, index) => ({ index, value: accessor(period) }))
    .filter((item) => item.value !== null && Number.isFinite(Number(item.value)));
  if (values.length < 2) return null;

  const allPositive = values.every((item) => Number(item.value) > 0);
  if (allPositive) {
    const newest = values[0];
    const oldest = values[values.length - 1];
    const years = Math.max(1, oldest.index - newest.index);
    return (Math.pow(Number(newest.value) / Number(oldest.value), 1 / years) - 1) * 100;
  }

  const yoyRates = [];
  for (let index = 0; index < annuals.length - 1; index += 1) {
    const current = accessor(annuals[index]);
    const previous = accessor(annuals[index + 1]);
    if (previous !== null && Number(previous) > 0) {
      const change = pctChange(current, previous);
      if (change !== null) {
        yoyRates.push(change);
      }
    }
  }
  return medianClient(yoyRates);
}

function valuationPeriodFcf(period) {
  const reported = valuationPeriodValue(period, "free_cash_flow_reported", { annualized: true });
  if (reported !== null) return reported;
  const ocf = valuationPeriodValue(period, "operating_cash_flow", { annualized: true });
  const capex = valuationPeriodValue(period, "capital_expenditure", { annualized: true });
  return ocf !== null && capex !== null ? ocf - Math.abs(capex) : null;
}

function valuationPeriodEbitda(period, netProfit) {
  const reported = valuationPeriodValue(period, "ebitda_reported", { annualized: true });
  if (reported !== null) return reported;
  return sumIfAllFinite([
    netProfit,
    valuationPeriodValue(period, "income_tax_expense", { annualized: true }),
    valuationPeriodValue(period, "interest_expense", { annualized: true }),
    valuationPeriodValue(period, "depreciation_amortization", { annualized: true }),
  ]);
}

function setFinancialSnapshotValue(target, key, value) {
  if (!target) return;
  if (typeof value === "string") {
    target[key] = value;
    return;
  }
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return;
  }
  target[key] = roundClient(value, 4);
}

function deriveValuationInputs(inputs, options = {}) {
  const next = mergeValuationInputs(defaultValuationInputs(), inputs || {});
  const periods = valuationUsablePeriods(next.financial_periods || []);
  const latest = periods[0] || normalizeValuationPeriod(next.financial_periods?.[0], 0);
  const comparable = valuationComparablePeriod(periods, latest) || {};
  const annualBase = valuationBasePeriodForAnnualMetrics(periods, latest) || latest;
  const annualComparable = valuationPreviousAnnualPeriod(periods, annualBase) || comparable;
  const f = next.financial || {};
  next.financial = f;
  const d = next.derived || {};
  const overwrite = Boolean(options.overwrite);
  const setDerived = (key, value) => setValuationValue(d, key, value, overwrite);
  const setModel = (group, key, value) => setValuationValue(next[group], key, value, overwrite);

  const revenue = valuationPeriodValue(annualBase, "revenue", { annualized: true });
  const revenuePrev = valuationPeriodValue(annualComparable, "revenue", { annualized: true });
  const grossProfit = valuationPeriodValue(annualBase, "gross_profit", { annualized: true });
  const netProfit = valuationPeriodValue(annualBase, "net_profit_parent", { annualized: true });
  const netProfitPrev = valuationPeriodValue(annualComparable, "net_profit_parent", { annualized: true });
  const currentFcf = valuationNormalizedAnnualValue(periods, valuationPeriodFcf) ?? valuationPeriodFcf(annualBase);
  const fcfGrowth = valuationAnnualGrowth(periods, valuationPeriodFcf);
  const revenueGrowth = valuationAnnualGrowth(periods, (period) => valuationPeriodValue(period, "revenue", { annualized: true }));
  const netProfitGrowth = valuationAnnualGrowth(periods, (period) => valuationPeriodValue(period, "net_profit_parent", { annualized: true }));
  const shares = valuationPeriodValue(latest, "total_shares") ?? valuationPeriodValue(comparable, "total_shares");
  const cash = valuationPeriodValue(latest, "cash_and_equivalents");
  const debtParts = ["short_term_borrowing", "non_current_liab_due_1y", "long_term_borrowing", "bonds_payable", "lease_liabilities"]
    .map((key) => valuationPeriodValue(latest, key))
    .filter((value) => value !== null);
  const debt = debtParts.length ? debtParts.reduce((sum, value) => sum + value, 0) : null;
  const eps = valuationPeriodValue(annualBase, "eps_reported", { annualized: true }) ?? (netProfit !== null && shares ? netProfit / shares : null);
  const epsPrev = valuationPeriodValue(annualComparable, "eps_reported", { annualized: true });
  const dividend = valuationPeriodValue(annualBase, "dividend_per_share_reported")
    ?? (valuationPeriodValue(annualBase, "cash_dividend") !== null && shares ? valuationPeriodValue(annualBase, "cash_dividend") / shares : null);
  const dividendPrev = valuationPeriodValue(annualComparable, "dividend_per_share_reported");
  const epsGrowth = valuationAnnualGrowth(periods, (period) => valuationPeriodValue(period, "eps_reported", { annualized: true }));
  const dividendGrowth = valuationAnnualGrowth(periods, (period) => valuationPeriodValue(period, "dividend_per_share_reported"));
  const ebitda = valuationPeriodEbitda(annualBase, netProfit);

  setFinancialSnapshotValue(f, "report_period", [annualBase.period, valuationPeriodTypeLabel(annualBase.report_type)].filter(Boolean).join(" "));
  setFinancialSnapshotValue(f, "revenue", revenue);
  setFinancialSnapshotValue(f, "revenue_prev", revenuePrev);
  setFinancialSnapshotValue(f, "gross_profit", grossProfit);
  setFinancialSnapshotValue(f, "net_profit_parent", netProfit);
  setFinancialSnapshotValue(f, "net_profit_parent_prev", netProfitPrev);
  setFinancialSnapshotValue(f, "income_tax_expense", valuationPeriodValue(annualBase, "income_tax_expense", { annualized: true }));
  setFinancialSnapshotValue(f, "interest_expense", valuationPeriodValue(annualBase, "interest_expense", { annualized: true }));
  setFinancialSnapshotValue(f, "depreciation_amortization", valuationPeriodValue(annualBase, "depreciation_amortization", { annualized: true }));
  setFinancialSnapshotValue(f, "ebitda_reported", valuationPeriodValue(annualBase, "ebitda_reported", { annualized: true }));
  setFinancialSnapshotValue(f, "operating_cash_flow", valuationPeriodValue(annualBase, "operating_cash_flow", { annualized: true }));
  setFinancialSnapshotValue(f, "operating_cash_flow_prev", valuationPeriodValue(annualComparable, "operating_cash_flow", { annualized: true }));
  setFinancialSnapshotValue(f, "capital_expenditure", valuationPeriodValue(annualBase, "capital_expenditure", { annualized: true }));
  setFinancialSnapshotValue(f, "capital_expenditure_prev", valuationPeriodValue(annualComparable, "capital_expenditure", { annualized: true }));
  setFinancialSnapshotValue(f, "free_cash_flow_reported", valuationPeriodValue(annualBase, "free_cash_flow_reported", { annualized: true }));
  setFinancialSnapshotValue(f, "cash_and_equivalents", cash);
  setFinancialSnapshotValue(f, "short_term_borrowing", valuationPeriodValue(latest, "short_term_borrowing"));
  setFinancialSnapshotValue(f, "non_current_liab_due_1y", valuationPeriodValue(latest, "non_current_liab_due_1y"));
  setFinancialSnapshotValue(f, "long_term_borrowing", valuationPeriodValue(latest, "long_term_borrowing"));
  setFinancialSnapshotValue(f, "bonds_payable", valuationPeriodValue(latest, "bonds_payable"));
  setFinancialSnapshotValue(f, "lease_liabilities", valuationPeriodValue(latest, "lease_liabilities"));
  setFinancialSnapshotValue(f, "total_shares", shares);
  setFinancialSnapshotValue(f, "eps_reported", eps);
  setFinancialSnapshotValue(f, "eps_prev", epsPrev);
  setFinancialSnapshotValue(f, "cash_dividend", valuationPeriodValue(annualBase, "cash_dividend"));
  setFinancialSnapshotValue(f, "dividend_per_share_reported", dividend);
  setFinancialSnapshotValue(f, "dividend_per_share_prev", dividendPrev);

  setDerived("free_cash_flow", currentFcf);
  setDerived("free_cash_flow_growth_rate", fcfGrowth);
  setDerived("revenue_growth_rate", revenueGrowth);
  setDerived("net_profit_growth_rate", netProfitGrowth);
  setDerived("eps", eps);
  setDerived("eps_growth_rate", epsGrowth);
  setDerived("dividend_per_share", dividend);
  setDerived("dividend_growth_rate", dividendGrowth);
  setDerived("net_debt", debt !== null && cash !== null ? debt - cash : null);
  setDerived("ebitda", ebitda);
  setDerived("gross_margin", revenue ? (grossProfit / revenue) * 100 : null);
  setDerived("net_margin", revenue && netProfit !== null ? (netProfit / revenue) * 100 : null);
  setModel("dcf", "growth_rate", firstValuationNumber(d.free_cash_flow_growth_rate, d.net_profit_growth_rate, d.revenue_growth_rate));
  setModel("ddm", "dividend_growth_rate", d.dividend_growth_rate);
  setModel("peg", "eps_growth_rate", d.eps_growth_rate);
  return next;
}

function normalizeExtractedValuationPeriod(period) {
  const source = period && typeof period === "object" ? period : {};
  return {
    period: source.period || source.report_period || "",
    report_type: source.report_type || source.period_type || "annual",
    revenue: source.revenue,
    gross_profit: source.gross_profit,
    net_profit_parent: source.net_profit_parent ?? source.net_profit,
    income_tax_expense: source.income_tax_expense,
    interest_expense: source.interest_expense,
    depreciation_amortization: source.depreciation_amortization,
    ebitda_reported: source.ebitda_reported ?? source.ebitda,
    operating_cash_flow: source.operating_cash_flow,
    capital_expenditure: source.capital_expenditure,
    free_cash_flow_reported: source.free_cash_flow_reported ?? source.free_cash_flow,
    cash_and_equivalents: source.cash_and_equivalents,
    short_term_borrowing: source.short_term_borrowing,
    non_current_liab_due_1y: source.non_current_liab_due_1y,
    long_term_borrowing: source.long_term_borrowing,
    bonds_payable: source.bonds_payable,
    lease_liabilities: source.lease_liabilities,
    total_shares: source.total_shares ?? source.shares_outstanding,
    eps_reported: source.eps_reported ?? source.eps,
    cash_dividend: source.cash_dividend,
    dividend_per_share_reported: source.dividend_per_share_reported ?? source.dividend_per_share,
  };
}

function mergeValuationExtractToDraft(draft, payload, fileName) {
  const extracted = payload?.extracted || {};
  const next = createValuationDraft({ ...draft, source: "pdf", pdf_file_name: fileName || draft.pdf_file_name, inputs: draft.inputs });
  const extractedPeriods = Array.isArray(payload?.periods)
    ? payload.periods
    : Array.isArray(extracted.periods)
      ? extracted.periods
      : [];
  if (extractedPeriods.length) {
    const count = valuationFixedPeriodCount();
    const periods = normalizeFixedValuationPeriods(next.inputs.financial_periods);
    extractedPeriods.slice(0, count).forEach((period, index) => {
      periods[index] = normalizeValuationPeriod({ ...periods[index], ...normalizeExtractedValuationPeriod(period) }, index);
    });
    next.inputs.financial_period_count = count;
    next.inputs.financial_periods = normalizeFixedValuationPeriods(periods);
  } else {
    const periods = normalizeFixedValuationPeriods(next.inputs.financial_periods);
    const setPeriod = (index, key, ...values) => {
      const value = firstDefined(values);
      if (value !== undefined && periods[index]) periods[index][key] = value;
    };
    setPeriod(0, "period", extracted.report_period || payload?.report_period);
    setPeriod(0, "revenue", extracted.revenue);
    setPeriod(0, "gross_profit", extracted.gross_profit);
    setPeriod(0, "net_profit_parent", extracted.net_profit_parent, extracted.net_profit);
    setPeriod(0, "income_tax_expense", extracted.income_tax_expense);
    setPeriod(0, "interest_expense", extracted.interest_expense);
    setPeriod(0, "depreciation_amortization", extracted.depreciation_amortization);
    setPeriod(0, "ebitda_reported", extracted.ebitda);
    setPeriod(0, "operating_cash_flow", extracted.operating_cash_flow);
    setPeriod(0, "capital_expenditure", extracted.capital_expenditure);
    setPeriod(0, "free_cash_flow_reported", extracted.free_cash_flow);
    setPeriod(0, "cash_and_equivalents", extracted.cash_and_equivalents);
    setPeriod(0, "short_term_borrowing", extracted.short_term_borrowing);
    setPeriod(0, "non_current_liab_due_1y", extracted.non_current_liab_due_1y);
    setPeriod(0, "long_term_borrowing", extracted.long_term_borrowing);
    setPeriod(0, "bonds_payable", extracted.bonds_payable);
    setPeriod(0, "lease_liabilities", extracted.lease_liabilities);
    setPeriod(0, "total_shares", extracted.total_shares, extracted.shares_outstanding);
    setPeriod(0, "eps_reported", extracted.eps);
    setPeriod(0, "cash_dividend", extracted.cash_dividend);
    setPeriod(0, "dividend_per_share_reported", extracted.dividend_per_share);
    setPeriod(1, "revenue", extracted.revenue_prev, extracted.previous_revenue);
    setPeriod(1, "net_profit_parent", extracted.net_profit_parent_prev, extracted.previous_net_profit);
    setPeriod(1, "operating_cash_flow", extracted.operating_cash_flow_prev);
    setPeriod(1, "capital_expenditure", extracted.capital_expenditure_prev);
    setPeriod(1, "eps_reported", extracted.eps_prev);
    setPeriod(1, "dividend_per_share_reported", extracted.dividend_per_share_prev);
    next.inputs.financial_periods = normalizeFixedValuationPeriods(periods);
    next.inputs.financial_period_count = valuationFixedPeriodCount();
  }
  if (extracted.net_debt !== undefined && extracted.net_debt !== null && extracted.net_debt !== "") {
    next.inputs.derived.net_debt = extracted.net_debt;
  }
  next.inputs = deriveValuationInputs(next.inputs, { overwrite: true });
  if (!next.note && payload?.notes?.length) {
    next.note = payload.notes.join("；");
  }
  return next;
}

function createValuationDraft(source = {}) {
  const savedMethods = Array.isArray(source.methods)
    ? source.methods
    : Object.keys(source.method_results || {});
  return {
    _route_id: source._route_id || source.id || "new",
    id: source.id || "",
    ts_code: source.ts_code || "",
    name: source.name || "",
    methods: savedMethods.filter((method) => valuationMethodDefinitions().some((item) => item.key === method)),
    inputs: mergeValuationInputs(defaultValuationInputs(), source.inputs || {}),
    method_results: source.method_results || {},
    fair_price: source.fair_price ?? null,
    low_price: source.low_price ?? null,
    high_price: source.high_price ?? null,
    safety_margin_pct: DEFAULT_VALUATION_BAND_PCT,
    overvaluation_margin_pct: DEFAULT_VALUATION_BAND_PCT,
    source: source.source || "manual",
    pdf_file_name: source.pdf_file_name || "",
    note: source.note || "",
  };
}

function selectedValuationMethods(methods) {
  const selected = Array.isArray(methods) ? methods : [];
  const allowed = new Set(valuationMethodDefinitions().map((method) => method.key));
  return selected.filter((method) => allowed.has(method));
}

function valuationRequiredFinancialFields(methods) {
  const selected = selectedValuationMethods(methods);
  const byMethod = {
    dcf: [
      "revenue",
      "gross_profit",
      "net_profit_parent",
      "operating_cash_flow",
      "capital_expenditure",
      "cash_and_equivalents",
      "short_term_borrowing",
      "non_current_liab_due_1y",
      "long_term_borrowing",
      "total_shares",
    ],
    ddm: [
      "cash_dividend",
      "dividend_per_share_reported",
      "total_shares",
    ],
    pe: [
      "net_profit_parent",
      "total_shares",
      "eps_reported",
    ],
    peg: [
      "net_profit_parent",
      "total_shares",
      "eps_reported",
    ],
    ev_ebitda: [
      "net_profit_parent",
      "income_tax_expense",
      "interest_expense",
      "depreciation_amortization",
      "ebitda_reported",
      "cash_and_equivalents",
      "short_term_borrowing",
      "non_current_liab_due_1y",
      "long_term_borrowing",
      "total_shares",
    ],
  };
  const fields = new Set();
  selected.forEach((method) => (byMethod[method] || []).forEach((field) => fields.add(field)));
  return fields;
}

function valuationFinancialTableGroupsForMethods(methods) {
  const fields = valuationRequiredFinancialFields(methods);
  if (!fields.size) {
    return [];
  }
  return valuationFinancialTableGroups()
    .map((group) => ({
      ...group,
      fields: group.fields.filter(([key]) => fields.has(key)),
    }))
    .filter((group) => group.fields.length);
}

function valuationDerivedFieldGroupsForMethods(methods) {
  const selected = selectedValuationMethods(methods);
  const byMethod = {
    dcf: ["free_cash_flow", "free_cash_flow_growth_rate", "revenue_growth_rate", "net_profit_growth_rate", "net_debt"],
    ddm: ["dividend_per_share", "dividend_growth_rate"],
    pe: ["eps"],
    peg: ["eps", "eps_growth_rate", "net_profit_growth_rate"],
    ev_ebitda: ["ebitda", "net_debt"],
  };
  const fields = new Set();
  selected.forEach((method) => (byMethod[method] || []).forEach((field) => fields.add(field)));
  if (!fields.size) {
    return [];
  }
  return valuationDerivedFieldGroups()
    .map((group) => ({
      ...group,
      fields: group.fields.filter(([key]) => fields.has(key)),
    }))
    .filter((group) => group.fields.length);
}

function renderValuationForm(draft) {
  const selectedMethods = selectedValuationMethods(draft.methods || []);
  return `
    <form class="valuation-workbench" data-form="valuation-workbench">
      <section class="panel valuation-input-panel">
        <div class="panel-head">
          <h2>第一步：选择股票</h2>
          <span>只输入股票名称；从联想结果选择后会自动带出股票代码。</span>
        </div>
        <div class="valuation-basic-grid single">
          ${renderValuationStockSearch(draft)}
        </div>
      </section>

      ${renderValuationMethodSelector(draft)}

      ${selectedMethods.length ? renderValuationDataFillPanel(draft) : `
        <section class="panel valuation-input-panel">
          <div class="panel-head">
            <h2>第三步：填写估值数据</h2>
            <span>先选择估值方法，系统会只展示该方法真正需要的财报字段。</span>
          </div>
          <div class="empty-inline valuation-step-empty">请选择 DCF、DDM、PE、PEG 或 EV/EBITDA 中至少一种方法。</div>
        </section>
      `}

      <section class="valuation-model-grid single">
        ${selectedMethods.length
          ? selectedMethods.map((method) => renderValuationModelFields(method, draft)).join("")
          : `<div class="empty-inline">选择估值方法后，这里会出现对应模型假设。</div>`}
      </section>

      <section class="panel valuation-output-panel">
        <div class="panel-head">
          <div>
            <h2>估值结果</h2>
            <span>低估线/高估线使用系统默认上下 20% 区间，保存后会自动用于新增股票时的股票池估值。</span>
          </div>
          <div class="valuation-output-actions">
            <button class="button soft" type="button" data-action="calculate-valuation">重新计算</button>
          </div>
        </div>
        ${renderValuationOutput(draft)}
        <label class="valuation-note"><span>估值备注</span><textarea class="textarea" name="note" rows="4" placeholder="记录关键假设、可比公司、风险点或调参原因">${escapeHtml(draft.note || "")}</textarea></label>
      </section>
    </form>
  `;
}

function renderValuationDataFillPanel(draft) {
  const selectedMethods = selectedValuationMethods(draft.methods || []);
  const derivedGroups = valuationDerivedFieldGroupsForMethods(selectedMethods);
  const hasStock = Boolean(String(draft.ts_code || draft.name || "").trim());
  return `
    <section class="panel valuation-input-panel">
      <div class="panel-head">
        <h2>第三步：填写估值数据</h2>
        <span>手动填写、PDF 提取和 TuShare 自动带入可以混合使用；回填后仍建议人工复核。</span>
      </div>
      <div class="valuation-source-row">
        <div class="valuation-source-copy">
          <strong>数据填写方式</strong>
          <span>下方表格只保留 ${selectedMethods.map(valuationMethodLabelClient).join("、")} 所需字段。</span>
        </div>
        <label class="valuation-file-action">
          <span>上传财报 PDF</span>
          <input class="input" type="file" name="valuation_pdf" accept="application/pdf">
        </label>
        <button class="button soft" type="button" data-action="extract-valuation-pdf" ${state.valuationPdfLoading ? "disabled" : ""}>${state.valuationPdfLoading ? "提取中..." : "用 Gemini 回填"}</button>
        <button class="button soft" type="button" data-action="fill-valuation-tushare" ${state.valuationTushareLoading || !hasStock ? "disabled" : ""}>${state.valuationTushareLoading ? "TuShare 回填中..." : "从 TuShare 带入"}</button>
      </div>
      <p class="valuation-source-hint">
        ${draft.source === "tushare"
          ? "已使用 TuShare 财务接口回填。趋势类指标会优先使用过去 5 期完整年报推导；自由现金流采用 5 年中位数规范化，关键字段仍建议复核。"
          : draft.pdf_file_name
            ? `已回填：${escapeHtml(draft.pdf_file_name)}`
            : "金额单位默认亿元，股本单位默认亿股；最新期可为季报，但趋势类指标默认用过去 5 期完整年报推导，避免季节性误判。"}
      </p>
      ${renderValuationFinancialTable(draft)}
    </section>

    <section class="panel valuation-input-panel">
      <div class="panel-head">
        <h2>推导指标</h2>
        <span>趋势类指标使用过去 5 期完整年报推导；你可以直接修改，模型会使用修正后的数值。</span>
      </div>
      ${derivedGroups.length
        ? derivedGroups.map((group) => renderValuationDataGroup("derived", group, draft)).join("")
        : `<div class="empty-inline">当前方法没有可推导字段。</div>`}
    </section>
  `;
}

function renderValuationFinancialTable(draft) {
  const inputs = mergeValuationInputs(defaultValuationInputs(), draft.inputs || {});
  const periods = normalizeFixedValuationPeriods(inputs.financial_periods);
  const groups = valuationFinancialTableGroupsForMethods(draft.methods || []);
  if (!groups.length) {
    return `<div class="empty-inline valuation-step-empty">选择估值方法后，这里会显示对应财报字段。</div>`;
  }
  return `
    <div class="valuation-period-toolbar fixed">
      <div>
        <strong>固定期间结构</strong>
        <span>最新一期 + 过去 5 年年报</span>
      </div>
      <p>点击“从 TuShare 带入”会按这个结构回填。最新一期可以是一季报、中报、三季报或年报；后面 5 列只保留年度报告，便于推导长期增长和利润质量。</p>
    </div>
    <div class="valuation-period-table-wrap">
      <table class="valuation-period-table">
        <thead>
          <tr>
            <th>项目</th>
            ${periods.map((period, index) => `
              <th>
                <span>${valuationPeriodColumnTitle(index)}</span>
                <strong>${escapeHtml(valuationPeriodColumnLabel(period, index))}</strong>
                <small>${index === 0 ? valuationPeriodTypeLabel(period.report_type) : "年报"}</small>
                <input type="hidden" name="financial_periods.${index}.period" value="${escapeAttr(period.period || "")}">
                <input type="hidden" name="financial_periods.${index}.report_type" value="${escapeAttr(index === 0 ? period.report_type : "annual")}">
              </th>
            `).join("")}
          </tr>
        </thead>
        <tbody>
          ${groups.map((group) => `
            <tr class="valuation-period-group-row"><th colspan="${periods.length + 1}">${escapeHtml(group.title)}</th></tr>
            ${group.fields.map(([key, label]) => `
              <tr>
                <th>${escapeHtml(label)}</th>
                ${periods.map((period, index) => `
                  <td><input class="input" name="financial_periods.${index}.${key}" type="number" step="0.0001" value="${escapeAttr(period[key] ?? "")}"></td>
                `).join("")}
              </tr>
            `).join("")}
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderPool() {
  const rows = filteredWatchlist();
  app.innerHTML = `
    ${renderToast()}
    <section class="page-head">
      <div>
        <p class="eyebrow">Watch Pool</p>
        <h1 class="page-title">我的股票池</h1>
        <p class="page-subtitle">搜索添加 A 股，维护估值区间、备注和估值依据。每次估值调整都会留下不可修改的流水。</p>
      </div>
      <div class="head-actions">
        <button class="button primary" data-action="start-sync">同步收盘数据</button>
      </div>
    </section>

    ${renderSyncPanel()}

    ${renderPoolTabs()}
    ${state.poolTab === "groups" ? renderGroupsContent() : renderPoolStocks(rows)}
  `;
}

function renderPoolTabs() {
  return `
    <section class="quick-tabs" aria-label="股票池快速切换">
      <button class="${state.poolTab === "stocks" ? "active" : ""}" data-action="set-pool-tab" data-tab="stocks">股票列表</button>
      <button class="${state.poolTab === "groups" ? "active" : ""}" data-action="set-pool-tab" data-tab="groups">分组管理</button>
    </section>
  `;
}

function renderPoolStocks(rows) {
  return `
    <form class="search-bar" data-form="search-stock">
      <label class="sr-only" for="stockSearch">搜索股票</label>
      <div class="stock-suggest-field">
        <input id="stockSearch" class="input" name="q" value="${escapeHtml(state.searchQuery)}" placeholder="输入代码或名称，例如 600519 或 贵州茅台" autocomplete="off" data-stock-suggest-kind="addStock">
        ${renderStockSuggestDropdown("addStock")}
      </div>
      <button class="button primary" type="submit">搜索</button>
    </form>
    ${renderSearchResults()}

    <section class="filter-row">
      <label>
        <span>搜索股票池</span>
        <input class="input" value="${escapeHtml(state.poolListQuery)}" placeholder="输入股票名称或代码" data-list-search="pool">
      </label>
      <label>
        <span>分组</span>
        <select class="select" data-filter="group">
          <option value="all" ${state.filters.group === "all" ? "selected" : ""}>全部分组</option>
          ${state.groups.map((group) => `<option value="${escapeAttr(group.id)}" ${state.filters.group === group.id ? "selected" : ""}>${escapeHtml(group.name)}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>估值状态</span>
        <select class="select" data-filter="status">
          ${[
            ["all", "全部状态"],
            ["undervalued", "低估"],
            ["fair", "合理"],
            ["overvalued", "高估"],
            ["unpriced", "未估值/待价格"],
          ].map(([value, label]) => `<option value="${value}" ${state.filters.status === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </label>
    </section>

    <section class="panel table-panel">
      <div class="panel-head">
        <h2>股票池列表</h2>
        <span>${rows.length} / ${state.watchlist.length} 只</span>
      </div>
      ${renderWatchTable(rows)}
    </section>
  `;
}

function renderStockDetail(id) {
  if (!id) {
    location.hash = "#/pool";
    return;
  }

  ensureDetail(id);

  if (state.detailLoading || !state.detail || state.detailId !== id) {
    app.innerHTML = `<section class="loading">正在整理个股手账...</section>`;
    return;
  }

  if (state.detailError) {
    app.innerHTML = `
      <section class="notice warning">${escapeHtml(state.detailError)}</section>
      <a class="button" href="#/pool">回到股票池</a>
    `;
    return;
  }

  const item = state.detail.item;
  const price = item.price || {};
  const valuation = item.valuation || {};
  const inWatchlist = Boolean(state.detail.in_watchlist);
  ensureChart(item.ts_code);
  app.innerHTML = `
    ${renderToast()}
    <section class="detail-head">
      <div>
        <a class="back-link" href="#/pool">返回股票池</a>
        <div class="detail-title">
          <h1>${escapeHtml(item.name)}</h1>
          <span>${escapeHtml(item.ts_code)}</span>
          <span>${escapeHtml(inWatchlist ? (item.group?.name || "默认股票池") : "未加入股票池")}</span>
        </div>
        <p>${escapeHtml([item.industry, item.area, item.market].filter(Boolean).join(" / ") || "A 股")}</p>
      </div>
      <div class="head-actions">
        <button class="button soft" data-action="start-decision" data-code="${escapeAttr(item.ts_code)}">加入验证</button>
        ${inWatchlist
          ? `<button class="button" data-action="edit-stock" data-id="${escapeAttr(item.id)}">编辑估值</button>`
          : `<button class="button primary" data-action="add-detail-stock" data-code="${escapeAttr(item.ts_code)}">加入股票池</button>`}
        <button class="button ${inWatchlist ? "primary" : ""}" data-action="start-sync">同步收盘数据</button>
      </div>
    </section>

    <section class="detail-kpis">
      ${renderStat("最新收盘", formatNumber(price.close, 2), "", `价格日期 ${formatDate(price.trade_date)}`)}
      ${renderStat("涨跌幅", formatPct(price.pct_chg), "", formatSigned(price.change, 2))}
      ${renderStat("估值状态", valuation.label || "未估值", "", "基于你的估值区间")}
      ${renderStat("偏离合理价值", formatPct(valuation.deviation_pct), "", "现价相对合理价值")}
    </section>

    <section class="detail-layout">
      <article class="panel chart-panel">
        <div class="panel-head">
          <h2>价格与估值线</h2>
          <span>${chartPeriodLabel(state.chartPeriod)} + 低估线 / 合理价值 / 高估线</span>
        </div>
        ${renderChartTabs()}
        <div class="chart-wrap">
          ${state.chartLoading ? `<div class="loading compact">正在加载${chartPeriodLabel(state.chartPeriod)}...</div>` : ""}
          ${state.chartError ? `<div class="notice warning">${escapeHtml(state.chartError)}</div>` : ""}
          <canvas id="detailChart" aria-label="价格与估值线"></canvas>
          <div class="chart-tooltip stock-price-tooltip" id="detailChartTooltip" hidden></div>
        </div>
      </article>

      <article class="panel valuation-panel">
        <div class="panel-head">
          <h2>估值区间</h2>
          <span>${formatDateTime(item.valuation_updated_at) || "尚未调整"}</span>
        </div>
        <dl class="value-list">
          <div><dt>低估线</dt><dd>${formatCurrency(item.low_price)}</dd></div>
          <div><dt>合理价值</dt><dd>${formatCurrency(item.fair_price)}</dd></div>
          <div><dt>高估线</dt><dd>${formatCurrency(item.high_price)}</dd></div>
          <div><dt>价格日期</dt><dd>${formatDate(price.trade_date)}</dd></div>
        </dl>
        <div class="memo-block">
          <strong>备注</strong>
          <p>${escapeHtml(item.note || "暂无备注")}</p>
        </div>
        <div class="memo-block">
          <strong>估值依据</strong>
          <p>${escapeHtml(item.valuation_basis || "暂无估值依据")}</p>
        </div>
      </article>
    </section>

    <section class="panel info-panel">
      <div class="tabs" role="tablist">
        ${renderTab("analysis", "公司分析")}
        ${renderTab("history", "估值流水")}
        ${renderTab("reports", "研报记录")}
        ${renderTab("links", "新闻与公告入口")}
      </div>
      ${renderDetailTab()}
    </section>
  `;

  requestAnimationFrame(drawDetailChart);
}

function renderMarket() {
  ensureMarket();
  app.innerHTML = `
    ${renderToast()}
    <section class="page-head">
      <div>
        <p class="eyebrow">Anomaly Monitor</p>
        <h1 class="page-title">龙虎榜观察</h1>
        <p class="page-subtitle">以龙虎榜为主视角，右侧用北向十大成交补充板块线索。</p>
      </div>
      <div class="head-actions">
        <button class="button primary" data-action="refresh-market">刷新观察榜</button>
      </div>
    </section>
    ${state.marketLoading ? `<section class="loading">正在读取龙虎榜和北向十大成交...</section>` : renderMarketContent()}
  `;
}

function renderTurnoverMonitor() {
  ensureTurnoverMonitor();
  app.innerHTML = `
    ${renderToast()}
    <section class="page-head">
      <div>
        <p class="eyebrow">Turnover Watch</p>
        <h1 class="page-title">换手率异动监控</h1>
        <p class="page-subtitle">最近 24 周内寻找三周连续放量上涨，随后 4-11 周出现两天缩量但仍守在 20 周线附近的股票。</p>
      </div>
      <div class="head-actions">
        <button class="button primary" data-action="refresh-turnover-monitor">刷新监控</button>
      </div>
    </section>

    ${state.turnoverLoading ? `<section class="loading">正在扫描全市场换手率异动，首次运行可能需要一两分钟...</section>` : renderTurnoverContent()}
  `;
}

function renderTurnoverContent() {
  if (state.turnoverError) {
    return `<section class="notice warning">${escapeHtml(state.turnoverError)}</section>`;
  }
  if (!state.turnoverMonitor) {
    return `<section class="empty-inline">点击刷新监控读取数据</section>`;
  }

  const monitor = state.turnoverMonitor;
  const rows = filterRowsByQuery(monitor.rows || [], state.turnoverQuery, [
    "name",
    "ts_code",
    "industry",
    "area",
  ]);

  return `
    <section class="stat-grid turnover-stats">
      ${renderStat("命中股票", rows.length, "只", `${formatDate(monitor.start_date)} - ${formatDate(monitor.end_date)}`)}
      ${renderStat("扫描窗口", monitor.scan_weeks || 24, "周", `历史回看 ${monitor.lookback_weeks || "--"} 周`)}
      ${renderStat("规则", "3+2", "", "三周放量上涨 + 两天缩量企稳")}
      ${renderStat("生成时间", formatDateTime(monitor.generated_at) || "--", "", monitor.error_count ? `${monitor.error_count} 个交易日读取失败` : "数据读取正常")}
    </section>

    <section class="panel turnover-rule">
      <div class="panel-head">
        <h2>监控口径</h2>
        <span>周换手率按日换手率求和，20 周线按周收盘均线计算</span>
      </div>
      <div class="rule-chips">
        <span>连续 3 周换手率 &gt; 15%</span>
        <span>3 周股价总涨幅 &gt; 20%</span>
        <span>第 4-11 周出现连续 2 天换手率 &lt; 10%</span>
        <span>信号日收盘价不低于 20 周线下方 2%</span>
      </div>
      ${monitor.error_count ? `<div class="notice warning compact-note">部分交易日读取失败，本次结果可能不完整；可以稍后点刷新监控重跑。</div>` : ""}
    </section>

    <section class="panel table-panel turnover-panel">
      <div class="panel-head">
        <h2>异动股票列表</h2>
        <span>${rows.length} / ${(monitor.rows || []).length} 只</span>
      </div>
      ${renderListSearch("turnover", state.turnoverQuery, "输入股票名称、代码或行业")}
      ${renderTurnoverTable(rows)}
    </section>
  `;
}

function renderTurnoverTable(rows) {
  const pageSize = 30;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  if (state.turnoverPage > totalPages) {
    state.turnoverPage = totalPages;
  }
  if (state.turnoverPage < 1) {
    state.turnoverPage = 1;
  }
  const start = (state.turnoverPage - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  if (!rows.length) {
    return `<div class="empty-inline">当前没有匹配的异动股票</div>`;
  }

  return `
    <div class="turnover-table">
      <div class="turnover-head">
        <span>股票</span>
        <span>放量上涨</span>
        <span>缩量信号</span>
        <span>20 周线位置</span>
        <span>最新价</span>
        <span>行业</span>
      </div>
      ${pageRows.map((row) => `
        <article class="turnover-row clickable" data-action="open-stock" data-code="${escapeAttr(row.ts_code || "")}">
          <button class="stock-cell" data-action="open-stock" data-code="${escapeAttr(row.ts_code || "")}">
            <strong>${escapeHtml(row.name || row.ts_code)}</strong>
            <span>${escapeHtml(row.ts_code)}</span>
          </button>
          <span>
            <strong class="${toneClass(row.setup_gain_pct)}">${formatPct(row.setup_gain_pct)}</strong>
            <small>${formatDate(row.setup_start_week)} - ${formatDate(row.setup_end_week)}</small>
            <small>周换手 ${formatTurnoverWeeks(row.weekly_turnover_rates)}</small>
          </span>
          <span>
            <strong>${formatDate(row.signal_date)}</strong>
            <small>连续日 ${formatDate(row.signal_first_date)} / ${formatDate(row.signal_date)}</small>
            <small>换手 ${formatPct(row.signal_turnover_rate)}</small>
          </span>
          <span>
            <strong class="${toneClass(row.gap_to_ma20_pct)}">${formatPct(row.gap_to_ma20_pct)}</strong>
            <small>收盘 ${formatNumber(row.signal_close, 2)} / 20 周线 ${formatNumber(row.ma20, 2)}</small>
          </span>
          <span>
            <strong>${formatNumber(row.latest_close, 2)}</strong>
            <small>${formatDate(row.latest_trade_date)}</small>
            <small class="${toneClass(row.latest_pct_from_signal)}">信号后 ${formatPct(row.latest_pct_from_signal)}</small>
          </span>
          <span>${escapeHtml(row.industry || row.area || "--")}</span>
        </article>
      `).join("")}
    </div>
    ${renderPagination("turnover", state.turnoverPage, totalPages, rows.length)}
  `;
}

function renderShortStrategyMonitorList() {
  const items = filterRowsByQuery(state.strategyMonitors || [], state.strategyMonitorQuery, [
    "stock_name",
    "ts_code",
    "intraday.type",
    "intraday.strategy",
    "tplus1.strategy_text",
    "grid.strategy_text",
  ]);

  app.innerHTML = `
    ${renderToast()}
    <section class="page-head">
      <div>
        <p class="eyebrow">Short Strategy Watchlist</p>
        <h1 class="page-title">短线监控列表</h1>
        <p class="page-subtitle">保存你关注股票的 T+1 日内做T 与 7-15 日网格策略快照，用列表快速复盘低吸区间、高抛区间、风险等级与策略提示。</p>
      </div>
      <div class="head-actions">
        <a class="button primary" href="#/short-strategy">新增策略参考</a>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>已保存策略</h2>
          <span>同一只股票重复保存会覆盖为最新策略，避免列表里出现重复记录。</span>
        </div>
        <span>${items.length} / ${(state.strategyMonitors || []).length} 只</span>
      </div>
      <div class="list-search-row">
        <label>
          <span>搜索</span>
          <input class="input" value="${escapeAttr(state.strategyMonitorQuery)}" data-list-search="strategyMonitor" placeholder="输入股票名称、代码或策略提示">
        </label>
      </div>
      <div class="strategy-monitor-list">
        ${items.length ? items.map(renderShortStrategyMonitorItem).join("") : `<div class="empty-inline">暂无保存的短线策略。先进入策略参考页生成一只股票，再保存到短线监控列表。</div>`}
      </div>
    </section>
    ${renderShortStrategyDisclaimer()}
  `;
}

function renderShortStrategyMonitorItem(item) {
  const tplus1 = item.tplus1 || {};
  const grid = item.grid || {};
  const intraday = item.intraday || {};
  const intradayExtra = intraday.type
    ? `${intraday.type} / 回撤 ${formatRatioPct(intraday.avg_drawdown_amplitude)} / 反弹 ${formatRatioPct(intraday.avg_rebound_amplitude)}`
    : "";
  return `
    <article class="strategy-monitor-card">
      <div class="strategy-monitor-head">
        <div>
          <strong>${escapeHtml(item.stock_name || item.ts_code || "--")}</strong>
          <span>${escapeHtml(item.ts_code || "--")} / 更新 ${formatDateTime(item.updated_at)} / 行情日 ${formatDate(item.latest_trade_date)}</span>
        </div>
        <div class="strategy-monitor-actions">
          <a class="button tiny" href="#/short-strategy/${encodeURIComponent(item.ts_code || "")}">查看详情</a>
          <button class="button tiny" data-action="delete-short-strategy-monitor" data-id="${escapeAttr(item.id)}">删除</button>
        </div>
      </div>
      <div class="strategy-monitor-lines">
        ${renderShortStrategyMonitorLine({
          title: "T+1 日内做T",
          rangeLabel: "低吸区间",
          rangeValue: formatStrategyMonitorRange(tplus1.buy_zone_lower, tplus1.buy_zone_upper),
          secondLabel: "高抛区间",
          secondValue: formatStrategyMonitorRange(tplus1.sell_zone_lower, tplus1.sell_zone_upper),
          risk: tplus1.risk_level,
          note: tplus1.strategy_text,
          extra: intradayExtra,
        })}
        ${renderShortStrategyMonitorLine({
          title: "7-15 日网格策略",
          rangeLabel: "网格下沿",
          rangeValue: formatStrategyMonitorPrice(grid.grid_lower),
          secondLabel: "网格上沿",
          secondValue: formatStrategyMonitorPrice(grid.grid_upper),
          risk: grid.risk_level,
          note: grid.strategy_text,
          extra: `${grid.horizon_days || "--"} 个交易日 / ${gridSuitabilityLabel(grid.suitability)}`,
        })}
      </div>
    </article>
  `;
}

function renderShortStrategyMonitorLine({ title, rangeLabel, rangeValue, secondLabel, secondValue, risk, note, extra = "" }) {
  const riskClass = shortStrategyRiskClass(risk || "medium");
  return `
    <div class="strategy-monitor-line">
      <strong>${escapeHtml(title)}</strong>
      <span><em>${escapeHtml(rangeLabel)}</em>${escapeHtml(rangeValue)}</span>
      <span><em>${escapeHtml(secondLabel)}</em>${escapeHtml(secondValue)}</span>
      <span class="strategy-monitor-risk ${escapeAttr(riskClass)}"><em>风险等级</em>${escapeHtml(riskLevelLabel(risk || "medium"))}</span>
      ${extra ? `<span><em>参数</em>${escapeHtml(extra)}</span>` : ""}
      <p>${escapeHtml(note || "--")}</p>
    </div>
  `;
}

function shortStrategyRiskClass(risk) {
  return {
    low: "risk-low",
    medium: "risk-medium",
    high: "risk-high",
    extreme: "risk-extreme",
  }[risk] || "risk-medium";
}

function formatStrategyMonitorRange(lower, upper) {
  if (!Number.isFinite(Number(lower)) && !Number.isFinite(Number(upper))) {
    return "--";
  }
  return `${formatStrategyMonitorPrice(lower)} - ${formatStrategyMonitorPrice(upper)}`;
}

function formatStrategyMonitorPrice(value) {
  return Number.isFinite(Number(value)) ? `${formatNumber(Number(value), 2)} 元` : "--";
}

function renderShortStrategyPage() {
  if (state.route.id && state.route.id !== state.strategyCode && !state.strategyLoading) {
    state.strategyCode = state.route.id;
    state.strategySearch = state.route.id;
    state.strategyData = null;
    state.strategyError = "";
  }
  ensureShortStrategy();
  const model = state.strategyData ? buildShortStrategyModel() : null;
  const status = shortStrategyStatus(model);

  app.innerHTML = `
    ${renderToast()}
    <section class="page-head">
      <div>
        <p class="eyebrow">Grid Strategy</p>
        <h1 class="page-title">短线策略参考</h1>
        <p class="page-subtitle">基于历史振幅、均线、量能、ATR、支撑压力和涨跌停价格做区间测算，只提供可观察的参考条件，不做交易下单和确定性判断。</p>
      </div>
      <div class="head-actions">
        <a class="button" href="#/short-strategies">返回监控列表</a>
        ${model && status === "success" ? `<button class="button" data-action="save-short-strategy-monitor" ${state.strategyMonitorSaving ? "disabled" : ""}>${state.strategyMonitorSaving ? "保存中..." : "保存到短线监控"}</button>` : ""}
        <button class="button primary" data-action="load-short-strategy">读取策略数据</button>
      </div>
    </section>

    ${renderShortStrategySearch()}
    ${renderShortStrategyState(status, model)}
    ${renderShortStrategyDisclaimer()}
  `;
}

function renderShortStrategySearch() {
  return `
    <section class="panel strategy-search-panel">
      <div class="panel-head">
        <div>
          <h2>选择股票</h2>
          <span>输入股票名称或代码，从联想结果中选择后生成 T+1 和网格策略参考。</span>
        </div>
        <span class="muted">前端只请求本地后端接口，不展示 Tushare token</span>
      </div>
      <div class="strategy-search-row">
        <label>
          <span>股票名称或代码</span>
          <input class="input" value="${escapeAttr(state.strategySearch)}" placeholder="例如 阳光电源 或 300274.SZ" data-list-search="strategy" data-stock-suggest-kind="strategy" autocomplete="off">
          ${renderStockSuggestDropdown("strategy")}
        </label>
        <button class="button primary" data-action="load-short-strategy" ${state.strategyLoading ? "disabled" : ""}>${state.strategyLoading ? "读取中..." : "生成参考"}</button>
      </div>
    </section>
  `;
}

function renderShortStrategyState(status, model) {
  if (state.strategyLoading) {
    return `<section class="loading">正在加载行情数据...</section>`;
  }
  if (state.strategyError) {
    return `<section class="notice warning">行情数据加载失败，请稍后重试：${escapeHtml(state.strategyError)}</section>`;
  }
  if (!state.strategyData) {
    return `<section class="empty-inline">请选择一只股票生成短线策略参考。</section>`;
  }
  if (status === "empty") {
    return `<section class="empty-inline">暂无行情数据。</section>`;
  }
  if (status === "suspended") {
    return `<section class="notice warning">当前股票可能处于停牌状态，无法生成策略。</section>`;
  }
  if (status === "insufficientData") {
    return `<section class="notice warning">历史交易数据不足，暂无法生成可靠策略。至少需要 20 个有效交易日。</section>`;
  }
  if (!model) {
    return `<section class="notice warning">行情数据暂无法完成测算。</section>`;
  }

  return `
    ${renderShortStrategyQuote(model)}
    ${renderShortStrategyCharts(model)}
    ${renderShortStrategyCommon(model)}
    <section class="panel strategy-tabs-panel">
      <div class="tabs" role="tablist">
        <button class="${state.strategyTab === "tplus1" ? "active" : ""}" data-action="set-short-strategy-tab" data-tab="tplus1">T+1 日内做T</button>
        <button class="${state.strategyTab === "grid" ? "active" : ""}" data-action="set-short-strategy-tab" data-tab="grid">7-15日网格策略</button>
      </div>
      ${state.strategyTab === "grid" ? renderGridStrategyTab(model) : renderTPlus1StrategyTab(model)}
    </section>
  `;
}

function renderShortStrategyQuote(model) {
  const quote = model.quote || {};
  return `
    <section class="panel strategy-quote-panel">
      <div class="panel-head">
        <div>
          <h2>${escapeHtml(model.stockName)} <small>${escapeHtml(model.tsCode)}</small></h2>
          <span>${escapeHtml(model.industry || "行业未标记")} / 数据源：${model.meta.source === "pro_bar" ? "前复权行情优先" : "日线行情降级测算"}</span>
        </div>
        <span>${quote.isRealtime ? "实时行情" : "盘后收盘价测算"} · ${formatDateTime(quote.updateTime || model.meta.updateTime)}</span>
      </div>
      ${!quote.isRealtime ? `<div class="notice compact-note">当前未获取到实时行情，页面基于最新交易日收盘价进行测算，仅供盘后复盘参考。</div>` : ""}
      <div class="strategy-quote-strip">
        ${renderStrategyMiniInfo("当前价", formatNumber(model.currentPrice, 2), "元")}
        ${renderStrategyMiniInfo("涨跌幅", formatSigned(model.latest?.changePercent, 2), "%")}
        ${renderStrategyMiniInfo("今日高低", `${formatNumber(model.latest?.high, 2)} / ${formatNumber(model.latest?.low, 2)}`, "元")}
        ${renderStrategyMiniInfo("昨收", formatNumber(model.latest?.preClose, 2), "元")}
        ${renderStrategyMiniInfo("成交量", formatNumber(quote.volume || model.latest?.volume, 2), "手")}
        ${renderStrategyMiniInfo("换手率", formatPlainRatio(model.latest?.turnoverRate), "")}
        ${renderStrategyMiniInfo("量比", formatNumber(model.latest?.volumeRatio, 2), "")}
        ${renderStrategyMiniInfo("数据日期", formatDate(model.latestTradeDate), "")}
      </div>
    </section>
  `;
}

function renderShortStrategyCommon(model) {
  const analysis = model.analysis;
  return `
    <section class="panel strategy-common-panel">
      <div class="panel-head">
        <div>
          <h2>通用分析结果</h2>
          <span>两个策略共用同一组清洗后的历史行情、均线、量能和涨跌停状态。</span>
        </div>
        <span>统计周期：近 ${analysis.sampleSize} 个有效交易日</span>
      </div>
      <div class="strategy-kpi-grid">
        ${renderStrategyInfo("平均振幅", formatRatioPct(analysis.avgAmplitude), "")}
        ${renderStrategyInfo("中位数振幅", formatRatioPct(analysis.medianAmplitude), "")}
        ${renderStrategyInfo("最大振幅", formatRatioPct(analysis.maxAmplitude), "")}
        ${renderStrategyInfo("最小振幅", formatRatioPct(analysis.minAmplitude), "")}
        ${renderStrategyInfo("有效振幅", formatRatioPct(analysis.effectiveAmplitude), volatilityLevelLabel(analysis.volatilityLevel))}
        ${renderStrategyInfo("MA5 / MA10 / MA20", `${formatNumber(analysis.ma5, 2)} / ${formatNumber(analysis.ma10, 2)} / ${formatNumber(analysis.ma20, 2)}`, "元")}
        ${renderStrategyInfo("趋势状态", trendLabel(analysis.trend), "按价格与均线组合判断")}
        ${renderStrategyInfo("量能状态", volumeSignalLabel(analysis.volumeSignal), "结合成交量与量比")}
        ${renderStrategyInfo("涨跌停状态", limitStatusLabel(analysis.limitStatus), "基于最新涨跌停价")}
        ${renderStrategyInfo("基础风险等级", riskLevelLabel(analysis.riskLevel), riskHint(analysis.riskLevel))}
      </div>
    </section>
  `;
}

function renderShortStrategyCharts(model) {
  return `
    <section class="strategy-chart-grid">
      <article class="panel">
        <div class="panel-head">
          <h2>网格价格线</h2>
          <span>展示网格上下沿和每一档网格线</span>
        </div>
        ${renderGridStrategySvg(model)}
      </article>
      <article class="panel">
        <div class="panel-head">
          <h2>历史每日振幅</h2>
          <span>柱越高代表日内高低价区间越大</span>
        </div>
        ${renderAmplitudeSvg(model)}
      </article>
      <article class="panel">
        <div class="panel-head">
          <h2>价格走势与 T+1 区间</h2>
          <span>收盘价、均线与低吸/高抛参考区</span>
        </div>
        ${renderPriceStrategySvg(model)}
      </article>
    </section>
  `;
}

function renderTPlus1StrategyTab(model) {
  const result = model.tplus1;
  return `
    <div class="strategy-tab-body">
      ${renderTPlus1Controls()}
      <section class="strategy-kpi-grid">
        ${renderStrategyInfo("下一交易日", formatDate(result.nextTradeDate), "")}
        ${renderStrategyInfo("基准价格", formatNumber(result.range.basePrice, 2), "元")}
        ${renderStrategyInfo("T+1低吸参考区", `${formatNumber(result.range.buyZoneLower, 2)} - ${formatNumber(result.range.buyZoneUpper, 2)}`, "元")}
        ${renderStrategyInfo("T+1高抛参考区", `${formatNumber(result.range.sellZoneLower, 2)} - ${formatNumber(result.range.sellZoneUpper, 2)}`, "元")}
        ${renderStrategyInfo("风险线", formatNumber(result.range.riskLine, 2), "元")}
        ${renderStrategyInfo("趋势判断", trendLabel(result.trend), "")}
        ${renderStrategyInfo("风险等级", riskLevelLabel(result.riskLevel), riskHint(result.riskLevel))}
        ${renderStrategyInfo("策略提示", result.strategyText, "")}
      </section>
      ${renderTPlus1ProbabilityPanel(model)}
    </div>
  `;
}

function renderTPlus1Controls() {
  const params = state.strategyTParams;
  return `
    <section class="strategy-controls">
      ${renderStrategySelect("统计周期", "t", "period", params.period, [
        [5, "近5日"], [10, "近10日"], [20, "近20日"], [60, "近60日"],
      ])}
      ${renderStrategySelect("基准价格", "t", "basePriceType", params.basePriceType, [
        ["latestClose", "最新收盘价"], ["ma5", "MA5"], ["ma10", "MA10"], ["holdingCost", "持仓成本价"], ["custom", "自定义价格"],
      ])}
      ${params.basePriceType === "holdingCost" ? renderStrategyNumber("持仓成本价", "t", "holdingCost", params.holdingCost, "元") : ""}
      ${params.basePriceType === "custom" ? renderStrategyNumber("自定义基准价", "t", "customBasePrice", params.customBasePrice, "元") : ""}
      ${renderStrategyNumber("安全边际", "t", "safetyMargin", params.safetyMargin, "小数，例如 0.003")}
      ${renderStrategyCheckbox("趋势过滤", "t", "enableTrendFilter", params.enableTrendFilter)}
      ${renderStrategyCheckbox("量能过滤", "t", "enableVolumeFilter", params.enableVolumeFilter)}
      ${renderStrategyCheckbox("涨跌停过滤", "t", "enableLimitFilter", params.enableLimitFilter)}
    </section>
  `;
}

function renderGridStrategyTab(model) {
  const result = model.grid;
  return `
    <div class="strategy-tab-body">
      ${renderGridControls()}
      <section class="strategy-kpi-grid">
        ${renderStrategyInfo("网格周期", `${result.horizonDays} 个交易日`, "")}
        ${renderStrategyInfo("网格适配性", gridSuitabilityLabel(result.suitability), gridSuitabilityHint(result.suitability))}
        ${renderStrategyInfo("网格中枢价", formatNumber(result.centerPrice, 2), "元")}
        ${renderStrategyInfo("网格下沿", formatNumber(result.gridLower, 2), "元")}
        ${renderStrategyInfo("网格上沿", formatNumber(result.gridUpper, 2), "元")}
        ${renderStrategyInfo("网格数量", result.gridCount, "档")}
        ${renderStrategyInfo("每格价差", formatNumber(result.gridStep, 2), "元")}
        ${renderStrategyInfo("每格百分比", formatRatioPct(result.gridStepPercent), `最小有效 ${formatRatioPct(result.minGridStepPercent)}`)}
        ${renderStrategyInfo("ATR百分比", formatRatioPct(result.atrPercent), "")}
        ${renderStrategyInfo("周期波动率", formatRatioPct(result.horizonVolatility), "")}
        ${renderStrategyInfo("风险等级", riskLevelLabel(result.riskLevel), riskHint(result.riskLevel))}
        ${renderStrategyInfo("策略提示", result.strategyText, "")}
      </section>

      ${result.gridStepPercent < result.minGridStepPercent ? `<div class="notice warning compact-note">当前每格价差偏窄，可能被交易成本和滑点侵蚀，网格参考价值下降。</div>` : ""}
      ${renderGridLevels(result.levels)}
      ${renderGridStagePlans(result)}
    </div>
  `;
}

function renderGridControls() {
  const params = state.strategyGridParams;
  return `
    <section class="strategy-controls">
      ${renderStrategySelect("网格周期", "grid", "horizonDays", params.horizonDays, [
        [7, "7个交易日"], [10, "10个交易日"], [15, "15个交易日"],
      ])}
      ${renderStrategySelect("网格模式", "grid", "gridMode", params.gridMode, [
        ["conservative", "保守"], ["standard", "标准"], ["aggressive", "激进"],
      ])}
      ${renderStrategyNumber("自定义网格数量", "grid", "gridCount", params.gridCount, "留空自动")}
      ${renderStrategySelect("中枢价格", "grid", "centerPriceType", params.centerPriceType, [
        ["auto", "综合中枢"], ["latestClose", "最新收盘价"], ["ma10", "MA10"], ["ma20", "MA20"], ["holdingCost", "持仓成本价"], ["custom", "自定义价格"],
      ])}
      ${params.centerPriceType === "holdingCost" ? renderStrategyNumber("持仓成本价", "grid", "holdingCost", params.holdingCost, "元") : ""}
      ${params.centerPriceType === "custom" ? renderStrategyNumber("自定义中枢价", "grid", "customCenterPrice", params.customCenterPrice, "元") : ""}
      ${renderStrategyNumber("费率", "grid", "feeRate", params.feeRate, "小数，例如 0.0003")}
      ${renderStrategyNumber("滑点", "grid", "slippageRate", params.slippageRate, "小数，例如 0.0005")}
      ${renderStrategyNumber("安全边际", "grid", "safetyMargin", params.safetyMargin, "小数，例如 0.003")}
    </section>
  `;
}

function renderGridLevels(levels) {
  return `
    <section class="strategy-card">
      <h3>网格价格表</h3>
      <div class="grid-level-table">
        <span>档位</span>
        <span>价格</span>
        <span>区域</span>
        <span>参考说明</span>
        ${levels.map((level) => `
          <strong>${level.index}</strong>
          <span>${formatNumber(level.price, 2)} 元</span>
          <span>${gridZoneLabel(level.zone)}</span>
          <span>${escapeHtml(level.referenceText)}</span>
        `).join("")}
      </div>
    </section>
  `;
}

function renderGridStagePlans(result) {
  return `
    <section class="strategy-section-grid">
      <article class="strategy-card">
        <h3>7-15日阶段计划</h3>
        <div class="strategy-plan-list">
          ${result.stagePlans.map((item) => `
            <div>
              <strong>${escapeHtml(item.dateRangeText)}</strong>
              <span>${escapeHtml(item.focus)}</span>
              <p>${escapeHtml(item.text)}</p>
            </div>
          `).join("")}
        </div>
      </article>
      <article class="strategy-card">
        <h3>突破失效条件</h3>
        <div class="strategy-trigger-list">
          <div>
            <strong>向上突破</strong>
            <p>当前价格 &gt; 网格上沿 × (1 + 安全边际)：价格已向上突破网格上沿，可能进入趋势强化状态。普通震荡网格参考价值下降，需重新计算网格区间。</p>
          </div>
          <div>
            <strong>向下跌破</strong>
            <p>当前价格 &lt; 网格下沿 × (1 - 安全边际)：价格已跌破网格下沿，可能进入趋势走弱状态。普通网格模型可能失效，需优先关注风险控制。</p>
          </div>
        </div>
      </article>
    </section>
  `;
}

function renderTPlus1ProbabilityPanel(model) {
  const stats = model.tplus1?.probabilityStats || model.intradayStats;
  if (!stats || !stats.sampleSize) {
    return "";
  }
  const hasMinuteSequence = stats.amplitudeBasis === "minute-sequence";
  const basisText = hasMinuteSequence
    ? `最近 ${stats.sampleSize} 个有效交易日，已按分钟线先后顺序计算回撤振幅和反弹振幅。`
    : `最近 ${stats.sampleSize} 个有效交易日，按做T闭环方向拆分波动。当前未获取到完整分钟线，先用日线收盘价做保守近似，后续接入分时后可严格按高低点先后顺序计算。`;
  const drawdownDefinition = hasMinuteSequence
    ? "从盘中高点到其后低点的跌幅，适合观察“先卖后买”的空间。"
    : "从盘中高点到后续低点的跌幅，适合观察“先卖后买”的空间。日线保守近似：最高价到收盘价的回撤。";
  const reboundDefinition = hasMinuteSequence
    ? "从盘中低点到其后高点的涨幅，适合观察“先买后卖”的空间。"
    : "从盘中低点到后续高点的涨幅，适合观察“先买后卖”的空间。日线保守近似：最低价到收盘价的反弹。";
  return `
    <section class="strategy-card tplus-probability-panel">
      <div class="tplus-probability-head">
        <div>
          <h3>日内做T统计概率</h3>
          <p>${escapeHtml(basisText)}</p>
        </div>
        <span class="tplus-type-badge">${escapeHtml(stats.type)}</span>
      </div>
      <div class="tplus-definition-grid">
        <div>
          <strong>回撤振幅</strong>
          <span>${escapeHtml(drawdownDefinition)}</span>
        </div>
        <div>
          <strong>反弹振幅</strong>
          <span>${escapeHtml(reboundDefinition)}</span>
        </div>
      </div>
      <div class="tplus-type-copy">
        <strong>${escapeHtml(stats.condition)}</strong>
        <span>${escapeHtml(stats.strategy)}</span>
      </div>
      <div class="tplus-stat-grid">
        ${renderStrategyMiniInfo("平均回撤振幅", formatRatioPct(stats.avgDrawdownAmplitude), "先卖后买")}
        ${renderStrategyMiniInfo("平均反弹振幅", formatRatioPct(stats.avgReboundAmplitude), "先买后卖")}
        ${renderStrategyMiniInfo("回撤 ≥3% 概率", formatRatioPct(stats.drawdown3Probability), "")}
        ${renderStrategyMiniInfo("回撤 ≥4% 概率", formatRatioPct(stats.drawdown4Probability), "")}
        ${renderStrategyMiniInfo("反弹 ≥1% 概率", formatRatioPct(stats.rebound1Probability), "")}
        ${renderStrategyMiniInfo("回撤占优概率", formatRatioPct(stats.drawdownDominanceProbability), "")}
      </div>
      ${renderOpeningActionWinPanel(stats)}
      <div class="tplus-action-grid">
        <div>
          <h4>先卖后买观察位</h4>
          <p>${escapeHtml(stats.sellPrompt)}</p>
          <div class="tplus-level-list">
            ${stats.earlySellLevels.map((level) => `<span>${escapeHtml(level.label)} <strong>${formatNumber(level.price, 2)} 元</strong></span>`).join("")}
          </div>
        </div>
        <div>
          <h4>先买后卖观察位</h4>
          <p>${escapeHtml(stats.buyPrompt)}</p>
          <div class="tplus-level-list buy">
            ${stats.buyBackLevels.map((level) => `<span>${escapeHtml(level.label)} <strong>${formatNumber(level.price, 2)} 元</strong></span>`).join("")}
          </div>
        </div>
      </div>
      <div class="tplus-trigger-copy">
        <strong>盘中触发条件</strong>
        <span>如果回撤振幅占优，需要重点观察冲高乏力、放量转弱、指数走弱；如果反弹振幅占优，需要重点观察下探止跌、缩量企稳、指数修复。两种方向不能混用同一个普通振幅。</span>
      </div>
    </section>
  `;
}

function renderStrategyInfo(label, value, hint) {
  return `
    <div class="strategy-info">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value ?? "--"))}</strong>
      ${hint ? `<em>${escapeHtml(hint)}</em>` : ""}
    </div>
  `;
}

function renderStrategyMiniInfo(label, value, hint) {
  return `
    <span class="strategy-mini-info">
      <em>${escapeHtml(label)}</em>
      <strong>${escapeHtml(String(value ?? "--"))}</strong>
      ${hint ? `<small>${escapeHtml(hint)}</small>` : ""}
    </span>
  `;
}

function renderOpeningActionWinPanel(stats) {
  return renderOpeningActionWinPanelV2(stats);
  const rows = Array.isArray(stats.openingActionStats) ? stats.openingActionStats : [];
  if (!rows.length) {
    return "";
  }
  const thresholdText = formatRatioPct(rows[0]?.minEdge || 0.005, 1);
  const lowOpenText = formatRatioPct(Math.abs(rows[0]?.lowOpenThreshold || -0.003), 1);
  return `
    <div class="tplus-opening-panel">
      <div class="tplus-opening-head">
        <strong>开盘动作胜率</strong>
        <span>有效空间 ≥ ${escapeHtml(thresholdText)}；低开样本 = 开盘较昨收低 ${escapeHtml(lowOpenText)} 以上。</span>
      </div>
      <div class="tplus-win-grid">
        ${rows.map((row) => `
          <div class="tplus-win-card">
            <h4>近 ${escapeHtml(String(row.days))} 日</h4>
            <div class="tplus-win-row">
              <span>开盘就卖出胜率</span>
              <strong>${formatRatioPct(row.openSellWinRate)}</strong>
              <small>样本 ${escapeHtml(String(row.sampleSize || 0))}，平均回补空间 ${formatRatioPct(row.avgOpenSellDrawdown)}</small>
            </div>
            <div class="tplus-win-row">
              <span>低开卖出胜率</span>
              <strong>${formatRatioPct(row.lowOpenSellWinRate)}</strong>
              <small>低开样本 ${escapeHtml(String(row.lowOpenSampleSize || 0))}，低开后继续下探 ${formatRatioPct(row.avgLowOpenSellDrawdown)}</small>
            </div>
            <div class="tplus-win-row buy">
              <span>低开买入胜率</span>
              <strong>${formatRatioPct(row.lowOpenBuyWinRate)}</strong>
              <small>低开样本 ${escapeHtml(String(row.lowOpenSampleSize || 0))}，低开后反弹空间 ${formatRatioPct(row.avgLowOpenBuyRebound)}</small>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderOpeningActionWinPanelV2(stats) {
  const rows = Array.isArray(stats.openingActionStats) ? stats.openingActionStats : [];
  if (!rows.length) {
    return "";
  }
  const thresholdText = formatRatioPct(rows[0]?.minEdge || 0.005, 1);
  const lowOpenText = formatRatioPct(Math.abs(rows[0]?.lowOpenThreshold || -0.003), 1);
  const highOpenText = formatRatioPct(rows[0]?.highOpenThreshold || 0.003, 1);
  return `
    <div class="tplus-opening-panel">
      <div class="tplus-opening-head">
        <strong>开盘动作胜率</strong>
        <span>六种操作均按开盘后立刻执行计算；有效空间 ≥ ${escapeHtml(thresholdText)}；低开/高开样本 = 开盘较昨收低/高 ${escapeHtml(lowOpenText)} / ${escapeHtml(highOpenText)} 以上。</span>
      </div>
      <div class="tplus-win-grid">
        ${rows.map((row) => `
          <div class="tplus-win-card">
            <h4>近 ${escapeHtml(String(row.days))} 日</h4>
            ${renderOpeningActionWinRow({
              title: "开盘就卖出胜率",
              value: row.openSellWinRate,
              sample: row.sampleSize,
              hint: `全样本，开盘后平均可回补空间 ${formatRatioPct(row.avgOpenSellDrawdown)}`,
              action: "sell",
            })}
            ${renderOpeningActionWinRow({
              title: "开盘就买入胜率",
              value: row.openBuyWinRate,
              sample: row.sampleSize,
              hint: `全样本，开盘后平均可高抛空间 ${formatRatioPct(row.avgOpenBuyRebound)}`,
              action: "buy",
            })}
            ${renderOpeningActionWinRow({
              title: "低开卖出胜率",
              value: row.lowOpenSellWinRate,
              sample: row.lowOpenSampleSize,
              hint: `低开样本，开盘后继续下探 ${formatRatioPct(row.avgLowOpenSellDrawdown)}`,
              action: "sell",
            })}
            ${renderOpeningActionWinRow({
              title: "低开买入胜率",
              value: row.lowOpenBuyWinRate,
              sample: row.lowOpenSampleSize,
              hint: `低开样本，开盘后反弹空间 ${formatRatioPct(row.avgLowOpenBuyRebound)}`,
              action: "buy",
            })}
            ${renderOpeningActionWinRow({
              title: "高开卖出胜率",
              value: row.highOpenSellWinRate,
              sample: row.highOpenSampleSize,
              hint: `高开样本，开盘后回补空间 ${formatRatioPct(row.avgHighOpenSellDrawdown)}`,
              action: "sell",
            })}
            ${renderOpeningActionWinRow({
              title: "高开买入胜率",
              value: row.highOpenBuyWinRate,
              sample: row.highOpenSampleSize,
              hint: `高开样本，开盘后继续上冲 ${formatRatioPct(row.avgHighOpenBuyRebound)}`,
              action: "buy",
            })}
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderOpeningActionWinRow({ title, value, sample, hint, action }) {
  return `
    <div class="tplus-win-row ${action === "buy" ? "buy" : ""}">
      <span>${escapeHtml(title)}</span>
      <strong>${formatRatioPct(value)}</strong>
      <small>样本 ${escapeHtml(String(sample || 0))}，${escapeHtml(hint)}</small>
    </div>
  `;
}

function renderStrategySelect(label, group, name, value, options) {
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <select class="select" data-strategy-control="${escapeAttr(group)}" data-name="${escapeAttr(name)}">
        ${options.map(([optionValue, optionLabel]) => `<option value="${escapeAttr(optionValue)}" ${String(value) === String(optionValue) ? "selected" : ""}>${escapeHtml(optionLabel)}</option>`).join("")}
      </select>
    </label>
  `;
}

function renderStrategyNumber(label, group, name, value, hint) {
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <input class="input" type="number" step="0.0001" value="${escapeAttr(value ?? "")}" data-strategy-input="${escapeAttr(group)}" data-name="${escapeAttr(name)}" placeholder="${escapeAttr(hint || "")}">
    </label>
  `;
}

function renderStrategyCheckbox(label, group, name, checked) {
  return `
    <label class="strategy-check">
      <input type="checkbox" data-strategy-control="${escapeAttr(group)}" data-name="${escapeAttr(name)}" ${checked ? "checked" : ""}>
      <span>${escapeHtml(label)}</span>
    </label>
  `;
}

function renderShortStrategyDisclaimer() {
  return `
    <section class="strategy-disclaimer">
      本工具仅根据历史价格波动、均线、成交量、ATR、支撑压力和涨跌停价格进行区间测算，不构成任何投资建议。T+1做T策略和7-15日网格策略均不代表未来价格一定会触达相关区间。历史波动不代表未来走势，极端行情、重大消息、涨跌停、停牌、流动性不足等情况下模型可能失效。用户应结合自身风险承受能力独立判断。
    </section>
  `;
}

function shortStrategyStatus(model) {
  if (!state.strategyData) {
    return "empty";
  }
  if (!Array.isArray(state.strategyData.daily) || !state.strategyData.daily.length) {
    return "empty";
  }
  if (model?.suspended) {
    return "suspended";
  }
  if (!model || model.rows.length < 20) {
    return "insufficientData";
  }
  return "success";
}

function buildShortStrategyModel() {
  const payload = state.strategyData;
  if (!payload) {
    return null;
  }
  const rows = strategyPriceRows(payload);
  const latest = rows.at(-1);
  if (!latest) {
    return {
      rows,
      suspended: false,
    };
  }

  const quote = payload.realtimeQuote || {};
  const currentPrice = Number(quote.currentPrice) > 0 ? Number(quote.currentPrice) : latest.close;
  const analysis = buildStrategyAnalysis(rows, currentPrice, payload.limit);
  const tplus1 = buildTPlus1Strategy(payload, rows, analysis, currentPrice);
  analysis.riskLevel = calcStrategyRisk(analysis, tplus1.range);
  tplus1.riskLevel = analysis.riskLevel;
  tplus1.strategyText = tplus1StrategyText(analysis);
  const grid = buildGridStrategy(payload, rows, analysis, currentPrice);
  const suspended = latest.volume === 0 && latest.open === latest.high && latest.high === latest.low && latest.low === latest.close;
  const intradayStats = tplus1.probabilityStats;

  return {
    stockName: payload.stock?.stockName || latest.tsCode || "--",
    tsCode: payload.stock?.tsCode || latest.tsCode || "--",
    industry: payload.stock?.industry || "",
    meta: payload.meta || {},
    quote,
    rows,
    latest,
    latestTradeDate: latest.date,
    currentPrice,
    analysis,
    tplus1,
    grid,
    intradayStats,
    suspended,
  };
}

function strategyPriceRows(payload) {
  const metricByDate = new Map((payload.dailyBasic || []).map((row) => [String(row.trade_date || ""), row]));
  const rows = (payload.daily || [])
    .map((row) => {
      const metric = metricByDate.get(String(row.trade_date || "")) || {};
      return {
        date: String(row.trade_date || ""),
        tsCode: row.ts_code || payload.stock?.tsCode || "",
        open: toFiniteNumber(row.open),
        high: toFiniteNumber(row.high),
        low: toFiniteNumber(row.low),
        close: toFiniteNumber(row.close),
        preClose: toFiniteNumber(row.pre_close),
        changePercent: toFiniteNumber(row.pct_chg),
        volume: toFiniteNumber(row.vol),
        amount: toFiniteNumber(row.amount),
        turnoverRate: toFiniteNumber(metric.turnover_rate ?? metric.turnover_rate_f),
        volumeRatio: toFiniteNumber(metric.volume_ratio),
        ma5: toFiniteNumber(row.ma5 ?? row.ma_5),
        ma10: toFiniteNumber(row.ma10 ?? row.ma_10),
        ma20: toFiniteNumber(row.ma20 ?? row.ma_20),
      };
    })
    .filter(isValidStrategyPriceRow)
    .sort((a, b) => Number(a.date) - Number(b.date));

  return rows.map((row, index) => ({
    ...row,
    ma5: Number.isFinite(row.ma5) ? row.ma5 : calcMAAt(rows, index, 5),
    ma10: Number.isFinite(row.ma10) ? row.ma10 : calcMAAt(rows, index, 10),
    ma20: Number.isFinite(row.ma20) ? row.ma20 : calcMAAt(rows, index, 20),
  }));
}

function isValidStrategyPriceRow(row) {
  return Number.isFinite(row.high)
    && Number.isFinite(row.low)
    && Number.isFinite(row.close)
    && Number.isFinite(row.preClose)
    && row.preClose > 0
    && row.high >= row.low
    && row.open > 0
    && row.close > 0;
}

function buildStrategyAnalysis(rows, currentPrice, limit) {
  const sampleRows = rows.slice(-60);
  const amplitudes = sampleRows.map(calcAmplitude).filter((value) => value > 0);
  const latest = rows.at(-1) || {};
  const ma5 = latest.ma5 ?? calcMA(rows, 5);
  const ma10 = latest.ma10 ?? calcMA(rows, 10);
  const ma20 = latest.ma20 ?? calcMA(rows, 20);
  const return5 = calcTrailingReturn(rows, currentPrice, 5);
  const trend = calcTrend({ currentPrice, ma5, ma10, ma20, return5, rows });
  const volumeSignal = calcVolumeSignal(rows, currentPrice);
  const limitStatus = checkLimitStatus(currentPrice, limit);
  const effectiveAmplitude = calcEffectiveAmplitude(amplitudes);

  return {
    sampleSize: sampleRows.length,
    currentPrice,
    avgAmplitude: mean(amplitudes),
    medianAmplitude: median(amplitudes),
    maxAmplitude: amplitudes.length ? Math.max(...amplitudes) : null,
    minAmplitude: amplitudes.length ? Math.min(...amplitudes) : null,
    effectiveAmplitude,
    volatilityLevel: volatilityLevel(effectiveAmplitude),
    ma5,
    ma10,
    ma20,
    return5,
    trend,
    volumeSignal,
    limitStatus,
    riskLevel: "medium",
  };
}

function buildTPlus1Strategy(payload, rows, analysis, currentPrice) {
  const params = state.strategyTParams;
  const period = Number(params.period) || 20;
  const safety = safePositiveNumber(params.safetyMargin, 0.003);
  const rangeRows = rows.slice(-period);
  const effectiveAmplitude = calcEffectiveAmplitude(rangeRows.map(calcAmplitude));
  const basePrice = resolveTPlusBasePrice(params, analysis, currentPrice);
  const factor = getTPlus1Factor(analysis.trend);
  const buyRef = basePrice * (1 - effectiveAmplitude * factor.buyFactor);
  const sellRef = basePrice * (1 + effectiveAmplitude * factor.sellFactor);
  const range = {
    nextTradeDate: payload.meta?.nextTradeDate || "",
    basePrice,
    buyZoneLower: buyRef * (1 - safety),
    buyZoneUpper: buyRef,
    sellZoneLower: sellRef,
    sellZoneUpper: sellRef * (1 + safety),
    riskLine: buyRef * (1 - safety) * (1 - safety * 2),
  };
  const probabilityStats = buildTPlus1ProbabilityStats(rows, currentPrice, payload.intradayProfiles);

  return {
    strategyMode: "tPlus1",
    stockName: payload.stock?.stockName || "--",
    tsCode: payload.stock?.tsCode || "--",
    latestTradeDate: rows.at(-1)?.date || "",
    nextTradeDate: range.nextTradeDate,
    effectiveAmplitude,
    volatilityLevel: volatilityLevel(effectiveAmplitude),
    trend: analysis.trend,
    volumeSignal: analysis.volumeSignal,
    limitStatus: analysis.limitStatus,
    riskLevel: "medium",
    range,
    probabilityStats,
    openScenarioPlans: buildOpenScenarioPlans(range),
    strategyText: tplus1StrategyText(analysis),
    disclaimer: "仅供区间测算参考，不构成任何投资建议。",
  };
}

function buildTPlus1ProbabilityStats(rows, currentPrice, intradayProfiles = []) {
  const sample = rows.slice(-20).filter((row) => row.open > 0 && row.high >= row.low && row.preClose > 0 && row.close > 0);
  const dailyByDate = new Map(sample.map((row) => [row.date, row]));
  const minuteProfiles = normalizeTPlus1IntradayProfiles(intradayProfiles, dailyByDate);
  const useMinuteProfiles = minuteProfiles.length >= Math.min(10, Math.max(1, sample.length));
  const profiles = useMinuteProfiles
    ? minuteProfiles.slice(-20)
    : sample.map((row) => ({
      date: row.date,
      highFromOpen: row.high / row.open - 1,
      lowFromOpen: row.low / row.open - 1,
      closeFromOpen: row.close / row.open - 1,
      gapFromPrev: row.open / row.preClose - 1,
      openSellDrawdown: row.open > 0 ? Math.max(0, (row.open - row.low) / row.open) : 0,
      openBuyRebound: row.open > 0 ? Math.max(0, (row.high - row.open) / row.open) : 0,
      drawdownAmplitude: row.high > 0 ? Math.max(0, (row.high - row.close) / row.high) : 0,
      reboundAmplitude: row.low > 0 ? Math.max(0, (row.close - row.low) / row.low) : 0,
      potentialDrawdownAmplitude: row.high > 0 ? Math.max(0, (row.high - row.low) / row.high) : 0,
      potentialReboundAmplitude: row.low > 0 ? Math.max(0, (row.high - row.low) / row.low) : 0,
    }));
  const sampleSize = profiles.length;
  if (!sampleSize) {
    return null;
  }

  const avgHighFromOpen = mean(profiles.map((item) => item.highFromOpen)) || 0;
  const avgLowFromOpen = mean(profiles.map((item) => item.lowFromOpen)) || 0;
  const avgCloseFromOpen = mean(profiles.map((item) => item.closeFromOpen)) || 0;
  const avgDrawdownAmplitude = mean(profiles.map((item) => item.drawdownAmplitude)) || 0;
  const avgReboundAmplitude = mean(profiles.map((item) => item.reboundAmplitude)) || 0;
  const avgPotentialDrawdownAmplitude = mean(profiles.map((item) => item.potentialDrawdownAmplitude)) || 0;
  const avgPotentialReboundAmplitude = mean(profiles.map((item) => item.potentialReboundAmplitude)) || 0;
  const low3Probability = probabilityOf(profiles, (item) => item.lowFromOpen <= -0.03);
  const low4Probability = probabilityOf(profiles, (item) => item.lowFromOpen <= -0.04);
  const high1Probability = probabilityOf(profiles, (item) => item.highFromOpen >= 0.01);
  const drawdown3Probability = probabilityOf(profiles, (item) => item.drawdownAmplitude >= 0.03);
  const drawdown4Probability = probabilityOf(profiles, (item) => item.drawdownAmplitude >= 0.04);
  const rebound1Probability = probabilityOf(profiles, (item) => item.reboundAmplitude >= 0.01);
  const rebound2Probability = probabilityOf(profiles, (item) => item.reboundAmplitude >= 0.02);
  const drawdownDominanceProbability = probabilityOf(profiles, (item) => item.drawdownAmplitude >= item.reboundAmplitude * 1.2 && item.drawdownAmplitude >= 0.01);
  const reboundDominanceProbability = probabilityOf(profiles, (item) => item.reboundAmplitude >= item.drawdownAmplitude * 1.2 && item.reboundAmplitude >= 0.01);
  const openingActionStats = [20, 10].map((days) => buildOpeningActionStats(profiles, days));
  const shallowHighProbability = probabilityOf(profiles, (item) => item.highFromOpen <= 0.005);
  const weakCloseProbability = probabilityOf(profiles, (item) => item.closeFromOpen < 0);
  const gapDownRecoveryProbability = probabilityOf(profiles, (item) => item.gapFromPrev <= -0.01 && item.lowFromOpen <= -0.01 && item.closeFromOpen > 0);
  const type = classifyTPlus1DayType({
    avgHighFromOpen,
    avgLowFromOpen,
    avgCloseFromOpen,
    avgDrawdownAmplitude,
    avgReboundAmplitude,
    low3Probability,
    high1Probability,
    drawdown3Probability,
    drawdownDominanceProbability,
    rebound1Probability,
    reboundDominanceProbability,
    shallowHighProbability,
    weakCloseProbability,
    gapDownRecoveryProbability,
  });
  const typeInfo = tplus1DayTypeInfo(type);
  const referenceOpen = safePositiveNumber(currentPrice, sample.at(-1)?.close || 0);
  const earlySellRates = [0, -0.003, -0.005];
  const buyBackRates = [-0.03, -0.04];
  const hasSellEdge = drawdown3Probability >= 0.55 || (drawdownDominanceProbability >= 0.55 && avgDrawdownAmplitude > avgReboundAmplitude * 1.2);
  const hasBuyEdge = rebound1Probability >= 0.60 || (reboundDominanceProbability >= 0.50 && avgReboundAmplitude > avgDrawdownAmplitude * 1.1);
  const sellPrompt = hasSellEdge
    ? `最近20日回撤振幅均值为 ${formatRatioPct(avgDrawdownAmplitude)}，回撤 ≥3% 的概率为 ${formatRatioPct(drawdown3Probability)}。若盘中冲高乏力、分时转弱，可优先观察先卖后买，而不是只等更高冲高。`
    : `最近20日回撤振幅均值为 ${formatRatioPct(avgDrawdownAmplitude)}，回撤优势不够强。先卖后买需要等待冲高乏力、放量转弱或指数走弱确认。`;
  const buyPrompt = hasBuyEdge
    ? `最近20日反弹振幅均值为 ${formatRatioPct(avgReboundAmplitude)}，反弹 ≥1% 的概率为 ${formatRatioPct(rebound1Probability)}。若盘中先下探并出现止跌，可观察先买后卖。`
    : `最近20日反弹振幅均值为 ${formatRatioPct(avgReboundAmplitude)}，反弹优势不够强。先买后卖需要等待下探止跌、缩量企稳或指数修复确认。`;

  return {
    sampleSize,
    type,
    condition: typeInfo.condition,
    strategy: typeInfo.strategy,
    amplitudeBasis: useMinuteProfiles ? "minute-sequence" : "daily-close-conservative",
    avgHighFromOpen,
    avgLowFromOpen,
    avgCloseFromOpen,
    avgDrawdownAmplitude,
    avgReboundAmplitude,
    avgPotentialDrawdownAmplitude,
    avgPotentialReboundAmplitude,
    drawdown3Probability,
    drawdown4Probability,
    rebound1Probability,
    rebound2Probability,
    openingActionStats,
    drawdownDominanceProbability,
    reboundDominanceProbability,
    low3Probability,
    low4Probability,
    high1Probability,
    shallowHighProbability,
    weakCloseProbability,
    gapDownRecoveryProbability,
    sellPrompt,
    buyPrompt,
    earlySellLevels: earlySellRates.map((rate) => ({
      rate,
      label: rate === 0 ? "开盘附近 0%" : `开盘价 ${formatRatioPct(rate, 1)}`,
      price: referenceOpen * (1 + rate),
    })),
    buyBackLevels: buyBackRates.map((rate) => ({
      rate,
      label: `开盘价 ${formatRatioPct(rate, 1)}`,
      price: referenceOpen * (1 + rate),
    })),
  };
}

function normalizeTPlus1IntradayProfiles(intradayProfiles, dailyByDate) {
  if (!Array.isArray(intradayProfiles)) {
    return [];
  }
  return intradayProfiles
    .map((item) => {
      const date = String(item.trade_date || item.date || "");
      const daily = dailyByDate.get(date) || {};
      const open = toFiniteNumber(item.open);
      const preClose = toFiniteNumber(daily.preClose);
      const highFromOpen = toFiniteNumber(item.high_from_open ?? item.highFromOpen);
      const lowFromOpen = toFiniteNumber(item.low_from_open ?? item.lowFromOpen);
      const closeFromOpen = toFiniteNumber(item.close_from_open ?? item.closeFromOpen);
      const rawOpenSellDrawdown = toFiniteNumber(item.open_sell_drawdown ?? item.openSellDrawdown);
      const rawOpenBuyRebound = toFiniteNumber(item.open_buy_rebound ?? item.openBuyRebound);
      const drawdownAmplitude = toFiniteNumber(item.drawdown_amplitude ?? item.drawdownAmplitude);
      const reboundAmplitude = toFiniteNumber(item.rebound_amplitude ?? item.reboundAmplitude);
      const potentialDrawdownAmplitude = toFiniteNumber(item.potential_drawdown_amplitude ?? item.potentialDrawdownAmplitude);
      const potentialReboundAmplitude = toFiniteNumber(item.potential_rebound_amplitude ?? item.potentialReboundAmplitude);
      const openSellDrawdown = Number.isFinite(rawOpenSellDrawdown) ? rawOpenSellDrawdown : Math.max(0, -(lowFromOpen || 0));
      const openBuyRebound = Number.isFinite(rawOpenBuyRebound) ? rawOpenBuyRebound : Math.max(0, highFromOpen || 0);
      return {
        date,
        highFromOpen,
        lowFromOpen,
        closeFromOpen,
        gapFromPrev: Number.isFinite(open) && Number.isFinite(preClose) && preClose > 0 ? open / preClose - 1 : 0,
        openSellDrawdown,
        openBuyRebound,
        drawdownAmplitude,
        reboundAmplitude,
        potentialDrawdownAmplitude,
        potentialReboundAmplitude,
      };
    })
    .filter((item) => item.date
      && Number.isFinite(item.highFromOpen)
      && Number.isFinite(item.lowFromOpen)
      && Number.isFinite(item.closeFromOpen)
      && Number.isFinite(item.drawdownAmplitude)
      && Number.isFinite(item.reboundAmplitude))
    .sort((a, b) => Number(a.date) - Number(b.date));
}

function buildOpeningActionStats(profiles, days) {
  const sample = profiles.slice(-days);
  const minEdge = 0.005;
  const lowOpenThreshold = -0.003;
  const highOpenThreshold = 0.003;
  const lowOpenSample = sample.filter((item) => Number(item.gapFromPrev) <= lowOpenThreshold);
  const highOpenSample = sample.filter((item) => Number(item.gapFromPrev) >= highOpenThreshold);
  return {
    days,
    minEdge,
    lowOpenThreshold,
    highOpenThreshold,
    sampleSize: sample.length,
    lowOpenSampleSize: lowOpenSample.length,
    highOpenSampleSize: highOpenSample.length,
    openSellWinRate: probabilityOf(sample, (item) => Number(item.openSellDrawdown) >= minEdge),
    openBuyWinRate: probabilityOf(sample, (item) => Number(item.openBuyRebound) >= minEdge),
    lowOpenSellWinRate: lowOpenSample.length ? probabilityOf(lowOpenSample, (item) => Number(item.openSellDrawdown) >= minEdge) : Number.NaN,
    lowOpenBuyWinRate: lowOpenSample.length ? probabilityOf(lowOpenSample, (item) => Number(item.openBuyRebound) >= minEdge) : Number.NaN,
    highOpenSellWinRate: highOpenSample.length ? probabilityOf(highOpenSample, (item) => Number(item.openSellDrawdown) >= minEdge) : Number.NaN,
    highOpenBuyWinRate: highOpenSample.length ? probabilityOf(highOpenSample, (item) => Number(item.openBuyRebound) >= minEdge) : Number.NaN,
    avgOpenSellDrawdown: mean(sample.map((item) => item.openSellDrawdown)),
    avgOpenBuyRebound: mean(sample.map((item) => item.openBuyRebound)),
    avgLowOpenSellDrawdown: lowOpenSample.length ? mean(lowOpenSample.map((item) => item.openSellDrawdown)) : Number.NaN,
    avgLowOpenBuyRebound: lowOpenSample.length ? mean(lowOpenSample.map((item) => item.openBuyRebound)) : Number.NaN,
    avgHighOpenSellDrawdown: highOpenSample.length ? mean(highOpenSample.map((item) => item.openSellDrawdown)) : Number.NaN,
    avgHighOpenBuyRebound: highOpenSample.length ? mean(highOpenSample.map((item) => item.openBuyRebound)) : Number.NaN,
  };
}

function probabilityOf(items, predicate) {
  if (!items.length) {
    return 0;
  }
  return items.filter(predicate).length / items.length;
}

function classifyTPlus1DayType(stats) {
  if (stats.reboundDominanceProbability >= 0.60 && stats.rebound1Probability >= 0.65 && stats.weakCloseProbability <= 0.35) {
    return "单边上涨型";
  }
  if (stats.drawdownDominanceProbability >= 0.60 && stats.drawdown3Probability >= 0.50 && stats.weakCloseProbability >= 0.60) {
    return "单边下跌型";
  }
  if (stats.drawdown3Probability >= 0.45 && stats.shallowHighProbability >= 0.45 && stats.weakCloseProbability >= 0.50) {
    return "横盘跳水型";
  }
  if (stats.gapDownRecoveryProbability >= 0.35 || (stats.reboundDominanceProbability >= 0.45 && stats.avgReboundAmplitude > stats.avgDrawdownAmplitude * 1.2)) {
    return "低开反弹型";
  }
  if (stats.drawdownDominanceProbability >= 0.45 && stats.avgDrawdownAmplitude >= stats.avgReboundAmplitude * 1.15) {
    return "冲高回落型";
  }
  return "全天震荡型";
}

function tplus1DayTypeInfo(type) {
  const table = {
    "冲高回落型": {
      condition: "开盘后1小时内出现明显冲高，随后回落，日内高点通常早于低点。",
      strategy: "适合冲高先卖、回落买回。",
    },
    "横盘跳水型": {
      condition: "开盘后30~90分钟波动很小，随后突然下跌，低点通常出现在上午后段或下午。",
      strategy: "不能等冲高，需要在早盘弱势时提前卖出部分做T仓位，跳水后分批买回。",
    },
    "低开反弹型": {
      condition: "低开后快速下探，随后逐步修复。",
      strategy: "适合先买后卖。",
    },
    "全天震荡型": {
      condition: "全天围绕均价上下震荡，没有明显单边趋势。",
      strategy: "适合小仓位网格。",
    },
    "单边上涨型": {
      condition: "开盘后持续走强，回调很浅。",
      strategy: "不适合先卖，避免踏空。",
    },
    "单边下跌型": {
      condition: "开盘后持续走弱，反弹很弱。",
      strategy: "不建议做T，只能降低仓位或等待企稳。",
    },
  };
  return table[type] || table["全天震荡型"];
}

function resolveTPlusBasePrice(params, analysis, currentPrice) {
  if (params.basePriceType === "ma5" && Number.isFinite(analysis.ma5)) {
    return analysis.ma5;
  }
  if (params.basePriceType === "ma10" && Number.isFinite(analysis.ma10)) {
    return analysis.ma10;
  }
  if (params.basePriceType === "holdingCost") {
    return safePositiveNumber(params.holdingCost, currentPrice);
  }
  if (params.basePriceType === "custom") {
    return safePositiveNumber(params.customBasePrice, currentPrice);
  }
  return currentPrice;
}

function getTPlus1Factor(trend) {
  if (trend === "uptrend") return { buyFactor: 0.45, sellFactor: 0.60 };
  if (trend === "downtrend") return { buyFactor: 0.65, sellFactor: 0.45 };
  return { buyFactor: 0.50, sellFactor: 0.50 };
}

function buildOpenScenarioPlans(range) {
  return [
    {
      scenario: "strongGapUp",
      title: "极端高开",
      condition: `开盘价 > ${formatNumber(range.sellZoneUpper, 2)} 元`,
      text: "高开幅度超出历史常规波动区间，需警惕追高风险，也需观察是否进入趋势强化状态。",
    },
    {
      scenario: "gapUp",
      title: "高开",
      condition: `${formatNumber(range.sellZoneLower, 2)} - ${formatNumber(range.sellZoneUpper, 2)} 元`,
      text: "开盘价接近高抛参考区，可关注冲高回落和量能变化。",
    },
    {
      scenario: "flatOpen",
      title: "平开或中性",
      condition: `${formatNumber(range.buyZoneUpper, 2)} - ${formatNumber(range.sellZoneLower, 2)} 元`,
      text: "开盘价处于中性区，做T性价比一般，可等待价格接近低吸区或高抛区。",
    },
    {
      scenario: "gapDown",
      title: "低开",
      condition: `${formatNumber(range.buyZoneLower, 2)} - ${formatNumber(range.buyZoneUpper, 2)} 元`,
      text: "开盘价接近低吸参考区，可关注是否企稳以及抛压是否减弱。",
    },
    {
      scenario: "strongGapDown",
      title: "极端低开",
      condition: `开盘价 < ${formatNumber(range.buyZoneLower, 2)} 元`,
      text: "低开幅度超出历史常规波动区间，需警惕趋势走弱和流动性风险。",
    },
  ];
}

function tplus1Triggers() {
  return [
    { title: "价格触及低吸区", text: "可关注企稳、缩量、分时止跌情况。" },
    { title: "价格跌破低吸区", text: "需警惕历史振幅模型失效。" },
    { title: "价格处于中性区", text: "做T性价比一般，可继续等待。" },
    { title: "价格触及高抛区", text: "可关注冲高回落和量能变化。" },
    { title: "价格突破高抛区", text: "需判断是否进入趋势行情，不宜机械处理。" },
  ];
}

function tplus1StrategyText(analysis) {
  if (analysis.riskLevel === "extreme" || analysis.limitStatus === "nearDownLimit") {
    return "风险等级偏高，参考区间需要降权处理，优先观察模型是否失效。";
  }
  if (analysis.trend === "uptrend") {
    return "上升趋势中回落可能较浅，可重点观察高抛区附近的量价变化。";
  }
  if (analysis.trend === "downtrend") {
    return "下跌趋势中反弹空间可能较弱，低吸参考区需要结合企稳信号观察。";
  }
  return "震荡环境下区间测算相对更适合观察，触及区间后仍需结合量能与分时结构确认。";
}

function buildGridStrategy(payload, rows, analysis, currentPrice) {
  const params = state.strategyGridParams;
  const horizonDays = Number(params.horizonDays) || 10;
  const safety = safePositiveNumber(params.safetyMargin, 0.003);
  const centerPrice = resolveGridCenterPrice(params, analysis, currentPrice);
  const atr = calcATR(rows, 14);
  const atrPercent = centerPrice > 0 ? atr / centerPrice : 0;
  const baseVolatility = Math.max(analysis.effectiveAmplitude || 0, atrPercent || 0.03);
  const modeFactor = { conservative: 0.75, standard: 1, aggressive: 1.25 }[params.gridMode] || 1;
  const [minVol, maxVol] = gridVolatilityBounds(horizonDays);
  const horizonVolatility = clamp(baseVolatility * Math.sqrt(horizonDays) * modeFactor, minVol, maxVol);
  const initialLower = centerPrice * (1 - horizonVolatility);
  const initialUpper = centerPrice * (1 + horizonVolatility);
  const lookback = Math.max(20, horizonDays * 3);
  const lookbackRows = rows.slice(-lookback);
  const support = Math.min(...lookbackRows.map((row) => row.low));
  const resistance = Math.max(...lookbackRows.map((row) => row.high));
  let gridLower = Math.max(initialLower, support * (1 - safety * 2));
  let gridUpper = Math.min(initialUpper, resistance * (1 + safety * 2));
  if (!Number.isFinite(gridLower) || !Number.isFinite(gridUpper) || gridUpper <= gridLower || (gridUpper - gridLower) < (initialUpper - initialLower) * 0.35) {
    gridLower = initialLower;
    gridUpper = initialUpper;
  }

  const autoCount = gridAutoCount(horizonDays, params.gridMode);
  const gridCount = clamp(Math.round(Number(params.gridCount) || autoCount), 4, 15);
  const gridStep = (gridUpper - gridLower) / Math.max(1, gridCount - 1);
  const gridStepPercent = centerPrice > 0 ? gridStep / centerPrice : 0;
  const minGridStepPercent = Math.max(safePositiveNumber(params.feeRate, 0.0003) * 3 + safePositiveNumber(params.slippageRate, 0.0005) * 2, 0.008);
  const levels = buildGridLevels(gridLower, gridStep, gridCount);
  const suitability = calcGridSuitability({
    analysis,
    currentPrice,
    gridLower,
    gridUpper,
    minGridStepPercent,
    gridStepPercent,
    rows,
  });

  return {
    strategyMode: "grid",
    stockName: payload.stock?.stockName || "--",
    tsCode: payload.stock?.tsCode || "--",
    latestTradeDate: rows.at(-1)?.date || "",
    horizonDays,
    centerPrice,
    gridLower,
    gridUpper,
    support,
    resistance,
    effectiveAmplitude: analysis.effectiveAmplitude,
    atrPercent,
    horizonVolatility,
    gridMode: params.gridMode,
    gridCount,
    gridStep,
    gridStepPercent,
    minGridStepPercent,
    levels,
    suitability,
    trend: analysis.trend,
    volumeSignal: analysis.volumeSignal,
    limitStatus: analysis.limitStatus,
    riskLevel: analysis.riskLevel,
    stagePlans: buildGridStagePlans(horizonDays),
    strategyText: gridStrategyText(suitability, analysis),
    disclaimer: "仅供区间测算参考，不构成任何投资建议。",
  };
}

function resolveGridCenterPrice(params, analysis, currentPrice) {
  if (params.centerPriceType === "ma10" && Number.isFinite(analysis.ma10)) {
    return analysis.ma10;
  }
  if (params.centerPriceType === "ma20" && Number.isFinite(analysis.ma20)) {
    return analysis.ma20;
  }
  if (params.centerPriceType === "holdingCost") {
    return safePositiveNumber(params.holdingCost, currentPrice);
  }
  if (params.centerPriceType === "custom") {
    return safePositiveNumber(params.customCenterPrice, currentPrice);
  }
  if (params.centerPriceType === "auto" && Number.isFinite(analysis.ma10) && Number.isFinite(analysis.ma20)) {
    return currentPrice * 0.5 + analysis.ma10 * 0.3 + analysis.ma20 * 0.2;
  }
  return currentPrice;
}

function calcATR(rows, period) {
  const source = rows.slice(-period);
  if (!source.length) {
    return 0;
  }
  const trs = source.map((row) => Math.max(
    row.high - row.low,
    Math.abs(row.high - row.preClose),
    Math.abs(row.low - row.preClose),
  ));
  return mean(trs) || 0;
}

function gridVolatilityBounds(days) {
  if (Number(days) === 7) return [0.04, 0.12];
  if (Number(days) === 15) return [0.06, 0.22];
  return [0.05, 0.16];
}

function gridAutoCount(days, mode) {
  const table = {
    7: { conservative: 5, standard: 6, aggressive: 7 },
    10: { conservative: 6, standard: 8, aggressive: 10 },
    15: { conservative: 8, standard: 10, aggressive: 12 },
  };
  return table[Number(days)]?.[mode] || 8;
}

function buildGridLevels(lower, step, count) {
  return Array.from({ length: count }, (_, index) => {
    const zone = index < count / 3 ? "low" : index >= count * 2 / 3 ? "high" : "middle";
    return {
      index: index + 1,
      price: lower + step * index,
      zone,
      referenceText: {
        low: "低位网格区：价格触及后可关注增加一格网格仓位。",
        middle: "中枢网格区：以维持网格结构和等待触发为主。",
        high: "高位网格区：价格触及后可关注降低一格网格仓位。",
      }[zone],
    };
  });
}

function calcGridSuitability({ analysis, currentPrice, gridLower, gridUpper, minGridStepPercent, gridStepPercent, rows }) {
  if (!rows.length || analysis.riskLevel === "extreme" || analysis.limitStatus === "nearDownLimit" || gridStepPercent < minGridStepPercent) {
    return "notSuitable";
  }
  if (analysis.trend === "sideways"
    && analysis.effectiveAmplitude >= 0.02
    && analysis.effectiveAmplitude <= 0.06
    && analysis.limitStatus === "normal"
    && analysis.volumeSignal === "normal") {
    return "high";
  }
  if (analysis.trend === "uptrend"
    || analysis.trend === "downtrend"
    || analysis.limitStatus === "nearUpLimit"
    || (currentPrice > gridUpper && analysis.volumeSignal === "volumeUp")
    || (currentPrice < gridLower && analysis.volumeSignal === "volumeDown")) {
    return "low";
  }
  return "medium";
}

function buildGridStagePlans(horizonDays) {
  return [
    {
      stage: "early",
      dateRangeText: "D+1 至 D+3：初始观察阶段",
      focus: "观察价格是否围绕网格中枢波动",
      text: "重点观察价格是否围绕网格中枢波动。若价格快速触及上下沿，需要判断是否为趋势突破。",
    },
    {
      stage: "middle",
      dateRangeText: `D+4 至 D+${Math.max(5, horizonDays - 2)}：网格运行阶段`,
      focus: "观察低位、中枢、高位网格的触发情况",
      text: "价格触及低位网格时，可关注增加一格网格仓位；价格触及高位网格时，可关注降低一格网格仓位；价格处于中枢区时，以维持网格结构为主。",
    },
    {
      stage: "review",
      dateRangeText: `D+${Math.max(1, horizonDays - 1)} 至 D+${horizonDays}：复核阶段`,
      focus: "复核区间有效性与是否滚动下一周期",
      text: "若价格仍在网格区间内，可复核是否继续滚动下一周期；若价格突破上下沿，需要重新计算网格区间。",
    },
  ];
}

function gridStrategyText(suitability, analysis) {
  if (suitability === "notSuitable") {
    return "当前条件下普通网格参考价值较低，需优先观察风险是否释放。";
  }
  if (suitability === "low") {
    return "当前更像趋势或异常波动环境，网格区间仅作观察辅助，需警惕突破失效。";
  }
  if (suitability === "high") {
    return "当前更接近震荡波动结构，可重点观察价格在上下沿和中枢附近的触发情况。";
  }
  if (analysis.effectiveAmplitude >= 0.06) {
    return "有效振幅偏高，网格空间较宽，但波动风险也更高，需降低确定性预期。";
  }
  return "当前适合用网格区间观察价格节奏，触发后仍需结合量能和趋势状态复核。";
}

function calcAmplitude(item) {
  if (!item.preClose || item.preClose <= 0) return 0;
  return (item.high - item.low) / item.preClose;
}

function calcEffectiveAmplitude(values) {
  const valid = values.filter((value) => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
  if (!valid.length) return 0;
  if (valid.length < 10) return mean(valid);
  const trim = Math.floor(valid.length * 0.1);
  const arr = valid.slice(trim, valid.length - trim);
  return mean(arr);
}

function calcMA(rows, period) {
  if (rows.length < period) return null;
  return mean(rows.slice(-period).map((row) => row.close));
}

function calcMAAt(rows, index, period) {
  if (index + 1 < period) return null;
  return mean(rows.slice(index + 1 - period, index + 1).map((row) => row.close));
}

function calcTrailingReturn(rows, currentPrice, days) {
  if (rows.length <= days) {
    return null;
  }
  const base = rows.at(-days - 1)?.close;
  return base > 0 ? (currentPrice / base - 1) * 100 : null;
}

function calcTrend({ currentPrice, ma5, ma10, ma20, return5, rows }) {
  if (rows.length < 20 || ![currentPrice, ma5, ma10, ma20].every(Number.isFinite)) {
    return "unknown";
  }
  const upScore = [
    currentPrice > ma5,
    ma5 > ma10,
    ma10 > ma20,
    Number(return5) > 0,
  ].filter(Boolean).length;
  const downScore = [
    currentPrice < ma5,
    ma5 < ma10,
    ma10 < ma20,
    Number(return5) < -5,
  ].filter(Boolean).length;
  if (upScore >= 2) return "uptrend";
  if (downScore >= 2) return "downtrend";
  return "sideways";
}

function calcVolumeSignal(rows, currentPrice) {
  const latest = rows.at(-1);
  if (!latest || rows.length < 6) {
    return "unknown";
  }
  const avgVolume = mean(rows.slice(-6, -1).map((row) => row.volume).filter(Number.isFinite));
  if (!avgVolume) {
    return "unknown";
  }
  const volumeRatio = latest.volumeRatio;
  const isVolumeUp = latest.volume >= avgVolume * 1.3 || Number(volumeRatio) >= 1.3;
  const isVolumeDown = latest.volume <= avgVolume * 0.8 || Number(volumeRatio) <= 0.8;
  const recent = rows.slice(-20);
  const low = Math.min(...recent.map((row) => row.low));
  const high = Math.max(...recent.map((row) => row.high));
  const position = high > low ? (currentPrice - low) / (high - low) : 0.5;
  const nearHigh = position >= 0.75;
  const nearLow = position <= 0.25;
  if (nearHigh && isVolumeUp) return "volumeUp";
  if (nearHigh && isVolumeDown) return "shrinkUp";
  if (nearLow && isVolumeUp) return "volumeDown";
  if (nearLow && isVolumeDown) return "shrinkDown";
  return "normal";
}

function checkLimitStatus(currentPrice, limit) {
  if (!limit || !Number.isFinite(Number(limit.up_limit)) || !Number.isFinite(Number(limit.down_limit))) return "unknown";
  if (currentPrice >= Number(limit.up_limit) * 0.995) return "nearUpLimit";
  if (currentPrice <= Number(limit.down_limit) * 1.005) return "nearDownLimit";
  return "normal";
}

function calcStrategyRisk(analysis, range) {
  if (analysis.limitStatus === "nearDownLimit"
    || Number(analysis.return5) <= -12
    || (range && range.buyZoneLower > 0 && analysis.currentPrice < range.buyZoneLower * 0.98)
    || (analysis.trend === "downtrend" && analysis.volumeSignal === "volumeDown")) {
    return "extreme";
  }
  if (analysis.trend === "downtrend"
    || (range && range.buyZoneLower > 0 && analysis.currentPrice < range.buyZoneLower)
    || analysis.volumeSignal === "volumeDown"
    || Number(analysis.return5) <= -8) {
    return "high";
  }
  if (analysis.trend === "unknown"
    || analysis.volumeSignal === "unknown"
    || analysis.limitStatus === "unknown"
    || analysis.effectiveAmplitude >= 0.06) {
    return "medium";
  }
  if (analysis.trend === "sideways" && analysis.limitStatus === "normal" && analysis.volumeSignal === "normal") {
    return "low";
  }
  return "medium";
}

function volatilityLevel(value) {
  if (value < 0.02) return "low";
  if (value < 0.04) return "midLow";
  if (value < 0.06) return "midHigh";
  return "high";
}

function mean(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function median(values) {
  const valid = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!valid.length) return null;
  const middle = Math.floor(valid.length / 2);
  return valid.length % 2 ? valid[middle] : (valid[middle - 1] + valid[middle]) / 2;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function safePositiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function toFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatRatioPct(value, digits = 2) {
  if (!Number.isFinite(Number(value))) {
    return "--";
  }
  return `${(Number(value) * 100).toFixed(digits)}%`;
}

function formatPlainRatio(value) {
  if (!Number.isFinite(Number(value))) {
    return "--";
  }
  return `${Number(value).toFixed(2)}%`;
}

function trendLabel(value) {
  return {
    uptrend: "上升趋势",
    sideways: "震荡趋势",
    downtrend: "下跌趋势",
    unknown: "数据不足",
  }[value] || "数据不足";
}

function volumeSignalLabel(value) {
  return {
    volumeUp: "接近高位放量",
    volumeDown: "接近低位放量",
    shrinkUp: "接近高位缩量",
    shrinkDown: "接近低位缩量",
    normal: "量能正常",
    unknown: "量能未知",
  }[value] || "量能未知";
}

function limitStatusLabel(value) {
  return {
    nearUpLimit: "接近涨停",
    nearDownLimit: "接近跌停",
    normal: "未接近涨跌停",
    unknown: "涨跌停未知",
  }[value] || "涨跌停未知";
}

function riskLevelLabel(value) {
  return {
    low: "低风险",
    medium: "中风险",
    high: "高风险",
    extreme: "极高风险",
  }[value] || "中风险";
}

function riskHint(value) {
  return {
    low: "震荡、量能正常、未接近涨跌停",
    medium: "存在不确定因素，需要观察确认",
    high: "趋势或量能风险较高",
    extreme: "模型可能失效，优先关注风险",
  }[value] || "";
}

function volatilityLevelLabel(value) {
  return {
    low: "低波动",
    midLow: "中低波动",
    midHigh: "中高波动",
    high: "高波动",
  }[value] || "未知";
}

function gridSuitabilityLabel(value) {
  return {
    high: "高适配",
    medium: "中适配",
    low: "低适配",
    notSuitable: "暂不适配",
  }[value] || "中适配";
}

function gridSuitabilityHint(value) {
  return {
    high: "更接近震荡网格观察环境",
    medium: "可观察，但需复核趋势和量能",
    low: "趋势或异常波动环境",
    notSuitable: "风险或价差条件不满足",
  }[value] || "";
}

function gridZoneLabel(value) {
  return {
    low: "低位网格区",
    middle: "中枢网格区",
    high: "高位网格区",
  }[value] || "--";
}

function renderAmplitudeSvg(model) {
  const rows = model.rows.slice(-60);
  if (!rows.length) {
    return `<div class="empty-inline">暂无振幅数据</div>`;
  }
  const width = 720;
  const height = 220;
  const padding = { top: 18, right: 14, bottom: 28, left: 42 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const values = rows.map(calcAmplitude);
  const maxValue = Math.max(...values, model.analysis.effectiveAmplitude || 0.01);
  const barWidth = innerWidth / rows.length;
  const bars = values.map((value, index) => {
    const barHeight = maxValue > 0 ? (value / maxValue) * innerHeight : 0;
    const x = padding.left + index * barWidth + 1;
    const y = padding.top + innerHeight - barHeight;
    return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${Math.max(1, barWidth - 2).toFixed(2)}" height="${barHeight.toFixed(2)}" rx="2" />`;
  }).join("");
  const effectiveY = padding.top + innerHeight - ((model.analysis.effectiveAmplitude || 0) / maxValue) * innerHeight;
  return `
    <svg class="strategy-svg amplitude-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="历史每日振幅柱状图">
      <line x1="${padding.left}" y1="${effectiveY.toFixed(2)}" x2="${width - padding.right}" y2="${effectiveY.toFixed(2)}" class="svg-line-warning" />
      <g>${bars}</g>
      <text x="${padding.left}" y="14">有效振幅 ${formatRatioPct(model.analysis.effectiveAmplitude)}</text>
      <text x="${padding.left}" y="${height - 8}">${formatDate(rows[0].date)}</text>
      <text x="${width - padding.right - 76}" y="${height - 8}">${formatDate(rows.at(-1).date)}</text>
    </svg>
  `;
}

function renderPriceStrategySvg(model) {
  const rows = model.rows.slice(-60);
  if (!rows.length) {
    return `<div class="empty-inline">暂无价格数据</div>`;
  }
  const width = 720;
  const height = 220;
  const padding = { top: 16, right: 14, bottom: 28, left: 42 };
  const values = rows.flatMap((row) => [row.close, row.ma5, row.ma10, row.ma20].filter(Number.isFinite));
  values.push(model.tplus1.range.buyZoneLower, model.tplus1.range.sellZoneUpper);
  const minValue = Math.min(...values) * 0.995;
  const maxValue = Math.max(...values) * 1.005;
  const xFor = (index) => padding.left + (index / Math.max(1, rows.length - 1)) * (width - padding.left - padding.right);
  const yFor = (value) => padding.top + (maxValue - value) / Math.max(0.0001, maxValue - minValue) * (height - padding.top - padding.bottom);
  const line = (field, className) => `<polyline class="${className}" points="${rows.map((row, index) => Number.isFinite(row[field]) ? `${xFor(index).toFixed(2)},${yFor(row[field]).toFixed(2)}` : "").filter(Boolean).join(" ")}" />`;
  const buyY1 = yFor(model.tplus1.range.buyZoneUpper);
  const buyY2 = yFor(model.tplus1.range.buyZoneLower);
  const sellY1 = yFor(model.tplus1.range.sellZoneUpper);
  const sellY2 = yFor(model.tplus1.range.sellZoneLower);
  return `
    <svg class="strategy-svg price-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="价格走势与均线区间图">
      <rect x="${padding.left}" y="${Math.min(buyY1, buyY2).toFixed(2)}" width="${width - padding.left - padding.right}" height="${Math.abs(buyY2 - buyY1).toFixed(2)}" class="svg-zone-buy" />
      <rect x="${padding.left}" y="${Math.min(sellY1, sellY2).toFixed(2)}" width="${width - padding.left - padding.right}" height="${Math.abs(sellY2 - sellY1).toFixed(2)}" class="svg-zone-sell" />
      ${line("close", "svg-line-main")}
      ${line("ma5", "svg-line-ma5")}
      ${line("ma10", "svg-line-ma10")}
      ${line("ma20", "svg-line-ma20")}
      <text x="${padding.left}" y="14">收盘 / MA5 / MA10 / MA20</text>
      <text x="${padding.left}" y="${height - 8}">${formatDate(rows[0].date)}</text>
      <text x="${width - padding.right - 76}" y="${height - 8}">${formatDate(rows.at(-1).date)}</text>
    </svg>
  `;
}

function renderGridStrategySvg(model) {
  const result = model.grid;
  if (!result.levels?.length) {
    return `<div class="empty-inline">暂无网格数据</div>`;
  }
  const width = 720;
  const height = 240;
  const padding = { top: 18, right: 96, bottom: 20, left: 42 };
  const values = [...result.levels.map((item) => item.price), model.currentPrice, result.centerPrice];
  const minValue = Math.min(...values) * 0.995;
  const maxValue = Math.max(...values) * 1.005;
  const yFor = (value) => padding.top + (maxValue - value) / Math.max(0.0001, maxValue - minValue) * (height - padding.top - padding.bottom);
  const lines = result.levels.map((level) => {
    const y = yFor(level.price);
    return `
      <line x1="${padding.left}" x2="${width - padding.right}" y1="${y.toFixed(2)}" y2="${y.toFixed(2)}" class="svg-grid-line ${level.zone}" />
      <text x="${width - padding.right + 8}" y="${(y + 4).toFixed(2)}">${formatNumber(level.price, 2)}</text>
    `;
  }).join("");
  const currentY = yFor(model.currentPrice);
  const centerY = yFor(result.centerPrice);
  return `
    <svg class="strategy-svg grid-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="网格价格线图">
      ${lines}
      <line x1="${padding.left}" x2="${width - padding.right}" y1="${centerY.toFixed(2)}" y2="${centerY.toFixed(2)}" class="svg-center-line" />
      <line x1="${padding.left}" x2="${width - padding.right}" y1="${currentY.toFixed(2)}" y2="${currentY.toFixed(2)}" class="svg-current-line" />
      <text x="${padding.left}" y="14">中枢 ${formatNumber(result.centerPrice, 2)} / 当前 ${formatNumber(model.currentPrice, 2)}</text>
    </svg>
  `;
}

function renderStrengthMatrix() {
  ensureStrengthMatrix();
  app.innerHTML = `
    ${renderToast()}
    <section class="page-head">
      <div>
        <p class="eyebrow">Sector Strength</p>
        <h1 class="page-title">资金强弱矩阵</h1>
        <p class="page-subtitle">用多个周期的资金流入流出、持续性、扩散度和价格确认，观察板块是否正在形成主线。</p>
      </div>
      <div class="head-actions">
        <button class="button primary" data-action="refresh-strength-matrix">刷新矩阵</button>
      </div>
    </section>

    ${renderStrengthOverview()}

    <section class="panel strength-controls-panel">
      <div class="strength-control-grid">
      <label class="strength-control-item">
        <span>板块颗粒度</span>
        <select class="select" data-strength-control="level">
          ${[
            ["L1", "申万一级"],
            ["L2", "申万二级"],
            ["L3", "申万三级（最细）"],
          ].map(([value, label]) => `<option value="${value}" ${state.strengthLevel === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </label>
      <label class="strength-control-item">
        <span>排序</span>
        <select class="select" data-strength-control="sort">
          ${[
            ["overall", "综合评分"],
            ["fund", "资金强度"],
            ["persistence", "持续性"],
            ["diffusion", "扩散度"],
            ["price", "价格确认"],
            ["today", "今日净流入"],
            ["net30", "30天净流入"],
            ["net90", "90天净流入"],
          ].map(([value, label]) => `<option value="${value}" ${state.strengthSort === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </label>
      <label class="strength-control-item">
        <span>矩阵视角</span>
        <select class="select" data-strength-control="view">
          ${[
            ["segment", "分段趋势"],
            ["cumulative", "累计资金"],
          ].map(([value, label]) => `<option value="${value}" ${state.strengthView === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </label>
      ${renderStrengthStatusFilter()}
      </div>
    </section>

    ${state.strengthLoading ? `<section class="loading">正在计算板块资金强弱矩阵，首次读取 180 个交易日可能需要一点时间...</section>` : renderStrengthContent()}
  `;
}

function renderStrengthOverview() {
  const matrix = state.strengthMatrix;
  if (!matrix || state.strengthError) {
    return "";
  }
  const summary = matrix.summary || {};
  return `
    <section class="stat-grid strength-stats">
      ${renderStat("板块数量", summary.total ?? matrix.rows?.length ?? 0, "个", `${formatDate(matrix.start_date)} - ${formatDate(matrix.end_date)}`)}
      ${renderStat("主线增强", summary.mainline_count || 0, "个", "中短期资金共振流入")}
      ${renderStat("新启动", summary.new_start_count || 0, "个", "短周期明显转强")}
      ${renderStat("退潮预警", summary.warning_count || 0, "个", "中长期仍强但短期转弱")}
    </section>
  `;
}

function strengthStatusOptions() {
  return ["主线增强", "新启动", "回流修复", "退潮预警", "一日脉冲", "偏强观察", "观察"];
}

function selectedStrengthStatuses() {
  if (Array.isArray(state.strengthStatus)) {
    return state.strengthStatus.filter((status) => status && status !== "all");
  }
  return state.strengthStatus && state.strengthStatus !== "all" ? [state.strengthStatus] : [];
}

function isStrengthStatusSelected(status) {
  return selectedStrengthStatuses().includes(status);
}

function renderStrengthStatusFilter() {
  const selected = selectedStrengthStatuses();
  return `
    <div class="strength-control-item strength-status-filter">
      <span>状态筛选</span>
      <div class="status-filter-chips" aria-label="状态筛选">
        <button class="${selected.length === 0 ? "active" : ""}" type="button" data-action="clear-strength-status" aria-pressed="${selected.length === 0 ? "true" : "false"}">全部状态</button>
        ${strengthStatusOptions().map((status) => `
          <button
            class="${isStrengthStatusSelected(status) ? "active" : ""}"
            type="button"
            data-action="toggle-strength-status"
            data-status="${escapeAttr(status)}"
            aria-pressed="${isStrengthStatusSelected(status) ? "true" : "false"}"
          >${escapeHtml(status)}</button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderStrengthContent() {
  if (state.strengthError) {
    return `<section class="notice warning">${escapeHtml(state.strengthError)}</section>`;
  }
  if (!state.strengthMatrix) {
    return `<section class="empty-inline">点击刷新矩阵读取数据</section>`;
  }

  const matrix = state.strengthMatrix;
  const summary = matrix.summary || {};
  const columns = strengthColumns(matrix);
  const viewLabel = state.strengthView === "cumulative" ? "累计资金" : "分段趋势";
  const searchedRows = filterRowsByQuery(matrix.rows || [], state.strengthQuery, [
    "name",
    "code",
    "status",
    "status_tags",
    "trend_status",
    "trend_tags",
  ]);
  const activeStatuses = selectedStrengthStatuses();
  const statusRows = activeStatuses.length === 0
    ? searchedRows
    : searchedRows.filter((row) => activeStatuses.some((status) => strengthStatusMatches(row, status)));
  const rows = sortedStrengthRows(statusRows);

  return `
    ${renderStrengthMethodology(viewLabel, summary, matrix)}

    <section class="panel table-panel strength-panel">
      <div class="panel-head">
        <h2>${sectorLevelLabel(matrix.level || state.strengthLevel)}资金强弱</h2>
        <span>${viewLabel} · ${rows.length} / ${(matrix.rows || []).length} 个</span>
      </div>
      ${renderListSearch("strength", state.strengthQuery, "输入板块名称、代码、状态或趋势")}
      ${renderStrengthTable(rows, columns)}
    </section>
  `;
}

function renderStrengthMethodology(viewLabel, summary = {}, matrix = {}) {
  const statusItems = [
    {
      name: "主线增强",
      rule: "近 15 / 30 / 60 / 90 天净流入均为正，同时近 3 / 5 / 7 天净流入均为正。",
      meaning: "中期和短期资金同时站在正区间，说明板块不是单日冲高，而是多周期资金共振。它更偏向“主线正在强化”，但仍需结合价格位置和估值判断。"
    },
    {
      name: "新启动",
      rule: "近 3 / 5 / 7 / 15 天净流入均为正，且近 60 天或 90 天净流入尚未转正。",
      meaning: "短周期已经明显转强，但中长期累计资金还没有完全确认。它更像早期启动信号，容易出现试错和反复。"
    },
    {
      name: "回流修复",
      rule: "近 60 天或 90 天净流入为正，同时近 3 天和 5 天净流入为正。",
      meaning: "中期资金底色仍在，短期资金重新回到流入状态。它更适合观察前期主线调整后的修复，而不是全新启动。"
    },
    {
      name: "退潮预警",
      rule: "近 60 / 90 / 120 天至少一个周期净流入为正，但近 3 天和 5 天净流入均为负。",
      meaning: "中长期资金累计还没有完全坏掉，但短期资金已经连续转弱。它提示主线可能降温，需要警惕高位拥挤后的退潮。"
    },
    {
      name: "一日脉冲",
      rule: "近 3 天净流入为正，但近 15 天净流入不为正。",
      meaning: "短线出现资金脉冲，但 15 天维度还没有形成持续流入。这里的“一日”是弱持续性的提示，不代表数学上只看一天。"
    },
    {
      name: "偏强观察",
      rule: "没有命中以上状态，但综合评分大于等于 70 分。",
      meaning: "资金、持续性、扩散度、价格确认的综合排名较强，但结构不够清晰，适合作为候选观察。"
    },
    {
      name: "观察",
      rule: "没有命中以上状态，且综合评分低于 70 分。",
      meaning: "暂时没有明确资金主线特征。不是看空结论，只是当前资金强弱矩阵没有给出高优先级信号。"
    },
  ];

  const trendItems = [
    {
      name: "持续增强",
      rule: "最近 3 天、第 4-5 天、第 6-7 天、第 8-15 天、第 16-30 天这些非重叠分段净流入均为正。",
      meaning: "近 30 个交易日的资金分段连续为正，趋势最干净，说明资金不是只集中在某一天，而是分阶段持续推进。"
    },
    {
      name: "新资金启动",
      rule: "最近 3 天净流入为正，且强度不低于第 4-7 天净额绝对值的 80%，同时第 8-30 天合计不为正。",
      meaning: "之前 8-30 天没有形成资金优势，但最近 3 天开始明显转正，偏早期、偏弹性，也最需要后续几天确认。"
    },
    {
      name: "回流修复",
      rule: "最近 7 天净流入为正，第 8-30 天合计为负，同时第 31-90 天或第 91-180 天仍为正。",
      meaning: "中长期资金曾经认可过这个板块，中间一段时间转弱，最近 7 天又开始回流。它常见于调整后的主线修复。"
    },
    {
      name: "退潮预警",
      rule: "第 31-90 天或第 91-180 天合计为正，但最近 3 天为负，且第 4-5 天也为负。",
      meaning: "老资金痕迹还在，但最近 5 个交易日连续走弱。它比单日回撤更严肃，提示资金可能从强转弱。"
    },
    {
      name: "单日脉冲",
      rule: "今日净流入为正，但最近 7 天合计不为正。",
      meaning: "今天有资金流入，但不足以扭转一周维度的弱势。适合看异动，不适合直接当作持续主线。"
    },
    {
      name: "偏强延续",
      rule: "最近 3 天净流入为正，且第 8-30 天合计也为正。",
      meaning: "近端和前段资金都为正，但分段连续性没有达到“持续增强”的严格条件。它表示趋势偏强，但中间可能有波动。"
    },
    {
      name: "短线降温",
      rule: "最近 3 天净流入为负，但第 8-30 天合计为正。",
      meaning: "过去一段时间资金趋势仍然不错，但最近 3 天开始流出。它是短线降温，不等同于长期趋势反转。"
    },
  ];

  const activeTab = state.strengthInfoTab === "labels" ? "labels" : "score";

  return `
    <details class="panel strength-methodology" data-details="strengthInfo" ${state.strengthInfoOpen ? "open" : ""}>
      <summary>
        <span>
          <strong>评分口径与标签说明</strong>
          <small>综合分 = 资金强度 35% + 持续性 35% + 扩散度 20% + 价格确认 10%；需要细看时再展开。</small>
        </span>
        <em>展开</em>
      </summary>
      <div class="methodology-tabs" role="tablist" aria-label="资金强弱矩阵说明">
        <button class="${activeTab === "score" ? "active" : ""}" data-action="set-strength-info-tab" data-tab="score" type="button">综合评分方法</button>
        <button class="${activeTab === "labels" ? "active" : ""}" data-action="set-strength-info-tab" data-tab="labels" type="button">状态与趋势说明</button>
      </div>
      ${activeTab === "score"
        ? renderStrengthScoringGuide(viewLabel, summary, matrix)
        : renderStrengthLabelGuide(statusItems, trendItems)}
    </details>
  `;
}

function renderStrengthScoringGuide(viewLabel, summary = {}, matrix = {}) {
  const scoreItems = [
    {
      name: "资金强度 35%",
      rule: "先计算 15 / 30 / 60 / 90 天累计净流入和资金强度，再做同级板块横向排名。",
      meaning: "单窗口资金分 = 净流入排名分 55% + 强度排名分 45%；四个窗口按 15天:30天:60天:90天 = 1:2:2:1 加权。强度 = 净流入 / 绝对资金流总额，用来识别资金方向是否足够集中。"
    },
    {
      name: "持续性 35%",
      rule: "看 15 / 30 / 60 天流入天数占比，以及近 30 天最长连续净流入天数。",
      meaning: "加权口径为 15天流入占比 1、30天流入占比 2、60天流入占比 1.5、最长连续流入折算分 1。它更重视资金是否连续推进，而不是单日大额流入。"
    },
    {
      name: "扩散度 20%",
      rule: "看板块内成分股净流入的覆盖比例，按 15 / 30 / 60 天观察。",
      meaning: "扩散度 = 成分股净流入观察次数 / 成分股资金观察总次数；15天、30天、60天权重为 1:2:1。扩散度高说明不是少数权重股单独拉动，而是板块内部更多股票得到资金确认。"
    },
    {
      name: "价格确认 10%",
      rule: "看近 30 个交易日板块内成分股平均涨幅，并在同级板块中做百分位排名。",
      meaning: "资金流入如果没有价格响应，可能只是承接或低效流入；价格确认权重较低，只作为验证项，不让涨幅本身盖过资金和持续性。"
    },
  ];

  return `
    <div class="methodology-note">
      <strong>综合评分公式</strong>
      <span>综合评分 = 资金强度 × 35% + 持续性 × 35% + 扩散度 × 20% + 价格确认 × 10%。所有单项分都归一到 0-100 分，同级板块之间横向比较，分数越高表示相对越强。</span>
      <span>底层资金数据来自板块成分股资金流聚合：每日把成分股 net_mf_amount 加总为板块净流入，同时统计绝对资金流、净流入股票数、覆盖股票数等字段。</span>
      ${summary.top ? `<span>当前最高：${escapeHtml(summary.top.name)}，综合 ${formatScore(summary.top.overall_score)} 分，状态 ${escapeHtml(summary.top.status)}。</span>` : ""}
      ${matrix.error_count ? `<span>本次有 ${formatNumber(matrix.error_count, 0)} 个交易日读取失败，矩阵可能不完整；可以稍后刷新重跑。</span>` : ""}
    </div>
    <div class="methodology-grid scoring-grid">
      ${renderMethodologyGroup("综合评分", "用于列表里的“综合”列，是对资金强度、持续性、扩散度、价格确认的加权结果。", scoreItems)}
      ${renderStrengthMatrixGuide(viewLabel)}
    </div>
  `;
}

function renderStrengthMatrixGuide(viewLabel) {
  const items = [
    {
      name: "分段趋势视角",
      rule: "今日、昨日、第3日、第4-5日、第6-7日、第8-15日等列互不重叠。",
      meaning: "适合观察资金节奏是否从远端持续推进到近端，也能看出突然放大、短线降温或回流修复。"
    },
    {
      name: "累计资金视角",
      rule: "1 / 2 / 3 / 5 / 7 / 15 / 30 / 60 / 90 / 120 / 150 / 180 天为向前累计求和。",
      meaning: "适合看某个板块在固定窗口内累计吸金能力，但长窗口会包含短窗口，所以趋势判断更建议优先看分段趋势。"
    },
    {
      name: "矩阵单元格",
      rule: "每格显示该窗口净流入、正流入天数、资金排名。",
      meaning: "正流入天数是窗口内“板块每日净流入 > 0”的交易日数量，不是金额增长率。背景颜色深浅来自该窗口净流入的同级排名分；红色代表窗口净流入为正，绿色代表窗口净流出。排名越靠前，说明相对同级板块资金更强。"
    },
    {
      name: "当前视角",
      rule: `${viewLabel}：${state.strengthView === "cumulative" ? "当前列是累计窗口，便于对照综合评分。" : "当前列是互不重叠的分段窗口，便于看资金趋势节奏。"}`,
      meaning: "综合评分本身始终按累计窗口和价格确认计算；切换上方视角只改变矩阵列的展示方式，不改变评分结果。"
    },
  ];

  return renderMethodologyGroup("矩阵读法", "解释表格右侧每个资金窗口怎么看，以及为什么分段趋势更适合判断主线节奏。", items);
}

function renderStrengthLabelGuide(statusItems, trendItems) {
  return `
    <div class="methodology-note">
      <strong>标签口径说明</strong>
      <span>状态筛选看累计窗口，趋势标签看非重叠分段。累计窗口如 30 天包含最近 15 天；分段窗口互不重叠，例如“第 8-15 天”不包含最近 7 天。</span>
      <span>页面只突出一个主状态和一个主趋势，便于快速扫描；同一板块若同时命中其他非冗余条件，会以“兼具”标签弱展示。筛选时会同时匹配主标签和兼具标签。</span>
    </div>
    <div class="methodology-grid">
      ${renderMethodologyGroup("状态筛选", "用于左侧筛选和汇总卡片，偏结果归类。", statusItems)}
      ${renderMethodologyGroup("趋势标签", "用于每行板块下方的“趋势”，偏资金节奏识别。", trendItems)}
    </div>
  `;
}

function renderMethodologyGroup(title, subtitle, items) {
  return `
    <div class="methodology-card">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(subtitle)}</p>
      <div class="methodology-list">
        ${items.map((item) => `
          <article>
            <strong>${escapeHtml(item.name)}</strong>
            <span>条件：${escapeHtml(item.rule)}</span>
            <em>解读：${escapeHtml(item.meaning)}</em>
          </article>
        `).join("")}
      </div>
    </div>
  `;
}

function strengthColumns(matrix) {
  if (state.strengthView === "cumulative" || !Array.isArray(matrix.segments) || !matrix.segments.length) {
    return (matrix.windows || []).map((days) => ({
      key: String(days),
      label: `${days}天`,
      source: "windows",
    }));
  }
  return (matrix.segments || []).map((segment) => ({
    key: segment.key,
    label: segment.label || `${segment.from}-${segment.to}日`,
    source: "segments",
  }));
}

function strengthCellForColumn(row, column) {
  if (column.source === "segments") {
    return row.segments?.[column.key];
  }
  return row.windows?.[column.key];
}

function strengthStatusMatches(row, status) {
  return row.status === status || (row.status_tags || []).includes(status);
}

function renderStrengthTagLine(row) {
  const tags = Array.from(new Set([
    ...(row.status_tags || []),
    ...(row.trend_tags || []),
  ])).filter((tag) => tag && tag !== row.status && tag !== row.trend_status);

  if (!tags.length) {
    return "";
  }

  return `
    <div class="strength-extra-tags">
      <span>兼具</span>
      ${tags.slice(0, 4).map((tag) => `<b>${escapeHtml(tag)}</b>`).join("")}
    </div>
  `;
}

function renderStrengthTable(rows, columns) {
  const pageSize = 100;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  if (state.strengthPage > totalPages) {
    state.strengthPage = totalPages;
  }
  if (state.strengthPage < 1) {
    state.strengthPage = 1;
  }
  const start = (state.strengthPage - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);
  const totalSectorCount = state.strengthMatrix?.rows?.length || rows.length;

  if (!rows.length) {
    return `<div class="empty-inline">当前没有匹配的板块</div>`;
  }

  return `
    <div class="strength-table">
      <div class="strength-head">
        <span>板块</span>
        <span>综合</span>
        <span>单项评分</span>
        <span>板块池</span>
        ${columns.map((column) => `<span>${escapeHtml(column.label)}</span>`).join("")}
      </div>
      ${pageRows.map((row, index) => `
        <article class="strength-row">
          <button class="stock-cell" data-action="open-sector" data-code="${escapeAttr(row.code || "")}" data-level="${escapeAttr(row.level || state.strengthLevel)}">
            <strong>${start + index + 1}. ${escapeHtml(row.name)}</strong>
            <span>${escapeHtml(row.code || "")} / ${escapeHtml(row.status || "观察")}</span>
            <small>趋势：${escapeHtml(row.trend_status || "观察")}</small>
            ${renderStrengthTagLine(row)}
          </button>
          <span class="score-main ${scoreToneClass(row.overall_score)}">
            <strong>${formatScore(row.overall_score)}</strong>
            <small>价格 ${formatPercent(row.price_return_pct)}</small>
          </span>
          <span class="score-grid">
            ${renderScoreBadge("资", row.fund_score)}
            ${renderScoreBadge("续", row.persistence_score)}
            ${renderScoreBadge("扩", row.diffusion_score)}
            ${renderScoreBadge("价", row.price_score)}
          </span>
          <span>${renderSectorPoolButton(row)}</span>
          ${columns.map((column) => renderStrengthCell(strengthCellForColumn(row, column), totalSectorCount)).join("")}
        </article>
      `).join("")}
    </div>
    ${renderPagination("strength", state.strengthPage, totalPages, rows.length)}
  `;
}

function renderScoreBadge(label, score) {
  return `<b class="${scoreToneClass(score)}"><i>${escapeHtml(label)}</i>${formatScore(score)}</b>`;
}

function renderStrengthCell(cell, totalSectorCount) {
  if (!cell) {
    return `<span class="matrix-cell empty">--</span>`;
  }
  return `
    <span class="matrix-cell" style="${strengthCellStyle(cell)}" title="净流入 ${formatWanAmount(cell.net_amount)} / 正流入天数 ${formatNumber(cell.positive_days, 0)} / ${formatNumber(cell.days, 0)} / 资金排名 ${formatNumber(cell.net_rank, 0)} / ${formatNumber(totalSectorCount, 0)}">
      <strong class="${toneClass(cell.net_amount)}">${formatWanAmount(cell.net_amount)}</strong>
      <small>正流入${formatNumber(cell.positive_days, 0)}/${formatNumber(cell.days, 0)}天 · 排名${formatNumber(cell.net_rank, 0)}/${formatNumber(totalSectorCount, 0)}</small>
    </span>
  `;
}

function sortedStrengthRows(rows) {
  const list = (rows || []).slice();
  const sorters = {
    overall: (row) => row.overall_score,
    fund: (row) => row.fund_score,
    persistence: (row) => row.persistence_score,
    diffusion: (row) => row.diffusion_score,
    price: (row) => row.price_score,
    today: (row) => row.segments?.d1?.net_amount ?? row.windows?.[1]?.net_amount,
    net30: (row) => row.windows?.[30]?.net_amount,
    net90: (row) => row.windows?.[90]?.net_amount,
  };
  const accessor = sorters[state.strengthSort] || sorters.overall;
  return list.sort((a, b) => Number(accessor(b) || 0) - Number(accessor(a) || 0));
}

function renderSectors() {
  ensureSectorFlow();
  app.innerHTML = `
    ${renderToast()}
    <section class="page-head">
      <div>
        <p class="eyebrow">Sector Flow</p>
        <h1 class="page-title">板块资金趋势</h1>
        <p class="page-subtitle">基于申万一级行业成分股和 TuShare 个股资金流聚合，观察最近一段时间行业资金流入流出。</p>
      </div>
      <div class="head-actions">
        <button class="button primary" data-action="refresh-sectors">刷新板块资金</button>
      </div>
    </section>

    <section class="sector-controls">
      <label>
        <span>板块颗粒度</span>
        <select class="select" data-sector-control="level">
          ${[
            ["L1", "申万一级"],
            ["L2", "申万二级"],
            ["L3", "申万三级（最细）"],
          ].map(([value, label]) => `<option value="${value}" ${state.sectorLevel === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>趋势图</span>
        <select class="select" data-sector-control="trendDays">
          ${[30, 90, 180].map((days) => `<option value="${days}" ${state.sectorTrendDays === days ? "selected" : ""}>近 ${days} 天</option>`).join("")}
        </select>
      </label>
      <label>
        <span>排行周期</span>
        <select class="select" data-sector-control="period">
          ${[
            ["day", "日"],
            ["week", "周"],
            ["month", "月"],
            ["range", "区间"],
          ].map(([value, label]) => `<option value="${value}" ${state.sectorPeriod === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </label>
      ${state.sectorPeriod === "range" ? `
        <label>
          <span>开始日期</span>
          <input class="input" type="date" value="${escapeHtml(state.sectorStartDate)}" data-sector-control="startDate">
        </label>
        <label>
          <span>结束日期</span>
          <input class="input" type="date" value="${escapeHtml(state.sectorEndDate)}" data-sector-control="endDate">
        </label>
      ` : ""}
    </section>

    ${state.sectorLoading ? `<section class="loading">正在聚合板块资金，这一步会读取多天资金流...</section>` : renderSectorContent()}
  `;
  requestAnimationFrame(drawSectorChart);
}

function renderSectorContent() {
  if (state.sectorError) {
    return `<section class="notice warning">${escapeHtml(state.sectorError)}</section>`;
  }
  if (!state.sectorFlow) {
    return `<section class="empty-inline">点击刷新板块资金读取数据</section>`;
  }

  const sectors = state.sectorFlow.sectors || [];
  const visibleCount = sectors.filter((sector) => isSectorVisible(sector.name)).length;
  const surgeRows = buildSectorSurgeRows(state.sectorFlow);
  const rankingRows = filterRowsByQuery(state.sectorFlow.ranking || [], state.sectorQuery, [
    "name",
    "code",
    "top_inflow_stock.name",
    "top_inflow_stock.ts_code",
    "top_outflow_stock.name",
    "top_outflow_stock.ts_code",
  ]);

  return `
    <section class="panel">
      <div class="panel-head">
        <h2>${sectorLevelLabel(state.sectorFlow.level || state.sectorLevel)}资金趋势</h2>
        <span>${formatDate(state.sectorFlow.trade_dates?.[0])} - ${formatDate(state.sectorFlow.trade_dates?.at(-1))} / 已显示 ${visibleCount}/${sectors.length}</span>
      </div>
      <div class="sector-chart-wrap">
        <canvas id="sectorChart" aria-label="板块资金趋势"></canvas>
        <div class="chart-tooltip" id="sectorChartTooltip" hidden></div>
      </div>
      ${renderSectorTrendTools(sectors, surgeRows)}
    </section>

    <section class="panel sector-table-panel">
      <div class="panel-head">
        <h2>${sectorLevelLabel(state.sectorFlow.level || state.sectorLevel)}资金流入流出</h2>
        <span>${rankingRows.length} / ${(state.sectorFlow.ranking || []).length} 个 / ${periodLabel(state.sectorFlow.period)}</span>
      </div>
      ${renderListSearch("sector", state.sectorQuery, "输入板块名、代码或股票名")}
      ${renderSectorTable(rankingRows)}
    </section>
  `;
}

function renderSectorTrendTools(sectors, surgeRows) {
  const visibleNames = new Set(sectors.filter((sector) => isSectorVisible(sector.name)).map((sector) => sector.name));
  const filteredSectors = filterSectorsByLegendQuery(sectors);
  const query = normalizeQuery(state.sectorVisibilityQuery);
  const topSurgeRows = surgeRows.slice(0, 10);

  return `
    <div class="sector-trend-tools">
      <div class="sector-tools sector-tools-primary">
        <button class="button tiny" data-action="show-all-sectors">全选</button>
        <button class="button tiny" data-action="hide-all-sectors">清空</button>
        <button class="button tiny" data-action="show-top-sectors">只看资金前十</button>
        <button class="button tiny" data-action="show-surging-sectors" ${topSurgeRows.length ? "" : "disabled"}>只看异动放大</button>
      </div>

      <div class="sector-surge-line">
        <div>
          <strong>资金异动放大</strong>
          <span>最近 3 日资金均值相对前段波动基准放大，适合用来捕捉刚开始被资金关注的细分方向。</span>
        </div>
        <div class="sector-surge-list">
          ${topSurgeRows.length ? topSurgeRows.map((row) => `
            <button class="${visibleNames.has(row.name) ? "active" : ""}" data-action="focus-sector-line" data-sector="${escapeAttr(row.name)}" title="点击只看 ${escapeAttr(row.name)}">
              ${escapeHtml(row.name)}
              <small>${formatMultiplier(row.surge_ratio)} / ${formatWanAmount(row.recent_amount)}</small>
            </button>
          `).join("") : `<em>暂无明显放大的板块</em>`}
        </div>
      </div>

      <div class="sector-filter-line">
        <label>
          <span>查找并切换板块</span>
          <input class="input" value="${escapeHtml(state.sectorVisibilityQuery)}" placeholder="输入板块名称或代码" data-list-search="sectorLegend">
        </label>
        <button class="button tiny" data-action="show-filtered-sectors" ${query && filteredSectors.length ? "" : "disabled"}>只看搜索结果</button>
        <em>${filteredSectors.length} / ${sectors.length} 个</em>
      </div>

      <div class="sector-legend">
        ${filteredSectors.map((sector) => {
          const index = sectors.findIndex((item) => item.name === sector.name);
          return `
            <button class="${isSectorVisible(sector.name) ? "active" : ""}" data-action="toggle-sector-line" data-sector="${escapeAttr(sector.name)}">
              <i style="background:${sectorColor(index)}"></i>${escapeHtml(sector.name)}
            </button>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderSectorPoolButton(row) {
  const level = row.level || state.sectorFlow?.level || state.strengthLevel || state.sectorLevel;
  const pooled = findSectorPoolItem(level, row.code, row.name);
  if (pooled) {
    return `<button class="button tiny soft" type="button" data-action="remove-sector-pool" data-sector-id="${escapeAttr(pooled.id)}">已加入</button>`;
  }
  return `
    <button
      class="button tiny"
      type="button"
      data-action="add-sector-pool"
      data-sector-code="${escapeAttr(row.code || "")}"
      data-sector-name="${escapeAttr(row.name || "")}"
      data-sector-level="${escapeAttr(level)}"
    >加入</button>
  `;
}

function renderSectorTable(rows) {
  if (!rows.length) {
    return `<div class="empty-inline">暂无板块资金数据</div>`;
  }

  const levelLabel = sectorLevelLabel(state.sectorFlow?.level || state.sectorLevel);
  return `
    <div class="sector-table">
      <div class="sector-head">
        <span>板块 ${infoDot(`当前为${levelLabel}，点击行可进入板块内个股趋势。`)}</span>
        <span>净流入 ${infoDot("统计周期内板块成分股 net_mf_amount 合计，单位按万元换算展示。")}</span>
        <span>流入/流出次数 ${infoDot("按天累计的个股净流入/净流出次数，不是去重股票数；周、月、区间会大于覆盖股票数。")}</span>
        <span>覆盖股票 ${infoDot("这个板块当前能匹配到资金流数据的成分股数量。")}</span>
        <span>最大流入 / 流出 ${infoDot("统计周期内单日净流入最高和单日净流出最低的成分股。")}</span>
        <span>板块池</span>
      </div>
      ${rows.map((row) => `
        <article class="sector-row clickable" data-action="open-sector" data-code="${escapeAttr(row.code || "")}">
          <span><strong>${escapeHtml(row.name)}</strong><small>${escapeHtml(row.code || "")}</small></span>
          <span class="${toneClass(row.net_amount)}">${formatWanAmount(row.net_amount)}</span>
          <span>${formatNumber(row.inflow_count, 0)} / ${formatNumber(row.outflow_count, 0)}</span>
          <span>${formatNumber(row.stock_count, 0)} 只</span>
          <span>
            <small>入 ${row.top_inflow_stock ? `${escapeHtml(row.top_inflow_stock.name || row.top_inflow_stock.ts_code)} ${formatWanAmount(row.top_inflow_stock.net_amount)}` : "--"}</small>
            <small>出 ${row.top_outflow_stock ? `${escapeHtml(row.top_outflow_stock.name || row.top_outflow_stock.ts_code)} ${formatWanAmount(row.top_outflow_stock.net_amount)}` : "--"}</small>
          </span>
          <span>
            ${renderSectorPoolButton(row)}
          </span>
        </article>
      `).join("")}
    </div>
  `;
}

function renderSectorPoolPage() {
  ensureSectorPoolTrend();
  const rows = filterSectorPoolRows();
  const total = (state.sectorPool || []).length;
  const visibleCount = (state.sectorPoolTrendFlow?.sectors || []).filter((sector) => isSectorPoolVisible(sector.name)).length;
  const chartTrend = sectorPoolChartTrend();
  app.innerHTML = `
    ${renderToast()}
    <section class="page-head">
      <div>
        <p class="eyebrow">My Sectors</p>
        <h1 class="page-title">我的板块池</h1>
        <p class="page-subtitle">把你想长期盯的细分方向单独收在这里，板块资金页只负责观察市场资金变化。</p>
      </div>
      <div class="head-actions">
        <a class="button" href="#/sectors">去板块资金添加</a>
      </div>
    </section>

    <section class="sector-controls">
      <label>
        <span>板块颗粒度</span>
        <select class="select" data-sector-pool-control="level">
          ${[
            ["all", "全部"],
            ["L1", "申万一级"],
            ["L2", "申万二级"],
            ["L3", "申万三级（最细）"],
          ].map(([value, label]) => `<option value="${value}" ${state.sectorPoolLevel === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>趋势范围</span>
        <select class="select" data-sector-pool-control="trendDays">
          ${[30, 90, 180].map((days) => `<option value="${days}" ${state.sectorPoolTrendDays === days ? "selected" : ""}>近 ${days} 天</option>`).join("")}
        </select>
      </label>
      <label>
        <span>搜索板块</span>
        <input class="input" value="${escapeHtml(state.sectorPoolQuery)}" placeholder="输入板块名称或代码" data-list-search="sectorPool">
      </label>
    </section>

    <section class="panel">
      <div class="panel-head">
        <h2>板块池资金趋势</h2>
        <span>${chartTrend.length ? `${formatDate(chartTrend[0].trade_date)} - ${formatDate(chartTrend.at(-1).trade_date)} / 已显示 ${visibleCount}/${state.sectorPoolTrendFlow.sectors.length}` : "等待数据"}</span>
      </div>
      ${renderSectorPoolTrendContent()}
    </section>

    <section class="panel sector-table-panel">
      <div class="panel-head">
        <h2>关注板块</h2>
        <span>${rows.length} / ${total} 个</span>
      </div>
      ${renderSectorPoolTable(rows)}
    </section>
  `;
  requestAnimationFrame(drawSectorPoolChart);
}

function renderSectorPoolTable(rows) {
  if (!rows.length) {
    return `
      <div class="empty-inline">
        ${state.sectorPool?.length ? "没有匹配的板块" : "还没有加入板块，可以去板块资金页从榜单里加入。"}
      </div>
    `;
  }

  const columns = sectorPoolStrengthColumns();
  const strengthRows = buildSectorPoolStrengthRows(rows, columns);
  const gridStyle = sectorPoolStrengthGridStyle(columns.length);
  const totalSectorCount = strengthRows.length;

  return `
    <div class="strength-table sector-pool-strength-table" style="min-width: ${sectorPoolStrengthTableWidth(columns.length)}px">
      <div class="strength-head sector-pool-strength-head" style="${gridStyle}">
        <span>板块</span>
        <span>综合</span>
        <span>单项评分</span>
        <span>图表</span>
        ${columns.map((column) => `<span>${escapeHtml(column.label)}</span>`).join("")}
        <span>操作</span>
      </div>
      ${strengthRows.map((row, index) => {
        const item = row.item;
        const displayName = sectorPoolDisplayName(item);
        return `
        <article class="strength-row sector-pool-strength-row" style="${gridStyle}">
          <button class="stock-cell" data-action="open-sector" data-code="${escapeAttr(item.code || "")}" data-level="${escapeAttr(item.level || "L3")}" ${item.code ? "" : "disabled"}>
            <strong>${index + 1}. ${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(item.code || "")} / ${escapeHtml(row.status || "观察")}</span>
            <small>趋势：${escapeHtml(row.trend_status || "观察")}</small>
            <small>${sectorLevelLabel(item.level)} / ${formatDateTime(item.created_at)} 加入</small>
            ${renderStrengthTagLine(row)}
          </button>
          <span class="score-main ${scoreToneClass(row.overall_score)}">
            <strong>${formatScore(row.overall_score)}</strong>
            <small>近30 ${formatWanAmount(row.windows?.[30]?.net_amount)}</small>
          </span>
          <span class="score-grid">
            ${renderScoreBadge("资", row.fund_score)}
            ${renderScoreBadge("续", row.persistence_score)}
            ${renderScoreBadge("扩", row.diffusion_score)}
            ${renderScoreBadge("稳", row.stability_score)}
          </span>
          <span>
            <button class="button tiny ${isSectorPoolVisible(displayName) ? "primary" : ""}" data-action="toggle-sector-pool-line" data-sector="${escapeAttr(displayName)}">趋势</button>
          </span>
          ${columns.map((column) => renderStrengthCell(row.segments?.[column.key], totalSectorCount)).join("")}
          <span class="row-actions">
            <button class="button small" data-action="open-sector" data-code="${escapeAttr(item.code || "")}" data-level="${escapeAttr(item.level || "L3")}" ${item.code ? "" : "disabled"}>查看详情</button>
            <button class="button small danger" data-action="remove-sector-pool" data-sector-id="${escapeAttr(item.id)}">移出</button>
          </span>
        </article>
      `; }).join("")}
    </div>
  `;
}

function renderSectorPoolTrendContent() {
  if (!(state.sectorPool || []).length) {
    return `<div class="empty-inline">还没有加入板块，可以先去板块资金或资金强弱矩阵加入。</div>`;
  }
  if (state.sectorPoolTrendLoading) {
    return `<div class="loading compact">正在读取板块池趋势...</div>`;
  }
  if (state.sectorPoolTrendError) {
    return `<div class="notice warning compact-note">${escapeHtml(state.sectorPoolTrendError)}</div>`;
  }
  if (!state.sectorPoolTrendFlow?.sectors?.length) {
    return `<div class="empty-inline">当前筛选下没有可展示的板块趋势</div>`;
  }

  return `
    <div class="sector-chart-wrap sector-pool-chart-wrap">
      <canvas id="sectorPoolChart" aria-label="板块池资金趋势"></canvas>
      <div class="chart-tooltip" id="sectorPoolChartTooltip" hidden></div>
    </div>
    <div class="sector-tools">
      <button class="button tiny" data-action="show-all-sector-pool-lines">全选</button>
      <button class="button tiny" data-action="hide-all-sector-pool-lines">清空</button>
    </div>
    <div class="sector-legend stock-legend">
      ${(state.sectorPoolTrendFlow.sectors || []).map((sector, index) => `
        <button class="${isSectorPoolVisible(sector.name) ? "active" : ""}" data-action="toggle-sector-pool-line" data-sector="${escapeAttr(sector.name)}">
          <i style="background:${sectorColor(index)}"></i>${escapeHtml(sector.name)}
        </button>
      `).join("")}
    </div>
  `;
}

function sectorPoolChartTrend() {
  const trend = state.sectorPoolTrendFlow?.trend || [];
  const days = Number(state.sectorPoolTrendDays || 180);
  return trend.slice(-days);
}

function sectorPoolStrengthColumns() {
  return sectorPoolStrengthSegments;
}

function sectorPoolStrengthGridStyle(columnCount) {
  return `grid-template-columns: 1.25fr 0.72fr 1.25fr 0.74fr repeat(${columnCount}, minmax(112px, 1fr)) 1.08fr;`;
}

function sectorPoolStrengthTableWidth(columnCount) {
  return 720 + columnCount * 126;
}

function buildSectorPoolStrengthRows(items, columns) {
  const flow = state.sectorPoolTrendFlow;
  const rows = (items || []).map((item) => {
    const values = sectorPoolDailyRows(item);
    const windows = {};
    for (const days of sectorPoolStrengthWindows) {
      windows[days] = summarizeSectorPoolStrengthWindow(values, days);
    }
    const segments = {};
    for (const segment of columns) {
      segments[segment.key] = summarizeSectorPoolStrengthSegment(values, segment);
    }
    return {
      item,
      code: item.code,
      name: item.name,
      level: item.level || "L3",
      windows,
      segments,
      status_tags: [],
      trend_tags: [],
      status: "观察",
      trend_status: "观察",
      fund_score: flow?.trend?.length ? 0 : null,
      persistence_score: flow?.trend?.length ? 0 : null,
      diffusion_score: flow?.trend?.length ? 0 : null,
      stability_score: flow?.trend?.length ? 0 : null,
      overall_score: flow?.trend?.length ? 50 : null,
    };
  });

  if (!flow?.trend?.length) {
    return rows;
  }

  addSectorPoolRankScores(rows, columns);
  rows.forEach(addSectorPoolScores);

  return rows.sort((a, b) => {
    const scoreDiff = Number(b.overall_score || 0) - Number(a.overall_score || 0);
    if (scoreDiff) {
      return scoreDiff;
    }
    return String(b.item.updated_at || b.item.created_at || "").localeCompare(String(a.item.updated_at || a.item.created_at || ""));
  });
}

function sectorPoolDailyRows(item) {
  const name = sectorPoolDisplayName(item);
  return (state.sectorPoolTrendFlow?.trend || []).map((day) => {
    const source = day.sectors?.[name] || {};
    const netAmount = Number(source.net_amount || 0);
    const grossAmount = Number(source.gross_amount);
    return {
      trade_date: day.trade_date,
      net_amount: netAmount,
      gross_amount: Number.isFinite(grossAmount) ? grossAmount : Math.abs(netAmount),
      stock_count: Number(source.stock_count || 0),
      inflow_count: Number(source.inflow_count || 0),
    };
  });
}

function summarizeSectorPoolStrengthWindow(values, days) {
  return summarizeSectorPoolStrengthRows((values || []).slice(-days), { days });
}

function summarizeSectorPoolStrengthSegment(values, segment) {
  const source = values || [];
  const endIndex = source.length - Number(segment.from || 1) + 1;
  const startIndex = Math.max(0, source.length - Number(segment.to || segment.from || 1));
  const rows = endIndex > startIndex ? source.slice(startIndex, endIndex) : [];
  return {
    ...summarizeSectorPoolStrengthRows(rows, segment),
    key: segment.key,
    label: segment.label,
    from: segment.from,
    to: segment.to,
  };
}

function summarizeSectorPoolStrengthRows(rows, meta) {
  const netAmount = rows.reduce((sum, row) => sum + Number(row.net_amount || 0), 0);
  const grossAmount = rows.reduce((sum, row) => sum + Number(row.gross_amount || 0), 0);
  const stockObservations = rows.reduce((sum, row) => sum + Number(row.stock_count || 0), 0);
  const inflowObservations = rows.reduce((sum, row) => sum + Number(row.inflow_count || 0), 0);
  const positiveDays = rows.filter((row) => Number(row.net_amount || 0) > 0).length;
  const stockCount = rows.reduce((max, row) => Math.max(max, Number(row.stock_count || 0)), 0);
  return {
    days: rows.length,
    start_date: rows[0]?.trade_date || "",
    end_date: rows.at(-1)?.trade_date || "",
    net_amount: roundClient(netAmount, 2),
    gross_amount: roundClient(grossAmount, 2),
    intensity_pct: grossAmount > 0 ? roundClient((netAmount / grossAmount) * 100, 2) : null,
    positive_days: positiveDays,
    positive_day_ratio: rows.length ? roundClient((positiveDays / rows.length) * 100, 2) : null,
    max_positive_streak: maxSectorPoolPositiveStreak(rows),
    diffusion_pct: stockObservations > 0 ? roundClient((inflowObservations / stockObservations) * 100, 2) : null,
    covered_stock_count: stockCount,
    net_rank: 0,
    net_score: 0,
    intensity_score: 0,
    ...meta,
  };
}

function maxSectorPoolPositiveStreak(rows) {
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

function addSectorPoolRankScores(rows, columns) {
  for (const days of sectorPoolStrengthWindows) {
    const ranked = rows
      .slice()
      .sort((a, b) => Number(b.windows?.[days]?.net_amount || 0) - Number(a.windows?.[days]?.net_amount || 0));
    const netScores = percentileScoreRows(rows, (row) => row.windows?.[days]?.net_amount);
    const intensityScores = percentileScoreRows(rows, (row) => row.windows?.[days]?.intensity_pct);
    ranked.forEach((row, index) => {
      row.windows[days].net_rank = index + 1;
    });
    rows.forEach((row) => {
      row.windows[days].net_score = roundClient(netScores.get(row) || 0, 0);
      row.windows[days].intensity_score = roundClient(intensityScores.get(row) || 0, 0);
    });
  }

  for (const column of columns) {
    const ranked = rows
      .slice()
      .sort((a, b) => Number(b.segments?.[column.key]?.net_amount || 0) - Number(a.segments?.[column.key]?.net_amount || 0));
    const netScores = percentileScoreRows(rows, (row) => row.segments?.[column.key]?.net_amount);
    const intensityScores = percentileScoreRows(rows, (row) => row.segments?.[column.key]?.intensity_pct);
    ranked.forEach((row, index) => {
      row.segments[column.key].net_rank = index + 1;
    });
    rows.forEach((row) => {
      row.segments[column.key].net_score = roundClient(netScores.get(row) || 0, 0);
      row.segments[column.key].intensity_score = roundClient(intensityScores.get(row) || 0, 0);
    });
  }
}

function addSectorPoolScores(row) {
  row.fund_score = roundClient(weightedAverageClient([
    [row.windows[15].net_score * 0.55 + row.windows[15].intensity_score * 0.45, 1],
    [row.windows[30].net_score * 0.55 + row.windows[30].intensity_score * 0.45, 2],
    [row.windows[60].net_score * 0.55 + row.windows[60].intensity_score * 0.45, 2],
    [row.windows[90].net_score * 0.55 + row.windows[90].intensity_score * 0.45, 1],
  ]), 0);
  row.persistence_score = roundClient(Math.max(0, Math.min(100, weightedAverageClient([
    [Number(row.windows[15].positive_day_ratio || 0), 1],
    [Number(row.windows[30].positive_day_ratio || 0), 2],
    [Number(row.windows[60].positive_day_ratio || 0), 1.5],
    [Math.min(Number(row.windows[30].max_positive_streak || 0) / 8, 1) * 100, 1],
  ]))), 0);
  row.diffusion_score = roundClient(Math.max(0, Math.min(100, weightedAverageClient([
    [Number(row.windows[15].diffusion_pct || 0), 1],
    [Number(row.windows[30].diffusion_pct || 0), 2],
    [Number(row.windows[60].diffusion_pct || 0), 1],
  ]))), 0);
  row.stability_score = roundClient(Math.max(0, Math.min(100, weightedAverageClient([
    [Number(row.windows[30].positive_day_ratio || 0), 2],
    [Math.min(Number(row.windows[30].max_positive_streak || 0) / 8, 1) * 100, 1],
    [Number(row.windows[90].positive_day_ratio || 0), 1],
  ]))), 0);
  row.overall_score = roundClient(
    row.fund_score * 0.35
      + row.persistence_score * 0.35
      + row.diffusion_score * 0.20
      + row.stability_score * 0.10,
    0,
  );
  row.status_tags = classifySectorPoolStrengthTags(row);
  row.status = row.status_tags[0] || "观察";
  row.trend_tags = classifySectorPoolTrendTags(row);
  row.trend_status = row.trend_tags[0] || row.status || "观察";
}

function classifySectorPoolStrengthTags(row) {
  const net = (days) => Number(row.windows?.[days]?.net_amount || 0);
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
  return Array.from(new Set(tags));
}

function classifySectorPoolTrendTags(row) {
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

  if (recent3 > 0 && d4To5 > 0 && d6To7 > 0 && d8To15 > 0 && d16To30 > 0) {
    tags.push("持续增强");
  }
  if (recent3 > 0 && recent3 >= shortBase * 0.8 && previous23 <= 0) {
    tags.push("新资金启动");
  }
  if (recent7 > 0 && previous23 < 0 && (middle60 > 0 || long90 > 0)) {
    tags.push("回流修复");
  }
  if ((middle60 > 0 || long90 > 0) && recent3 < 0 && d4To5 < 0) {
    tags.push("退潮预警");
  }
  if (d1 > 0 && recent7 <= 0 && !tags.includes("新资金启动")) {
    tags.push("单日脉冲");
  }
  if (recent3 > 0 && previous23 > 0 && !tags.includes("持续增强")) {
    tags.push("偏强延续");
  }
  if (recent3 < 0 && previous23 > 0) {
    tags.push("短线降温");
  }
  return Array.from(new Set(tags));
}

function percentileScoreRows(rows, accessor) {
  const values = (rows || [])
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
  if (values[0].value === values.at(-1).value) {
    values.forEach((item) => scores.set(item.row, 50));
    return scores;
  }
  values.forEach((item, index) => {
    scores.set(item.row, (index / (values.length - 1)) * 100);
  });
  return scores;
}

function weightedAverageClient(pairs) {
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

function filterSectorPoolRows() {
  const query = normalizeQuery(state.sectorPoolQuery);
  return (state.sectorPool || [])
    .filter((item) => state.sectorPoolLevel === "all" || item.level === state.sectorPoolLevel)
    .filter((item) => !query || normalizeQuery(`${item.name} ${item.code} ${sectorLevelLabel(item.level)}`).includes(query))
    .sort((a, b) => String(b.updated_at || b.created_at || "").localeCompare(String(a.updated_at || a.created_at || "")));
}

function currentSectorPool() {
  const level = state.sectorFlow?.level || state.sectorLevel;
  return (state.sectorPool || []).filter((item) => (item.level || "L3") === level);
}

function findSectorPoolItem(level, code, name) {
  const key = makeSectorPoolKey(level, code, name);
  return (state.sectorPool || []).find((item) => item.id === key) || null;
}

function makeSectorPoolKey(level, code, name) {
  return `${String(level || "L3").toUpperCase()}:${String(code || name || "").trim()}`;
}

function sectorPoolDisplayName(item) {
  const level = item.level || "L3";
  return state.sectorPoolLevel === "all" ? `${item.name} (${level})` : item.name;
}

function isSectorPoolVisible(name) {
  return state.sectorPoolVisibility[name] !== false;
}

function filterSectorsByLegendQuery(sectors) {
  const query = normalizeQuery(state.sectorVisibilityQuery);
  if (!query) {
    return sectors || [];
  }
  return (sectors || []).filter((sector) => normalizeQuery(`${sector.name} ${sector.code}`).includes(query));
}

function buildSectorSurgeRows(flow) {
  const trend = flow?.trend || [];
  if (trend.length < 6) {
    return [];
  }

  return (flow.sectors || [])
    .map((sector) => {
      const values = trend.map((day) => Number(day.sectors?.[sector.name]?.net_amount || 0));
      const recent = values.slice(-3);
      const previous = values.slice(Math.max(0, values.length - 23), -3);
      if (!recent.length || !previous.length) {
        return null;
      }

      const recentAmount = recent.reduce((sum, value) => sum + value, 0);
      const recentAvg = recentAmount / recent.length;
      const previousAvg = previous.reduce((sum, value) => sum + value, 0) / previous.length;
      const previousAbsAvg = previous.reduce((sum, value) => sum + Math.abs(value), 0) / previous.length;
      const baseline = Math.max(previousAbsAvg, 1);
      const surgeRatio = recentAvg > 0 ? recentAvg / baseline : 0;
      const positiveDays = recent.filter((value) => value > 0).length;
      const liftRatio = Math.max(0, (recentAvg - previousAvg) / baseline);
      const score = surgeRatio * 42 + liftRatio * 24 + positiveDays * 9 + Math.log10(Math.max(Math.abs(recentAmount), 1)) * 8;

      return {
        code: sector.code,
        name: sector.name,
        level: sector.level,
        latest_amount: values.at(-1),
        recent_amount: roundClient(recentAmount, 2),
        baseline_amount: roundClient(previousAvg, 2),
        baseline_abs_amount: roundClient(previousAbsAvg, 2),
        surge_ratio: roundClient(surgeRatio, 2),
        positive_days: positiveDays,
        score: recentAmount > 0 ? roundClient(score, 2) : 0,
      };
    })
    .filter((row) => row && row.score > 0 && row.surge_ratio >= 1.15)
    .sort((a, b) => b.score - a.score);
}

function infoDot(text) {
  return `<button class="info-dot" type="button" title="${escapeHtml(text)}" aria-label="${escapeHtml(text)}">?</button>`;
}

function renderSectorDetail(code) {
  const level = state.route.level || state.sectorLevel;
  ensureSectorDetail(code, level);
  const sector = state.sectorDetail?.sector;
  const returnTarget = sectorDetailReturnTarget();
  app.innerHTML = `
    ${renderToast()}
    <section class="page-head">
      <div>
        <p class="eyebrow">Sector Drilldown</p>
        <h1 class="page-title">${sector ? escapeHtml(sector.name) : "板块详情"}</h1>
        <p class="page-subtitle">${sectorLevelLabel(level)}下钻到成分股，观察哪些股票正在贡献涨幅或净买入资金。</p>
      </div>
      <div class="head-actions">
        <a class="button" href="${returnTarget.href}">${returnTarget.label}</a>
        <button class="button primary" data-action="refresh-sector-detail">刷新板块详情</button>
      </div>
    </section>

    <section class="sector-controls">
      <label>
        <span>趋势范围</span>
        <select class="select" data-sector-detail-control="trendDays">
          ${[30, 90, 180].map((days) => `<option value="${days}" ${state.sectorStockTrendDays === days ? "selected" : ""}>近 ${days} 天</option>`).join("")}
        </select>
      </label>
      <label>
        <span>榜单窗口</span>
        <select class="select" data-sector-detail-control="window">
          ${[5, 10, 30].map((days) => `<option value="${days}" ${state.sectorStockWindow === days ? "selected" : ""}>近 ${days} 天</option>`).join("")}
        </select>
      </label>
      <label>
        <span>榜单排序</span>
        <select class="select" data-sector-detail-control="metric">
          ${[
            ["return", "涨幅最高"],
            ["fund", "净买入资金最高"],
          ].map(([value, label]) => `<option value="${value}" ${state.sectorStockMetric === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>图表指标</span>
        <select class="select" data-sector-detail-control="chartMode">
          ${[
            ["return", "涨幅趋势"],
            ["fund", "日净买入"],
            ["cumulativeFund", "累计净买入"],
          ].map(([value, label]) => `<option value="${value}" ${state.sectorStockChartMode === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </label>
    </section>

    ${renderSectorDetailContent()}
  `;
  requestAnimationFrame(drawSectorStockChart);
}

function sectorDetailReturnTarget() {
  if (state.route.from === "strength") {
    return { href: "#/strength", label: "返回资金强弱矩阵" };
  }
  if (state.route.from === "sector-pool") {
    return { href: "#/sector-pool", label: "返回我的板块池" };
  }
  return { href: "#/sectors", label: "返回板块资金" };
}

function renderSectorDetailContent() {
  if (state.sectorDetailLoading) {
    return `<section class="loading">正在读取板块内股票趋势...</section>`;
  }
  if (state.sectorDetailError) {
    return `<section class="notice warning">${escapeHtml(state.sectorDetailError)}</section>`;
  }
  if (!state.sectorDetail) {
    return `<section class="empty-inline">正在等待板块详情数据</section>`;
  }

  const detail = state.sectorDetail;
  const series = detail.series || [];
  const visibleCount = series.filter((stock) => isSectorStockVisible(stock.ts_code)).length;

  return `
    <section class="panel">
      <div class="panel-head">
        <h2>板块内股票趋势</h2>
        <span>${formatDate(detail.trade_dates?.[0])} - ${formatDate(detail.trade_dates?.at(-1))} / 已显示 ${visibleCount}/${series.length}</span>
      </div>
      <div class="sector-chart-wrap stock-chart-wrap">
        <canvas id="sectorStockChart" aria-label="板块内股票趋势"></canvas>
        <div class="chart-tooltip" id="sectorStockChartTooltip" hidden></div>
      </div>
      <div class="sector-tools">
        <button class="button tiny" data-action="show-all-sector-stocks">全选</button>
        <button class="button tiny" data-action="hide-all-sector-stocks">清空</button>
        <button class="button tiny" data-action="show-top-sector-stocks">只看前八</button>
      </div>
      <div class="sector-legend stock-legend">
        ${series.map((stock, index) => `
          <button class="${isSectorStockVisible(stock.ts_code) ? "active" : ""}" data-action="toggle-sector-stock-line" data-code="${escapeHtml(stock.ts_code)}">
            <i style="background:${sectorColor(index)}"></i>${escapeHtml(stock.name)}
          </button>
        `).join("")}
      </div>
    </section>

    <section class="panel sector-table-panel">
      <div class="panel-head">
        <h2>成分股排行榜</h2>
        <span>${state.sectorStockWindow} 天 / ${state.sectorStockMetric === "fund" ? "净买入资金" : "涨幅"}</span>
      </div>
      ${renderSectorStockTable(detail.ranking || [])}
    </section>
  `;
}

function renderSectorStockTable(rows) {
  const filteredRows = filterRowsByQuery(rows || [], state.sectorStockQuery, [
    "name",
    "ts_code",
  ]);
  const pageSize = 30;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  if (state.sectorStockPage > totalPages) {
    state.sectorStockPage = totalPages;
  }
  if (state.sectorStockPage < 1) {
    state.sectorStockPage = 1;
  }
  const start = (state.sectorStockPage - 1) * pageSize;
  const pageRows = filteredRows.slice(start, start + pageSize);

  if (!rows.length) {
    return `<div class="empty-inline">暂无成分股排行数据</div>`;
  }

  return `
    <div class="list-search-row">
      <label>
        <span>搜索股票</span>
        <input class="input" value="${escapeHtml(state.sectorStockQuery)}" placeholder="输入股票名称或代码" data-list-search="sectorStock">
      </label>
      <em>${filteredRows.length} / ${rows.length} 只</em>
    </div>
    ${!filteredRows.length ? `<div class="empty-inline">没有匹配的股票</div>` : ""}
    <div class="sector-stock-table">
      <div class="sector-stock-head">
        <span>股票 ${infoDot("点击股票行可以在上方趋势图中显示或隐藏这只股票。")}</span>
        <span>1日 ${infoDot("最新交易日相对前一交易日的涨幅；优先使用日涨跌幅字段。")}</span>
        <span>2日 ${infoDot("最新收盘价相对 2 个交易日前收盘价的涨幅。")}</span>
        <span>3日 ${infoDot("最新收盘价相对 3 个交易日前收盘价的涨幅。")}</span>
        <span>4日 ${infoDot("最新收盘价相对 4 个交易日前收盘价的涨幅。")}</span>
        <span>近 ${state.sectorStockWindow} 天涨幅 ${infoDot("用窗口首个交易日收盘价到最后一个交易日收盘价计算。")}</span>
        <span>近 ${state.sectorStockWindow} 天净买入 ${infoDot("窗口内个股资金流向 net_mf_amount 累加，按万元换算展示。")}</span>
        <span>最新收盘 ${infoDot("窗口最后一个交易日的收盘价。")}</span>
      </div>
      ${pageRows.map((row) => `
        <article class="sector-stock-row ${isSectorStockVisible(row.ts_code) ? "active" : ""}" data-action="toggle-sector-stock-line" data-code="${escapeHtml(row.ts_code)}">
          <span><strong>${row.rank}. ${escapeHtml(row.name)}</strong><small>${escapeHtml(row.ts_code)}</small></span>
          <span class="${toneClass(row.return_1d_pct)}">${formatPercent(row.return_1d_pct)}</span>
          <span class="${toneClass(row.return_2d_pct)}">${formatPercent(row.return_2d_pct)}</span>
          <span class="${toneClass(row.return_3d_pct)}">${formatPercent(row.return_3d_pct)}</span>
          <span class="${toneClass(row.return_4d_pct)}">${formatPercent(row.return_4d_pct)}</span>
          <span class="${toneClass(row.return_pct)}">${formatPercent(row.return_pct)}</span>
          <span class="${toneClass(row.net_amount)}">${formatWanAmount(row.net_amount)}</span>
          <span>${formatNumber(row.close, 2)}<small>${formatDate(row.price_date)}</small></span>
        </article>
      `).join("")}
    </div>
    ${renderPagination("sectorStock", state.sectorStockPage, totalPages, filteredRows.length)}
  `;
}

function renderGroups() {
  app.innerHTML = `
    ${renderToast()}
    <section class="page-head">
      <div>
        <p class="eyebrow">Groups</p>
        <h1 class="page-title">分组管理</h1>
        <p class="page-subtitle">第一版默认单用户，本地维护分组。删除分组前需要先移走里面的股票。</p>
      </div>
    </section>

    ${renderGroupsContent()}
  `;
}

function renderGroupsContent() {
  return `
    <form class="search-bar compact" data-form="create-group">
      <label class="sr-only" for="groupName">新分组名称</label>
      <input id="groupName" class="input" name="name" placeholder="例如 核心观察、等待低估、周期股" autocomplete="off">
      <button class="button primary" type="submit">新增分组</button>
    </form>

    <section class="panel">
      <div class="panel-head">
        <h2>当前分组</h2>
        <span>${state.groups.length} 个</span>
      </div>
      <div class="group-list">
        ${state.groups.map(renderGroupRow).join("")}
      </div>
    </section>
  `;
}

function renderSyncPanel() {
  const sync = state.sync || {};
  const activeClass = sync.running ? "running" : sync.active ? "pending" : "idle";
  return `
    <section class="sync-panel ${activeClass}">
      <div>
        <strong>${escapeHtml(sync.message || t("syncFallback"))}</strong>
        <span>${escapeHtml(t("targetTradeDate"))}：${formatDate(sync.target_trade_date)} / ${escapeHtml(t("success"))} ${sync.success_count || 0}/${sync.total || 0}</span>
      </div>
      <div>
        <span>${escapeHtml(t("nextRetry"))}：${formatDateTime(sync.next_retry_at) || "--"}</span>
        <span>${escapeHtml(t("syncRetryHint"))}</span>
      </div>
    </section>
  `;
}

function renderStat(label, value, unit, hint) {
  return `
    <article class="stat">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value ?? "--")}${unit ? `<small>${escapeHtml(unit)}</small>` : ""}</strong>
      <em>${escapeHtml(hint || "")}</em>
    </article>
  `;
}

function renderMiniList(title, items, emptyText, renderer) {
  return `
    <section class="panel">
      <div class="panel-head">
        <h2>${escapeHtml(title)}</h2>
        <span>${items?.length || 0} ${escapeHtml(t("countSuffix"))}</span>
      </div>
      ${renderStockList(items || [], emptyText, renderer)}
    </section>
  `;
}

function renderStockList(items, emptyText, renderer = renderCompactStock) {
  if (!items || !items.length) {
    return `<div class="empty-inline">${escapeHtml(emptyText)}</div>`;
  }
  return `<div class="mini-list">${items.map(renderer).join("")}</div>`;
}

function renderCompactStock(item) {
  return `
    <button class="mini-row" data-action="open-stock" data-id="${escapeAttr(item.id)}">
      <span>
        <strong>${escapeHtml(item.name)}</strong>
        <small>${escapeHtml(item.ts_code)} / ${escapeHtml(item.group?.name || "")}</small>
      </span>
      <span class="${statusClass(item.valuation?.status)}">
        ${escapeHtml(item.valuation?.label || "未估值")}
        <small>${formatPct(item.valuation?.deviation_pct)}</small>
      </span>
    </button>
  `;
}

function renderMoverStock(item) {
  return `
    <button class="mini-row" data-action="open-stock" data-id="${escapeAttr(item.id)}">
      <span>
        <strong>${escapeHtml(item.name)}</strong>
        <small>${escapeHtml(item.ts_code)} / ${formatDate(item.price?.trade_date)}</small>
      </span>
      <span class="${toneClass(item.price?.pct_chg)}">
        ${formatPct(item.price?.pct_chg)}
        <small>${formatCurrency(item.price?.close)}</small>
      </span>
    </button>
  `;
}

function renderHistoryPanel(history) {
  if (!history || !history.length) {
    return `
      <section class="panel">
        <div class="panel-head"><h2>最近估值调整</h2><span>0 条</span></div>
        <div class="empty-inline">还没有估值流水</div>
      </section>
    `;
  }

  return `
    <section class="panel">
      <div class="panel-head"><h2>最近估值调整</h2><span>${history.length} 条</span></div>
      <div class="timeline compact">
        ${history.map(renderHistoryEntry).join("")}
      </div>
    </section>
  `;
}

function renderSearchResults() {
  if (state.searchLoading) {
    return `<section class="notice">正在搜索股票...</section>`;
  }
  if (state.searchError) {
    return `<section class="notice warning">${escapeHtml(state.searchError)}</section>`;
  }
  if (!state.searchResults.length) {
    return "";
  }
  return `
    <section class="search-results">
      ${state.searchResults.map((stock) => `
        <article class="result-row">
          <div>
            <strong>${escapeHtml(stock.name)}</strong>
            <span>${escapeHtml(stock.ts_code)} / ${escapeHtml([stock.industry, stock.area].filter(Boolean).join(" / "))}</span>
          </div>
          <button class="button primary" data-action="add-result" data-code="${escapeAttr(stock.ts_code)}">加入股票池</button>
        </article>
      `).join("")}
    </section>
  `;
}

function renderWatchTable(rows) {
  if (!state.watchlist.length) {
    return `<div class="empty-state"><h2>还没有股票</h2><p>先搜索添加一只你想长期跟踪的 A 股。</p></div>`;
  }
  if (!rows.length) {
    return `<div class="empty-inline">当前筛选条件下没有股票</div>`;
  }

  return `
    <div class="watch-table">
      <div class="watch-head">
        <span>股票</span>
        <span>分组</span>
        <span>收盘价</span>
        <span>价格日期</span>
        <span>估值区间</span>
        <span>状态</span>
        <span>备注</span>
        <span>操作</span>
      </div>
      ${rows.map(renderWatchRow).join("")}
    </div>
  `;
}

function renderWatchRow(item) {
  const price = item.price || {};
  const valuation = item.valuation || {};
  return `
    <article class="watch-row">
      <button class="stock-cell" data-action="open-stock" data-id="${escapeAttr(item.id)}">
        <strong>${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(item.ts_code)} / ${escapeHtml(item.industry || "A 股")}</span>
      </button>
      <span>${escapeHtml(item.group?.name || "默认股票池")}</span>
      <span>
        <strong>${formatCurrency(price.close)}</strong>
        <small class="${toneClass(price.pct_chg)}">${formatPct(price.pct_chg)}</small>
      </span>
      <span>${formatDate(price.trade_date)}</span>
      <span class="valuation-lines">
        <small>低 ${formatCurrency(item.low_price)}</small>
        <small>合 ${formatCurrency(item.fair_price)}</small>
        <small>高 ${formatCurrency(item.high_price)}</small>
      </span>
      <span>
        <b class="pill ${statusClass(valuation.status)}">${escapeHtml(valuation.label || "未估值")}</b>
        <small>${formatPct(valuation.deviation_pct)}</small>
      </span>
      <span class="note-cell">${escapeHtml(item.note || "--")}</span>
      <span class="row-actions">
        <button class="button small" data-action="edit-stock" data-id="${escapeAttr(item.id)}">编辑</button>
        <button class="button small danger" data-action="delete-stock" data-id="${escapeAttr(item.id)}">删除</button>
      </span>
    </article>
  `;
}

function renderDetailTab() {
  if (state.detailTab === "analysis") {
    return renderCompanyAnalysisTab();
  }
  if (state.detailTab === "reports") {
    return renderReportsTab();
  }
  if (state.detailTab === "links") {
    return renderLinksTab();
  }
  return renderHistoryTab();
}

function renderTab(name, label) {
  return `<button class="${state.detailTab === name ? "active" : ""}" data-action="set-tab" data-tab="${name}">${label}</button>`;
}

function renderChartTabs() {
  const tabs = [
    ["intraday", "分时"],
    ["day", "日线"],
    ["week", "周线"],
    ["month", "月线"],
    ["quarter", "季线"],
    ["year", "年线"],
  ];
  return `
    <div class="chart-tabs" role="tablist">
      ${tabs.map(([value, label]) => `<button class="${state.chartPeriod === value ? "active" : ""}" data-action="set-chart-period" data-period="${value}">${label}</button>`).join("")}
    </div>
  `;
}

function chartPeriodLabel(period) {
  return {
    intraday: "分时图",
    day: "日线",
    week: "周线",
    month: "月线",
    quarter: "季线",
    year: "年线",
  }[period] || "日线";
}

function renderHistoryTab() {
  const history = state.detail.valuation_history || [];
  if (!history.length) {
    return `<div class="empty-inline">还没有估值调整流水</div>`;
  }
  return `<div class="timeline">${history.map(renderHistoryEntry).join("")}</div>`;
}

function renderHistoryEntry(entry) {
  return `
    <article class="timeline-row">
      <time>${formatDateTime(entry.created_at)}</time>
      <div>
        <strong>${escapeHtml(entry.stock_name || entry.ts_code)}</strong>
        <p>
          ${formatCurrency(entry.old_low_price)} / ${formatCurrency(entry.old_fair_price)} / ${formatCurrency(entry.old_high_price)}
          -> ${formatCurrency(entry.new_low_price)} / ${formatCurrency(entry.new_fair_price)} / ${formatCurrency(entry.new_high_price)}
        </p>
        ${entry.reason ? `<p>原因：${escapeHtml(entry.reason)}</p>` : ""}
      </div>
    </article>
  `;
}

function renderCompanyAnalysisTab() {
  const item = state.detail.item || {};
  const latest = state.detail.company_analysis_latest || null;
  const history = state.detail.company_analysis_history || [];
  const analysisStatus = state.detail.company_analysis_status || {};
  const autoRunning = ["pending", "running"].includes(analysisStatus.status);
  const failed = analysisStatus.status === "failed";
  const loading = state.companyAnalysisLoading || autoRunning;
  const statusText = state.companyAnalysisLoading
    ? "正在重新分析..."
    : autoRunning
      ? "加入股票池后正在自动生成公司分析..."
      : latest
        ? `最近更新 ${formatDateTime(latest.created_at)} / ${escapeHtml(latest.model || "Gemini")}`
        : "尚未生成分析";
  return `
    <div class="company-analysis">
      <div class="analysis-toolbar">
        <div>
          <strong>Gemini 公司信息分析</strong>
          <span>${statusText}</span>
        </div>
        <button class="button primary" data-action="refresh-company-analysis" data-code="${escapeAttr(item.ts_code || "")}" ${loading ? "disabled" : ""}>
          ${autoRunning ? "自动分析中..." : state.companyAnalysisLoading ? "分析中..." : (latest ? "重新分析" : "生成分析")}
        </button>
      </div>
      ${failed ? `<div class="notice warning">自动公司分析失败：${escapeHtml(analysisStatus.error || "未知错误")}，可以稍后手动重新分析。</div>` : ""}
      ${latest ? renderCompanyAnalysisRecord(latest) : `
        <div class="analysis-empty">
          <strong>还没有公司分析</strong>
          <p>${autoRunning ? "系统正在自动生成，完成后会显示在这里。" : "加入股票池会自动生成一次；也可以点击“生成分析”手动触发。"}</p>
        </div>
      `}
      ${history.length ? renderCompanyAnalysisHistory(history) : ""}
    </div>
  `;
}

function renderCompanyAnalysisRecord(record) {
  const analysis = record.analysis || {};
  const intro = analysisModule(analysis, "公司简介与业务")?.module_info || {};
  const chain = analysisModule(analysis, "产业链全景图与公司位置")?.module_info || {};
  const cost = analysisModule(analysis, "最终产品成本拆解")?.module_info || {};
  const profit = analysisModule(analysis, "产业链毛利率与净利率")?.module_info || {};

  return `
    <div class="analysis-stack">
      <section class="analysis-section">
        <div class="analysis-section-head">
          <h3>公司简介与业务</h3>
          <span>${escapeHtml(analysis.company_name || record.stock_name || "--")}</span>
        </div>
        <p class="analysis-lead">${escapeHtml(intro.company_introduction || "暂无简介")}</p>
        <div class="analysis-info-grid">
          <div>
            <small>主要产品或服务</small>
            ${renderAnalysisTags(intro.main_products_or_services)}
          </div>
          <div>
            <small>应用场景</small>
            ${renderAnalysisTags(intro.main_application_scenarios)}
          </div>
          <div>
            <small>行业位置</small>
            <p>${escapeHtml(intro.industry_position || "未知")}</p>
          </div>
        </div>
        ${renderBusinessCards(intro.businesses || [])}
      </section>

      <section class="analysis-section">
        <div class="analysis-section-head">
          <h3>产业链全景图与公司位置</h3>
          <span>${escapeHtml(chain.industry_chain_name || "未知产业链")}</span>
        </div>
        <div class="analysis-position">
          <strong>${escapeHtml(chain.company_chain_position || "未知")}</strong>
          <p>${escapeHtml(chain.company_position_description || "暂无位置说明")}</p>
        </div>
        <div class="chain-grid">
          ${renderChainColumn("上游", chain.upstream || [])}
          ${renderChainColumn("中游", chain.midstream || [])}
          ${renderChainColumn("下游", chain.downstream || [])}
          ${renderApplicationColumn("终端应用", chain.terminal_applications || [])}
        </div>
      </section>

      <section class="analysis-section">
        <div class="analysis-section-head">
          <h3>最终产品成本拆解</h3>
          <span>${escapeHtml(cost.cost_basis || "最终产品总成本=100")}</span>
        </div>
        <div class="analysis-product">
          <div>
            <small>拆解对象</small>
            <strong>${escapeHtml(cost.final_product || "未知")}</strong>
            <p>${escapeHtml(cost.final_product_description || "")}</p>
          </div>
          <div>
            <small>选择依据</small>
            <p>${escapeHtml(cost.selection_reason || "未知")}</p>
          </div>
        </div>
        ${renderCostSummary(cost.cost_breakdown_summary || {})}
        ${renderCostBreakdown(cost.cost_breakdown || [])}
      </section>

      <section class="analysis-section">
        <div class="analysis-section-head">
          <h3>产业链毛利率与净利率</h3>
          <span>环节盈利能力</span>
        </div>
        ${renderProfitSummary(profit.profitability_summary || {})}
        ${renderProfitabilityCards(profit.profitability_by_chain_segment || [])}
      </section>
    </div>
  `;
}

function analysisModule(analysis, moduleName) {
  return (analysis.modules || []).find((item) => item.module_name === moduleName) || null;
}

function renderAnalysisTags(values) {
  const items = arrayValues(values);
  if (!items.length) {
    return `<div class="analysis-tags"><span>未知</span></div>`;
  }
  return `<div class="analysis-tags">${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`;
}

function renderBusinessCards(businesses) {
  const items = arrayValues(businesses);
  if (!items.length) {
    return "";
  }
  return `
    <div class="business-grid">
      ${items.map((business) => `
        <article>
          <span>${escapeHtml(business.business_type || "未知")}</span>
          <strong>${escapeHtml(business.business_name || "未知业务")}</strong>
          <p>${escapeHtml(business.business_description || "暂无说明")}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function renderChainColumn(title, rows) {
  const items = arrayValues(rows);
  return `
    <article class="chain-column">
      <h4>${title}</h4>
      ${items.length ? items.map((item) => `
        <div>
          <strong>${escapeHtml(item.segment_name || "未知环节")}</strong>
          <p>${escapeHtml(item.description || "")}</p>
          ${renderAnalysisTags([...arrayValues(item.representative_products_or_services), ...arrayValues(item.representative_companies)].slice(0, 8))}
        </div>
      `).join("") : `<p class="muted-text">暂无数据</p>`}
    </article>
  `;
}

function renderApplicationColumn(title, rows) {
  const items = arrayValues(rows);
  return `
    <article class="chain-column">
      <h4>${title}</h4>
      ${items.length ? items.map((item) => `
        <div>
          <strong>${escapeHtml(item.application_name || "未知应用")}</strong>
          <p>${escapeHtml(item.description || "")}</p>
        </div>
      `).join("") : `<p class="muted-text">暂无数据</p>`}
    </article>
  `;
}

function renderCostSummary(summary) {
  return `
    <div class="analysis-summary-strip">
      <span>合计 ${formatPlainPercent(summary.total_cost_share_percent)}</span>
      <span>公司相关 ${formatPlainPercent(summary.company_related_cost_share_percent)}</span>
      <span>其他成本 ${formatPlainPercent(summary.residual_or_other_cost_percent)}</span>
      <span>大项 ${arrayValues(summary.largest_cost_items).map(escapeHtml).join("、") || "未知"}</span>
      <span>敏感项 ${arrayValues(summary.high_sensitivity_cost_items).map(escapeHtml).join("、") || "未知"}</span>
    </div>
  `;
}

function renderCostBreakdown(rows) {
  const items = arrayValues(rows);
  if (!items.length) {
    return `<div class="empty-inline">暂无成本拆解</div>`;
  }
  return `
    <div class="cost-table">
      <div class="cost-head">
        <span>成本项</span>
        <span>环节</span>
        <span>占比</span>
        <span>数据</span>
        <span>公司相关</span>
      </div>
      ${items.map((item) => `
        <article class="cost-row">
          <span>
            <strong>${escapeHtml(item.cost_item || "未知成本项")}</strong>
            <small>${escapeHtml(item.description || item.cost_category || "")}</small>
          </span>
          <span>
            ${escapeHtml(item.chain_position || "未知")}
            <small>${escapeHtml(item.chain_segment || "--")}</small>
          </span>
          <span>
            <b>${formatPlainPercent(item.cost_share_percent)}</b>
            <i style="width:${boundedPercent(item.cost_share_percent)}%"></i>
          </span>
          <span>
            ${escapeHtml(item.data_type || "未知")}
            <small>信心 ${formatConfidence(item.confidence)}</small>
          </span>
          <span class="${item.company_related ? "positive" : ""}">
            ${item.company_related ? "参与" : "未参与"}
            <small>${escapeHtml(item.company_role || "")}</small>
          </span>
        </article>
      `).join("")}
    </div>
  `;
}

function renderProfitSummary(summary) {
  return `
    <div class="analysis-info-grid compact">
      <div>
        <small>最赚钱环节</small>
        ${renderAnalysisTags(summary.most_profitable_segments)}
      </div>
      <div>
        <small>低利润环节</small>
        ${renderAnalysisTags(summary.lowest_profit_segments)}
      </div>
      <div>
        <small>公司所在环节</small>
        <p>${escapeHtml(summary.company_segment_profitability || "未知")}</p>
      </div>
      <div>
        <small>利润分配逻辑</small>
        <p>${escapeHtml(summary.profit_distribution_logic || "未知")}</p>
      </div>
    </div>
  `;
}

function renderProfitabilityCards(rows) {
  const items = arrayValues(rows);
  if (!items.length) {
    return `<div class="empty-inline">暂无盈利能力拆解</div>`;
  }
  return `
    <div class="profit-grid">
      ${items.map((item) => `
        <article class="${item.company_related ? "related" : ""}">
          <div>
            <span>${escapeHtml(item.chain_position || "未知")}</span>
            <strong>${escapeHtml(item.chain_segment || "未知环节")}</strong>
          </div>
          <dl>
            <div><dt>毛利率</dt><dd>${formatPlainPercent(item.typical_gross_margin_percent)}</dd></div>
            <div><dt>净利率</dt><dd>${formatPlainPercent(item.typical_net_margin_percent)}</dd></div>
            <div><dt>盈利等级</dt><dd>${escapeHtml(item.profitability_level || "未知")}</dd></div>
          </dl>
          <p>${escapeHtml(item.main_profit_source || "主要利润来源未知")}</p>
          <p>${escapeHtml(item.main_cost_pressure || "主要成本压力未知")}</p>
          ${renderAnalysisTags(item.related_cost_items)}
        </article>
      `).join("")}
    </div>
  `;
}

function renderCompanyAnalysisHistory(history) {
  return `
    <details class="analysis-history">
      <summary>历史分析记录 ${history.length} 次</summary>
      <div>
        ${history.map((record, index) => `
          <span>${index === 0 ? "当前" : `#${index + 1}`} · ${escapeHtml(record.input_company_name || record.stock_name || "")} · ${formatDateTime(record.created_at)} · ${escapeHtml(record.model || "Gemini")}</span>
        `).join("")}
      </div>
    </details>
  `;
}

function renderReportsTab() {
  if (state.detail.reportError) {
    return `<div class="notice warning">${escapeHtml(state.detail.reportError)}</div>`;
  }
  const reports = state.detail.reports || [];
  if (!reports.length) {
    return `<div class="empty-inline">TuShare 暂时没有返回研报记录</div>`;
  }
  return `
    <div class="report-list">
      ${reports.map((report) => `
        <article class="report-row">
          <div>
            <strong>${escapeHtml(report.report_title || "未命名研报")}</strong>
            <span>${escapeHtml(report.org_name || "--")} / ${escapeHtml(report.author_name || "--")} / ${escapeHtml(report.report_type || "--")}</span>
            ${renderReportForecasts(report.forecasts || [])}
          </div>
          <div>
            <span>${formatDate(report.report_date)}</span>
            <small>${(report.forecasts || []).length ? `${report.forecasts.length} 期预测` : "暂无预测明细"}</small>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderReportForecasts(forecasts) {
  if (!forecasts.length) {
    return "";
  }
  return `
    <div class="report-forecasts">
      ${forecasts.slice(0, 4).map((item) => `
        <span>
          <b>${escapeHtml(item.quarter || "未标注")}</b>
          营收 ${formatWanAmount(item.op_rt)}
          ${item.tp === null || item.tp === undefined ? "" : ` / 利润 ${formatWanAmount(item.tp)}`}
        </span>
      `).join("")}
    </div>
  `;
}

function renderLinksTab() {
  const links = state.detail.links || {};
  const groups = [
    ["news", "新闻"],
    ["announcements", "公告"],
    ["research", "研报"],
  ];
  return `
    <div class="link-grid">
      ${groups.map(([key, title]) => `
        <section>
          <h3>${title}</h3>
          ${(links[key] || []).map((link) => `
            <a class="external-link" href="${escapeAttr(link.url)}" target="_blank" rel="noreferrer">
              <strong>${escapeHtml(link.title)}</strong>
              <span>${escapeHtml(link.description || "")}</span>
            </a>
          `).join("")}
        </section>
      `).join("")}
    </div>
  `;
}

function renderMarketContent() {
  if (state.marketError) {
    return `<section class="notice warning">${escapeHtml(state.marketError)}</section>`;
  }
  if (!state.market) {
    return `<section class="empty-inline">点击刷新观察榜读取市场数据</section>`;
  }

  const allHsgtRows = state.market.hsgtTop || [];
  const allTopRows = state.market.topList || [];
  const hsgtRows = filterRowsByQuery(allHsgtRows, state.marketQuery, [
    "name",
    "ts_code",
    "industry",
    "area",
  ]);
  const topRows = filterRowsByQuery(allTopRows, state.marketQuery, [
    "name",
    "ts_code",
    "industry",
    "area",
    "reason",
  ]);
  const displayTopRows = state.marketQuery ? topRows : topRows.slice(0, 40);
  const dateLabel = formatDate(state.market.target_trade_date || state.market.trade_date);

  return `
    <section class="market-layout">
      <article class="panel table-panel market-main-panel">
        <div class="panel-head market-panel-head">
          <div>
            <h2>龙虎榜</h2>
            <p>观察席位净额、成交强度和上榜原因，点击股票可进入详情。</p>
          </div>
          <span>${dateLabel || "--"} · ${topRows.length} / ${allTopRows.length} 条</span>
        </div>
        ${renderListSearch("market", state.marketQuery, "输入股票名称、代码、行业或上榜原因")}
        ${renderTopListTable(displayTopRows)}
      </article>

      <aside class="market-side">
        <article class="panel market-side-panel">
          <div class="panel-head market-panel-head">
            <div>
              <h2>北向十大成交</h2>
              <p>按 TuShare 榜单顺序展示，辅助判断外资关注方向。</p>
            </div>
            <span>${hsgtRows.length} / ${allHsgtRows.length} 条</span>
          </div>
          ${renderNorthboundRows(hsgtRows)}
        </article>

        <article class="panel market-side-panel">
          <div class="panel-head market-panel-head">
            <div>
              <h2>北向板块线索</h2>
              <p>仅汇总右侧十大成交股票所属行业。</p>
            </div>
            <span>${new Set(hsgtRows.map((row) => row.industry || row.area || "未分类")).size} 个</span>
          </div>
          ${renderNorthboundSectorSummary(hsgtRows)}
        </article>
      </aside>
    </section>
  `;
}

function renderMarketRows(rows, renderer, emptyText) {
  if (!rows.length) {
    return `<div class="empty-inline">${escapeHtml(emptyText)}</div>`;
  }
  return `<div class="market-list">${rows.map(renderer).join("")}</div>`;
}

function renderHsgtRow(row) {
  return `
    <div class="market-row">
      <strong>${escapeHtml(row.rank ? `${row.rank}. ${row.name || row.ts_code}` : row.name || row.ts_code)}</strong>
      <span class="${toneClass(row.change)}">${formatPct(row.change)}</span>
      <span>成交 ${formatYuanAmount(row.amount)}</span>
    </div>
  `;
}

function renderNorthboundRows(rows) {
  if (!rows.length) {
    return `<div class="empty-inline">暂无北向榜数据</div>`;
  }

  return `
    <div class="northbound-list">
      ${rows.map((row, index) => `
        <button class="northbound-row" data-action="open-stock" data-code="${escapeAttr(row.ts_code || "")}">
          <span class="northbound-rank">${escapeHtml(row.rank || index + 1)}</span>
          <span class="northbound-name">
            <strong>${escapeHtml(row.name || row.ts_code || "--")}</strong>
            <small>${escapeHtml([row.ts_code, row.industry || row.area].filter(Boolean).join(" · "))}</small>
          </span>
          <span class="northbound-money">
            <b>${formatYuanAmount(row.amount)}</b>
            <small>涨跌 ${formatPct(row.change)}</small>
          </span>
        </button>
      `).join("")}
    </div>
  `;
}

function renderNorthboundSectorSummary(rows) {
  if (!rows.length) {
    return `<div class="empty-inline">暂无可汇总的板块线索</div>`;
  }

  const sectors = Array.from(rows.reduce((map, row) => {
    const name = row.industry || row.area || "未分类";
    const item = map.get(name) || {
      name,
      count: 0,
      amount: 0,
    };
    item.count += 1;
    item.amount += Number(row.amount || 0);
    map.set(name, item);
    return map;
  }, new Map()).values())
    .sort((a, b) => b.amount - a.amount);

  return `
    <div class="northbound-sector-list">
      ${sectors.map((sector) => `
        <div class="northbound-sector-row">
          <span>
            <strong>${escapeHtml(sector.name)}</strong>
            <small>覆盖 ${sector.count} 只十大成交股票</small>
          </span>
          <span>
            <b>${formatYuanAmount(sector.amount)}</b>
            <small>成交合计</small>
          </span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderTopListTable(rows) {
  if (!rows.length) {
    return `<div class="empty-inline">暂无龙虎榜数据</div>`;
  }
  return `
    <div class="top-list-table">
      <div class="top-list-head">
        <span>股票</span>
        <span>涨跌幅</span>
        <span>成交额</span>
        <span>买入/卖出</span>
        <span>净额</span>
        <span>上榜原因</span>
      </div>
      ${rows.map((row) => `
        <article class="top-list-row">
          <button class="stock-cell" data-action="open-stock" data-code="${escapeAttr(row.ts_code || "")}">
            <strong>${escapeHtml(row.name || row.ts_code)}</strong>
            <span>${escapeHtml([row.ts_code, row.industry || row.area].filter(Boolean).join(" · "))}</span>
          </button>
          <span class="${toneClass(row.pct_change)}">${formatPct(row.pct_change)}</span>
          <span>${formatYuanAmount(row.amount)}</span>
          <span><small>买 ${formatYuanAmount(row.l_buy)}</small><small>卖 ${formatYuanAmount(row.l_sell)}</small></span>
          <span class="${toneClass(row.net_amount)}">${formatYuanAmount(row.net_amount)}</span>
          <span class="reason-cell">
            ${escapeHtml(row.reason || "--")}
            <button class="button tiny soft" data-action="start-decision" data-code="${escapeAttr(row.ts_code || "")}">加入验证</button>
          </span>
        </article>
      `).join("")}
    </div>
  `;
}

function renderDecisionReview() {
  ensureDecisionTests();
  const loadingOnly = state.decisionsLoading && !state.decisions;
  app.innerHTML = `
    ${renderToast()}
    <section class="page-head">
      <div>
        <p class="eyebrow">Decision Lab</p>
        <h1 class="page-title">决策复盘</h1>
        <p class="page-subtitle">先锁定买入假设和判断理由，再用后续真实行情验证方法是否有效。</p>
      </div>
      <div class="head-actions">
        <button class="button primary" data-action="refresh-decisions">刷新验证结果</button>
      </div>
    </section>

    ${renderDecisionCreateForm()}
    ${loadingOnly ? `<section class="loading">正在读取决策验证记录...</section>` : renderDecisionContent()}
  `;
}

function renderDecisionCreateForm() {
  return `
    <form class="panel decision-form" data-form="create-decision">
      <div class="panel-head decision-form-head">
        <div>
          <h2>新增一次验证</h2>
          <p>记录买入假设和判断理由，后面用真实行情按交易日生成状态日历。</p>
        </div>
        <span>原始判断会保留，不做事后改写</span>
      </div>
      <div class="decision-form-grid">
        <label>
          <span>股票代码</span>
          <input class="input" name="ts_code" value="${escapeHtml(state.decisionDraftCode)}" placeholder="例如 300274 或 300274.SZ" autocomplete="off" required data-stock-suggest-kind="decisionCreate">
          ${renderStockSuggestDropdown("decisionCreate")}
        </label>
        <label>
          <span>验证模式</span>
          <select class="select" name="mode">
            <option value="paper_buy">假定买入跟踪</option>
            <option value="next_day">明日预测验证</option>
          </select>
        </label>
        <label>
          <span>信号日期</span>
          <input class="input" type="date" name="signal_date" value="${defaultDecisionSignalDate()}">
        </label>
        <label>
          <span>买入价格</span>
          <select class="select" name="entry_rule">
            <option value="close">收盘价</option>
            <option value="open">开盘价</option>
            <option value="custom">自定义价格</option>
          </select>
        </label>
        <label data-custom-entry-price hidden>
          <span>自定义价格</span>
          <input class="input" type="number" step="0.01" name="entry_price" placeholder="输入你的假定买入价" disabled>
        </label>
        <label class="decision-horizon-field">
          <span>观察周期</span>
          <select class="select" name="horizon_days">
            <option value="1">1 个交易日</option>
            <option value="3">3 个交易日</option>
            <option value="5" selected>5 个交易日</option>
            <option value="10">10 个交易日</option>
            <option value="custom">自定义周期</option>
          </select>
          <input class="input" type="number" min="1" max="120" step="1" name="custom_horizon_days" placeholder="输入交易日数，最多 120 天" data-custom-horizon-days hidden disabled>
        </label>
        <label class="decision-thesis">
          <span>判断理由</span>
          <textarea class="textarea" name="thesis" rows="3" placeholder="为什么觉得这只票值得验证？当时看到的信号是什么？"></textarea>
        </label>
      </div>
      <div class="decision-form-actions">
        <button class="button primary" type="submit">加入验证</button>
        <span>创建后会按真实日线持续更新每天状态、当前收益、最高浮盈和最大回撤。</span>
      </div>
    </form>
  `;
}

function renderDecisionContent() {
  if (state.decisionsError) {
    return `<section class="notice warning">${escapeHtml(state.decisionsError)}</section>`;
  }
  if (!state.decisions) {
    return `<section class="empty-inline">还没有决策验证数据</section>`;
  }

  const summary = state.decisions.summary || {};
  const rows = filterRowsByQuery(state.decisions.items || [], state.decisionQuery, [
    "name",
    "ts_code",
    "industry",
    "thesis",
    "evaluation.verdict",
    "evaluation.status_label",
  ]);

  return `
    <section class="stat-grid decision-stats">
      ${renderStat("验证记录", summary.total || 0, "条", "已锁定的买入假设")}
      ${renderStat("验证中", summary.tracking || 0, "条", "尚未达到观察周期")}
      ${renderStat("已完成", summary.completed || 0, "条", `胜率 ${formatPct(summary.win_rate)}`)}
      ${renderStat("平均到期收益", formatPct(summary.avg_result_return_pct), "", "只统计已完成记录")}
    </section>

    <section class="panel table-panel decision-panel">
      <div class="panel-head">
        <h2>验证列表</h2>
        <span>${rows.length} / ${(state.decisions.items || []).length} 条</span>
      </div>
      ${renderListSearch("decision", state.decisionQuery, "输入股票、理由或验证结论")}
      ${renderDecisionTable(rows)}
    </section>
  `;
}

function renderDecisionTable(rows) {
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  if (state.decisionPage > totalPages) {
    state.decisionPage = totalPages;
  }
  if (state.decisionPage < 1) {
    state.decisionPage = 1;
  }
  const start = (state.decisionPage - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  if (!rows.length) {
    return `<div class="empty-inline">还没有匹配的决策验证</div>`;
  }

  return `
    <div class="decision-card-list">
      ${pageRows.map(renderDecisionRow).join("")}
    </div>
    ${renderPagination("decision", state.decisionPage, totalPages, rows.length)}
  `;
}

function renderDecisionRow(item) {
  const evaluation = item.evaluation || {};
  return `
    <article class="decision-card">
      <div class="decision-card-top">
        <button class="stock-cell" data-action="open-stock" data-code="${escapeAttr(item.ts_code)}">
          <strong>${escapeHtml(item.name || item.ts_code)}</strong>
          <span>${escapeHtml([item.ts_code, item.industry || item.area].filter(Boolean).join(" · "))}</span>
          <small>${escapeHtml(decisionModeLabel(item.mode))}</small>
        </button>
        <div class="decision-kpis">
          <span>
            <small>买入</small>
            <strong>${formatNumber(evaluation.entry_price, 2)}</strong>
            <em>${escapeHtml(evaluation.entry_label || decisionEntryRuleLabel(item.entry_rule, item.mode))}</em>
          </span>
          <span>
            <small>当前</small>
            <strong class="${toneClass(evaluation.current_return_pct)}">${formatPct(evaluation.current_return_pct)}</strong>
            <em>${formatDate(evaluation.latest_date)} / 收 ${formatNumber(evaluation.latest_close, 2)}</em>
          </span>
          <span>
            <small>最高/回撤</small>
            <strong><b class="${toneClass(evaluation.max_gain_pct)}">${formatPct(evaluation.max_gain_pct)}</b> / <b class="${toneClass(evaluation.max_drawdown_pct)}">${formatPct(evaluation.max_drawdown_pct)}</b></strong>
            <em>首日 ${formatPct(evaluation.first_day_return_pct)}</em>
          </span>
          <span>
            <small>进度</small>
            <strong>${formatNumber(evaluation.holding_days, 0)} / ${formatNumber(item.horizon_days, 0)} 天</strong>
            <em>${formatDate(evaluation.entry_date || item.signal_date)} 开始</em>
          </span>
        </div>
        <div class="decision-card-actions">
          <b class="pill ${decisionPillClass(evaluation)}">${escapeHtml(evaluation.verdict || evaluation.status_label || "--")}</b>
          <button class="button small danger" data-action="delete-decision" data-id="${escapeAttr(item.id)}">删除</button>
        </div>
      </div>
      <p class="decision-thesis-text">${escapeHtml(item.thesis || "暂无判断理由")}</p>
      ${renderDecisionCalendar(evaluation.days || [], item.horizon_days)}
    </article>
  `;
}

function renderDecisionCalendar(days, horizonDays) {
  if (!days.length) {
    return `<div class="decision-calendar empty">等待买入日之后的交易数据</div>`;
  }
  return `
    <div class="decision-calendar" aria-label="买入后每日状态">
      ${days.map((day) => `
        <div class="decision-day ${decisionDayClass(day.return_pct)} ${Number(day.day) > Number(horizonDays) ? "beyond" : ""}" title="${formatDate(day.trade_date)} 收盘 ${formatNumber(day.close, 2)} / 最高 ${formatPct(day.high_return_pct)} / 最低 ${formatPct(day.low_return_pct)}">
          <span>D${formatNumber(day.day, 0)}</span>
          <strong>${formatDateShort(day.trade_date)}</strong>
          <b class="${toneClass(day.return_pct)}">${formatPct(day.return_pct)}</b>
          <em>${escapeHtml(day.status || "--")}</em>
        </div>
      `).join("")}
    </div>
  `;
}

function decisionModeLabel(mode) {
  return {
    paper_buy: "假定买入",
    next_day: "明日预测",
  }[mode] || "假定买入";
}

function decisionEntryRuleLabel(rule, mode) {
  const dayLabel = mode === "next_day" ? "次日" : "信号日";
  return {
    open: `${dayLabel}开盘价`,
    close: `${dayLabel}收盘价`,
    custom: "自定义买入价",
    today_close: "信号日收盘价",
    next_open: "次日开盘价",
    next_close: "次日收盘价",
  }[rule] || `${dayLabel}收盘价`;
}

function decisionPillClass(evaluation) {
  if (evaluation?.status === "error") {
    return "status-high";
  }
  if (Number(evaluation?.current_return_pct) > 0) {
    return "status-low";
  }
  if (Number(evaluation?.current_return_pct) < 0) {
    return "status-high";
  }
  return "status-fair";
}

function decisionDayClass(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "waiting";
  }
  if (number >= 5) {
    return "strong";
  }
  if (number > 0) {
    return "profit";
  }
  if (number <= -5) {
    return "loss";
  }
  return "soft-loss";
}

function renderGroupRow(group) {
  const count = state.watchlist.filter((item) => item.group_id === group.id).length;
  return `
    <article class="group-row">
      <div>
        <strong>${escapeHtml(group.name)}</strong>
        <span>${count} 只股票</span>
      </div>
      <div class="row-actions">
        <button class="button small" data-action="rename-group" data-id="${escapeAttr(group.id)}">改名</button>
        <button class="button small danger" data-action="delete-group" data-id="${escapeAttr(group.id)}" ${group.id === "default" ? "disabled" : ""}>删除</button>
      </div>
    </article>
  `;
}

function renderModal() {
  if (state.valuationAiError) {
    modalRoot.innerHTML = `
      <div class="modal-backdrop" data-action="close-ai-valuation-error">
        <section class="modal" role="dialog" aria-modal="true" aria-labelledby="aiAssumptionErrorTitle" data-modal>
          <div class="modal-head">
            <div>
              <h2 id="aiAssumptionErrorTitle">AI 预测失败</h2>
              <p>Gemini 暂时没有返回可用的估值假设</p>
            </div>
            <button class="icon-button" data-action="close-ai-valuation-error" aria-label="关闭">×</button>
          </div>
          <p class="valuation-ai-reason">${escapeHtml(state.valuationAiError.message || "请稍后重试，或检查 Gemini 网络与模型配置。")}</p>
          <div class="modal-actions">
            <button class="button primary" type="button" data-action="close-ai-valuation-error">知道了</button>
          </div>
        </section>
      </div>
    `;
    return;
  }

  if (state.valuationAiPreview) {
    const preview = state.valuationAiPreview;
    const riskNotes = Array.isArray(preview.risk_notes) ? preview.risk_notes.filter(Boolean) : [];
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="modal" role="dialog" aria-modal="true" aria-labelledby="aiAssumptionTitle" data-modal>
          <div class="modal-head">
            <div>
              <h2 id="aiAssumptionTitle">确认 AI 估值假设</h2>
              <p>${escapeHtml(preview.name || preview.ts_code || "当前公司")} 的 DCF 永续增长率与折现率建议</p>
            </div>
            <button class="icon-button" data-action="cancel-ai-valuation-assumptions" aria-label="关闭">×</button>
          </div>
          <div class="valuation-ai-preview">
            <article>
              <span>永续增长率</span>
              <strong>${formatNumber(preview.terminal_growth_rate, 2)}%</strong>
            </article>
            <article>
              <span>折现率 WACC</span>
              <strong>${formatNumber(preview.discount_rate, 2)}%</strong>
            </article>
            <article>
              <span>置信度</span>
              <strong>${preview.confidence === null || preview.confidence === undefined ? "--" : formatNumber(Number(preview.confidence) * 100, 0)}%</strong>
            </article>
          </div>
          <p class="valuation-ai-reason">${escapeHtml(preview.reason || "AI 根据财报趋势、现金流稳定性和风险溢价给出保守 DCF 假设。")}</p>
          ${riskNotes.length ? `
            <div class="valuation-ai-risks">
              <strong>风险提示</strong>
              ${riskNotes.map((note) => `<span>${escapeHtml(note)}</span>`).join("")}
            </div>
          ` : ""}
          <div class="modal-actions">
            <button class="button" type="button" data-action="cancel-ai-valuation-assumptions">取消</button>
            <button class="button primary" type="button" data-action="apply-ai-valuation-assumptions">确认填入</button>
          </div>
        </section>
      </div>
    `;
    return;
  }

  if (!state.editing) {
    modalRoot.innerHTML = "";
    return;
  }

  const item = state.editing;
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="editTitle" data-modal>
        <div class="modal-head">
          <div>
            <h2 id="editTitle">编辑 ${escapeHtml(item.name)}</h2>
            <p>${escapeHtml(item.ts_code)} 的估值区间、备注和依据</p>
          </div>
          <button class="icon-button" data-action="close-modal" aria-label="关闭">×</button>
        </div>
        <form class="edit-form" data-form="edit-stock">
          <input type="hidden" name="id" value="${escapeAttr(item.id)}">
          <label>
            <span>分组</span>
            <select class="select" name="group_id">
              ${state.groups.map((group) => `<option value="${escapeAttr(group.id)}" ${item.group_id === group.id ? "selected" : ""}>${escapeHtml(group.name)}</option>`).join("")}
            </select>
          </label>
          <div class="triple-grid">
            <label><span>低估线</span><input class="input" name="low_price" type="number" step="0.01" value="${escapeAttr(item.low_price ?? "")}" placeholder="例如 950"></label>
            <label><span>合理价值</span><input class="input" name="fair_price" type="number" step="0.01" value="${escapeAttr(item.fair_price ?? "")}" placeholder="例如 1200"></label>
            <label><span>高估线</span><input class="input" name="high_price" type="number" step="0.01" value="${escapeAttr(item.high_price ?? "")}" placeholder="例如 1500"></label>
          </div>
          <label>
            <span>备注</span>
            <textarea class="textarea" name="note" rows="3" placeholder="跟踪备注、下次复盘点、特殊风险">${escapeHtml(item.note || "")}</textarea>
          </label>
          <label>
            <span>估值依据</span>
            <textarea class="textarea" name="valuation_basis" rows="5" placeholder="直接粘贴你的估值逻辑和关键假设">${escapeHtml(item.valuation_basis || "")}</textarea>
          </label>
          <label>
            <span>本次调整原因</span>
            <input class="input" name="valuation_reason" placeholder="例如 年报后上调、盈利假设下修、价格区间重估">
          </label>
          <div class="modal-actions">
            <button class="button" type="button" data-action="close-modal">取消</button>
            <button class="button primary" type="submit">保存并生成流水</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderToast() {
  if (!state.toast) {
    return "";
  }
  return `<section class="toast">${escapeHtml(translateUiText(state.toast) || state.toast)}</section>`;
}

function renderBootError() {
  return `
    <section class="boot-error">
      <h1>估值手账没有打开成功</h1>
      <p>${escapeHtml(state.coreError)}</p>
      <div class="head-actions">
        <button class="button primary" data-action="reload">重新加载</button>
        <a class="button" href="/api/health" target="_blank" rel="noreferrer">查看服务状态</a>
      </div>
    </section>
  `;
}

function renderLoginPage() {
  return `
    <section class="auth-page">
      <div class="auth-card">
        <div class="auth-brand">
          <span class="brand-mark">Fin</span>
          <div>
            <p class="eyebrow">BeeBee Finance</p>
            <h1>登录估值手账</h1>
          </div>
        </div>
        <p class="auth-copy">登录后才能访问股票池、板块监控、估值模型和短线策略记录。默认管理员账号为 beebee。</p>
        ${state.loginError ? `<div class="form-error">${escapeHtml(state.loginError)}</div>` : ""}
        <form class="auth-form" data-form="login">
          <label>
            <span>用户名</span>
            <input class="input" name="username" autocomplete="username" placeholder="beebee" required autofocus>
          </label>
          <label>
            <span>密码</span>
            <input class="input" name="password" type="password" autocomplete="current-password" placeholder="默认密码 qwer1234" required>
          </label>
          <button class="button primary" type="submit" ${state.loginLoading ? "disabled" : ""}>${state.loginLoading ? "登录中..." : "登录"}</button>
        </form>
      </div>
    </section>
  `;
}

function renderUserManagement() {
  if (!isCurrentAdmin()) {
    app.innerHTML = `
      ${renderToast()}
      <section class="boot-error">
        <h1>需要管理员权限</h1>
        <p>用户管理只对管理员开放。</p>
      </section>
    `;
    return;
  }

  if (!state.usersLoading && !state.users.length && !state.usersError) {
    loadUsers().then(render);
  }

  const users = state.users || [];
  const selectedUser = users.find((user) => user.id === state.selectedUserId);
  app.innerHTML = `
    ${renderToast()}
    <section class="page-head">
      <div>
        <p class="eyebrow">Access Control</p>
        <h1 class="page-title">用户管理</h1>
        <p class="page-subtitle">管理员可以添加用户、删除用户、重置用户密码，并查看每个用户的登录时间记录。</p>
      </div>
      <div class="head-actions">
        <button class="button soft" data-action="reload-users">刷新用户</button>
      </div>
    </section>

    <section class="user-admin-grid">
      <article class="panel">
        <header class="section-head">
          <div>
            <h2>新增用户</h2>
            <p>用户名保存为小写，密码最少 6 位。</p>
          </div>
        </header>
        <form class="form-grid user-create-form" data-form="create-user">
          <label>
            <span>用户名</span>
            <input class="input" name="username" placeholder="例如 client01" required>
          </label>
          <label>
            <span>初始密码</span>
            <input class="input" name="password" type="password" autocomplete="new-password" required>
          </label>
          <label>
            <span>角色</span>
            <select class="input" name="role">
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </label>
          <button class="button primary" type="submit">添加用户</button>
        </form>
      </article>

      <article class="panel">
        <header class="section-head">
          <div>
            <h2>修改我的密码</h2>
            <p>修改密码需要输入旧密码，提交后会保留当前登录会话。</p>
          </div>
        </header>
        <form class="form-grid user-password-form" data-form="change-password">
          <label>
            <span>旧密码</span>
            <input class="input" name="old_password" type="password" autocomplete="current-password" required>
          </label>
          <label>
            <span>新密码</span>
            <input class="input" name="new_password" type="password" autocomplete="new-password" required>
          </label>
          <button class="button soft" type="submit">修改密码</button>
        </form>
      </article>
    </section>

    <section class="panel user-table-panel">
      <header class="section-head">
        <div>
          <h2>用户列表</h2>
          <p>${state.usersLoading ? "正在读取用户..." : `共 ${users.length} 个用户`}</p>
        </div>
      </header>
      ${state.usersError ? `<div class="form-error">${escapeHtml(state.usersError)}</div>` : ""}
      <div class="table-wrap">
        <table class="user-table">
          <thead>
            <tr>
              <th>用户</th>
              <th>角色</th>
              <th>最后登录</th>
              <th>登录次数</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${users.map((user) => renderUserRow(user)).join("") || `<tr><td colspan="6" class="muted">暂无用户</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel user-log-panel">
      <header class="section-head">
        <div>
          <h2>登录时间记录</h2>
          <p>${selectedUser ? `${escapeHtml(selectedUser.username)} 的成功登录流水` : "点击用户列表中的“登录记录”查看"}</p>
        </div>
      </header>
      ${renderSelectedUserLogins()}
    </section>
  `;
}

function renderUserRow(user) {
  const isSelf = state.auth.user?.id === user.id;
  return `
    <tr>
      <td>
        <strong>${escapeHtml(user.username)}</strong>
        ${isSelf ? `<small>当前登录</small>` : ""}
      </td>
      <td><span class="status-pill ${user.role === "admin" ? "high" : "neutral"}">${user.role === "admin" ? "管理员" : "普通用户"}</span></td>
      <td>${escapeHtml(formatDateTime(user.last_login_at))}</td>
      <td>${Number(user.login_count || 0)}</td>
      <td>${escapeHtml(formatDateTime(user.created_at))}</td>
      <td>
        <div class="table-actions">
          <button class="button compact" data-action="load-user-login-events" data-id="${escapeAttr(user.id)}">登录记录</button>
          ${isSelf ? "" : `<button class="button compact" data-action="reset-user-password" data-id="${escapeAttr(user.id)}">重置密码</button>`}
          ${isSelf ? "" : `<button class="button danger compact" data-action="delete-user" data-id="${escapeAttr(user.id)}">删除</button>`}
        </div>
      </td>
    </tr>
  `;
}

function renderSelectedUserLogins() {
  if (state.selectedUserLoginsLoading) {
    return `<div class="loading compact">正在读取登录记录...</div>`;
  }
  if (!state.selectedUserLogins) {
    return `<p class="muted">还没有选择用户。</p>`;
  }
  const events = state.selectedUserLogins.events || [];
  return `
    <div class="login-event-list">
      ${events.map((event) => `
        <div class="login-event">
          <strong>${escapeHtml(formatDateTime(event.login_at))}</strong>
          <span>${escapeHtml(event.ip || "--")}</span>
          <small>${escapeHtml(event.user_agent || "--")}</small>
        </div>
      `).join("") || `<p class="muted">暂无登录记录</p>`}
    </div>
  `;
}

async function handleSubmit(event) {
  const form = event.target.closest("form");
  if (!form) {
    return;
  }

  const type = form.dataset.form;
  if (!type) {
    return;
  }

  event.preventDefault();

  if (type === "login") {
    await login(form);
    return;
  }

  if (type === "change-password") {
    await changePassword(form);
    return;
  }

  if (type === "create-user") {
    await createUser(form);
    return;
  }

  if (type === "search-stock") {
    await searchStocks(new FormData(form).get("q"));
    return;
  }

  if (type === "edit-stock") {
    await saveEditedStock(form);
    return;
  }

  if (type === "create-group") {
    await createGroup(form);
    return;
  }

  if (type === "create-decision") {
    await createDecision(form);
  }
}

async function handleClick(event) {
  const actionEl = event.target.closest("[data-action]");
  if (!actionEl) {
    return;
  }

  const action = actionEl.dataset.action;
  actionEl.blur?.();

  if (action === "logout") {
    await logout();
    return;
  }

  if (action === "load-user-login-events") {
    await loadUserLoginEvents(actionEl.dataset.id || "");
    return;
  }

  if (action === "reset-user-password") {
    await resetUserPassword(actionEl.dataset.id || "");
    return;
  }

  if (action === "delete-user") {
    await deleteUser(actionEl.dataset.id || "");
    return;
  }

  if (action === "close-modal") {
    if (!event.target.closest("[data-modal]") || actionEl.classList.contains("icon-button") || actionEl.tagName === "BUTTON") {
      state.editing = null;
      renderModal();
    }
    return;
  }

  if (action === "close-ai-valuation-error") {
    state.valuationAiError = null;
    renderModal();
    return;
  }

  if (action === "cancel-ai-valuation-assumptions") {
    state.valuationAiPreview = null;
    renderModal();
    return;
  }

  if (action === "apply-ai-valuation-assumptions") {
    applyValuationAiAssumptions();
    return;
  }

  if (action === "reload") {
    await loadCore();
    showToast("已刷新");
    render();
    return;
  }

  if (action === "reload-users") {
    await loadUsers(true);
    showToast("用户列表已刷新");
    render();
    return;
  }

  if (action === "start-sync") {
    await api("/api/sync/start", { method: "POST" });
    await loadCore();
    showToast("已开始同步；如果收盘价暂未发布，系统会自动重试");
    render();
    return;
  }

  if (action === "add-result") {
    await addSearchResult(actionEl.dataset.code);
    return;
  }

  if (action === "open-stock") {
    const stockId = actionEl.dataset.code || actionEl.dataset.id || "";
    if (!stockId) {
      showToast("没有找到这只股票的代码，暂时无法打开详情");
      render();
      return;
    }
    location.hash = `#/stock/${encodeURIComponent(stockId)}`;
    return;
  }

  if (action === "add-detail-stock") {
    await addDetailStock(actionEl.dataset.code);
    return;
  }

  if (action === "start-decision") {
    state.decisionDraftCode = actionEl.dataset.code || "";
    location.hash = "#/decisions";
    render();
    return;
  }

  if (action === "edit-stock") {
    openEdit(actionEl.dataset.id);
    return;
  }

  if (action === "delete-stock") {
    await deleteStock(actionEl.dataset.id);
    return;
  }

  if (action === "set-tab") {
    state.detailTab = actionEl.dataset.tab || "analysis";
    render();
    return;
  }

  if (action === "refresh-company-analysis") {
    await refreshCompanyAnalysis(actionEl.dataset.code || state.detail?.item?.ts_code || "");
    return;
  }

  if (action === "calculate-valuation") {
    state.valuationDraft = calculateValuationDraft(collectValuationDraftFromForm());
    render();
    return;
  }

  if (action === "derive-valuation-inputs") {
    const draft = collectValuationDraftFromForm();
    state.valuationDraft = {
      ...draft,
      inputs: deriveValuationInputs(draft.inputs || {}, { overwrite: true }),
    };
    render();
    return;
  }

  if (action === "save-valuation") {
    await saveValuationDraft();
    return;
  }

  if (action === "extract-valuation-pdf") {
    await extractValuationPdf();
    return;
  }

  if (action === "fill-valuation-tushare") {
    await fillValuationFromTushare();
    return;
  }

  if (action === "ai-valuation-assumptions") {
    await predictValuationAssumptions();
    return;
  }

  if (action === "select-valuation-stock") {
    const draft = collectValuationDraftFromForm();
    state.valuationDraft = {
      ...draft,
      ts_code: actionEl.dataset.code || "",
      name: actionEl.dataset.name || draft.name || "",
    };
    state.valuationStockResults = [];
    state.valuationStockError = "";
    render();
    return;
  }

  if (action === "select-stock-suggest") {
    await selectStockSuggestion(actionEl.dataset.kind || "", actionEl.dataset.code || "", actionEl.dataset.name || "");
    return;
  }

  if (action === "set-chart-period") {
    state.chartPeriod = actionEl.dataset.period || "day";
    state.chartRows = [];
    state.chartError = "";
    state.chartKey = "";
    state.chartLoadedKey = "";
    if (state.detail?.item?.ts_code) {
      ensureChart(state.detail.item.ts_code, true);
    }
    render();
    return;
  }

  if (action === "set-pool-tab") {
    state.poolTab = actionEl.dataset.tab || "stocks";
    render();
    return;
  }

  if (action === "refresh-market") {
    await loadMarket(true);
    render();
    return;
  }

  if (action === "refresh-decisions") {
    await loadDecisionTests(true);
    render();
    return;
  }

  if (action === "refresh-turnover-monitor") {
    await loadTurnoverMonitor(true);
    render();
    return;
  }

  if (action === "load-short-strategy") {
    await loadShortStrategy(true);
    render();
    return;
  }

  if (action === "save-short-strategy-monitor") {
    await saveShortStrategyMonitor();
    return;
  }

  if (action === "delete-short-strategy-monitor") {
    await deleteShortStrategyMonitor(actionEl.dataset.id || "");
    return;
  }

  if (action === "set-short-strategy-tab") {
    state.strategyTab = actionEl.dataset.tab === "grid" ? "grid" : "tplus1";
    render();
    return;
  }

  if (action === "refresh-strength-matrix") {
    await loadStrengthMatrix(true);
    render();
    return;
  }

  if (action === "set-strength-view") {
    state.strengthView = actionEl.dataset.view || "segment";
    state.strengthPage = 1;
    render();
    return;
  }

  if (action === "set-strength-info-tab") {
    state.strengthInfoTab = actionEl.dataset.tab === "labels" ? "labels" : "score";
    state.strengthInfoOpen = true;
    render();
    return;
  }

  if (action === "toggle-strength-status") {
    const status = actionEl.dataset.status || "";
    const selected = selectedStrengthStatuses();
    state.strengthStatus = selected.includes(status)
      ? selected.filter((item) => item !== status)
      : [...selected, status];
    state.strengthPage = 1;
    render();
    return;
  }

  if (action === "clear-strength-status") {
    state.strengthStatus = [];
    state.strengthPage = 1;
    render();
    return;
  }

  if (action === "refresh-sectors") {
    await loadSectorFlow(true);
    render();
    return;
  }

  if (action === "add-sector-pool") {
    await addSectorPoolItem({
      code: actionEl.dataset.sectorCode || "",
      name: actionEl.dataset.sectorName || "",
      level: actionEl.dataset.sectorLevel || state.sectorFlow?.level || state.sectorLevel,
    });
    return;
  }

  if (action === "remove-sector-pool") {
    await removeSectorPoolItem(actionEl.dataset.sectorId || "");
    return;
  }

  if (action === "toggle-sector-pool-line") {
    const sector = actionEl.dataset.sector || "";
    state.sectorPoolVisibility[sector] = !isSectorPoolVisible(sector);
    render();
    return;
  }

  if (action === "show-all-sector-pool-lines") {
    (state.sectorPoolTrendFlow?.sectors || []).forEach((sector) => {
      state.sectorPoolVisibility[sector.name] = true;
    });
    render();
    return;
  }

  if (action === "hide-all-sector-pool-lines") {
    (state.sectorPoolTrendFlow?.sectors || []).forEach((sector) => {
      state.sectorPoolVisibility[sector.name] = false;
    });
    render();
    return;
  }

  if (action === "open-sector") {
    const code = actionEl.dataset.code;
    if (code) {
      const level = actionEl.dataset.level || state.sectorFlow?.level || state.strengthLevel || state.sectorLevel;
      const from = sectorDetailSourceFromRoute();
      const suffix = from ? `?from=${encodeURIComponent(from)}` : "";
      location.hash = `#/sector/${encodeURIComponent(level)}/${encodeURIComponent(code)}${suffix}`;
    }
    return;
  }

  if (action === "toggle-sector-line") {
    const sector = actionEl.dataset.sector || "";
    state.sectorVisibility[sector] = !isSectorVisible(sector);
    render();
    return;
  }

  if (action === "focus-sector-line") {
    const sectorName = actionEl.dataset.sector || "";
    (state.sectorFlow?.sectors || []).forEach((sector) => {
      state.sectorVisibility[sector.name] = sector.name === sectorName;
    });
    render();
    return;
  }

  if (action === "show-all-sectors") {
    (state.sectorFlow?.sectors || []).forEach((sector) => {
      state.sectorVisibility[sector.name] = true;
    });
    render();
    return;
  }

  if (action === "hide-all-sectors") {
    (state.sectorFlow?.sectors || []).forEach((sector) => {
      state.sectorVisibility[sector.name] = false;
    });
    render();
    return;
  }

  if (action === "show-my-sectors") {
    const poolNames = new Set(currentSectorPool().map((item) => item.name));
    (state.sectorFlow?.sectors || []).forEach((sector) => {
      state.sectorVisibility[sector.name] = poolNames.has(sector.name);
    });
    render();
    return;
  }

  if (action === "show-surging-sectors") {
    const surgeNames = new Set(buildSectorSurgeRows(state.sectorFlow).slice(0, 10).map((row) => row.name));
    (state.sectorFlow?.sectors || []).forEach((sector) => {
      state.sectorVisibility[sector.name] = surgeNames.has(sector.name);
    });
    render();
    return;
  }

  if (action === "show-filtered-sectors") {
    const sectorNames = new Set(filterSectorsByLegendQuery(state.sectorFlow?.sectors || []).map((sector) => sector.name));
    (state.sectorFlow?.sectors || []).forEach((sector) => {
      state.sectorVisibility[sector.name] = sectorNames.has(sector.name);
    });
    render();
    return;
  }

  if (action === "show-top-sectors") {
    const topNames = new Set((state.sectorFlow?.ranking || []).slice(0, 10).map((row) => row.name));
    (state.sectorFlow?.sectors || []).forEach((sector) => {
      state.sectorVisibility[sector.name] = topNames.has(sector.name);
    });
    render();
    return;
  }

  if (action === "refresh-sector-detail") {
    await loadSectorDetail(state.route.id, true, state.route.level || state.sectorLevel);
    render();
    return;
  }

  if (action === "toggle-sector-stock-line") {
    const code = actionEl.dataset.code || "";
    state.sectorStockVisibility[code] = !isSectorStockVisible(code);
    render();
    return;
  }

  if (action === "show-all-sector-stocks") {
    (state.sectorDetail?.series || []).forEach((stock) => {
      state.sectorStockVisibility[stock.ts_code] = true;
    });
    render();
    return;
  }

  if (action === "hide-all-sector-stocks") {
    (state.sectorDetail?.series || []).forEach((stock) => {
      state.sectorStockVisibility[stock.ts_code] = false;
    });
    render();
    return;
  }

  if (action === "show-top-sector-stocks") {
    (state.sectorDetail?.series || []).forEach((stock, index) => {
      state.sectorStockVisibility[stock.ts_code] = index < 8;
    });
    render();
    return;
  }

  if (action === "page-list") {
    const list = actionEl.dataset.list || "";
    const page = Number(actionEl.dataset.page || 1);
    if (list === "sectorStock") {
      state.sectorStockPage = page;
      render();
    }
    if (list === "turnover") {
      state.turnoverPage = page;
      render();
    }
    if (list === "strength") {
      state.strengthPage = page;
      render();
    }
    if (list === "decision") {
      state.decisionPage = page;
      render();
    }
    return;
  }

  if (action === "rename-group") {
    await renameGroup(actionEl.dataset.id);
    return;
  }

  if (action === "delete-group") {
    await deleteGroup(actionEl.dataset.id);
    return;
  }

  if (action === "delete-decision") {
    await deleteDecision(actionEl.dataset.id);
  }
}

function handleChange(event) {
  if (event.target.matches("[data-locale-select]")) {
    const nextLocale = LOCALES.some((item) => item.code === event.target.value) ? event.target.value : "zh-CN";
    state.locale = nextLocale;
    localStorage.setItem(LOCALE_KEY, nextLocale);
    render();
    return;
  }

  const editForm = event.target.closest('[data-form="edit-stock"]');
  if (editForm && state.editing && event.target.name) {
    state.editing[event.target.name] = event.target.value;
    return;
  }

  const decisionForm = event.target.closest('[data-form="create-decision"]');
  if (decisionForm && event.target.name === "mode") {
    const entryRule = decisionForm.elements.entry_rule;
    if (entryRule) {
      entryRule.value = event.target.value === "next_day" ? "open" : "close";
    }
    syncDecisionCustomPriceVisibility(decisionForm);
    syncDecisionCustomHorizonVisibility(decisionForm);
    return;
  }

  if (decisionForm && event.target.name === "entry_rule") {
    syncDecisionCustomPriceVisibility(decisionForm);
    return;
  }

  if (decisionForm && event.target.name === "horizon_days") {
    syncDecisionCustomHorizonVisibility(decisionForm);
    return;
  }

  const valuationForm = event.target.closest('[data-form="valuation-workbench"]');
  if (valuationForm && event.target.name === "financial_period_count") {
    state.valuationDraft = collectValuationDraftFromForm();
    render();
    return;
  }

  if (valuationForm && event.target.name?.startsWith("financial_periods.") && event.target.name.endsWith(".report_type")) {
    state.valuationDraft = collectValuationDraftFromForm();
    render();
    return;
  }

  if (valuationForm && event.target.name === "methods") {
    state.valuationDraft = calculateValuationDraft(collectValuationDraftFromForm());
    render();
    return;
  }

  if (event.target.dataset.strategyControl) {
    updateStrategyParam(
      event.target.dataset.strategyControl,
      event.target.dataset.name,
      event.target.type === "checkbox" ? event.target.checked : event.target.value,
    );
    render();
    return;
  }

  const filter = event.target.dataset.filter;
  if (!filter) {
    const strengthControl = event.target.dataset.strengthControl;
    if (strengthControl === "level") {
      state.strengthLevel = event.target.value || "L3";
      state.strengthMatrix = null;
      state.strengthPage = 1;
      loadStrengthMatrix(true).then(render);
      return;
    }
    if (strengthControl === "sort") {
      state.strengthSort = event.target.value || "overall";
      state.strengthPage = 1;
      render();
      return;
    }
    if (strengthControl === "view") {
      state.strengthView = event.target.value || "segment";
      state.strengthPage = 1;
      render();
      return;
    }
    if (strengthControl === "status") {
      state.strengthStatus = event.target.value && event.target.value !== "all" ? [event.target.value] : [];
      state.strengthPage = 1;
      render();
      return;
    }

    const sectorControl = event.target.dataset.sectorControl;
    if (sectorControl === "level") {
      state.sectorLevel = event.target.value || "L3";
      state.sectorFlow = null;
      state.sectorVisibility = {};
      state.sectorVisibilityQuery = "";
      state.sectorDetail = null;
      state.sectorDetailCode = "";
      loadSectorFlow(true).then(render);
      return;
    }
    if (sectorControl === "trendDays") {
      state.sectorTrendDays = Number(event.target.value);
      state.sectorFlow = null;
      loadSectorFlow(true).then(render);
      return;
    }
    if (sectorControl === "period") {
      state.sectorPeriod = event.target.value || "day";
      state.sectorFlow = null;
      loadSectorFlow(true).then(render);
      return;
    }
    if (sectorControl === "startDate") {
      state.sectorStartDate = event.target.value;
      state.sectorFlow = null;
      loadSectorFlow(true).then(render);
      return;
    }
    if (sectorControl === "endDate") {
      state.sectorEndDate = event.target.value;
      state.sectorFlow = null;
      loadSectorFlow(true).then(render);
      return;
    }
    const sectorPoolControl = event.target.dataset.sectorPoolControl;
    if (sectorPoolControl === "level") {
      state.sectorPoolLevel = event.target.value || "all";
      state.sectorPoolTrendFlow = null;
      state.sectorPoolTrendKey = "";
      state.sectorPoolVisibility = {};
      render();
      return;
    }
    if (sectorPoolControl === "trendDays") {
      state.sectorPoolTrendDays = Number(event.target.value) || 180;
      render();
      return;
    }
    const sectorDetailControl = event.target.dataset.sectorDetailControl;
    if (sectorDetailControl === "trendDays") {
      state.sectorStockTrendDays = Number(event.target.value);
      state.sectorDetail = null;
      state.sectorStockPage = 1;
      loadSectorDetail(state.route.id, true, state.route.level || state.sectorLevel).then(render);
      return;
    }
    if (sectorDetailControl === "window") {
      state.sectorStockWindow = Number(event.target.value);
      state.sectorDetail = null;
      state.sectorStockVisibility = {};
      state.sectorStockPage = 1;
      loadSectorDetail(state.route.id, true, state.route.level || state.sectorLevel).then(render);
      return;
    }
    if (sectorDetailControl === "metric") {
      state.sectorStockMetric = event.target.value || "return";
      state.sectorDetail = null;
      state.sectorStockVisibility = {};
      state.sectorStockPage = 1;
      loadSectorDetail(state.route.id, true, state.route.level || state.sectorLevel).then(render);
      return;
    }
    if (sectorDetailControl === "chartMode") {
      state.sectorStockChartMode = event.target.value || "return";
      render();
      return;
    }
    return;
  }
  state.filters[filter] = event.target.value;
  render();
}

function handleToggle(event) {
  if (event.target?.dataset?.details === "strengthInfo") {
    state.strengthInfoOpen = Boolean(event.target.open);
  }
}

function handleInput(event) {
  if (event.target.matches("[data-global-search]")) {
    applyGlobalSearch(event.target.value);
    return;
  }

  if (event.target.id === "stockSearch") {
    state.searchQuery = event.target.value;
    queueStockSuggest("addStock", event.target.value, event.target.selectionStart);
    return;
  }

  if (event.target.dataset.stockSuggestKind === "decisionCreate") {
    state.decisionDraftCode = event.target.value;
    queueStockSuggest("decisionCreate", event.target.value, event.target.selectionStart);
    return;
  }

  const valuationForm = event.target.closest('[data-form="valuation-workbench"]');
  if (valuationForm && event.target.name === "financial_period_count") {
    if (!String(event.target.value || "").trim()) {
      return;
    }
    state.valuationDraft = collectValuationDraftFromForm();
    render();
    return;
  }

  if (event.target.dataset.valuationStockSearch) {
    const previousName = state.valuationDraft?.name || "";
    const draft = collectValuationDraftFromForm();
    if (String(event.target.value || "") !== previousName) {
      draft.ts_code = "";
    }
    state.valuationDraft = draft;
    queueValuationStockSearch(event.target.value, event.target.selectionStart);
    return;
  }

  if (event.target.dataset.strategyInput) {
    const cursor = event.target.selectionStart;
    const group = event.target.dataset.strategyInput;
    const name = event.target.dataset.name;
    updateStrategyParam(group, name, event.target.value);
    render();
    restoreStrategyInputFocus(group, name, cursor);
    return;
  }

  const listSearch = event.target.dataset.listSearch;
  if (listSearch) {
    const cursor = event.target.selectionStart;
    if (listSearch === "dashboard") {
      state.dashboardQuery = event.target.value;
    }
    if (listSearch === "pool") {
      state.poolListQuery = event.target.value;
    }
    if (listSearch === "market") {
      state.marketQuery = event.target.value;
    }
    if (listSearch === "decision") {
      state.decisionQuery = event.target.value;
      state.decisionPage = 1;
    }
    if (listSearch === "valuation") {
      state.valuationQuery = event.target.value;
    }
    if (listSearch === "turnover") {
      state.turnoverQuery = event.target.value;
      state.turnoverPage = 1;
    }
    if (listSearch === "strategy") {
      state.strategySearch = event.target.value;
      state.strategyCode = extractClientStockCode(event.target.value);
    }
    if (listSearch === "strategyMonitor") {
      state.strategyMonitorQuery = event.target.value;
    }
    if (listSearch === "strength") {
      state.strengthQuery = event.target.value;
      state.strengthPage = 1;
    }
    if (listSearch === "sector") {
      state.sectorQuery = event.target.value;
    }
    if (listSearch === "sectorLegend") {
      state.sectorVisibilityQuery = event.target.value;
    }
    if (listSearch === "sectorPool") {
      state.sectorPoolQuery = event.target.value;
    }
    if (listSearch === "sectorStock") {
      state.sectorStockQuery = event.target.value;
      state.sectorStockPage = 1;
    }
    render();
    if (event.target.dataset.stockSuggestKind) {
      queueStockSuggest(listSearch, event.target.value, cursor);
    } else {
      restoreListSearchFocus(listSearch, cursor);
    }
    return;
  }

  const editForm = event.target.closest('[data-form="edit-stock"]');
  if (editForm && state.editing && event.target.name) {
    state.editing[event.target.name] = event.target.value;
  }
}

function syncDecisionCustomPriceVisibility(form) {
  const customLabel = form.querySelector("[data-custom-entry-price]");
  const customInput = form.elements.entry_price;
  const showCustom = form.elements.entry_rule?.value === "custom";
  if (!customLabel || !customInput) {
    return;
  }
  customLabel.hidden = !showCustom;
  customInput.disabled = !showCustom;
  customInput.required = showCustom;
  if (!showCustom) {
    customInput.value = "";
  }
}

function syncDecisionCustomHorizonVisibility(form) {
  const customInput = form.elements.custom_horizon_days;
  const showCustom = form.elements.horizon_days?.value === "custom";
  if (!customInput) {
    return;
  }
  customInput.hidden = !showCustom;
  customInput.disabled = !showCustom;
  customInput.required = showCustom;
  if (!showCustom) {
    customInput.value = "";
  }
}

function stockSuggestValueForKind(kind, stock) {
  if (kind === "addStock" || kind === "decisionCreate") {
    return stock.ts_code || stock.name || "";
  }
  if (kind === "strategy") {
    return [stock.name, stock.ts_code].filter(Boolean).join(" ");
  }
  return stock.name || stock.ts_code || "";
}

async function selectStockSuggestion(kind, code, name) {
  const stock = { ts_code: code, name };
  const value = stockSuggestValueForKind(kind, stock);
  if (kind === "addStock") {
    state.searchQuery = value;
    clearStockSuggest();
    render();
    if (code) {
      await searchStocks(code);
    }
    return;
  }
  if (kind === "decisionCreate") {
    state.decisionDraftCode = code || value;
    clearStockSuggest();
    render();
    return;
  }
  if (kind === "strategy") {
    state.strategySearch = value;
    state.strategyCode = code || extractClientStockCode(value);
    clearStockSuggest();
    await loadShortStrategy(true);
    render();
    return;
  }
  applyListSearchValue(kind, value);
  clearStockSuggest();
  render();
  restoreListSearchFocus(kind, value.length);
}

function applyListSearchValue(kind, value) {
  if (kind === "dashboard") {
    state.dashboardQuery = value;
  }
  if (kind === "pool") {
    state.poolListQuery = value;
  }
  if (kind === "market") {
    state.marketQuery = value;
  }
  if (kind === "decision") {
    state.decisionQuery = value;
    state.decisionPage = 1;
  }
  if (kind === "valuation") {
    state.valuationQuery = value;
  }
  if (kind === "turnover") {
    state.turnoverQuery = value;
    state.turnoverPage = 1;
  }
  if (kind === "strategy") {
    state.strategySearch = value;
    state.strategyCode = extractClientStockCode(value);
  }
  if (kind === "strategyMonitor") {
    state.strategyMonitorQuery = value;
  }
  if (kind === "sector") {
    state.sectorQuery = value;
  }
  if (kind === "sectorPool") {
    state.sectorPoolQuery = value;
  }
  if (kind === "sectorStock") {
    state.sectorStockQuery = value;
    state.sectorStockPage = 1;
  }
  if (kind === "strength") {
    state.strengthQuery = value;
    state.strengthPage = 1;
  }
}

function applyGlobalSearch(value) {
  const page = state.route?.page || "dashboard";
  const routeSearchMap = {
    dashboard: "dashboard",
    pool: "pool",
    market: "market",
    decisions: "decision",
    turnover: "turnover",
    "short-strategies": "strategyMonitor",
    "short-strategy": "strategy",
    strength: "strength",
    sectors: "sector",
    "sector-pool": "sectorPool",
    sector: "sectorStock",
    valuations: "valuation",
    valuation: "valuation",
  };
  const kind = routeSearchMap[page];
  if (!kind) {
    return;
  }
  applyListSearchValue(kind, value);
  render();
}

function updateStrategyParam(group, name, value) {
  if (!name) {
    return;
  }
  const target = group === "grid" ? state.strategyGridParams : state.strategyTParams;
  const numericNames = new Set([
    "period",
    "safetyMargin",
    "horizonDays",
    "gridCount",
    "holdingCost",
    "customBasePrice",
    "customCenterPrice",
    "feeRate",
    "slippageRate",
  ]);
  if (typeof value === "boolean") {
    target[name] = value;
    return;
  }
  if (numericNames.has(name)) {
    target[name] = value === "" ? "" : Number(value);
    return;
  }
  target[name] = value;
}

function restoreStrategyInputFocus(group, name, cursor) {
  requestAnimationFrame(() => {
    const input = document.querySelector(`[data-strategy-input="${group}"][data-name="${name}"]`);
    if (!input) {
      return;
    }
    input.focus();
    if (Number.isInteger(cursor) && typeof input.setSelectionRange === "function") {
      input.setSelectionRange(cursor, cursor);
    }
  });
}

function extractClientStockCode(value) {
  const raw = String(value || "").trim().toUpperCase();
  const match = raw.match(/(\d{6})(?:\.(SH|SZ|BJ))?/);
  if (!match) {
    return "";
  }
  const symbol = match[1];
  const suffix = match[2] || (/^(6|9)/.test(symbol) ? "SH" : /^(4|8)/.test(symbol) ? "BJ" : "SZ");
  return `${symbol}.${suffix}`;
}

function clearStockSuggest() {
  window.clearTimeout(stockSuggestTimer);
  state.stockSuggestKind = "";
  state.stockSuggestQuery = "";
  state.stockSuggestResults = [];
  state.stockSuggestLoading = false;
  state.stockSuggestError = "";
}

function queueStockSuggest(kind, query, cursor) {
  window.clearTimeout(stockSuggestTimer);
  const q = String(query || "").trim();
  state.stockSuggestKind = kind;
  state.stockSuggestQuery = q;
  state.stockSuggestError = "";
  if (!q || q.length < 1) {
    state.stockSuggestResults = [];
    state.stockSuggestLoading = false;
    render();
    restoreStockSuggestFocus(kind, cursor);
    return;
  }
  stockSuggestTimer = window.setTimeout(async () => {
    state.stockSuggestKind = kind;
    state.stockSuggestQuery = q;
    state.stockSuggestLoading = true;
    render();
    restoreStockSuggestFocus(kind, cursor);
    try {
      const data = await api(`/api/stocks/search?q=${encodeURIComponent(q)}`);
      state.stockSuggestResults = (data.results || []).slice(0, 8);
      state.stockSuggestError = state.stockSuggestResults.length ? "" : "没有找到匹配股票";
    } catch (error) {
      state.stockSuggestResults = [];
      state.stockSuggestError = error.message || "股票搜索失败";
    } finally {
      state.stockSuggestLoading = false;
      render();
      restoreStockSuggestFocus(kind, cursor);
    }
  }, 220);
}

function restoreStockSuggestFocus(kind, cursor) {
  requestAnimationFrame(() => {
    const input = document.querySelector(`[data-stock-suggest-kind="${kind}"]`);
    if (!input) {
      return;
    }
    input.focus();
    if (Number.isInteger(cursor) && typeof input.setSelectionRange === "function") {
      input.setSelectionRange(cursor, cursor);
    }
  });
}

function queueValuationStockSearch(query, cursor) {
  window.clearTimeout(valuationStockSearchTimer);
  const q = String(query || "").trim();
  state.valuationStockError = "";
  if (!q) {
    state.valuationStockResults = [];
    render();
    restoreValuationStockFocus(cursor);
    return;
  }
  valuationStockSearchTimer = window.setTimeout(async () => {
    state.valuationStockLoading = true;
    render();
    restoreValuationStockFocus(cursor);
    try {
      const data = await api(`/api/stocks/search?q=${encodeURIComponent(q)}`);
      state.valuationStockResults = (data.results || []).slice(0, 8);
      state.valuationStockError = state.valuationStockResults.length ? "" : "没有找到匹配股票";
    } catch (error) {
      state.valuationStockResults = [];
      state.valuationStockError = error.message || "股票搜索失败";
    } finally {
      state.valuationStockLoading = false;
      render();
      restoreValuationStockFocus(cursor);
    }
  }, 220);
}

function restoreValuationStockFocus(cursor) {
  requestAnimationFrame(() => {
    const input = document.querySelector("[data-valuation-stock-search]");
    if (!input) {
      return;
    }
    input.focus();
    if (Number.isInteger(cursor) && typeof input.setSelectionRange === "function") {
      input.setSelectionRange(cursor, cursor);
    }
  });
}

function isCurrentAdmin() {
  return state.auth.user?.role === "admin";
}

async function login(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  state.loginLoading = true;
  state.loginError = "";
  state.coreError = "";
  render();
  try {
    const payload = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: data.username,
        password: data.password,
      }),
    });
    state.auth = {
      checked: true,
      authenticated: true,
      user: payload.user,
    };
    state.dashboard = null;
    state.coreLoading = true;
    await loadCore();
    state.coreLoading = false;
    state.loginLoading = false;
    state.loginError = "";
    if (state.route.page === "users" && !isCurrentAdmin()) {
      location.hash = "#/dashboard";
    }
    startSyncPolling();
    render();
  } catch (error) {
    state.loginLoading = false;
    state.loginError = error.message || "登录失败";
    render();
  }
}

async function logout() {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch {
    // Logging out should still clear the local shell even if the session already expired.
  }
  state.auth = { checked: true, authenticated: false, user: null };
  state.dashboard = null;
  state.groups = [];
  state.watchlist = [];
  state.users = [];
  state.selectedUserId = "";
  state.selectedUserLogins = null;
  state.coreLoading = false;
  location.hash = "#/dashboard";
  render();
}

async function changePassword(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    await api("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({
        old_password: data.old_password,
        new_password: data.new_password,
      }),
    });
    form.reset();
    showToast("密码已修改");
    render();
  } catch (error) {
    showToast(error.message || "修改密码失败");
    render();
  }
}

async function loadUsers(force = false) {
  if (!isCurrentAdmin()) {
    return;
  }
  if (state.usersLoading && !force) {
    return;
  }
  state.usersLoading = true;
  state.usersError = "";
  try {
    const payload = await api("/api/users");
    state.users = payload.users || [];
  } catch (error) {
    state.usersError = error.message || "用户列表读取失败";
  } finally {
    state.usersLoading = false;
  }
}

async function createUser(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    await api("/api/users", {
      method: "POST",
      body: JSON.stringify({
        username: data.username,
        password: data.password,
        role: data.role,
      }),
    });
    form.reset();
    await loadUsers(true);
    showToast("用户已添加");
    render();
  } catch (error) {
    showToast(error.message || "添加用户失败");
    render();
  }
}

async function loadUserLoginEvents(id) {
  if (!id) {
    return;
  }
  state.selectedUserId = id;
  state.selectedUserLogins = null;
  state.selectedUserLoginsLoading = true;
  render();
  try {
    state.selectedUserLogins = await api(`/api/users/${encodeURIComponent(id)}/login-events`);
  } catch (error) {
    showToast(error.message || "登录记录读取失败");
  } finally {
    state.selectedUserLoginsLoading = false;
    render();
  }
}

async function resetUserPassword(id) {
  if (!id) {
    return;
  }
  const password = window.prompt("请输入该用户的新密码，至少 6 位");
  if (!password) {
    return;
  }
  try {
    await api(`/api/users/${encodeURIComponent(id)}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    await loadUsers(true);
    showToast("用户密码已重置");
    render();
  } catch (error) {
    showToast(error.message || "重置密码失败");
    render();
  }
}

async function deleteUser(id) {
  if (!id) {
    return;
  }
  const user = state.users.find((item) => item.id === id);
  if (!window.confirm(`确定删除用户 ${user?.username || id} 吗？`)) {
    return;
  }
  try {
    await api(`/api/users/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (state.selectedUserId === id) {
      state.selectedUserId = "";
      state.selectedUserLogins = null;
    }
    await loadUsers(true);
    showToast("用户已删除");
    render();
  } catch (error) {
    showToast(error.message || "删除用户失败");
    render();
  }
}

async function searchStocks(query) {
  const q = String(query || "").trim();
  state.searchQuery = q;
  state.searchResults = [];
  state.searchError = "";
  if (!q) {
    state.searchError = "请输入股票代码或名称";
    render();
    return;
  }

  state.searchLoading = true;
  render();
  try {
    const data = await api(`/api/stocks/search?q=${encodeURIComponent(q)}`);
    state.searchResults = data.results || [];
    if (!state.searchResults.length) {
      state.searchError = "没有找到匹配股票";
    }
  } catch (error) {
    state.searchError = error.message;
  } finally {
    state.searchLoading = false;
    render();
  }
}

async function addSearchResult(code) {
  const data = await api("/api/watchlist", {
    method: "POST",
    body: JSON.stringify({ ts_code: code }),
  });
  await loadCore();
  state.searchResults = [];
  state.searchQuery = "";
  state.editing = data.item;
  showToast(`${data.item.name} 已加入股票池`);
  render();
}

async function addDetailStock(code) {
  if (!code) {
    return;
  }
  const data = await api("/api/watchlist", {
    method: "POST",
    body: JSON.stringify({ ts_code: code }),
  });
  await loadCore();
  state.detail = null;
  state.detailTab = "analysis";
  await ensureDetail(code, true);
  state.editing = data.item;
  showToast(`${data.item.name} 已加入股票池`);
  render();
}

async function refreshCompanyAnalysis(code) {
  if (!code || state.companyAnalysisLoading) {
    return;
  }
  state.companyAnalysisLoading = true;
  render();
  try {
    const companyName = state.detail?.item?.name || "";
    const data = await api(`/api/stocks/${encodeURIComponent(code)}/analysis`, {
      method: "POST",
      body: JSON.stringify({ company_name: companyName }),
    });
    if (state.detail?.item?.ts_code === code) {
      state.detail.company_analysis_latest = data.latest || null;
      state.detail.company_analysis_history = data.history || [];
      state.detail.company_analysis_status = data.status || {};
    }
    showToast("公司分析已更新");
  } catch (error) {
    showToast(error.message || "公司分析失败");
  } finally {
    state.companyAnalysisLoading = false;
    render();
  }
}

async function saveValuationDraft() {
  let draft = calculateValuationDraft(collectValuationDraftFromForm());
  state.valuationDraft = draft;
  if (!draft.name && !draft.ts_code) {
    showToast("请输入股票名称");
    render();
    return;
  }
  if (!draft.methods.length) {
    showToast("请至少选择一种估值方法");
    render();
    return;
  }
  if (!Number.isFinite(Number(draft.fair_price))) {
    showToast("请先填写有效数据并完成估值计算");
    render();
    return;
  }
  state.valuationSaving = true;
  render();
  try {
    const data = await api("/api/valuations", {
      method: "POST",
      body: JSON.stringify(draft),
    });
    state.valuations = [data.item, ...(state.valuations || [])];
    state.valuationDraft = createValuationDraft(data.item);
    showToast("估值结果已保存");
    location.hash = "#/valuations";
  } catch (error) {
    showToast(error.message || "保存估值失败");
  } finally {
    state.valuationSaving = false;
    render();
  }
}

async function extractValuationPdf() {
  const form = document.querySelector('[data-form="valuation-workbench"]');
  const file = form?.elements.valuation_pdf?.files?.[0];
  if (!form || !file) {
    showToast("请先选择 PDF 文件");
    return;
  }
  state.valuationDraft = collectValuationDraftFromForm();
  state.valuationPdfLoading = true;
  render();
  try {
    const pdfBase64 = await fileToBase64(file);
    const data = await api("/api/valuations/extract-pdf", {
      method: "POST",
      body: JSON.stringify({
        ts_code: state.valuationDraft.ts_code,
        company_name: state.valuationDraft.name || state.valuationDraft.ts_code,
        file_name: file.name,
        mime_type: file.type || "application/pdf",
        pdf_base64: pdfBase64,
      }),
    });
    state.valuationDraft = calculateValuationDraft(mergeValuationExtractToDraft(state.valuationDraft, data, file.name));
    showToast("财报字段已回填，请复核关键假设");
  } catch (error) {
    showToast(error.message || "PDF 回填失败");
  } finally {
    state.valuationPdfLoading = false;
    render();
  }
}

async function fillValuationFromTushare() {
  const draft = collectValuationDraftFromForm();
  if (!draft.ts_code && !draft.name) {
    showToast("请先选择股票");
    render();
    return;
  }
  if (!selectedValuationMethods(draft.methods).length) {
    showToast("请先选择估值方法");
    render();
    return;
  }
  state.valuationDraft = draft;
  state.valuationTushareLoading = true;
  render();
  try {
    const data = await api("/api/valuations/fill-tushare", {
      method: "POST",
      body: JSON.stringify({
        ts_code: draft.ts_code,
        name: draft.name,
        methods: draft.methods,
      }),
    });
    const merged = mergeValuationExtractToDraft(state.valuationDraft, data, "");
    state.valuationDraft = calculateValuationDraft({
      ...merged,
      source: "tushare",
      pdf_file_name: "",
      note: merged.note || (data.notes || []).join("；"),
    });
    const failed = Array.isArray(data.failed_apis) ? data.failed_apis.length : 0;
    showToast(failed ? `TuShare 已部分回填，${failed} 个接口不可用` : "TuShare 财务数据已回填，请复核口径");
  } catch (error) {
    showToast(error.message || "TuShare 回填失败，可继续手动或 PDF 回填");
  } finally {
    state.valuationTushareLoading = false;
    render();
  }
}

async function predictValuationAssumptions() {
  const draft = calculateValuationDraft(collectValuationDraftFromForm());
  if (!draft.ts_code && !draft.name) {
    showToast("请先选择股票");
    render();
    return;
  }
  const periods = draft.inputs?.financial_periods || [];
  if (!periods.some(valuationPeriodHasData)) {
    showToast("请先手动填写、PDF 回填或从 TuShare 带入财报数据");
    render();
    return;
  }
  state.valuationDraft = draft;
  state.valuationAiAssumptionLoading = true;
  render();
  try {
    const data = await api("/api/valuations/ai-assumptions", {
      method: "POST",
      body: JSON.stringify({
        ts_code: draft.ts_code,
        name: draft.name,
        inputs: draft.inputs,
        methods: draft.methods,
      }),
    });
    state.valuationAiPreview = {
      ...data,
      draft,
      ts_code: draft.ts_code,
      name: draft.name,
    };
    renderModal();
  } catch (error) {
    const message = error.message || "AI 预测失败";
    state.valuationAiError = { message };
    showToast(message);
    renderModal();
  } finally {
    state.valuationAiAssumptionLoading = false;
    render();
  }
}

function applyValuationAiAssumptions() {
  const preview = state.valuationAiPreview;
  if (!preview) {
    return;
  }
  const draft = preview.draft || state.valuationDraft || collectValuationDraftFromForm();
  const inputs = mergeValuationInputs(defaultValuationInputs(), draft.inputs || {});
  inputs.dcf = {
    ...(inputs.dcf || {}),
    terminal_growth_rate: preview.terminal_growth_rate,
    discount_rate: preview.discount_rate,
    ai_reason: preview.reason || "",
  };
  state.valuationDraft = calculateValuationDraft({
    ...draft,
    inputs,
  });
  state.valuationAiPreview = null;
  showToast("AI 估值假设已填入");
  render();
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      resolve(text.includes(",") ? text.split(",").pop() : text);
    };
    reader.onerror = () => reject(new Error("读取 PDF 失败"));
    reader.readAsDataURL(file);
  });
}

async function addSectorPoolItem(item) {
  if (!item?.name && !item?.code) {
    return;
  }
  try {
    const data = await api("/api/sector-pool", {
      method: "POST",
      body: JSON.stringify(item),
    });
    state.sectorPool = [
      ...(state.sectorPool || []).filter((entry) => entry.id !== data.item.id),
      data.item,
    ].sort((a, b) => `${a.level}:${a.name}`.localeCompare(`${b.level}:${b.name}`, "zh-CN"));
    if (data.item.name) {
      state.sectorVisibility[data.item.name] = true;
    }
    state.sectorPoolTrendFlow = null;
    state.sectorPoolTrendKey = "";
    showToast(`${data.item.name} 已加入我的板块池`);
  } catch (error) {
    showToast(error.message);
  }
  render();
}

async function removeSectorPoolItem(id) {
  if (!id) {
    return;
  }
  const item = (state.sectorPool || []).find((entry) => entry.id === id);
  try {
    await api(`/api/sector-pool/${encodeURIComponent(id)}`, { method: "DELETE" });
    state.sectorPool = (state.sectorPool || []).filter((entry) => entry.id !== id);
    state.sectorPoolTrendFlow = null;
    state.sectorPoolTrendKey = "";
    showToast(item ? `${item.name} 已移出我的板块池` : "已移出我的板块池");
  } catch (error) {
    showToast(error.message);
  }
  render();
}

function openEdit(id) {
  const item = state.watchlist.find((entry) => entry.id === id);
  if (!item) {
    return;
  }
  state.editing = JSON.parse(JSON.stringify(item));
  renderModal();
}

async function saveEditedStock(form) {
  const data = new FormData(form);
  const id = String(data.get("id") || "");
  const payload = {
    group_id: String(data.get("group_id") || "default"),
    low_price: data.get("low_price"),
    fair_price: data.get("fair_price"),
    high_price: data.get("high_price"),
    note: String(data.get("note") || ""),
    valuation_basis: String(data.get("valuation_basis") || ""),
    valuation_reason: String(data.get("valuation_reason") || ""),
  };

  try {
    await api(`/api/watchlist/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    state.editing = null;
    await loadCore();
    if (state.detailId === id) {
      state.detail = null;
      await ensureDetail(id, true);
    }
    showToast("已保存估值，并记录流水");
    render();
  } catch (error) {
    showToast(error.message);
    render();
  }
}

async function deleteStock(id) {
  const item = state.watchlist.find((entry) => entry.id === id);
  if (!item) {
    return;
  }
  if (!confirm(`确定从股票池删除 ${item.name} 吗？估值历史会保留在本地记录中。`)) {
    return;
  }
  await api(`/api/watchlist/${encodeURIComponent(id)}`, { method: "DELETE" });
  await loadCore();
  showToast("已删除股票");
  render();
}

async function createGroup(form) {
  const name = String(new FormData(form).get("name") || "").trim();
  if (!name) {
    showToast("请输入分组名称");
    render();
    return;
  }
  await api("/api/groups", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  form.reset();
  await loadCore();
  showToast("分组已新增");
  render();
}

async function createDecision(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  if (data.entry_rule !== "custom") {
    delete data.entry_price;
  }
  if (data.horizon_days === "custom") {
    const customHorizonDays = Math.round(Number(data.custom_horizon_days));
    if (!Number.isFinite(customHorizonDays) || customHorizonDays < 1 || customHorizonDays > 120) {
      showToast("请输入 1 到 120 之间的观察交易日数");
      return;
    }
    data.horizon_days = String(customHorizonDays);
  }
  delete data.custom_horizon_days;
  try {
    await api("/api/decision-tests", {
      method: "POST",
      body: JSON.stringify(data),
    });
    form.reset();
    syncDecisionCustomPriceVisibility(form);
    syncDecisionCustomHorizonVisibility(form);
    state.decisionDraftCode = "";
    state.decisions = null;
    state.decisionPage = 1;
    await loadDecisionTests(true);
    showToast("已加入决策验证");
    render();
  } catch (error) {
    showToast(error.message);
    render();
  }
}

async function deleteDecision(id) {
  if (!id || !confirm("确定删除这条决策验证吗？")) {
    return;
  }
  try {
    await api(`/api/decision-tests/${encodeURIComponent(id)}`, { method: "DELETE" });
    state.decisions = null;
    await loadDecisionTests(true);
    showToast("已删除决策验证");
    render();
  } catch (error) {
    showToast(error.message);
    render();
  }
}

async function renameGroup(id) {
  const group = state.groups.find((entry) => entry.id === id);
  if (!group) {
    return;
  }
  const name = prompt("新的分组名称", group.name);
  if (!name || !name.trim()) {
    return;
  }
  await api(`/api/groups/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
  await loadCore();
  showToast("分组已改名");
  render();
}

async function deleteGroup(id) {
  const group = state.groups.find((entry) => entry.id === id);
  if (!group || group.id === "default") {
    return;
  }
  if (!confirm(`确定删除分组「${group.name}」吗？`)) {
    return;
  }
  try {
    await api(`/api/groups/${encodeURIComponent(id)}`, { method: "DELETE" });
    await loadCore();
    showToast("分组已删除");
    render();
  } catch (error) {
    showToast(error.message);
    render();
  }
}

async function ensureDetail(id, force = false) {
  if (!force && state.detail && state.detailId === id) {
    return;
  }
  if (state.detailLoading && state.detailId === id) {
    return;
  }
  if (state.detailId !== id) {
    state.detailTab = "analysis";
  }
  state.detailId = id;
  state.detailLoading = true;
  state.detailError = "";
  state.detail = null;
  api(`/api/stocks/${encodeURIComponent(id)}/detail`)
    .then((detail) => {
      state.detail = detail;
      state.detailId = id;
      scheduleCompanyAnalysisPoll(id, detail.company_analysis_status);
    })
    .catch((error) => {
      state.detailError = error.message;
    })
    .finally(() => {
      state.detailLoading = false;
      if (state.route.page === "stock" && state.route.id === id) {
        render();
      }
    });
}

function scheduleCompanyAnalysisPoll(id, status) {
  window.clearTimeout(state.companyAnalysisPollTimer);
  state.companyAnalysisPollTimer = 0;
  if (!["pending", "running"].includes(status?.status)) {
    return;
  }
  state.companyAnalysisPollTimer = window.setTimeout(() => {
    state.companyAnalysisPollTimer = 0;
    if (state.route.page === "stock" && state.route.id === id) {
      ensureDetail(id, true);
    }
  }, 6000);
}

async function ensureChart(tsCode, force = false) {
  const key = `${tsCode}:${state.chartPeriod}`;
  if (!force && state.chartLoadedKey === key) {
    return;
  }
  if (state.chartLoading && state.chartKey === key) {
    return;
  }

  if (state.chartKey !== key) {
    state.chartRows = [];
  }
  state.chartKey = key;
  state.chartLoadedKey = "";
  state.chartLoading = true;
  state.chartError = "";

  api(`/api/stocks/${encodeURIComponent(tsCode)}/chart?period=${encodeURIComponent(state.chartPeriod)}`)
    .then((data) => {
      if (state.chartKey !== key) {
        return;
      }
      state.chartRows = data.rows || [];
    })
    .catch((error) => {
      if (state.chartKey !== key) {
        return;
      }
      state.chartError = error.message;
      state.chartRows = [];
    })
    .finally(() => {
      if (state.chartKey !== key) {
        return;
      }
      state.chartLoadedKey = key;
      state.chartLoading = false;
      if (state.route.page === "stock") {
        render();
      }
    });
}

function ensureMarket() {
  if (!state.market && !state.marketLoading && !state.marketError) {
    loadMarket(false).then(render);
  }
}

async function loadMarket(force) {
  if (state.marketLoading) {
    return;
  }
  if (state.market && !force) {
    return;
  }
  state.marketLoading = true;
  state.marketError = "";
  if (force) {
    render();
  }
  try {
    state.market = await api("/api/market");
  } catch (error) {
    state.marketError = error.message;
  } finally {
    state.marketLoading = false;
  }
}

function ensureDecisionTests() {
  if (!state.decisions && !state.decisionsLoading && !state.decisionsError) {
    loadDecisionTests(false).then(render);
  }
}

async function loadDecisionTests(force) {
  if (state.decisionsLoading) {
    return;
  }
  if (state.decisions && !force) {
    return;
  }
  state.decisionsLoading = true;
  state.decisionsError = "";
  if (force) {
    render();
  }
  try {
    state.decisions = await api("/api/decision-tests");
  } catch (error) {
    state.decisionsError = error.message;
  } finally {
    state.decisionsLoading = false;
  }
}

function ensureTurnoverMonitor() {
  if (!state.turnoverMonitor && !state.turnoverLoading && !state.turnoverError) {
    loadTurnoverMonitor(false).then(render);
  }
}

async function loadTurnoverMonitor(force) {
  if (state.turnoverLoading) {
    return;
  }
  if (state.turnoverMonitor && !force) {
    return;
  }
  state.turnoverLoading = true;
  state.turnoverError = "";
  if (force) {
    state.turnoverMonitor = null;
    state.turnoverPage = 1;
    render();
  }
  try {
    const suffix = force ? "?refresh=1" : "";
    state.turnoverMonitor = await api(`/api/turnover-monitor${suffix}`);
  } catch (error) {
    state.turnoverError = error.message;
  } finally {
    state.turnoverLoading = false;
  }
}

function ensureShortStrategy() {
  if (state.strategyCode && !state.strategyData && !state.strategyLoading && !state.strategyError) {
    loadShortStrategy(false).then(render);
  }
}

async function loadShortStrategy(force) {
  if (state.strategyLoading) {
    return;
  }
  const code = state.strategyCode || extractClientStockCode(state.strategySearch);
  if (!code) {
    state.strategyError = "";
    showToast("请先从联想结果中选择股票，或输入完整股票代码。");
    return;
  }
  if (!force && state.strategyData?.stock?.tsCode === code) {
    return;
  }

  state.strategyCode = code;
  state.strategyLoading = true;
  state.strategyError = "";
  if (force) {
    state.strategyData = null;
    render();
  }

  try {
    state.strategyData = await api(`/api/short-strategy/${encodeURIComponent(code)}`);
    state.strategySearch = [
      state.strategyData.stock?.stockName,
      state.strategyData.stock?.tsCode,
    ].filter(Boolean).join(" ");
  } catch (error) {
    state.strategyError = error.message || "行情数据加载失败，请稍后重试";
  } finally {
    state.strategyLoading = false;
  }
}

function buildShortStrategyMonitorPayload(model) {
  return {
    ts_code: model.tsCode,
    stock_name: model.stockName,
    latest_trade_date: model.latestTradeDate,
    current_price: model.currentPrice,
    snapshot: {
      stockName: model.stockName,
      tsCode: model.tsCode,
      latestTradeDate: model.latestTradeDate,
      currentPrice: model.currentPrice,
      analysis: {
        trend: model.analysis?.trend,
        volumeSignal: model.analysis?.volumeSignal,
        limitStatus: model.analysis?.limitStatus,
        effectiveAmplitude: model.analysis?.effectiveAmplitude,
      },
      intraday: {
        type: model.intradayStats?.type,
        condition: model.intradayStats?.condition,
        strategy: model.intradayStats?.strategy,
        amplitudeBasis: model.intradayStats?.amplitudeBasis,
        avgHighFromOpen: model.intradayStats?.avgHighFromOpen,
        avgLowFromOpen: model.intradayStats?.avgLowFromOpen,
        avgDrawdownAmplitude: model.intradayStats?.avgDrawdownAmplitude,
        avgReboundAmplitude: model.intradayStats?.avgReboundAmplitude,
        avgPotentialDrawdownAmplitude: model.intradayStats?.avgPotentialDrawdownAmplitude,
        avgPotentialReboundAmplitude: model.intradayStats?.avgPotentialReboundAmplitude,
        drawdown3Probability: model.intradayStats?.drawdown3Probability,
        drawdown4Probability: model.intradayStats?.drawdown4Probability,
        rebound1Probability: model.intradayStats?.rebound1Probability,
        rebound2Probability: model.intradayStats?.rebound2Probability,
        drawdownDominanceProbability: model.intradayStats?.drawdownDominanceProbability,
        reboundDominanceProbability: model.intradayStats?.reboundDominanceProbability,
        low3Probability: model.intradayStats?.low3Probability,
        low4Probability: model.intradayStats?.low4Probability,
        high1Probability: model.intradayStats?.high1Probability,
        weakCloseProbability: model.intradayStats?.weakCloseProbability,
        sellPrompt: model.intradayStats?.sellPrompt,
        buyPrompt: model.intradayStats?.buyPrompt,
      },
      tplus1: {
        nextTradeDate: model.tplus1?.nextTradeDate,
        buyZoneLower: model.tplus1?.range?.buyZoneLower,
        buyZoneUpper: model.tplus1?.range?.buyZoneUpper,
        sellZoneLower: model.tplus1?.range?.sellZoneLower,
        sellZoneUpper: model.tplus1?.range?.sellZoneUpper,
        riskLine: model.tplus1?.range?.riskLine,
        riskLevel: model.tplus1?.riskLevel,
        strategyText: model.tplus1?.strategyText,
      },
      grid: {
        horizonDays: model.grid?.horizonDays,
        centerPrice: model.grid?.centerPrice,
        gridLower: model.grid?.gridLower,
        gridUpper: model.grid?.gridUpper,
        gridCount: model.grid?.gridCount,
        gridStepPercent: model.grid?.gridStepPercent,
        suitability: model.grid?.suitability,
        riskLevel: model.grid?.riskLevel,
        strategyText: model.grid?.strategyText,
      },
    },
  };
}

async function saveShortStrategyMonitor() {
  if (!state.strategyData || state.strategyMonitorSaving) {
    return;
  }
  const model = buildShortStrategyModel();
  const status = shortStrategyStatus(model);
  if (!model || status !== "success") {
    showToast("请先生成有效的短线策略");
    render();
    return;
  }

  state.strategyMonitorSaving = true;
  render();
  try {
    const data = await api("/api/short-strategy-monitors", {
      method: "POST",
      body: JSON.stringify(buildShortStrategyMonitorPayload(model)),
    });
    state.strategyMonitors = [
      data.item,
      ...(state.strategyMonitors || []).filter((item) => item.id !== data.item.id && item.ts_code !== data.item.ts_code),
    ];
    showToast(`${data.item.stock_name || data.item.ts_code} 已保存到短线监控列表`);
  } catch (error) {
    showToast(error.message || "保存短线策略失败");
  } finally {
    state.strategyMonitorSaving = false;
    render();
  }
}

async function deleteShortStrategyMonitor(id) {
  if (!id) {
    return;
  }
  const item = (state.strategyMonitors || []).find((entry) => entry.id === id);
  if (!confirm(`确定从短线监控列表删除 ${item?.stock_name || item?.ts_code || "这只股票"} 吗？`)) {
    return;
  }
  try {
    await api(`/api/short-strategy-monitors/${encodeURIComponent(id)}`, { method: "DELETE" });
    state.strategyMonitors = (state.strategyMonitors || []).filter((entry) => entry.id !== id);
    showToast("已从短线监控列表删除");
    render();
  } catch (error) {
    showToast(error.message || "删除失败");
    render();
  }
}

function ensureStrengthMatrix() {
  if (!state.strengthMatrix && !state.strengthLoading && !state.strengthError) {
    loadStrengthMatrix(false).then(render);
  }
}

async function loadStrengthMatrix(force) {
  if (state.strengthLoading) {
    return;
  }
  if (state.strengthMatrix && !force) {
    return;
  }

  state.strengthLoading = true;
  state.strengthError = "";
  if (force) {
    state.strengthMatrix = null;
    state.strengthPage = 1;
    render();
  }

  try {
    const params = new URLSearchParams({
      level: state.strengthLevel,
    });
    if (force) {
      params.set("refresh", "1");
    }
    state.strengthMatrix = await api(`/api/sectors/strength-matrix?${params.toString()}`);
  } catch (error) {
    state.strengthError = error.message;
  } finally {
    state.strengthLoading = false;
  }
}

function ensureSectorFlow() {
  if (!state.sectorFlow && !state.sectorLoading && !state.sectorError) {
    loadSectorFlow(false).then(render);
  }
}

async function loadSectorFlow(force) {
  if (state.sectorLoading) {
    return;
  }
  if (state.sectorFlow && !force) {
    return;
  }

  state.sectorLoading = true;
  state.sectorError = "";
  if (force) {
    render();
  }

  try {
    const params = new URLSearchParams({
      level: state.sectorLevel,
      trend_days: String(state.sectorTrendDays),
      period: state.sectorPeriod,
    });
    if (state.sectorPeriod === "range") {
      if (state.sectorStartDate) {
        params.set("start_date", state.sectorStartDate);
      }
      if (state.sectorEndDate) {
        params.set("end_date", state.sectorEndDate);
      }
    }
    state.sectorFlow = await api(`/api/sectors/fund-flow?${params.toString()}`);
    applyDefaultSectorVisibility(false);
  } catch (error) {
    state.sectorError = error.message;
  } finally {
    state.sectorLoading = false;
  }
}

function ensureSectorPoolTrend(force = false) {
  const rows = sectorPoolTrendRows();
  const key = sectorPoolTrendKey(rows);
  if (!rows.length) {
    state.sectorPoolTrendFlow = null;
    state.sectorPoolTrendKey = key;
    state.sectorPoolTrendError = "";
    return;
  }
  if (!force && state.sectorPoolTrendFlow && state.sectorPoolTrendKey === key) {
    return;
  }
  if (state.sectorPoolTrendLoading && state.sectorPoolTrendKey === key) {
    return;
  }
  loadSectorPoolTrend(rows, key).then(render);
}

async function loadSectorPoolTrend(rows, key) {
  state.sectorPoolTrendLoading = true;
  state.sectorPoolTrendError = "";
  state.sectorPoolTrendKey = key;
  state.sectorPoolTrendFlow = null;

  try {
    const levels = Array.from(new Set(rows.map((item) => item.level || "L3")));
    const flows = await Promise.all(levels.map(async (level) => {
      const params = new URLSearchParams({
        level,
        trend_days: "180",
        period: "day",
      });
      return [level, await api(`/api/sectors/fund-flow?${params.toString()}`)];
    }));
    if (state.sectorPoolTrendKey !== key) {
      return;
    }
    state.sectorPoolTrendFlow = buildSectorPoolTrendFlow(rows, new Map(flows));
    initializeSectorPoolVisibility();
  } catch (error) {
    if (state.sectorPoolTrendKey === key) {
      state.sectorPoolTrendError = error.message;
      state.sectorPoolTrendFlow = null;
    }
  } finally {
    if (state.sectorPoolTrendKey === key) {
      state.sectorPoolTrendLoading = false;
    }
  }
}

function sectorPoolTrendRows() {
  return (state.sectorPool || [])
    .filter((item) => state.sectorPoolLevel === "all" || item.level === state.sectorPoolLevel);
}

function sectorPoolTrendKey(rows) {
  return [
    state.sectorPoolLevel,
    ...rows.map((item) => item.id).sort(),
  ].join("|");
}

function buildSectorPoolTrendFlow(rows, flowByLevel) {
  const firstFlow = flowByLevel.values().next().value;
  const tradeDates = firstFlow?.trade_dates || [];
  const sectors = [];
  const trend = tradeDates.map((tradeDate) => ({
    trade_date: tradeDate,
    sectors: {},
  }));

  for (const item of rows) {
    const flow = flowByLevel.get(item.level || "L3");
    const sourceSector = (flow?.sectors || []).find((sector) => sector.code === item.code || sector.name === item.name);
    const sourceName = sourceSector?.name || item.name;
    const displayName = sectorPoolDisplayName(item);
    sectors.push({
      code: item.code,
      level: item.level || "L3",
      name: displayName,
      source_name: sourceName,
    });
    const dayByDate = new Map((flow?.trend || []).map((day) => [day.trade_date, day]));
    trend.forEach((targetDay) => {
      const sourceDay = dayByDate.get(targetDay.trade_date);
      targetDay.sectors[displayName] = sourceDay?.sectors?.[sourceName] || { net_amount: 0 };
    });
  }

  return {
    level: state.sectorPoolLevel,
    trend_days: 180,
    trade_dates: tradeDates,
    sectors,
    trend,
  };
}

function initializeSectorPoolVisibility() {
  (state.sectorPoolTrendFlow?.sectors || []).forEach((sector) => {
    if (!(sector.name in state.sectorPoolVisibility)) {
      state.sectorPoolVisibility[sector.name] = true;
    }
  });
}

function applyDefaultSectorVisibility(force) {
  if (!state.sectorFlow?.sectors?.length) {
    return;
  }
  if (!force && Object.keys(state.sectorVisibility).length > 0) {
    return;
  }

  const level = state.sectorFlow.level || state.sectorLevel;
  if (level === "L1") {
    state.sectorFlow.sectors.forEach((sector) => {
      state.sectorVisibility[sector.name] = true;
    });
    return;
  }

  const topNames = new Set((state.sectorFlow.ranking || []).slice(0, 10).map((row) => row.name));
  state.sectorFlow.sectors.forEach((sector) => {
    state.sectorVisibility[sector.name] = topNames.has(sector.name);
  });
}

function ensureSectorDetail(code, level = state.sectorLevel) {
  if (!code) {
    return;
  }
  const key = `${level}:${code}`;
  if (state.sectorDetailCode !== key) {
    state.sectorDetailCode = key;
    state.sectorDetail = null;
    state.sectorDetailError = "";
    state.sectorStockVisibility = {};
    state.sectorStockQuery = "";
    state.sectorStockPage = 1;
  }
  if (!state.sectorDetail && !state.sectorDetailLoading && !state.sectorDetailError) {
    loadSectorDetail(code, false, level).then(render);
  }
}

async function loadSectorDetail(code, force, level = state.route.level || state.sectorLevel) {
  if (!code || state.sectorDetailLoading) {
    return;
  }
  const key = `${level}:${code}`;
  if (state.sectorDetail && !force && state.sectorDetailCode === key) {
    return;
  }

  state.sectorDetailCode = key;
  state.sectorDetailLoading = true;
  state.sectorDetailError = "";
  if (force) {
    render();
  }

  try {
    const params = new URLSearchParams({
      level,
      trend_days: String(state.sectorStockTrendDays),
      ranking_window: String(state.sectorStockWindow),
      ranking_metric: state.sectorStockMetric,
      stock_limit: level === "L3" ? "120" : "40",
    });
    state.sectorDetail = await api(`/api/sectors/${encodeURIComponent(code)}/detail?${params.toString()}`);
    const hasExplicitChoice = Object.keys(state.sectorStockVisibility).length > 0;
    if (!hasExplicitChoice) {
      (state.sectorDetail.series || []).forEach((stock, index) => {
        state.sectorStockVisibility[stock.ts_code] = index < 8;
      });
    }
  } catch (error) {
    state.sectorDetailError = error.message;
  } finally {
    state.sectorDetailLoading = false;
  }
}

function filteredWatchlist() {
  const rows = state.watchlist.filter((item) => {
    const groupOk = state.filters.group === "all" || item.group_id === state.filters.group;
    const statusOk = state.filters.status === "all" || item.valuation?.status === state.filters.status;
    return groupOk && statusOk;
  });
  return filterRowsByQuery(rows, state.poolListQuery, [
    "name",
    "ts_code",
    "symbol",
    "industry",
    "area",
    "note",
  ]);
}

function drawDetailChart() {
  const canvas = document.querySelector("#detailChart");
  if (!canvas || !state.chartRows?.length) {
    state.detailChartPoints = [];
    state.detailChartBounds = null;
    hideChartTooltip("detailChartTooltip");
    return;
  }

  const item = state.detail.item;
  const rows = state.chartRows
    .slice()
    .filter((row) => Number.isFinite(Number(row.close)));

  if (rows.length < 2) {
    state.detailChartPoints = [];
    state.detailChartBounds = null;
    hideChartTooltip("detailChartTooltip");
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));

  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const padding = { top: 24, right: 72, bottom: 36, left: 54 };
  const width = rect.width - padding.left - padding.right;
  const height = rect.height - padding.top - padding.bottom;
  const lineValues = [item.low_price, item.fair_price, item.high_price]
    .map(Number)
    .filter(Number.isFinite);
  const values = rows.map((row) => Number(row.close)).concat(lineValues);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || Math.max(max, 1) * 0.08;
  const yMin = min - spread * 0.08;
  const yMax = max + spread * 0.08;

  const xFor = (index) => padding.left + (index / (rows.length - 1)) * width;
  const yFor = (value) => padding.top + (1 - (value - yMin) / (yMax - yMin)) * height;
  state.detailChartBounds = {
    left: padding.left,
    right: padding.left + width,
    top: padding.top,
    bottom: padding.top + height,
    step: rows.length > 1 ? width / (rows.length - 1) : width,
  };
  state.detailChartPoints = rows.map((row, index) => ({
    x: xFor(index),
    y: yFor(Number(row.close)),
    row,
    index,
    color: "#f5f5f5",
  }));

  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#a1a1aa";
  ctx.font = "12px Microsoft YaHei, Segoe UI, sans-serif";

  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (height / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + width, y);
    ctx.stroke();
    const label = yMax - ((yMax - yMin) / 4) * i;
    ctx.fillText(label.toFixed(2), padding.left + width + 8, y + 4);
  }

  drawValuationLine(ctx, yFor, padding, width, item.low_price, "#34d399", "低估线");
  drawValuationLine(ctx, yFor, padding, width, item.fair_price, "#e5e7eb", "合理价值");
  drawValuationLine(ctx, yFor, padding, width, item.high_price, "#fb7185", "高估线");

  const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + height);
  gradient.addColorStop(0, "rgba(245, 245, 245, 0.16)");
  gradient.addColorStop(1, "rgba(245, 245, 245, 0.02)");

  ctx.beginPath();
  rows.forEach((row, index) => {
    const x = xFor(index);
    const y = yFor(Number(row.close));
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.lineTo(padding.left + width, padding.top + height);
  ctx.lineTo(padding.left, padding.top + height);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  rows.forEach((row, index) => {
    const x = xFor(index);
    const y = yFor(Number(row.close));
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.strokeStyle = "#f5f5f5";
  ctx.lineWidth = 2.6;
  ctx.stroke();

  const first = rows[0];
  const last = rows.at(-1);
  ctx.fillStyle = "#a1a1aa";
  ctx.fillText(formatChartLabel(first), padding.left, rect.height - 10);
  ctx.textAlign = "right";
  ctx.fillText(formatChartLabel(last), padding.left + width, rect.height - 10);
  ctx.textAlign = "left";

  const lastX = xFor(rows.length - 1);
  const lastY = yFor(Number(last.close));
  ctx.fillStyle = "#f5f5f5";
  ctx.beginPath();
  ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
  ctx.fill();
  bindDetailChartEvents(canvas);
}

function drawValuationLine(ctx, yFor, padding, width, value, color, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return;
  }
  const y = yFor(number);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(padding.left, y);
  ctx.lineTo(padding.left + width, y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = "12px Microsoft YaHei, Segoe UI, sans-serif";
  ctx.fillText(translateUiText(label) || label, padding.left + 8, y - 6);
  ctx.restore();
}

function drawSectorChart() {
  const canvas = document.querySelector("#sectorChart");
  const flow = state.sectorFlow;
  if (!canvas || !flow?.trend?.length || !flow?.sectors?.length) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));

  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const padding = { top: 20, right: 74, bottom: 34, left: 74 };
  const width = rect.width - padding.left - padding.right;
  const height = rect.height - padding.top - padding.bottom;
  const sectors = flow.sectors
    .map((item, index) => ({ ...item, color: sectorColor(index) }))
    .filter((item) => isSectorVisible(item.name));
  const values = [];

  for (const day of flow.trend) {
    for (const sector of sectors) {
      values.push(Number(day.sectors?.[sector.name]?.net_amount || 0));
    }
  }

  if (!sectors.length) {
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "14px Microsoft YaHei, Segoe UI, sans-serif";
    ctx.fillText(translateUiText("请选择至少一个板块") || "请选择至少一个板块", padding.left, padding.top + 24);
    state.sectorChartPoints = [];
    return;
  }

  const maxAbs = Math.max(1, ...values.map((value) => Math.abs(value)));
  const yFor = (value) => padding.top + (1 - ((value + maxAbs) / (maxAbs * 2))) * height;
  const xFor = (index) => padding.left + (index / Math.max(1, flow.trend.length - 1)) * width;
  const points = [];

  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#a1a1aa";
  ctx.font = "12px Microsoft YaHei, Segoe UI, sans-serif";

  for (let i = 0; i <= 4; i += 1) {
    const value = maxAbs - (maxAbs / 2) * i;
    const y = yFor(value);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + width, y);
    ctx.stroke();
    ctx.fillText(formatWanAmount(value), padding.left + width + 8, y + 4);
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.beginPath();
  ctx.moveTo(padding.left, yFor(0));
  ctx.lineTo(padding.left + width, yFor(0));
  ctx.stroke();

  sectors.forEach((sector) => {
    ctx.beginPath();
    flow.trend.forEach((day, index) => {
      const x = xFor(index);
      const value = Number(day.sectors?.[sector.name]?.net_amount || 0);
      const y = yFor(value);
      points.push({
        x,
        y,
        date: day.trade_date,
        name: sector.name,
        value,
        color: sector.color,
      });
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.strokeStyle = sector.color;
    ctx.globalAlpha = 0.78;
    ctx.lineWidth = 1.35;
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
  state.sectorChartPoints = points;
  bindSectorChartEvents(canvas);

  const first = flow.trend[0];
  const last = flow.trend.at(-1);
  ctx.fillStyle = "#a1a1aa";
  ctx.fillText(formatDate(first.trade_date), padding.left, rect.height - 10);
  ctx.textAlign = "right";
  ctx.fillText(formatDate(last.trade_date), padding.left + width, rect.height - 10);
  ctx.textAlign = "left";
}

function drawSectorPoolChart() {
  const canvas = document.querySelector("#sectorPoolChart");
  const flow = state.sectorPoolTrendFlow;
  if (!canvas || !flow?.trend?.length || !flow?.sectors?.length) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  if (rect.width < 20 || rect.height < 20) {
    requestAnimationFrame(drawSectorPoolChart);
    return;
  }
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));

  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const padding = { top: 20, right: 74, bottom: 34, left: 74 };
  const width = rect.width - padding.left - padding.right;
  const height = rect.height - padding.top - padding.bottom;
  const trend = sectorPoolChartTrend();
  const sectors = flow.sectors
    .map((item, index) => ({ ...item, color: sectorColor(index) }))
    .filter((item) => isSectorPoolVisible(item.name));
  const values = [];

  for (const day of trend) {
    for (const sector of sectors) {
      values.push(Number(day.sectors?.[sector.name]?.net_amount || 0));
    }
  }

  if (!sectors.length) {
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "14px Microsoft YaHei, Segoe UI, sans-serif";
    ctx.fillText(translateUiText("请选择至少一个板块") || "请选择至少一个板块", padding.left, padding.top + 24);
    state.sectorPoolChartPoints = [];
    return;
  }

  const maxAbs = Math.max(1, ...values.map((value) => Math.abs(value)));
  const yFor = (value) => padding.top + (1 - ((value + maxAbs) / (maxAbs * 2))) * height;
  const xFor = (index) => padding.left + (index / Math.max(1, trend.length - 1)) * width;
  const points = [];

  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#a1a1aa";
  ctx.font = "12px Microsoft YaHei, Segoe UI, sans-serif";

  for (let i = 0; i <= 4; i += 1) {
    const value = maxAbs - (maxAbs / 2) * i;
    const y = yFor(value);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + width, y);
    ctx.stroke();
    ctx.fillText(formatWanAmount(value), padding.left + width + 8, y + 4);
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.beginPath();
  ctx.moveTo(padding.left, yFor(0));
  ctx.lineTo(padding.left + width, yFor(0));
  ctx.stroke();

  sectors.forEach((sector) => {
    ctx.beginPath();
    trend.forEach((day, index) => {
      const x = xFor(index);
      const value = Number(day.sectors?.[sector.name]?.net_amount || 0);
      const y = yFor(value);
      points.push({
        x,
        y,
        date: day.trade_date,
        name: sector.name,
        value,
        color: sector.color,
      });
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.strokeStyle = sector.color;
    ctx.globalAlpha = 0.82;
    ctx.lineWidth = 1.55;
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
  state.sectorPoolChartPoints = points;
  bindSectorPoolChartEvents(canvas);

  const first = trend[0];
  const last = trend.at(-1);
  ctx.fillStyle = "#a1a1aa";
  ctx.fillText(formatDate(first.trade_date), padding.left, rect.height - 10);
  ctx.textAlign = "right";
  ctx.fillText(formatDate(last.trade_date), padding.left + width, rect.height - 10);
  ctx.textAlign = "left";
}

function drawSectorStockChart() {
  const canvas = document.querySelector("#sectorStockChart");
  const detail = state.sectorDetail;
  if (!canvas || !detail?.series?.length || !detail?.trade_dates?.length) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));

  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const padding = { top: 20, right: 86, bottom: 34, left: 76 };
  const width = rect.width - padding.left - padding.right;
  const height = rect.height - padding.top - padding.bottom;
  const stocks = detail.series
    .map((item, index) => ({ ...item, color: sectorColor(index) }))
    .filter((item) => isSectorStockVisible(item.ts_code));
  const mode = state.sectorStockChartMode;
  const values = [];

  for (const stock of stocks) {
    for (const point of stock.values || []) {
      const value = stockChartValue(point, mode);
      if (Number.isFinite(value)) {
        values.push(value);
      }
    }
  }

  if (!stocks.length) {
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "14px Microsoft YaHei, Segoe UI, sans-serif";
    ctx.fillText(translateUiText("请选择至少一只股票") || "请选择至少一只股票", padding.left, padding.top + 24);
    state.sectorStockChartPoints = [];
    return;
  }

  const maxAbs = Math.max(1, ...values.map((value) => Math.abs(value)));
  const yFor = (value) => padding.top + (1 - ((value + maxAbs) / (maxAbs * 2))) * height;
  const xFor = (index) => padding.left + (index / Math.max(1, detail.trade_dates.length - 1)) * width;
  const points = [];

  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#a1a1aa";
  ctx.font = "12px Microsoft YaHei, Segoe UI, sans-serif";
  for (let i = 0; i <= 4; i += 1) {
    const value = maxAbs - (maxAbs / 2) * i;
    const y = yFor(value);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + width, y);
    ctx.stroke();
    ctx.fillText(formatStockChartValue(value, mode), padding.left + width + 8, y + 4);
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.beginPath();
  ctx.moveTo(padding.left, yFor(0));
  ctx.lineTo(padding.left + width, yFor(0));
  ctx.stroke();

  stocks.forEach((stock) => {
    ctx.beginPath();
    let hasPoint = false;
    (stock.values || []).forEach((point, index) => {
      const value = stockChartValue(point, mode);
      if (!Number.isFinite(value)) {
        return;
      }
      const x = xFor(index);
      const y = yFor(value);
      points.push({
        x,
        y,
        date: point.trade_date,
        name: stock.name,
        code: stock.ts_code,
        value,
        color: stock.color,
        mode,
      });
      if (!hasPoint) {
        ctx.moveTo(x, y);
        hasPoint = true;
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.strokeStyle = stock.color;
    ctx.globalAlpha = 0.82;
    ctx.lineWidth = 1.55;
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
  state.sectorStockChartPoints = points;
  bindSectorStockChartEvents(canvas);

  const first = detail.trade_dates[0];
  const last = detail.trade_dates.at(-1);
  ctx.fillStyle = "#a1a1aa";
  ctx.fillText(formatDate(first), padding.left, rect.height - 10);
  ctx.textAlign = "right";
  ctx.fillText(formatDate(last), padding.left + width, rect.height - 10);
  ctx.textAlign = "left";
}

function bindDetailChartEvents(canvas) {
  if (canvas.dataset.hoverBound) {
    return;
  }
  canvas.dataset.hoverBound = "1";
  canvas.addEventListener("mousemove", handleDetailChartMove);
  canvas.addEventListener("mouseleave", () => hideChartTooltip("detailChartTooltip"));
  canvas.addEventListener("mouseout", () => hideChartTooltip("detailChartTooltip"));
  window.addEventListener("blur", () => hideChartTooltip("detailChartTooltip"));
}

function handleDetailChartMove(event) {
  const point = nearestDetailChartPoint(event);
  if (!point) {
    hideChartTooltip("detailChartTooltip");
    return;
  }
  const row = point.row || {};
  const previous = state.detailChartPoints?.[point.index - 1]?.row || null;
  const close = Number(row.close);
  const previousClose = Number(previous?.close);
  const change = Number.isFinite(close) && Number.isFinite(previousClose) ? close - previousClose : null;
  const pct = Number.isFinite(change) && Number.isFinite(previousClose) && previousClose !== 0
    ? (change / previousClose) * 100
    : null;
  const title = row.trade_time
    ? String(row.trade_time).slice(0, 16)
    : row.label
      ? `${row.label} / ${formatDate(row.trade_date)}`
      : formatDate(row.trade_date);
  showChartTooltip("detailChartTooltip", event.currentTarget, point, `
    <strong>${escapeHtml(title)}</strong>
    <span>开 ${formatNumber(row.open, 2)} / 高 ${formatNumber(row.high, 2)}</span>
    <span>低 ${formatNumber(row.low, 2)} / 收 ${formatNumber(row.close, 2)}</span>
    <span>涨跌 ${formatSigned(change, 2)} / ${formatPct(pct)}</span>
    <span>成交量 ${formatNumber(row.vol, 2)}</span>
  `);
}

function nearestDetailChartPoint(event) {
  const points = state.detailChartPoints || [];
  const bounds = state.detailChartBounds;
  if (!points.length || !bounds) {
    return null;
  }
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  if (x < bounds.left - 12 || x > bounds.right + 12 || y < bounds.top - 18 || y > bounds.bottom + 24) {
    return null;
  }
  let best = null;
  let bestDistance = Infinity;
  for (const point of points) {
    const distance = Math.abs(point.x - x);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = point;
    }
  }
  const maxDistance = Math.max(10, Math.min(36, (bounds.step || 12) * 0.65 + 6));
  return bestDistance <= maxDistance ? best : null;
}

function bindSectorChartEvents(canvas) {
  if (canvas.dataset.hoverBound) {
    return;
  }
  canvas.dataset.hoverBound = "1";
  canvas.addEventListener("mousemove", handleSectorChartMove);
  canvas.addEventListener("mouseleave", () => hideChartTooltip("sectorChartTooltip"));
}

function bindSectorPoolChartEvents(canvas) {
  if (canvas.dataset.hoverBound) {
    return;
  }
  canvas.dataset.hoverBound = "1";
  canvas.addEventListener("mousemove", handleSectorPoolChartMove);
  canvas.addEventListener("mouseleave", () => hideChartTooltip("sectorPoolChartTooltip"));
}

function bindSectorStockChartEvents(canvas) {
  if (canvas.dataset.hoverBound) {
    return;
  }
  canvas.dataset.hoverBound = "1";
  canvas.addEventListener("mousemove", handleSectorStockChartMove);
  canvas.addEventListener("mouseleave", () => hideChartTooltip("sectorStockChartTooltip"));
}

function handleSectorChartMove(event) {
  const point = nearestPoint(state.sectorChartPoints, event);
  if (!point) {
    hideChartTooltip("sectorChartTooltip");
    return;
  }
  showChartTooltip("sectorChartTooltip", event.currentTarget, point, `
    <strong>${escapeHtml(point.name)}</strong>
    <span>${formatDate(point.date)} 净流入 ${formatWanAmount(point.value)}</span>
  `);
}

function handleSectorPoolChartMove(event) {
  const point = nearestPoint(state.sectorPoolChartPoints, event);
  if (!point) {
    hideChartTooltip("sectorPoolChartTooltip");
    return;
  }
  showChartTooltip("sectorPoolChartTooltip", event.currentTarget, point, `
    <strong>${escapeHtml(point.name)}</strong>
    <span>${formatDate(point.date)} 净流入 ${formatWanAmount(point.value)}</span>
  `);
}

function handleSectorStockChartMove(event) {
  const point = nearestPoint(state.sectorStockChartPoints, event);
  if (!point) {
    hideChartTooltip("sectorStockChartTooltip");
    return;
  }
  showChartTooltip("sectorStockChartTooltip", event.currentTarget, point, `
    <strong>${escapeHtml(point.name)}</strong>
    <span>${formatDate(point.date)} ${formatStockChartValue(point.value, point.mode)}</span>
  `);
}

function nearestPoint(points, event) {
  if (!points?.length) {
    return null;
  }
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  let best = null;
  let bestDistance = Infinity;
  for (const point of points) {
    const distance = Math.hypot(point.x - x, point.y - y);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = point;
    }
  }
  return bestDistance <= 24 ? best : null;
}

function showChartTooltip(id, canvas, point, html) {
  const tooltip = document.querySelector(`#${id}`);
  if (!tooltip) {
    return;
  }
  tooltip.hidden = false;
  tooltip.innerHTML = html;
  translateElement(tooltip);
  const maxLeft = Math.max(10, canvas.clientWidth - 190);
  const left = Math.min(Math.max(point.x + 14, 10), maxLeft);
  const top = Math.max(point.y - 46, 10);
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  tooltip.style.borderColor = point.color || "#e5e7eb";
}

function hideChartTooltip(id) {
  const tooltip = document.querySelector(`#${id}`);
  if (tooltip) {
    tooltip.hidden = true;
  }
}

function updateNav() {
  const activePage = state.route.page === "sector"
    ? "sectors"
    : state.route.page === "valuation"
      ? "valuations"
      : state.route.page === "short-strategy"
        ? "short-strategies"
        : state.route.page;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === activePage);
  });
  document.querySelectorAll("[data-nav-group]").forEach((group) => {
    group.classList.toggle("active", Boolean(group.querySelector(`[data-nav="${activePage}"]`)));
  });
}

function initialLocale() {
  const stored = localStorage.getItem("valuation_diary_locale");
  return ["zh-CN", "zh-TW", "en", "ja"].includes(stored) ? stored : "zh-CN";
}

function t(key) {
  return I18N[state.locale]?.[key] || I18N["zh-CN"][key] || key;
}

Object.assign(UI_TRANSLATIONS, {
  "短线监控列表": { "zh-TW": "短線監控列表", en: "Short Watchlist", ja: "短期監視リスト" },
  "新增策略参考": { "zh-TW": "新增策略參考", en: "New Strategy Reference", ja: "戦略参考を追加" },
  "已保存策略": { "zh-TW": "已保存策略", en: "Saved Strategies", ja: "保存済み戦略" },
  "同一只股票重复保存会覆盖为最新策略，避免列表里出现重复记录。": { "zh-TW": "同一檔股票重複保存會覆蓋為最新策略，避免列表出現重複紀錄。", en: "Saving the same stock again updates the latest strategy instead of creating duplicates.", ja: "同じ銘柄を再保存すると最新戦略に更新され、重複記録を防ぎます。" },
  "搜索": { "zh-TW": "搜尋", en: "Search", ja: "検索" },
  "输入股票名称、代码或策略提示": { "zh-TW": "輸入股票名稱、代碼或策略提示", en: "Enter stock name, code, or strategy note", ja: "銘柄名、コード、戦略メモを入力" },
  "暂无保存的短线策略。先进入策略参考页生成一只股票，再保存到短线监控列表。": { "zh-TW": "暫無保存的短線策略。先進入策略參考頁生成一檔股票，再保存到短線監控列表。", en: "No saved short-term strategies yet. Generate one from the reference page, then save it here.", ja: "保存済みの短期戦略はまだありません。参考ページで生成してから保存してください。" },
  "查看详情": { "zh-TW": "查看詳情", en: "Details", ja: "詳細" },
  "返回监控列表": { "zh-TW": "返回監控列表", en: "Back to Watchlist", ja: "監視リストへ戻る" },
  "保存到短线监控": { "zh-TW": "保存到短線監控", en: "Save to Watchlist", ja: "監視リストに保存" },
  "保存中...": { "zh-TW": "保存中...", en: "Saving...", ja: "保存中..." },
  "T+1 日内做T": { "zh-TW": "T+1 日內做T", en: "T+1 Intraday", ja: "T+1 日中参考" },
  "7-15 日网格策略": { "zh-TW": "7-15 日網格策略", en: "7-15 Day Grid", ja: "7-15日グリッド" },
  "低吸区间": { "zh-TW": "低吸區間", en: "Low Zone", ja: "下値ゾーン" },
  "高抛区间": { "zh-TW": "高拋區間", en: "High Zone", ja: "上値ゾーン" },
  "网格下沿": { "zh-TW": "網格下沿", en: "Grid Lower", ja: "グリッド下限" },
  "网格上沿": { "zh-TW": "網格上沿", en: "Grid Upper", ja: "グリッド上限" },
  "参数": { "zh-TW": "參數", en: "Params", ja: "パラメータ" },
});

const UI_TRANSLATION_PATTERN_CONFIG = {
  "zh-TW": [
    { pattern: /近\s*(\d+)\s*天/g, replacement: "近 $1 天" },
    { pattern: /(\d+)\s*个交易日/g, replacement: "$1 個交易日" },
    { pattern: /(\d+)\s*个/g, replacement: "$1 個" },
    { pattern: /(\d+)\s*条/g, replacement: "$1 條" },
    { pattern: /(\d+)\s*只股票/g, replacement: "$1 檔股票" },
    { pattern: /(\d+)\s*只/g, replacement: "$1 檔" },
    { pattern: /(\d+)\s*周/g, replacement: "$1 週" },
    { pattern: /胜率\s*([+\-]?\d+(?:\.\d+)?%)/g, replacement: "勝率 $1" },
    { pattern: /收盘\s*([0-9.]+)/g, replacement: "收盤 $1" },
    { pattern: /最高\s*([+\-]?\d+(?:\.\d+)?%?)/g, replacement: "最高 $1" },
    { pattern: /最低\s*([+\-]?\d+(?:\.\d+)?%?)/g, replacement: "最低 $1" },
    { pattern: /净流入\s*/g, replacement: "淨流入 " },
  ],
  en: [
    { pattern: /近\s*(\d+)\s*天/g, replacement: "Last $1 days" },
    { pattern: /第\s*(\d+)\s*日/g, replacement: "Day $1" },
    { pattern: /(\d+)\s*个交易日/g, replacement: "$1 trading days" },
    { pattern: /(\d+)\s*个接口不可用/g, replacement: "$1 APIs unavailable" },
    { pattern: /(\d+)\s*个/g, replacement: "$1" },
    { pattern: /(\d+)\s*条/g, replacement: "$1 records" },
    { pattern: /(\d+)\s*只股票/g, replacement: "$1 stocks" },
    { pattern: /(\d+)\s*只/g, replacement: "$1 stocks" },
    { pattern: /(\d+)\s*周/g, replacement: "$1 weeks" },
    { pattern: /(\d+)\s*期预测/g, replacement: "$1 forecast periods" },
    { pattern: /胜率\s*([+\-]?\d+(?:\.\d+)?%)/g, replacement: "Win rate $1" },
    { pattern: /价格日期\s*/g, replacement: "Price date " },
    { pattern: /信号后\s*([+\-]?\d+(?:\.\d+)?%)/g, replacement: "After signal $1" },
    { pattern: /首日\s*([+\-]?\d+(?:\.\d+)?%)/g, replacement: "First day $1" },
    { pattern: /低\s+(¥[0-9.,-]+)/g, replacement: "Low $1" },
    { pattern: /合\s+(¥[0-9.,-]+)/g, replacement: "Fair $1" },
    { pattern: /高\s+(¥[0-9.,-]+)/g, replacement: "High $1" },
    { pattern: /收\s+([0-9.]+)/g, replacement: "Close $1" },
    { pattern: /共\s+(\d+)\s*records/g, replacement: "$1 records total" },
    { pattern: /买\s+(¥[0-9A-Z.,+-]+)/g, replacement: "Buy $1" },
    { pattern: /卖\s+(¥[0-9A-Z.,+-]+)/g, replacement: "Sell $1" },
    { pattern: /点击只看\s+/g, replacement: "Show only " },
    { pattern: /正流入\s*([0-9]+)\/([0-9]+)天\s*·\s*排名\s*([0-9]+)\/([0-9]+)/g, replacement: "Positive inflow $1/$2 days · Rank $3/$4" },
    { pattern: /正流入天数\s*([0-9]+)\s*\/\s*([0-9]+)\s*\/\s*资金排名\s*([0-9]+)\s*\/\s*([0-9]+)/g, replacement: "positive-inflow days $1/$2 / flow rank $3/$4" },
    { pattern: /近([0-9]+)\s+(¥[0-9A-Z.,+-]+)/g, replacement: "Last $1 $2" },
    { pattern: /当前最高：(.+?)，综合\s*([0-9.-]+)\s*分，状态\s*(.+?)。/g, replacement: "Current strongest: $1, overall $2, status $3." },
    { pattern: /Current最高：(.+?)，Overall\s*([0-9.-]+)\s*分，Status\s*(.+?)。/g, replacement: "Current strongest: $1, overall $2, status $3." },
    { pattern: /本次有\s*([0-9]+)\s*个交易日读取失败，矩阵可能不完整；可以稍后刷新重跑。/g, replacement: "$1 trading days failed to load; the matrix may be incomplete. Refresh later to rerun." },
    { pattern: /(SW Level [123] Sector)资金趋势/g, replacement: "$1 Flow Trend" },
    { pattern: /(SW Level [123] Sector)资金强弱/g, replacement: "$1 Strength" },
    { pattern: /Sector池/g, replacement: "Sector Pool" },
    { pattern: /Trend: (持续增强|偏强延续|新资金启动|回流修复|退潮预警|单日脉冲|短线降温)/g, replacement: (match, label) => `Trend: ${UI_TRANSLATIONS[label]?.en || label}` },
    { pattern: /价格\s*([+\-]?\d+(?:\.\d+)?%)/g, replacement: "Price $1" },
    { pattern: /([0-9]{4}-[0-9]{2}-[0-9]{2})\s*开始/g, replacement: "$1 started" },
    { pattern: /\/\s*([0-9]{2}\/[0-9]{2}\s+[0-9]{2}:[0-9]{2})\s*加入/g, replacement: "/ $1 added" },
    { pattern: /(\d+)\s*\/\s*(\d+)\s*天/g, replacement: "$1 / $2 days" },
    { pattern: /胜率\s*--/g, replacement: "Win rate --" },
    { pattern: /低\s+--/g, replacement: "Low --" },
    { pattern: /合\s+--/g, replacement: "Fair --" },
    { pattern: /高\s+--/g, replacement: "High --" },
    { pattern: /换手\s*([+\-]?\d+(?:\.\d+)?%)/g, replacement: "Turnover $1" },
    { pattern: /收盘\s*([0-9.]+)/g, replacement: "close $1" },
    { pattern: /最高\s*([+\-]?\d+(?:\.\d+)?%?)/g, replacement: "high $1" },
    { pattern: /最低\s*([+\-]?\d+(?:\.\d+)?%?)/g, replacement: "low $1" },
    { pattern: /净流入\s*/g, replacement: "net inflow " },
    { pattern: /累计净买入\s*/g, replacement: "cumulative net buy " },
    { pattern: /日净买入\s*/g, replacement: "daily net buy " },
  ],
  ja: [
    { pattern: /近\s*(\d+)\s*天/g, replacement: "直近$1日" },
    { pattern: /第\s*(\d+)\s*日/g, replacement: "$1日目" },
    { pattern: /(\d+)\s*个交易日/g, replacement: "$1取引日" },
    { pattern: /(\d+)\s*个/g, replacement: "$1件" },
    { pattern: /(\d+)\s*条/g, replacement: "$1件" },
    { pattern: /(\d+)\s*只股票/g, replacement: "$1銘柄" },
    { pattern: /(\d+)\s*只/g, replacement: "$1銘柄" },
    { pattern: /(\d+)\s*周/g, replacement: "$1週" },
    { pattern: /(\d+)\s*期预测/g, replacement: "$1期予測" },
    { pattern: /胜率\s*([+\-]?\d+(?:\.\d+)?%)/g, replacement: "勝率 $1" },
    { pattern: /价格日期\s*/g, replacement: "価格日 " },
    { pattern: /信号后\s*([+\-]?\d+(?:\.\d+)?%)/g, replacement: "シグナル後 $1" },
    { pattern: /首日\s*([+\-]?\d+(?:\.\d+)?%)/g, replacement: "初日 $1" },
    { pattern: /低\s+(¥[0-9.,-]+)/g, replacement: "割安 $1" },
    { pattern: /合\s+(¥[0-9.,-]+)/g, replacement: "適正 $1" },
    { pattern: /高\s+(¥[0-9.,-]+)/g, replacement: "割高 $1" },
    { pattern: /收\s+([0-9.]+)/g, replacement: "終値 $1" },
    { pattern: /共\s+(\d+)\s*件/g, replacement: "全$1件" },
    { pattern: /买\s+(¥[0-9A-Z.,+-]+)/g, replacement: "買い $1" },
    { pattern: /卖\s+(¥[0-9A-Z.,+-]+)/g, replacement: "売り $1" },
    { pattern: /点击只看\s+/g, replacement: "これだけ表示 " },
    { pattern: /正流入\s*([0-9]+)\/([0-9]+)天\s*·\s*排名\s*([0-9]+)\/([0-9]+)/g, replacement: "正流入 $1/$2日 · 順位 $3/$4" },
    { pattern: /正流入天数\s*([0-9]+)\s*\/\s*([0-9]+)\s*\/\s*资金排名\s*([0-9]+)\s*\/\s*([0-9]+)/g, replacement: "正流入日数 $1/$2 / 資金順位 $3/$4" },
    { pattern: /近([0-9]+)\s+(¥[0-9A-Z.,+-]+)/g, replacement: "直近$1 $2" },
    { pattern: /(SW Level [123] Sector)资金趋势/g, replacement: "$1資金トレンド" },
    { pattern: /(SW Level [123] Sector)资金强弱/g, replacement: "$1強弱" },
    { pattern: /Sector池/g, replacement: "セクタープール" },
    { pattern: /价格\s*([+\-]?\d+(?:\.\d+)?%)/g, replacement: "価格 $1" },
    { pattern: /([0-9]{4}-[0-9]{2}-[0-9]{2})\s*开始/g, replacement: "$1 開始" },
    { pattern: /\/\s*([0-9]{2}\/[0-9]{2}\s+[0-9]{2}:[0-9]{2})\s*加入/g, replacement: "/ $1 追加" },
    { pattern: /(\d+)\s*\/\s*(\d+)\s*天/g, replacement: "$1 / $2日" },
    { pattern: /胜率\s*--/g, replacement: "勝率 --" },
    { pattern: /换手\s*([+\-]?\d+(?:\.\d+)?%)/g, replacement: "回転率 $1" },
    { pattern: /收盘\s*([0-9.]+)/g, replacement: "終値 $1" },
    { pattern: /最高\s*([+\-]?\d+(?:\.\d+)?%?)/g, replacement: "最高 $1" },
    { pattern: /最低\s*([+\-]?\d+(?:\.\d+)?%?)/g, replacement: "最低 $1" },
    { pattern: /净流入\s*/g, replacement: "純流入 " },
  ],
};

const uiTranslationTermCache = {};

function uiTranslationTerms(locale) {
  if (!uiTranslationTermCache[locale]) {
    uiTranslationTermCache[locale] = Object.entries(UI_TRANSLATIONS)
      .filter(([source, targets]) => source.length >= 2 && targets?.[locale])
      .sort((a, b) => b[0].length - a[0].length);
  }
  return uiTranslationTermCache[locale];
}

function applyUiTranslationPatterns(text, locale) {
  return (UI_TRANSLATION_PATTERN_CONFIG[locale] || []).reduce(
    (result, item) => result.replace(item.pattern, item.replacement),
    text
  );
}

function translateUiText(value, locale = state.locale) {
  if (locale === "zh-CN") {
    return "";
  }
  const text = String(value ?? "");
  const trimmed = text.trim();
  if (!trimmed) {
    return "";
  }
  const direct = UI_TRANSLATIONS[trimmed]?.[locale] || DOM_TRANSLATIONS[trimmed]?.[locale];
  let translated = direct || trimmed;
  if (!direct) {
    for (const [source, targets] of uiTranslationTerms(locale)) {
      translated = translated.split(source).join(targets[locale]);
    }
    translated = applyUiTranslationPatterns(translated, locale);
  }
  if (!translated || translated === trimmed) {
    return "";
  }
  return text.replace(trimmed, translated);
}

function translateElement(root) {
  if (!root || state.locale === "zh-CN") {
    return;
  }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || !node.nodeValue.trim()) {
        return NodeFilter.FILTER_REJECT;
      }
      if (parent.closest("[data-no-translate]") || ["SCRIPT", "STYLE", "TEXTAREA"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }
  textNodes.forEach((node) => {
    const replacement = translateUiText(node.nodeValue);
    if (replacement) {
      node.nodeValue = replacement;
    }
  });
  root.querySelectorAll("[placeholder], [title], [aria-label]").forEach((node) => {
    ["placeholder", "title", "aria-label"].forEach((attribute) => {
      if (!node.hasAttribute(attribute)) {
        return;
      }
      const replacement = translateUiText(node.getAttribute(attribute));
      if (replacement) {
        node.setAttribute(attribute, replacement);
      }
    });
  });
}

function updateShell() {
  document.documentElement.lang = state.locale;
  document.title = t("appName");
  document.body.classList.toggle("auth-mode", state.auth.checked && !state.auth.authenticated);
  document.body.classList.toggle("is-admin", isCurrentAdmin());
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (key) node.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.dataset.i18nPlaceholder;
    if (key) node.setAttribute("placeholder", t(key));
  });
  const localeSelect = document.querySelector("[data-locale-select]");
  if (localeSelect && localeSelect.value !== state.locale) {
    localeSelect.value = state.locale;
  }
  const authUser = document.querySelector("[data-auth-user]");
  if (authUser) {
    authUser.hidden = !state.auth.authenticated;
    authUser.innerHTML = state.auth.authenticated ? `
      <span>
        <strong>${escapeHtml(state.auth.user?.username || "--")}</strong>
        <small>${state.auth.user?.role === "admin" ? "管理员" : "普通用户"}</small>
      </span>
      <button class="button compact" type="button" data-action="logout">退出</button>
    ` : "";
  }
}

function applyLanguage() {
  updateShell();
  translateElement(document.body);
  translateElement(app);
  translateElement(modalRoot);
}

function startSyncPolling() {
  if (syncPollingTimer) {
    return;
  }
  syncPollingTimer = setInterval(async () => {
    try {
      const previousSignature = syncSignature(state.sync);
      const data = await api("/api/sync/status");
      const nextSync = data.sync;
      const wasActive = Boolean(state.sync?.running || state.sync?.active);
      const isActive = Boolean(nextSync?.running || nextSync?.active);
      const shouldReloadCore = isActive || (wasActive && !isActive);

      state.sync = nextSync;
      if (shouldReloadCore) {
        await loadCore();
      }

      if (previousSignature !== syncSignature(state.sync) && !isUserEditing()) {
        render();
      }
    } catch {
      // Keep the local UI quiet if a single poll fails.
    }
  }, 8000);
}

function syncSignature(sync) {
  if (!sync) {
    return "";
  }
  return [
    sync.running,
    sync.active,
    sync.message,
    sync.target_trade_date,
    sync.success_count,
    sync.total,
    sync.next_retry_at,
  ].join("|");
}

function isUserEditing() {
  if (state.editing) {
    return true;
  }

  const active = document.activeElement;
  return Boolean(active && ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName));
}

function showToast(message) {
  state.toast = message;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    state.toast = "";
    render();
  }, 2800);
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !String(url).startsWith("/api/auth/")) {
      state.auth = { checked: true, authenticated: false, user: null };
      state.dashboard = null;
      state.coreLoading = false;
    }
    throw new Error(data.error || `请求失败：${response.status}`);
  }
  return data;
}

function withTimeout(promise, ms, message) {
  let timer = 0;
  const timeout = new Promise((_, reject) => {
    timer = window.setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timer));
}

function filterRowsByQuery(rows, query, fields) {
  const q = normalizeQuery(query);
  if (!q) {
    return rows || [];
  }
  return (rows || []).filter((row) => {
    const text = fields.map((field) => {
      const value = field.split(".").reduce((target, key) => target?.[key], row);
      return value == null ? "" : String(value);
    }).join(" ");
    return normalizeQuery(text).includes(q);
  });
}

function filterStockItems(rows, query) {
  return filterRowsByQuery(rows || [], query, [
    "name",
    "ts_code",
    "symbol",
    "industry",
    "area",
    "group.name",
  ]);
}

function normalizeQuery(value) {
  return String(value || "").trim().toLowerCase();
}

function renderListSearch(kind, value, placeholder = "输入股票名称或代码") {
  const enableStockSuggest = stockSuggestKinds().includes(kind);
  return `
    <div class="list-search-row">
      <label>
        <span>${escapeHtml(t("search"))}</span>
        <input class="input" value="${escapeHtml(value)}" placeholder="${escapeAttr(placeholder)}" data-list-search="${escapeAttr(kind)}" ${enableStockSuggest ? `data-stock-suggest-kind="${escapeAttr(kind)}" autocomplete="off"` : ""}>
        ${enableStockSuggest ? renderStockSuggestDropdown(kind) : ""}
      </label>
    </div>
  `;
}

function stockSuggestKinds() {
  return ["dashboard", "pool", "market", "turnover", "decision", "valuation", "sector", "sectorStock", "strategy"];
}

function renderStockSuggestDropdown(kind) {
  if (state.stockSuggestKind !== kind) {
    return "";
  }
  if (state.stockSuggestError) {
    return `<div class="stock-suggest muted">${escapeHtml(state.stockSuggestError)}</div>`;
  }
  if (!state.stockSuggestResults.length && !state.stockSuggestLoading) {
    return "";
  }
  return `
    <div class="stock-suggest">
      ${state.stockSuggestLoading ? `<div class="stock-suggest-status">正在搜索股票...</div>` : ""}
      ${state.stockSuggestResults.map((stock) => renderStockSuggestButton(kind, stock)).join("")}
    </div>
  `;
}

function renderStockSuggestButton(kind, stock) {
  return `
    <button type="button" data-action="select-stock-suggest" data-kind="${escapeAttr(kind)}" data-code="${escapeAttr(stock.ts_code || "")}" data-name="${escapeAttr(stock.name || "")}">
      <strong>${escapeHtml(stock.name || stock.ts_code)}</strong>
      <span>${escapeHtml([stock.ts_code, stock.industry || stock.area].filter(Boolean).join(" / "))}</span>
    </button>
  `;
}

function restoreListSearchFocus(kind, cursor) {
  requestAnimationFrame(() => {
    const input = document.querySelector(`[data-list-search="${kind}"]`);
    if (!input) {
      return;
    }
    input.focus();
    if (Number.isInteger(cursor) && typeof input.setSelectionRange === "function") {
      input.setSelectionRange(cursor, cursor);
    }
  });
}

function renderPagination(list, page, totalPages, totalItems) {
  if (totalPages <= 1) {
    return `<div class="pagination muted">共 ${totalItems} 条</div>`;
  }
  const pages = paginationPages(page, totalPages);
  return `
    <div class="pagination">
      <button class="button tiny" data-action="page-list" data-list="${escapeAttr(list)}" data-page="${Math.max(1, page - 1)}" ${page <= 1 ? "disabled" : ""}>上一页</button>
      ${pages.map((item) => item === "..."
        ? `<span>...</span>`
        : `<button class="button tiny ${item === page ? "primary" : ""}" data-action="page-list" data-list="${escapeAttr(list)}" data-page="${item}">${item}</button>`
      ).join("")}
      <button class="button tiny" data-action="page-list" data-list="${escapeAttr(list)}" data-page="${Math.min(totalPages, page + 1)}" ${page >= totalPages ? "disabled" : ""}>下一页</button>
      <em>共 ${totalItems} 条 / ${totalPages} 页</em>
    </div>
  `;
}

function paginationPages(page, totalPages) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const ordered = Array.from(pages)
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);
  const result = [];
  for (const item of ordered) {
    if (result.length && item - result.at(-1) > 1) {
      result.push("...");
    }
    result.push(item);
  }
  return result;
}

function parseRoute() {
  const [hashPath, hashSearch = ""] = (location.hash || "#/dashboard").replace(/^#\/?/, "").split("?");
  const parts = hashPath.split("/").filter(Boolean);
  const query = new URLSearchParams(hashSearch);
  const from = normalizeSectorDetailSource(query.get("from"));
  if (parts[0] === "pool") {
    return { page: "pool" };
  }
  if (parts[0] === "stock") {
    return { page: "stock", id: decodeURIComponent(parts[1] || "") };
  }
  if (parts[0] === "valuations") {
    return { page: "valuations" };
  }
  if (parts[0] === "valuation") {
    return { page: "valuation", id: decodeURIComponent(parts[1] || "new") };
  }
  if (parts[0] === "market") {
    return { page: "market" };
  }
  if (parts[0] === "decisions") {
    return { page: "decisions" };
  }
  if (parts[0] === "turnover") {
    return { page: "turnover" };
  }
  if (parts[0] === "short-strategies") {
    return { page: "short-strategies" };
  }
  if (parts[0] === "short-strategy") {
    return { page: "short-strategy", id: decodeURIComponent(parts[1] || "") };
  }
  if (parts[0] === "strength") {
    return { page: "strength" };
  }
  if (parts[0] === "sectors") {
    return { page: "sectors" };
  }
  if (parts[0] === "sector-pool") {
    return { page: "sector-pool" };
  }
  if (parts[0] === "sector") {
    if (["L1", "L2", "L3"].includes(String(parts[1] || "").toUpperCase())) {
      return {
        page: "sector",
        level: String(parts[1] || "L3").toUpperCase(),
        id: decodeURIComponent(parts[2] || ""),
        from,
      };
    }
    return { page: "sector", level: "L3", id: decodeURIComponent(parts[1] || ""), from };
  }
  if (parts[0] === "groups") {
    return { page: "groups" };
  }
  if (parts[0] === "users") {
    return { page: "users" };
  }
  return { page: "dashboard" };
}

function normalizeSectorDetailSource(value) {
  return ["strength", "sectors", "sector-pool"].includes(value) ? value : "";
}

function sectorDetailSourceFromRoute() {
  if (state.route.page === "strength") {
    return "strength";
  }
  if (state.route.page === "sector-pool") {
    return "sector-pool";
  }
  if (state.route.page === "sectors") {
    return "sectors";
  }
  return "";
}

function indexName(tsCode) {
  return {
    "000001.SH": "上证指数",
    "399001.SZ": "深证成指",
    "399006.SZ": "创业板指",
    "000300.SH": "沪深300",
  }[tsCode] || tsCode || "--";
}

function periodLabel(period) {
  return {
    day: "日",
    week: "周",
    month: "月",
    range: "区间",
  }[period] || "日";
}

function sectorLevelLabel(level) {
  return {
    L1: "申万一级行业",
    L2: "申万二级行业",
    L3: "申万三级行业",
  }[String(level || "L3").toUpperCase()] || "申万三级行业";
}

function isSectorVisible(name) {
  return state.sectorVisibility[name] !== false;
}

function isSectorStockVisible(code) {
  return state.sectorStockVisibility[code] === true;
}

function stockChartValue(point, mode) {
  if (mode === "fund") {
    return Number(point.net_amount);
  }
  if (mode === "cumulativeFund") {
    return Number(point.cumulative_net_amount);
  }
  return Number(point.return_pct);
}

function formatStockChartValue(value, mode) {
  if (mode === "fund") {
    return `日净买入 ${formatWanAmount(value)}`;
  }
  if (mode === "cumulativeFund") {
    return `累计净买入 ${formatWanAmount(value)}`;
  }
  return `涨幅 ${formatPercent(value)}`;
}

function sectorColor(index) {
  const colors = [
    "#f5f5f5", "#34d399", "#fb7185", "#fbbf24", "#93c5fd", "#c4b5fd",
    "#2dd4bf", "#f472b6", "#a3e635", "#f97316", "#67e8f9", "#d8b4fe",
    "#bef264", "#60a5fa", "#fda4af", "#5eead4", "#ddd6fe", "#fdba74",
  ];
  return colors[index % colors.length];
}

function statusClass(status) {
  return {
    undervalued: "status-low",
    fair: "status-fair",
    overvalued: "status-high",
    unpriced: "status-empty",
  }[status] || "status-empty";
}

function toneClass(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number === 0) {
    return "flat";
  }
  return number > 0 ? "up" : "down";
}

function scoreToneClass(score) {
  const number = Number(score);
  if (!Number.isFinite(number)) {
    return "score-weak";
  }
  if (number >= 80) {
    return "score-hot";
  }
  if (number >= 65) {
    return "score-good";
  }
  if (number >= 45) {
    return "score-watch";
  }
  return "score-weak";
}

function strengthCellStyle(cell) {
  const score = Math.max(0, Math.min(100, Number(cell.net_score || 0)));
  const alpha = 0.05 + (score / 100) * 0.22;
  const positive = Number(cell.net_amount || 0) >= 0;
  const color = positive ? `216, 111, 114` : `63, 154, 114`;
  return `background: rgba(${color}, ${alpha}); border-color: rgba(${color}, ${Math.min(alpha + 0.12, 0.42)});`;
}

function formatScore(value) {
  return formatNumber(value, 0);
}

function formatTurnoverWeeks(values) {
  if (!Array.isArray(values) || !values.length) {
    return "--";
  }
  return values.map((value) => formatPct(value)).join(" / ");
}

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "--";
  }
  return Number(value).toLocaleString("zh-CN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "--";
  }
  return state.locale === "en" ? `¥${formatNumber(value, 2)}` : `${formatNumber(value, 2)} 元`;
}

function formatSigned(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "--";
  }
  const number = Number(value);
  return `${number > 0 ? "+" : ""}${number.toFixed(digits)}`;
}

function formatPct(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "--";
  }
  const number = Number(value);
  return `${number > 0 ? "+" : ""}${number.toFixed(2)}%`;
}

function formatPercent(value) {
  return formatPct(value);
}

function formatPlainPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "--";
  }
  return `${Number(value).toFixed(1)}%`;
}

function boundedPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return 0;
  }
  return Math.max(0, Math.min(100, number));
}

function formatConfidence(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "--";
  }
  const normalized = number > 0 && number <= 1 ? number * 100 : number;
  return `${Math.max(0, Math.min(100, normalized)).toFixed(0)}%`;
}

function arrayValues(value) {
  return Array.isArray(value) ? value.filter((item) => item !== null && item !== undefined && item !== "") : [];
}

function formatMultiplier(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "--";
  }
  return `${Number(value).toFixed(1)}x`;
}

function formatAmount(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "--";
  }
  const yuan = Number(value) * 1000;
  return formatLargeCnyAmount(yuan);
}

function formatYuanAmount(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "--";
  }
  return formatLargeCnyAmount(Number(value));
}

function formatWanAmount(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "--";
  }
  return formatLargeCnyAmount(Number(value) * 10000);
}

function formatCompactWanAmount(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "--";
  }
  const yuan = Number(value) * 10000;
  if (state.locale === "en") {
    if (Math.abs(yuan) >= 1000000000) {
      return `¥${(yuan / 1000000000).toFixed(1)}B`;
    }
    return `¥${(yuan / 1000000).toFixed(0)}M`;
  }
  const wan = Number(value);
  return Math.abs(wan) >= 10000 ? `${(wan / 10000).toFixed(1)}亿` : `${wan.toFixed(0)}万`;
}

function formatLargeCnyAmount(yuan) {
  if (state.locale === "en") {
    if (Math.abs(yuan) >= 1000000000) {
      return `¥${(yuan / 1000000000).toFixed(2)}B`;
    }
    return `¥${(yuan / 1000000).toFixed(2)}M`;
  }
  if (Math.abs(yuan) >= 100000000) {
    return `${(yuan / 100000000).toFixed(2)} 亿`;
  }
  return `${(yuan / 10000).toFixed(2)} 万`;
}

function roundClient(value, digits = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return 0;
  }
  const scale = 10 ** digits;
  return Math.round(number * scale) / scale;
}

function formatDate(value) {
  const raw = String(value || "");
  if (!raw) {
    return "--";
  }
  if (/^\d{8}$/.test(raw)) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }
  return raw;
}

function formatDateShort(value) {
  const raw = String(value || "");
  if (/^\d{8}$/.test(raw)) {
    return `${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }
  return formatDate(raw);
}

function todayInputDate() {
  const date = new Date();
  const day = date.getDay();
  if (day === 0) {
    date.setDate(date.getDate() - 2);
  }
  if (day === 6) {
    date.setDate(date.getDate() - 1);
  }
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function defaultDecisionSignalDate() {
  const compact = state.dashboard?.stats?.latest_price_date || state.sync?.target_trade_date || "";
  if (/^\d{8}$/.test(compact)) {
    return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
  }
  return todayInputDate();
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatChartLabel(row) {
  if (row?.label) {
    return row.label;
  }
  if (row?.trade_time) {
    return String(row.trade_time).slice(5, 16);
  }
  return formatDate(row?.trade_date);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function debounce(fn, wait) {
  let timer = 0;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  };
}
