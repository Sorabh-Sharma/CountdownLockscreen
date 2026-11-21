import { Milestone } from "./types";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function getDaysUntil(dateStr: string, currentDay?: Date | null): number {
  if (!dateStr || !currentDay) return 0;
  try {
    const parts = dateStr.split("-");
    let targetTime: number;
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      targetTime = new Date(year, month, day).getTime();
    } else {
      const target = new Date(dateStr);
      target.setHours(0, 0, 0, 0);
      targetTime = target.getTime();
    }
    const today = new Date(currentDay);
    today.setHours(0, 0, 0, 0);
    const diff = targetTime - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

export function formatMilestoneDate(dateStr: string, currentDay?: Date | null): { main: string; sub: string } {
  if (!dateStr) return { main: "By Today", sub: "Due Date" };
  try {
    const parts = dateStr.split("-");
    let formatted = dateStr;
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day) && month >= 1 && month <= 12) {
        formatted = `${day} ${MONTH_NAMES[month - 1]}`;
      }
    } else {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        formatted = `${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]}`;
      }
    }

    if (!currentDay) {
      return { main: formatted, sub: "Due Date" };
    }

    const daysLeft = getDaysUntil(dateStr, currentDay);
    const sub = daysLeft < 0 ? "Overdue" : daysLeft === 0 ? "Due Date" : `${daysLeft}d left`;
    return {
      main: daysLeft === 0 ? "By Today" : formatted,
      sub,
    };
  } catch {
    return { main: "By Today", sub: "Due Date" };
  }
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (month >= 1 && month <= 12) {
        return `${MONTH_NAMES[month - 1]} ${day}`;
      }
    }
    const d = new Date(dateStr);
    return `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCDate()}`;
  } catch {
    return dateStr;
  }
}

export function formatFullDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const fullMonths = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      if (month >= 1 && month <= 12) {
        return `${fullMonths[month - 1]} ${day}, ${year}`;
      }
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function generateTag(milestoneDate: string, targetDate: string): string {
  if (!milestoneDate || !targetDate) return "";
  const partsM = milestoneDate.split("-").map(Number);
  const partsT = targetDate.split("-").map(Number);
  if (partsM.length === 3 && partsT.length === 3) {
    const timeM = new Date(partsM[0], partsM[1] - 1, partsM[2]).getTime();
    const timeT = new Date(partsT[0], partsT[1] - 1, partsT[2]).getTime();
    const diff = Math.ceil((timeT - timeM) / (1000 * 60 * 60 * 24));
    return diff <= 0 ? `+${Math.abs(diff)}d` : `T-${diff}d`;
  }
  return "";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function sortMilestonesByDate(milestones: Milestone[]): Milestone[] {
  return [...milestones].sort((a, b) => {
    // 1. Ticked/completed tasks automatically move downward to the bottom
    if (a?.completed !== b?.completed) {
      return a?.completed ? 1 : -1;
    }

    // 2. Undated tasks ("By Today") come first
    if (!a?.date && !b?.date) return 0;
    if (!a?.date) return -1;
    if (!b?.date) return 1;

    // 3. Chronological sorting by ISO date string (YYYY-MM-DD)
    return a.date.localeCompare(b.date);
  });
}

export function getProgressPercent(
  milestones: Milestone[],
  targetDate: string
): number {
  if (!targetDate && milestones.length === 0) return 0;
  const totalCompleted = milestones.filter((m) => m?.completed).length;
  const total = milestones.filter((m) => m?.label).length;
  if (total === 0) return 0;
  return Math.round((totalCompleted / total) * 100);
}
