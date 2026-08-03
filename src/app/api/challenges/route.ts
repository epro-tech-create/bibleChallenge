import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  try {
    const challenges = await db.challenge.findMany({
      where: { status: { not: "CANCELLED" } },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        bibleBook: true,
        startChapter: true,
        endChapter: true,
        registrationDeadline: true,
        challengeDate: true,
        participantsPerFamily: true,
        status: true,
      },
      orderBy: { challengeDate: "asc" },
    });

    return NextResponse.json({ data: challenges });
  } catch (error) {
    return handleApiError(error);
  }
}
