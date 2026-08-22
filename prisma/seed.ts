import { PrismaClient, Role, SessionType, AttendanceStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not set in environment variables");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function at(hour: number, minute: number): Date {
    const d = new Date();
    d.setUTCHours(hour, minute, 0, 0);
    return d;
}

async function main() {
    const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { role: Role.ADMIN, isActive: true },
        create: { email: adminEmail, name: "Program Admin", role: Role.ADMIN },
    });

    const classA = await prisma.group.upsert({
        where: { name: "Class A" },
        update: {},
        create: { name: "Class A" },
    });

    const classB = await prisma.group.upsert({
        where: { name: "Class B" },
        update: {},
        create: { name: "Class B" },
    });

    const trainer = await prisma.user.upsert({
        where: { email: "trainer.a@example.com" },
        update: { role: Role.TRAINER, groupId: classA.id, isActive: true },
        create: { email: "trainer.a@example.com", name: "Trainer A", role: Role.TRAINER, groupId: classA.id },
    });

    const course = await prisma.course.upsert({
        where: { name: "Introduction to IT" },
        update: {},
        create: { name: "Introduction to IT" },
    });

    const groupCourseA = await prisma.groupCourse.upsert({
        where: { groupId_courseId: { groupId: classA.id, courseId: course.id } },
        update: {},
        create: { groupId: classA.id, courseId: course.id },
    });

    await prisma.groupCourse.upsert({
        where: { groupId_courseId: { groupId: classB.id, courseId: course.id } },
        update: {},
        create: { groupId: classB.id, courseId: course.id },
    });

    const traineeSeed = [
        { studentId: "S001", name: "Anan Prasit", email: "anan@example.com", groupId: classA.id },
        { studentId: "S002", name: "Ben Chai", email: "ben@example.com", groupId: classA.id },
        { studentId: "S003", name: "Cathy Lim", email: "cathy@example.com", groupId: classA.id },
        { studentId: "S004", name: "Dara Song", email: "dara@example.com", groupId: classB.id },
        { studentId: "S005", name: "Eve Meng", email: "eve@example.com", groupId: classB.id },
    ];

    for (const t of traineeSeed) {
        await prisma.trainee.upsert({
            where: { email: t.email },
            update: { name: t.name, studentId: t.studentId, groupId: t.groupId },
            create: t,
        });
    }

    const existingSessions = await prisma.session.count({
        where: { groupCourseId: groupCourseA.id },
    });

    if (existingSessions === 0) {
        await prisma.session.create({
            data: {
                groupCourseId: groupCourseA.id,
                name: "Theory - Day 1",
                type: SessionType.THEORY,
                startTime: at(9, 0),
                endTime: at(12, 0),
            },
        });

        await prisma.session.create({
            data: {
                groupCourseId: groupCourseA.id,
                name: "Lab - Day 1",
                type: SessionType.LAB,
                startTime: at(13, 0),
                endTime: at(16, 0),
            },
        });
    }

    const firstSession = await prisma.session.findFirst({
        where: { groupCourseId: groupCourseA.id },
        orderBy: { startTime: "asc" },
    });

    if (firstSession) {
        await prisma.trainerAttendance.upsert({
            where: { trainerId_sessionId: { trainerId: trainer.id, sessionId: firstSession.id } },
            update: { status: AttendanceStatus.PRESENT },
            create: { trainerId: trainer.id, sessionId: firstSession.id, status: AttendanceStatus.PRESENT },
        });
    }

    console.log("Seed complete.");
    console.log("Admin email:", admin.email);
    console.log("Groups: Class A, Class B | Course: Introduction to IT | Trainees: 5");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
