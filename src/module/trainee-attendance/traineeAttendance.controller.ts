import type { Request, Response, NextFunction } from "express";
import traineeAttendanceService from "./traineeAttendance.service.js";
import { AttendanceStatus } from "@prisma/client";

const STATUS_CODE_MAP: Record<string, AttendanceStatus> = {
    P: AttendanceStatus.PRESENT,
    A: AttendanceStatus.ABSENT,
    L: AttendanceStatus.LATE,
    E: AttendanceStatus.EXCUSED,
    PRESENT: AttendanceStatus.PRESENT,
    ABSENT: AttendanceStatus.ABSENT,
    LATE: AttendanceStatus.LATE,
    EXCUSED: AttendanceStatus.EXCUSED,
};

function normalizeStatus(raw: string): AttendanceStatus | null {
    if (!raw) return null;
    return STATUS_CODE_MAP[raw.trim().toUpperCase()] ?? null;
}

class TraineeAttendanceController {
    async getTraineeAttendanceBySessionId(req: Request, res: Response, next: NextFunction) {
        try {
            const { sessionId } = req.params;
            const traineeAttendances = await traineeAttendanceService.getTraineeAttendances(Number(sessionId));
            return res.status(200).json({
                success: true,
                message: "Trainee attendances retrieved successfully",
                data: traineeAttendances,
            });
        } catch (error) {
            next(error);
        }
    }

    async batchCreateTraineeAttendance(req: Request, res: Response, next: NextFunction) {
        try {
            const { sessionId } = req.params;
            const attendanceData = req.body.map((data: { traineeId: number; status: string }) => ({
                traineeId: Number(data.traineeId),
                status: data.status,
            }));
            const traineeAttendances = await traineeAttendanceService.batchCreateTraineeAttendance(Number(sessionId), attendanceData);
            return res.status(201).json({
                success: true,
                message: "Trainee attendances created successfully",
                data: traineeAttendances,
            });
        } catch (error) {
            next(error);
        }
    }

    async importTraineeAttendance(req: Request, res: Response, next: NextFunction) {
        try {
            const { sessionId } = req.params;
            const rows = (Array.isArray(req.body) ? req.body : []).map(
                (data: { email: string; status: string }) => ({
                    email: String(data.email ?? "").trim(),
                    status: normalizeStatus(String(data.status ?? "")),
                })
            );

            const invalid = rows.filter((r) => !r.email || !r.status);
            const valid = rows
                .filter((r) => r.email && r.status)
                .map((r) => ({ email: r.email, status: r.status as AttendanceStatus }));

            const result = await traineeAttendanceService.importTraineeAttendance(Number(sessionId), valid);

            return res.status(200).json({
                success: true,
                message: "Attendance imported successfully",
                data: {
                    ...result,
                    invalidRows: invalid.length,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async exportRoster(req: Request, res: Response, next: NextFunction) {
        try {
            const { sessionId } = req.params;
            const result = await traineeAttendanceService.getTraineeAttendances(Number(sessionId));

            const header = "name,email,studentId,status";
            const lines = (result?.trainees ?? []).map((t) => {
                const safe = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
                const code =
                    t.status === "PRESENT"
                        ? "P"
                        : t.status === "ABSENT"
                        ? "A"
                        : t.status === "LATE"
                        ? "L"
                        : t.status === "EXCUSED"
                        ? "E"
                        : "";
                return [safe(t.name), safe(t.email), safe(t.studentId), safe(code)].join(",");
            });
            const csv = [header, ...lines].join("\r\n");

            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="attendance_session_${sessionId}.csv"`
            );
            return res.status(200).send(csv);
        } catch (error) {
            next(error);
        }
    }
}

export default new TraineeAttendanceController();