import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Trade from "@/models/Trade";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const trade = await Trade.findOneAndUpdate(
    { _id: params.id, userId: session.user.id },
    body,
    { new: true }
  );
  if (!trade) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(trade);
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const trade = await Trade.findOneAndDelete({ _id: params.id, userId: session.user.id });
  if (!trade) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
