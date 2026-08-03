import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
const prisma = new PrismaClient();

const questions = [
  [
    1,
    "What did Daniel and his friends request instead of the king's food?",
    "vegetables and water",
  ],
  [
    1,
    "Who was the chief official who received Daniel and his friends?",
    "Ashpenaz",
  ],
  [2, "What did Nebuchadnezzar dream of?", "a great statue"],
  [2, "What material was the statue's head made of?", "gold"],
  [
    3,
    "Who were thrown into the blazing furnace?",
    "Shadrach Meshach and Abednego",
  ],
  [3, "What was seen with the three men in the fire?", "a fourth man"],
  [4, "What tree did Nebuchadnezzar see in his dream?", "a great tree"],
  [4, "How long would Nebuchadnezzar live like an animal?", "seven times"],
  [5, "What appeared on the wall at Belshazzar's feast?", "writing"],
  [5, "Who interpreted the writing on the wall?", "Daniel"],
  [6, "What animal pit was Daniel thrown into?", "lions den"],
  [6, "Who shut the lions' mouths?", "God"],
  [7, "How many beasts did Daniel see coming from the sea?", "four"],
  [
    7,
    "Who was given everlasting dominion in Daniel's vision?",
    "the Son of Man",
  ],
  [8, "What animals featured in Daniel's vision?", "ram and goat"],
  [8, "What did the little horn grow toward?", "the beautiful land"],
  [9, "How many times a day did Daniel pray?", "three"],
  [9, "What city was Daniel praying for?", "Jerusalem"],
  [10, "Who came to Daniel with a message?", "an angel"],
  [
    11,
    "Which kings were described as rising in Daniel's vision?",
    "kings of the north and south",
  ],
  [
    12,
    "Who will shine like stars forever?",
    "those who lead many to righteousness",
  ],
];

async function main() {
  await prisma.participantAnswer.deleteMany();
  await prisma.quizSession.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.roundFamily.deleteMany();
  await prisma.round.deleteMany();
  await prisma.challengeParticipant.deleteMany();
  await prisma.challengeFamily.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.family.deleteMany();
  await prisma.user.deleteMany();
  const passwordHash = await hash("VerseQuest2026!", 12);
  const admin = await prisma.user.create({
    data: {
      fullName: "Ada Grace",
      email: "admin@versequest.test",
      passwordHash,
      role: "ADMIN",
    },
  });
  const names = [
    "Bethel Family",
    "Eagles Family",
    "Grace Family",
    "Kingdom Family",
    "Lightbearers Family",
    "Shiloh Family",
  ];
  const families = [];
  for (let i = 0; i < names.length; i++) {
    const leader = await prisma.user.create({
      data: {
        fullName: `${names[i]} Leader`,
        email: `leader${i + 1}@versequest.test`,
        passwordHash,
        role: "FAMILY_LEADER",
      },
    });
    const family = await prisma.family.create({
      data: {
        name: names[i],
        leaderId: leader.id,
        phone: `08000000${i + 1}`,
        email: leader.email,
        location: "Main Campus",
      },
    });
    const members = [];
    for (let m = 1; m <= 3; m++) {
      const participantUser =
        m === 1
          ? await prisma.user.create({
              data: {
                fullName: `${names[i].replace(" Family", "")} Challenger ${m}`,
                email: `challenger${i + 1}@versequest.test`,
                passwordHash,
                role: "PARTICIPANT",
              },
            })
          : null;
      members.push(
        await prisma.familyMember.create({
          data: {
            familyId: family.id,
            userId: participantUser?.id,
            fullName: `${names[i].replace(" Family", "")} Challenger ${m}`,
            phone: `0801${i}${m}0000`,
            ageGroup: "18–25",
          },
        }),
      );
    }
    families.push({ family, members });
  }
  const challengeDate = new Date();
  challengeDate.setHours(11, 45, 0, 0);
  const challenge = await prisma.challenge.create({
    data: {
      title: "Daniel Bible Challenge 2026",
      slug: "daniel-courage-kingdoms",
      description: "A family Scripture challenge through Daniel chapters 1–12.",
      bibleBook: "Daniel",
      startChapter: 1,
      endChapter: 12,
      registrationDeadline: new Date(),
      challengeDate,
      participantsPerFamily: 2,
      defaultQuestionTime: 45,
      defaultQuestionMarks: 5,
      qualificationRules: "Top four families advance after preliminary rounds.",
      tieBreakerRules: "Tied families answer one timed tie-breaker.",
      status: "REGISTRATION_OPEN",
      createdById: admin.id,
    },
  });
  const rounds = await Promise.all(
    [
      ["Preliminary Round", 1, 10],
      ["Semi-final Round", 2, 7],
      ["Crown Round", 3, 5],
    ].map(([name, roundNumber, numberOfQuestions]) =>
      prisma.round.create({
        data: {
          challengeId: challenge.id,
          name: String(name),
          roundNumber: Number(roundNumber),
          numberOfQuestions: Number(numberOfQuestions),
          timePerQuestion: 45,
          qualificationLimit: roundNumber === 1 ? 4 : null,
          scheduledAt: new Date(
            `2026-09-${12 + Number(roundNumber)}T10:00:00Z`,
          ),
          status: roundNumber === 1 ? "READY" : "UPCOMING",
        },
      }),
    ),
  );
  for (let i = 0; i < families.length; i++) {
    const item = families[i];
    await prisma.challengeFamily.create({
      data: {
        challengeId: challenge.id,
        familyId: item.family.id,
        registrationStatus: "APPROVED",
        totalScore: (6 - i) * 12,
      },
    });
    for (const member of item.members.slice(0, 2))
      await prisma.challengeParticipant.create({
        data: {
          challengeId: challenge.id,
          familyId: item.family.id,
          familyMemberId: member.id,
          participantCode: `VQ26-${String(i + 1).padStart(2, "0")}-${member.id.slice(-4).toUpperCase()}`,
          approvalStatus: "APPROVED",
          checkedIn: i < 4,
        },
      });
    for (const round of rounds)
      await prisma.roundFamily.create({
        data: {
          roundId: round.id,
          familyId: item.family.id,
          roundScore: round.roundNumber === 1 ? (6 - i) * 12 : 0,
          position: round.roundNumber === 1 ? i + 1 : null,
          qualified: i < 4,
        },
      });
  }
  let firstQuestionId = "";
  for (let i = 0; i < questions.length; i++) {
    const [chapter, questionText, correctAnswer] = questions[i];
    const isChoice = i % 3 !== 0;
    const q = await prisma.question.create({
      data: {
        challengeId: challenge.id,
        roundId: i < 10 ? rounds[0].id : i < 17 ? rounds[1].id : rounds[2].id,
        bibleBook: "Daniel",
        chapter: Number(chapter),
        verseReference: `Daniel ${chapter}`,
        questionText: String(questionText),
        questionType: isChoice ? "MULTIPLE_CHOICE" : "SHORT_ANSWER",
        difficulty: i > 18 ? "HARD" : i % 4 === 0 ? "EASY" : "MEDIUM",
        correctAnswer: String(correctAnswer),
        marks: 5,
        timeLimit: 45,
        status: "READY",
        createdById: admin.id,
      },
    });
    if (!firstQuestionId) firstQuestionId = q.id;
    if (isChoice)
      await prisma.questionOption.createMany({
        data: [
          String(correctAnswer),
          "Nebuchadnezzar",
          "Jerusalem",
          "Seven",
        ].map((optionText, x) => ({
          questionId: q.id,
          label: String.fromCharCode(65 + x),
          optionText,
          isCorrect: x === 0,
        })),
      });
  }
  await prisma.quizSession.create({
    data: {
      roundId: rounds[0].id,
      startedById: admin.id,
      currentQuestionId: firstQuestionId,
      status: "READY",
    },
  });
  await prisma.announcement.createMany({
    data: [
      {
        challengeId: challenge.id,
        title: "Registration is open",
        message:
          "Family leaders may now submit their challengers for Daniel: Courage & Kingdoms.",
        createdById: admin.id,
      },
      {
        challengeId: challenge.id,
        title: "Study focus",
        message: "This week's study focus is Daniel chapters 1–3.",
        audience: "FAMILIES",
        createdById: admin.id,
      },
    ],
  });
  console.log("BibleChallenge seed complete.");
}
main().finally(() => prisma.$disconnect());
