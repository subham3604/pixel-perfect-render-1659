export type Stage = "applied" | "oa" | "interview" | "offer" | "rejected";

export type Source = "Naukri" | "LinkedIn" | "Gmail Auto" | "Manual" | "Direct";

export type TimelineEvent = {
  id: string;
  title: string;
  detail: string;
  date: string;
  timestamp?: string | null;
  origin: "worker" | "manual" | "override";
  payload: string;
};

export type Application = {
  id: string;
  company: string;
  role: string;
  stage: Stage;
  source: Source;
  applied: string;
  applied_at?: string | null;
  deadline?: string;
  deadlineTone?: "warning" | "danger";
  stack: string[];
  priority?: boolean;
  location: string;
  timeline: TimelineEvent[];
  resume: string;
};

export const STAGES: { id: Stage; label: string; hint: string }[] = [
  { id: "applied", label: "Applied", hint: "Default stage" },
  { id: "oa", label: "OA Pending", hint: "Assessments / tests" },
  { id: "interview", label: "Interview Rounds", hint: "R1 · R2 · System Design" },
  { id: "offer", label: "Offer", hint: "Success" },
  { id: "rejected", label: "Rejected / Withdrawn", hint: "Archived" },
];

export const APPLICATIONS: Application[] = [];

export const SAMPLE_JD = `Backend Engineer - SDE II
Location: Bengaluru | Experience: 2-4 yrs

You will own high-throughput order and settlement services. Strong Python,
Kafka streaming, Redis caching and PostgreSQL schema design expected.`;
