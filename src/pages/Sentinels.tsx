import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Radar, Save, AlertCircle, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { AppLayout } from "@/components/AppLayout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

const sensitivityLabels: Record<number, { label: string; desc: string; color: string }> = {
  0: { label: "Low", desc: "Only pauses if 3+ trusted sources confirm a hack.", color: "text-neon-green" },
  1: { label: "Medium", desc: "Pauses if 1 major source confirms + high negative sentiment.", color: "text-neon-yellow" },
  2: { label: "Paranoid", desc: "Pauses on ANY significant spike in hack-related keywords.", color: "text-neon-red" },
};

const Sentinels = () => {
  const { user } = useAuth();
  const [sentinels, setSentinels] = useState<any[]>([]);
  const [contractAddress, setContractAddress] = useState("");
  const [sentinelName, setSentinelName] = useState("My Sentinel");
  const [sources, setSources] = useState({ twitter: true, news: true, mempool: false });
  const [twitterKeywords, setTwitterKeywords] = useState("$TOKEN exploit");
  const [sensitivity, setSensitivity] = useState([1]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const currentSens = sensitivityLabels[sensitivity[0]];

  useEffect(() => {
    if (user) loadSentinels();
  }, [user]);

  const loadSentinels = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sentinels")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load sentinels");
    } else {
      setSentinels(data || []);
    }
    setLoading(false);
  };

  const loadSentinel = (s: any) => {
    setEditingId(s.id);
    setContractAddress(s.contract_address);
    setSentinelName(s.name);
    setSources({ twitter: s.source_twitter, news: s.source_news, mempool: s.source_mempool });
    setTwitterKeywords(s.twitter_keywords || "");
    setSensitivity([s.sensitivity || 1]);
  };

  const resetForm = () => {
    setEditingId(null);
    setContractAddress("");
    setSentinelName("My Sentinel");
    setSources({ twitter: true, news: true, mempool: false });
    setTwitterKeywords("$TOKEN exploit");
    setSensitivity([1]);
  };

  const handleSave = async () => {
    if (!contractAddress) { toast.error("Enter a contract address"); return; }
    if (!user) { toast.error("Please sign in"); return; }
    setSaving(true);

    const payload = {
      user_id: user.id,
      name: sentinelName,
      contract_address: contractAddress,
      source_twitter: sources.twitter,
      source_news: sources.news,
      source_mempool: sources.mempool,
      twitter_keywords: twitterKeywords,
      sensitivity: sensitivity[0],
      is_active: true,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("sentinels").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("sentinels").insert(payload));
    }

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success(editingId ? "Sentinel updated!" : "Sentinel deployed!");
      resetForm();
      loadSentinels();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("sentinels").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Sentinel removed"); loadSentinels(); }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
            <Radar className="h-7 w-7 text-primary" /> Sentinel Studio
          </h1>
          <p className="font-body text-muted-foreground">Configure & deploy AI security sentinels</p>
        </div>

        {/* Existing sentinels */}
        {sentinels.length > 0 && (
          <Card className="border-border bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-display text-sm flex items-center justify-between">
                Active Sentinels
                <Button size="sm" variant="ghost" onClick={resetForm} className="gap-1 text-xs">
                  <Plus className="h-3 w-3" /> New
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sentinels.map((s) => (
                <div
                  key={s.id}
                  onClick={() => loadSentinel(s)}
                  className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all ${
                    editingId === s.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <div>
                    <p className="font-body text-sm font-semibold text-foreground">{s.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{s.contract_address.slice(0, 10)}...</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${s.is_active ? "bg-neon-green" : "bg-muted-foreground"}`} />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Config form */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-display text-sm">
                {editingId ? "Edit Sentinel" : "New Sentinel"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Sentinel Name"
                value={sentinelName}
                onChange={(e) => setSentinelName(e.target.value)}
                className="font-body bg-background/50"
              />
              <Input
                placeholder="0x... Contract Address"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="font-mono bg-background/50"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Sources */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-display text-sm">Monitoring Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-sm font-semibold text-foreground">Twitter / X</p>
                  <p className="font-body text-xs text-muted-foreground">Monitor accounts & keywords</p>
                </div>
                <Switch checked={sources.twitter} onCheckedChange={(v) => setSources({ ...sources, twitter: v })} />
              </div>
              {sources.twitter && (
                <Input
                  placeholder="Keywords: $TOKEN exploit, @PeckShieldAlert"
                  value={twitterKeywords}
                  onChange={(e) => setTwitterKeywords(e.target.value)}
                  className="font-mono text-sm bg-background/50"
                />
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-sm font-semibold text-foreground">Crypto News</p>
                  <p className="font-body text-xs text-muted-foreground">AI-powered news scanning</p>
                </div>
                <Switch checked={sources.news} onCheckedChange={(v) => setSources({ ...sources, news: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="font-body text-sm font-semibold text-foreground">Mempool Monitor</p>
                    <p className="font-body text-xs text-muted-foreground">Watch pending high-gas txns</p>
                  </div>
                  <span className="rounded-full bg-neon-yellow/10 px-2 py-0.5 font-mono text-[10px] text-neon-yellow">COMING SOON</span>
                </div>
                <Switch checked={sources.mempool} disabled />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sensitivity */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-display text-sm">Sensitivity Threshold</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Slider value={sensitivity} onValueChange={setSensitivity} min={0} max={2} step={1} />
              <div className="flex items-center gap-2">
                <AlertCircle className={`h-4 w-4 ${currentSens.color}`} />
                <span className={`font-display text-sm font-bold ${currentSens.color}`}>{currentSens.label}</span>
              </div>
              <p className="font-body text-sm text-muted-foreground">{currentSens.desc}</p>
            </CardContent>
          </Card>
        </motion.div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-primary-foreground font-body text-base glow-cyan gap-2"
        >
          <Save className="h-5 w-5" /> {saving ? "Deploying..." : editingId ? "Update Sentinel" : "Save & Deploy Sentinel"}
        </Button>
      </div>
    </AppLayout>
  );
};

export default Sentinels;
