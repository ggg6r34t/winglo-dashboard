export const mockCompletions: Record<string, string> = {
  intake: JSON.stringify({
    icp: {
      company_size: '200–1000 employees',
      industry: 'B2B SaaS',
      role: 'VP of Sales / Head of Revenue',
      pain_points: [
        'Reps waste time on low-intent accounts',
        'No reliable signal for when to reach out',
        'CRM data goes stale quickly',
      ],
      budget_range: '$30k–$120k/year',
    },
    positioning: {
      value_proposition: 'AI-powered buyer intent signals that tell sales teams exactly when and who to contact.',
      differentiators: ['Real-time intent data', 'Native CRM integrations', 'No manual data entry'],
      competitors: ['Bombora', '6sense', 'Demandbase'],
      category: 'Sales Intelligence / Revenue Intelligence',
    },
    growth_brief: {
      summary: 'Strong product-market fit in enterprise sales. Best growth vectors are CRM integrations and co-marketing with adjacent sales tools.',
      opportunities: ['AppExchange listing', 'HubSpot Marketplace', 'Co-marketing with SEPs'],
      recommended_channels: ['Integration marketplaces', 'Partner co-marketing', 'Community-led growth'],
      partnership_categories: ['CRM integrations', 'Sales engagement platforms', 'Revenue intelligence'],
    },
  }),

  discovery: JSON.stringify({
    opportunities: [
      {
        company_name: 'Salesforce',
        company_url: 'https://salesforce.com',
        opportunity_type: 'integration',
        rationale: 'Dominant CRM used by 70%+ of target ICP. Native integration removes top objection in demos.',
        estimated_impact: '300+ qualified leads/month via AppExchange',
      },
      {
        company_name: 'HubSpot',
        company_url: 'https://hubspot.com',
        opportunity_type: 'integration',
        rationale: 'Large SMB/mid-market CRM with active App Marketplace. Strong PLG motion alignment.',
        estimated_impact: '150–200 qualified leads/month',
      },
      {
        company_name: 'Outreach',
        company_url: 'https://outreach.io',
        opportunity_type: 'co-marketing',
        rationale: 'Sales engagement platform used by primary ICP. Intent signals + sequencing is a compelling joint story.',
        estimated_impact: '500 MQLs from joint webinar campaign',
      },
      {
        company_name: 'G2',
        company_url: 'https://g2.com',
        opportunity_type: 'distribution',
        rationale: 'Category review platform with buyer intent products. Drives high-quality inbound.',
        estimated_impact: '80+ inbound MQLs/month',
      },
      {
        company_name: 'Gong',
        company_url: 'https://gong.io',
        opportunity_type: 'technology',
        rationale: 'Revenue intelligence platform with shared VP Sales buyer. Complementary signal types.',
        estimated_impact: '5–8 enterprise co-sell wins in year one',
      },
    ],
  }),

  scoring: JSON.stringify({
    score: 85,
    score_rationale: {
      strategic_fit: 'Strong mission alignment — both companies serve the enterprise sales motion.',
      audience_overlap: 'Direct ICP overlap with VP Sales and RevOps buyers.',
      growth_potential: 'Integration could drive 200+ qualified leads/month at scale.',
      ease_of_execution: 'Public partner program exists with clear certification steps.',
    },
    estimated_impact: '200+ qualified leads/month, $600k pipeline in first year',
  }),

  outreach: JSON.stringify({
    subject: 'Partnership Opportunity: [Company] × [Partner]',
    body: `Hi [Name],

I lead partnerships at [Company]. We built a revenue intelligence platform that helps enterprise sales teams prioritize their highest-intent accounts.

I've been following [Partner]'s momentum and believe there's a compelling integration story here. Our customers have been asking for this integration as their #1 feature request.

Would you have 20 minutes to explore fit? Happy to share our integration spec and a list of customers we have in common.

Best,
[Your name]`,
  }),

  research: JSON.stringify({
    company_name: 'Example Corp',
    company_url: 'https://example.com',
    description: 'A B2B SaaS company serving enterprise sales teams.',
    business_model: 'Subscription SaaS with annual contracts',
    customer_segments: ['Enterprise', 'Mid-market'],
    notable_customers: ['Acme Inc', 'GlobalTech', 'Enterprise Co'],
    existing_integrations: ['Salesforce', 'HubSpot', 'Slack'],
    partner_program_exists: true,
    partner_program_notes: 'Open partner program with documented API and certification process.',
    intelligence_confidence: 'medium',
    data_caveats: 'Mock data — not verified.',
  }),

  memory: JSON.stringify({
    title: 'Partnership call completed — strong interest confirmed',
    body: 'Spoke with the partnerships team. They confirmed strong interest in a technical integration. Next step: share integration spec by end of week. Timeline for certification: 6–8 weeks.',
    entry_type: 'partner_interaction',
    related_company: 'Example Corp',
  }),

  analytics: JSON.stringify({
    summary: 'Partnership pipeline is growing steadily. Integration partnerships are outperforming co-marketing in qualified lead volume.',
    insights: [
      'Approved integrations are generating 2.3x more qualified leads than co-marketing partnerships',
      'Score ≥80 opportunities have a 68% conversion rate to active pipeline',
      'Average time from discovery to approval is 4.2 days',
    ],
    recommendations: [
      'Prioritize CRM integrations — highest ROI per partnership',
      'Run discovery for 3 more SEP (Sales Engagement Platform) partners',
      'Follow up on the 2 approved opportunities that have not been contacted',
    ],
    highlight_metric: {
      label: 'Pipeline from Partnerships',
      value: '$1.8M',
      trend: 'up',
    },
  }),

  default: JSON.stringify({
    summary: 'Mock AI response for development mode',
    result: 'This is a placeholder response generated by MockProvider.',
  }),
}

export function getMockCompletion(agentType?: string): string {
  return mockCompletions[agentType ?? 'default'] ?? mockCompletions.default
}
