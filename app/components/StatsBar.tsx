"use client";

import { GoalFormData, BG_STYLES } from "../lib/types";
import { getDaysUntil, getProgressPercent } from "../lib/utils";

interface StatsBarProps {
  data: GoalFormData;
}

export default function StatsBar({ data }: StatsBarProps) {
  const daysLeft = data.targetDate ? getDaysUntil(data.targetDate) : null;
  const totalMilestones = (data.milestones || []).filter((m) => m?.label).length;
  const completedMilestones = (data.milestones || []).filter((m) => m?.completed && m?.label).length;
  const progress = getProgressPercent(data.milestones || [], data.targetDate);
  const theme = BG_STYLES[data.backgroundStyle] || BG_STYLES["sage-valley"];

  // Total coins collected
  const totalCoins = (data.milestones || []).reduce((acc, m) => {
    return acc + (m.completed ? m.coins || 30 : 0);
  }, data.coinReward || 25982);

  const cards = [
    {
      title: "Collected Coins",
      value: totalCoins.toLocaleString(),
      subtext: "+70 today",
      icon: "🪙",
      accentBg: "bg-[#fef7ea]",
      accentText: "text-[#d48f18]",
    },
    {
      title: "Daily Habits",
      value: `${completedMilestones} / ${totalMilestones}`,
      subtext: `${totalMilestones - completedMilestones} remaining`,
      icon: "🌱",
      accentBg: "bg-[#eef5e6]",
      accentText: "text-[#557530]",
    },
    {
      title: "Goal Deadline",
      value:
        daysLeft === null
          ? "Unset"
          : daysLeft < 0
          ? `${Math.abs(daysLeft)}d overdue`
          : `${daysLeft} Days`,
      subtext: data.targetDate ? `Due ${data.targetDate}` : "Set target date",
      icon: "🎯",
      accentBg: "bg-[#fbeeed]",
      accentText: "text-[#c24b38]",
    },
    {
      title: "Completion",
      value: `${progress}%`,
      subtext: `${completedMilestones} of ${totalMilestones} done`,
      icon: "✨",
      accentBg: "bg-[#eff6ff]",
      accentText: "text-[#2563eb]",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="cozy-card p-4 flex flex-col justify-between cozy-card-interactive"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#5c7053]">
                {card.title}
              </span>
              <div
                className={`w-7 h-7 rounded-xl ${card.accentBg} ${card.accentText} flex items-center justify-center text-sm shadow-xs`}
              >
                {card.icon}
              </div>
            </div>

            <div className="text-xl sm:text-2xl font-extrabold text-[#243021] font-display tracking-tight">
              {card.value}
            </div>

            <div className="text-[11px] font-medium text-[#798e70] mt-1">
              {card.subtext}
            </div>
          </div>
        ))}
      </div>

      {/* Progress pill meter */}
      <div className="cozy-card p-3.5 flex items-center gap-3">
        <span className="text-xs font-bold text-[#445938] flex items-center gap-1.5 flex-shrink-0">
          <span className="text-base">🏆</span>
          <span>Overall Progress</span>
        </span>
        <div className="flex-1 h-3 rounded-full bg-[#e7efe0] overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#8da652] to-[#688a3c] transition-all duration-500 shadow-xs"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-extrabold text-[#557530] font-display flex-shrink-0">
          {progress}%
        </span>
      </div>
    </div>
  );
}
