"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useMemo, useEffect, useCallback } from "react";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0f;
    --glass: rgba(255,255,255,0.045);
    --gb: rgba(255,255,255,0.10);
    --ghov: rgba(255,255,255,0.07);
    --green: #30d158; --greenglow: rgba(48,209,88,0.22);
    --red: #ff453a;   --redglow: rgba(255,69,58,0.2);
    --blue: #0a84ff;  --blueglow: rgba(10,132,255,0.2);
    --gold: #ffd60a;
    --purple: #bf5af2;
    --t1: #f5f5f7; --t2: rgba(255,255,255,0.55); --t3: rgba(255,255,255,0.3);
    --sep: rgba(255,255,255,0.07);
    --r: 18px; --rs: 12px; --rx: 8px;
  }
  body { background: var(--bg); font-family: 'Inter', -apple-system, sans-serif; color: var(--t1); -webkit-font-smoothing: antialiased; }
  body::before {
    content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
    background:
      radial-gradient(ellipse 80% 50% at 15% 0%, rgba(48,209,88,0.07) 0%, transparent 55%),
      radial-gradient(ellipse 60% 50% at 85% 100%, rgba(10,132,255,0.05) 0%, transparent 55%),
      radial-gradient(ellipse 50% 40% at 50% 50%, rgba(191,90,242,0.03) 0%, transparent 65%);
  }
  .wrap { position:relative; z-index:1; min-height:100vh; max-width:1300px; margin:0 auto; padding:18px 14px 0; display:flex; flex-direction:column; }
  .g  { background:var(--glass); backdrop-filter:blur(40px) saturate(180%); -webkit-backdrop-filter:blur(40px) saturate(180%); border:1px solid var(--gb); border-radius:var(--r); }
  .gs { border-radius:var(--rs); }
  .gx { border-radius:var(--rx); }

  /* LOGIN */
  .login-wrap { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; padding:20px; background:var(--bg); z-index:100; }
  .login-card { width:100%; max-width:360px; padding:36px 28px; text-align:center; }
  .login-logo { font-size:2rem; font-weight:800; letter-spacing:-0.04em; background:linear-gradient(135deg,#fff,rgba(255,255,255,0.55)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .login-sub { font-size:0.68rem; color:var(--t3); letter-spacing:0.08em; text-transform:uppercase; margin:4px 0 24px; }
  .login-desc { font-size:0.8rem; color:var(--t2); line-height:1.65; margin-bottom:28px; }
  .login-btns { display:flex; flex-direction:column; gap:10px; margin-bottom:20px; }
  .btn-goo { display:flex; align-items:center; justify-content:center; gap:10px; padding:13px; background:#fff; color:#111; font-size:0.85rem; font-weight:700; border:none; border-radius:var(--rs); cursor:pointer; transition:all .2s; font-family:'Inter',sans-serif; }
  .btn-goo:hover { opacity:.88; transform:translateY(-1px); box-shadow:0 8px 28px rgba(255,255,255,.12); }
  .btn-ghb { display:flex; align-items:center; justify-content:center; gap:10px; padding:13px; background:rgba(255,255,255,.08); color:var(--t1); font-size:0.85rem; font-weight:700; border:1px solid rgba(255,255,255,.12); border-radius:var(--rs); cursor:pointer; transition:all .2s; font-family:'Inter',sans-serif; }
  .btn-ghb:hover { background:rgba(255,255,255,.12); transform:translateY(-1px); }
  .login-note { font-size:0.6rem; color:var(--t3); line-height:1.7; }

  /* HEADER */
  .hdr { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; margin-bottom:14px; gap:10px; flex-wrap:wrap; }
  .logo { font-size:1.3rem; font-weight:800; letter-spacing:-0.04em; background:linear-gradient(135deg,#fff,rgba(255,255,255,.55)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .logo-s { font-size:0.58rem; color:var(--t3); letter-spacing:.07em; text-transform:uppercase; margin-top:2px; }
  .hdr-r { display:flex; align-items:center; gap:8px; }
  .live-pill { display:flex; align-items:center; gap:5px; background:rgba(48,209,88,.1); border:1px solid rgba(48,209,88,.25); border-radius:20px; padding:4px 11px; font-size:.62rem; color:var(--green); font-weight:600; }
  .live-dot { width:5px; height:5px; border-radius:50%; background:var(--green); animation:pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
  .upill { display:flex; align-items:center; gap:7px; background:rgba(255,255,255,.06); border:1px solid var(--gb); border-radius:20px; padding:5px 11px 5px 5px; }
  .uavatar { width:24px; height:24px; border-radius:50%; object-fit:cover; border:1px solid var(--gb); }
  .uname { font-size:.65rem; font-weight:600; color:var(--t2); max-width:90px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .btn-out { font-size:.6rem; padding:4px 10px; border-radius:20px; background:rgba(255,69,58,.1); border:1px solid rgba(255,69,58,.2); color:var(--red); cursor:pointer; font-weight:600; font-family:'Inter',sans-serif; transition:all .2s; }
  .btn-out:hover { background:rgba(255,69,58,.2); }

  /* STATS */
  .stats { display:grid; grid-template-columns:repeat(3,1fr); gap:9px; margin-bottom:12px; }
  .sc { padding:13px; display:flex; flex-direction:column; gap:3px; }
  .sl { font-size:.56rem; color:var(--t3); letter-spacing:.08em; text-transform:uppercase; font-weight:600; }
  .sv { font-size:1.15rem; font-weight:800; letter-spacing:-.03em; font-family:'JetBrains Mono',monospace; }
  .ss { font-size:.56rem; color:var(--t3); }
  .cg{color:var(--green)} .cr{color:var(--red)} .co{color:var(--gold)} .cb{color:var(--blue)} .cw{color:var(--t1)}

  /* FORM */
  .fp { padding:16px; margin-bottom:12px; }
  .stitle { font-size:.65rem; font-weight:700; color:var(--t3); letter-spacing:.1em; text-transform:uppercase; margin-bottom:11px; display:flex; align-items:center; gap:7px; }
  .fg4 { display:grid; grid-template-columns:repeat(4,1fr); gap:7px; margin-bottom:7px; }
  .fg4b { display:grid; grid-template-columns:repeat(4,1fr); gap:7px; margin-bottom:11px; }
  .fld { display:flex; flex-direction:column; gap:4px; }
  .fld label { font-size:.54rem; font-weight:700; color:var(--t3); letter-spacing:.06em; text-transform:uppercase; }
  .opt { font-size:.46rem; opacity:.65; font-weight:400; }
  .fld input, .fld select { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.09); color:var(--t1); font-family:'JetBrains Mono',monospace; font-size:.76rem; padding:9px 10px; border-radius:var(--rx); outline:none; transition:border-color .2s,background .2s; width:100%; -webkit-appearance:none; }
  .fld input::placeholder { color:var(--t3); }
  .fld input:focus, .fld select:focus { border-color:rgba(48,209,88,.5); background:rgba(48,209,88,.04); }
  .fld select option { background:#1a1a2e; }
  .btn-add { width:100%; padding:12px; background:var(--green); color:#0a0a0f; font-size:.8rem; font-weight:700; border:none; border-radius:var(--rs); cursor:pointer; transition:all .2s; font-family:'Inter',sans-serif; }
  .btn-add:hover:not(:disabled) { opacity:.87; transform:translateY(-1px); box-shadow:0 8px 22px var(--greenglow); }
  .btn-add:disabled { opacity:.45; cursor:not-allowed; }

  /* CHART */
  .chp { padding:16px; margin-bottom:12px; }
  .bars { display:flex; align-items:flex-end; gap:7px; height:100px; margin-top:8px; }
  .bcol { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; height:100%; justify-content:flex-end; }
  .bar { width:100%; border-radius:5px 5px 0 0; min-height:3px; position:relative; cursor:pointer; transition:opacity .15s; }
  .bar:hover { opacity:.72; }
  .bar:hover::after { content:attr(data-t); position:absolute; bottom:calc(100% + 5px); left:50%; transform:translateX(-50%); background:rgba(0,0,0,.88); backdrop-filter:blur(10px); color:var(--t1); font-size:.58rem; padding:3px 8px; border-radius:5px; white-space:nowrap; z-index:10; border:1px solid var(--gb); pointer-events:none; }
  .bl { font-size:.5rem; color:var(--t3); text-align:center; font-weight:600; }

  /* LOG */
  .lp { padding:16px; margin-bottom:12px; }
  .lhdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:11px; flex-wrap:wrap; gap:7px; }
  .frw { display:flex; gap:5px; flex-wrap:wrap; }
  .fb { font-size:.58rem; padding:4px 10px; border-radius:20px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.07); color:var(--t3); cursor:pointer; font-weight:600; letter-spacing:.04em; transition:all .2s; font-family:'Inter',sans-serif; }
  .fb.on { background:var(--green); color:#0a0a0f; border-color:var(--green); }

  /* Desktop table */
  .tbl-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; font-size:.68rem; min-width:660px; }
  th { text-align:left; color:var(--t3); font-size:.54rem; letter-spacing:.08em; text-transform:uppercase; font-weight:700; padding:7px 9px; border-bottom:1px solid var(--sep); }
  td { padding:9px 9px; border-bottom:1px solid var(--sep); vertical-align:middle; }
  tbody tr:last-child td { border-bottom:none; }
  tbody tr:hover td { background:var(--ghov); }

  /* Mobile cards */
  .mcards { display:none; flex-direction:column; gap:8px; }
  .mcard { padding:13px; display:flex; flex-direction:column; gap:7px; }
  .mctop { display:flex; align-items:flex-start; justify-content:space-between; }
  .mcsym { font-size:.96rem; font-weight:800; }
  .mcdate { font-size:.58rem; color:var(--t3); margin-top:2px; }
  .mcpl { font-size:1rem; font-weight:800; font-family:'JetBrains Mono',monospace; }
  .mcrow { display:flex; gap:5px; flex-wrap:wrap; }
  .mpill { font-size:.56rem; font-weight:600; padding:2px 7px; border-radius:5px; font-family:'JetBrains Mono',monospace; }
  .mcact { display:flex; gap:5px; justify-content:flex-end; }

  /* Badges */
  .bdg { display:inline-block; font-size:.54rem; padding:2px 7px; border-radius:5px; font-weight:700; letter-spacing:.04em; }
  .bw  { background:rgba(48,209,88,.12); color:var(--green); border:1px solid rgba(48,209,88,.2); }
  .bl2 { background:rgba(255,69,58,.12); color:var(--red);   border:1px solid rgba(255,69,58,.2); }
  .bo  { background:rgba(255,214,10,.12); color:var(--gold);  border:1px solid rgba(255,214,10,.2); }
  .blo { background:rgba(48,209,88,.09); color:var(--green); border:1px solid rgba(48,209,88,.15); }
  .bsh { background:rgba(255,69,58,.09); color:var(--red);   border:1px solid rgba(255,69,58,.15); }

  /* Action btns */
  .ab { font-size:.58rem; padding:4px 8px; border-radius:var(--rx); font-weight:600; cursor:pointer; border:none; font-family:'Inter',sans-serif; transition:all .15s; }
  .ae { background:rgba(10,132,255,.14); color:var(--blue);   border:1px solid rgba(10,132,255,.22); }
  .ae:hover { background:rgba(10,132,255,.24); }
  .aa { background:rgba(191,90,242,.14); color:var(--purple); border:1px solid rgba(191,90,242,.22); }
  .aa:hover { background:rgba(191,90,242,.24); }
  .ad { background:rgba(255,69,58,.1);  color:var(--red);    border:1px solid rgba(255,69,58,.2); }
  .ad:hover { background:rgba(255,69,58,.2); }

  /* Modals */
  .mov { position:fixed; inset:0; z-index:200; background:rgba(0,0,0,.65); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); display:flex; align-items:flex-end; animation:fi .2s ease; }
  @media(min-width:580px){ .mov { align-items:center; justify-content:center; } }
  @keyframes fi { from{opacity:0} to{opacity:1} }
  .mbox { background:rgba(18,18,30,.96); backdrop-filter:blur(40px) saturate(200%); -webkit-backdrop-filter:blur(40px) saturate(200%); border:1px solid rgba(255,255,255,.11); border-radius:22px 22px 0 0; padding:20px 16px 28px; width:100%; max-width:500px; animation:su .28s cubic-bezier(.34,1.56,.64,1); }
  .aibox { background:rgba(18,18,30,.96); backdrop-filter:blur(40px) saturate(200%); border:1px solid rgba(255,255,255,.11); border-radius:22px 22px 0 0; padding:20px 16px 28px; width:100%; max-width:560px; max-height:82vh; overflow-y:auto; animation:su .28s cubic-bezier(.34,1.56,.64,1); }
  @media(min-width:580px){ .mbox,.aibox { border-radius:22px; padding:24px; } }
  @keyframes su { from{transform:translateY(36px);opacity:0} to{transform:translateY(0);opacity:1} }
  .mhdl { width:34px; height:4px; border-radius:2px; background:rgba(255,255,255,.18); margin:0 auto 16px; }
  .mtitle { font-size:.92rem; font-weight:800; margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; }
  .mclose { width:26px; height:26px; border-radius:50%; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1); color:var(--t2); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:.9rem; }
  .mgrid { display:grid; grid-template-columns:1fr 1fr; gap:9px; margin-bottom:13px; }
  .mact { display:flex; flex-direction:column; gap:7px; }
  .bsave { width:100%; padding:12px; background:var(--blue); color:#fff; font-size:.8rem; font-weight:700; border:none; border-radius:var(--rs); cursor:pointer; transition:all .2s; font-family:'Inter',sans-serif; }
  .bsave:hover:not(:disabled) { opacity:.87; box-shadow:0 8px 22px var(--blueglow); }
  .bsave:disabled { opacity:.45; cursor:not-allowed; }
  .bcan { width:100%; padding:11px; background:rgba(255,255,255,.05); color:var(--t2); font-size:.78rem; font-weight:600; border:1px solid rgba(255,255,255,.08); border-radius:var(--rs); cursor:pointer; transition:all .2s; font-family:'Inter',sans-serif; }
  .bcan:hover { background:rgba(255,255,255,.09); }
  .aipill { display:inline-flex; align-items:center; gap:5px; background:rgba(191,90,242,.14); border:1px solid rgba(191,90,242,.28); color:var(--purple); font-size:.58rem; font-weight:700; padding:3px 8px; border-radius:20px; }
  .aicontent { font-size:.76rem; line-height:1.78; color:rgba(255,255,255,.62); white-space:pre-wrap; margin-top:12px; }
  .ail { display:flex; align-items:center; gap:9px; color:var(--t3); font-size:.76rem; padding:18px 0; }
  .spin { width:15px; height:15px; border:2px solid rgba(255,255,255,.1); border-top-color:var(--purple); border-radius:50%; animation:sp .8s linear infinite; flex-shrink:0; }
  @keyframes sp { to{transform:rotate(360deg)} }

  /* Market */
  .mkgrid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  @media(max-width:680px){ .mkgrid { grid-template-columns:1fr; } }
  .mkp { padding:15px; }
  .mkh { display:flex; align-items:center; gap:7px; margin-bottom:11px; }
  .mkt { font-size:.65rem; font-weight:700; color:var(--t3); letter-spacing:.08em; text-transform:uppercase; }
  .bref { margin-left:auto; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); color:var(--t3); font-size:.56rem; padding:3px 9px; border-radius:20px; cursor:pointer; font-family:'Inter',sans-serif; font-weight:600; transition:all .2s; }
  .bref:hover { border-color:var(--green); color:var(--green); }
  .bref:disabled { opacity:.38; cursor:not-allowed; }
  .lupd { font-size:.52rem; color:var(--t3); }
  .grow { display:flex; align-items:center; padding:8px 0; border-bottom:1px solid var(--sep); }
  .grow:last-child { border-bottom:none; }
  .grk { font-size:.54rem; color:var(--t3); font-weight:700; width:15px; flex-shrink:0; }
  .gri { flex:1; margin-left:7px; }
  .grsym { font-size:.74rem; font-weight:700; }
  .grn { font-size:.54rem; color:var(--t3); margin-top:1px; }
  .grr { text-align:right; }
  .grpct { font-size:.82rem; font-weight:800; font-family:'JetBrains Mono',monospace; }
  .grpr { font-size:.54rem; color:var(--t3); font-family:'JetBrains Mono',monospace; }
  .ni { padding:9px 0; border-bottom:1px solid var(--sep); transition:padding-left .15s; }
  .ni:last-child { border-bottom:none; }
  .ni:hover { padding-left:4px; }
  .ntag { display:inline-block; font-size:.48rem; padding:2px 6px; border-radius:4px; text-transform:uppercase; letter-spacing:.07em; font-weight:700; margin-bottom:3px; }
  .tr{background:rgba(48,209,88,.11);color:var(--green)} .to{background:rgba(191,90,242,.11);color:var(--purple)} .tp{background:rgba(255,214,10,.11);color:var(--gold)} .tm{background:rgba(255,69,58,.11);color:var(--red)} .ti{background:rgba(10,132,255,.11);color:var(--blue)}
  .nhl { font-size:.7rem; line-height:1.45; color:var(--t1); margin-bottom:3px; }
  .nm { font-size:.54rem; color:var(--t3); display:flex; gap:6px; }
  .sk { border-radius:var(--rx); background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.07) 50%,rgba(255,255,255,.04) 75%); background-size:200% 100%; animation:sh 1.5s infinite; }
  @keyframes sh { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* Toast */
  .toast { position:fixed; bottom:22px; left:50%; transform:translateX(-50%); background:rgba(18,18,30,.96); border:1px solid rgba(255,255,255,.11); border-radius:11px; padding:9px 16px; font-size:.72rem; font-weight:600; color:var(--t1); backdrop-filter:blur(20px); z-index:999; animation:tin .25s ease; white-space:nowrap; }
  .toast.ok { border-color:rgba(48,209,88,.38); color:var(--green); }
  .toast.err { border-color:rgba(255,69,58,.38); color:var(--red); }
  @keyframes tin { from{opacity:0;transform:translate(-50%,8px)} to{opacity:1;transform:translate(-50%,0)} }

  /* Divider */
  .div { display:flex; align-items:center; gap:11px; margin:16px 0 12px; }
  .dl { flex:1; height:1px; background:var(--sep); }
  .dt { font-size:.58rem; font-weight:700; color:var(--t3); letter-spacing:.1em; text-transform:uppercase; white-space:nowrap; }

  /* Footer */
  .foot { margin-top:auto; padding:18px 0 16px; text-align:center; border-top:1px solid var(--sep); }
  .foot p { font-size:.58rem; color:var(--t3); line-height:1.7; }
  .foot a { color:var(--green); text-decoration:none; font-weight:600; }
  .foot a:hover { text-decoration:underline; }

  /* Responsive */
  @media(max-width:680px){
    .wrap { padding:11px 10px 0; }
    .stats { grid-template-columns:repeat(2,1fr); gap:7px; }
    .sv { font-size:1rem; }
    .fg4,.fg4b { grid-template-columns:repeat(2,1fr); }
    .tbl-wrap { display:none; }
    .mcards { display:flex; }
    .lhdr { flex-direction:column; align-items:flex-start; }
    .hdr-r { gap:5px; }
    .uname { display:none; }
  }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const MO = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = n => {
  if (n == null) return "—";
  const a = Math.abs(n);
  const s = a >= 100000 ? `${(a/100000).toFixed(2)}L` : a >= 1000 ? `${(a/1000).toFixed(2)}K` : a.toFixed(2);
  return (n < 0 ? "-₹" : "₹") + s;
};

function useToast() {
  const [t, setT] = useState(null);
  const show = useCallback((msg, type="ok") => { setT({msg,type}); setTimeout(()=>setT(null),2600); }, []);
  return [t, show];
}

// ─── MARKET INTELLIGENCE ──────────────────────────────────────────────────────
async function fetchMkt() {
  const today = new Date().toDateString();
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{ role:"user", content:
      `Today is ${today}. Return ONLY valid JSON no markdown:\n{"gainers":[{"symbol":"SYM","name":"Name","sector":"Sec","price":1234.5,"change":3.45}],"news":[{"headline":"H","category":"results","source":"S","time":"2h ago"}]}\ngainers: 5 items (4 positive 1 negative), real NSE stocks, realistic prices. news: 6 items, categories: results/order/policy/macro/ipo.`
    }]})
  });
  const d = await r.json();
  return JSON.parse(d.content?.map(c=>c.text||"").join("").replace(/```json|```/g,"").trim());
}

function Market() {
  const [d,setD]=useState(null); const [ld,setLd]=useState(false); const [upd,setUpd]=useState(null); const [err,setErr]=useState(null);
  const tmap = {results:"tr",order:"to",policy:"tp",macro:"tm",ipo:"ti"};
  async function load(){
    setLd(true); setErr(null);
    try { const r=await fetchMkt(); setD(r); setUpd(new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})); }
    catch { setErr("Couldn't load. Add your Anthropic API key to .env.local as NEXT_PUBLIC_ANTHROPIC_KEY"); }
    setLd(false);
  }
  useEffect(()=>{load();},[]);
  return (
    <div>
      <div className="div"><div className="dl"/><span className="dt">📡 Market Intelligence</span><div className="dl"/></div>
      <div className="mkgrid">
        <div className="g gs mkp">
          <div className="mkh">
            <span className="mkt">Top Movers</span>
            {upd&&<span className="lupd">Updated {upd}</span>}
            <button className="bref" onClick={load} disabled={ld}>{ld?"...":"↻"}</button>
          </div>
          {ld?[1,2,3,4,5].map(i=><div key={i} className="sk" style={{height:44,marginBottom:6}}/>):
           err?<p style={{fontSize:'.7rem',color:'var(--t3)',padding:'8px 0'}}>{err}</p>:
           d?.gainers?.map((g,i)=>(
            <div className="grow" key={i}>
              <div className="grk">#{i+1}</div>
              <div className="gri"><div className="grsym">{g.symbol}</div><div className="grn">{g.name} · {g.sector}</div></div>
              <div className="grr">
                <div className={`grpct ${g.change>=0?'cg':'cr'}`}>{g.change>=0?'▲':'▼'} {Math.abs(g.change).toFixed(2)}%</div>
                <div className="grpr">₹{Number(g.price).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="g gs mkp">
          <div className="mkh"><span className="mkt">News & Events</span></div>
          {ld?[1,2,3,4,5,6].map(i=><div key={i} className="sk" style={{height:56,marginBottom:6}}/>):
           err?<p style={{fontSize:'.7rem',color:'var(--t3)',padding:'8px 0'}}>{err}</p>:
           d?.news?.map((n,i)=>(
            <div className="ni" key={i}>
              <span className={`ntag ${tmap[n.category]||'tp'}`}>{n.category}</span>
              <div className="nhl">{n.headline}</div>
              <div className="nm"><span>{n.source}</span><span>·</span><span>{n.time}</span></div>
            </div>
          ))}
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
        <div className="login-desc">Track trades, analyse performance, and get AI-powered market insights. Your data saved securely in the cloud.</div>
        <div className="login-btns">
          <button className="btn-goo" onClick={()=>signIn("google")}>
            <svg width="17" height="17" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <button className="btn-ghb" onClick={()=>signIn("github")}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            Continue with GitHub
          </button>
        </div>
        <div className="login-note">Free forever · No credit card · Secured by NextAuth</div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const DEF = { date:"", symbol:"", qty:"", entry:"", sl:"", tgt:"", exit:"", side:"LONG" };

function App({ user }) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(DEF);
  const [saving, setSaving] = useState(false);
  const [filt, setFilt] = useState("ALL");
  const [editT, setEditT] = useState(null);
  const [ef, setEf] = useState({});
  const [efsaving, setEfSaving] = useState(false);
  const [aiT, setAiT] = useState(null);
  const [aiL, setAiL] = useState(false);
  const [aiTxt, setAiTxt] = useState("");
  const [toast, showToast] = useToast();

  // ── Load trades ──
  useEffect(()=>{
    (async()=>{
      try {
        const r = await fetch("/api/trades");
        const d = await r.json();
        setTrades(d.map(t=>({...t,id:t._id})));
      } catch { showToast("Failed to load trades","err"); }
      setLoading(false);
    })();
  },[]);

  // ── Enrich ──
  const enr = useMemo(()=>trades.map(t=>{
    const open = !t.exit;
    const pl = open ? null : (t.side==="LONG"?(t.exit-t.entry):(t.entry-t.exit))*t.qty;
    const rr = t.tgt&&t.sl ? (Math.abs(t.tgt-t.entry)/Math.abs(t.entry-t.sl)).toFixed(2) : null;
    return {...t,pl,rr,open};
  }),[trades]);

  const closed = enr.filter(t=>!t.open);
  const totalPL = closed.reduce((s,t)=>s+t.pl,0);
  const wins = closed.filter(t=>t.pl>0);
  const losses = closed.filter(t=>t.pl<=0);
  const wr = closed.length ? Math.round(wins.length/closed.length*100) : 0;
  const avgW = wins.length ? wins.reduce((s,t)=>s+t.pl,0)/wins.length : 0;
  const avgL = losses.length ? losses.reduce((s,t)=>s+t.pl,0)/losses.length : 0;

  const monthly = useMemo(()=>{
    const m={};
    closed.forEach(t=>{
      const d=new Date(t.date);
      const k=`${d.getFullYear()}-${d.getMonth()}`;
      if(!m[k]) m[k]={label:`${MO[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`,pl:0};
      m[k].pl+=t.pl;
    });
    return Object.values(m).slice(-8);
  },[closed]);
  const mxA = Math.max(...monthly.map(m=>Math.abs(m.pl)),1);

  const filtered = useMemo(()=>{
    if(filt==="WIN") return enr.filter(t=>!t.open&&t.pl>0);
    if(filt==="LOSS") return enr.filter(t=>!t.open&&t.pl<=0);
    if(filt==="OPEN") return enr.filter(t=>t.open);
    return enr;
  },[enr,filt]);

  // ── Add ──
  async function add(){
    if(!form.date||!form.symbol||!form.qty||!form.entry) return showToast("Fill required fields","err");
    setSaving(true);
    try {
      const r=await fetch("/api/trades",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,symbol:form.symbol.toUpperCase(),qty:+form.qty,entry:+form.entry,sl:form.sl?+form.sl:null,tgt:form.tgt?+form.tgt:null,exit:form.exit?+form.exit:null})});
      const d=await r.json();
      setTrades(p=>[{...d,id:d._id},...p]);
      setForm(DEF); showToast("Trade saved ✓");
    } catch { showToast("Failed to save","err"); }
    setSaving(false);
  }

  // ── Edit ──
  function openEdit(t){ setEditT(t); setEf({date:t.date,symbol:t.symbol,qty:String(t.qty),entry:String(t.entry),sl:t.sl?String(t.sl):"",tgt:t.tgt?String(t.tgt):"",exit:t.exit?String(t.exit):"",side:t.side}); }
  async function saveEdit(){
    if(!ef.date||!ef.symbol||!ef.qty||!ef.entry) return showToast("Fill required fields","err");
    setEfSaving(true);
    try {
      const r=await fetch(`/api/trades/${editT.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...ef,symbol:ef.symbol.toUpperCase(),qty:+ef.qty,entry:+ef.entry,sl:ef.sl?+ef.sl:null,tgt:ef.tgt?+ef.tgt:null,exit:ef.exit?+ef.exit:null})});
      const d=await r.json();
      setTrades(p=>p.map(t=>t.id===editT.id?{...d,id:d._id}:t));
      setEditT(null); showToast("Trade updated ✓");
    } catch { showToast("Failed to update","err"); }
    setEfSaving(false);
  }

  // ── Delete ──
  async function del(id){
    try { await fetch(`/api/trades/${id}`,{method:"DELETE"}); setTrades(p=>p.filter(t=>t.id!==id)); showToast("Deleted"); }
    catch { showToast("Failed to delete","err"); }
  }

  // ── AI ──
  async function ai(t){
    setAiT(t); setAiL(true); setAiTxt("");
    const sl=t.sl?`SL: ₹${t.sl}`:"No SL set"; const tgt=t.tgt?`Target: ₹${t.tgt}`:"No target";
    const isL=t.pl!==null&&t.pl<0;
    const p=t.open
      ?`I hold ${t.symbol} (${t.side}). Entry: ₹${t.entry}, ${sl}, ${tgt}, Qty: ${t.qty}. Give: 1) Key factors that could move this stock, 2) Risk assessment, 3) News/events to watch. Concise, for retail Indian trader.`
      :`I traded ${t.symbol} on ${t.date} (${t.side}). Entry: ₹${t.entry}, Exit: ₹${t.exit}, ${sl}, ${tgt}, Qty: ${t.qty}, P/L: ₹${t.pl?.toFixed(2)} (${isL?"LOSS":"PROFIT"}). Explain: 1) Why ${t.symbol} may have ${isL?"gone against position":"moved in favour"} around that date, 2) Risk management review, 3) Key lesson. Concise.`;
    try {
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:p}]})});
      const d=await r.json();
      setAiTxt(d.content?.map(c=>c.text||"").join("")||"No response.");
    } catch { setAiTxt("Error. Add NEXT_PUBLIC_ANTHROPIC_KEY to .env.local"); }
    setAiL(false);
  }

  if(loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',gap:10,color:'var(--t3)',fontSize:'.8rem'}}><div className="spin" style={{borderTopColor:'var(--green)'}}/>Loading your trades...</div>;

  const F=(k,v)=>setForm(p=>({...p,[k]:v}));
  const E=(k,v)=>setEf(p=>({...p,[k]:v}));

  return (
    <>
      {/* Header */}
      <div className="g hdr">
        <div><div className="logo">TradeLens</div><div className="logo-s">P/L Analyzer + AI Insights</div></div>
        <div className="hdr-r">
          <div className="live-pill"><div className="live-dot"/>Live</div>
          <div className="upill">
            {user?.image&&<img className="uavatar" src={user.image} alt=""/>}
            <span className="uname">{user?.name?.split(" ")[0]}</span>
          </div>
          <button className="btn-out" onClick={()=>signOut()}>Logout</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="g gs sc"><div className="sl">Total P/L</div><div className={`sv ${totalPL>=0?'cg':'cr'}`}>{fmt(totalPL)}</div><div className="ss">{closed.length} closed</div></div>
        <div className="g gs sc"><div className="sl">Win Rate</div><div className="sv co">{wr}%</div><div className="ss">{wins.length}W / {losses.length}L</div></div>
        <div className="g gs sc"><div className="sl">Avg Win</div><div className="sv cg">{fmt(avgW)}</div><div className="ss">per trade</div></div>
        <div className="g gs sc"><div className="sl">Avg Loss</div><div className="sv cr">{fmt(avgL)}</div><div className="ss">per trade</div></div>
        <div className="g gs sc"><div className="sl">Trades</div><div className="sv cw">{enr.length}</div><div className="ss">total</div></div>
        <div className="g gs sc"><div className="sl">Open</div><div className="sv co">{enr.filter(t=>t.open).length}</div><div className="ss">positions</div></div>
      </div>

      {/* Add Trade */}
      <div className="g fp">
        <div className="stitle">＋ Add Trade</div>
        <div className="fg4">
          <div className="fld"><label>Date *</label><input type="date" value={form.date} onChange={e=>F("date",e.target.value)}/></div>
          <div className="fld"><label>Symbol *</label><input placeholder="RELIANCE" value={form.symbol} onChange={e=>F("symbol",e.target.value)}/></div>
          <div className="fld"><label>Side</label><select value={form.side} onChange={e=>F("side",e.target.value)}><option>LONG</option><option>SHORT</option></select></div>
          <div className="fld"><label>Qty *</label><input type="number" placeholder="10" value={form.qty} onChange={e=>F("qty",e.target.value)}/></div>
        </div>
        <div className="fg4b">
          <div className="fld"><label>Entry ₹ *</label><input type="number" placeholder="2400" value={form.entry} onChange={e=>F("entry",e.target.value)}/></div>
          <div className="fld"><label>SL ₹ <span className="opt">(optional)</span></label><input type="number" placeholder="2350" value={form.sl} onChange={e=>F("sl",e.target.value)}/></div>
          <div className="fld"><label>Target ₹ <span className="opt">(optional)</span></label><input type="number" placeholder="2500" value={form.tgt} onChange={e=>F("tgt",e.target.value)}/></div>
          <div className="fld"><label>Exit ₹ <span className="opt">(blank=open)</span></label><input type="number" placeholder="2480" value={form.exit} onChange={e=>F("exit",e.target.value)}/></div>
        </div>
        <button className="btn-add" onClick={add} disabled={saving}>{saving?"Saving...":"+ Add Trade"}</button>
      </div>

      {/* Chart */}
      <div className="g gs chp">
        <div className="stitle">Monthly P/L</div>
        {monthly.length===0?<p style={{fontSize:'.72rem',color:'var(--t3)',paddingTop:6}}>No closed trades yet</p>:
        <div className="bars">
          {monthly.map((m,i)=>(
            <div className="bcol" key={i}>
              <div className="bar" data-t={`${m.label}: ${fmt(m.pl)}`} style={{height:`${Math.abs(m.pl)/mxA*90}%`,background:m.pl>=0?'var(--green)':'var(--red)',opacity:.8}}/>
              <div className="bl">{m.label.split(' ')[0]}</div>
            </div>
          ))}
        </div>}
      </div>

      {/* Trade Log */}
      <div className="g gs lp">
        <div className="lhdr">
          <div className="stitle" style={{margin:0}}>Trade Log</div>
          <div className="frw">
            {["ALL","WIN","LOSS","OPEN"].map(f=><button key={f} className={`fb ${filt===f?'on':''}`} onClick={()=>setFilt(f)}>{f}</button>)}
          </div>
        </div>

        {/* Desktop */}
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Date</th><th>Symbol</th><th>Side</th><th>Qty</th><th>Entry</th><th>SL</th><th>Target</th><th>Exit</th><th>P/L</th><th>R:R</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={12} style={{textAlign:'center',padding:'28px',color:'var(--t3)',fontSize:'.75rem'}}>No trades found</td></tr>}
              {filtered.map(t=>(
                <tr key={t.id}>
                  <td style={{color:'var(--t3)',fontFamily:'JetBrains Mono,monospace'}}>{t.date}</td>
                  <td style={{fontWeight:800}}>{t.symbol}</td>
                  <td><span className={`bdg ${t.side==='LONG'?'blo':'bsh'}`}>{t.side}</span></td>
                  <td style={{fontFamily:'JetBrains Mono,monospace'}}>{t.qty}</td>
                  <td style={{fontFamily:'JetBrains Mono,monospace'}}>₹{t.entry?.toLocaleString('en-IN')}</td>
                  <td style={{color:t.sl?'var(--red)':'var(--t3)',fontFamily:'JetBrains Mono,monospace'}}>{t.sl?`₹${t.sl}`:'—'}</td>
                  <td style={{color:t.tgt?'var(--green)':'var(--t3)',fontFamily:'JetBrains Mono,monospace'}}>{t.tgt?`₹${t.tgt}`:'—'}</td>
                  <td style={{color:t.exit?'var(--t1)':'var(--gold)',fontFamily:'JetBrains Mono,monospace'}}>{t.exit?`₹${t.exit}`:'—'}</td>
                  <td style={{fontWeight:700,color:t.pl==null?'var(--gold)':t.pl>=0?'var(--green)':'var(--red)',fontFamily:'JetBrains Mono,monospace'}}>{fmt(t.pl)}</td>
                  <td style={{color:'var(--t3)',fontFamily:'JetBrains Mono,monospace'}}>{t.rr||'—'}</td>
                  <td><span className={`bdg ${t.open?'bo':t.pl>=0?'bw':'bl2'}`}>{t.open?'OPEN':t.pl>=0?'WIN':'LOSS'}</span></td>
                  <td><div style={{display:'flex',gap:4}}>
                    <button className="ab ae" onClick={()=>openEdit(t)}>✏️ Edit</button>
                    <button className="ab aa" onClick={()=>ai(t)}>✦ AI</button>
                    <button className="ab ad" onClick={()=>del(t.id)}>✕</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="mcards">
          {filtered.length===0&&<div style={{textAlign:'center',padding:'22px',color:'var(--t3)',fontSize:'.74rem'}}>No trades found</div>}
          {filtered.map(t=>(
            <div key={t.id} className="g gx mcard">
              <div className="mctop">
                <div><div className="mcsym">{t.symbol}</div><div className="mcdate">{t.date} · {t.qty} qty</div></div>
                <div style={{textAlign:'right'}}>
                  <div className={`mcpl ${t.pl==null?'co':t.pl>=0?'cg':'cr'}`}>{fmt(t.pl)}</div>
                  <span className={`bdg ${t.open?'bo':t.pl>=0?'bw':'bl2'}`} style={{fontSize:'.5rem'}}>{t.open?'OPEN':t.pl>=0?'WIN':'LOSS'}</span>
                </div>
              </div>
              <div className="mcrow">
                <span className={`mpill ${t.side==='LONG'?'blo':'bsh'}`}>{t.side}</span>
                <span className="mpill" style={{background:'rgba(255,255,255,.06)',color:'var(--t3)'}}>Entry ₹{t.entry}</span>
                {t.exit&&<span className="mpill" style={{background:'rgba(255,255,255,.06)',color:'var(--t2)'}}>Exit ₹{t.exit}</span>}
                {t.sl&&<span className="mpill bl2">SL ₹{t.sl}</span>}
                {t.tgt&&<span className="mpill bw">TGT ₹{t.tgt}</span>}
                {t.rr&&<span className="mpill" style={{background:'rgba(255,255,255,.06)',color:'var(--t3)'}}>R:R {t.rr}</span>}
              </div>
              <div className="mcact">
                <button className="ab ae" onClick={()=>openEdit(t)}>✏️ Edit</button>
                <button className="ab aa" onClick={()=>ai(t)}>✦ AI</button>
                <button className="ab ad" onClick={()=>del(t.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Market/>

      {/* Footer */}
      <div className="foot">
        <p>Built with ♥ for traders · <a href="https://github.com/salmanck66" target="_blank" rel="noopener noreferrer">Visit github.com/salmanck66</a> for more</p>
      </div>

      {/* Edit Modal */}
      {editT&&(
        <div className="mov" onClick={e=>e.target===e.currentTarget&&setEditT(null)}>
          <div className="mbox">
            <div className="mhdl"/>
            <div className="mtitle"><span>Edit {editT.symbol}</span><button className="mclose" onClick={()=>setEditT(null)}>×</button></div>
            <div className="mgrid">
              <div className="fld"><label>Date *</label><input type="date" value={ef.date} onChange={e=>E("date",e.target.value)}/></div>
              <div className="fld"><label>Symbol *</label><input value={ef.symbol} onChange={e=>E("symbol",e.target.value)}/></div>
              <div className="fld"><label>Side</label><select value={ef.side} onChange={e=>E("side",e.target.value)}><option>LONG</option><option>SHORT</option></select></div>
              <div className="fld"><label>Qty *</label><input type="number" value={ef.qty} onChange={e=>E("qty",e.target.value)}/></div>
              <div className="fld"><label>Entry ₹ *</label><input type="number" value={ef.entry} onChange={e=>E("entry",e.target.value)}/></div>
              <div className="fld"><label>Exit ₹ <span className="opt">(blank=open)</span></label><input type="number" placeholder="Fill to close" value={ef.exit} onChange={e=>E("exit",e.target.value)}/></div>
              <div className="fld"><label>SL ₹ <span className="opt">(optional)</span></label><input type="number" value={ef.sl} onChange={e=>E("sl",e.target.value)}/></div>
              <div className="fld"><label>Target ₹ <span className="opt">(optional)</span></label><input type="number" value={ef.tgt} onChange={e=>E("tgt",e.target.value)}/></div>
            </div>
            <div className="mact">
              <button className="bsave" onClick={saveEdit} disabled={efsaving}>{efsaving?"Saving...":"💾 Save Changes"}</button>
              <button className="bcan" onClick={()=>setEditT(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {aiT&&(
        <div className="mov" onClick={e=>e.target===e.currentTarget&&setAiT(null)}>
          <div className="aibox">
            <div className="mhdl"/>
            <div className="mtitle">
              <div style={{display:'flex',alignItems:'center',gap:9,flexWrap:'wrap'}}>
                <span>{aiT.symbol} Analysis</span>
                <span className="aipill">✦ AI</span>
              </div>
              <button className="mclose" onClick={()=>setAiT(null)}>×</button>
            </div>
            {aiL?<div className="ail"><div className="spin"/>Analysing {aiT.symbol}...</div>:<div className="aicontent">{aiTxt}</div>}
          </div>
        </div>
      )}

      {toast&&<div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Page() {
  const { data: session, status } = useSession();

  return (
    <>
      <style>{css}</style>
      <div className="wrap">
        {status==="loading" && (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',gap:10,color:'rgba(255,255,255,.3)',fontSize:'.8rem'}}>
            <div className="spin" style={{borderTopColor:'#30d158'}}/>Loading...
          </div>
        )}
        {status==="unauthenticated" && <Login/>}
        {status==="authenticated" && <App user={session.user}/>}
      </div>
    </>
  );
}
