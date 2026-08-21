import type { Request, Response, NextFunction } from "express";
import reportService from "./report.service.js";

function csvCell(value: unknown): string {
    return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

class ReportController {
    async getWeeklyReport(req: Request, res: Response, next: NextFunction) {
        try {
            const { groupId, courseId } = req.query;
            const report = await reportService.getWeeklyReport(
                groupId ? Number(groupId) : undefined,
                courseId ? Number(courseId) : undefined
            );
            return res.status(200).json({
                success: true,
                message: "Weekly report retrieved successfully",
                data: report,
            });
        } catch (error) {
            next(error);
        }
    }

    async exportWeeklyReport(req: Request, res: Response, next: NextFunction) {
        try {
            const { groupId, courseId, role } = req.query;
            const report = await reportService.getWeeklyReport(
                groupId ? Number(groupId) : undefined,
                courseId ? Number(courseId) : undefined
            );

            const people = role === "trainer" ? report.trainers : report.trainees;

            const header = [
                "name",
                "email",
                "studentId",
                ...report.weeks.map((w) => `${w.label} (P/A/L/E)`),
                "Total Present",
                "Total Absent",
                "Total Late",
                "Total Excused",
                "Sessions Recorded",
                "Attendance Rate %",
            ];

            const rows = people.map((p) => {
                const weekCols = report.weeks.map((w) => {
                    const c = p.byWeek[w.key] ?? { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, total: 0 };
                    return csvCell(`${c.PRESENT}/${c.ABSENT}/${c.LATE}/${c.EXCUSED}`);
                });
                return [
                    csvCell(p.name),
                    csvCell(p.email),
                    csvCell(p.studentId),
                    ...weekCols,
                    csvCell(p.totals.PRESENT),
                    csvCell(p.totals.ABSENT),
                    csvCell(p.totals.LATE),
                    csvCell(p.totals.EXCUSED),
                    csvCell(p.totals.total),
                    csvCell(p.totals.rate ?? ""),
                ].join(",");
            });

            const csv = [header.map(csvCell).join(","), ...rows].join("\r\n");

            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="weekly_report_${role === "trainer" ? "trainers" : "trainees"}.csv"`
            );
            return res.status(200).send(csv);
        } catch (error) {
            next(error);
        }
    }
}

export default new ReportController();
