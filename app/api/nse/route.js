import { NextResponse } from "next/server";

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.nseindia.com/",
  Connection: "keep-alive",
};

async function getCookies() {
  await fetch("https://www.nseindia.com", { headers, cache: "no-store" });
}

export async function GET() {
  try {
    // 1️⃣ get session cookies
    await getCookies();

    // 2️⃣ actual API
    const res = await fetch(
      "https://www.nseindia.com/api/live-analysis-variations?index=gainers",
      { headers, cache: "no-store" }
    );

    const data = await res.json();

    const list = data?.NIFTY?.data || [];

    const stocks = list.slice(0).map((s) => ({
      symbol: s.symbol,
      name: s.symbol,
      sector: "NSE",
      change: Number(s.perChange),
      price: Number(s.ltp),
      type: "gainer",
    }));

    return NextResponse.json({ ok: true, stocks });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: "NSE fetch failed",
    });
  }
}
