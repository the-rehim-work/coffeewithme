import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const date = await prisma.coffeeDate.findUnique({
    where: { id: params.id },
    include: {
      sender: {
        select: { name: true, image: true, email: true },
      },
    },
  });

  if (!date) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(date);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { status } = body;

  if (!["accepted", "declined"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await prisma.coffeeDate.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.status !== "pending") {
    return NextResponse.json({ error: "Already responded" }, { status: 409 });
  }

  const updated = await prisma.coffeeDate.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json(updated);
}
