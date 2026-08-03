import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api";
import { requireRole } from "@/lib/auth";

export const runtime = "nodejs";

const createFamilySchema = z.object({
  name: z.string().trim().min(3).max(120),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().email(),
  location: z.string().trim().min(2).max(120).default("Main Campus"),
});

export async function GET() {
  try {
    const families = await db.family.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        location: true,
        _count: { select: { members: { where: { status: "ACTIVE" } } } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      data: families.map(({ _count, ...family }) => ({
        ...family,
        activeMemberCount: _count.members,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole("ADMIN");
    const input = createFamilySchema.parse(await request.json());
    const family = await db.$transaction(async (tx) => {
      const created = await tx.family.create({ data: input });
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "CREATE",
          entityType: "Family",
          entityId: created.id,
          description: `Administrator created ${created.name}.`,
        },
      });
      return created;
    });

    return NextResponse.json({ data: family }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
