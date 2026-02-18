import { NextResponse } from "next/server";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36";

async function getCookies() {
  const r = await fetch("https://www.nseindia.com/market-data/top-gainers-losers", {
    headers: {
      "User-Agent": UA,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
    },
    cache: "no-store",
  });
  return (r.headers.getSetCookie?.() || []).map(c => c.split(";")[0]).join("; ");
}

function normalize(item, type) {
  return {
    symbol: item.symbol || "",
    name: item.companyName || item.symbol || "",
    sector: item.industry || "NSE",
    price: parseFloat(item.lastPrice || item.ltp || 0),
    change: parseFloat(item.pChange || 0),
    type,
  };
}

export async function GET() {
  try {
    const cookie = await getCookies();
    const hdrs = {
      "User-Agent": UA,
      "Accept": "*/*",
      "Accept-Language": "en-IN,en-US;q=0.8",
      "Referer": "https://www.nseindia.com/market-data/top-gainers-losers",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "Cookie": cookie,
    };

    const [gRes, lRes] = await Promise.all([
      fetch("https://www.nseindia.com/api/live-analysis-variations?index=gainers", { headers: hdrs, cache: "no-store" }),
      fetch("https://www.nseindia.com/api/live-analysis-variations?index=losers",  { headers: hdrs, cache: "no-store" }),
    ]);

    if (!gRes.ok) throw new Error(`NSE ${gRes.status}`);

    const [gData, lData] = await Promise.all([
      gRes.json(),
      lRes.ok ? lRes.json() : Promise.resolve({ data: [] }),
    ]);

    const gainers = (gData?.data || []).slice(0, 4).map(s => normalize(s, "gainer"));
    const losers  = (lData?.data || []).slice(0, 2).map(s => normalize(s, "loser"));

    return NextResponse.json({ ok: true, stocks: [...gainers, ...losers] });
  } catch (e) {
    console.error("[NSE]", e.message);
    return NextResponse.json({ ok: false, stocks: [], error: e.message });
  }
}
