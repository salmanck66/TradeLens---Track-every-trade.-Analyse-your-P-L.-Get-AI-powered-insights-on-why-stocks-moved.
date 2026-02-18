import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const headers = {
  "User-Agent": "Mozilla/5.0",
  Accept: "application/json",
  Referer: "https://www.nseindia.com/",
};

async function getCookies() {
  await fetch("https://www.nseindia.com", { headers });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const index = searchParams.get("index") || "NIFTY";

    await getCookies();

    const [gRes, lRes] = await Promise.all([
      fetch(
        "https://www.nseindia.com/api/live-analysis-variations?index=gainers",
        { headers }
      ),
      fetch(
        "https://www.nseindia.com/api/live-analysis-variations?index=loosers",
        { headers }
      ),
    ]);

    const gData = await gRes.json();
    const lData = await lRes.json();

    const gainers = gData[index]?.data || [];
    const losers  = lData[index]?.data || [];

    const map = (arr, type) =>
      arr.slice(0, 13).map((s) => ({
        symbol: s.symbol,
        name: s.symbol,
        sector: index,
        change: Number(s.perChange),
        price: Number(s.ltp),
        type,
      }));

    return NextResponse.json({
      ok: true,
      gainers: map(gainers, "gainer"),
      losers:  map(losers,  "loser"),
    });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
