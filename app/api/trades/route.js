import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Trade from "@/models/Trade";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const trades = await Trade.find({ userId: session.user.id }).sort({ date: -1 });
  return NextResponse.json(trades);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const trade = await Trade.create({ ...body, userId: session.user.id });
  return NextResponse.json(trade, { status: 201 });
}
