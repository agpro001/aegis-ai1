# Aegis-AI Dashboard — "Mission Control for DeFi Security"

A cyberpunk-styled, full-stack DeFi security platform with real AI threat analysis, live monitoring, and incident response capabilities.

---

## Design & Theme

- **Cyberpunk/Neon aesthetic**: Dark backgrounds with neon cyan, magenta, and electric green accents, glowing borders, gradient overlays, and matrix-style animations
- **Dark/Light mode toggle**: Dark mode as default with a polished light variant
- **Animated elements**: Pulsing threat meters, scrolling intelligence feeds, particle effects, glowing card borders, smooth page transitions

---

## 1. Authentication & Onboarding

- **Dual auth system**: Email/password signup + MetaMask/wallet connect option (via ethers.js)
- **Cinematic landing page**: Animated hero with shield/sentinel visuals, feature highlights, and CTA to sign up
- **User profiles**: Stored in Supabase with wallet address, notification preferences, and plan tier

## 2. Sentinel Configuration Studio

- **Smart Contract Import**: Input field for contract address — stores configuration in Supabase
- **Source Selection Panel**: Toggle switches for monitoring sources:
  - Twitter/X accounts and keywords (real API integration via edge function)
  - Crypto news feeds (CryptoPanic API via edge function)
  - Mempool monitoring toggle (UI-ready, flagged as "coming soon")
- **Sensitivity Slider**: Visual slider (Low / Medium / Paranoid) with descriptions of each threshold level
- **Save & Deploy**: Stores full sentinel config to Supabase, activates monitoring

## 3. Pulse Dashboard — Real-Time Monitoring

- **Threat Meter**: Animated radial gauge (Green → Yellow → Red) showing live safety score
- **Live Intelligence Feed**: Scrolling log panel showing real AI analysis results:
  - Real tweets/news fetched via edge functions
  - Each item analyzed by Lovable AI (sentiment + threat classification)
  - Color-coded entries: green (safe), yellow (watch), red (critical)
- **CRE Heartbeat Indicator**: Animated pulse showing system status and last check timestamp
- **Stats Cards**: Total checks, threats detected, uptime, response time — with animated counters

## 4. Black Box — Incident Forensics

- **Incident History**: Table of all triggered events stored in Supabase
- **Incident Report Card**: Detailed view showing block number, timestamp, trigger source
- **"Smoking Gun" Evidence**: Displays the exact tweet/article that triggered the alert with AI analysis breakdown
- **Unpause & Reset Panel**: Admin action buttons (UI-ready for future smart contract integration)

## 5. Real AI Integration (Lovable AI via Cloud)

- **Threat Analysis Edge Function**: Receives text from Twitter/news, sends to Lovable AI for sentiment and threat classification
- **Streaming responses**: Real-time AI analysis displayed in the intelligence feed
- **Structured output**: AI returns threat level, confidence score, and reasoning via tool calling
- Real time news from official sources 
- Ai chatbot 

## 6. Data & API Integration

- **Twitter/X monitoring**: Edge function to fetch tweets by keyword/account (requires API key setup) or from ai
- **News monitoring**: CryptoPanic or similar crypto news API integration
- **Supabase tables**: Users, sentinels (configs), incidents, intelligence_logs, alert_settings
- **Real-time subscriptions**: Supabase realtime for live feed updates

## 7. Notifications & Alerts

- **In-app toast notifications** for threat level changes
- **Email alerts** via Supabase edge function when incidents trigger
- **Alert history** page with filtering

## 8. Navigation & Layout

- **Sidebar navigation**: Dashboard, Sentinels, Black Box, Settings
- **Responsive design**: Desktop-optimized command center with mobile support
- **Loading states**: Skeleton screens with neon pulse animations