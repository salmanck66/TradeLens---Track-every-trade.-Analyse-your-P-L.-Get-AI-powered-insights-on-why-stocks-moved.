"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useMemo, useEffect, useCallback } from "react";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#0a0a0f;--glass:rgba(255,255,255,.045);--gb:rgba(255,255,255,.10);
    --ghov:rgba(255,255,255,.07);
    --green:#30d158;--greenglow:rgba(48,209,88,.22);
    --red:#ff453a;--redglow:rgba(255,69,58,.2);
    --blue:#0a84ff;--blueglow:rgba(10,132,255,.2);
    --gold:#ffd60a;--purple:#bf5af2;
    --t1:#f5f5f7;--t2:rgba(255,255,255,.55);--t3:rgba(255,255,255,.3);
    --sep:rgba(255,255,255,.07);--r:18px;--rs:12px;--rx:8px;
  }
  body{background:var(--bg);font-family:'Inter',-apple-system,sans-serif;color:var(--t1);-webkit-font-smoothing:antialiased}
  body::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
    background:radial-gradient(ellipse 80% 50% at 15% 0%,rgba(48,209,88,.07) 0%,transparent 55%),
    radial-gradient(ellipse 60% 50% at 85% 100%,rgba(10,132,255,.05) 0%,transparent 55%),
    radial-gradient(ellipse 50% 40% at 50% 50%,rgba(191,90,242,.03) 0%,transparent 65%)}
  .wrap{position:relative;z-index:1;min-height:100vh;max-width:1300px;margin:0 auto;padding:18px 14px 0;display:flex;flex-direction:column}
  .g{background:var(--glass);backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);border:1px solid var(--gb);border-radius:var(--r)}
  .gs{border-radius:var(--rs)} .gx{border-radius:var(--rx)}

  /* LOGIN */
  .login-wrap{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:20px;background:var(--bg);z-index:100}
  .login-card{width:100%;max-width:360px;padding:36px 28px;text-align:center}
  .login-logo{font-size:2rem;font-weight:800;letter-spacing:-.04em;background:linear-gradient(135deg,#fff,rgba(255,255,255,.55));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .login-sub{font-size:.68rem;color:var(--t3);letter-spacing:.08em;text-transform:uppercase;margin:4px 0 24px}
  .login-desc{font-size:.8rem;color:var(--t2);line-height:1.65;margin-bottom:28px}
  .login-btns{display:flex;flex-direction:column;gap:10px;margin-bottom:20px}
  .btn-goo{display:flex;align-items:center;justify-content:center;gap:10px;padding:13px;background:#fff;color:#111;font-size:.85rem;font-weight:700;border:none;border-radius:var(--rs);cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif}
  .btn-goo:hover{opacity:.88;transform:translateY(-1px);box-shadow:0 8px 28px rgba(255,255,255,.12)}
  .btn-ghb{display:flex;align-items:center;justify-content:center;gap:10px;padding:13px;background:rgba(255,255,255,.08);color:var(--t1);font-size:.85rem;font-weight:700;border:1px solid rgba(255,255,255,.12);border-radius:var(--rs);cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif}
  .btn-ghb:hover{background:rgba(255,255,255,.12);transform:translateY(-1px)}
  .login-note{font-size:.6rem;color:var(--t3);line-height:1.7}

  /* HEADER */
  .hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;margin-bottom:14px;gap:10px;flex-wrap:wrap}
  .logo{font-size:1.3rem;font-weight:800;letter-spacing:-.04em;background:linear-gradient(135deg,#fff,rgba(255,255,255,.55));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .logo-s{font-size:.58rem;color:var(--t3);letter-spacing:.07em;text-transform:uppercase;margin-top:2px}
  .hdr-r{display:flex;align-items:center;gap:8px}
  .live-pill{display:flex;align-items:center;gap:5px;background:rgba(48,209,88,.1);border:1px solid rgba(48,209,88,.25);border-radius:20px;padding:4px 11px;font-size:.62rem;color:var(--green);font-weight:600}
  .live-dot{width:5px;height:5px;border-radius:50%;background:var(--green);animation:pulse 2s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
  .upill{display:flex;align-items:center;gap:7px;background:rgba(255,255,255,.06);border:1px solid var(--gb);border-radius:20px;padding:5px 11px 5px 5px}
  .uavatar{width:24px;height:24px;border-radius:50%;object-fit:cover;border:1px solid var(--gb)}
  .uname{font-size:.65rem;font-weight:600;color:var(--t2);max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .btn-out{font-size:.6rem;padding:4px 10px;border-radius:20px;background:rgba(255,69,58,.1);border:1px solid rgba(255,69,58,.2);color:var(--red);cursor:pointer;font-weight:600;font-family:'Inter',sans-serif;transition:all .2s}
  .btn-out:hover{background:rgba(255,69,58,.2)}

  /* STATS */
  .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:12px}
  .sc{padding:13px;display:flex;flex-direction:column;gap:3px}
  .sl{font-size:.56rem;color:var(--t3);letter-spacing:.08em;text-transform:uppercase;font-weight:600}
  .sv{font-size:1.15rem;font-weight:800;letter-spacing:-.03em;font-family:'JetBrains Mono',monospace}
  .ss{font-size:.56rem;color:var(--t3)}
  .cg{color:var(--green)}.cr{color:var(--red)}.co{color:var(--gold)}.cw{color:var(--t1)}

  /* FORM */
  .fp{padding:16px;margin-bottom:12px}
  .stitle{font-size:.65rem;font-weight:700;color:var(--t3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:11px;display:flex;align-items:center;gap:7px}
  .fg4{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:7px}
  .fg4b{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:11px}
  .fld{display:flex;flex-direction:column;gap:4px}
  .fld label{font-size:.54rem;font-weight:700;color:var(--t3);letter-spacing:.06em;text-transform:uppercase}
  .opt{font-size:.46rem;opacity:.65;font-weight:400}
  .fld input,.fld select{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09);color:var(--t1);font-family:'JetBrains Mono',monospace;font-size:.76rem;padding:9px 10px;border-radius:var(--rx);outline:none;transition:border-color .2s,background .2s;width:100%;-webkit-appearance:none}
  .fld input::placeholder{color:var(--t3)}
  .fld input:focus,.fld select:focus{border-color:rgba(48,209,88,.5);background:rgba(48,209,88,.04)}
  .fld select option{background:#1a1a2e}
  .btn-add{width:100%;padding:12px;background:var(--green);color:#0a0a0f;font-size:.8rem;font-weight:700;border:none;border-radius:var(--rs);cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif}
  .btn-add:hover:not(:disabled){opacity:.87;transform:translateY(-1px);box-shadow:0 8px 22px var(--greenglow)}
  .btn-add:disabled{opacity:.45;cursor:not-allowed}

  /* CHART */
  .chp{padding:16px;margin-bottom:12px}
  .bars{display:flex;align-items:flex-end;gap:7px;height:100px;margin-top:8px}
  .bcol{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:100%;justify-content:flex-end}
  .bar{width:100%;border-radius:5px 5px 0 0;min-height:3px;position:relative;cursor:pointer;transition:opacity .15s}
  .bar:hover{opacity:.72}
  .bar:hover::after{content:attr(data-t);position:absolute;bottom:calc(100% + 5px);left:50%;transform:translateX(-50%);background:rgba(0,0,0,.88);backdrop-filter:blur(10px);color:var(--t1);font-size:.58rem;padding:3px 8px;border-radius:5px;white-space:nowrap;z-index:10;border:1px solid var(--gb);pointer-events:none}
  .bl{font-size:.5rem;color:var(--t3);text-align:center;font-weight:600}

  /* LOG */
  .lp{padding:16px;margin-bottom:12px}
  .lhdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px;flex-wrap:wrap;gap:7px}
  .frw{display:flex;gap:5px;flex-wrap:wrap}
  .fb{font-size:.58rem;padding:4px 10px;border-radius:20px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07);color:var(--t3);cursor:pointer;font-weight:600;letter-spacing:.04em;transition:all .2s;font-family:'Inter',sans-serif}
  .fb.on{background:var(--green);color:#0a0a0f;border-color:var(--green)}
  .tbl-wrap{overflow-x:auto}
  table{width:100%;border-collapse:collapse;font-size:.68rem;min-width:660px}
  th{text-align:left;color:var(--t3);font-size:.54rem;letter-spacing:.08em;text-transform:uppercase;font-weight:700;padding:7px 9px;border-bottom:1px solid var(--sep)}
  td{padding:9px;border-bottom:1px solid var(--sep);vertical-align:middle}
  tbody tr:last-child td{border-bottom:none}
  tbody tr:hover td{background:var(--ghov)}
  .mcards{display:none;flex-direction:column;gap:8px}
  .mcard{padding:13px;display:flex;flex-direction:column;gap:7px}
  .mctop{display:flex;align-items:flex-start;justify-content:space-between}
  .mcsym{font-size:.96rem;font-weight:800}
  .mcdate{font-size:.58rem;color:var(--t3);margin-top:2px}
  .mcpl{font-size:1rem;font-weight:800;font-family:'JetBrains Mono',monospace}
  .mcrow{display:flex;gap:5px;flex-wrap:wrap}
  .mpill{font-size:.56rem;font-weight:600;padding:2px 7px;border-radius:5px;font-family:'JetBrains Mono',monospace}
  .mcact{display:flex;gap:5px;justify-content:flex-end}
  .bdg{display:inline-block;font-size:.54rem;padding:2px 7px;border-radius:5px;font-weight:700;letter-spacing:.04em}
  .bw{background:rgba(48,209,88,.12);color:var(--green);border:1px solid rgba(48,209,88,.2)}
  .bl2{background:rgba(255,69,58,.12);color:var(--red);border:1px solid rgba(255,69,58,.2)}
  .bo{background:rgba(255,214,10,.12);color:var(--gold);border:1px solid rgba(255,214,10,.2)}
  .blo{background:rgba(48,209,88,.09);color:var(--green);border:1px solid rgba(48,209,88,.15)}
  .bsh{background:rgba(255,69,58,.09);color:var(--red);border:1px solid rgba(255,69,58,.15)}
  .ab{font-size:.58rem;padding:4px 8px;border-radius:var(--rx);font-weight:600;cursor:pointer;border:none;font-family:'Inter',sans-serif;transition:all .15s}
  .ae{background:rgba(10,132,255,.14);color:var(--blue);border:1px solid rgba(10,132,255,.22)}
  .ae:hover{background:rgba(10,132,255,.24)}
  .aa{background:rgba(191,90,242,.14);color:var(--purple);border:1px solid rgba(191,90,242,.22)}
  .aa:hover{background:rgba(191,90,242,.24)}
  .ad{background:rgba(255,69,58,.1);color:var(--red);border:1px solid rgba(255,69,58,.2)}
  .ad:hover{background:rgba(255,69,58,.2)}

  /* MODALS */
  .mov{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.65);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);display:flex;align-items:flex-end;animation:fi .2s ease}
  @media(min-width:580px){.mov{align-items:center;justify-content:center}}
  @keyframes fi{from{opacity:0}to{opacity:1}}
  .mbox{background:rgba(18,18,30,.96);backdrop-filter:blur(40px) saturate(200%);-webkit-backdrop-filter:blur(40px) saturate(200%);border:1px solid rgba(255,255,255,.11);border-radius:22px 22px 0 0;padding:20px 16px 28px;width:100%;max-width:500px;animation:su .28s cubic-bezier(.34,1.56,.64,1)}
  @media(min-width:580px){.mbox{border-radius:22px;padding:24px}}
  @keyframes su{from{transform:translateY(36px);opacity:0}to{transform:translateY(0);opacity:1}}
  .mhdl{width:34px;height:4px;border-radius:2px;background:rgba(255,255,255,.18);margin:0 auto 16px}
  .mtitle{font-size:.92rem;font-weight:800;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between}
  .mclose{width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);color:var(--t2);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.9rem}
  .mgrid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:13px}
  .mact{display:flex;flex-direction:column;gap:7px}
  .bsave{width:100%;padding:12px;background:var(--blue);color:#fff;font-size:.8rem;font-weight:700;border:none;border-radius:var(--rs);cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif}
  .bsave:hover:not(:disabled){opacity:.87;box-shadow:0 8px 22px var(--blueglow)}
  .bsave:disabled{opacity:.45;cursor:not-allowed}
  .bcan{width:100%;padding:11px;background:rgba(255,255,255,.05);color:var(--t2);font-size:.78rem;font-weight:600;border:1px solid rgba(255,255,255,.08);border-radius:var(--rs);cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif}
  .bcan:hover{background:rgba(255,255,255,.09)}

  /* PAID AI MODAL */
  .paid-emoji{font-size:3rem;text-align:center;margin-bottom:10px}
  .paid-h{font-size:1.1rem;font-weight:800;text-align:center;margin-bottom:6px}
  .paid-sub{font-size:.76rem;color:var(--t2);text-align:center;line-height:1.65;margin-bottom:22px}
  .paid-list{display:flex;flex-direction:column;gap:9px;margin-bottom:22px}
  .paid-row{display:flex;align-items:center;gap:10px;font-size:.75rem;color:var(--t2)}
  .paid-ic{width:30px;height:30px;border-radius:9px;background:rgba(48,209,88,.1);border:1px solid rgba(48,209,88,.2);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
  .btn-wa{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px;background:#25D366;color:#fff;font-size:.88rem;font-weight:800;border:none;border-radius:var(--rs);cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif;text-decoration:none;margin-bottom:10px}
  .btn-wa:hover{opacity:.88;transform:translateY(-1px);box-shadow:0 8px 24px rgba(37,211,102,.35)}
  .paid-note{font-size:.58rem;color:var(--t3);text-align:center;line-height:1.7}

  /* MARKET */
  .mkgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  @media(max-width:680px){.mkgrid{grid-template-columns:1fr}}
  .mkp{padding:15px}
  .mkh{display:flex;align-items:center;gap:7px;margin-bottom:11px;flex-wrap:wrap}
  .mkt{font-size:.65rem;font-weight:700;color:var(--t3);letter-spacing:.08em;text-transform:uppercase}
  .badge{font-size:.46rem;padding:2px 6px;border-radius:4px;font-weight:700}
  .badge-g{background:rgba(48,209,88,.12);color:var(--green);border:1px solid rgba(48,209,88,.2)}
  .badge-b{background:rgba(10,132,255,.12);color:var(--blue);border:1px solid rgba(10,132,255,.2)}
  .badge-r{background:rgba(255,69,58,.12);color:var(--red);border:1px solid rgba(255,69,58,.2)}
  .bref{margin-left:auto;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);color:var(--t3);font-size:.56rem;padding:3px 9px;border-radius:20px;cursor:pointer;font-family:'Inter',sans-serif;font-weight:600;transition:all .2s}
  .bref:hover{border-color:var(--green);color:var(--green)}
  .bref:disabled{opacity:.38;cursor:not-allowed}
  .lupd{font-size:.5rem;color:var(--t3)}

  /* STOCKS */
  .grow{display:flex;align-items:center;padding:8px 0;border-bottom:1px solid var(--sep)}
  .grow:last-child{border-bottom:none}
  .grk{font-size:.54rem;color:var(--t3);font-weight:700;width:18px;flex-shrink:0;text-align:center}
  .gri{flex:1;margin-left:8px}
  .grsym{font-size:.74rem;font-weight:800;display:flex;align-items:center;gap:5px}
  .grn{font-size:.52rem;color:var(--t3);margin-top:1px}
  .grr{text-align:right}
  .grpct{font-size:.82rem;font-weight:800;font-family:'JetBrains Mono',monospace}
  .grpr{font-size:.52rem;color:var(--t3);font-family:'JetBrains Mono',monospace}
  .ys-tag{font-size:.44rem;padding:1px 5px;border-radius:4px;font-weight:800;background:linear-gradient(135deg,rgba(255,214,10,.22),rgba(255,214,10,.08));color:var(--gold);border:1px solid rgba(255,214,10,.3)}

  /* NEWS */
  .ni{padding:10px 0;border-bottom:1px solid var(--sep);cursor:pointer;transition:padding-left .15s}
  .ni:last-child{border-bottom:none}
  .ni:hover{padding-left:4px}
  .ni-tags{display:flex;gap:5px;margin-bottom:4px;flex-wrap:wrap;align-items:center}
  .ntag{display:inline-block;font-size:.46rem;padding:2px 6px;border-radius:4px;text-transform:uppercase;letter-spacing:.07em;font-weight:700}
  .nys{font-size:.46rem;padding:2px 7px;border-radius:4px;font-weight:800;background:linear-gradient(135deg,rgba(255,214,10,.22),rgba(255,214,10,.08));color:var(--gold);border:1px solid rgba(255,214,10,.3)}
  .tr2{background:rgba(48,209,88,.11);color:var(--green)}
  .to2{background:rgba(191,90,242,.11);color:var(--purple)}
  .tp2{background:rgba(255,214,10,.11);color:var(--gold)}
  .tm2{background:rgba(255,69,58,.11);color:var(--red)}
  .ti2{background:rgba(10,132,255,.11);color:var(--blue)}
  .nhl{font-size:.7rem;line-height:1.45;color:var(--t1);margin-bottom:3px}
  .nm{font-size:.52rem;color:var(--t3);display:flex;gap:6px;align-items:center}
  .nm a{color:var(--blue);text-decoration:none;font-size:.48rem}
  .nm a:hover{text-decoration:underline}
  .news-pgn{display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:10px;border-top:1px solid var(--sep)}
  .pgn-btn{font-size:.62rem;padding:5px 14px;border-radius:20px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:var(--t2);cursor:pointer;font-family:'Inter',sans-serif;font-weight:600;transition:all .2s}
  .pgn-btn:hover:not(:disabled){background:rgba(255,255,255,.1);border-color:var(--green);color:var(--green)}
  .pgn-btn:disabled{opacity:.28;cursor:not-allowed}
  .pgn-info{font-size:.58rem;color:var(--t3)}

  .sk{border-radius:var(--rx);background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.07) 50%,rgba(255,255,255,.04) 75%);background-size:200% 100%;animation:sh 1.5s infinite}
  @keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}}
  .toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:rgba(18,18,30,.96);border:1px solid rgba(255,255,255,.11);border-radius:11px;padding:9px 16px;font-size:.72rem;font-weight:600;color:var(--t1);backdrop-filter:blur(20px);z-index:999;animation:tin .25s ease;white-space:nowrap}
  .toast.ok{border-color:rgba(48,209,88,.38);color:var(--green)}
  .toast.err{border-color:rgba(255,69,58,.38);color:var(--red)}
  @keyframes tin{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}
  .spin{width:15px;height:15px;border:2px solid rgba(255,255,255,.1);border-top-color:var(--purple);border-radius:50%;animation:sp .8s linear infinite;flex-shrink:0}
  @keyframes sp{to{transform:rotate(360deg)}}
  .div{display:flex;align-items:center;gap:11px;margin:16px 0 12px}
  .dl{flex:1;height:1px;background:var(--sep)}
  .dt{font-size:.58rem;font-weight:700;color:var(--t3);letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}
  .foot{margin-top:auto;padding:18px 0 16px;text-align:center;border-top:1px solid var(--sep)}
  .foot p{font-size:.58rem;color:var(--t3);line-height:1.7}
  .foot a{color:var(--green);text-decoration:none;font-weight:600}
  .foot a:hover{text-decoration:underline}

  @media(max-width:680px){
    .wrap{padding:11px 10px 0}
    .stats{grid-template-columns:repeat(2,1fr);gap:7px}
    .sv{font-size:1rem}
    .fg4,.fg4b{grid-template-columns:repeat(2,1fr)}
    .tbl-wrap{display:none}
    .mcards{display:flex}
    .lhdr{flex-direction:column;align-items:flex-start}
    .hdr-r{gap:5px}
    .uname{display:none}
  }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const MO = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const fmt = (n) => {
  if (n == null) return "—";
  const a = Math.abs(n);
  const s =
    a >= 100000
      ? `${(a / 100000).toFixed(2)}L`
      : a >= 1000
        ? `${(a / 1000).toFixed(2)}K`
        : a.toFixed(2);
  return (n < 0 ? "-₹" : "₹") + s;
};
function useToast() {
  const [t, setT] = useState(null);
  const show = useCallback((msg, type = "ok") => {
    setT({ msg, type });
    setTimeout(() => setT(null), 2600);
  }, []);
  return [t, show];
}

const TAG = {
  results: "tr2",
  order: "to2",
  policy: "tp2",
  ipo: "ti2",
  market: "tm2",
};

// ─── PAID AI MODAL ────────────────────────────────────────────────────────────
function PaidAI({ trade, onClose }) {
  const msg = `Hi! I want to enable the AI analysis feature on TradeLens for ${trade?.symbol || "my trades"}.`;
  const wa = `https://wa.me/919947937009?text=${encodeURIComponent(msg)}`;
  return (
    <div
      className="mov"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mbox">
        <div className="mhdl" />
        <div className="paid-emoji">🔒</div>
        <div className="paid-h">AI Analysis — Premium Feature</div>
        <div className="paid-sub">
          Get deep AI-powered insights for every trade. Contact the developer on
          WhatsApp to activate.
        </div>
        <div className="paid-list">
          <div className="paid-row">
            <div className="paid-ic">📊</div>
            <span>Why the stock moved for or against you</span>
          </div>
          <div className="paid-row">
            <div className="paid-ic">🛡️</div>
            <span>Full risk management review</span>
          </div>
          <div className="paid-row">
            <div className="paid-ic">💡</div>
            <span>Key lessons & trade improvement tips</span>
          </div>
          <div className="paid-row">
            <div className="paid-ic">📰</div>
            <span>Live news & factors for open positions</span>
          </div>
        </div>
        <a
          className="btn-wa"
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Contact Developer on WhatsApp
        </a>
        <div className="paid-note">
          +91 99479 37009 · Fast reply · One-time activation
        </div>
        <button className="bcan" style={{ marginTop: 10 }} onClick={onClose}>
          Maybe Later
        </button>
      </div>
    </div>
  );
}

// ─── MARKET SECTION ──────────────────────────────────────────────────────────
function Market({ portfolioSymbols }) {
  const [stocks, setStocks] = useState([]);
  const [news, setNews] = useState([]);
  const [ldS, setLdS] = useState(false);
  const [ldN, setLdN] = useState(false);
  const [nseOk, setNseOk] = useState(false);
  const [upd, setUpd] = useState(null);
  const [errS, setErrS] = useState(null);
  const [errN, setErrN] = useState(null);
  const [page, setPage] = useState(1);
  const [totPg, setTotPg] = useState(1);

  async function loadStocks() {
    setLdS(true);
    setErrS(null);
    try {
      const r = await fetch("/api/nse");
      const d = await r.json();
      if (d.ok && d.stocks.length) {
        setStocks(d.stocks);
        setNseOk(true);
        setUpd(
          new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        );
      } else throw new Error(d.error || "No data");
    } catch {
      setErrS(
        "NSE data unavailable — market may be closed (Mon–Fri 9:15–3:30 IST).",
      );
      setNseOk(false);
    }
    setLdS(false);
  }

  async function loadNews(p = 1) {
    setLdN(true);
    setErrN(null);
    try {
      const sym = portfolioSymbols.join(",");
      const r = await fetch(
        `/api/rss?page=${p}&symbols=${encodeURIComponent(sym)}`,
      );
      const d = await r.json();
      setNews(d.news || []);
      setPage(d.page || p);
      setTotPg(d.totalPages || 1);
    } catch {
      setErrN("Couldn't load news. Check internet connection.");
    }
    setLdN(false);
  }

  useEffect(() => {
    loadStocks();
    loadNews(1);
  }, []);
  // Reload news when portfolio changes (new trade added)
  useEffect(() => {
    loadNews(1);
  }, [portfolioSymbols.join(",")]);

  return (
    <div>
      <div className="div">
        <div className="dl" />
        <span className="dt">📡 Market Intelligence</span>
        <div className="dl" />
      </div>
      <div className="mkgrid">
        {/* NSE Gainers & Losers */}
        <div className="g gs mkp">
          <div className="mkh">
            <span className="mkt">Top Gainers & Losers</span>
            <span className={`badge ${nseOk ? "badge-b" : "badge-g"}`}>
              {nseOk ? "NSE Live" : "NSE India"}
            </span>
            {upd && <span className="lupd">{upd}</span>}
            <button className="bref" onClick={loadStocks} disabled={ldS}>
              {ldS ? "..." : "↻"}
            </button>
          </div>
          {ldS ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="sk"
                style={{ height: 44, marginBottom: 6 }}
              />
            ))
          ) : errS ? (
            <p
              style={{
                fontSize: ".7rem",
                color: "var(--t3)",
                lineHeight: 1.7,
                padding: "8px 0",
              }}
            >
              {errS}
            </p>
          ) : (
            stocks.map((s, i) => {
              const isYours = portfolioSymbols.includes(s.symbol);
              return (
                <div className="grow" key={i}>
                  <div className="grk">
                    {s.type === "loser" ? "▼" : `#${i + 1}`}
                  </div>
                  <div className="gri">
                    <div className="grsym">
                      {s.symbol}
                      {isYours && <span className="ys-tag">YOUR STOCK</span>}
                    </div>
                    <div className="grn">
                      {s.name} · {s.sector}
                    </div>
                  </div>
                  <div className="grr">
                    <div className={`grpct ${s.change >= 0 ? "cg" : "cr"}`}>
                      {s.change >= 0 ? "▲" : "▼"}{" "}
                      {Math.abs(s.change).toFixed(2)}%
                    </div>
                    <div className="grpr">
                      ₹
                      {Number(s.price).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* News with Your Stock + Prev/Next */}
        <div className="g gs mkp">
          <div className="mkh">
            <span className="mkt">Market News</span>
            <span className="badge badge-g">RSS • Free</span>
            {portfolioSymbols.length > 0 && (
              <span className="badge badge-r">⭐ Stocks Matched</span>
            )}
            <button className="bref" onClick={() => loadNews(1)} disabled={ldN}>
              {ldN ? "..." : "↻"}
            </button>
          </div>

          {ldN ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="sk"
                style={{ height: 54, marginBottom: 6 }}
              />
            ))
          ) : errN ? (
            <p
              style={{
                fontSize: ".7rem",
                color: "var(--t3)",
                padding: "8px 0",
              }}
            >
              {errN}
            </p>
          ) : news.length === 0 ? (
            <p
              style={{
                fontSize: ".7rem",
                color: "var(--t3)",
                padding: "8px 0",
              }}
            >
              No news found. Try refreshing.
            </p>
          ) : (
            news.map((n, i) => (
              <div
                className="ni"
                key={i}
                onClick={() =>
                  n.link && n.link !== "#" && window.open(n.link, "_blank")
                }
              >
                <div className="ni-tags">
                  {n.yourStock && <span className="nys">⭐ Your Stock</span>}
                  <span className={`ntag ${TAG[n.category] || "tm2"}`}>
                    {n.category}
                  </span>
                </div>
                <div className="nhl">{n.headline}</div>
                <div className="nm">
                  <span>{n.source}</span>
                  <span>·</span>
                  <span>{n.time}</span>
                  {n.link && n.link !== "#" && (
                    <a
                      href={n.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ↗ Read
                    </a>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Prev / Next */}
          {!ldN && !errN && totPg > 1 && (
            <div className="news-pgn">
              <button
                className="pgn-btn"
                disabled={page <= 1}
                onClick={() => loadNews(page - 1)}
              >
                ← Prev
              </button>
              <span className="pgn-info">
                Page {page} of {totPg}
              </span>
              <button
                className="pgn-btn"
                disabled={page >= totPg}
                onClick={() => loadNews(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login() {
  return (
    <div className="login-wrap">
      <div className="g login-card">
        <div className="login-logo">TradeLens</div>
        <div className="login-sub">P/L Analyzer + AI Insights</div>
        <div className="login-desc">
          Track trades, analyse P/L, and get AI-powered market insights. Data
          saved securely in the cloud.
        </div>
        <div className="login-btns">
          <button className="btn-goo" onClick={() => signIn("google")}>
            <svg width="17" height="17" viewBox="0 0 18 18">
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
          <button className="btn-ghb" onClick={() => signIn("github")}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>
        </div>
        <div className="login-note">
          Free forever · No credit card · Secured by NextAuth
        </div>
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
const DEF = {
  date: "",
  symbol: "",
  qty: "",
  entry: "",
  sl: "",
  tgt: "",
  exit: "",
  side: "LONG",
};

function App({ user }) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(DEF);
  const [saving, setSaving] = useState(false);
  const [filt, setFilt] = useState("ALL");
  const [editT, setEditT] = useState(null);
  const [ef, setEf] = useState({});
  const [efSav, setEfSav] = useState(false);
  const [paidT, setPaidT] = useState(null); // paid AI modal
  const [toast, showToast] = useToast();

  const portfolioSymbols = useMemo(
    () => [
      ...new Set(trades.map((t) => t.symbol?.toUpperCase()).filter(Boolean)),
    ],
    [trades],
  );

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/trades");
        const d = await r.json();
        setTrades(d.map((t) => ({ ...t, id: t._id })));
      } catch {
        showToast("Failed to load trades", "err");
      }
      setLoading(false);
    })();
  }, []);

  const enr = useMemo(
    () =>
      trades.map((t) => {
        const open = !t.exit;
        const pl = open
          ? null
          : (t.side === "LONG" ? t.exit - t.entry : t.entry - t.exit) * t.qty;
        const rr =
          t.tgt && t.sl
            ? (Math.abs(t.tgt - t.entry) / Math.abs(t.entry - t.sl)).toFixed(2)
            : null;
        return { ...t, pl, rr, open };
      }),
    [trades],
  );

  const closed = enr.filter((t) => !t.open);
  const totalPL = closed.reduce((s, t) => s + t.pl, 0);
  const wins = closed.filter((t) => t.pl > 0);
  const losses = closed.filter((t) => t.pl <= 0);
  const wr = closed.length
    ? Math.round((wins.length / closed.length) * 100)
    : 0;
  const avgW = wins.length
    ? wins.reduce((s, t) => s + t.pl, 0) / wins.length
    : 0;
  const avgL = losses.length
    ? losses.reduce((s, t) => s + t.pl, 0) / losses.length
    : 0;

  const monthly = useMemo(() => {
    const m = {};
    closed.forEach((t) => {
      const d = new Date(t.date);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      if (!m[k])
        m[k] = {
          label: `${MO[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`,
          pl: 0,
        };
      m[k].pl += t.pl;
    });
    return Object.values(m).slice(-8);
  }, [closed]);
  const mxA = Math.max(...monthly.map((m) => Math.abs(m.pl)), 1);

  const filtered = useMemo(() => {
    if (filt === "WIN") return enr.filter((t) => !t.open && t.pl > 0);
    if (filt === "LOSS") return enr.filter((t) => !t.open && t.pl <= 0);
    if (filt === "OPEN") return enr.filter((t) => t.open);
    return enr;
  }, [enr, filt]);

  async function add() {
    if (!form.date || !form.symbol || !form.qty || !form.entry)
      return showToast("Fill required fields", "err");
    setSaving(true);
    try {
      const r = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          symbol: form.symbol.toUpperCase(),
          qty: +form.qty,
          entry: +form.entry,
          sl: form.sl ? +form.sl : null,
          tgt: form.tgt ? +form.tgt : null,
          exit: form.exit ? +form.exit : null,
        }),
      });
      const d = await r.json();
      setTrades((p) => [{ ...d, id: d._id }, ...p]);
      setForm(DEF);
      showToast("Trade saved ✓");
    } catch {
      showToast("Failed to save", "err");
    }
    setSaving(false);
  }

  function openEdit(t) {
    setEditT(t);
    setEf({
      date: t.date,
      symbol: t.symbol,
      qty: String(t.qty),
      entry: String(t.entry),
      sl: t.sl ? String(t.sl) : "",
      tgt: t.tgt ? String(t.tgt) : "",
      exit: t.exit ? String(t.exit) : "",
      side: t.side,
    });
  }

  async function saveEdit() {
    if (!ef.date || !ef.symbol || !ef.qty || !ef.entry)
      return showToast("Fill required fields", "err");
    setEfSav(true);
    try {
      const r = await fetch(`/api/trades/${editT.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...ef,
          symbol: ef.symbol.toUpperCase(),
          qty: +ef.qty,
          entry: +ef.entry,
          sl: ef.sl ? +ef.sl : null,
          tgt: ef.tgt ? +ef.tgt : null,
          exit: ef.exit ? +ef.exit : null,
        }),
      });
      const d = await r.json();
      setTrades((p) =>
        p.map((t) => (t.id === editT.id ? { ...d, id: d._id } : t)),
      );
      setEditT(null);
      showToast("Updated ✓");
    } catch {
      showToast("Failed to update", "err");
    }
    setEfSav(false);
  }

  async function del(id) {
    try {
      await fetch(`/api/trades/${id}`, { method: "DELETE" });
      setTrades((p) => p.filter((t) => t.id !== id));
      showToast("Deleted");
    } catch {
      showToast("Failed to delete", "err");
    }
  }

  const F = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const E = (k, v) => setEf((p) => ({ ...p, [k]: v }));

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 10,
          color: "var(--t3)",
          fontSize: ".8rem",
        }}
      >
        <div className="spin" style={{ borderTopColor: "var(--green)" }} />
        Loading your trades...
      </div>
    );

  return (
    <>
      {/* Header */}
      <div className="g hdr">
        <div>
          <div className="logo">TradeLens</div>
          <div className="logo-s">P/L Analyzer + AI Insights</div>
        </div>
        <div className="hdr-r">
          <div className="live-pill">
            <div className="live-dot" />
            Live
          </div>
          <div className="upill">
            {user?.image && <img className="uavatar" src={user.image} alt="" />}
            <span className="uname">{user?.name?.split(" ")[0]}</span>
          </div>
          <button className="btn-out" onClick={() => signOut()}>
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="g gs sc">
          <div className="sl">Total P/L</div>
          <div className={`sv ${totalPL >= 0 ? "cg" : "cr"}`}>
            {fmt(totalPL)}
          </div>
          <div className="ss">{closed.length} closed</div>
        </div>
        <div className="g gs sc">
          <div className="sl">Win Rate</div>
          <div className="sv co">{wr}%</div>
          <div className="ss">
            {wins.length}W / {losses.length}L
          </div>
        </div>
        <div className="g gs sc">
          <div className="sl">Avg Win</div>
          <div className="sv cg">{fmt(avgW)}</div>
          <div className="ss">per trade</div>
        </div>
        <div className="g gs sc">
          <div className="sl">Avg Loss</div>
          <div className="sv cr">{fmt(avgL)}</div>
          <div className="ss">per trade</div>
        </div>
        <div className="g gs sc">
          <div className="sl">Trades</div>
          <div className="sv cw">{enr.length}</div>
          <div className="ss">total</div>
        </div>
        <div className="g gs sc">
          <div className="sl">Open</div>
          <div className="sv co">{enr.filter((t) => t.open).length}</div>
          <div className="ss">positions</div>
        </div>
      </div>

      {/* Add Trade */}
      <div className="g fp">
        <div className="stitle">＋ Add Trade</div>
        <div className="fg4">
          <div className="fld">
            <label>Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => F("date", e.target.value)}
            />
          </div>
          <div className="fld">
            <label>Symbol *</label>
            <input
              placeholder="RELIANCE"
              value={form.symbol}
              onChange={(e) => F("symbol", e.target.value)}
            />
          </div>
          <div className="fld">
            <label>Side</label>
            <select
              value={form.side}
              onChange={(e) => F("side", e.target.value)}
            >
              <option>LONG</option>
              <option>SHORT</option>
            </select>
          </div>
          <div className="fld">
            <label>Qty *</label>
            <input
              type="number"
              placeholder="10"
              value={form.qty}
              onChange={(e) => F("qty", e.target.value)}
            />
          </div>
        </div>
        <div className="fg4b">
          <div className="fld">
            <label>Entry ₹ *</label>
            <input
              type="number"
              placeholder="2400"
              value={form.entry}
              onChange={(e) => F("entry", e.target.value)}
            />
          </div>
          <div className="fld">
            <label>
              SL ₹ <span className="opt">(optional)</span>
            </label>
            <input
              type="number"
              placeholder="2350"
              value={form.sl}
              onChange={(e) => F("sl", e.target.value)}
            />
          </div>
          <div className="fld">
            <label>
              Target ₹ <span className="opt">(optional)</span>
            </label>
            <input
              type="number"
              placeholder="2500"
              value={form.tgt}
              onChange={(e) => F("tgt", e.target.value)}
            />
          </div>
          <div className="fld">
            <label>
              Exit ₹ <span className="opt">(blank=open)</span>
            </label>
            <input
              type="number"
              placeholder="2480"
              value={form.exit}
              onChange={(e) => F("exit", e.target.value)}
            />
          </div>
        </div>
        <button className="btn-add" onClick={add} disabled={saving}>
          {saving ? "Saving..." : "+ Add Trade"}
        </button>
      </div>

      {/* Chart */}
      <div className="g gs chp">
        <div className="stitle">Monthly P/L</div>
        {monthly.length === 0 ? (
          <p style={{ fontSize: ".72rem", color: "var(--t3)", paddingTop: 6 }}>
            No closed trades yet
          </p>
        ) : (
          <div className="bars">
            {monthly.map((m, i) => (
              <div className="bcol" key={i}>
                <div
                  className="bar"
                  data-t={`${m.label}: ${fmt(m.pl)}`}
                  style={{
                    height: `${(Math.abs(m.pl) / mxA) * 90}%`,
                    background: m.pl >= 0 ? "var(--green)" : "var(--red)",
                    opacity: 0.8,
                  }}
                />
                <div className="bl">{m.label.split(" ")[0]}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trade Log */}
      <div className="g gs lp">
        <div className="lhdr">
          <div className="stitle" style={{ margin: 0 }}>
            Trade Log
          </div>
          <div className="frw">
            {["ALL", "WIN", "LOSS", "OPEN"].map((f) => (
              <button
                key={f}
                className={`fb ${filt === f ? "on" : ""}`}
                onClick={() => setFilt(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop */}
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Symbol</th>
                <th>Side</th>
                <th>Qty</th>
                <th>Entry</th>
                <th>SL</th>
                <th>Target</th>
                <th>Exit</th>
                <th>P/L</th>
                <th>R:R</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={12}
                    style={{
                      textAlign: "center",
                      padding: "28px",
                      color: "var(--t3)",
                      fontSize: ".75rem",
                    }}
                  >
                    No trades found
                  </td>
                </tr>
              )}
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td
                    style={{
                      color: "var(--t3)",
                      fontFamily: "JetBrains Mono,monospace",
                    }}
                  >
                    {t.date}
                  </td>
                  <td style={{ fontWeight: 800 }}>{t.symbol}</td>
                  <td>
                    <span
                      className={`bdg ${t.side === "LONG" ? "blo" : "bsh"}`}
                    >
                      {t.side}
                    </span>
                  </td>
                  <td style={{ fontFamily: "JetBrains Mono,monospace" }}>
                    {t.qty}
                  </td>
                  <td style={{ fontFamily: "JetBrains Mono,monospace" }}>
                    ₹{t.entry?.toLocaleString("en-IN")}
                  </td>
                  <td
                    style={{
                      color: t.sl ? "var(--red)" : "var(--t3)",
                      fontFamily: "JetBrains Mono,monospace",
                    }}
                  >
                    {t.sl ? `₹${t.sl}` : "—"}
                  </td>
                  <td
                    style={{
                      color: t.tgt ? "var(--green)" : "var(--t3)",
                      fontFamily: "JetBrains Mono,monospace",
                    }}
                  >
                    {t.tgt ? `₹${t.tgt}` : "—"}
                  </td>
                  <td
                    style={{
                      color: t.exit ? "var(--t1)" : "var(--gold)",
                      fontFamily: "JetBrains Mono,monospace",
                    }}
                  >
                    {t.exit ? `₹${t.exit}` : "—"}
                  </td>
                  <td
                    style={{
                      fontWeight: 700,
                      color:
                        t.pl == null
                          ? "var(--gold)"
                          : t.pl >= 0
                            ? "var(--green)"
                            : "var(--red)",
                      fontFamily: "JetBrains Mono,monospace",
                    }}
                  >
                    {fmt(t.pl)}
                  </td>
                  <td
                    style={{
                      color: "var(--t3)",
                      fontFamily: "JetBrains Mono,monospace",
                    }}
                  >
                    {t.rr || "—"}
                  </td>
                  <td>
                    <span
                      className={`bdg ${t.open ? "bo" : t.pl >= 0 ? "bw" : "bl2"}`}
                    >
                      {t.open ? "OPEN" : t.pl >= 0 ? "WIN" : "LOSS"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="ab ae" onClick={() => openEdit(t)}>
                        ✏️ Edit
                      </button>
                      <button className="ab aa" onClick={() => setPaidT(t)}>
                        ✦ AI
                      </button>
                      <button className="ab ad" onClick={() => del(t.id)}>
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="mcards">
          {filtered.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "22px",
                color: "var(--t3)",
                fontSize: ".74rem",
              }}
            >
              No trades found
            </div>
          )}
          {filtered.map((t) => (
            <div key={t.id} className="g gx mcard">
              <div className="mctop">
                <div>
                  <div className="mcsym">{t.symbol}</div>
                  <div className="mcdate">
                    {t.date} · {t.qty} qty
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    className={`mcpl ${t.pl == null ? "co" : t.pl >= 0 ? "cg" : "cr"}`}
                  >
                    {fmt(t.pl)}
                  </div>
                  <span
                    className={`bdg ${t.open ? "bo" : t.pl >= 0 ? "bw" : "bl2"}`}
                    style={{ fontSize: ".5rem" }}
                  >
                    {t.open ? "OPEN" : t.pl >= 0 ? "WIN" : "LOSS"}
                  </span>
                </div>
              </div>
              <div className="mcrow">
                <span className={`mpill ${t.side === "LONG" ? "blo" : "bsh"}`}>
                  {t.side}
                </span>
                <span
                  className="mpill"
                  style={{
                    background: "rgba(255,255,255,.06)",
                    color: "var(--t3)",
                  }}
                >
                  ₹{t.entry}
                </span>
                {t.exit && (
                  <span
                    className="mpill"
                    style={{
                      background: "rgba(255,255,255,.06)",
                      color: "var(--t2)",
                    }}
                  >
                    Exit ₹{t.exit}
                  </span>
                )}
                {t.sl && <span className="mpill bl2">SL ₹{t.sl}</span>}
                {t.tgt && <span className="mpill bw">TGT ₹{t.tgt}</span>}
                {t.rr && (
                  <span
                    className="mpill"
                    style={{
                      background: "rgba(255,255,255,.06)",
                      color: "var(--t3)",
                    }}
                  >
                    R:R {t.rr}
                  </span>
                )}
              </div>
              <div className="mcact">
                <button className="ab ae" onClick={() => openEdit(t)}>
                  ✏️ Edit
                </button>
                <button className="ab aa" onClick={() => setPaidT(t)}>
                  ✦ AI
                </button>
                <button className="ab ad" onClick={() => del(t.id)}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Market portfolioSymbols={portfolioSymbols} />

      <div className="foot">
        <p>
          Built with ♥ for traders ·{" "}
          <a
            href="https://github.com/salmanck66"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/salmanck66
          </a>
        </p>
      </div>

      {/* Edit Modal */}
      {editT && (
        <div
          className="mov"
          onClick={(e) => e.target === e.currentTarget && setEditT(null)}
        >
          <div className="mbox">
            <div className="mhdl" />
            <div className="mtitle">
              <span>Edit {editT.symbol}</span>
              <button className="mclose" onClick={() => setEditT(null)}>
                ×
              </button>
            </div>
            <div className="mgrid">
              <div className="fld">
                <label>Date *</label>
                <input
                  type="date"
                  value={ef.date}
                  onChange={(e) => E("date", e.target.value)}
                />
              </div>
              <div className="fld">
                <label>Symbol *</label>
                <input
                  value={ef.symbol}
                  onChange={(e) => E("symbol", e.target.value)}
                />
              </div>
              <div className="fld">
                <label>Side</label>
                <select
                  value={ef.side}
                  onChange={(e) => E("side", e.target.value)}
                >
                  <option>LONG</option>
                  <option>SHORT</option>
                </select>
              </div>
              <div className="fld">
                <label>Qty *</label>
                <input
                  type="number"
                  value={ef.qty}
                  onChange={(e) => E("qty", e.target.value)}
                />
              </div>
              <div className="fld">
                <label>Entry ₹ *</label>
                <input
                  type="number"
                  value={ef.entry}
                  onChange={(e) => E("entry", e.target.value)}
                />
              </div>
              <div className="fld">
                <label>
                  Exit ₹ <span className="opt">(blank=open)</span>
                </label>
                <input
                  type="number"
                  placeholder="Fill to close"
                  value={ef.exit}
                  onChange={(e) => E("exit", e.target.value)}
                />
              </div>
              <div className="fld">
                <label>
                  SL ₹ <span className="opt">(optional)</span>
                </label>
                <input
                  type="number"
                  value={ef.sl}
                  onChange={(e) => E("sl", e.target.value)}
                />
              </div>
              <div className="fld">
                <label>
                  Target ₹ <span className="opt">(optional)</span>
                </label>
                <input
                  type="number"
                  value={ef.tgt}
                  onChange={(e) => E("tgt", e.target.value)}
                />
              </div>
            </div>
            <div className="mact">
              <button className="bsave" onClick={saveEdit} disabled={efSav}>
                {efSav ? "Saving..." : "💾 Save Changes"}
              </button>
              <button className="bcan" onClick={() => setEditT(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paid AI Modal */}
      {paidT && <PaidAI trade={paidT} onClose={() => setPaidT(null)} />}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}

export default function Page() {
  const { data: session, status } = useSession();
  return (
    <>
      <style>{css}</style>
      <div className="wrap">
        {status === "loading" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100vh",
              gap: 10,
              color: "rgba(255,255,255,.3)",
              fontSize: ".8rem",
            }}
          >
            <div className="spin" style={{ borderTopColor: "#30d158" }} />
            Loading...
          </div>
        )}
        {status === "unauthenticated" && <Login />}
        {status === "authenticated" && <App user={session.user} />}
      </div>
    </>
  );
}
