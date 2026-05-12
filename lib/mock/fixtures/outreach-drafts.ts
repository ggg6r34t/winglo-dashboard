import type { OutreachDraft } from '@/types'
import { MOCK_ORG_ID } from './organizations'

const ORG = MOCK_ORG_ID

export const mockOutreachDrafts: OutreachDraft[] = [
  {
    id: 'od-000000000000000000000000001',
    organization_id: ORG,
    opportunity_id: 'opp-00000000-0000-0000-000000000001',
    channel: 'email',
    subject: 'Partnership Opportunity: Acme AI × Salesforce AppExchange',
    body: `Hi [Name],

I lead partnerships at Acme AI — we're a revenue intelligence platform used by 200+ B2B sales teams to prioritize their highest-intent accounts.

I've been following Salesforce's AppExchange momentum and believe there's a compelling integration story here. Our customers consistently rank "native CRM sync" as their #1 requested feature, and Salesforce admins in our ICP use AppExchange as their primary tool discovery channel.

Specifically, I'd love to explore:
- A certified AppExchange listing with native CRM field mapping
- Co-marketing to your RevOps admin community
- A joint case study with a shared customer (we have 3 in common)

Would you have 20 minutes in the next two weeks to explore fit? I can share our current integration spec and customer data to make the conversation concrete.

Best,
[Your name]
Acme AI`,
    tone: 'professional',
    status: 'approved',
    sent_at: null,
    created_at: '2026-05-08T10:00:00Z',
    updated_at: '2026-05-08T14:00:00Z',
  },
  {
    id: 'od-000000000000000000000000002',
    organization_id: ORG,
    opportunity_id: 'opp-00000000-0000-0000-000000000001',
    channel: 'linkedin',
    subject: null,
    body: `Hi [Name],

Noticed you lead ISV partnerships at Salesforce — I head up partnerships at Acme AI, a revenue intelligence tool our customers say "belongs in every Salesforce org."

We have 3 customers in common who've been asking for a native AppExchange integration. Would love to share what we're seeing and explore whether there's mutual interest.

Open to a quick call?`,
    tone: 'warm',
    status: 'draft',
    sent_at: null,
    created_at: '2026-05-08T11:00:00Z',
    updated_at: '2026-05-08T11:00:00Z',
  },
  {
    id: 'od-000000000000000000000000003',
    organization_id: ORG,
    opportunity_id: 'opp-00000000-0000-0000-000000000002',
    channel: 'email',
    subject: 'HubSpot App Marketplace — Partnership Proposal',
    body: `Hi [Name],

I'm reaching out from Acme AI regarding a potential listing on the HubSpot App Marketplace.

We're a revenue intelligence platform that helps sales teams prioritize accounts based on AI-driven buying signals. We currently have 40+ customers who use HubSpot as their CRM and have been requesting a native integration.

Our value proposition for HubSpot users:
- Real-time intent signals surfaced directly in HubSpot contact records
- Automatic sequence enrollment based on intent triggers
- No manual data entry — signals sync automatically

I'd love to understand the certification requirements and explore co-marketing opportunities. Would you be open to a 30-minute call?

Thanks,
[Your name]`,
    tone: 'professional',
    status: 'draft',
    sent_at: null,
    created_at: '2026-05-09T09:00:00Z',
    updated_at: '2026-05-09T09:00:00Z',
  },
  {
    id: 'od-000000000000000000000000004',
    organization_id: ORG,
    opportunity_id: 'opp-00000000-0000-0000-000000000003',
    channel: 'email',
    subject: 'Co-marketing Idea: Acme AI × Outreach — Intent-Triggered Sequences',
    body: `Hi [Name],

Quick intro: I lead partnerships at Acme AI. We're a buyer intent platform that helps enterprise sales teams know when to reach out — and Outreach users are exactly who we built it for.

I have a specific co-marketing idea I think could drive meaningful pipeline for both of us:

**"Intent-to-Outreach" Campaign**
- Joint webinar: "How top sales teams combine intent signals with automated sequencing"
- Target audience: VP Sales and SDR managers (shared ICP)
- Projected reach: 500 registrations between our combined lists
- Content asset: Data report on response rates when intent signals trigger sequences

We've seen this story resonate with 3 of your customers we share — happy to make the intro.

Would you be up for a 20-min call to see if the timing works?

[Your name]`,
    tone: 'direct',
    status: 'draft',
    sent_at: null,
    created_at: '2026-05-09T11:00:00Z',
    updated_at: '2026-05-09T11:00:00Z',
  },
  {
    id: 'od-000000000000000000000000005',
    organization_id: ORG,
    opportunity_id: 'opp-00000000-0000-0000-000000000004',
    channel: 'email',
    subject: 'G2 Review Campaign + Buyer Intent Partnership — Acme AI',
    body: `Hi [Name],

I lead partnerships at Acme AI. We're listed on G2 in the Sales Intelligence category and have been consistently rated 4.7/5 by our customers.

I'm reaching out because I'd like to explore two things:

1. **Enhanced profile + review generation**: We want to run a structured review campaign to get from 28 reviews to 100+ over the next 90 days. Looking for the right G2 partner to help design this.

2. **Buyer Intent data**: Several of our prospects are researching competitors on G2 right now. We'd like to explore whether G2 Buyer Intent data could be a complementary input to our own signals.

Is there someone on your team who handles both the partner program and buyer intent product for companies at our stage?

Thanks,
[Your name]`,
    tone: 'professional',
    status: 'approved',
    sent_at: '2026-05-07T14:00:00Z',
    created_at: '2026-05-06T10:00:00Z',
    updated_at: '2026-05-07T14:00:00Z',
  },
]
