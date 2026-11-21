"use client";

import { GoalFormData, BG_STYLES, Milestone, BackgroundStyle } from "../lib/types";
import { generateId, formatMilestoneDate, sortMilestonesByDate } from "../lib/utils";
import { useState, useEffect } from "react";

interface PhonePreviewProps {
  data: GoalFormData;
  onChange: (data: GoalFormData) => void;
  onToggleMilestone?: (idOrIndex: string | number) => void;
  onReset?: () => void;
  onShare?: () => void;
  copied?: boolean;
}

export default function PhonePreview({
  data,
  onChange,
  onToggleMilestone,
  onReset,
  onShare,
  copied,
}: PhonePreviewProps) {
  const sortedMilestones = sortMilestonesByDate(data.milestones || []);
  const activeMilestones = sortedMilestones.filter((m) => m?.label);
  const completedCount = (data.milestones || []).filter((m) => m?.completed && m?.label).length;
  const totalCount = activeMilestones.length || 1;

  // Defer current date calculation to client effect to comply with Next.js prerender rules
  const [currentDay, setCurrentDay] = useState<Date | null>(null);
  const [clock, setClock] = useState<{ time: string; date: string } | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<"night" | "dawn" | "day" | "sunset">("night");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDay(now);

      const hoursNum = now.getHours();
      const hours = hoursNum.toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
      const month = now.toLocaleDateString("en-US", { month: "short" });
      const day = now.getDate();

      setClock({
        time: `${hours}:${minutes}`,
        date: `${weekday}, ${day} ${month}`,
      });

      // Live time-of-day detection for dynamic wallpaper
      if (hoursNum >= 5 && hoursNum < 8) {
        setTimeOfDay("dawn");
      } else if (hoursNum >= 8 && hoursNum < 17) {
        setTimeOfDay("day");
      } else if (hoursNum >= 17 && hoursNum < 20) {
        setTimeOfDay("sunset");
      } else {
        setTimeOfDay("night");
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic day/night palettes when in live auto mode
  const DYNAMIC_PALETTES = {
    night: {
      skyGradient: "linear-gradient(180deg, #181630 0%, #2f2954 40%, #4c4275 75%, #3e3560 100%)",
      hillPrimary: "#262145",
      hillSecondary: "#383161",
      ticketBg: "#6d4b99",
      ticketBorder: "#573a7e",
      pillActive: "#4e3373",
      badgeBg: "#ebe3f7",
      accent: "#6d4b99",
    },
    sunset: {
      skyGradient: "linear-gradient(180deg, #d36148 0%, #ea895e 40%, #fbcf9f 75%, #e4aa83 100%)",
      hillPrimary: "#bc4f30",
      hillSecondary: "#d66e4a",
      ticketBg: "#d45f37",
      ticketBorder: "#b84a24",
      pillActive: "#a83f1d",
      badgeBg: "#fcedea",
      accent: "#d45f37",
    },
    dawn: {
      skyGradient: "linear-gradient(180deg, #b0627d 0%, #d68181 40%, #fcd4b8 75%, #e0baa1 100%)",
      hillPrimary: "#7a4e58",
      hillSecondary: "#9e6971",
      ticketBg: "#c6634c",
      ticketBorder: "#ab4c36",
      pillActive: "#993f2c",
      badgeBg: "#faece9",
      accent: "#c6634c",
    },
    day: {
      skyGradient: "linear-gradient(180deg, #7da57b 0%, #a8c495 40%, #d8e5c2 75%, #c2d5a8 100%)",
      hillPrimary: "#7e9e48",
      hillSecondary: "#9db862",
      ticketBg: "#e09520",
      ticketBorder: "#c68015",
      pillActive: "#688a3c",
      badgeBg: "#eef5e6",
      accent: "#e09520",
    },
  };

  const isAutoMode = data.backgroundStyle === "dynamic-auto";
  const dynamicTheme = isAutoMode ? DYNAMIC_PALETTES[timeOfDay] : null;
  const baseTheme = BG_STYLES[data.backgroundStyle] || BG_STYLES["sage-valley"];
  const theme = dynamicTheme ? { ...baseTheme, ...dynamicTheme } : baseTheme;

  const isNight = isAutoMode ? timeOfDay === "night" : data.backgroundStyle === "lavender-twilight";
  const isSunset = isAutoMode ? timeOfDay === "sunset" : data.backgroundStyle === "sunset-meadow";

  // Active in-phone screen view: "habits" | "customize"
  const [activeTab, setActiveTab] = useState<"habits" | "customize">("habits");

  // Inline add task state on the phone
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newMilestone: Milestone = {
      id: generateId(),
      label: newTaskText.trim(),
      date: newTaskDate || "",
      tag: "Due Date",
      completed: false,
    };
    // Automatically sort chronologically from first to last date
    const updated = sortMilestonesByDate([...data.milestones, newMilestone]);
    onChange({
      ...data,
      milestones: updated,
    });
    setNewTaskText("");
    setNewTaskDate("");
    setIsAdding(false);
  };

  const handleDeleteMilestone = (id: string) => {
    onChange({
      ...data,
      milestones: data.milestones.filter((m) => m.id !== id),
    });
  };

  const updateField = (fields: Partial<GoalFormData>) => {
    onChange({ ...data, ...fields });
  };

  return (
    <div className="flex flex-col items-center select-none">
      {/* Explicitly eliminate any browser scrollbar from the phone view */}
      <style>{`
        .tasks-scroll-container,
        .tasks-scroll-container * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .tasks-scroll-container::-webkit-scrollbar,
        .tasks-scroll-container *::-webkit-scrollbar,
        .tasks-scroll-container::-webkit-scrollbar-thumb,
        .tasks-scroll-container::-webkit-scrollbar-track {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          background: transparent !important;
        }
      `}</style>

      {/* Smartphone Outer Shell */}
      <div
        className="relative rounded-[48px] overflow-hidden shadow-[0_28px_60px_-15px_rgba(35,55,25,0.28)] border-[6px] border-[#1d2719] bg-[#161f13]"
        style={{ width: 340, height: 690 }}
      >
        {/* Full Phone Wallpaper Backdrop (Visible softly behind translucent card) */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: theme.skyGradient }}
        />

        {/* Phone Dynamic Island */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-between px-3">
          <div className="w-2 h-2 rounded-full bg-[#1b2a1a] opacity-60" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#1e2e1d] border border-white/10" />
        </div>

        {/* ── TOP SECTION: Storybook Scenic Wallpaper with Real-Time Digital Phone Clock ── */}
        <div className="relative h-[285px] w-full overflow-hidden flex flex-col justify-between pt-10 px-4 pb-2 z-10">
          {/* Night Sky: Glowing Moon & Twinkling Stars */}
          {isNight && (
            <>
              {/* Glowing Crescent Moon */}
              <div className="absolute top-9 right-6 w-7 h-7 pointer-events-none drop-shadow-[0_0_14px_rgba(255,248,190,0.9)] z-0">
                <svg viewBox="0 0 32 32" className="w-full h-full">
                  <path
                    d="M 22 4 A 12 12 0 1 0 28 22 A 10 10 0 1 1 22 4 Z"
                    fill="#FFF9D2"
                  />
                </svg>
              </div>

              {/* Twinkling Stars */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <span className="absolute top-9 left-7 text-[10px] text-[#ffeaa7] animate-pulse">✦</span>
                <span className="absolute top-16 left-14 text-[7px] text-[#ffffff] animate-pulse" style={{ animationDelay: "300ms" }}>★</span>
                <span className="absolute top-11 left-32 text-[8px] text-[#ffeaa7] animate-pulse" style={{ animationDelay: "700ms" }}>✦</span>
                <span className="absolute top-20 right-20 text-[7px] text-[#ffffff] animate-pulse" style={{ animationDelay: "500ms" }}>★</span>
                <span className="absolute top-12 right-28 text-[9px] text-[#fff4be] animate-pulse" style={{ animationDelay: "1000ms" }}>✦</span>
              </div>
            </>
          )}

          {/* Sunset Glow: Setting Sun Disc */}
          {isSunset && (
            <div className="absolute bottom-16 left-10 w-16 h-16 rounded-full bg-gradient-to-t from-[#ff8547] to-[#ffd166] opacity-85 blur-[1px] pointer-events-none drop-shadow-[0_0_24px_rgba(255,130,50,0.85)] z-0" />
          )}

          {/* Day / Dawn: Fluffy Clouds */}
          {!isNight && (
            <>
              <div className="absolute top-10 left-5 w-16 h-8 bg-white/40 rounded-full blur-[1px] pointer-events-none" />
              <div className="absolute top-14 right-7 w-20 h-9 bg-white/40 rounded-full blur-[1px] pointer-events-none" />
            </>
          )}

          {/* Real-time Digital Phone Lock Screen Clock */}
          <div className="relative z-10 flex flex-col items-center justify-center pt-7 select-none text-white">
            <span
              suppressHydrationWarning
              className="text-[11px] font-semibold tracking-wider text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)] font-sans"
            >
              {clock?.date || "Friday, 20 Nov"}
            </span>
            <span
              suppressHydrationWarning
              className="text-[54px] font-extrabold tracking-tight text-white leading-none mt-1 drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] font-display"
            >
              {clock?.time || "12:00"}
            </span>
          </div>

          {/* Rolling Hills, Storybook Cottage & Swaying Autumn Deciduous Trees */}
          <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none z-0">
            <svg viewBox="0 0 340 100" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
              {/* Back Hills */}
              <path d="M-20 100 Q 90 30 190 60 Q 270 80 350 40 L 350 100 Z" fill={theme.hillSecondary} opacity="0.85" />
              <polygon points="40,45 35,60 45,60" fill="#3d5a27" opacity="0.5" />
              <polygon points="275,50 270,65 280,65" fill="#3d5a27" opacity="0.5" />

              {/* ── AUTUMN DECIDUOUS TREE 1: Amber Gold Maple (Left Hill) ── */}
              <g className="tree-sway-1">
                {/* Trunk & Split Branches */}
                <path
                  d="M 58 58 Q 59 44 60 37 Q 63 31 68 26 M 60 37 Q 56 31 51 27"
                  stroke="#4a301a"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Fluffy Deciduous Autumn Foliage Layers */}
                <ellipse cx="59" cy="27" rx="14" ry="11" fill="#b95e09" opacity="0.9" />
                <ellipse cx="53" cy="28" rx="11" ry="9" fill="#d35400" />
                <ellipse cx="67" cy="26" rx="11" ry="9" fill="#e67e22" />
                <ellipse cx="60" cy="20" rx="12" ry="10" fill="#f39c12" />
                <circle cx="56" cy="18" r="7" fill="#f5b041" />
                <circle cx="65" cy="19" r="6" fill="#f8c471" />
                <circle cx="50" cy="23" r="3" fill="#f39c12" />
                <circle cx="71" cy="23" r="3" fill="#f5b041" />
              </g>

              {/* Fore Hills */}
              <path d="M-20 100 Q 80 15 180 40 Q 280 55 350 20 L 350 100 Z" fill={theme.hillPrimary} />

              {/* ── AUTUMN DECIDUOUS SAPLING (Lower Left Slope) ── */}
              <g className="tree-sway-2">
                <path
                  d="M 23 66 Q 24 56 25 50 Q 28 45 30 40 M 25 50 Q 22 45 20 42"
                  stroke="#54371f"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="26" cy="42" r="8" fill="#d35400" />
                <circle cx="23" cy="39" r="7" fill="#e67e22" />
                <circle cx="29" cy="38" r="6" fill="#f39c12" />
                <circle cx="25" cy="34" r="5" fill="#f7dc6f" />
              </g>

              {/* Storybook Cottage */}
              <g transform="translate(170, 30) scale(0.55)">
                <rect x="26" y="-8" width="6" height="14" fill="#a0522d" rx="1" />
                <rect x="0" y="8" width="36" height="26" fill="#FFF8E7" rx="6" />
                <path d="M -4 10 Q 18 -6 40 10 Z" fill="#D9534F" />
                {/* Cottage Window glows warm yellow at night / sunset */}
                <circle
                  cx="12"
                  cy="18"
                  r="4"
                  fill={isNight || isSunset ? "#FFD700" : "#87CEEB"}
                  stroke={isNight || isSunset ? "#FFA500" : "#8B5A2B"}
                  strokeWidth="1.2"
                />
                <path d="M 22 34 L 22 22 Q 27 18 32 22 L 32 34 Z" fill="#8B5A2B" />
              </g>

              {/* ── AUTUMN DECIDUOUS TREE 2: Honey & Rust Beech (Near Cottage) ── */}
              <g className="tree-sway-2">
                <path
                  d="M 224 54 Q 225 43 226 36 Q 229 29 234 25 M 226 36 Q 222 30 219 26"
                  stroke="#4a301a"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                />
                <ellipse cx="225" cy="25" rx="13" ry="10" fill="#a04000" opacity="0.9" />
                <ellipse cx="220" cy="25" rx="10" ry="8" fill="#ca6f1e" />
                <ellipse cx="231" cy="24" rx="10" ry="8" fill="#e59866" />
                <ellipse cx="226" cy="18" rx="11" ry="8" fill="#f39c12" />
                <circle cx="223" cy="15" r="6" fill="#f9e79f" />
                <circle cx="230" cy="16" r="5" fill="#fad7a0" />
              </g>

              {/* ── AUTUMN DECIDUOUS TREE 3: Crimson & Burnt Oak (Right Hill Crest) ── */}
              <g className="tree-sway-3">
                <path
                  d="M 296 38 Q 297 27 299 21 Q 303 15 308 10 M 299 21 Q 294 16 289 13"
                  stroke="#482c16"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  fill="none"
                />
                <ellipse cx="297" cy="13" rx="16" ry="12" fill="#78281f" opacity="0.92" />
                <ellipse cx="289" cy="14" rx="12" ry="9" fill="#922b21" />
                <ellipse cx="305" cy="13" rx="12" ry="9" fill="#c0392b" />
                <ellipse cx="298" cy="7" rx="13" ry="9" fill="#d35400" />
                <circle cx="294" cy="5" r="7" fill="#e67e22" />
                <circle cx="303" cy="6" r="7" fill="#f39c12" />
                <circle cx="284" cy="11" r="3.5" fill="#e74c3c" />
                <circle cx="310" cy="11" r="3.5" fill="#f39c12" />
              </g>

              {/* Warm Autumn Bushes on the Hill */}
              <circle cx="38" cy="71" r="7" fill="#b95e09" />
              <circle cx="48" cy="74" r="9" fill="#78281f" />
              <circle cx="140" cy="65" r="5" fill="#d35400" />
              <circle cx="150" cy="67" r="6" fill="#e67e22" />
            </svg>
          </div>

          {/* ── AUTUMN WIND LEAVES SWEEPING FROM LEFT TO THE OTHER END ── */}
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            {/* Leaf 1: Amber Gold Maple Leaf */}
            <div className="absolute top-20 left-0 leaf-across-1">
              <svg width="20" height="20" viewBox="0 0 24 24" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                <path
                  d="M12 2 C13 5, 16 6, 19 6 C17 9, 19 12, 21 14 C17 14, 15 16, 14 20 C13 17, 11 17, 10 20 C9 16, 7 14, 3 14 C5 12, 7 9, 5 6 C8 6, 11 5, 12 2 Z"
                  fill="#f39c12"
                />
                <line x1="12" y1="2" x2="12" y2="22" stroke="#b95e09" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>

            {/* Leaf 2: Crimson Oak Leaf */}
            <div className="absolute top-36 left-0 leaf-across-2">
              <svg width="18" height="18" viewBox="0 0 24 24" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                <path
                  d="M12 3 C15 5, 17 8, 16 12 C18 13, 19 16, 17 19 C14 18, 13 20, 12 22 C11 20, 10 18, 7 19 C5 16, 6 13, 8 12 C7 8, 9 5, 12 3 Z"
                  fill="#c0392b"
                />
                <line x1="12" y1="3" x2="12" y2="23" stroke="#78281f" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>

            {/* Leaf 3: Honey Beech Leaf */}
            <div className="absolute top-48 left-0 leaf-across-3">
              <svg width="16" height="16" viewBox="0 0 20 20" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                <path
                  d="M10 2 C14 5, 16 10, 12 17 C10 16, 8 16, 6 17 C2 10, 4 5, 10 2 Z"
                  fill="#e67e22"
                />
                <line x1="10" y1="2" x2="9" y2="19" stroke="#935116" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>

            {/* Leaf 4: Warm Golden Sapling Leaf (Mid-Level Drift) */}
            <div className="absolute top-28 left-0 leaf-across-1" style={{ animationDelay: "1.6s" }}>
              <svg width="15" height="15" viewBox="0 0 20 20" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                <path
                  d="M10 2 C13 5, 15 9, 11 16 C9 15, 7 15, 5 16 C3 9, 5 5, 10 2 Z"
                  fill="#f5b041"
                />
                <line x1="10" y1="2" x2="9" y2="18" stroke="#d35400" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* ── BOTTOM SHEET: Translucent Frosted Glass Card ── */}
        <div className="relative -mt-6 bg-white/70 backdrop-blur-2xl border-t border-white/60 rounded-t-[36px] pt-3 px-4 pb-3 flex flex-col justify-between h-[430px] shadow-[0_-12px_35px_rgba(0,0,0,0.12)] z-30 overflow-hidden">
          {/* Subtle Swipe Chevron */}
          <div className="flex justify-center -mt-1 pb-1">
            <span className="text-[#3b4c34]/30 text-xs font-bold leading-none select-none">⌃</span>
          </div>

          {/* Header Row: Title, Counter & Add Button */}
          <div className="flex items-center justify-between pb-2 pt-0.5">
            <div>
              <h2 className="text-lg font-extrabold text-[#1f271b] font-display tracking-tight leading-tight">
                {activeTab === "habits" ? "Today's Focus" : "Theme & Palette"}
              </h2>
              <p className="text-[10px] text-[#789069] font-semibold">
                {activeTab === "habits"
                  ? "Track milestones & target dates"
                  : "Color theme & ticket appearance"}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Completed Count Badge */}
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/60 backdrop-blur-md border border-white/70 text-[#405923] text-xs font-bold shadow-2xs">
                <span>✓</span>
                <span>{completedCount}/{totalCount}</span>
              </div>

              {/* Quick Add Button */}
              {activeTab === "habits" && (
                <button
                  type="button"
                  onClick={() => setIsAdding(!isAdding)}
                  className="px-2.5 py-1 rounded-xl bg-[#688a3c] hover:bg-[#587932] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-2xs active:scale-95"
                  title="Add task with due date"
                >
                  <span>{isAdding ? "✕" : "+"}</span>
                  <span>{isAdding ? "Cancel" : "Add"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Segmented Pill Tabs */}
          <div className="p-1 bg-white/50 backdrop-blur-md rounded-full flex items-center gap-1 border border-white/60 mb-2.5 shadow-2xs">
            <button
              type="button"
              onClick={() => { setActiveTab("habits"); setIsAdding(false); }}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === "habits"
                  ? "bg-[#688a3c] text-white shadow-xs"
                  : "text-[#557530] hover:text-[#3d5521]"
              }`}
            >
              Tasks
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("customize"); setIsAdding(false); }}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === "customize"
                  ? "bg-[#688a3c] text-white shadow-xs"
                  : "text-[#557530] hover:text-[#3d5521]"
              }`}
            >
              Theme 🎨
            </button>
          </div>

          {/* ── TAB 1: TASKS WITH COMPLETION DEADLINE DATES ── */}
          {activeTab === "habits" && (
            <div
              className="flex-1 overflow-y-auto no-scrollbar tasks-scroll-container space-y-2 max-h-[310px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {/* Inline Add Task Form with Date */}
              {isAdding && (
                <form
                  onSubmit={handleAddTask}
                  className="p-3 rounded-2xl bg-[#f7faf4] border-2 border-dashed border-[#b3cb9f] space-y-2.5 shadow-xs animate-in fade-in"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[#445b2b]">
                    <span>+ New Task</span>
                    <span className="text-[10px] text-[#718861]">Max 5 tasks</span>
                  </div>
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="e.g. Submit internship application"
                    className="w-full bg-white border border-[#cde0c0] rounded-xl px-2.5 py-1.5 text-xs text-[#243021] placeholder-[#8ea084] focus:outline-none focus:border-[#688a3c]"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-1.5 text-[11px] font-bold text-[#5c7052]">
                      <span>📅</span>
                      <input
                        type="date"
                        value={newTaskDate}
                        onChange={(e) => setNewTaskDate(e.target.value)}
                        className="w-full bg-white border border-[#cde0c0] rounded-lg px-2 py-1 text-xs font-semibold text-[#243021]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-xl bg-[#688a3c] text-white text-xs font-bold shadow-xs hover:bg-[#587932]"
                    >
                      Save Task
                    </button>
                  </div>
                </form>
              )}

              {/* Golden Ticket Cards Showing the Completion Deadline Date */}
              {activeMilestones.length > 0 ? (
                activeMilestones.map((ms) => {
                  const dateInfo = formatMilestoneDate(ms.date, currentDay);
                  return (
                    <div
                      key={ms.id}
                      className={`group relative flex items-stretch rounded-2xl text-white select-none overflow-hidden transition-all duration-300 hover:brightness-105 active:scale-[0.99] ${
                        ms.completed
                          ? "opacity-90 shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                          : "shadow-[0_4px_14px_rgba(0,0,0,0.2)]"
                      }`}
                      style={{
                        backgroundColor: theme.ticketBg,
                        border: `1px solid ${theme.ticketBorder}`,
                      }}
                    >
                      {/* Left: Punch Button & Task Title */}
                      <div
                        onClick={() => onToggleMilestone?.(ms.id)}
                        className="flex-1 flex items-center gap-2.5 py-3 pl-3.5 pr-2 cursor-pointer relative z-10"
                      >
                        {/* Physical Ticket Punch / Wax Stamp Button */}
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                            ms.completed
                              ? "bg-white text-[#d48f18] cute-pop shadow-[0_2px_6px_rgba(0,0,0,0.25)] border-2 border-white"
                              : "bg-white/10 hover:bg-white/25 border-2 border-dashed border-white/80"
                          }`}
                          title={ms.completed ? "Tap to un-punch ticket" : "Tap to punch ticket"}
                        >
                          {ms.completed ? (
                            <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                              <path
                                d="M2.5 6.5L4.5 8.5L9.5 3.5"
                                stroke="currentColor"
                                strokeWidth="2.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            <span className="text-[10px] text-white/50 group-hover:text-white group-hover:scale-110 transition-all select-none">
                              ✂
                            </span>
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs font-bold leading-snug line-clamp-2 transition-all ${
                              ms.completed
                                ? "line-through text-white/70 decoration-white/60"
                                : "text-white"
                            }`}
                          >
                            {ms.label}
                          </p>
                        </div>
                      </div>

                      {/* Perforated Vertical Notch Line with Paper Hole Punch */}
                      <div className="relative w-[1px] my-1 ticket-perforation flex-shrink-0">
                        <div className="absolute -top-1 -left-[5px] w-2.5 h-2.5 rounded-full bg-white/80 shadow-inner" />
                        <div className="absolute -bottom-1 -left-[5px] w-2.5 h-2.5 rounded-full bg-white/80 shadow-inner" />
                        {ms.completed && (
                          <div className="absolute top-1/2 -translate-y-1/2 -left-[4px] w-2 h-2 rounded-full bg-white/90 shadow-inner punch-pop" />
                        )}
                      </div>

                      {/* Right: Ticket Stub with Target Date & Corner Punch */}
                      <div className="w-[82px] flex flex-col items-center justify-center py-2 px-1 text-center bg-black/10 flex-shrink-0 relative overflow-hidden">
                        {/* Physical Corner Clip when punched */}
                        {ms.completed && (
                          <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white/75 shadow-inner punch-pop" />
                        )}

                        <span
                          suppressHydrationWarning
                          className="text-[12px] font-extrabold font-display leading-tight truncate max-w-full"
                        >
                          {dateInfo.main}
                        </span>
                        <span
                          suppressHydrationWarning
                          className="text-[9px] font-semibold text-white/85 mt-0.5"
                        >
                          {dateInfo.sub}
                        </span>

                        {/* Quick delete button on hover */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMilestone(ms.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[10px] text-white/70 hover:text-white mt-0.5 transition-opacity leading-none"
                          title="Remove task"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Vintage "CLAIMED ★" Stamp Slam Overlay */}
                      {ms.completed && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20">
                          <div className="ticket-stamp px-3 py-0.5 rounded-md border-2 border-dashed border-white/95 bg-black/25 backdrop-blur-[0.5px] shadow-[0_2px_8px_rgba(0,0,0,0.3)] flex items-center gap-1.5">
                            <span className="text-[10px] font-black tracking-widest uppercase text-white font-display drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                              CLAIMED ★
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center text-xs text-[#6b8259] font-medium bg-[#f5f8f2] rounded-2xl border border-dashed border-[#ccd9c3] p-4">
                  <span className="text-2xl block mb-1">📅</span>
                  No tasks yet! Tap &quot;+ Add&quot; at top right to add a task with its target date.
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: CUSTOMIZE SETTINGS & WORLD THEME ── */}
          {activeTab === "customize" && (
            <div
              className="flex-1 overflow-y-auto no-scrollbar tasks-scroll-container space-y-3.5 min-h-0 text-xs [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {/* World Theme Swatches */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#384b2c] text-xs block">
                    Color Theme Palette
                  </label>
                  {isAutoMode && (
                    <span className="text-[10px] font-bold text-[#4c3a6b] bg-white/80 px-2 py-0.5 rounded-full border border-white/70 shadow-2xs animate-in fade-in">
                      {timeOfDay === "night"
                        ? "🌙 Live: Night"
                        : timeOfDay === "sunset"
                        ? "🌅 Live: Sunset"
                        : timeOfDay === "dawn"
                        ? "🌄 Live: Dawn"
                        : "☀️ Live: Day"}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(BG_STYLES) as [BackgroundStyle, (typeof BG_STYLES)[BackgroundStyle]][]).map(
                    ([key, style]) => {
                      const isSelected = data.backgroundStyle === key;
                      const labelText =
                        key === "dynamic-auto"
                          ? "✨ Live Auto"
                          : style?.label.split(" ")[0];
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => updateField({ backgroundStyle: key })}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "border-[#688a3c] bg-white/90 shadow-xs"
                              : "border-[#d8e4d2] bg-white/60 hover:bg-white/80 hover:border-[#b6cca5]"
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full ${style?.preview || "bg-green-500"} flex-shrink-0 shadow-xs border border-white`}
                          />
                          <span className="text-[11px] font-bold text-[#243021] truncate">
                            {labelText}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Minimal Action Bar (Fixed inside phone, centered) */}
          <div className="pt-2 pb-0.5 border-t border-white/50 flex items-center justify-center gap-2 mt-auto flex-shrink-0">
            <button
              type="button"
              onClick={onReset}
              className="py-1 px-3 rounded-xl text-[11px] font-bold text-[#455c32] hover:text-[#28381c] hover:bg-white/60 bg-white/40 border border-white/50 transition-all flex items-center gap-1 active:scale-95 shadow-2xs"
              title="Reset tasks"
            >
              <span>↺</span>
              <span>Reset</span>
            </button>

            <span className="w-1 h-1 rounded-full bg-[#3d522e]/30" />

            <button
              type="button"
              onClick={onShare}
              className={`py-1 px-3.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 active:scale-95 shadow-2xs ${
                copied
                  ? "bg-[#557831] text-white"
                  : "bg-white/50 hover:bg-white/70 text-[#3e591f] border border-white/60"
              }`}
              title="Share schedule summary"
            >
              <span>{copied ? "✓" : "✨"}</span>
              <span>{copied ? "Copied" : "Share"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
