import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: { message } }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError("Request validation failed.", 400);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return jsonError("A record with this value already exists.", 409);
    if (error.code === "P2025") return jsonError("The requested record does not exist.", 404);
  }

  if (error instanceof Error && error.message === "Unauthorized") {
    return jsonError("Authentication is required for this action.", 401);
  }

  console.error("API request failed", error);
  return jsonError("An unexpected server error occurred.", 500);
}
