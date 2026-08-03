"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { recalculateFamilyScore } from "@/lib/scoring";

const familySchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(7),
  email: z.string().email(),
});
export async function createFamily(formData: FormData) {
  await requireRole("ADMIN");
  const input = familySchema.parse(Object.fromEntries(formData));
  await db.family.create({ data: { ...input, location: "Main Campus" } });
  revalidatePath("/admin/families");
}

export async function deleteFamily(formData: FormData) {
  const session = await requireRole("ADMIN");
  const { familyId } = z
    .object({ familyId: z.string() })
    .parse(Object.fromEntries(formData));
  const family = await db.family.findUniqueOrThrow({ where: { id: familyId } });
  await db.$transaction([
    db.family.delete({ where: { id: familyId } }),
    db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        entityType: "Family",
        entityId: familyId,
        description: `Administrator deleted ${family.name} and its related records.`,
      },
    }),
  ]);
  revalidatePath("/admin/families");
  revalidatePath("/families");
}
export async function createChallenge(formData: FormData) {
  const session = await requireRole("ADMIN");
  const input = z
    .object({
      title: z.string().min(4),
      description: z.string().min(10),
      bibleBook: z.string().min(2),
      startChapter: z.coerce.number().int().min(1),
      endChapter: z.coerce.number().int().min(1),
      registrationDeadline: z.coerce.date(),
      challengeDate: z.coerce.date(),
      participantsPerFamily: z.coerce.number().int().min(1),
      defaultQuestionTime: z.coerce.number().int().min(10),
      defaultQuestionMarks: z.coerce.number().min(1),
    })
    .parse(Object.fromEntries(formData));
  if (input.endChapter < input.startChapter)
    throw new Error("Ending chapter must not be before the starting chapter.");
  const slug = `${input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`;
  const challengeDate = new Date(input.challengeDate);
  challengeDate.setHours(11, 45, 0, 0);
  await db.challenge.create({
    data: { ...input, challengeDate, slug, createdById: session.user.id },
  });
  revalidatePath("/admin");
}
export async function resetQuizSession(formData: FormData) {
  const session = await requireRole("ADMIN");
  const { sessionId } = z
    .object({ sessionId: z.string() })
    .parse(Object.fromEntries(formData));
  await db.$transaction([
    db.participantAnswer.deleteMany({ where: { quizSessionId: sessionId } }),
    db.quizSession.update({
      where: { id: sessionId },
      data: {
        status: "READY",
        currentQuestionId: null,
        currentQuestionStartedAt: null,
        startedAt: null,
        pausedAt: null,
        endedAt: null,
      },
    }),
    db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "RESET",
        entityType: "QuizSession",
        entityId: sessionId,
        description:
          "Administrator reset the test session and cleared its answers.",
      },
    }),
  ]);
  revalidatePath("/admin/control");
  revalidatePath("/participant/quiz");
}
export async function addMember(formData: FormData) {
  const session = await requireRole("ADMIN", "FAMILY_LEADER");
  const data = z
    .object({
      familyId: z.string(),
      fullName: z.string().min(2),
      phone: z.string().optional(),
      ageGroup: z.string().optional(),
    })
    .parse(Object.fromEntries(formData));
  if (session.user.role === "FAMILY_LEADER") {
    const family = await db.family.findFirst({
      where: { leaderId: session.user.id },
    });
    if (!family || family.id !== data.familyId)
      throw new Error("You can only manage your own family.");
  }
  await db.familyMember.create({ data });
  revalidatePath("/admin/families");
  revalidatePath("/family");
}
export async function updateMember(formData: FormData) {
  await requireRole("ADMIN");
  const data = z
    .object({
      memberId: z.string(),
      fullName: z.string().min(2),
      phone: z.string().optional(),
      ageGroup: z.string().optional(),
    })
    .parse(Object.fromEntries(formData));
  const { memberId, ...member } = data;
  await db.familyMember.update({ where: { id: memberId }, data: member });
  revalidatePath("/admin/families");
}

const questionSchema = z.object({
  challengeId: z.string(),
  roundId: z.string().optional(),
  bibleBook: z.string().min(2),
  chapter: z.coerce.number().int().min(1),
  verseReference: z.string().optional(),
  questionText: z.string().min(8),
  questionType: z.enum([
    "MULTIPLE_CHOICE",
    "TRUE_FALSE",
    "FILL_IN_THE_BLANK",
    "SHORT_ANSWER",
    "VERSE_COMPLETION",
    "ORAL",
  ]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "TIE_BREAKER"]),
  correctAnswer: z.string().min(1),
  marks: z.coerce.number().min(0.5),
  timeLimit: z.coerce.number().int().min(5),
});

async function validateQuestionRound(challengeId: string, roundId?: string) {
  if (!roundId) return;
  const round = await db.round.findFirst({
    where: { id: roundId, challengeId },
  });
  if (!round) throw new Error("Select a round that belongs to this challenge.");
}

export async function createQuestion(formData: FormData) {
  const session = await requireRole("ADMIN");
  const input = questionSchema.parse(Object.fromEntries(formData));
  await validateQuestionRound(input.challengeId, input.roundId || undefined);
  await db.question.create({
    data: {
      ...input,
      roundId: input.roundId || null,
      verseReference: input.verseReference || null,
      status: "READY",
      createdById: session.user.id,
    },
  });
  revalidatePath("/admin/questions");
}

export async function updateQuestion(formData: FormData) {
  await requireRole("ADMIN");
  const { questionId, ...input } = questionSchema
    .extend({ questionId: z.string() })
    .parse(Object.fromEntries(formData));
  await validateQuestionRound(input.challengeId, input.roundId || undefined);
  await db.question.update({
    where: { id: questionId },
    data: {
      ...input,
      roundId: input.roundId || null,
      verseReference: input.verseReference || null,
    },
  });
  revalidatePath("/admin/questions");
}
export async function selectParticipant(formData: FormData) {
  const session = await requireRole("ADMIN", "FAMILY_LEADER");
  const data = z
    .object({ challengeId: z.string(), familyMemberId: z.string() })
    .parse(Object.fromEntries(formData));
  const member = await db.familyMember.findUniqueOrThrow({
    where: { id: data.familyMemberId },
  });
  const challenge = await db.challenge.findUniqueOrThrow({
    where: { id: data.challengeId },
  });
  if (challenge.status !== "REGISTRATION_OPEN")
    throw new Error("Participant registration is not open for this challenge.");
  if (session.user.role === "FAMILY_LEADER") {
    const family = await db.family.findFirst({
      where: { leaderId: session.user.id },
    });
    if (!family || family.id !== member.familyId)
      throw new Error("You can only select members of your own family.");
  }
  const registration = await db.challengeFamily.findUnique({
    where: {
      challengeId_familyId: {
        challengeId: data.challengeId,
        familyId: member.familyId,
      },
    },
  });
  if (registration?.registrationStatus !== "APPROVED")
    throw new Error("This family is not approved for the challenge.");
  await db.$transaction(async (tx) => {
    const count = await tx.challengeParticipant.count({
      where: {
        challengeId: data.challengeId,
        familyId: member.familyId,
        approvalStatus: { in: ["PENDING", "APPROVED"] },
      },
    });
    if (count >= challenge.participantsPerFamily)
      throw new Error(
        `This family already has the maximum ${challenge.participantsPerFamily} challengers.`,
      );
    await tx.challengeParticipant.create({
      data: {
        challengeId: data.challengeId,
        familyId: member.familyId,
        familyMemberId: member.id,
        participantCode: `BC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      },
    });
  });
  revalidatePath("/admin/participants");
}
export async function controlRound(formData: FormData) {
  const user = await requireRole("ADMIN");
  const { sessionId, action, questionId } = z
    .object({
      sessionId: z.string(),
      action: z.enum(["START", "PAUSE", "RESUME", "END", "OPEN_QUESTION"]),
      questionId: z.string().optional(),
    })
    .parse(Object.fromEntries(formData));
  const quiz = await db.quizSession.findUniqueOrThrow({
    where: { id: sessionId },
  });
  if (quiz.status === "COMPLETED")
    throw new Error("This round has already ended.");
  if (action === "OPEN_QUESTION") {
    if (!questionId) throw new Error("Select a question first.");
    const question = await db.question.findFirst({
      where: { id: questionId, roundId: quiz.roundId, status: "READY" },
    });
    if (!question)
      throw new Error("That question does not belong to this round.");
  }
  const now = new Date();
  const data =
    action === "START"
      ? { status: "ACTIVE" as const, startedAt: quiz.startedAt ?? now }
      : action === "PAUSE"
        ? { status: "PAUSED" as const, pausedAt: now }
        : action === "RESUME"
          ? { status: "ACTIVE" as const, pausedAt: null }
          : action === "END"
            ? { status: "COMPLETED" as const, endedAt: now }
            : {
                currentQuestionId: questionId,
                currentQuestionStartedAt: now,
                status: "ACTIVE" as const,
              };
  await db.quizSession.update({ where: { id: sessionId }, data });
  await db.auditLog.create({
    data: {
      userId: user.user.id,
      action,
      entityType: "QuizSession",
      entityId: sessionId,
      description: `Administrator action: ${action}`,
    },
  });
  revalidatePath("/admin/control");
  revalidatePath("/participant/quiz");
}
export async function startChallenge(formData: FormData) {
  const session = await requireRole("ADMIN");
  const { challengeId } = z
    .object({ challengeId: z.string() })
    .parse(Object.fromEntries(formData));
  const challenge = await db.challenge.findUniqueOrThrow({
    where: { id: challengeId },
    select: { id: true, title: true, status: true },
  });
  if (["CANCELLED", "COMPLETED"].includes(challenge.status)) {
    throw new Error("A cancelled or completed challenge cannot be started.");
  }
  if (challenge.status !== "ACTIVE") {
    await db.$transaction([
      db.challenge.update({
        where: { id: challenge.id },
        data: { status: "ACTIVE" },
      }),
      db.auditLog.create({
        data: {
          userId: session.user.id,
          action: "START",
          entityType: "Challenge",
          entityId: challenge.id,
          description: `Administrator started ${challenge.title}.`,
        },
      }),
    ]);
  }
  revalidatePath("/");
  revalidatePath("/challenges");
  revalidatePath("/admin");
  revalidatePath("/admin/control");
  revalidatePath("/participant/quiz");
}
export async function submitAnswer(formData: FormData) {
  const session = await requireRole("PARTICIPANT");
  const input = z
    .object({
      quizSessionId: z.string(),
      questionId: z.string(),
      participantId: z.string(),
      answerText: z.string().optional(),
      selectedOptionId: z.string().optional(),
    })
    .parse(Object.fromEntries(formData));
  const participant = await db.challengeParticipant.findUniqueOrThrow({
    where: { id: input.participantId },
    include: { familyMember: true },
  });
  if (
    participant.familyMember.userId !== session.user.id ||
    participant.approvalStatus !== "APPROVED"
  )
    throw new Error("You are not approved for this challenge.");
  const quiz = await db.quizSession.findUniqueOrThrow({
    where: { id: input.quizSessionId },
    include: { currentQuestion: true, round: true },
  });
  if (quiz.round.challengeId !== participant.challengeId)
    throw new Error("This quiz session does not belong to your challenge.");
  if (
    quiz.status !== "ACTIVE" ||
    quiz.currentQuestionId !== input.questionId ||
    !quiz.currentQuestionStartedAt
  )
    throw new Error("This question is not active.");
  const question = quiz.currentQuestion!;
  if (
    Date.now() >
    quiz.currentQuestionStartedAt.getTime() + question.timeLimit * 1000
  )
    throw new Error("Time has expired for this question.");
  const selected = input.selectedOptionId
    ? await db.questionOption.findFirst({
        where: { id: input.selectedOptionId, questionId: question.id },
      })
    : null;
  if (input.selectedOptionId && !selected)
    throw new Error("Choose an answer from the active question.");
  const objective = ["MULTIPLE_CHOICE", "TRUE_FALSE"].includes(
    question.questionType,
  );
  const text = (input.answerText ?? selected?.optionText ?? "")
    .trim()
    .toLowerCase();
  const correct =
    text === question.correctAnswer.trim().toLowerCase() ||
    selected?.isCorrect === true;
  try {
    await db.participantAnswer.create({
      data: {
        ...input,
        isCorrect: objective ? correct : null,
        marksAwarded: objective ? (correct ? question.marks : 0) : null,
        markingStatus: objective ? "AUTO_MARKED" : "PENDING",
      },
    });
  } catch {
    throw new Error("You have already submitted an answer for this question.");
  }
  if (objective)
    await recalculateFamilyScore(participant.challengeId, participant.familyId);
  revalidatePath("/participant/quiz");
}
export async function markAnswer(formData: FormData) {
  const session = await requireRole("ADMIN");
  const input = z
    .object({
      answerId: z.string(),
      marksAwarded: z.coerce.number().min(0),
      isCorrect: z.enum(["true", "false"]),
    })
    .parse(Object.fromEntries(formData));
  const existing = await db.participantAnswer.findUniqueOrThrow({
    where: { id: input.answerId },
    include: { question: true },
  });
  if (input.marksAwarded > existing.question.marks)
    throw new Error(`Marks cannot exceed ${existing.question.marks}.`);
  const answer = await db.participantAnswer.update({
    where: { id: input.answerId },
    data: {
      marksAwarded: input.marksAwarded,
      isCorrect: input.isCorrect === "true",
      markingStatus: "MANUALLY_MARKED",
      markedById: session.user.id,
      markedAt: new Date(),
    },
    include: { participant: true },
  });
  await recalculateFamilyScore(
    answer.participant.challengeId,
    answer.participant.familyId,
  );
  revalidatePath("/admin/marking");
}
export async function adjustScore(formData: FormData) {
  const session = await requireRole("ADMIN");
  const input = z
    .object({
      challengeId: z.string(),
      familyId: z.string(),
      points: z.coerce.number(),
      reason: z.string().min(4),
    })
    .parse(Object.fromEntries(formData));
  await db.scoreAdjustment.create({
    data: { ...input, adjustedById: session.user.id },
  });
  await recalculateFamilyScore(input.challengeId, input.familyId);
  revalidatePath("/admin/leaderboard");
}
