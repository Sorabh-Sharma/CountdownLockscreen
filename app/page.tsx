"use client";

import { useState, useCallback } from "react";
import PhonePreview from "./components/PhonePreview";
import { GoalFormData } from "./lib/types";
import { generateId, formatMilestoneDate, sortMilestonesByDate } from "./lib/utils";

const DEFAULT_DATA: GoalFormData = {
  title: "Weekly Tasks & Goals",
  targetDate: "2026-11-25",
  coinReward: 0,
  milestones: [
    {
      id: "task-1",
      label: "Tidy up bathroom and bedroom",
      date: "2026-11-18",
      tag: "Due Date",
      completed: true,
    },
    {
      id: "task-2",
      label: "Physical activity (sports, workout, walk)",
      date: "2026-11-20",
      tag: "Due Date",
      completed: true,
    },
    {
      id: "task-3",
      label: "Read 20 pages of a book",
      date: "2026-11-22",
      tag: "Due Date",
      completed: false,
    },
    {
      id: "task-4",
      label: "Drink 2L water & take vitamins",
      date: "2026-11-23",
      tag: "Due Date",
      completed: false,
    },
    {
      id: "task-5",
      label: "Review weekly study goals",
      date: "2026-11-25",
      tag: "Due Date",
      completed: false,
    },
  ],
  creatorName: "Abigail",
  backgroundStyle: "dynamic-auto",
  avatar: "abigail",
};

export default function HomePage() {
  const [formData, setFormData] = useState<GoalFormData>(DEFAULT_DATA);
  const [copied, setCopied] = useState(false);

  const handleChange = useCallback((data: GoalFormData) => {
    setFormData(data);
  }, []);

  const toggleMilestone = useCallback((idOrIndex: string | number) => {
    setFormData((prev) => {
      const milestones = prev.milestones.map((m, idx) => {
        if (typeof idOrIndex === "string" ? m.id === idOrIndex : idx === idOrIndex) {
          return { ...m, completed: !m.completed };
        }
        return m;
      });
      // Automatically move completed tasks downward to the bottom,
      // and keep uncompleted tasks sorted chronologically from earliest to latest due date
      const sorted = sortMilestonesByDate(milestones);
      return { ...prev, milestones: sorted };
    });
  }, []);

  const handleShare = async () => {
    const sorted = sortMilestonesByDate(formData.milestones || []);
    const text = `🌟 Today's Focus & Milestones\n\nTasks Scheduled:\n${sorted
      .filter((m) => m.label)
      .map(
        (m, i) =>
          `${m.completed ? "✅" : "⬜"} 0${i + 1}. ${m.label} (Due: ${formatMilestoneDate(m.date).main})`
      )
      .join("\n")}\n\nCreated with Habit & Goal Lock Screen`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  const handleReset = () => {
    setFormData({
      title: "Weekly Tasks & Goals",
      targetDate: "2026-11-25",
      coinReward: 0,
      milestones: [
        {
          id: generateId(),
          label: "Tidy up bathroom and bedroom",
          date: "2026-11-18",
          tag: "Due Date",
          completed: true,
        },
        {
          id: generateId(),
          label: "Physical activity (sports, workout, walk)",
          date: "2026-11-20",
          tag: "Due Date",
          completed: true,
        },
        {
          id: generateId(),
          label: "Read 20 pages of a book",
          date: "2026-11-22",
          tag: "Due Date",
          completed: false,
        },
        {
          id: generateId(),
          label: "Drink 2L water & take vitamins",
          date: "2026-11-23",
          tag: "Due Date",
          completed: false,
        },
        {
          id: generateId(),
          label: "Review weekly study goals",
          date: "2026-11-25",
          tag: "Due Date",
          completed: false,
        },
      ],
      creatorName: "Abigail",
      backgroundStyle: "dynamic-auto",
      avatar: "abigail",
    });
  };

  return (
    <div className="min-h-screen bg-[#edf2e8] text-[#243021] font-sans flex flex-col items-center justify-center p-4 sm:p-8">
      {/* ── Main Container: Centered Phone Experience ── */}
      <main className="w-full max-w-md flex flex-col items-center gap-4 py-4 sm:py-6">
        {/* Subtle Top Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e3eed9] border border-[#d0e0c4] text-xs font-bold text-[#4e6c2d] shadow-2xs">
          <span>📅</span>
          <span>Today&apos;s Focus &middot; Interactive Lock Screen</span>
        </div>

        {/* Centered Phone Screen (Houses all tasks, live clock, tickets, and minimal actions) */}
        <PhonePreview
          data={formData}
          onChange={handleChange}
          onToggleMilestone={toggleMilestone}
          onReset={handleReset}
          onShare={handleShare}
          copied={copied}
        />

        {/* Quick User Tips */}
        <p className="text-[11px] text-[#748967] text-center font-medium max-w-xs">
          Each ticket stub shows the <b>target completion date</b>. Tap tickets to check them off!
        </p>
      </main>
    </div>
  );
}
