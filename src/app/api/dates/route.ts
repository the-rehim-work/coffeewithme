import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dates = await prisma.coffeeDate.findMany({
    where: { senderId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(dates);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { message, locationName, locationLat, locationLng, scheduledAt, recipientName } = body;

  if (!message || !locationName || !locationLat || !locationLng || !scheduledAt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const date = await prisma.coffeeDate.create({
    data: {
      senderId: session.user.id,
      recipientName: recipientName?.trim() || null,
      message,
      locationName,
      locationLat,
      locationLng,
      scheduledAt: new Date(scheduledAt),
    },
  });

  return NextResponse.json(date, { status: 201 });
}
