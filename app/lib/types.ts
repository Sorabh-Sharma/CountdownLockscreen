export interface Milestone {
  id: string;
  label: string;
  date: string;
  tag: string; // e.g. "30 Coins" or "T-50d"
  coins?: number;
  completed: boolean;
}

export type BackgroundStyle =
  | "dynamic-auto"
  | "sage-valley"
  | "sunset-meadow"
  | "lavender-twilight"
  | "ocean-breeze";

export interface GoalFormData {
  title: string;
  targetDate: string;
  milestones: Milestone[];
  creatorName: string;
  backgroundStyle: BackgroundStyle;
  coinReward: number;
  avatar: string;
}

export const BG_STYLES: Record<
  BackgroundStyle,
  {
    label: string;
    skyGradient: string;
    hillPrimary: string;
    hillSecondary: string;
    ticketBg: string;
    ticketBorder: string;
    pillActive: string;
    badgeBg: string;
    accent: string;
    preview: string;
  }
> = {
  "dynamic-auto": {
    label: "✨ Live Dynamic (Auto)",
    skyGradient: "linear-gradient(180deg, #1f1d3d 0%, #35305c 40%, #544c7d 75%, #443c68 100%)",
    hillPrimary: "#2d2850",
    hillSecondary: "#3d3768",
    ticketBg: "#704f99",
    ticketBorder: "#5c3e80",
    pillActive: "#5a3e80",
    badgeBg: "#ece6f6",
    accent: "#704f99",
    preview: "bg-gradient-to-tr from-[#1f1d3d] via-[#d36952] to-[#8ba888]",
  },
  "sage-valley": {
    label: "Sage Valley (Day)",
    skyGradient: "linear-gradient(180deg, #8ba888 0%, #b3c99f 40%, #d8e5c2 75%, #c2d5a8 100%)",
    hillPrimary: "#8da652",
    hillSecondary: "#b3ca72",
    ticketBg: "#e8a023",
    ticketBorder: "#d48f18",
    pillActive: "#688a3c",
    badgeBg: "#eef5e6",
    accent: "#688a3c",
    preview: "bg-[#8ba888]",
  },
  "sunset-meadow": {
    label: "Sunset Meadow",
    skyGradient: "linear-gradient(180deg, #d98a72 0%, #f4b486 45%, #fedec5 80%, #ebd4c0 100%)",
    hillPrimary: "#d97753",
    hillSecondary: "#e8996b",
    ticketBg: "#dc6b45",
    ticketBorder: "#c65731",
    pillActive: "#b85633",
    badgeBg: "#fdf0e9",
    accent: "#dc6b45",
    preview: "bg-[#d98a72]",
  },
  "lavender-twilight": {
    label: "Lavender Twilight",
    skyGradient: "linear-gradient(180deg, #7c79a8 0%, #a49fc7 45%, #d5cfea 80%, #c4bddf 100%)",
    hillPrimary: "#6f6b9c",
    hillSecondary: "#8f8bbd",
    ticketBg: "#8f6fc4",
    ticketBorder: "#7858ad",
    pillActive: "#65499a",
    badgeBg: "#f2effa",
    accent: "#8f6fc4",
    preview: "bg-[#7c79a8]",
  },
  "ocean-breeze": {
    label: "Ocean Breeze",
    skyGradient: "linear-gradient(180deg, #6ba5b7 0%, #98c6d4 45%, #cbe3eb 80%, #b8dbe5 100%)",
    hillPrimary: "#498f9c",
    hillSecondary: "#6fb1bf",
    ticketBg: "#2d98aa",
    ticketBorder: "#1f8090",
    pillActive: "#247b8a",
    badgeBg: "#eaf5f7",
    accent: "#2d98aa",
    preview: "bg-[#6ba5b7]",
  },
};
