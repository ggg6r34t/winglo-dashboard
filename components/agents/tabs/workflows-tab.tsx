'use client'

import { useState, useCallback } from 'react'
import { Search, X, History, Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { AgentConfig } from '@/lib/agents/registry'

type WfState = 'run' | 'done' | 'wait'

type RunRecord = {
  id: string
  time: string
  dur: string
  state: 'done' | 'fail' | 'run'
}

type Workflow = {
  id: string
  title: string
  state: WfState
  runs: number
  success: number
  schedule: string
  lastRun: string
  description: string
  avgDuration: string
  runsRecent: RunRecord[]
}

const WORKFLOWS: Record<string, Workflow[]> = {
  'social-media': [
    {
      id: 'wf-s1', title: 'Weekly content publishing — IG / TT / LI', state: 'run',
      runs: 142, success: 0.987, schedule: 'Mon · 06:00 PT', lastRun: '14m ago',
      description: 'Generate, review, schedule, and publish content across Instagram, TikTok, and LinkedIn.',
      avgDuration: '4m 18s',
      runsRecent: [
        { id: 'RN-142', time: 'Today 06:00',  dur: '4m 12s', state: 'done' },
        { id: 'RN-141', time: 'Mon May 12',   dur: '4m 02s', state: 'done' },
        { id: 'RN-140', time: 'Mon May 5',    dur: '5m 24s', state: 'done' },
        { id: 'RN-139', time: 'Mon Apr 28',   dur: '3m 58s', state: 'done' },
      ],
    },
    {
      id: 'wf-s2', title: 'Daily engagement triage', state: 'run',
      runs: 318, success: 0.994, schedule: 'Daily · 09:00', lastRun: '5h ago',
      description: 'Classify and route comments, DMs, and mentions to the appropriate response queue.',
      avgDuration: '1m 44s',
      runsRecent: [
        { id: 'RN-318', time: 'Today 09:00',  dur: '1m 38s', state: 'done' },
        { id: 'RN-317', time: 'Yest. 09:00',  dur: '1m 52s', state: 'done' },
        { id: 'RN-316', time: 'May 17 09:00', dur: '1m 44s', state: 'done' },
        { id: 'RN-315', time: 'May 16 09:00', dur: '2m 01s', state: 'done' },
      ],
    },
    {
      id: 'wf-s3', title: 'Trend listening — surface viral hooks', state: 'run',
      runs: 84, success: 0.962, schedule: 'Hourly', lastRun: '12m ago',
      description: 'Monitor trending audio, hashtags, and formats and brief the content agent daily.',
      avgDuration: '52s',
      runsRecent: [
        { id: 'RN-84', time: 'Today 14:00', dur: '48s',  state: 'done' },
        { id: 'RN-83', time: 'Today 13:00', dur: '55s',  state: 'done' },
        { id: 'RN-82', time: 'Today 12:00', dur: '1m 4s', state: 'fail' },
        { id: 'RN-81', time: 'Today 11:00', dur: '50s',  state: 'done' },
      ],
    },
    {
      id: 'wf-s4', title: 'Crisis response · auto-pause queue', state: 'wait',
      runs: 4, success: 1.0, schedule: 'On-trigger', lastRun: '31m ago',
      description: 'Detect sentiment spikes, auto-pause the publish queue, and alert the on-call operator.',
      avgDuration: '22s',
      runsRecent: [
        { id: 'RN-4', time: 'Today 13:29', dur: '18s', state: 'done' },
        { id: 'RN-3', time: 'Mar 14',      dur: '24s', state: 'done' },
        { id: 'RN-2', time: 'Feb 2',       dur: '21s', state: 'done' },
        { id: 'RN-1', time: 'Jan 10',      dur: '25s', state: 'done' },
      ],
    },
  ],
  growth: [
    {
      id: 'wf-g1', title: 'Partnership outreach — Series A SaaS list', state: 'run',
      runs: 84, success: 0.971, schedule: 'Daily · 07:00', lastRun: '1h ago',
      description: 'Source, enrich, personalize, and send partnership pitches to Series A SaaS targets.',
      avgDuration: '6m 02s',
      runsRecent: [
        { id: 'RN-84', time: 'Today 07:00',  dur: '5m 58s', state: 'done' },
        { id: 'RN-83', time: 'Yest. 07:00',  dur: '6m 12s', state: 'done' },
        { id: 'RN-82', time: 'May 17 07:00', dur: '6m 04s', state: 'done' },
        { id: 'RN-81', time: 'May 16 07:00', dur: '5m 44s', state: 'fail' },
      ],
    },
    {
      id: 'wf-g2', title: 'Inbound lead enrichment + routing', state: 'run',
      runs: 412, success: 0.996, schedule: 'On-trigger', lastRun: '2m ago',
      description: 'Enrich inbound signups with company data, score against ICP, and route to the right sequence.',
      avgDuration: '38s',
      runsRecent: [
        { id: 'RN-412', time: 'Today 14:18', dur: '36s', state: 'done' },
        { id: 'RN-411', time: 'Today 13:54', dur: '40s', state: 'done' },
        { id: 'RN-410', time: 'Today 13:21', dur: '38s', state: 'done' },
        { id: 'RN-409', time: 'Today 12:47', dur: '41s', state: 'done' },
      ],
    },
    {
      id: 'wf-g3', title: 'Re-engage cooled trials at day 11', state: 'run',
      runs: 28, success: 0.928, schedule: 'Daily · 11:00', lastRun: '3h ago',
      description: 'Identify trials with no activity for 11 days and trigger a personalized re-engagement sequence.',
      avgDuration: '1m 12s',
      runsRecent: [
        { id: 'RN-28', time: 'Today 11:00',  dur: '1m 08s', state: 'done' },
        { id: 'RN-27', time: 'Yest. 11:00',  dur: '1m 14s', state: 'done' },
        { id: 'RN-26', time: 'May 17 11:00', dur: '58s',    state: 'fail' },
        { id: 'RN-25', time: 'May 16 11:00', dur: '1m 22s', state: 'done' },
      ],
    },
    {
      id: 'wf-g4', title: 'ICP scoring · weekly recalibration', state: 'done',
      runs: 22, success: 1.0, schedule: 'Sun · 22:00', lastRun: '2d ago',
      description: 'Pull latest conversion data, recalibrate ICP weights, and update the scoring model.',
      avgDuration: '3m 44s',
      runsRecent: [
        { id: 'RN-22', time: 'Sun May 18',  dur: '3m 48s', state: 'done' },
        { id: 'RN-21', time: 'Sun May 11',  dur: '3m 40s', state: 'done' },
        { id: 'RN-20', time: 'Sun May 4',   dur: '3m 52s', state: 'done' },
        { id: 'RN-19', time: 'Sun Apr 27',  dur: '3m 39s', state: 'done' },
      ],
    },
  ],
  seo: [
    {
      id: 'wf-v1', title: 'Daily regression audit', state: 'done',
      runs: 318, success: 0.994, schedule: 'Daily · 02:00', lastRun: '12h ago',
      description: "Crawl the site, diff against yesterday's snapshot, flag regressions, and open a Slack thread.",
      avgDuration: '7m 22s',
      runsRecent: [
        { id: 'RN-318', time: 'Today 02:00',  dur: '7m 18s', state: 'done' },
        { id: 'RN-317', time: 'Yest. 02:00',  dur: '7m 28s', state: 'done' },
        { id: 'RN-316', time: 'May 17 02:00', dur: '7m 14s', state: 'done' },
        { id: 'RN-315', time: 'May 16 02:00', dur: '7m 32s', state: 'fail' },
      ],
    },
    {
      id: 'wf-v2', title: 'Canonical fix · proposal + PR', state: 'run',
      runs: 42, success: 0.952, schedule: 'On-trigger', lastRun: '1h ago',
      description: 'Detect canonical mismatches, generate a fix proposal, and open a GitHub PR for review.',
      avgDuration: '2m 04s',
      runsRecent: [
        { id: 'RN-42', time: 'Today 13:10', dur: '1m 58s', state: 'done' },
        { id: 'RN-41', time: 'Today 11:44', dur: '2m 12s', state: 'done' },
        { id: 'RN-40', time: 'May 17',      dur: '2m 04s', state: 'fail' },
        { id: 'RN-39', time: 'May 16',      dur: '1m 52s', state: 'done' },
      ],
    },
    {
      id: 'wf-v3', title: 'Keyword cluster · monthly opportunity scan', state: 'done',
      runs: 6, success: 1.0, schedule: '1st of month', lastRun: '16d ago',
      description: 'Cluster keyword gaps by topic, prioritize by search volume and competition, and brief the writing agent.',
      avgDuration: '12m 38s',
      runsRecent: [
        { id: 'RN-6', time: 'May 1',  dur: '12m 42s', state: 'done' },
        { id: 'RN-5', time: 'Apr 1',  dur: '12m 28s', state: 'done' },
        { id: 'RN-4', time: 'Mar 1',  dur: '12m 44s', state: 'done' },
        { id: 'RN-3', time: 'Feb 1',  dur: '13m 02s', state: 'done' },
      ],
    },
  ],
  marketing: [
    {
      id: 'wf-o1', title: 'Q3 launch announcement — multi-channel', state: 'wait',
      runs: 1, success: 1.0, schedule: 'On-trigger', lastRun: '13:51',
      description: 'Coordinate draft, legal review, embargo lift, and simultaneous publish across all channels.',
      avgDuration: '18m 04s',
      runsRecent: [
        { id: 'RN-1', time: 'Today 13:51', dur: '18m 04s', state: 'done' },
      ],
    },
    {
      id: 'wf-o2', title: 'Monthly newsletter · compose + send', state: 'done',
      runs: 12, success: 1.0, schedule: '1st of month', lastRun: '16d ago',
      description: 'Compile highlights, draft newsletter, run a subject-line test, and send via Mailchimp.',
      avgDuration: '8m 44s',
      runsRecent: [
        { id: 'RN-12', time: 'May 1',  dur: '8m 38s', state: 'done' },
        { id: 'RN-11', time: 'Apr 1',  dur: '8m 52s', state: 'done' },
        { id: 'RN-10', time: 'Mar 1',  dur: '9m 02s', state: 'done' },
        { id: 'RN-9',  time: 'Feb 1',  dur: '8m 28s', state: 'done' },
      ],
    },
    {
      id: 'wf-o3', title: 'Brand consistency · cross-channel check', state: 'done',
      runs: 22, success: 0.989, schedule: 'Weekly', lastRun: '3d ago',
      description: 'Audit tone, logo usage, and messaging consistency across website, social, and email.',
      avgDuration: '3m 22s',
      runsRecent: [
        { id: 'RN-22', time: 'May 17',  dur: '3m 18s', state: 'done' },
        { id: 'RN-21', time: 'May 10',  dur: '3m 28s', state: 'done' },
        { id: 'RN-20', time: 'May 3',   dur: '3m 22s', state: 'fail' },
        { id: 'RN-19', time: 'Apr 26',  dur: '3m 16s', state: 'done' },
      ],
    },
  ],
  sales: [
    {
      id: 'wf-h1', title: 'Inbound demo follow-up · within 4 hours', state: 'run',
      runs: 204, success: 0.984, schedule: 'On-trigger', lastRun: '12m ago',
      description: 'Send a personalized follow-up within 4 hours of every inbound demo request.',
      avgDuration: '44s',
      runsRecent: [
        { id: 'RN-204', time: 'Today 14:08', dur: '42s', state: 'done' },
        { id: 'RN-203', time: 'Today 12:51', dur: '46s', state: 'done' },
        { id: 'RN-202', time: 'Today 11:22', dur: '44s', state: 'done' },
        { id: 'RN-201', time: 'Today 09:04', dur: '48s', state: 'done' },
      ],
    },
    {
      id: 'wf-h2', title: 'Cooled trial re-engagement · day 11', state: 'run',
      runs: 28, success: 0.928, schedule: 'Daily · 11:00', lastRun: '3h ago',
      description: 'Flag trials with no product activity for 11 days and trigger a tailored re-engagement email.',
      avgDuration: '1m 12s',
      runsRecent: [
        { id: 'RN-28', time: 'Today 11:00',  dur: '1m 08s', state: 'done' },
        { id: 'RN-27', time: 'Yest. 11:00',  dur: '1m 18s', state: 'done' },
        { id: 'RN-26', time: 'May 17 11:00', dur: '58s',    state: 'fail' },
        { id: 'RN-25', time: 'May 16 11:00', dur: '1m 22s', state: 'done' },
      ],
    },
    {
      id: 'wf-h3', title: 'Stage-4 stall · weekly review prompt', state: 'done',
      runs: 22, success: 1.0, schedule: 'Mon · 09:00', lastRun: '1w ago',
      description: 'Identify deals stalled at stage 4 for more than 2 weeks and prompt the rep with a review checklist.',
      avgDuration: '2m 04s',
      runsRecent: [
        { id: 'RN-22', time: 'May 12 09:00', dur: '2m 02s', state: 'done' },
        { id: 'RN-21', time: 'May 5 09:00',  dur: '2m 08s', state: 'done' },
        { id: 'RN-20', time: 'Apr 28 09:00', dur: '2m 04s', state: 'done' },
        { id: 'RN-19', time: 'Apr 21 09:00', dur: '1m 58s', state: 'done' },
      ],
    },
    {
      id: 'wf-h4', title: 'Customer health · monthly check-in', state: 'done',
      runs: 6, success: 0.998, schedule: '1st of month', lastRun: '16d ago',
      description: 'Score health across usage, NPS, and support tickets, and brief the CSM with action items.',
      avgDuration: '4m 44s',
      runsRecent: [
        { id: 'RN-6', time: 'May 1',  dur: '4m 38s', state: 'done' },
        { id: 'RN-5', time: 'Apr 1',  dur: '4m 52s', state: 'done' },
        { id: 'RN-4', time: 'Mar 1',  dur: '4m 44s', state: 'done' },
        { id: 'RN-3', time: 'Feb 1',  dur: '5m 02s', state: 'done' },
      ],
    },
  ],
  telehealth: [
    {
      id: 'wf-m1', title: 'Overnight triage · intake → routing', state: 'run',
      runs: 248, success: 0.998, schedule: 'Daily · 22:00–06:00', lastRun: 'this morning',
      description: 'Route overnight intake forms to the correct care team based on urgency and specialty.',
      avgDuration: '28s',
      runsRecent: [
        { id: 'RN-248', time: 'Today 05:44', dur: '26s', state: 'done' },
        { id: 'RN-247', time: 'Today 04:12', dur: '30s', state: 'done' },
        { id: 'RN-246', time: 'Today 02:58', dur: '28s', state: 'done' },
        { id: 'RN-245', time: 'Today 01:31', dur: '32s', state: 'done' },
      ],
    },
    {
      id: 'wf-m2', title: '48h post-visit follow-up', state: 'run',
      runs: 184, success: 0.996, schedule: 'On-trigger', lastRun: '40m ago',
      description: 'Send a personalized follow-up 48 hours after each visit, escalate if no response in 24h.',
      avgDuration: '42s',
      runsRecent: [
        { id: 'RN-184', time: 'Today 13:40', dur: '40s', state: 'done' },
        { id: 'RN-183', time: 'Today 12:14', dur: '44s', state: 'done' },
        { id: 'RN-182', time: 'Today 10:52', dur: '42s', state: 'done' },
        { id: 'RN-181', time: 'Today 09:08', dur: '46s', state: 'done' },
      ],
    },
    {
      id: 'wf-m3', title: 'Prescription refill · 90-day cycle', state: 'run',
      runs: 92, success: 1.0, schedule: 'On-trigger', lastRun: '1h ago',
      description: 'Detect approaching refill windows, draft the request, and route to the prescribing physician.',
      avgDuration: '1m 02s',
      runsRecent: [
        { id: 'RN-92', time: 'Today 13:18', dur: '1m 00s', state: 'done' },
        { id: 'RN-91', time: 'Today 12:44', dur: '1m 04s', state: 'done' },
        { id: 'RN-90', time: 'Today 11:22', dur: '58s',    state: 'done' },
        { id: 'RN-89', time: 'Today 10:58', dur: '1m 02s', state: 'done' },
      ],
    },
    {
      id: 'wf-m4', title: 'Anomaly detection · intake volume', state: 'run',
      runs: 31, success: 1.0, schedule: 'Hourly', lastRun: '8m ago',
      description: 'Monitor hourly intake volume, detect spikes or drops, and alert the on-call operations lead.',
      avgDuration: '18s',
      runsRecent: [
        { id: 'RN-31', time: 'Today 14:00', dur: '16s', state: 'done' },
        { id: 'RN-30', time: 'Today 13:00', dur: '18s', state: 'done' },
        { id: 'RN-29', time: 'Today 12:00', dur: '20s', state: 'done' },
        { id: 'RN-28', time: 'Today 11:00', dur: '18s', state: 'done' },
      ],
    },
  ],
  'analytics-manager': [
    {
      id: 'wf-c1', title: 'Pipeline velocity report — weekly', state: 'done',
      runs: 22, success: 1.0, schedule: 'Mon · 06:00', lastRun: '1d ago',
      description: 'Aggregate CRM stage data, calculate velocity trends, and deliver a Slack summary to leadership.',
      avgDuration: '5m 28s',
      runsRecent: [
        { id: 'RN-22', time: 'Mon May 19', dur: '5m 24s', state: 'done' },
        { id: 'RN-21', time: 'Mon May 12', dur: '5m 32s', state: 'done' },
        { id: 'RN-20', time: 'Mon May 5',  dur: '5m 28s', state: 'done' },
        { id: 'RN-19', time: 'Mon Apr 28', dur: '5m 44s', state: 'done' },
      ],
    },
    {
      id: 'wf-c2', title: 'Real-time anomaly detection', state: 'run',
      runs: 31, success: 1.0, schedule: 'Continuous', lastRun: 'now',
      description: 'Monitor key metrics in real-time, detect statistical anomalies, and alert within 2 minutes.',
      avgDuration: '8s',
      runsRecent: [
        { id: 'RN-31', time: 'Now',         dur: '—',  state: 'run'  },
        { id: 'RN-30', time: 'Today 14:12', dur: '8s', state: 'done' },
        { id: 'RN-29', time: 'Today 14:04', dur: '9s', state: 'done' },
        { id: 'RN-28', time: 'Today 13:58', dur: '7s', state: 'done' },
      ],
    },
    {
      id: 'wf-c3', title: 'Daily ops digest · #leadership', state: 'done',
      runs: 142, success: 0.998, schedule: 'Daily · 18:00', lastRun: 'yest.',
      description: 'Compile the day\'s key metrics into a narrative digest and post to the #leadership Slack channel.',
      avgDuration: '2m 44s',
      runsRecent: [
        { id: 'RN-142', time: 'Yest. 18:00',  dur: '2m 40s', state: 'done' },
        { id: 'RN-141', time: 'May 17 18:00', dur: '2m 48s', state: 'done' },
        { id: 'RN-140', time: 'May 16 18:00', dur: '2m 44s', state: 'done' },
        { id: 'RN-139', time: 'May 15 18:00', dur: '2m 38s', state: 'fail' },
      ],
    },
    {
      id: 'wf-c4', title: 'Forecast calibration · self-check', state: 'done',
      runs: 8, success: 1.0, schedule: 'Weekly', lastRun: '2d ago',
      description: 'Compare last week\'s forecast against actuals, recalibrate the model, and log the delta.',
      avgDuration: '4m 02s',
      runsRecent: [
        { id: 'RN-8', time: 'May 18', dur: '3m 58s', state: 'done' },
        { id: 'RN-7', time: 'May 11', dur: '4m 04s', state: 'done' },
        { id: 'RN-6', time: 'May 4',  dur: '4m 02s', state: 'done' },
        { id: 'RN-5', time: 'Apr 27', dur: '4m 08s', state: 'done' },
      ],
    },
  ],
  research: [
    {
      id: 'wf-r1', title: 'Competitor pricing scan · biweekly', state: 'run',
      runs: 4, success: 1.0, schedule: 'Biweekly', lastRun: '12m ago',
      description: 'Crawl competitor pricing pages, extract changes, cross-check against our own, and brief the team.',
      avgDuration: '8m 22s',
      runsRecent: [
        { id: 'RN-4', time: 'Today',   dur: '8m 18s', state: 'done' },
        { id: 'RN-3', time: 'May 6',   dur: '8m 28s', state: 'done' },
        { id: 'RN-2', time: 'Apr 22',  dur: '8m 22s', state: 'done' },
        { id: 'RN-1', time: 'Apr 8',   dur: '8m 44s', state: 'done' },
      ],
    },
    {
      id: 'wf-r2', title: 'Q3 strategic memo · ongoing', state: 'run',
      runs: 1, success: 1.0, schedule: 'On-trigger', lastRun: '1d ago',
      description: 'Continuously gather signals, draft sections, and maintain the running Q3 strategic memo.',
      avgDuration: '22m 04s',
      runsRecent: [
        { id: 'RN-1', time: 'Yest.', dur: '22m 04s', state: 'done' },
      ],
    },
    {
      id: 'wf-r3', title: 'Daily news + signal scan', state: 'done',
      runs: 142, success: 0.987, schedule: 'Daily · 05:00', lastRun: '11h ago',
      description: 'Scan 40+ sources, surface relevant signals, and deliver a prioritized briefing by 06:00.',
      avgDuration: '3m 44s',
      runsRecent: [
        { id: 'RN-142', time: 'Today 05:00',  dur: '3m 40s', state: 'done' },
        { id: 'RN-141', time: 'Yest. 05:00',  dur: '3m 48s', state: 'done' },
        { id: 'RN-140', time: 'May 17 05:00', dur: '3m 44s', state: 'done' },
        { id: 'RN-139', time: 'May 16 05:00', dur: '4m 02s', state: 'fail' },
      ],
    },
  ],
  outreach: [
    {
      id: 'wf-e1', title: 'Series A SaaS outreach · daily batch', state: 'run',
      runs: 84, success: 0.971, schedule: 'Daily · 07:00', lastRun: '1h ago',
      description: 'Source leads, personalize copy, send the daily batch, and log replies in HubSpot.',
      avgDuration: '6m 02s',
      runsRecent: [
        { id: 'RN-84', time: 'Today 07:00',  dur: '5m 58s', state: 'done' },
        { id: 'RN-83', time: 'Yest. 07:00',  dur: '6m 12s', state: 'done' },
        { id: 'RN-82', time: 'May 17 07:00', dur: '6m 04s', state: 'done' },
        { id: 'RN-81', time: 'May 16 07:00', dur: '5m 44s', state: 'fail' },
      ],
    },
    {
      id: 'wf-e2', title: 'Inbound lead sequence · on-trigger', state: 'run',
      runs: 248, success: 0.988, schedule: 'On-trigger', lastRun: '4m ago',
      description: 'Enroll inbound leads in a 5-step email sequence within 2 minutes of signup.',
      avgDuration: '28s',
      runsRecent: [
        { id: 'RN-248', time: 'Today 14:16', dur: '26s', state: 'done' },
        { id: 'RN-247', time: 'Today 13:52', dur: '30s', state: 'done' },
        { id: 'RN-246', time: 'Today 13:28', dur: '28s', state: 'done' },
        { id: 'RN-245', time: 'Today 12:44', dur: '32s', state: 'done' },
      ],
    },
    {
      id: 'wf-e3', title: 'Re-engagement · cooled contacts day 11', state: 'run',
      runs: 28, success: 0.921, schedule: 'Daily · 11:00', lastRun: '3h ago',
      description: 'Identify contacts who went cold after day 11 and send a breakup-style re-engagement email.',
      avgDuration: '1m 18s',
      runsRecent: [
        { id: 'RN-28', time: 'Today 11:00',  dur: '1m 14s', state: 'done' },
        { id: 'RN-27', time: 'Yest. 11:00',  dur: '1m 22s', state: 'done' },
        { id: 'RN-26', time: 'May 17 11:00', dur: '1m 04s', state: 'fail' },
        { id: 'RN-25', time: 'May 16 11:00', dur: '1m 28s', state: 'done' },
      ],
    },
    {
      id: 'wf-e4', title: 'Bounce cleanup · weekly hygiene', state: 'done',
      runs: 12, success: 1.0, schedule: 'Mon · 08:00', lastRun: '1w ago',
      description: 'Detect hard bounces, remove from all sequences, and log for CRM cleanup review.',
      avgDuration: '2m 28s',
      runsRecent: [
        { id: 'RN-12', time: 'May 12 08:00', dur: '2m 24s', state: 'done' },
        { id: 'RN-11', time: 'May 5 08:00',  dur: '2m 30s', state: 'done' },
        { id: 'RN-10', time: 'Apr 28 08:00', dur: '2m 28s', state: 'done' },
        { id: 'RN-9',  time: 'Apr 21 08:00', dur: '2m 32s', state: 'done' },
      ],
    },
  ],
}

const STATE_LABEL: Record<WfState, string> = { run: 'Running', wait: 'Waiting', done: 'Healthy' }

const RUN_STATE_COLOR: Record<RunRecord['state'], string> = {
  done: 'var(--ok)',
  fail: 'var(--alert)',
  run: 'var(--accent)',
}

function SlidePanel({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          backgroundColor: 'rgba(0,0,0,0.45)',
        }}
      />
      {/* Panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50,
          width: 420, maxWidth: '90vw',
          backgroundColor: 'var(--bg-1)',
          borderLeft: '1px solid var(--line-1)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.3)',
        }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--line-1)',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-0)' }}>{title}</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--fg-3)', padding: 4, display: 'flex',
            }}
          >
            <X size={14} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {children}
        </div>
      </div>
    </>
  )
}

export function WorkflowsTab({ agent }: { agent: AgentConfig }) {
  const workflows = WORKFLOWS[agent.slug] ?? []
  const [search, setSearch] = useState('')
  const [historyWf, setHistoryWf] = useState<Workflow | null>(null)
  const [editWf, setEditWf] = useState<Workflow | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editSchedule, setEditSchedule] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const openHistory = useCallback((wf: Workflow) => {
    setHistoryWf(wf)
    setEditWf(null)
  }, [])

  const openEdit = useCallback((wf: Workflow) => {
    setEditWf(wf)
    setEditTitle(wf.title)
    setEditSchedule(wf.schedule)
    setEditDescription(wf.description)
    setHistoryWf(null)
  }, [])

  const filtered = search.trim()
    ? workflows.filter(w => w.title.toLowerCase().includes(search.trim().toLowerCase()))
    : workflows

  const running = workflows.filter(w => w.state === 'run').length
  const waiting = workflows.filter(w => w.state === 'wait').length
  const avgSuccess = workflows.length
    ? workflows.reduce((s, w) => s + w.success, 0) / workflows.length * 100
    : 0

  return (
    <div className="hub-body fade-in">
      <div className="tile-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="tile">
          <div className="tile-label">Workflows</div>
          <div className="tile-value">{workflows.length}</div>
          <div className="tile-foot">owned by {agent.name}</div>
        </div>
        <div className="tile">
          <div className="tile-label">Running</div>
          <div className="tile-value" style={{ color: 'var(--accent)' }}>{running}</div>
          <div className="tile-foot">in flight</div>
        </div>
        <div className="tile">
          <div className="tile-label">Waiting</div>
          <div className="tile-value" style={{ color: 'var(--warn)' }}>{waiting}</div>
          <div className="tile-foot">paused or blocked</div>
        </div>
        <div className="tile">
          <div className="tile-label">Avg success</div>
          <div className="tile-value" style={{ color: 'var(--ok)' }}>
            {workflows.length ? avgSuccess.toFixed(1) : '—'}<span className="unit">%</span>
          </div>
          <div className="tile-foot">across all runs</div>
        </div>
      </div>

      <div className="hub-section-head">
        <div className="section-title">
          {agent.name}&apos;s workflows
          <span className="lbl">composable, observable, rerunnable</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={12}
              style={{
                position: 'absolute', left: 8, top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--fg-3)', pointerEvents: 'none',
              }}
            />
            <input
              type="search"
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                height: 28, paddingLeft: 26, paddingRight: 8,
                fontSize: 11.5, fontFamily: 'inherit',
                backgroundColor: 'var(--bg-2)',
                border: '1px solid var(--line-1)',
                borderRadius: 6, color: 'var(--fg-0)', outline: 'none',
                width: 160,
              }}
              onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--accent)' }}
              onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--line-1)' }}
            />
          </div>
          <button className="btn primary">New workflow</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            padding: '48px 0', textAlign: 'center',
            color: 'var(--fg-3)', fontSize: 12,
            fontFamily: 'var(--font-mono)',
          }}
        >
          No workflows match &ldquo;{search}&rdquo;.
          <button
            type="button"
            onClick={() => setSearch('')}
            style={{
              marginLeft: 6, background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--accent)', fontSize: 12,
              fontFamily: 'var(--font-mono)',
            }}
          >
            Clear
          </button>
        </div>
      ) : (
        <div className="wf-tab-grid">
          {filtered.map(w => (
            <div className="wf-tab-card" key={w.id}>
              <div className="wf-tab-head">
                <div className="wf-tab-state">
                  <span className={`dot ${w.state}`} />
                  <span>{STATE_LABEL[w.state]}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>
                  {w.id.toUpperCase()}
                </span>
              </div>
              <div className="wf-tab-title">{w.title}</div>
              <div
                style={{
                  fontSize: 11, color: 'var(--fg-3)',
                  fontFamily: 'var(--font-mono)', marginTop: 4,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}
              >
                {w.description}
              </div>
              <div className="wf-tab-stats">
                <div className="wf-tab-stat">
                  <div className="lbl">Runs</div>
                  <div className="val">{w.runs}</div>
                </div>
                <div className="wf-tab-stat">
                  <div className="lbl">Success</div>
                  <div className={`val ${w.success >= 0.99 ? 'ok' : w.success < 0.95 ? 'warn' : ''}`}>
                    {(w.success * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="wf-tab-stat">
                  <div className="lbl">Schedule</div>
                  <div className="val" style={{ fontSize: 10.5 }}>{w.schedule}</div>
                </div>
              </div>
              <div
                style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', marginTop: 10,
                  paddingTop: 10, borderTop: '1px solid var(--line-1)',
                }}
              >
                <span style={{ fontSize: 10.5, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>
                  Last run · {w.lastRun}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => openHistory(w)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
                  >
                    <History size={11} />
                    History
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => openEdit(w)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
                  >
                    <Pencil size={11} />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History panel */}
      <SlidePanel
        open={!!historyWf}
        onClose={() => setHistoryWf(null)}
        title={`Run history · ${historyWf?.id.toUpperCase() ?? ''}`}
      >
        {historyWf && (
          <>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-0)', marginBottom: 4 }}>
              {historyWf.title}
            </p>
            <p style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>
              {historyWf.runs} total runs · {(historyWf.success * 100).toFixed(1)}% success · avg {historyWf.avgDuration}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {historyWf.runsRecent.map(r => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px',
                    backgroundColor: 'var(--bg-2)',
                    border: '1px solid var(--line-1)',
                    borderRadius: 8,
                  }}
                >
                  <span
                    style={{
                      width: 6, height: 6, borderRadius: '50%',
                      backgroundColor: RUN_STATE_COLOR[r.state],
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', flexShrink: 0 }}>
                    {r.id}
                  </span>
                  <span style={{ flex: 1, fontSize: 11.5, color: 'var(--fg-1)' }}>{r.time}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
                    {r.dur}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              style={{
                marginTop: 16, background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 11.5,
                color: 'var(--accent)', fontFamily: 'var(--font-mono)',
                padding: 0,
              }}
            >
              View all runs →
            </button>
          </>
        )}
      </SlidePanel>

      {/* Edit panel */}
      <SlidePanel
        open={!!editWf}
        onClose={() => setEditWf(null)}
        title={`Edit · ${editWf?.id.toUpperCase() ?? ''}`}
      >
        {editWf && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label
                style={{ display: 'block', fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}
              >
                Title
              </label>
              <Input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="text-[13px]"
              />
            </div>

            <div>
              <label
                style={{ display: 'block', fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}
              >
                Schedule
              </label>
              <Input
                value={editSchedule}
                onChange={e => setEditSchedule(e.target.value)}
                className="text-[13px]"
                placeholder="e.g. Daily · 07:00, On-trigger, Hourly"
              />
            </div>

            <div>
              <label
                style={{ display: 'block', fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}
              >
                Description
              </label>
              <Textarea
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                className="text-[13px] resize-y"
                rows={3}
              />
            </div>

            <div>
              <label
                style={{ display: 'block', fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}
              >
                State
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['run', 'wait', 'done'] as WfState[]).map(s => (
                  <button
                    key={s}
                    type="button"
                    className={editWf.state === s ? 'btn primary' : 'btn'}
                    style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    <span className={`dot ${s}`} style={{ width: 6, height: 6 }} />
                    {STATE_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex', gap: 8, paddingTop: 8,
                borderTop: '1px solid var(--line-1)',
              }}
            >
              <button type="button" className="btn primary" style={{ flex: 1, justifyContent: 'center' }}>
                Save changes
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setEditWf(null)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  )
}
