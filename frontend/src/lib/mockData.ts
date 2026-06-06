export interface ProjectTrack {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  skills: string[];
  milestones: {
    id: string;
    title: string;
    description: string;
    order: number;
    tasks: { id: string; title: string; points: number }[];
  }[];
}

export const mockTracks: ProjectTrack[] = [
  {
    id: "track-1",
    title: "Full-Stack SaaS Architecture",
    description: "Build distributed architectures, real-time message brokers, and scale databases.",
    difficulty: "Advanced",
    skills: ["Next.js", "Express.js", "TypeScript", "Prisma", "Socket.IO", "Redis"],
    milestones: [
      {
        id: "m1",
        title: "Monorepo & Database Setup",
        description: "Initialize the workspace, docker config, and Prisma schemas.",
        order: 1,
        tasks: [
          { id: "t1", title: "Initialize yarn monorepo layout", points: 50 },
          { id: "t2", title: "Write SQLite migrations using Prisma", points: 80 },
        ]
      },
      {
        id: "m2",
        title: "JWT Authentication & RBAC Middleware",
        description: "Enforce secure login sessions and role-based api permissions.",
        order: 2,
        tasks: [
          { id: "t3", title: "Setup token verification handlers", points: 100 },
          { id: "t4", title: "Enforce student vs mentor role separation", points: 120 },
        ]
      },
      {
        id: "m3",
        title: "Websocket Engine & Notification Push",
        description: "Implement live dashboards updating on background calculations.",
        order: 3,
        tasks: [
          { id: "t5", title: "Initialize Socket.IO client-server", points: 150 },
          { id: "t6", title: "Broadcast Chaos score badge increments", points: 180 },
        ]
      }
    ]
  },
  {
    id: "track-2",
    title: "AI Integrations & Twin Engineering",
    description: "Orchestrate agentic LLMs, parsed resumes semantic search, and simulator chains.",
    difficulty: "Advanced",
    skills: ["OpenAI API", "Prompt Engineering", "TypeScript", "Vector Embeddings"],
    milestones: [
      {
        id: "m4",
        title: "AI Twin Forecast Models",
        description: "Design evaluation matrices measuring student employability matrices.",
        order: 1,
        tasks: [
          { id: "t7", title: "Configure openai schema validation parameters", points: 120 },
          { id: "t8", title: "Write fallback heuristic local generator", points: 150 },
        ]
      }
    ]
  }
];

export const mockMentors = [
  {
    id: "m-1",
    name: "Alex River",
    specialties: ["System Scalability", "Go", "Kubernetes"],
    rating: 4.9,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    availability: ["Mon 2-4 PM", "Wed 10-12 AM"]
  },
  {
    id: "m-2",
    name: "Sophia Martinez",
    specialties: ["Product Architecture", "Next.js", "AI Integrations"],
    rating: 4.8,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    availability: ["Tue 4-6 PM", "Fri 1-3 PM"]
  }
];

export const mockGigs = [
  {
    id: "job-1",
    company: "Stripe-like Tech Corp",
    title: "Billing System Integrator",
    description: "Implement recurring payments webhook listeners and invoice generation pipelines.",
    duration: "4 weeks",
    stipend: "$1,800 USD",
    requirements: ["React", "Express.js", "Webhooks"],
    logo: "💳"
  },
  {
    id: "job-2",
    company: "Linear Design Studio",
    title: "Performance & UI Developer",
    description: "Audit client render trees, optimize virtualized task boards, and implement micro-actions.",
    duration: "6 weeks",
    stipend: "$2,500 USD",
    requirements: ["Tailwind", "Framer Motion", "React Profiler"],
    logo: "⚡"
  }
];

export const mockSquads = [
  { id: "sq-1", name: "Cyber Knights", members: 3, compatibility: 95, targetTrack: "Full-Stack SaaS Architecture" },
  { id: "sq-2", name: "AI Hackers", members: 2, compatibility: 88, targetTrack: "AI Integrations & Twin Engineering" }
];

export const mockSkillTrends = [
  { name: "React 19 & Next.js 15", category: "TRENDING", demandScore: 9.8, avgSalary: 145000, growthRate: 45 },
  { name: "Agentic AI & OpenAI APIs", category: "FUTURE", demandScore: 9.9, avgSalary: 165000, growthRate: 85 },
  { name: "TypeScript & Prisma ORM", category: "TRENDING", demandScore: 9.2, avgSalary: 130000, growthRate: 35 },
  { name: "Legacy SOAP & REST APIs", category: "DECLINING", demandScore: 3.8, avgSalary: 92000, growthRate: -18 }
];

export const mockNotifications = [
  { id: "n-1", category: "PROJECT", title: "Chaos Score Evaluated!", message: "SaaS Database Setup milestone scored 92%. Badge level: GOLD.", time: "10 mins ago" },
  { id: "n-2", category: "SYSTEM", title: "Profile Synced", message: "Successfully imported commits from GitHub repo integrations.", time: "2 hours ago" }
];

// Recharts Datasets
export const mockEmployabilityTrend = [
  { month: "Jan", score: 62 },
  { month: "Feb", score: 65 },
  { month: "Mar", score: 69 },
  { month: "Apr", score: 75 },
  { month: "May", score: 78 },
  { month: "Jun", score: 84 },
];

export const mockChaosScoreTrend = [
  { track: "Monorepo Setup", innovation: 85, complexity: 78, uniqueness: 90 },
  { track: "JWT Guards", innovation: 65, complexity: 80, uniqueness: 70 },
  { track: "Websockets Engine", innovation: 92, complexity: 88, uniqueness: 95 }
];

export const mockSkillGrowth = [
  { subject: "Front-End UI", student: 88, benchmark: 75 },
  { subject: "APIs & Databases", student: 94, benchmark: 80 },
  { subject: "System Design", student: 72, benchmark: 85 },
  { subject: "AI Integrations", student: 85, benchmark: 70 },
  { subject: "DevOps & Cloud", student: 68, benchmark: 80 }
];

export const mockRecruiterPipeline = [
  { name: "Applied", value: 120 },
  { name: "Shortlisted", value: 45 },
  { name: "Interviewed", value: 18 },
  { name: "Selected", value: 6 }
];
