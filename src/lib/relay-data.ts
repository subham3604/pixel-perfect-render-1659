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

const baseResume = (company: string, role: string) => `# Subham Ghosh
Backend Engineer · Bengaluru · subham@applied.dev

## Summary
Backend engineer with 3 years building high-throughput services. Tailored for
**${role} @ ${company}** — grounded in Master Vault, 100% verified claims.

## Tech Stack
Python · FastAPI · Kafka · Redis · PostgreSQL · Docker · AWS

## Experience
**SDE-1, Payments Platform** (2023 — Present)
- Cut p99 checkout latency 38% by reworking Redis cache keys and batching writes.
- Built Kafka consumer group processing 4.2M settlement events/day with zero loss.
- Owned PostgreSQL partitioning migration across 900GB of ledger data.

## Projects
**Applied** — append-only event pipeline that tracks job applications from email.
**Kvstore** — Raft-backed key-value store in Go with snapshotting.

## Education
B.Tech, Computer Science — 2022
`;

export const APPLICATIONS: Application[] = [
  {
    id: "swiggy-sde2",
    company: "Swiggy",
    role: "Backend Engineer - SDE II",
    stage: "oa",
    source: "Naukri",
    applied: "Applied 6d ago",
    deadline: "OA Due: Sep 22, 11:59 PM",
    deadlineTone: "danger",
    stack: ["Python", "Kafka", "Redis"],
    priority: true,
    location: "Bengaluru",
    resume: baseResume("Swiggy", "Backend Engineer - SDE II"),
    timeline: [
      {
        id: "e1",
        title: "Applied (Manual Drop)",
        detail: "Pasted from Naukri mobile",
        date: "Sep 11",
        origin: "manual",
        payload: "Raw JD text pasted from Naukri app — 4,210 chars.",
      },
      {
        id: "e2",
        title: "Application Received (Gmail Worker)",
        detail: "Naukri confirmation email detected",
        date: "Sep 12",
        origin: "worker",
        payload: "From: no-reply@naukri.com\nSubject: Your application to Swiggy was sent",
      },
      {
        id: "e3",
        title: "OA Invite (Gmail Worker)",
        detail: "HackerRank assessment received, deadline Sep 20",
        date: "Sep 15",
        origin: "worker",
        payload: "From: mailer@hackerrank.com\nSubject: Swiggy SDE-II Online Assessment",
      },
      {
        id: "e4",
        title: "Interview Round 1 (Manual Override)",
        detail: "HR phone call scheduled for Sep 22",
        date: "Sep 16",
        origin: "override",
        payload: "Override note: recruiter called, moved to R1 pending OA result.",
      },
    ],
  },
  {
    id: "razorpay-be",
    company: "Razorpay",
    role: "Backend Engineer",
    stage: "applied",
    source: "LinkedIn",
    applied: "Applied 3d ago",
    stack: ["Go", "PostgreSQL"],
    location: "Bengaluru",
    resume: baseResume("Razorpay", "Backend Engineer"),
    timeline: [
      {
        id: "e1",
        title: "Applied (Manual Drop)",
        detail: "Pasted from LinkedIn desktop",
        date: "Sep 14",
        origin: "manual",
        payload: "Raw JD text pasted from LinkedIn — 2,880 chars.",
      },
    ],
  },
  {
    id: "zerodha-plat",
    company: "Zerodha",
    role: "Platform Engineer",
    stage: "applied",
    source: "Direct",
    applied: "Applied 1d ago",
    stack: ["Go", "Nginx"],
    location: "Bengaluru",
    resume: baseResume("Zerodha", "Platform Engineer"),
    timeline: [
      {
        id: "e1",
        title: "Applied (Manual Drop)",
        detail: "Careers portal direct submit",
        date: "Sep 16",
        origin: "manual",
        payload: "Submitted via careers.zerodha.com",
      },
    ],
  },
  {
    id: "flipkart-sde2",
    company: "Flipkart",
    role: "SDE II - Supply Chain",
    stage: "oa",
    source: "Gmail Auto",
    applied: "Applied 9d ago",
    deadline: "OA Due: Sep 24, 09:00 PM",
    deadlineTone: "warning",
    stack: ["Java", "Kafka"],
    location: "Bengaluru",
    resume: baseResume("Flipkart", "SDE II - Supply Chain"),
    timeline: [
      {
        id: "e1",
        title: "Applied (Manual Drop)",
        detail: "Pasted from careers portal",
        date: "Sep 8",
        origin: "manual",
        payload: "Raw JD — 3,110 chars.",
      },
      {
        id: "e2",
        title: "OA Invite (Gmail Worker)",
        detail: "Mettl assessment link received",
        date: "Sep 14",
        origin: "worker",
        payload: "From: noreply@mettl.com\nSubject: Flipkart SDE-II Assessment",
      },
    ],
  },
  {
    id: "atlassian-be",
    company: "Atlassian",
    role: "Backend Engineer II",
    stage: "interview",
    source: "LinkedIn",
    applied: "Applied 21d ago",
    deadline: "System Design: Sep 19, 04:00 PM",
    deadlineTone: "warning",
    stack: ["Java", "AWS"],
    priority: true,
    location: "Remote",
    resume: baseResume("Atlassian", "Backend Engineer II"),
    timeline: [
      {
        id: "e1",
        title: "Applied (Manual Drop)",
        detail: "Pasted from LinkedIn",
        date: "Aug 27",
        origin: "manual",
        payload: "Raw JD — 5,002 chars.",
      },
      {
        id: "e2",
        title: "Interview Round 1 (Gmail Worker)",
        detail: "Greenhouse scheduling email detected",
        date: "Sep 5",
        origin: "worker",
        payload: "From: no-reply@greenhouse.io\nSubject: Atlassian — Technical Screen",
      },
      {
        id: "e3",
        title: "Round 2 (Direct Override)",
        detail: "Recruiter confirmed system design round",
        date: "Sep 15",
        origin: "override",
        payload: "Override note: SD round on Sep 19.",
      },
    ],
  },
  {
    id: "postman-sde",
    company: "Postman",
    role: "SDE - API Platform",
    stage: "interview",
    source: "Naukri",
    applied: "Applied 14d ago",
    stack: ["Node", "Redis"],
    location: "Bengaluru",
    resume: baseResume("Postman", "SDE - API Platform"),
    timeline: [
      {
        id: "e1",
        title: "Applied (Manual Drop)",
        detail: "Pasted from Naukri",
        date: "Sep 3",
        origin: "manual",
        payload: "Raw JD — 2,440 chars.",
      },
      {
        id: "e2",
        title: "Interview Round 1 (Gmail Worker)",
        detail: "Recruiter screen completed",
        date: "Sep 12",
        origin: "worker",
        payload: "From: talent@postman.com\nSubject: Next steps",
      },
    ],
  },
  {
    id: "hasura-be",
    company: "Hasura",
    role: "Backend Engineer - GraphQL",
    stage: "offer",
    source: "Direct",
    applied: "Applied 32d ago",
    stack: ["Haskell", "PostgreSQL"],
    priority: true,
    location: "Remote",
    resume: baseResume("Hasura", "Backend Engineer - GraphQL"),
    timeline: [
      {
        id: "e1",
        title: "Applied (Manual Drop)",
        detail: "Direct referral submit",
        date: "Aug 16",
        origin: "manual",
        payload: "Referral by ex-colleague.",
      },
      {
        id: "e2",
        title: "Offer (Gmail Worker)",
        detail: "Offer letter email detected",
        date: "Sep 16",
        origin: "worker",
        payload: "From: people@hasura.io\nSubject: Offer of Employment",
      },
    ],
  },
  {
    id: "meesho-sde",
    company: "Meesho",
    role: "SDE II - Catalog",
    stage: "rejected",
    source: "Gmail Auto",
    applied: "Applied 27d ago",
    stack: ["Python", "Spark"],
    location: "Bengaluru",
    resume: baseResume("Meesho", "SDE II - Catalog"),
    timeline: [
      {
        id: "e1",
        title: "Applied (Manual Drop)",
        detail: "Pasted from Naukri mobile",
        date: "Aug 21",
        origin: "manual",
        payload: "Raw JD — 1,980 chars.",
      },
      {
        id: "e2",
        title: "Rejected (Gmail Worker)",
        detail: "Regret email detected",
        date: "Sep 9",
        origin: "worker",
        payload: "From: careers@meesho.com\nSubject: Update on your application",
      },
    ],
  },
];

export const SAMPLE_JD = `Backend Engineer - SDE II at Swiggy
Location: Bengaluru | Experience: 2-4 yrs

You will own high-throughput order and settlement services. Strong Python,
Kafka streaming, Redis caching and PostgreSQL schema design expected.`;
