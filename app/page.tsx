"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Screen =
  | "welcome"
  | "issue"
  | "fragments"
  | "compress"
  | "stamp"
  | "processing"
  | "result"
  | "archive";

type Issue = {
  id: string;
  symbol: string;
  code: string;
  title: string;
  hint: string;
  fault: string;
  fragments: string[];
};

type Result = {
  id: string;
  date: string;
  issueId: string;
  fault: string;
  level: string;
  stamp: string;
  universe: number;
  others: number;
  self: number;
  compensation: string[];
  advice: string;
  fragments: string[];
};

const ISSUES: Issue[] = [
  {
    id: "effort",
    symbol: "忙",
    code: "ERR-017",
    title: "努力一直没有响应",
    hint: "忙了很久，只收到一句“收到”",
    fault: "努力有回音，但回的是“收到”",
    fragments: ["临时加活", "需求又改", "无效开会", "下班失败", "努力隐身", "周一太长"],
  },
  {
    id: "energy",
    symbol: "困",
    code: "PWR-008",
    title: "睡了但像没睡",
    hint: "显示 80%，体感只剩 6%",
    fault: "精神电量存在不明泄漏",
    fragments: ["醒来就累", "脑子转圈", "咖啡失效", "夜里清醒", "白天待机", "电量虚标"],
  },
  {
    id: "signal",
    symbol: "冷",
    code: "SIG-404",
    title: "人际信号忽冷忽热",
    hint: "人在线，关系却还在缓冲",
    fault: "人际信号反复连接失败",
    fragments: ["突然冷淡", "过度解读", "对方装死", "想说没说", "聊天卡住", "关系待机"],
  },
  {
    id: "wallet",
    symbol: "穷",
    code: "GVT-088",
    title: "钱包出现引力异常",
    hint: "钱只是经过了一下账户",
    fault: "钱包遭遇局部引力塌缩",
    fragments: ["账单突袭", "冲动下单", "工资路过", "外卖超支", "月底漫长", "余额隐身"],
  },
  {
    id: "glitch",
    symbol: "衰",
    code: "SYS-500",
    title: "最近小事都在报错",
    hint: "每件小事都不太配合",
    fault: "生活连续触发非必要小型故障",
    fragments: ["错过电梯", "外卖洒了", "耳机没电", "地铁坐过", "忘带钥匙", "消息发错"],
  },
  {
    id: "unknown",
    symbol: "累",
    code: "UNK-000",
    title: "说不上来，反正很累",
    hint: "没什么问题，只是不想动",
    fault: "系统正常，你只是太累了",
    fragments: ["莫名烦躁", "不想说话", "什么都懒", "需要放空", "情绪缓冲", "暂不营业"],
  },
];

const COMPENSATIONS = [
  "23 分钟合法发呆额度",
  "一张“今晚不必积极向上”许可证",
  "24 小时暂停自我责备服务",
  "一次延迟回复而无需解释的权利",
  "把难题留给明天处理的权限",
  "一次小额奖励自己的官方补贴",
  "一张临时取消非必要计划通行证",
  "今天只做一件事的精简模式",
];

const ADVICES = [
  "今天只需要把生活过到及格。剩下的部分，明天的你再处理。",
  "先完成一件能明显变少的小事，然后停止追加任务。",
  "暂时不要认真解读任何人的语气，宇宙网络今天不稳定。",
  "请把手机放远十分钟。没有及时回复，也不会引发星系坍缩。",
  "经核实，你已经很努力。接下来允许使用低功耗模式。",
  "先照顾那个已经很累的自己，再处理那些看起来很急的事。",
];

const PROCESS_MESSAGES = [
  "正在调取你最近的运气日志…",
  "发现多次非必要打击…",
  "正在重新划分责任…",
  "售后员 U-404 正在提高赔偿额度…",
  "判定完成。",
];

const SCREEN_ORDER: Record<Screen, number> = {
  welcome: 0,
  issue: 1,
  fragments: 2,
  compress: 3,
  stamp: 4,
  processing: 5,
  result: 6,
  archive: 0,
};

function hashText(value: string) {
  return Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function createResult(issue: Issue, fragments: string[], stamp: string): Result {
  const seed = hashText(issue.id + fragments.join("") + stamp);
  const universe = 68 + (seed % 18);
  const others = 10 + (seed % 9);
  const self = 100 - universe - others;
  const first = COMPENSATIONS[seed % COMPENSATIONS.length];
  let second = COMPENSATIONS[(seed + 3) % COMPENSATIONS.length];
  if (second === first) second = COMPENSATIONS[(seed + 4) % COMPENSATIONS.length];

  return {
    id: `UNV-${new Date().toISOString().slice(5, 10).replace("-", "")}-${String(seed % 1000).padStart(3, "0")}`,
    date: new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date()),
    issueId: issue.id,
    fault: issue.fault,
    level: stamp === "宇宙领导已阅" ? "建议重启宇宙" : stamp === "银河加急" ? "连续报错" : "局部卡顿",
    stamp,
    universe,
    others,
    self,
    compensation: [first, second],
    advice: ADVICES[(seed + 1) % ADVICES.length],
    fragments,
  };
}

function getStoredResults(): Result[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem("universe-after-sales") ?? "[]");
  } catch {
    return [];
  }
}

function saveResultToStorage(result: Result) {
  const next = [result, ...getStoredResults().filter((item) => item.id !== result.id)].slice(0, 8);
  window.localStorage.setItem("universe-after-sales", JSON.stringify(next));
}

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  let line = "";
  let cursorY = y;
  Array.from(text).forEach((char, index) => {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = char;
      cursorY += lineHeight;
    } else {
      line = test;
    }
    if (index === text.length - 1 && line) ctx.fillText(line, x, cursorY);
  });
  return cursorY;
}

function downloadResultCard(result: Result) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1440;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#bca0ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const glow = ctx.createRadialGradient(860, 160, 10, 860, 160, 620);
  glow.addColorStop(0, "rgba(255,216,79,.85)");
  glow.addColorStop(1, "rgba(188,160,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,.2)";
  ctx.lineWidth = 2;
  for (let x = 70; x < 1030; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1440);
    ctx.stroke();
  }
  for (let y = 60; y < 1440; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1080, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#4f25ca";
  ctx.font = "700 32px ui-monospace, monospace";
  ctx.fillText("UNIVERSE AFTER-SALES CENTER", 76, 92);
  ctx.fillStyle = "#17131c";
  ctx.font = "900 76px sans-serif";
  ctx.fillText("宇宙售后工单", 76, 190);

  ctx.fillStyle = "#fff9e9";
  ctx.strokeStyle = "#17131c";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(64, 250, 952, 1000, 34);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#665d76";
  ctx.font = "500 28px ui-monospace, monospace";
  ctx.fillText(`工单编号  ${result.id}`, 112, 320);
  ctx.fillText(`处理等级  ${result.level}`, 112, 372);

  ctx.fillStyle = "#17131c";
  ctx.font = "800 50px sans-serif";
  wrapCanvasText(ctx, result.fault, 112, 470, 840, 70);

  ctx.fillStyle = "#7a45ff";
  ctx.font = "700 28px sans-serif";
  ctx.fillText("责任划分", 112, 620);
  ctx.fillStyle = "#17131c";
  ctx.font = "800 42px sans-serif";
  ctx.fillText(`宇宙 ${result.universe}%   他人 ${result.others}%   你 ${result.self}%`, 112, 680);

  ctx.fillStyle = "#7a45ff";
  ctx.font = "700 28px sans-serif";
  ctx.fillText("赔偿方案", 112, 782);
  ctx.fillStyle = "#17131c";
  ctx.font = "700 36px sans-serif";
  result.compensation.forEach((item, index) => ctx.fillText(`· ${item}`, 112, 846 + index * 62));

  ctx.fillStyle = "#ff5d78";
  ctx.save();
  ctx.translate(820, 1040);
  ctx.rotate(-0.1);
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#ff5d78";
  ctx.strokeRect(-150, -48, 300, 96);
  ctx.font = "900 42px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(result.stamp, 0, 16);
  ctx.restore();

  ctx.fillStyle = "#4e465b";
  ctx.textAlign = "left";
  ctx.font = "500 31px sans-serif";
  wrapCanvasText(ctx, result.advice, 112, 1120, 720, 48);

  ctx.fillStyle = "#17131c";
  ctx.font = "700 30px sans-serif";
  ctx.fillText("经检测，这件事确实不能全怪你。", 76, 1346);

  const link = document.createElement("a");
  link.download = `${result.id}-宇宙赔偿单.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [issueId, setIssueId] = useState<string>("");
  const [fragments, setFragments] = useState<string[]>([]);
  const [compression, setCompression] = useState(0);
  const [holding, setHolding] = useState(false);
  const [stampPosition, setStampPosition] = useState(0);
  const [stampDirection, setStampDirection] = useState(1);
  const [stamp, setStamp] = useState("");
  const [processIndex, setProcessIndex] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [archive, setArchive] = useState<Result[]>([]);
  const [toast, setToast] = useState("");
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const issue = useMemo(() => ISSUES.find((item) => item.id === issueId) ?? null, [issueId]);
  const progress = SCREEN_ORDER[screen];

  useEffect(() => {
    setArchive(getStoredResults());
  }, []);

  useEffect(() => {
    if (screen !== "stamp" || stamp) return;
    const timer = window.setInterval(() => {
      setStampPosition((position) => {
        let next = position + stampDirection * 2.1;
        if (next >= 100) {
          next = 100;
          setStampDirection(-1);
        } else if (next <= 0) {
          next = 0;
          setStampDirection(1);
        }
        return next;
      });
    }, 16);
    return () => window.clearInterval(timer);
  }, [screen, stamp, stampDirection]);

  useEffect(() => {
    if (screen !== "processing" || !issue) return;
    setProcessIndex(0);
    const messageTimer = window.setInterval(() => {
      setProcessIndex((index) => Math.min(index + 1, PROCESS_MESSAGES.length - 1));
    }, 620);
    const doneTimer = window.setTimeout(() => {
      const nextResult = createResult(issue, fragments, stamp || "优先受理");
      setResult(nextResult);
      saveResultToStorage(nextResult);
      setArchive(getStoredResults());
      setScreen("result");
    }, 3200);
    return () => {
      window.clearInterval(messageTimer);
      window.clearTimeout(doneTimer);
    };
  }, [screen, issue, fragments, stamp]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectIssue = (id: string) => {
    setIssueId(id);
    setFragments([]);
    setScreen("fragments");
  };

  const toggleFragment = (fragment: string) => {
    setFragments((current) => {
      if (current.includes(fragment)) return current.filter((item) => item !== fragment);
      if (current.length >= 3) {
        setToast("一张工单最多回收 3 块故障碎片");
        return current;
      }
      return [...current, fragment];
    });
  };

  const stopCompress = useCallback(() => {
    setHolding(false);
    if (holdTimer.current) window.clearInterval(holdTimer.current);
    holdTimer.current = null;
  }, []);

  const startCompress = () => {
    if (compression >= 100 || holdTimer.current) return;
    setHolding(true);
    holdTimer.current = window.setInterval(() => {
      setCompression((value) => {
        const next = Math.min(100, value + 2.8);
        if (next >= 100) {
          if (holdTimer.current) window.clearInterval(holdTimer.current);
          holdTimer.current = null;
          setHolding(false);
          if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
        }
        return next;
      });
    }, 45);
  };

  useEffect(() => () => stopCompress(), [stopCompress]);

  const applyStamp = () => {
    if (stamp) return;
    const distance = Math.abs(stampPosition - 55);
    const grade = distance < 8 ? "宇宙领导已阅" : distance < 20 ? "银河加急" : "优先受理";
    setStamp(grade);
    if (navigator.vibrate) navigator.vibrate(36);
  };

  const reset = () => {
    stopCompress();
    setIssueId("");
    setFragments([]);
    setCompression(0);
    setStampPosition(0);
    setStampDirection(1);
    setStamp("");
    setResult(null);
    setScreen("welcome");
  };

  const shareResult = async () => {
    if (!result) return;
    const text = `宇宙判定：${result.fault}。我获赔“${result.compensation[0]}”。你也去投诉一下宇宙。`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "宇宙售后中心", text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(`${text} ${window.location.href}`);
        setToast("分享文案已复制");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") setToast("分享没有成功，再试一次吧");
    }
  };

  return (
    <main className="site-shell">
      <div className="space-noise" aria-hidden="true" />
      <div className="orbit orbit-one" aria-hidden="true"><span /></div>
      <div className="orbit orbit-two" aria-hidden="true"><span /></div>

      <section className={`app-frame screen-${screen}`} aria-live="polite">
        <header className="system-bar">
          <div className="system-brand">
            <span className="status-dot" />
            <span>宇宸运行稳定性管理局</span>
          </div>
          <span className="system-code">UASC / 07</span>
        </header>

        {screen !== "welcome" && screen !== "archive" && (
          <div className="case-progress" aria-label={`办理进度 ${progress}/6`}>
            <span>STEP</span>
            <div className="progress-track"><i style={{ width: `${Math.max(5, (progress / 6) * 100)}%` }} /></div>
            <span>{String(progress).padStart(2, "0")}/06</span>
          </div>
        )}

        {screen === "welcome" && (
          <div className="screen welcome-screen enter-up">
            <div className="window-label"><span>07</span>号售后窗口</div>
            <div className="mascot-wrap" aria-label="售后专员 U-404">
              <div className="signal-ring ring-a" />
              <div className="signal-ring ring-b" />
              <div className="mascot">
                <div className="headset" />
                <div className="mascot-eye eye-left" />
                <div className="mascot-eye eye-right" />
                <div className="mascot-mouth" />
                <span className="id-tag">U-404</span>
              </div>
            </div>
            <p className="eyebrow">UNIVERSE AFTER-SALES CENTER</p>
            <h1 className="hero-title" aria-label="宇宙售后中心">
              <span className="title-line"><i>宇宙</i><i>售后</i></span>
              <b>中心</b>
            </h1>
            <p className="welcome-copy">宇宸运行异常？<br />本中心受理一些没办法的事。</p>
            <div className="clerk-note">
              <span className="note-avatar">✦</span>
              <p><b>售后专员 U-404</b><br />“先提交，能不能赔我来想办法。”</p>
            </div>
            <button className="primary-button" onClick={() => setScreen("issue")}>
              <span>我要投诉宇宙</span><b>→</b>
            </button>
            <button className="text-button" onClick={() => { setArchive(getStoredResults()); setScreen("archive"); }} disabled={!archive.length}>
              {archive.length ? `查看售后档案 · ${archive.length}` : "尚无售后档案"}
            </button>
            <p className="disclaimer">娱乐体验 · 不改命 · 只替你说句公道话</p>
          </div>
        )}

        {screen === "issue" && (
          <div className="screen enter-up">
            <button className="back-button" onClick={() => setScreen("welcome")} aria-label="返回">←</button>
            <div className="section-heading">
              <p className="eyebrow">STEP 01 / 故障申报</p>
              <h2>最近是哪一部分<br />运行得不太对？</h2>
              <p>选一个最想投诉的，其他的锅稍后再算。</p>
            </div>
            <div className="issue-grid">
              {ISSUES.map((item) => (
                <button key={item.id} className="issue-card" onClick={() => selectIssue(item.id)}>
                  <span className="issue-symbol">{item.symbol}</span>
                  <span className="issue-code">{item.code}</span>
                  <b>{item.title}</b>
                  <small>{item.hint}</small>
                  <i>选这个 →</i>
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === "fragments" && issue && (
          <div className="screen enter-up">
            <button className="back-button" onClick={() => setScreen("issue")} aria-label="返回">←</button>
            <div className="section-heading compact-heading">
              <p className="eyebrow">STEP 02 / 收集证据</p>
              <h2>回收 3 块<br />故障碎片</h2>
              <p>点击最近发生过的事，把它们装进工单。</p>
            </div>
            <div className="fragment-zone">
              <div className="fragment-cloud">
                {issue.fragments.map((fragment, index) => {
                  const selected = fragments.includes(fragment);
                  return (
                    <button
                      key={fragment}
                      className={`fragment-chip fragment-${index + 1} ${selected ? "selected" : ""}`}
                      onClick={() => toggleFragment(fragment)}
                      aria-pressed={selected}
                    >
                      <span>{selected ? "✓" : "+"}</span>{fragment}
                    </button>
                  );
                })}
              </div>
              <div className="evidence-dock">
                <div className="dock-head"><span>故障回收口</span><b>{fragments.length}/3</b></div>
                <div className="dock-slots">
                  {[0, 1, 2].map((index) => <span key={index} className={fragments[index] ? "filled" : ""}>{fragments[index] ?? "等待碎片"}</span>)}
                </div>
              </div>
            </div>
            <button className="primary-button sticky-action" disabled={fragments.length !== 3} onClick={() => setScreen("compress")}>
              <span>{fragments.length === 3 ? "证据齐全，开始处理" : `还需选择 ${3 - fragments.length} 块`}</span><b>→</b>
            </button>
          </div>
        )}

        {screen === "compress" && issue && (
          <div className="screen center-screen enter-up">
            <button className="back-button" onClick={() => { stopCompress(); setScreen("fragments"); }} aria-label="返回">←</button>
            <div className="section-heading compact-heading">
              <p className="eyebrow">STEP 03 / 故障压缩</p>
              <h2>把这段霉运<br />压缩打包</h2>
              <p>按住它，把这口锅完整还给宇宙。</p>
            </div>
            <div className={`compressor ${holding ? "is-active" : ""} ${compression >= 100 ? "is-done" : ""}`}>
              <div className="compress-orbit orbit-a" />
              <div className="compress-orbit orbit-b" />
              <button
                className="error-core"
                onPointerDown={startCompress}
                onPointerUp={stopCompress}
                onPointerCancel={stopCompress}
                onPointerLeave={stopCompress}
                onClick={() => {
                  if (compression >= 100) return;
                  setCompression((value) => {
                    const next = Math.min(100, value + 18);
                    if (next >= 100 && navigator.vibrate) navigator.vibrate([20, 30, 20]);
                    return next;
                  });
                }}
                onKeyDown={(event) => { if ((event.key === " " || event.key === "Enter") && !holding) startCompress(); }}
                onKeyUp={(event) => { if (event.key === " " || event.key === "Enter") stopCompress(); }}
                aria-label="长按压缩故障"
              >
                <span className="core-character" style={{ transform: `scale(${1 - compression * 0.0032})` }}>
                  <i className="core-brow brow-left" />
                  <i className="core-brow brow-right" />
                  <i className="core-eye core-eye-left" />
                  <i className="core-eye core-eye-right" />
                  <i className="core-mouth" />
                  <b>{compression >= 100 ? "好啦" : holding ? "别松" : "按住"}</b>
                </span>
              </button>
              <div className="compression-value"><b>{Math.round(compression)}</b><span>%</span></div>
            </div>
            <div className="compression-status">
              <span>{compression < 25 ? "正在检测是谁的问题…" : compression < 55 ? "正在排除你的责任…" : compression < 85 ? "正在联系有权限的星球…" : compression < 100 ? "对方星球拒绝接听…" : "压缩完成，可以正式索赔。"}</span>
              <div><i style={{ width: `${compression}%` }} /></div>
            </div>
            {compression < 100 ? (
              <p className="hold-hint"><span className="finger-mark">◎</span> 按住，或连续点击中央故障球</p>
            ) : (
              <button className="primary-button sticky-action" onClick={() => setScreen("stamp")}><span>提交至盖章窗口</span><b>→</b></button>
            )}
          </div>
        )}

        {screen === "stamp" && (
          <div className="screen center-screen enter-up">
            <button className="back-button" onClick={() => { setStamp(""); setScreen("compress"); }} aria-label="返回">←</button>
            <div className="section-heading compact-heading">
              <p className="eyebrow">STEP 04 / 正式索赔</p>
              <h2>抓住时机<br />盖下受理章</h2>
              <p>瞄准彩色区域，售后员会帮你加急。</p>
            </div>
            <div className={`stamp-machine ${stamp ? "stamped" : ""}`}>
              <div className="stamp-paper">
                <span>宇宙故障索赔申请</span>
                <i />
                <i />
                <i />
                {stamp && <b>{stamp}</b>}
              </div>
              <button className="stamp-handle" onClick={applyStamp} aria-label="盖章">
                <span>按下</span>
              </button>
            </div>
            <div className="timing-meter">
              <div className="target-zone" />
              <i style={{ left: `${stampPosition}%` }} />
            </div>
            <p className="meter-caption">{stamp ? `盖章成功 · ${stamp}` : "点击红色手柄盖章"}</p>
            <button className="primary-button sticky-action" disabled={!stamp} onClick={() => setScreen("processing")}>
              <span>正式提交工单</span><b>→</b>
            </button>
          </div>
        )}

        {screen === "processing" && (
          <div className="screen processing-screen">
            <div className="processing-console">
              <div className="scanner-disc"><span className="scanner-clerk"><i /></span></div>
              <p className="eyebrow">SYSTEM PROCESSING</p>
              <h2>宇宙正在处理<br />你的投诉</h2>
              <div className="console-lines">
                {PROCESS_MESSAGES.map((message, index) => (
                  <p key={message} className={index <= processIndex ? "visible" : ""}><span>{index < processIndex ? "✓" : index === processIndex ? "›" : "·"}</span>{message}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {screen === "result" && result && (
          <div className="screen result-screen enter-up">
            <div className="result-topline">
              <span className="success-pill">● 已受理</span>
              <span>{result.id}</span>
            </div>
            <div className="receipt">
              <div className="receipt-teeth top-teeth" />
              <div className="receipt-head">
                <p>UNIVERSE SERVICE / 07</p>
                <h2>宇宙售后工单</h2>
                <span>处理时间 {result.date} · 窗口 07</span>
              </div>
              <div className="receipt-section fault-section">
                <label>故障判定</label>
                <h3>{result.fault}</h3>
                <p><span>严重等级</span><b>{result.level}</b></p>
                <div className="fragment-tags">{result.fragments.map((item) => <i key={item}>{item}</i>)}</div>
              </div>
              <div className="receipt-section">
                <label>责任划分</label>
                <div className="responsibility-bar">
                  <i className="universe-part" style={{ width: `${result.universe}%` }} />
                  <i className="others-part" style={{ width: `${result.others}%` }} />
                  <i className="self-part" style={{ width: `${result.self}%` }} />
                </div>
                <div className="responsibility-labels">
                  <span><i className="dot green" />宇宙 <b>{result.universe}%</b></span>
                  <span><i className="dot yellow" />他人 <b>{result.others}%</b></span>
                  <span><i className="dot cream" />你 <b>{result.self}%</b></span>
                </div>
              </div>
              <div className="receipt-section compensation-section">
                <label>赔偿方案</label>
                {result.compensation.map((item, index) => <p key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</p>)}
              </div>
              <div className="receipt-section advice-section">
                <label>售后建议</label>
                <p>“{result.advice}”</p>
                <span>— 售后专员 U-404</span>
              </div>
              <div className="result-stamp">{result.stamp}</div>
              <div className="barcode" aria-hidden="true" />
              <p className="receipt-footer">经检测，这件事确实不能全怪你。</p>
              <div className="receipt-teeth bottom-teeth" />
            </div>
            <div className="result-actions">
              <button className="primary-button" onClick={shareResult}><span>分享给需要售后的人</span><b>↗</b></button>
              <button className="secondary-button" onClick={() => { downloadResultCard(result); setToast("赔偿单已经生成"); }}>保存赔偿单</button>
              <button className="text-button" onClick={reset}>再投诉一次宇宙</button>
            </div>
          </div>
        )}

        {screen === "archive" && (
          <div className="screen archive-screen enter-up">
            <button className="back-button" onClick={() => setScreen("welcome")} aria-label="返回">←</button>
            <div className="section-heading">
              <p className="eyebrow">LOCAL ARCHIVE</p>
              <h2>我的售后<br />档案</h2>
              <p>仅保存在当前设备。宇宙没有权限查看。</p>
            </div>
            <div className="archive-list">
              {archive.map((item) => (
                <button key={`${item.id}-${item.date}`} onClick={() => { setResult(item); setScreen("result"); }}>
                  <span><i>已受理</i>{item.date}</span>
                  <b>{item.fault}</b>
                  <small>{item.id} · {item.stamp}</small>
                  <em>→</em>
                </button>
              ))}
            </div>
            <button className="primary-button sticky-action" onClick={reset}><span>发起新的投诉</span><b>＋</b></button>
          </div>
        )}

        {toast && <div className="toast" role="status">{toast}</div>}
      </section>
    </main>
  );
}
