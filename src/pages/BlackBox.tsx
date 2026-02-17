import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Box, FileText, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

const severityColors: Record<string, string> = {
  critical: "bg-neon-red/10 text-neon-red border-neon-red/20",
  warning: "bg-neon-yellow/10 text-neon-yellow border-neon-yellow/20",
  info: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20",
};

const statusColors: Record<string, string> = {
  paused: "bg-neon-red/10 text-neon-red",
  resolved: "bg-neon-green/10 text-neon-green",
  investigating: "bg-neon-yellow/10 text-neon-yellow",
};

const BlackBox = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadIncidents();
  }, [user]);

  const loadIncidents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("incidents")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setIncidents(data);
      if (data.length > 0 && !selected) setSelected(data[0]);
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
            <Box className="h-7 w-7 text-neon-magenta" /> Black Box
          </h1>
          <p className="font-body text-muted-foreground">Incident forensics & response</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-display text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Incident History
                </span>
                <Button size="icon" variant="ghost" onClick={loadIncidents} className="h-6 w-6">
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incidents.length === 0 ? (
                <p className="text-center py-8 font-body text-sm text-muted-foreground">
                  {loading ? "Loading..." : "No incidents recorded yet. Your sentinels are keeping watch."}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-display text-xs">ID</TableHead>
                      <TableHead className="font-display text-xs">Time</TableHead>
                      <TableHead className="font-display text-xs">Source</TableHead>
                      <TableHead className="font-display text-xs">Severity</TableHead>
                      <TableHead className="font-display text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map((inc) => (
                      <TableRow
                        key={inc.id}
                        onClick={() => setSelected(inc)}
                        className={`cursor-pointer hover:bg-secondary/50 ${selected?.id === inc.id ? "bg-secondary/30" : ""}`}
                      >
                        <TableCell className="font-mono text-xs text-primary">{inc.id.slice(0, 8)}</TableCell>
                        <TableCell className="font-body text-xs">{new Date(inc.created_at).toLocaleString()}</TableCell>
                        <TableCell className="font-body text-xs">{inc.source || "AI Analysis"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`font-mono text-[10px] ${severityColors[inc.severity] || ""}`}>
                            {inc.severity?.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`font-mono text-[10px] ${statusColors[inc.status] || ""}`}>
                            {inc.status?.toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {selected && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-neon-red/20 bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-display text-sm text-neon-red flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Evidence — {selected.id.slice(0, 8)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border bg-background/50 p-4">
                  <p className="font-mono text-xs text-muted-foreground mb-1">Source: {selected.source || "AI Analysis"}</p>
                  <p className="font-body text-sm text-foreground">{selected.evidence || "No evidence recorded"}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className={`font-display text-lg font-bold ${
                      selected.severity === "critical" ? "text-neon-red" : "text-neon-yellow"
                    }`}>{selected.severity?.toUpperCase()}</p>
                    <p className="font-body text-xs text-muted-foreground">Threat Level</p>
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold text-foreground">{selected.ai_confidence || "N/A"}</p>
                    <p className="font-body text-xs text-muted-foreground">AI Confidence</p>
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold text-foreground">{selected.response_time_ms ? `${(selected.response_time_ms / 1000).toFixed(1)}s` : "N/A"}</p>
                    <p className="font-body text-xs text-muted-foreground">Response Time</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 bg-neon-green/10 text-neon-green font-body hover:bg-neon-green/20">
                    Unpause Contract
                  </Button>
                  <Button variant="outline" className="flex-1 font-body gap-2">
                    <ExternalLink className="h-4 w-4" /> View on Explorer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default BlackBox;
