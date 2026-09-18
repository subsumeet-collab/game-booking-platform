import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().default(""),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const feedback = await prisma.feedback.create({
    data: { userId: session.user.id, rating: parsed.data.rating, comment: parsed.data.comment },
  });

  return NextResponse.json({ feedback }, { status: 201 });
}
