"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Brain, Award, Sparkles, Users, Target, TrendingUp, FolderGit, 
  BookOpen, Briefcase, Calendar, ShieldAlert, Settings, User, 
  Search, Filter, CheckCircle2, XCircle, ArrowRight, Lock, Mail, 
  Globe, Link2, Play, Flame, ChevronRight, Menu, Bell, LogOut, 
  Zap, Check, RotateCcw, Building, GraduationCap, Cpu, ShieldCheck
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  BarChart, Bar, PieChart, Pie, Cell 
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// Import mock data
import { 
  mockTracks, mockMentors, mockGigs, mockSquads, mockSkillTrends, 
  mockNotifications, mockEmployabilityTrend, mockChaosScoreTrend, 
  mockSkillGrowth, mockRecruiterPipeline 
} from "../lib/mockData";

export default function Home() {
  // Navigation & Page state
  const [activeView, setActiveView] = useState<"LANDING" | "LOGIN" | "SIGNUP" | "DASHBOARD">("LANDING");
  const [activeRole, setActiveRole] = useState<"STUDENT" | "MENTOR" | "RECRUITER" | "COMPANY" | "COLLEGE_ADMIN" | "SUPER_ADMIN">("STUDENT");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [diffFilter, setDiffFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false);

  // Auth User Session State (Mock)
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null);

  // Student specific project submissions
  const [submissions, setSubmissions] = useState<any[]>([
    { id: "sub-1", milestoneTitle: "Monorepo Setup & Database Modeling", repoUrl: "github.com/student/saas-db", status: "APPROVED", score: 92, feedback: "Excellent clean configuration." }
  ]);
  const [newRepoUrl, setNewRepoUrl] = useState("");
  const [selectedMilestone, setSelectedMilestone] = useState("m2");

  // Chaos score parameters
  const [chaosBreakdown, setChaosBreakdown] = useState({
    innovation: 85,
    complexity: 78,
    uniqueness: 90,
    impact: 80,
    contribution: 95
  });

  // Hiring Simulator chatbot state
  const [simType, setSimType] = useState<"TECHNICAL" | "HR">("TECHNICAL");
  const [simStage, setSimStage] = useState<"START" | "CHAT" | "RESULT">("START");
  const [simHistory, setSimHistory] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Welcome! Let's begin your technical interview assessment. Tell me about your experience scaling real-time applications." }
  ]);
  const [userInput, setUserInput] = useState("");
  const [simScore, setSimScore] = useState(88);
  const [simFeedback, setSimFeedback] = useState("");

  // AI vs AI Battle State
  const [battleStage, setBattleStage] = useState<"START" | "ANIMATION" | "RESULT">("START");
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [battleResult, setBattleResult] = useState<any>(null);

  // Simulated effect when switching tabs
  const handleTabChange = (tab: string) => {
    setLoading(true);
    setActiveTab(tab);
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  };

  // Mock Simulator chat interaction
  const sendSimMessage = () => {
    if (!userInput.trim()) return;
    const newMsg = { role: "user", content: userInput };
    const history = [...simHistory, newMsg];
    setSimHistory(history);
    setUserInput("");

    // Simulate AI thinking and replying
    setTimeout(() => {
      if (history.length >= 5) {
        // End interview simulation
        setSimStage("RESULT");
        setSimFeedback("Outstanding! You demonstrated robust command of event listeners and DB structures. Minor improvement needed in rate limiting configurations.");
      } else {
        const technicalFollowUps = [
          "Nice. How would you secure this architecture against DDoS and protect your API keys in production?",
          "How would you integrate a Redis caching tier to support quick sessions lookup?"
        ];
        const nextQ = technicalFollowUps[Math.floor(Math.random() * technicalFollowUps.length)];
        setSimHistory([...history, { role: "assistant", content: nextQ }]);
      }
    }, 1000);
  };

  // Mock AI Battle execution
  const runAIBattle = () => {
    setBattleStage("ANIMATION");
    setBattleLogs([]);
    
    const logs = [
      "⚔️ Student AI Twin initialized... Base Employability: 78%",
      "🤖 Company Hiring AI loaded filtering parameters: React, NodeJS, Docker, high Innovation index.",
      "🧠 Analyzer Node: Comparing Portfolio strength with developer index...",
      "🔥 Chaos Analyzer: Student Innovation index verified at 86 (badge LEVEL: GOLD).",
      "📡 Communication Engine: Interview simulation metrics validated at 88%.",
      "🏆 Arbiter: Computing matching matrix vectors..."
    ];

    logs.forEach((log, idx) => {
      setTimeout(() => {
        setBattleLogs(prev => [...prev, log]);
        if (idx === logs.length - 1) {
          setBattleResult({
            match: 86,
            tech: 92,
            comm: 84,
            culture: 78,
            decision: "HIRED"
          });
          setBattleStage("RESULT");
        }
      }, (idx + 1) * 600);
    });
  };

  // Form submission handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Extract values dynamically from the inputs
    const form = e.target as HTMLFormElement;
    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
    const nameInput = form.querySelector('input[placeholder="Alex Mercer"]') as HTMLInputElement;
    const passwordInput = form.querySelector('input[type="password"]') as HTMLInputElement;

    const emailVal = emailInput?.value || "student@skillos.ai";
    const nameVal = nameInput?.value || "Alex Mercer";
    const passwordVal = passwordInput?.value || "password123";

    try {
      // Try hitting the Express backend API
      const endpoint = activeView === "LOGIN" ? "/api/v1/auth/login" : "/api/v1/auth/signup";
      const payload = activeView === "LOGIN" 
        ? { email: emailVal, password: passwordVal }
        : { email: emailVal, password: passwordVal, fullName: nameVal, role: activeRole };

      const response = await fetch(`http://localhost:5050${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        // Save token to localstorage
        localStorage.setItem("skillos_token", data.accessToken);
        localStorage.setItem("skillos_refresh", data.refreshToken);
        
        const userObj = {
          email: data.user.email,
          name: data.user.profile?.fullName || nameVal,
          role: data.user.role
        };
        setUser(userObj);
        setActiveRole(data.user.role as any);
        
        // Match view tab to role
        if (data.user.role === "STUDENT") setActiveTab("dashboard");
        else if (data.user.role === "RECRUITER") setActiveTab("recruiter");
        else if (data.user.role === "COMPANY") setActiveTab("company");
        else if (data.user.role === "COLLEGE_ADMIN") setActiveTab("college");
        else if (data.user.role === "SUPER_ADMIN") setActiveTab("superadmin");
        
        setActiveView("DASHBOARD");
        setLoading(false);
        return;
      }
    } catch (err) {
      console.log("Backend offline, falling back to mock authentication.");
    }

    // Heuristic Fallback logic
    setTimeout(() => {
      const mockUser = {
        email: emailVal,
        name: nameVal,
        role: activeRole
      };
      setUser(mockUser);
      
      // Match view tab to role
      if (activeRole === "STUDENT") setActiveTab("dashboard");
      else if (activeRole === "RECRUITER") setActiveTab("recruiter");
      else if (activeRole === "COMPANY") setActiveTab("company");
      else if (activeRole === "COLLEGE_ADMIN") setActiveTab("college");
      else if (activeRole === "SUPER_ADMIN") setActiveTab("superadmin");
      
      setActiveView("DASHBOARD");
      setLoading(false);
    }, 400);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050608] text-slate-100">
      
      {/* 1. LANDING PAGE VIEW */}
      {activeView === "LANDING" && (
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <header className="flex justify-between items-center py-4 px-6 md:px-12 border-b border-white/[0.05] bg-black/40 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
                <Brain className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">SkillOS</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                id="btn-landing-login"
                onClick={() => setActiveView("LOGIN")} 
                className="text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Sign In
              </button>
              <button 
                id="btn-landing-signup"
                onClick={() => setActiveView("SIGNUP")} 
                className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white shadow-lg shadow-indigo-600/20 border border-indigo-500/30 transition duration-200"
              >
                Get Started
              </button>
            </div>
          </header>

          {/* Hero Section */}
          <main className="flex-1 flex flex-col justify-center items-center px-6 md:px-12 py-16 text-center max-w-5xl mx-auto relative">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
            <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

            {/* Tagline Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 px-3 py-1 bg-white/[0.03] border border-white/[0.08] rounded-full text-xs text-indigo-300 mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Autonomous Career Development Twin</span>
            </motion.div>

            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-7xl font-extrabold tracking-tight text-white mb-6"
            >
              SkillOS – AI Employability <br />
              <span className="text-gradient-purple">Twin Ecosystem</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-400 max-w-3xl mb-10 leading-relaxed"
            >
              Build your technical twin. Simulate advanced system design and HR interviews. 
              Recalculate your Chaos Score. Face company Recruiter AIs. Get verified and hired.
            </motion.p>

            {/* CTA buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-16"
            >
              <button 
                id="btn-hero-launch"
                onClick={() => {
                  setUser({ email: "student@skillos.ai", name: "Alex Mercer", role: "STUDENT" });
                  setActiveRole("STUDENT");
                  setActiveView("DASHBOARD");
                }}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl border border-indigo-500/30 shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition duration-200"
              >
                <span>Launch Student Console</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
              <button 
                id="btn-hero-recruiter"
                onClick={() => {
                  setUser({ email: "recruiter@stripe.com", name: "Stripe HR", role: "RECRUITER" });
                  setActiveRole("RECRUITER");
                  setActiveTab("recruiter");
                  setActiveView("DASHBOARD");
                }}
                className="px-8 py-4 bg-white/[0.03] hover:bg-white/[0.08] text-white font-medium rounded-xl border border-white/[0.08] flex items-center justify-center space-x-2 transition"
              >
                <span>Recruiter Portal</span>
              </button>
            </motion.div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mt-8">
              <div className="glass-panel p-6 rounded-2xl">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-lg border border-indigo-500/30 flex items-center justify-center mb-4">
                  <Brain className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">AI Employability Twin</h3>
                <p className="text-slate-400 text-sm">An autonomous companion mirroring your commits, resumes, and ratings to predict hiring compatibility.</p>
              </div>

              <div className="glass-panel p-6 rounded-2xl">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg border border-purple-500/30 flex items-center justify-center mb-4">
                  <Flame className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Chaos Score Engine</h3>
                <p className="text-slate-400 text-sm">Measure code complexity, innovation uniqueness, and project contributions dynamically to gain Titan badges.</p>
              </div>

              <div className="glass-panel p-6 rounded-2xl">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-lg border border-cyan-500/30 flex items-center justify-center mb-4">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">AI vs AI Hiring Battle</h3>
                <p className="text-slate-400 text-sm">Pits your twin model against real company recruitment profiles to filter matching vector alignment scores.</p>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* 2. AUTHENTICATION VIEWS */}
      {(activeView === "LOGIN" || activeView === "SIGNUP") && (
        <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="glass-panel max-w-md w-full p-8 rounded-2xl border border-white/[0.08]">
            <div className="text-center mb-8">
              <div className="inline-flex p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 mb-4">
                <Brain className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {activeView === "LOGIN" ? "Welcome Back to SkillOS" : "Create Your SkillOS Twin"}
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                {activeView === "LOGIN" ? "Access your dashboard and simulations" : "Join the global employability ecosystem"}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {activeView === "SIGNUP" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input required type="text" placeholder="Alex Mercer" className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition" />
                </div>
              )}
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input required type="email" placeholder="student@skillos.ai" className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/[0.08] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input required type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/[0.08] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition" />
                </div>
              </div>

              {activeView === "SIGNUP" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Primary Account Role</label>
                  <select 
                    className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-indigo-500 transition"
                    onChange={(e) => setActiveRole(e.target.value as any)}
                  >
                    <option value="STUDENT">Student (Standard)</option>
                    <option value="MENTOR">Mentor (Reviewer)</option>
                    <option value="RECRUITER">Company Recruiter</option>
                    <option value="COMPANY">Company Sponsor</option>
                    <option value="COLLEGE_ADMIN">College Admin</option>
                    <option value="SUPER_ADMIN">Super Administrator</option>
                  </select>
                </div>
              )}

              <button 
                id="btn-auth-submit"
                type="submit" 
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-lg border border-indigo-500/30 transition duration-200"
              >
                {activeView === "LOGIN" ? "Sign In" : "Register Twin Profile"}
              </button>
            </form>

            {/* Social Logins */}
            <div className="mt-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.08]"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0e0f14] px-2 text-slate-500">Or connect with</span></div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button type="button" className="py-2.5 bg-white/[0.02] border border-white/[0.08] rounded-lg text-slate-300 hover:text-white flex items-center justify-center transition"><Globe className="w-4 h-4" /></button>
                <button type="button" className="py-2.5 bg-white/[0.02] border border-white/[0.08] rounded-lg text-slate-300 hover:text-white flex items-center justify-center transition"><Link2 className="w-4 h-4" /></button>
                <button type="button" className="py-2.5 bg-white/[0.02] border border-white/[0.08] rounded-lg text-slate-300 hover:text-white flex items-center justify-center transition"><span className="text-xs font-semibold">Google</span></button>
              </div>
            </div>

            <div className="text-center mt-6 text-sm text-slate-400">
              {activeView === "LOGIN" ? (
                <span>New here? <button onClick={() => setActiveView("SIGNUP")} className="text-indigo-400 hover:underline">Create an account</button></span>
              ) : (
                <span>Already have a profile? <button onClick={() => setActiveView("LOGIN")} className="text-indigo-400 hover:underline">Sign In</button></span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. CORE APP DASHBOARD WORKSPACE */}
      {activeView === "DASHBOARD" && (
        <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar Navigation */}
          <aside className={`${sidebarOpen ? "w-64" : "w-0 md:w-20"} bg-[#0a0b0e] border-r border-white/[0.05] transition-all duration-300 flex flex-col z-20`}>
            
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-white/[0.05] justify-between">
              <div className="flex items-center space-x-2 overflow-hidden">
                <Brain className="w-6 h-6 text-indigo-400 shrink-0" />
                {sidebarOpen && <span className="text-lg font-bold text-white tracking-wider">SkillOS</span>}
              </div>
            </div>

            {/* Navigation Lists dynamically adjusted by chosen Role */}
            <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
              
              {/* STUDENT ROLE PAGES */}
              {activeRole === "STUDENT" && (
                <>
                  <div className={`text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2.5 mb-2 ${sidebarOpen ? "" : "hidden"}`}>Student Twin Console</div>
                  {[
                    { id: "dashboard", label: "Overview", icon: Brain },
                    { id: "projects", label: "Project Tracks", icon: FolderGit },
                    { id: "portfolio", label: "Living Portfolio", icon: Award },
                    { id: "chaos", label: "Chaos Center", icon: Flame },
                    { id: "twin", label: "AI Twin Profile", icon: Cpu },
                    { id: "simulator", label: "Hiring Simulator", icon: Play },
                    { id: "battle", label: "AI vs AI Battle", icon: Target },
                    { id: "squads", label: "Peer Squads", icon: Users },
                    { id: "mentors", label: "Mentor Network", icon: Calendar },
                    { id: "gigs", label: "Micro Gigs", icon: Briefcase },
                    { id: "skills", label: "Skills Intel", icon: TrendingUp },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabChange(item.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition duration-200 ${
                          activeTab === item.id 
                            ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-300" 
                            : "text-slate-400 hover:bg-white/[0.02] hover:text-slate-200"
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5 shrink-0" />
                        {sidebarOpen && <span>{item.label}</span>}
                      </button>
                    );
                  })}
                </>
              )}

              {/* RECRUITER ROLE PAGES */}
              {activeRole === "RECRUITER" && (
                <>
                  <div className={`text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2.5 mb-2 ${sidebarOpen ? "" : "hidden"}`}>Recruiter Controls</div>
                  <button onClick={() => handleTabChange("recruiter")} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition ${activeTab === "recruiter" ? "bg-indigo-600/10 text-indigo-300" : "text-slate-400"}`}>
                    <Users className="w-4.5 h-4.5" />
                    {sidebarOpen && <span>Talent Pipeline</span>}
                  </button>
                </>
              )}

              {/* COMPANY ROLE PAGES */}
              {activeRole === "COMPANY" && (
                <>
                  <div className={`text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2.5 mb-2 ${sidebarOpen ? "" : "hidden"}`}>Company Dashboard</div>
                  <button onClick={() => handleTabChange("company")} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition ${activeTab === "company" ? "bg-indigo-600/10 text-indigo-300" : "text-slate-400"}`}>
                    <Building className="w-4.5 h-4.5" />
                    {sidebarOpen && <span>Gigs Management</span>}
                  </button>
                </>
              )}

              {/* COLLEGE ADMIN ROLE PAGES */}
              {activeRole === "COLLEGE_ADMIN" && (
                <>
                  <div className={`text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2.5 mb-2 ${sidebarOpen ? "" : "hidden"}`}>College Panel</div>
                  <button onClick={() => handleTabChange("college")} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition ${activeTab === "college" ? "bg-indigo-600/10 text-indigo-300" : "text-slate-400"}`}>
                    <GraduationCap className="w-4.5 h-4.5" />
                    {sidebarOpen && <span>Placement Metrics</span>}
                  </button>
                </>
              )}

              {/* SUPER ADMIN PAGES */}
              {activeRole === "SUPER_ADMIN" && (
                <>
                  <div className={`text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2.5 mb-2 ${sidebarOpen ? "" : "hidden"}`}>System Control</div>
                  <button onClick={() => handleTabChange("superadmin")} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition ${activeTab === "superadmin" ? "bg-red-600/10 text-red-300" : "text-slate-400"}`}>
                    <ShieldAlert className="w-4.5 h-4.5" />
                    {sidebarOpen && <span>Super Admin</span>}
                  </button>
                </>
              )}

              {/* Shared settings footer */}
              <div className="pt-6 border-t border-white/[0.05] mt-6 space-y-1.5">
                <button onClick={() => handleTabChange("profile")} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition ${activeTab === "profile" ? "bg-indigo-600/10 text-indigo-300" : "text-slate-400"}`}>
                  <User className="w-4.5 h-4.5" />
                  {sidebarOpen && <span>Profile</span>}
                </button>
                <button onClick={() => handleTabChange("settings")} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition ${activeTab === "settings" ? "bg-indigo-600/10 text-indigo-300" : "text-slate-400"}`}>
                  <Settings className="w-4.5 h-4.5" />
                  {sidebarOpen && <span>Settings</span>}
                </button>
              </div>

            </nav>
            
            {/* User Account Info Footer */}
            <div className="p-4 border-t border-white/[0.05] bg-black/20">
              <div className="flex items-center justify-between">
                {sidebarOpen && (
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
                      {(user?.name || "Guest").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-white truncate">{user?.name || "Guest"}</div>
                      <div className="text-[10px] text-slate-500 truncate">{user?.email}</div>
                    </div>
                  </div>
                )}
                <button 
                  id="btn-sidebar-logout"
                  onClick={() => {
                    setUser(null);
                    setActiveView("LANDING");
                  }} 
                  className="p-1.5 hover:bg-white/[0.05] rounded-lg text-slate-400 hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Navigation */}
            <header className="h-16 border-b border-white/[0.05] bg-[#07080b]/80 backdrop-blur-md px-6 flex items-center justify-between z-10">
              
              <div className="flex items-center space-x-4">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 hover:bg-white/[0.05] rounded-lg text-slate-400 hover:text-white">
                  <Menu className="w-5 h-5" />
                </button>
                
                {/* Dynamic sandbox Role Selector switch */}
                <div className="flex items-center space-x-2 bg-white/[0.03] border border-white/[0.08] px-3 py-1 rounded-full text-xs">
                  <span className="text-slate-500">Active Role Selector:</span>
                  <select 
                    id="select-role-selector"
                    value={activeRole} 
                    onChange={(e) => {
                      const newRole = e.target.value as any;
                      setActiveRole(newRole);
                      if (newRole === "STUDENT") handleTabChange("dashboard");
                      if (newRole === "RECRUITER") handleTabChange("recruiter");
                      if (newRole === "COMPANY") handleTabChange("company");
                      if (newRole === "COLLEGE_ADMIN") handleTabChange("college");
                      if (newRole === "SUPER_ADMIN") handleTabChange("superadmin");
                    }}
                    className="bg-transparent text-indigo-300 font-semibold focus:outline-none border-none cursor-pointer"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="MENTOR">Mentor</option>
                    <option value="RECRUITER">Recruiter</option>
                    <option value="COMPANY">Company</option>
                    <option value="COLLEGE_ADMIN">College Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons & Notifications */}
              <div className="flex items-center space-x-4 relative">
                
                {/* Notifications Drawer Toggle */}
                <div className="relative">
                  <button 
                    id="btn-bell-toggle"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 bg-white/[0.02] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] text-slate-300 hover:text-white transition relative"
                  >
                    <Bell className="w-4.5 h-4.5" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-3 w-80 glass-panel border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden z-50 p-2 space-y-1"
                      >
                        <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.05]">
                          <span className="text-xs font-bold text-white">Notifications</span>
                          <button onClick={() => setNotifications([])} className="text-[10px] text-indigo-400 hover:underline">Clear all</button>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="text-center py-6 text-slate-500 text-xs">No new updates</div>
                          ) : (
                            notifications.map((n) => (
                              <div key={n.id} className="p-3 hover:bg-white/[0.02] rounded-lg transition border-b border-white/[0.02] last:border-0">
                                <div className="text-xs font-semibold text-white">{n.title}</div>
                                <div className="text-[11px] text-slate-400 mt-1">{n.message}</div>
                                <div className="text-[9px] text-slate-500 mt-2">{n.time}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="text-xs font-semibold text-slate-400 hidden sm:block">
                  Twin Connection: <span className="text-emerald-400">Online</span>
                </div>

              </div>

            </header>

            {/* Dashboard Subview Contents */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
              
              <AnimatePresence mode="wait">
                
                {loading ? (
                  /* Loading Skeletons */
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="h-8 bg-white/[0.04] w-48 rounded-md animate-pulse"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="h-32 bg-white/[0.04] rounded-xl animate-pulse"></div>
                      <div className="h-32 bg-white/[0.04] rounded-xl animate-pulse"></div>
                      <div className="h-32 bg-white/[0.04] rounded-xl animate-pulse"></div>
                    </div>
                    <div className="h-64 bg-white/[0.04] rounded-xl animate-pulse"></div>
                  </motion.div>
                ) : (
                  
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    
                    {/* A. STUDENT TAB: OVERVIEW */}
                    {activeRole === "STUDENT" && activeTab === "dashboard" && (
                      <div>
                        {/* Welcome Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                          <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Student Workspace</h1>
                            <p className="text-slate-400 text-sm mt-1">Mirroring developers profile vectors for modern recruiter reviews.</p>
                          </div>
                          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs font-medium text-slate-400">Agent Twin Status: Synthesized</span>
                          </div>
                        </div>

                        {/* Widgets Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                          
                          {/* Widget 1: Employability score */}
                          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl"></div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Employability Score</div>
                            <div className="flex items-baseline space-x-2">
                              <span className="text-4xl font-extrabold text-white">78%</span>
                              <span className="text-xs text-emerald-400 font-semibold flex items-center">
                                <TrendingUp className="w-3 h-3 mr-0.5" /> +4%
                              </span>
                            </div>
                            <div className="mt-4 w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: "78%" }}></div>
                            </div>
                          </div>

                          {/* Widget 2: Chaos Score */}
                          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl"></div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Chaos Score</div>
                            <div className="flex items-baseline space-x-2">
                              <span className="text-4xl font-extrabold text-white">82</span>
                              <span className="text-xs bg-purple-500/25 border border-purple-500/40 px-2 py-0.5 rounded text-purple-300 font-bold text-[10px]">
                                GOLD
                              </span>
                            </div>
                            <div className="mt-4 text-xs text-slate-400">
                              Top 15% innovation index score
                            </div>
                          </div>

                          {/* Widget 3: Active projects */}
                          <div className="glass-panel p-6 rounded-2xl">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Learning Gigs</div>
                            <div className="text-4xl font-extrabold text-white">1 / 2</div>
                            <div className="text-xs text-slate-400 mt-4 flex items-center">
                              <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                              Track: Full-Stack SaaS Architecture
                            </div>
                          </div>

                          {/* Widget 4: Internship progress */}
                          <div className="glass-panel p-6 rounded-2xl">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Micro Internships</div>
                            <div className="text-4xl font-extrabold text-white">Applied</div>
                            <div className="text-xs text-slate-400 mt-4">
                              1 application shortlisted for review
                            </div>
                          </div>

                        </div>

                        {/* Chart row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          {/* Skill growth radar */}
                          <div className="glass-panel p-6 rounded-2xl lg:col-span-1 min-h-[300px] flex flex-col">
                            <div className="text-xs font-bold text-white uppercase tracking-wider mb-4">Competency Index Radar</div>
                            <div className="flex-1 w-full min-h-[220px]">
                              <ResponsiveContainer width="100%" height={220}>
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockSkillGrowth}>
                                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                                  <Radar name="Student" dataKey="student" stroke="#818cf8" fill="#818cf8" fillOpacity={0.25} />
                                  <Radar name="Market Benchmark" dataKey="benchmark" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Employability over time line chart */}
                          <div className="glass-panel p-6 rounded-2xl lg:col-span-2 min-h-[300px] flex flex-col">
                            <div className="text-xs font-bold text-white uppercase tracking-wider mb-4">Employability Score Growth Trend</div>
                            <div className="flex-1 w-full min-h-[220px]">
                              <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={mockEmployabilityTrend}>
                                  <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <XAxis dataKey="month" stroke="#475569" fontSize={10} />
                                  <YAxis stroke="#475569" fontSize={10} domain={[40, 100]} />
                                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.08)" }} />
                                  <Area type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                        </div>

                      </div>
                    )}

                    {/* B. STUDENT TAB: PROJECT LEARNING HUB */}
                    {activeRole === "STUDENT" && activeTab === "projects" && (
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <h1 className="text-2xl font-bold text-white">Project Tracks Directory</h1>
                            <p className="text-slate-400 text-sm">Submit project milestones to verify technical knowledge.</p>
                          </div>
                          {/* Filters */}
                          <div className="flex items-center space-x-3 mt-4 md:mt-0">
                            <div className="relative">
                              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                              <input 
                                type="text" 
                                placeholder="Search tracks..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white/[0.02] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Tracks list */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {mockTracks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).map((track) => (
                            <div key={track.id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-4">
                                  <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full font-medium">{track.difficulty}</span>
                                  <div className="flex space-x-1.5">
                                    {track.skills.map((s, idx) => (
                                      <span key={idx} className="text-[10px] bg-white/[0.04] px-2 py-0.5 rounded text-slate-400">{s}</span>
                                    ))}
                                  </div>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{track.title}</h3>
                                <p className="text-slate-400 text-sm mb-6">{track.description}</p>
                                
                                <div className="space-y-3">
                                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Milestones Checklist</span>
                                  {track.milestones.map((m) => (
                                    <div key={m.id} className="flex items-start space-x-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                                      <div className="mt-0.5">
                                        <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[9px] text-slate-400 font-bold">
                                          {m.order}
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="text-xs font-bold text-white">{m.title}</h4>
                                        <p className="text-[11px] text-slate-400 mt-0.5">{m.description}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="mt-6 pt-4 border-t border-white/[0.05]">
                                <button 
                                  id={`btn-open-submit-${track.id}`}
                                  onClick={() => handleTabChange("projects")} 
                                  className="w-full py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 font-semibold text-xs rounded-xl border border-indigo-500/20 transition flex items-center justify-center space-x-2"
                                >
                                  <span>Start Project Track</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Submission Drawer Mock */}
                        <div className="glass-panel p-6 rounded-2xl mt-8 border border-indigo-500/20">
                          <h3 className="text-base font-bold text-white mb-2 flex items-center">
                            <FolderGit className="w-5 h-5 text-indigo-400 mr-2" />
                            Submit Completed Milestone Repo Link
                          </h3>
                          <p className="text-slate-400 text-xs mb-4">Milestones are graded automatically by AI engines first, then verified by assigned industry mentors.</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Milestone Target</label>
                              <select 
                                value={selectedMilestone} 
                                onChange={(e) => setSelectedMilestone(e.target.value)}
                                className="w-full px-4 py-2.5 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white"
                              >
                                <option value="m2">JWT Authentication & RBAC Middleware</option>
                                <option value="m3">Websocket Engine & Notification Push</option>
                              </select>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Github Repository URL</label>
                              <div className="flex space-x-3">
                                <input 
                                  type="text" 
                                  placeholder="github.com/alexmercer/skillos-rbac" 
                                  value={newRepoUrl}
                                  onChange={(e) => setNewRepoUrl(e.target.value)}
                                  className="flex-1 px-4 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                                />
                                <button 
                                  id="btn-project-submit"
                                  onClick={() => {
                                    if(!newRepoUrl) return;
                                    setSubmissions([...submissions, {
                                      id: `sub-${Date.now()}`,
                                      milestoneTitle: selectedMilestone === "m2" ? "JWT Authentication & RBAC Middleware" : "Websocket Engine & Notification Push",
                                      repoUrl: newRepoUrl,
                                      status: "PENDING",
                                      score: 0,
                                      feedback: null
                                    }]);
                                    setNewRepoUrl("");
                                    // Add a notification too
                                    setNotifications([
                                      { id: `n-${Date.now()}`, category: "PROJECT", title: "Project Milestone Submitted", message: "Awaiting automatic chaos engine grading.", time: "Just now" },
                                      ...notifications
                                    ]);
                                  }}
                                  className="px-6 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl border border-indigo-500/20"
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Submission History Table */}
                          <div className="mt-8">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Milestone Submissions Status</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead>
                                  <tr className="border-b border-white/[0.05] text-slate-500 font-medium">
                                    <th className="py-2.5">Target Milestone</th>
                                    <th>Repo Link</th>
                                    <th>Status</th>
                                    <th>Grade Score</th>
                                    <th>Feedback & Comments</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {submissions.map((sub) => (
                                    <tr key={sub.id} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.01]">
                                      <td className="py-3 font-semibold text-white">{sub.milestoneTitle}</td>
                                      <td className="text-slate-400 font-mono">{sub.repoUrl}</td>
                                      <td>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          sub.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                        }`}>
                                          {sub.status}
                                        </span>
                                      </td>
                                      <td className="font-bold text-white">{sub.score ? `${sub.score}%` : "--"}</td>
                                      <td className="text-slate-400 italic max-w-xs truncate">{sub.feedback || "Awaiting grader queue."}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* C. STUDENT TAB: LIVING PORTFOLIO */}
                    {activeRole === "STUDENT" && activeTab === "portfolio" && (
                      <div className="space-y-6">
                        <div>
                          <h1 className="text-2xl font-bold text-white">Living Portfolio</h1>
                          <p className="text-slate-400 text-sm mt-1">Timeline generated automatically from verified project submissions, chaos scores, and ratings.</p>
                        </div>

                        <div className="relative border-l border-white/[0.08] ml-4 pl-8 space-y-8 py-4">
                          
                          <div className="relative">
                            <div className="absolute -left-[41px] top-1.5 p-1 bg-[#050608] border-2 border-indigo-500 rounded-full">
                              <CheckCircle2 className="w-4.5 h-4.5 text-indigo-400" />
                            </div>
                            <div className="glass-panel p-5 rounded-2xl">
                              <span className="text-[10px] text-slate-500 font-mono">June 2026 • Verified Project</span>
                              <h3 className="text-base font-bold text-white mt-1">Completed: Monorepo Setup & Database Modeling</h3>
                              <p className="text-slate-400 text-sm mt-2">Verified milestone from track \"Full-Stack SaaS Architecture\". Implemented schema, indexes, and migrations using Prisma.</p>
                              <div className="mt-4 flex flex-wrap gap-2">
                                <span className="text-[10px] bg-white/[0.04] px-2 py-0.5 rounded text-slate-400">Prisma</span>
                                <span className="text-[10px] bg-white/[0.04] px-2 py-0.5 rounded text-slate-400">SQLite</span>
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">Grade: 92%</span>
                                <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">Chaos Score: 85</span>
                              </div>
                            </div>
                          </div>

                          <div className="relative">
                            <div className="absolute -left-[41px] top-1.5 p-1 bg-[#050608] border-2 border-indigo-500 rounded-full">
                              <CheckCircle2 className="w-4.5 h-4.5 text-indigo-400" />
                            </div>
                            <div className="glass-panel p-5 rounded-2xl">
                              <span className="text-[10px] text-slate-500 font-mono">May 2026 • Skills Verification</span>
                              <h3 className="text-base font-bold text-white mt-1">Verified Competency: Next.js 15 App Router</h3>
                              <p className="text-slate-400 text-sm mt-2">Demonstrated proficiency through 3 dynamic repository integrations with verified components rendering.</p>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* D. STUDENT TAB: CHAOS SCORE CENTER */}
                    {activeRole === "STUDENT" && activeTab === "chaos" && (
                      <div className="space-y-6">
                        <div>
                          <h1 className="text-2xl font-bold text-white">Chaos Score Center</h1>
                          <p className="text-slate-400 text-sm mt-1">Calculate code innovation complexity using advanced algorithmic weight factors.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          {/* Left: Score Sliders */}
                          <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-6">
                            <h3 className="text-base font-bold text-white">Interactive Weight Factor Simulator</h3>
                            
                            {[
                              { key: "innovation", label: "Innovation (25%)", desc: "Measures use of modern frameworks, custom abstractions, and agent loops." },
                              { key: "complexity", label: "Technical Complexity (25%)", desc: "Measures route optimizations, caching logic, and database scaling." },
                              { key: "uniqueness", label: "Uniqueness (20%)", desc: "Measures custom codebase abstractions and lack of boilerplate copies." },
                              { key: "impact", label: "Impact (20%)", desc: "Measures testing coverage, performance benchmarks, and deployment stability." },
                              { key: "contribution", label: "Team Contribution (10%)", desc: "Measures git commit frequencies, PR reviews, and squad synergy." },
                            ].map((item) => (
                              <div key={item.key} className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold">
                                  <span className="text-white">{item.label}</span>
                                  <span className="text-indigo-400">{(chaosBreakdown as any)[item.key]} / 100</span>
                                </div>
                                <p className="text-[11px] text-slate-500">{item.desc}</p>
                                <input 
                                  type="range" 
                                  min="0" 
                                  max="100" 
                                  value={(chaosBreakdown as any)[item.key]} 
                                  onChange={(e) => setChaosBreakdown({
                                    ...chaosBreakdown,
                                    [item.key]: parseInt(e.target.value)
                                  })}
                                  className="w-full h-1 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                              </div>
                            ))}
                          </div>

                          {/* Right: Calculated Badge preview */}
                          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between items-center text-center">
                            <div>
                              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Your Dynamic Graded Output</div>
                              <div className="w-32 h-32 rounded-full border-4 border-indigo-500/20 flex items-center justify-center relative glow-primary mb-6">
                                <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-sm"></div>
                                <div className="flex flex-col items-center">
                                  <span className="text-4xl font-extrabold text-white">
                                    {Math.round(
                                      (chaosBreakdown.innovation * 0.25) +
                                      (chaosBreakdown.complexity * 0.25) +
                                      (chaosBreakdown.uniqueness * 0.20) +
                                      (chaosBreakdown.impact * 0.20) +
                                      (chaosBreakdown.contribution * 0.10)
                                    )}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Chaos Score</span>
                                </div>
                              </div>
                              
                              <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6">
                                <Flame className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-bold text-purple-300">GOLD BADGE LEVEL</span>
                              </div>
                            </div>

                            <div className="text-xs text-slate-400 max-w-xs">
                              Score 60-74 yields <span className="text-indigo-400 font-semibold">GOLD</span> level. Score 75+ for <span className="text-purple-400 font-semibold">PLATINUM</span>. Score 90+ unlocks <span className="text-amber-400 font-semibold">TITAN</span>.
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* E. STUDENT TAB: AI EMPLOYABILITY TWIN */}
                    {activeRole === "STUDENT" && activeTab === "twin" && (
                      <div className="space-y-6">
                        <div>
                          <h1 className="text-2xl font-bold text-white">AI Employability Twin</h1>
                          <p className="text-slate-400 text-sm mt-1">Autonomous companion mirror based on parsed skills, chaos index metrics, and simulations.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          {/* Pulsing AI avatar */}
                          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.02] to-transparent"></div>
                            
                            <div className="w-24 h-24 rounded-full bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center mb-6 relative animate-float">
                              <div className="absolute inset-0 rounded-full border border-indigo-500/40 animate-ping opacity-25"></div>
                              <Cpu className="w-10 h-10 text-indigo-400" />
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1">{user?.name || "Guest"}'s Twin</h3>
                            <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase">ID: TWIN-8839-SAAS</span>
                            
                            {/* Confidence meter */}
                            <div className="w-full mt-6 bg-white/[0.04] p-4 rounded-xl border border-white/[0.05] text-left">
                              <div className="flex justify-between text-xs font-semibold mb-2">
                                <span className="text-slate-400">Twin Synthesis Confidence</span>
                                <span className="text-indigo-300">88%</span>
                              </div>
                              <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: "88%" }}></div>
                              </div>
                            </div>
                          </div>

                          {/* Twin Predictions & Skill gaps */}
                          <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-6">
                            <div>
                              <h3 className="text-base font-bold text-white mb-4">Hiring Predictions & Career Fit</h3>
                              <div className="space-y-3">
                                {[
                                  { role: "Full-Stack Web Architect", likelihood: 92 },
                                  { role: "AI Integrations Engineer", likelihood: 78 },
                                  { role: "Technical Product Lead", likelihood: 64 },
                                ].map((item, idx) => (
                                  <div key={idx} className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.05] flex items-center justify-between">
                                    <span className="text-xs font-bold text-white">{item.role}</span>
                                    <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-bold">{item.likelihood}% Likelihood</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="pt-4 border-t border-white/[0.05]">
                              <h3 className="text-base font-bold text-white mb-3">Identified Skill Gaps</h3>
                              <div className="flex flex-wrap gap-2">
                                <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full font-medium">Distributed Caching (Redis)</span>
                                <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full font-medium">Docker Orchestration</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* F. STUDENT TAB: HIRING SIMULATOR */}
                    {activeRole === "STUDENT" && activeTab === "simulator" && (
                      <div className="space-y-6">
                        <div>
                          <h1 className="text-2xl font-bold text-white">Interview Hiring Simulator</h1>
                          <p className="text-slate-400 text-sm mt-1">Engage in dynamic chat-based tech assessments and HR simulation dialogues.</p>
                        </div>

                        {simStage === "START" && (
                          <div className="glass-panel p-8 rounded-2xl text-center max-w-xl mx-auto space-y-6">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                              <Play className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Choose Interview Dimension</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <button 
                                id="btn-sim-tech"
                                onClick={() => setSimType("TECHNICAL")} 
                                className={`p-4 rounded-xl border text-left transition ${
                                  simType === "TECHNICAL" ? "bg-indigo-600/10 border-indigo-500/30" : "bg-white/[0.02] border-white/[0.08]"
                                }`}
                              >
                                <span className="block font-bold text-white text-sm">Technical Interview</span>
                                <span className="block text-slate-500 text-xs mt-1">System design, web hooks caching layers, and database schemas.</span>
                              </button>

                              <button 
                                id="btn-sim-hr"
                                onClick={() => setSimType("HR")} 
                                className={`p-4 rounded-xl border text-left transition ${
                                  simType === "HR" ? "bg-indigo-600/10 border-indigo-500/30" : "bg-white/[0.02] border-white/[0.08]"
                                }`}
                              >
                                <span className="block font-bold text-white text-sm">HR & Culture Fit</span>
                                <span className="block text-slate-500 text-xs mt-1">Team synergy dynamics, conflict resolution, and communication paths.</span>
                              </button>
                            </div>

                            <button 
                              id="btn-sim-start"
                              onClick={() => {
                                setSimStage("CHAT");
                                setSimHistory([
                                  { role: "assistant", content: `Welcome to your ${simType} Assessment. Let's begin. Describe your experience handling project tasks and scaling data endpoints.` }
                                ]);
                              }}
                              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg border border-indigo-500/30 transition"
                            >
                              Initialize Assessment
                            </button>
                          </div>
                        )}

                        {simStage === "CHAT" && (
                          <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[500px] border border-white/[0.08]">
                            {/* Chat Header */}
                            <div className="bg-black/30 px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
                              <span className="text-sm font-bold text-white">{simType} Interview Grader Node</span>
                              <span className="text-xs text-indigo-400 font-mono">Round {Math.floor(simHistory.length / 2) + 1} of 3</span>
                            </div>

                            {/* Chat History */}
                            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                              {simHistory.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                  <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                                    msg.role === "user" 
                                      ? "bg-indigo-600 text-white rounded-br-none" 
                                      : "bg-white/[0.03] border border-white/[0.08] text-slate-300 rounded-bl-none"
                                  }`}>
                                    {msg.content}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 border-t border-white/[0.05] bg-black/20 flex space-x-3">
                              <input 
                                type="text" 
                                placeholder="Type your answer here..." 
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) => { if(e.key === "Enter") sendSimMessage(); }}
                                className="flex-1 px-4 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                              />
                              <button 
                                id="btn-sim-send"
                                onClick={sendSimMessage}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl border border-indigo-500/20"
                              >
                                Send
                              </button>
                            </div>
                          </div>
                        )}

                        {simStage === "RESULT" && (
                          <div className="glass-panel p-8 rounded-2xl max-w-xl mx-auto text-center space-y-6">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Interview Assessment Completed</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                                <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider">Hiring Probability</span>
                                <span className="block text-2xl font-extrabold text-white mt-1">86%</span>
                              </div>
                              <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                                <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider">Communication Index</span>
                                <span className="block text-2xl font-extrabold text-white mt-1">92%</span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-400 text-left leading-relaxed bg-white/[0.01] p-4 rounded-xl border border-white/[0.05]">
                              {simFeedback}
                            </p>

                            <div className="text-left space-y-3">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Improvement Roadmap</span>
                              <div className="flex flex-wrap gap-2">
                                <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full">Explore Redis Rate Limiting</span>
                                <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full">Study distributed cache failures</span>
                              </div>
                            </div>

                            <button 
                              id="btn-sim-reset"
                              onClick={() => setSimStage("START")} 
                              className="w-full py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white font-semibold rounded-lg border border-white/[0.08] transition"
                            >
                              Run New Simulation
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* G. STUDENT TAB: AI VS AI HIRING BATTLE */}
                    {activeRole === "STUDENT" && activeTab === "battle" && (
                      <div className="space-y-6">
                        <div>
                          <h1 className="text-2xl font-bold text-white">AI vs AI Hiring Battle Arena</h1>
                          <p className="text-slate-400 text-sm mt-1">Test your synthesized twin models metrics against corporate filtering AI bots.</p>
                        </div>

                        {battleStage === "START" && (
                          <div className="glass-panel p-8 rounded-2xl max-w-xl mx-auto text-center space-y-6">
                            <div className="w-12 h-12 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                              <Flame className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Initiate Recruiter Matchmaking Battle</h3>
                            <p className="text-slate-400 text-xs">Pits student competency score averages against recruiter filters to calculate target hiring compatibility vectors.</p>
                            
                            <button 
                              id="btn-battle-initiate"
                              onClick={runAIBattle}
                              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg border border-indigo-500/30 transition"
                            >
                              Launch Match Battle
                            </button>
                          </div>
                        )}

                        {battleStage === "ANIMATION" && (
                          <div className="glass-panel p-8 rounded-2xl max-w-xl mx-auto space-y-4 border border-indigo-500/20">
                            <h3 className="text-sm font-bold text-white mb-2">Simulating Neural Alignment Matrix...</h3>
                            <div className="space-y-2 font-mono text-xs text-slate-400 min-h-[160px]">
                              {battleLogs.map((log, idx) => (
                                <div key={idx}>{log}</div>
                              ))}
                            </div>
                            <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full animate-pulse" style={{ width: `${(battleLogs.length / 6) * 100}%` }}></div>
                            </div>
                          </div>
                        )}

                        {battleStage === "RESULT" && battleResult && (
                          <div className="glass-panel p-8 rounded-2xl max-w-xl mx-auto text-center space-y-6 border border-emerald-500/20">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                              <ShieldCheck className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Battle Decision: HIRED</h3>
                            
                            <div className="grid grid-cols-4 gap-3 text-center">
                              {[
                                { label: "Matching", val: battleResult.match },
                                { label: "Technical", val: battleResult.tech },
                                { label: "Comm Index", val: battleResult.comm },
                                { label: "Culture Fit", val: battleResult.culture },
                              ].map((item, idx) => (
                                <div key={idx} className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                                  <span className="block text-slate-500 text-[9px] uppercase font-bold">{item.label}</span>
                                  <span className="block text-lg font-extrabold text-white mt-1">{item.val}%</span>
                                </div>
                              ))}
                            </div>

                            <p className="text-xs text-slate-400 text-left leading-relaxed bg-white/[0.01] p-4 rounded-xl border border-white/[0.05]">
                              <strong>Verdict:</strong> The Student's AI Twin matches the company's stack alignment. High complexity score badges verify performance stability. Proceeding directly to micro-gigs shortlisting.
                            </p>

                            <button 
                              id="btn-battle-reset"
                              onClick={() => setBattleStage("START")} 
                              className="w-full py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white font-semibold rounded-lg border border-white/[0.08] transition"
                            >
                              Relaunch Arena Match
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* H. STUDENT TAB: PEER SQUADS */}
                    {activeRole === "STUDENT" && activeTab === "squads" && (
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <h1 className="text-2xl font-bold text-white">Peer Squad Workspaces</h1>
                            <p className="text-slate-400 text-sm">Form compatibility squads with other student twins to complete tracks together.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {mockSquads.map((sq) => (
                            <div key={sq.id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                              <div>
                                <h3 className="text-lg font-bold text-white mb-1">{sq.name}</h3>
                                <span className="text-xs text-slate-500">Track target: {sq.targetTrack}</span>
                                <div className="mt-4 flex items-center space-x-6">
                                  <div>
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Members</span>
                                    <span className="text-base font-bold text-white">{sq.members} / 4</span>
                                  </div>
                                  <div>
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Compatibility Index</span>
                                    <span className="text-base font-bold text-indigo-400">{sq.compatibility}%</span>
                                  </div>
                                </div>
                              </div>
                              <button className="w-full py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 text-xs font-semibold rounded-xl border border-indigo-500/20 transition mt-6">
                                Join Active Squad Room
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* I. STUDENT TAB: MENTOR NETWORK */}
                    {activeRole === "STUDENT" && activeTab === "mentors" && (
                      <div className="space-y-6">
                        <div>
                          <h1 className="text-2xl font-bold text-white">Verified Mentor Network</h1>
                          <p className="text-slate-400 text-sm">Book 1-on-1 sessions for system design optimization and PR reviews.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {mockMentors.map((m) => (
                            <div key={m.id} className="glass-panel p-6 rounded-2xl flex space-x-4">
                              <img src={m.avatar} alt={m.name} className="w-14 h-14 rounded-full object-cover border border-white/[0.08]" />
                              <div className="flex-1 flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-start">
                                    <h3 className="text-base font-bold text-white">{m.name}</h3>
                                    <span className="text-xs text-amber-400 font-bold">★ {m.rating}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {m.specialties.map((s, idx) => (
                                      <span key={idx} className="text-[10px] bg-white/[0.04] px-2 py-0.5 rounded text-slate-400">{s}</span>
                                    ))}
                                  </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500">Next Slot: {m.availability[0]}</span>
                                  <button className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg border border-indigo-500/20">
                                    Book Session
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* J. STUDENT TAB: MICRO INTERNSHIP MARKETPLACE */}
                    {activeRole === "STUDENT" && activeTab === "gigs" && (
                      <div className="space-y-6">
                        <div>
                          <h1 className="text-2xl font-bold text-white">Micro Internship Marketplace</h1>
                          <p className="text-slate-400 text-sm">Apply to short gig contracts from sponsoring enterprise partners.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {mockGigs.map((g) => (
                            <div key={g.id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                              <div>
                                <div className="flex items-center space-x-3 mb-4">
                                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-xl">
                                    {g.logo}
                                  </div>
                                  <div>
                                    <h3 className="text-base font-bold text-white">{g.title}</h3>
                                    <span className="text-xs text-slate-500">{g.company}</span>
                                  </div>
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed mb-6">{g.description}</p>
                                <div className="flex space-x-6 text-xs mb-6">
                                  <div>
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Stipend</span>
                                    <span className="text-white font-bold">{g.stipend}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Duration</span>
                                    <span className="text-white font-bold">{g.duration}</span>
                                  </div>
                                </div>
                              </div>
                              <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl border border-indigo-500/20">
                                Submit Application
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* K. STUDENT TAB: SKILLS INTELLIGENCE */}
                    {activeRole === "STUDENT" && activeTab === "skills" && (
                      <div className="space-y-6">
                        <div>
                          <h1 className="text-2xl font-bold text-white">Skills Intelligence Engine</h1>
                          <p className="text-slate-400 text-sm">Industry demand vectors, compensation trends, and framework growth ratings.</p>
                        </div>

                        <div className="glass-panel rounded-2xl overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="bg-black/35 border-b border-white/[0.05] text-slate-500 font-medium">
                                  <th className="py-3 px-6">Skill Dimension</th>
                                  <th>Market Index</th>
                                  <th>Growth Velocity</th>
                                  <th>Avg Contractor Salary</th>
                                  <th className="pr-6">Trend Category</th>
                                </tr>
                              </thead>
                              <tbody>
                                {mockSkillTrends.map((st, idx) => (
                                  <tr key={idx} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                                    <td className="py-4 px-6 font-bold text-white">{st.name}</td>
                                    <td className="font-semibold text-white">{st.demandScore} / 10.0</td>
                                    <td className="text-emerald-400 font-semibold">+{st.growthRate}%</td>
                                    <td className="font-mono text-slate-300">${st.avgSalary.toLocaleString()} / yr</td>
                                    <td className="pr-6">
                                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                        st.category === "TRENDING" ? "bg-indigo-500/10 text-indigo-400" :
                                        st.category === "FUTURE" ? "bg-purple-500/10 text-purple-400" : "bg-red-500/10 text-red-400"
                                      }`}>
                                        {st.category}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* L. RECRUITER TAB: TALENT PIPELINE */}
                    {activeRole === "RECRUITER" && activeTab === "recruiter" && (
                      <div className="space-y-6">
                        <div>
                          <h1 className="text-2xl font-bold text-white">Talent Pipeline</h1>
                          <p className="text-slate-400 text-sm">Review student twin matches and simulation scores.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          {/* Funnel chart */}
                          <div className="glass-panel p-6 rounded-2xl lg:col-span-1 min-h-[300px] flex flex-col justify-between">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Pipeline Conversion</h3>
                            <div className="flex-1 w-full min-h-[200px]">
                              <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={mockRecruiterPipeline}>
                                  <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                                  <YAxis stroke="#475569" fontSize={10} />
                                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.08)" }} />
                                  <Bar dataKey="value" fill="#818cf8" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Candidates table */}
                          <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Matches Awaiting Review</h3>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead>
                                  <tr className="border-b border-white/[0.05] text-slate-500">
                                    <th className="py-2">Candidate</th>
                                    <th>Match Index</th>
                                    <th>Chaos Score</th>
                                    <th>Sim Rating</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                                    <td className="py-3 font-semibold text-white">Alex Mercer</td>
                                    <td className="text-indigo-400 font-bold">92%</td>
                                    <td>82 (GOLD)</td>
                                    <td className="text-emerald-400 font-semibold">92% Technical</td>
                                    <td>
                                      <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded">
                                        Shortlist
                                      </button>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* M. COMPANY TAB: GIGS MANAGEMENT */}
                    {activeRole === "COMPANY" && activeTab === "company" && (
                      <div className="space-y-6">
                        <div>
                          <h1 className="text-2xl font-bold text-white">Company Gigs Portal</h1>
                          <p className="text-slate-400 text-sm">Post micro-internships and sponsor student learning paths.</p>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl max-w-xl">
                          <h3 className="text-sm font-bold text-white mb-4">Post New Micro Internship</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Gig Contract Title</label>
                              <input type="text" placeholder="Billing system integrator" className="w-full px-4 py-2.5 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Stipend Rate</label>
                                <input type="text" placeholder="$1,800 USD" className="w-full px-4 py-2.5 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Contract Duration</label>
                                <input type="text" placeholder="4 weeks" className="w-full px-4 py-2.5 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                              </div>
                            </div>
                            <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition">
                              Publish Listing
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* N. COLLEGE ADMIN TAB: METRICS */}
                    {activeRole === "COLLEGE_ADMIN" && activeTab === "college" && (
                      <div className="space-y-6">
                        <div>
                          <h1 className="text-2xl font-bold text-white">College Placement Statistics</h1>
                          <p className="text-slate-400 text-sm">Review employability metrics and placement ratios across batches.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          
                          <div className="glass-panel p-6 rounded-2xl text-center">
                            <span className="text-slate-500 text-xs font-bold uppercase">Average Employability Index</span>
                            <span className="block text-4xl font-extrabold text-white mt-2">72%</span>
                          </div>

                          <div className="glass-panel p-6 rounded-2xl text-center">
                            <span className="text-slate-500 text-xs font-bold uppercase">Active Students Placed</span>
                            <span className="block text-4xl font-extrabold text-white mt-2">12 / 48</span>
                          </div>

                          <div className="glass-panel p-6 rounded-2xl text-center">
                            <span className="text-slate-500 text-xs font-bold uppercase">Badge Rank Leaders (Gold+)</span>
                            <span className="block text-4xl font-extrabold text-white mt-2">8 Students</span>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* O. SUPER ADMIN TAB: MANAGEMENT */}
                    {activeRole === "SUPER_ADMIN" && activeTab === "superadmin" && (
                      <div className="space-y-6">
                        <div>
                          <h1 className="text-2xl font-bold text-red-400">Super Admin Command Center</h1>
                          <p className="text-slate-400 text-sm">Review system configurations, API status, and database logs.</p>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl space-y-4">
                          <h3 className="text-sm font-bold text-white">System Environment Controls</h3>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                              <span className="block text-slate-500 text-[9px] uppercase font-bold">AWS Mock Storage</span>
                              <span className="block text-xs text-emerald-400 font-bold mt-1">ACTIVE (MOCK)</span>
                            </div>
                            <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                              <span className="block text-slate-500 text-[9px] uppercase font-bold">OpenAI Integrations</span>
                              <span className="block text-xs text-emerald-400 font-bold mt-1">ACTIVE (MOCK)</span>
                            </div>
                            <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                              <span className="block text-slate-500 text-[9px] uppercase font-bold">SQLite Primary DB</span>
                              <span className="block text-xs text-white font-mono mt-1">skillos.db</span>
                            </div>
                            <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                              <span className="block text-slate-500 text-[9px] uppercase font-bold">Socket.io Connections</span>
                              <span className="block text-xs text-emerald-400 font-bold mt-1">2 Active</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* P. SHARED PROFILE TAB */}
                    {activeTab === "profile" && (
                      <div className="space-y-6">
                        <div>
                          <h1 className="text-2xl font-bold text-white">User Profile</h1>
                          <p className="text-slate-400 text-sm">Manage certifications, work experience, and developer profiles links.</p>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl max-w-xl space-y-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl font-bold text-indigo-300">
                              {(user?.name || "Guest").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">{user?.name || "Guest"}</h3>
                              <p className="text-xs text-slate-500">Student account since May 2026</p>
                            </div>
                          </div>

                          <div className="space-y-3 pt-4 border-t border-white/[0.05]">
                            <div>
                              <span className="block text-[10px] text-slate-500 uppercase font-bold">GitHub Profile</span>
                              <span className="text-xs text-indigo-400 hover:underline cursor-pointer">github.com/alexmercer</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-500 uppercase font-bold">LinkedIn Profile</span>
                              <span className="text-xs text-indigo-400 hover:underline cursor-pointer">linkedin.com/in/alex-mercer</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-500 uppercase font-bold">Resume Link</span>
                              <span className="text-xs text-slate-300">alex-mercer-portfolio-cv.pdf</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Q. SHARED SETTINGS TAB */}
                    {activeTab === "settings" && (
                      <div className="space-y-6">
                        <div>
                          <h1 className="text-2xl font-bold text-white">Settings</h1>
                          <p className="text-slate-400 text-sm">System credentials, caching configurations, and OAuth scopes.</p>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl max-w-xl space-y-4">
                          <h3 className="text-sm font-bold text-white">Account Configurations</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                              <div>
                                <span className="block text-xs font-bold text-white">Email Verification</span>
                                <span className="block text-[10px] text-slate-500">Enable verification link checks on signup.</span>
                              </div>
                              <span className="text-xs text-emerald-400 font-bold">Verified</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                              <div>
                                <span className="block text-xs font-bold text-white">In-Memory Cache (TTL)</span>
                                <span className="block text-[10px] text-slate-500">Speed up query listings for trending skills.</span>
                              </div>
                              <span className="text-xs text-indigo-400 font-bold">Active (300s)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </motion.div>
                )}

              </AnimatePresence>

            </main>

          </div>

        </div>
      )}

    </div>
  );
}
