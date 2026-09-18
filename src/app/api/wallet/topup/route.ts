import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  amount: z.number().int().min(50).max(50_000),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter an amount between ₹50 and ₹50,000." }, { status: 400 });
  }
  const { amount } = parsed.data;

  await prisma.$transaction([
    prisma.user.update({ where: { id: session.user.id }, data: { walletBalance: { increment: amount } } }),
    prisma.walletTransaction.create({
      data: { userId: session.user.id, type: "TOPUP", amount, note: "Wallet top-up" },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
