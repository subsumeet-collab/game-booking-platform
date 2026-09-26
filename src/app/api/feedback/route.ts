import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  name: z.string().trim().max(80).optional().default(""),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().default(""),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const feedback = await prisma.feedback.create({ data: parsed.data });

  return NextResponse.json({ feedback }, { status: 201 });
}
