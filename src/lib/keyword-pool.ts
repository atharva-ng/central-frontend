// Static keyword pool — used by AddArticleSheet until the Keywords screen ships
// with a real cluster/queue store.

export interface PoolKeyword {
  keyword: string
  cluster: string
  funnel: "TOFU" | "MOFU" | "BOFU"
  volume: number
  difficulty: number
  cpc: number
}

export const KEYWORD_POOL: PoolKeyword[] = [
  { keyword: "google sheets api", cluster: "API & Automation", funnel: "TOFU", volume: 8100, difficulty: 38, cpc: 2.4 },
  { keyword: "google sheets webhook", cluster: "API & Automation", funnel: "MOFU", volume: 1300, difficulty: 22, cpc: 3.1 },
  { keyword: "import json into google sheets", cluster: "API & Automation", funnel: "MOFU", volume: 2200, difficulty: 25, cpc: 2.8 },
  { keyword: "salesforce export to google sheets", cluster: "Salesforce", funnel: "BOFU", volume: 720, difficulty: 19, cpc: 6.1 },
  { keyword: "salesforce report to google sheets", cluster: "Salesforce", funnel: "BOFU", volume: 590, difficulty: 21, cpc: 5.8 },
  { keyword: "hubspot to google sheets sync", cluster: "HubSpot", funnel: "BOFU", volume: 480, difficulty: 18, cpc: 5.4 },
  { keyword: "stripe data to google sheets", cluster: "Billing", funnel: "MOFU", volume: 390, difficulty: 16, cpc: 4.7 },
  { keyword: "ga4 export google sheets", cluster: "Analytics", funnel: "MOFU", volume: 1700, difficulty: 23, cpc: 3.6 },
  { keyword: "looker studio alternatives", cluster: "BI Tools", funnel: "MOFU", volume: 2400, difficulty: 28, cpc: 4.1 },
  { keyword: "no code data pipeline", cluster: "Data Pipelines", funnel: "TOFU", volume: 3100, difficulty: 32, cpc: 3.3 },
  { keyword: "automated reporting tool", cluster: "Reporting", funnel: "MOFU", volume: 1900, difficulty: 26, cpc: 4.5 },
  { keyword: "csv to google sheets automation", cluster: "Data Pipelines", funnel: "TOFU", volume: 870, difficulty: 17, cpc: 2.2 },
]
