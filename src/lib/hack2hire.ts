// Hack2hire seed: the single source of truth for onboarding + site
// intelligence in the UI. Shape matches the backend collections exactly
// (see src/lib/schema.ts) so this can be swapped for an API fetch later.

import type {
  CompetitorKeyword,
  SiteIntelligence,
  WebEntity,
} from "./schema"

export const WEB_ENTITY: WebEntity = {
  _id: { $oid: "69e6f842563ef6a56d82bd29" },
  user_id: "69e6f7d3563ef6a56d82bd28",
  website_url: "https://www.hack2hire.com/",
  created_at: { $date: "2026-04-21T04:08:34.048Z" },
  updated_at: { $date: "2026-04-21T04:09:39.183Z" },
  context: {
    brand_voice_signals:
      "Direct, confident, and solution-focused tone emphasizing authenticity and real-world relevance with occasional casual language ('Got asked a question not found in Leetcode?').",
    business_model: "B2C SaaS",
    business_name: "Hack2hire",
    icp_signals: {
      roles: [
        "Software Engineer",
        "SDE II",
        "Frontend Engineer",
        "Job seekers preparing for interviews",
        "College interns",
      ],
      industries: ["Technology", "Software Development"],
      company_size: "Individuals / Job seekers",
      pain_points: [
        "Lack of authentic interview questions beyond LeetCode",
        "Unclear or unverified solutions from forums",
        "Need for multi-language support",
        "Difficulty understanding solution approaches",
        "Lack of real company interview trend data",
        "Poor code quality and readability in public solutions",
      ],
    },
    inferred_fields: [
      "integrations — no explicit integrations mentioned on homepage",
      "target_geography — inferred as Global based on multi-language support and diverse user testimonials",
      "company_size — inferred as Individuals based on pricing page mention 'For Individuals' and user testimonials from job seekers and interns",
    ],
    integrations: [],
    key_differentiator:
      "Focuses on authentic real-world interview questions not found on LeetCode, curated from actual SDE interviews at top companies with expert verified solutions.",
    key_features: [
      "500+ non-LeetCode real interview questions curated from actual interviews",
      "Expert handcrafted solutions by top coding contest winners",
      "Multi-language code solutions (Python, Java, C++, etc.)",
      "In-browser coding widget with test case execution",
      "Step-by-step tutorials explaining problem-solving approach",
      "Space and time complexity analysis for each solution",
      "Interview question frequency tracking based on 3000+ candidate data",
      "Community-sourced questions from forums and discussion boards",
    ],
    pricing_model: "Subscription",
    primary_use_case:
      "Practicing for technical software engineering interviews with real questions asked at top companies.",
    product_type:
      "An interview preparation platform providing authentic SDE interview questions with expert solutions, tutorials, and coding practice tools.",
    target_geography: "Global",
    website: "hack2hire.com",
    user_domain_rating: 30,
  },
  competitors: [
    {
      url: "algoexpert.io",
      company_name: "AlgoExpert",
      reason:
        "AlgoExpert is a direct competitor offering a dedicated coding interview preparation platform with curated algorithm problems, expert solutions, and tutorials aimed at software engineers.",
    },
    {
      url: "www.hellointerview.com",
      company_name: "Hello Interview",
      reason:
        "Hello Interview directly competes by providing SWE interview preparation content including company-specific questions, guides, and mock interviews for software engineering candidates.",
    },
    {
      url: "algomaster.io",
      company_name: "AlgoMaster",
      reason:
        "AlgoMaster directly competes by offering a software engineering interview preparation platform focused on DSA patterns, system design, and coding practice for SDE roles.",
    },
  ],
}

// Curated subset of competitor_keywords — chosen for variety across volume,
// difficulty, intent, and topical cluster. The full backend response has 100+
// rows; this slice is enough to demo all UI states.
const COMPETITOR_KEYWORDS: CompetitorKeyword[] = [
  {
    keyword: "interview star method",
    description:
      "Master the STAR method, prepare compelling stories, and ace behavioral interview questions.",
    volume: 60500,
    cpc: 0.87,
    keyword_difficulty: 36,
    ranking_position: 96,
    ranking_url: "https://algomaster.io/",
    intent: "informational",
  },
  {
    keyword: "what is an api",
    description:
      "API stands for Application Programming Interface. At its core, an API takes an input and gives predictable outputs.",
    volume: 49500,
    cpc: 2.88,
    keyword_difficulty: 58,
    ranking_position: 70,
    ranking_url: "https://blog.algomaster.io/p/whats-an-api",
    intent: "informational",
  },
  {
    keyword: "idempotency",
    description:
      "Idempotency is a property of certain operations whereby executing the same operation multiple times produces the same result as executing it once.",
    volume: 40500,
    cpc: 0.14,
    keyword_difficulty: 21,
    ranking_position: 28,
    ranking_url: "https://blog.algomaster.io/p/idempotency-in-distributed-systems",
    intent: "informational",
  },
  {
    keyword: "what is caching",
    description:
      "Caching stores frequently accessed data in a faster storage layer to reduce latency and backend load.",
    volume: 22200,
    cpc: 0.55,
    keyword_difficulty: 39,
    ranking_position: 27,
    ranking_url: "https://algomaster.io/learn/system-design/what-is-caching",
    intent: "informational",
  },
  {
    keyword: "json web token",
    description:
      "A JWT is a compact, URL-safe token used to securely transmit information between two parties.",
    volume: 22200,
    cpc: 7.25,
    keyword_difficulty: 57,
    ranking_position: 12,
    ranking_url: "https://blog.algomaster.io/p/json-web-tokens",
    intent: "navigational",
  },
  {
    keyword: "method resolution order",
    description:
      "MRO determines the order in which methods are resolved in multiple inheritance, governed by C3 linearization.",
    volume: 22200,
    cpc: 2.64,
    keyword_difficulty: 14,
    ranking_position: 12,
    ranking_url: "https://algomaster.io/learn/python/method-resolution-order",
    intent: "informational",
  },
  {
    keyword: "scalability",
    description:
      "Scalability is the property of a system to handle a growing amount of load by adding resources.",
    volume: 18100,
    cpc: 4.48,
    keyword_difficulty: 24,
    ranking_position: 18,
    ranking_url: "https://blog.algomaster.io/p/scalability",
    intent: "informational",
  },
  {
    keyword: "git rebase",
    description:
      "git rebase integrates changes from one branch into another by moving or combining a sequence of commits.",
    volume: 14800,
    cpc: 1.59,
    keyword_difficulty: 37,
    ranking_position: 33,
    ranking_url: "https://algomaster.io/learn/git/git-rebase",
    intent: "informational",
  },
  {
    keyword: "singleton pattern",
    description:
      "Singleton is a creational design pattern that guarantees a class has only one instance with global access.",
    volume: 14800,
    cpc: 0.39,
    keyword_difficulty: 36,
    ranking_position: 17,
    ranking_url: "https://algomaster.io/learn/lld/singleton",
    intent: "navigational",
  },
  {
    keyword: "oop concepts",
    description:
      "Object-Oriented Programming is a fundamental concept in software development that revolves around classes and objects.",
    volume: 12100,
    cpc: 5.02,
    keyword_difficulty: 20,
    ranking_position: 16,
    ranking_url:
      "https://blog.algomaster.io/p/basic-oop-concepts-explained-with-code",
    intent: "informational",
  },
  {
    keyword: "websockets",
    description:
      "WebSockets are a communication protocol used to build real-time features by establishing a two-way connection.",
    volume: 9900,
    cpc: 9.62,
    keyword_difficulty: 50,
    ranking_position: 42,
    ranking_url: "https://blog.algomaster.io/p/websockets",
    intent: "informational",
  },
  {
    keyword: "solid principles",
    description:
      "The SOLID principles provide a blueprint for writing code that's easy to adjust, extend, and maintain over time.",
    volume: 9900,
    cpc: 0.98,
    keyword_difficulty: 25,
    ranking_position: 33,
    ranking_url:
      "https://blog.algomaster.io/p/solid-principles-explained-with-code",
    intent: "transactional",
  },
  {
    keyword: "design patterns",
    description:
      "A design pattern is a reusable solution to a commonly occurring problem in software design.",
    volume: 8100,
    cpc: 2.73,
    keyword_difficulty: 58,
    ranking_position: 15,
    ranking_url: "https://algomaster.io/learn/lld/design-patterns",
    intent: "informational",
  },
  {
    keyword: "git checkout",
    description:
      "git checkout serves dual purposes: switching branches and restoring files in your working directory.",
    volume: 8100,
    cpc: 0.93,
    keyword_difficulty: 29,
    ranking_position: 34,
    ranking_url: "https://algomaster.io/learn/git/git-checkout-branch",
    intent: "informational",
  },
  {
    keyword: "prefix tree",
    description:
      "A trie or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings.",
    volume: 8100,
    cpc: 0.44,
    keyword_difficulty: 17,
    ranking_position: 24,
    ranking_url: "https://algomaster.io/learn/dsa/implement-trie-prefix-tree",
    intent: "informational",
  },
  {
    keyword: "system design",
    description:
      "System Design defines how different parts of a software system interact to meet functional and non-functional requirements.",
    volume: 8100,
    cpc: 5.2,
    keyword_difficulty: 28,
    ranking_position: 16,
    ranking_url: "https://algomaster.io/learn/system-design/what-is-system-design",
    intent: "commercial",
  },
  {
    keyword: "tcp vs udp",
    description:
      "TCP focuses on reliable, ordered delivery, while UDP prioritizes speed and simplicity with a best-effort approach.",
    volume: 8100,
    cpc: 0.48,
    keyword_difficulty: 7,
    ranking_position: 27,
    ranking_url: "https://algomaster.io/learn/system-design/tcp-vs-udp",
    intent: "informational",
  },
  {
    keyword: "acid transactions",
    description:
      "ACID is the set of 4 key properties that define a transaction: Atomicity, Consistency, Isolation, and Durability.",
    volume: 6600,
    cpc: 0.59,
    keyword_difficulty: 20,
    ranking_position: 37,
    ranking_url: "https://blog.algomaster.io/p/what-are-acid-transactions-in-databases",
    intent: "informational",
  },
  {
    keyword: "cap theorem",
    description:
      "The CAP theorem asserts that a distributed system must choose between Consistency and Availability under partition.",
    volume: 6600,
    cpc: 0.16,
    keyword_difficulty: 18,
    ranking_position: 17,
    ranking_url: "https://algomaster.io/learn/system-design/cap-theorem",
    intent: "informational",
  },
  {
    keyword: "git pull",
    description:
      "git pull is a convenience command that combines git fetch and git merge into a single operation.",
    volume: 6600,
    cpc: 0.35,
    keyword_difficulty: 22,
    ranking_position: 42,
    ranking_url: "https://algomaster.io/learn/git/git-pull",
    intent: "informational",
  },
  {
    keyword: "lru cache",
    description:
      "LRU Cache is a cache replacement policy that evicts the least recently accessed item when the cache is full.",
    volume: 6600,
    cpc: 1.81,
    keyword_difficulty: 24,
    ranking_position: 17,
    ranking_url: "https://algomaster.io/learn/lld/design-lru-cache",
    intent: "informational",
  },
  {
    keyword: "master theorem",
    description:
      "The Master Theorem compares which part dominates — the recursive work or the combining work — in divide-and-conquer recurrences.",
    volume: 6600,
    cpc: 0.97,
    keyword_difficulty: 3,
    ranking_position: 17,
    ranking_url: "https://algomaster.io/learn/dsa/master-theorem",
    intent: "informational",
  },
  {
    keyword: "defaultdict python",
    description:
      "A defaultdict is a subclass of dict that provides a default value for nonexistent keys.",
    volume: 6600,
    cpc: 8.89,
    keyword_difficulty: 11,
    ranking_position: 23,
    ranking_url: "https://algomaster.io/learn/python/defaultdict",
    intent: "informational",
  },
  {
    keyword: "bloom filters",
    description:
      "A Bloom Filter is a probabilistic data structure that allows you to quickly check whether an element might be in a set.",
    volume: 5400,
    cpc: 1.61,
    keyword_difficulty: 33,
    ranking_position: 16,
    ranking_url: "https://algomaster.io/learn/system-design/bloom-filters",
    intent: "commercial",
  },
  {
    keyword: "crack coding interview",
    description:
      "Stop solving problems randomly. Learn the underlying patterns to crack any coding interview with confidence.",
    volume: 5400,
    cpc: 1.66,
    keyword_difficulty: 32,
    ranking_position: 34,
    ranking_url: "https://algomaster.io/",
    intent: "informational",
  },
  {
    keyword: "leetcode patterns",
    description:
      "Pattern-based problem solving: combinatorial, dynamic programming, sliding window, monotonic stack, and more.",
    volume: 5400,
    cpc: 0.66,
    keyword_difficulty: 28,
    ranking_position: 14,
    ranking_url: "https://blog.algomaster.io/p/15-leetcode-patterns",
    intent: "informational",
  },
]

export const SITE_INTELLIGENCE: SiteIntelligence = {
  _id: { $oid: "69e907160a2a1707a4a3e7ff" },
  user_id: "69e6f7d3563ef6a56d82bd28",
  web_entity_id: "69e6f842563ef6a56d82bd29",
  keywords: {
    competitor_keywords: COMPETITOR_KEYWORDS,
  },
}
