import { motion } from "framer-motion";
import { Shield, AlertTriangle, Activity, Clock, Zap, TrendingUp, RefreshCw, Newspaper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

const ThreatMeter = ({ score }: { score: number }) => {
  const radius = 80;
  const circumference = Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score > 70 ? "hsl(var(--neon-green))" : score > 40 ? "hsl(var(--neon-yellow))" : "hsl(var(--neon-red))";
  const label = score > 70 ? "SAFE" : score > 40 ? "CAUTION" : "CRITICAL";

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="120" viewBox="0 0 200 120">
        <path d="M 10 110 A 80 80 0 0 1 190 110" fill="none" stroke="hsl(var(--border))" strokeWidth="12" strokeLinecap="round" />
        <motion.path
          d="M 10 110 A 80 80 0 0 1 190 110"
          fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
        <text x="100" y="90" textAnchor="middle" className="font-display" fill="currentColor" fontSize="28" fontWeight="bold">{score}</text>
        <text x="100" y="110" textAnchor="middle" className="font-body" fill={color} fontSize="12" fontWeight="600">{label}</text>
      </svg>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, delay }: any) => (
  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <Card className="border-border bg-card/60 backdrop-blur-sm hover:border-glow-cyan transition-all">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`rounded-lg p-2.5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-body text-sm text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const levelColors: Record<string, string> = {
  safe: "text-neon-green",
  watch: "text-neon-yellow",
  critical: "text-neon-red",
};

const Dashboard = () => {
  const { user } = useAuth();
  const [heartbeat, setHeartbeat] = useState("3s ago");
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ checks: 0, threats: 0, incidents: 0 });
  const [fetchingNews, setFetchingNews] = useState(false);
  const [threatScore, setThreatScore] = useState(78);

  useEffect(() => {
    let seconds = 3;
    const interval = setInterval(() => {
      seconds = seconds >= 30 ? 0 : seconds + 1;
      setHeartbeat(`${seconds}s ago`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load real intelligence logs
  useEffect(() => {
    if (!user) return;
    loadLogs();
    loadStats();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("intel-logs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "intelligence_logs" }, (payload) => {
        setLogs((prev) => [payload.new, ...prev].slice(0, 50));
        recalcScore([payload.new, ...logs]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const loadLogs = async () => {
    const { data } = await supabase
      .from("intelligence_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) {
      setLogs(data);
      recalcScore(data);
    }
  };

  const loadStats = async () => {
    const { count: logCount } = await supabase.from("intelligence_logs").select("*", { count: "exact", head: true });
    const { count: threatCount } = await supabase.from("intelligence_logs").select("*", { count: "exact", head: true }).neq("threat_level", "safe");
    const { count: incCount } = await supabase.from("incidents").select("*", { count: "exact", head: true });
    setStats({ checks: logCount || 0, threats: threatCount || 0, incidents: incCount || 0 });
  };

  const recalcScore = (data: any[]) => {
    if (data.length === 0) { setThreatScore(78); return; }
    const recent = data.slice(0, 10);
    const criticals = recent.filter((l) => l.threat_level === "critical").length;
    const watches = recent.filter((l) => l.threat_level === "watch").length;
    const score = Math.max(10, 100 - criticals * 25 - watches * 10);
    setThreatScore(score);
  };

  const fetchNews = async () => {
    setFetchingNews(true);
    try {
      // Get first sentinel for context
      const { data: sentinels } = await supabase.from("sentinels").select("id, twitter_keywords").limit(1);
      const sentinel = sentinels?.[0];

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-news`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          sentinel_id: sentinel?.id || null,
          keywords: sentinel?.twitter_keywords || "DeFi exploit hack",
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch news");
      }

      const data = await resp.json();
      toast.success(`Fetched ${data.news?.length || 0} intelligence items`);
      loadLogs();
      loadStats();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setFetchingNews(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Pulse Dashboard</h1>
            <p className="font-body text-muted-foreground">Real-time threat monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchNews}
              disabled={fetchingNews}
              className="gap-2 font-body text-xs"
            >
              <Newspaper className="h-3 w-3" />
              {fetchingNews ? "Scanning..." : "Scan Now"}
            </Button>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-neon-green" />
              </span>
              <span className="font-mono text-xs text-neon-green">Active • {heartbeat}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Shield} label="Total Checks" value={stats.checks.toLocaleString()} color="bg-neon-cyan/10 text-neon-cyan" delay={0} />
          <StatCard icon={AlertTriangle} label="Threats Found" value={stats.threats.toString()} color="bg-neon-red/10 text-neon-red" delay={0.1} />
          <StatCard icon={Clock} label="Incidents" value={stats.incidents.toString()} color="bg-neon-yellow/10 text-neon-yellow" delay={0.2} />
          <StatCard icon={Zap} label="Threat Score" value={`${threatScore}/100`} color="bg-neon-green/10 text-neon-green" delay={0.3} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-border bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Threat Meter
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ThreatMeter score={threatScore} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-border bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-display text-sm font-semibold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Live Intelligence Feed
                </span>
                <Button size="icon" variant="ghost" onClick={loadLogs} className="h-6 w-6">
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 overflow-y-auto space-y-1.5 font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No intelligence data yet.</p>
                    <Button size="sm" variant="outline" onClick={fetchNews} disabled={fetchingNews} className="mt-3 gap-2 font-body">
                      <Newspaper className="h-3 w-3" /> Run First Scan
                    </Button>
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <motion.div
                      key={log.id || i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex gap-2 rounded px-2 py-1 ${i === 0 ? "bg-secondary/50" : ""}`}
                    >
                      <span className="text-muted-foreground shrink-0">
                        [{new Date(log.created_at).toLocaleTimeString()}]
                      </span>
                      <span className={`uppercase font-bold shrink-0 ${levelColors[log.threat_level] || "text-foreground"}`}>
                        [{log.threat_level}]
                      </span>
                      <span className="text-foreground">{log.source_text || log.ai_analysis || "Analysis pending..."}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
