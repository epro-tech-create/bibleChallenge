import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, jsonError } from "@/lib/api";

export const runtime = "nodejs";

const querySchema = z.object({ challenge: z.string().min(1).optional() });

export async function GET(request: NextRequest) {
  try {
    const query = querySchema.parse({
      challenge: request.nextUrl.searchParams.get("challenge") ?? undefined,
    });
    const challenge = query.challenge
      ? await db.challenge.findUnique({ where: { id: query.challenge } })
      : await db.challenge.findFirst({
          where: { status: { in: ["REGISTRATION_OPEN", "ACTIVE", "COMPLETED"] } },
          orderBy: { challengeDate: "desc" },
        });

    if (!challenge) return jsonError("No challenge is available.", 404);

    const entries = await db.challengeFamily.findMany({
      where: { challengeId: challenge.id },
      select: {
        totalScore: true,
        qualificationStatus: true,
        family: { select: { id: true, name: true, location: true } },
      },
      orderBy: [{ totalScore: "desc" }, { family: { name: "asc" } }],
    });

    return NextResponse.json({
      data: {
        challenge: { id: challenge.id, title: challenge.title, slug: challenge.slug },
        entries: entries.map((entry, index) => ({
          rank: index + 1,
          family: entry.family,
          totalScore: entry.totalScore,
          qualificationStatus: entry.qualificationStatus,
        })),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
