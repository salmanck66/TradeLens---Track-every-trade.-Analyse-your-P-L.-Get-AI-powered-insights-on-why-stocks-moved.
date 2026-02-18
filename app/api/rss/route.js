import { NextResponse } from "next/server";

const FEEDS = [
  { url: "https://economictimes.indiatimes.com/markets/rss.cms", source: "ET" },
  { url: "https://feeds.feedburner.com/ndtvprofit-latest", source: "NDTV" },
  { url: "https://www.livemint.com/rss/markets", source: "Mint" },
];

const PAGE_SIZE = 8;

const clean = (s="") =>
  s.replace(/<!\[CDATA\[|\]\]>/g, "").trim();

const matchSymbol = (headline, symbols) => {
  const h = headline.toUpperCase();
  return symbols.some(sym =>
    h.includes(sym) ||
    h.includes(sym.replace(/INDUSTRIES|LTD|LIMITED/g, "").trim())
  );
};

function parseRSS(xml, source) {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];

  return items.map(item => {
    const get = (tag) =>
      clean(item.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`))?.[1]);

    const title = clean(
      item.match(/<title>([\s\S]*?)<\/title>/)?.[1]
    );

    const pubDate = new Date(get("pubDate"));

    return {
      headline: title,
      link: get("link"),
      pubDate,
      source,
    };
  });
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);

  const symbols = (searchParams.get("symbols") || "")
    .split(",")
    .filter(Boolean)
    .map(s => s.toUpperCase());

  let news = [];

  await Promise.all(
    FEEDS.map(async f => {
      try {
        const res = await fetch(f.url, { cache: "no-store" });
        const xml = await res.text();
        news.push(...parseRSS(xml, f.source));
      } catch {}
    })
  );

  // remove empty
  news = news.filter(n => n.headline);

  // sort by latest
  news.sort((a, b) => b.pubDate - a.pubDate);

  // add yourStock flag
  news = news.map(n => ({
    ...n,
    yourStock: matchSymbol(n.headline, symbols),
    time: `${Math.floor((Date.now() - n.pubDate) / 3600000)}h ago`,
    category: "market",
  }));

  // pin your stock news on top
  news.sort((a, b) => b.yourStock - a.yourStock);

  const totalPages = Math.ceil(news.length / PAGE_SIZE);

  const slice = news.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return NextResponse.json({
    news: slice,
    page,
    totalPages,
  });
}
