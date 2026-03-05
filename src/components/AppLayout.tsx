import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, LayoutDashboard, Radar, Box, Settings, LogOut,
  ChevronLeft, ChevronRight, MessageSquare, Bell, Globe
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BackButton } from "@/components/BackButton";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: Radar, label: "Sentinels", to: "/sentinels" },
  { icon: Box, label: "Black Box", to: "/blackbox" },
  { icon: MessageSquare, label: "AI Chat", to: "/chat" },
  { icon: Bell, label: "Alerts", to: "/alerts" },
  { icon: Globe, label: "Threat Map", to: "/threat-map" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const loadAlertCount = async () => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("alerts")
        .select("*", { count: "exact", head: true })
        .gte("sent_at", oneDayAgo);
      setAlertCount(count || 0);
    };

    loadAlertCount();

    const channel = supabase
      .channel("alert-badge")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "alerts" }, () => {
        loadAlertCount();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.2 }}
        className="relative flex flex-col border-r border-border bg-card/50 backdrop-blur-sm"
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-4">
          <Shield className="h-8 w-8 shrink-0 text-primary" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap font-display text-sm font-bold tracking-wider text-primary text-glow-cyan"
              >
                AEGIS-AI
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="mt-4 flex-1 space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm transition-all relative",
                  isActive
                    ? "bg-primary/10 text-primary border-glow-cyan"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.to === "/alerts" && alertCount > 0 && (
                <span className="absolute right-2 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 font-mono text-[10px] font-bold text-destructive-foreground">
                  {alertCount > 99 ? "99+" : alertCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="space-y-1 border-t border-border p-2">
          <ThemeToggle />
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto cyber-grid">
        <div className="p-6 lg:p-8">
          <div className="mb-4">
            <BackButton />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};
