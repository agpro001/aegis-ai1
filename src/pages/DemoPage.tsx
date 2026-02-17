import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Radar, Eye, AlertTriangle, Zap, ChevronRight, ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MatrixRain } from "@/components/MatrixRain";

const steps = [
  {
    icon: Shield,
    title: "Deploy Your Sentinel",
    description: "Paste your smart contract address. Aegis-AI auto-detects pause/freeze functions and begins monitoring immediately.",
    detail: "The sentinel is your autonomous AI agent — it watches Twitter, crypto news feeds, and on-chain data 24/7. No manual monitoring required.",
    color: "text-neon-cyan",
    bg: "bg-neon-cyan/10",
  },
  {
    icon: Eye,
    title: "Real-Time Intelligence",
    description: "AI continuously scans social media, news sources, and blockchain data for threats targeting your protocol.",
    detail: "Every tweet from @PeckShield, @CertiK, @SlowMist — every CryptoPanic headline — is analyzed by our AI in real-time. Threats are classified as SAFE, WATCH, or CRITICAL with confidence scores.",
    color: "text-neon-green",
    bg: "bg-neon-green/10",
  },
  {
    icon: AlertTriangle,
    title: "Threat Classification",
    description: "Our AI classifies threats using NLP sentiment analysis and cross-references multiple sources for accuracy.",
    detail: "The sensitivity slider lets you choose: Low (3+ sources confirm), Medium (1 major source + sentiment), or Paranoid (any keyword spike triggers alert). False positives are filtered through multi-source verification.",
    color: "text-neon-yellow",
    bg: "bg-neon-yellow/10",
  },
  {
    icon: Zap,
    title: "Instant Response",
    description: "When a critical threat is confirmed, Aegis can trigger emergency pause on your smart contract in under 3 seconds.",
    detail: "The Black Box records every incident with full forensic data: the exact tweet/article that triggered the alert, AI confidence score, block number, and response time. Full transparency for governance review.",
    color: "text-neon-red",
    bg: "bg-neon-red/10",
  },
  {
    icon: Radar,
    title: "Why Aegis-AI?",
    description: "DeFi protocols lost $1.8B to exploits in 2025. Most hacks are announced on Twitter before on-chain detection.",
    detail: "Aegis-AI bridges the gap between social intelligence and on-chain response. By monitoring the same channels hackers use to coordinate, we detect threats before they hit the blockchain. It's security-as-a-service for the decentralized world.",
    color: "text-neon-magenta",
    bg: "bg-neon-magenta/10",
  },
];

const DemoPage = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const step = steps[current];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background cyber-grid flex items-center justify-center">
      <MatrixRain />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/")}
        className="absolute top-4 right-4 z-20 text-muted-foreground hover:text-foreground"
      >
        <X className="h-5 w-5" />
      </Button>

      <div className="relative z-10 w-full max-w-3xl px-6">
        {/* Progress */}
        <div className="mb-8 flex justify-center gap-2">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current ? "w-10 bg-primary" : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50, rotateY: 15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -50, rotateY: -15 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="rounded-2xl border border-border bg-card/80 p-8 md:p-12 backdrop-blur-sm"
            style={{ perspective: 1000 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`mb-6 inline-flex rounded-xl ${step.bg} p-4`}
            >
              <step.icon className={`h-10 w-10 ${step.color}`} />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-3 font-display text-2xl md:text-3xl font-bold text-foreground"
            >
              {step.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-4 font-body text-lg text-foreground"
            >
              {step.description}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-body text-sm text-muted-foreground leading-relaxed"
            >
              {step.detail}
            </motion.p>

            {/* Animated cyber decoration */}
            <motion.div
              className="mt-6 h-1 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            disabled={current === 0}
            onClick={() => setCurrent(current - 1)}
            className="gap-2 font-body"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>

          {current === steps.length - 1 ? (
            <Button
              onClick={() => navigate("/auth?mode=signup")}
              className="bg-primary text-primary-foreground font-body glow-cyan gap-2"
            >
              Get Started <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setCurrent(current + 1)}
              className="bg-primary text-primary-foreground font-body gap-2"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
