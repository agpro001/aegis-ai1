# Enable Email Alerts for Critical Threats

## Current State

All three features are **already implemented in code**:

1. **Pulse Dashboard** -- calls `fetch-news` and `live-scan`, both already use Firecrawl to search the web for real articles and combine with AI analysis. Working.
2. **Black Box** -- calls `live-scan` with Firecrawl web search and live articles available. Working.
3. **Email Alerts** -- `send-alert` edge function already has full Resend email integration with HTML templates. However, **the `RESEND_API_KEY` secret is not configured**, so all emails are silently skipped.

## What Needs to Happen

### 1. Add RESEND_API_KEY Secret

- You need a [Resend](https://resend.com) account (free tier supports 100 emails/day)
- Get your API key from Resend dashboard → API Keys
- I will securely store it so the backend function can send emails

### 2. Minor Improvement: Auto-trigger alerts from Dashboard scans

Currently, only `live-scan` auto-creates incidents and sends alerts for critical threats. The `fetch-news` function does not. I will update `fetch-news` to also trigger the `send-alert` function when critical threats are found, so both scan buttons on the Dashboard can trigger email alerts.

## Files Changed

- `supabase/functions/fetch-news/index.ts` -- Add auto-incident creation and alert sending for critical items (matching what `live-scan` already does)

## No Database Changes Required

The `alerts`, `incidents`, and `profiles` tables already exist with the correct schema.