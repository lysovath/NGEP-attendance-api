import { prisma } from "../../lib/prisma.js";
import ApiError from "../../utils/ApiError.js";
import { toUtcDateOnly } from "../../utils/date.js";

class EnrollmentService {
    async buildRosterWhere(groupId: number, date: Date) {
        const day = toUtcDateOnly(date);
        const overrides = await prisma.groupOverride.findMany({
            where: { date: day },
            select: { traineeId: true, groupId: true },
        });

        const overriddenTraineeIds = overrides.map((o) => o.traineeId);
        const movedInIds = overrides
            .filter((o) => o.groupId === groupId)
            .map((o) => o.traineeId);

        return {
            OR: [
                { groupId, id: { notIn: overriddenTraineeIds } },
                { id: { in: movedInIds } },
            ],
        };
    }

    async getRoster(groupId: number, date: Date) {
        try {
            const where = await this.buildRosterWhere(groupId, date);
            const trainees = await prisma.trainee.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    studentId: true,
                    groupId: true,
                },
                orderBy: { name: "asc" },
            });
            return trainees;
        } catch (error) {
            throw ApiError.internal("Failed to retrieve roster");
        }
    }

    async getOverrides(date: Date, groupId?: number) {
        try {
            const day = toUtcDateOnly(date);
            const overrides = await prisma.groupOverride.findMany({
                where: { date: day, ...(groupId ? { groupId } : {}) },
                select: {
                    id: true,
                    groupId: true,
                    trainee: {
                        select: { id: true, name: true, email: true, studentId: true, groupId: true },
                    },
                },
            });
            return overrides;
        } catch (error) {
            throw ApiError.internal("Failed to retrieve overrides");
        }
    }

    async bulkAssign(groupId: number, date: Date, traineeIds: number[]) {
        try {
            const group = await prisma.group.findUnique({ where: { id: groupId } });
            if (!group) {
                throw ApiError.notFound("Group not found");
            }

            const day = toUtcDateOnly(date);

            await prisma.$transaction(
                traineeIds.map((traineeId) =>
                    prisma.groupOverride.upsert({
                        where: { traineeId_date: { traineeId, date: day } },
                        update: { groupId },
                        create: { traineeId, groupId, date: day },
                    })
                )
            );

            return this.getRoster(groupId, day);
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to assign trainees for the day");
        }
    }

    async removeAssignments(date: Date, traineeIds: number[], groupId?: number) {
        try {
            const day = toUtcDateOnly(date);
            const result = await prisma.groupOverride.deleteMany({
                where: {
                    date: day,
                    traineeId: { in: traineeIds },
                    ...(groupId ? { groupId } : {}),
                },
            });
            return { removed: result.count };
        } catch (error) {
            throw ApiError.internal("Failed to remove day assignments");
        }
    }

    async resetDay(date: Date, groupId?: number) {
        try {
            const day = toUtcDateOnly(date);
            const result = await prisma.groupOverride.deleteMany({
                where: { date: day, ...(groupId ? { groupId } : {}) },
            });
            return { removed: result.count };
        } catch (error) {
            throw ApiError.internal("Failed to reset day assignments");
        }
    }

    async copyDay(fromDate: Date, toDate: Date) {
        try {
            const from = toUtcDateOnly(fromDate);
            const to = toUtcDateOnly(toDate);

            const source = await prisma.groupOverride.findMany({
                where: { date: from },
                select: { traineeId: true, groupId: true },
            });

            if (source.length === 0) {
                return { copied: 0 };
            }

            await prisma.$transaction(
                source.map((o) =>
                    prisma.groupOverride.upsert({
                        where: { traineeId_date: { traineeId: o.traineeId, date: to } },
                        update: { groupId: o.groupId },
                        create: { traineeId: o.traineeId, groupId: o.groupId, date: to },
                    })
                )
            );

            return { copied: source.length };
        } catch (error) {
            throw ApiError.internal("Failed to copy day assignments");
        }
    }
}

export default new EnrollmentService();
