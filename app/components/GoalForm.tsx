"use client";

import { useState, useCallback } from "react";
import { GoalFormData, Milestone, BackgroundStyle, BG_STYLES } from "../lib/types";
import { generateId, generateTag } from "../lib/utils";

interface GoalFormProps {
  data: GoalFormData;
  onChange: (data: GoalFormData) => void;
}

const EMPTY_MILESTONE = (count: number): Milestone => ({
  id: generateId(),
  label: "",
  date: "",
  tag: "Coins",
  coins: 30 + count * 10,
  completed: false,
});

export default function GoalForm({ data, onChange }: GoalFormProps) {
  const [openSection, setOpenSection] = useState<string>("goal");

  const update = useCallback(
    (fields: Partial<GoalFormData>) => onChange({ ...data, ...fields }),
    [data, onChange]
  );

  const updateMilestone = (index: number, fields: Partial<Milestone>) => {
    const milestones = [...data.milestones];
    milestones[index] = { ...milestones[index], ...fields };
    if (fields.date !== undefined && data.targetDate) {
      milestones[index].tag = generateTag(fields.date || milestones[index].date, data.targetDate);
    }
    onChange({ ...data, milestones });
  };

  const addMilestone = () => {
    if (data.milestones.length >= 5) return;
    onChange({ ...data, milestones: [...data.milestones, EMPTY_MILESTONE(data.milestones.length)] });
  };

  const removeMilestone = (index: number) => {
    const milestones = data.milestones.filter((_, i) => i !== index);
    onChange({ ...data, milestones });
  };

  const Section = ({
    id,
    icon,
    title,
    subtitle,
    children,
  }: {
    id: string;
    icon: string;
    title: string;
    subtitle: string;
    children: React.ReactNode;
  }) => {
    const isOpen = openSection === id;
    return (
      <div className="cozy-card overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenSection(isOpen ? "" : id)}
          className="w-full flex items-center justify-between p-4 sm:p-5 bg-white hover:bg-[#fafcf8] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eef5e6] text-[#557530] flex items-center justify-center text-lg shadow-xs">
              {icon}
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#243021] font-display">
                {title}
              </h3>
              <p className="text-xs text-[#708564] font-medium">
                {subtitle}
              </p>
            </div>
          </div>
          <div
            className={`w-7 h-7 rounded-full bg-[#f1f6ed] flex items-center justify-center text-xs font-bold text-[#557530] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            ▾
          </div>
        </button>
        {isOpen && (
          <div className="p-4 sm:p-6 border-t border-[#edf3e8] bg-[#fcfdfa] space-y-4">
            {children}
          </div>
        )}
      </div>
    );
  };

  const inputClass =
    "w-full bg-white border border-[#d2dfcb] rounded-xl px-3.5 py-2.5 text-sm text-[#243021] placeholder-[#8ea084] focus:outline-none focus:border-[#688a3c] focus:ring-2 focus:ring-[#688a3c]/20 transition-all font-medium";

  return (
    <div className="space-y-4">
      {/* 1. Goal & Target Date */}
      <Section
        id="goal"
        icon="🎯"
        title="1. Main Goal & Target"
        subtitle="Set your goal title, deadline, and coin reward"
      >
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-[#445938] mb-1">
              Goal / Subtitle
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="e.g. COS coins collected"
              className={inputClass}
              maxLength={45}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#445938] mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                value={data.targetDate}
                onChange={(e) => {
                  const milestones = data.milestones.map((m) => ({
                    ...m,
                    tag: m.date ? generateTag(m.date, e.target.value) : m.tag,
                  }));
                  onChange({ ...data, targetDate: e.target.value, milestones });
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#445938] mb-1">
                Starting Coin Count
              </label>
              <input
                type="number"
                value={data.coinReward || 25982}
                onChange={(e) => update({ coinReward: Number(e.target.value) || 0 })}
                placeholder="25982"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* 2. Habits & Ticket Milestones */}
      <Section
        id="milestones"
        icon="🎟️"
        title="2. Habits & Ticket Cards"
        subtitle="Each checkpoint becomes a golden coupon ticket"
      >
        <div className="space-y-3">
          {data.milestones.map((ms, i) => (
            <div
              key={ms.id}
              className="p-3.5 rounded-2xl bg-white border border-[#d6e3cf] space-y-2.5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#557530] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-[#eef5e6] flex items-center justify-center text-[10px]">
                    0{i + 1}
                  </span>
                  <span>Habit / Milestone {i + 1}</span>
                </span>
                {data.milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMilestone(i)}
                    className="text-xs font-semibold text-[#dc4c38] hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                type="text"
                value={ms.label}
                onChange={(e) => updateMilestone(i, { label: e.target.value })}
                placeholder="e.g. Tidy up bathroom and bedroom"
                className={inputClass}
                maxLength={50}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#667a5b] mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={ms.date}
                    onChange={(e) => updateMilestone(i, { date: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#667a5b] mb-1">
                    Ticket Coins / Tag
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={ms.coins || 30 + i * 10}
                      onChange={(e) => updateMilestone(i, { coins: Number(e.target.value) || 0 })}
                      placeholder="30"
                      className={`${inputClass} w-20 text-center font-bold`}
                    />
                    <input
                      type="text"
                      value={ms.tag}
                      onChange={(e) => updateMilestone(i, { tag: e.target.value })}
                      placeholder="Coins"
                      className={`${inputClass} flex-1`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.milestones.length < 5 && (
          <button
            type="button"
            onClick={addMilestone}
            className="w-full py-3 rounded-2xl bg-[#eef5e6] hover:bg-[#e4eedb] border border-dashed border-[#b6cca5] text-xs font-bold text-[#557530] transition-colors flex items-center justify-center gap-2"
          >
            <span>+</span>
            <span>Add Ticket Milestone ({data.milestones.length}/5)</span>
          </button>
        )}
      </Section>

      {/* 3. Character & World Theme */}
      <Section
        id="style"
        icon="🎨"
        title="3. Character & Theme"
        subtitle="Choose your companion avatar and scenic landscape"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#445938] mb-1">
              Creator / Companion Name
            </label>
            <input
              type="text"
              value={data.creatorName}
              onChange={(e) => update({ creatorName: e.target.value })}
              placeholder="e.g. Abigail"
              className={inputClass}
              maxLength={25}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#445938] mb-2">
              Scenic Valley World Palette
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {(Object.entries(BG_STYLES) as [BackgroundStyle, (typeof BG_STYLES)[BackgroundStyle]][]).map(
                ([key, style]) => {
                  const isSelected = data.backgroundStyle === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => update({ backgroundStyle: key })}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? "border-[#688a3c] bg-[#eef5e6] shadow-xs"
                          : "border-[#d8e4d2] bg-white hover:border-[#b6cca5]"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full ${style?.preview || "bg-green-500"} flex-shrink-0 shadow-xs border border-white`}
                      />
                      <span className="text-xs font-bold text-[#243021]">
                        {style?.label || key}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
