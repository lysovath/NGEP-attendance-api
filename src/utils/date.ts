export function toUtcDateOnly(value: Date | string): Date {
    const d = typeof value === "string" ? new Date(value) : value;
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function dateKey(value: Date | string): string {
    return toUtcDateOnly(value).toISOString().slice(0, 10);
}

export function startOfIsoWeek(value: Date | string): Date {
    const d = toUtcDateOnly(value);
    const day = d.getUTCDay();
    const diff = (day === 0 ? -6 : 1) - day;
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diff));
}

export default toUtcDateOnly;
