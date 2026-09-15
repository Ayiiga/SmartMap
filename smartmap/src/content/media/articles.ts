import type { NewsArticle } from "@/types/media";

const local = (file: string) => `/images/news/${file}`;

/** Build readable body paragraphs from extended summaries. */
function buildArticleBody(aiSummary2m: string, aiSummaryFull: string): string[] {
  const combined = `${aiSummary2m.trim()} ${aiSummaryFull.trim()}`.trim();
  const sentences = combined.split(/(?<=[.!?])\s+/).filter((s) => s.length > 12);
  if (sentences.length <= 2) return [combined];

  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    paragraphs.push(sentences.slice(i, i + 2).join(" "));
  }
  return paragraphs;
}

function withBody<T extends Omit<NewsArticle, "body">>(article: T): NewsArticle {
  return {
    ...article,
    body: buildArticleBody(article.aiSummary2m, article.aiSummaryFull),
  };
}

const RAW_ARTICLES = [
  {
    id: "1",
    slug: "ghana-parliament-economic-reform-bill",
    title: "Ghana Parliament Advances Economic Reform Bill Amid Regional Debate",
    summary: "Lawmakers pass key provisions aimed at stabilizing markets and attracting investment ahead of the 2026 fiscal year.",
    category: "politics",
    country: "ghana",
    imageUrl: local("politics.jpg"),
    publishedAt: "2026-07-10T14:30:00Z",
    author: "Ama Mensah",
    readMinutes: 4,
    isBreaking: true,
    aiSummary30s: "Ghana's parliament advanced an economic reform bill focused on fiscal stability and foreign investment.",
    aiSummary2m: "Ghana's parliament has moved forward on a sweeping economic reform package designed to strengthen fiscal discipline and improve investor confidence. The bill includes measures on public spending oversight, tax modernization, and incentives for green energy projects. Opposition leaders raised concerns about implementation timelines, while business groups welcomed provisions aimed at reducing bureaucratic delays.",
    aiSummaryFull: "Ghana's parliament has advanced a major economic reform bill that could reshape the country's fiscal framework through 2026. The legislation combines spending controls, digital tax administration, and targeted incentives for renewable infrastructure. Analysts say the reforms align with broader ECOWAS efforts to attract capital amid shifting global trade patterns. Civil society groups are calling for stronger transparency mechanisms as the bill moves to committee review.",
    keyPoints: ["Reform bill passes first reading", "Focus on fiscal stability and investment", "Green energy incentives included", "Committee review scheduled next week"],
    timeline: [
      { time: "09:00", event: "Bill introduced in morning session" },
      { time: "12:45", event: "Debate on fiscal oversight clauses" },
      { time: "16:20", event: "First reading approved" },
    ],
    tags: ["Ghana", "Economy", "Parliament"],
  },
  {
    id: "2",
    slug: "nigeria-tech-startups-funding-surge",
    title: "Nigeria's Tech Startups See Record Q2 Funding Despite Global Slowdown",
    summary: "Fintech and AI ventures lead a $420M investment wave as Lagos strengthens its position as Africa's innovation hub.",
    category: "technology",
    country: "nigeria",
    imageUrl: local("technology.jpg"),
    publishedAt: "2026-07-10T12:00:00Z",
    author: "Chidi Okonkwo",
    readMinutes: 5,
    aiSummary30s: "Nigerian startups raised $420M in Q2, led by fintech and AI companies based in Lagos.",
    aiSummary2m: "Nigeria's startup ecosystem recorded its strongest funding quarter in two years, with fintech and artificial intelligence companies attracting the majority of capital. Investors cited improved regulatory clarity and growing mobile payment adoption as key drivers. Several Lagos-based firms announced expansion into East Africa.",
    aiSummaryFull: "Despite a cautious global venture climate, Nigerian technology startups raised approximately $420 million in the second quarter of 2026. Fintech platforms accounted for nearly half of total deal value, while AI infrastructure and logistics startups closed several Series B rounds. Industry observers note that local pension fund participation and diaspora angel networks are increasingly active in early-stage rounds.",
    keyPoints: ["$420M raised in Q2", "Fintech and AI lead sectors", "Lagos remains primary hub", "Expansion into East Africa announced"],
    timeline: [
      { time: "08:00", event: "Quarterly funding report released" },
      { time: "11:30", event: "Major fintech Series B announced" },
    ],
    tags: ["Nigeria", "Startups", "Fintech", "AI"],
  },
  {
    id: "3",
    slug: "world-cup-2026-group-stage-preview",
    title: "World Cup 2026: African Teams Draw Tough Groups as Preparations Intensify",
    summary: "Five African nations face challenging paths to the knockout stage with friendlies and training camps underway across the continent.",
    category: "sports",
    imageUrl: local("sports.jpg"),
    publishedAt: "2026-07-10T10:15:00Z",
    author: "Kwame Asante",
    readMinutes: 6,
    isBreaking: true,
    aiSummary30s: "African World Cup 2026 teams face tough groups as squads begin final preparation camps.",
    aiSummary2m: "With the FIFA World Cup 2026 approaching, African representatives are entering decisive preparation phases. Ghana, Nigeria, Morocco, Senegal, and South Africa each face competitive group draws that will test squad depth. Coaches are prioritizing fitness camps and tactical friendlies before the tournament opener.",
    aiSummaryFull: "Africa will be represented by five nations at the 2026 FIFA World Cup, and early group-stage analysis suggests several tight races for advancement. Morocco enters as the highest-ranked African side, while Ghana and Nigeria are rebuilding squads around younger talent. Federation officials emphasize sports science and data analytics in training programs.",
    keyPoints: ["Five African teams qualified", "Competitive group draws", "Training camps underway", "Morocco highest-ranked African side"],
    timeline: [
      { time: "07:00", event: "CAF releases preparation schedule" },
      { time: "14:00", event: "Ghana squad training camp opens" },
    ],
    tags: ["World Cup 2026", "Football", "Africa"],
  },
  {
    id: "4",
    slug: "kenya-renewable-energy-milestone",
    title: "Kenya Hits 90% Renewable Grid Milestone, Sets Regional Benchmark",
    summary: "Geothermal and wind projects push Kenya's clean energy share to record levels, drawing interest from neighboring governments.",
    category: "science",
    country: "kenya",
    imageUrl: local("science.jpg"),
    publishedAt: "2026-07-10T08:45:00Z",
    author: "Grace Wanjiku",
    readMinutes: 4,
    aiSummary30s: "Kenya reached 90% renewable electricity generation, leading Africa in clean energy adoption.",
    aiSummary2m: "Kenya has achieved a landmark 90% renewable share in its national electricity mix, driven by geothermal expansion and new wind farms in the Rift Valley. Energy officials say the milestone positions Kenya as a model for East African grid modernization.",
    aiSummaryFull: "Kenya's energy ministry confirmed that renewable sources now supply approximately 90% of national grid electricity, a figure unmatched across sub-Saharan Africa. Geothermal plants in the Olkaria region remain the backbone, supplemented by Lake Turkana wind and distributed solar programs. Regional leaders are studying Kenya's regulatory framework for replication.",
    keyPoints: ["90% renewable electricity", "Geothermal leads mix", "Regional benchmark set", "Solar programs expanding"],
    timeline: [{ time: "06:30", event: "Ministry releases annual energy report" }],
    tags: ["Kenya", "Renewable Energy", "Climate"],
  },
  {
    id: "5",
    slug: "south-africa-markets-rally",
    title: "JSE Rallies as Mining Stocks Surge on Commodity Price Recovery",
    summary: "Johannesburg equities gain 2.1% as gold and platinum prices rebound, boosting African market sentiment.",
    category: "business",
    country: "south-africa",
    imageUrl: local("business.jpg"),
    publishedAt: "2026-07-10T07:30:00Z",
    author: "Thabo Molefe",
    readMinutes: 3,
    aiSummary30s: "South Africa's JSE gained 2.1% led by mining stocks on rising commodity prices.",
    aiSummary2m: "The Johannesburg Stock Exchange posted strong gains as mining giants benefited from recovering gold and platinum prices. Analysts note improved risk appetite across emerging markets.",
    aiSummaryFull: "South African equities rallied sharply as commodity-linked shares led the JSE All Share index higher. Mining companies with platinum and gold exposure saw the largest moves, while financials tracked modest gains amid stable rand trading.",
    keyPoints: ["JSE up 2.1%", "Mining stocks lead", "Commodity prices recovering", "Rand stable"],
    timeline: [{ time: "09:00", event: "Market open rally begins" }],
    tags: ["South Africa", "Markets", "Mining"],
  },
  {
    id: "6",
    slug: "afcon-2027-host-cities-confirmed",
    title: "AFCON 2027 Host Cities Confirmed Across Three Nations",
    summary: "Kenya, Tanzania, and Uganda finalize venue list for Africa's biggest football tournament.",
    category: "sports",
    imageUrl: local("sports.jpg"),
    publishedAt: "2026-07-09T18:00:00Z",
    author: "David Kariuki",
    readMinutes: 4,
    aiSummary30s: "AFCON 2027 host cities across Kenya, Tanzania, and Uganda have been officially confirmed.",
    aiSummary2m: "CAF has announced the final host city list for AFCON 2027, a tournament shared by Kenya, Tanzania, and Uganda. Stadium upgrades are accelerating ahead of the continental championship.",
    aiSummaryFull: "The Confederation of African Football confirmed six host cities for the 2027 Africa Cup of Nations, marking the first tri-nation tournament in the competition's history. Infrastructure projects are underway to meet broadcast and fan capacity requirements.",
    keyPoints: ["Six host cities confirmed", "Tri-nation tournament", "Stadium upgrades ongoing"],
    timeline: [{ time: "15:00", event: "CAF press conference" }],
    tags: ["AFCON", "Football", "East Africa"],
  },
  {
    id: "7",
    slug: "global-ai-regulation-summit",
    title: "Global AI Regulation Summit Opens with Africa Representation",
    summary: "Delegates from 40 nations discuss ethical AI frameworks, with African voices pushing for inclusive standards.",
    category: "technology",
    imageUrl: local("technology.jpg"),
    publishedAt: "2026-07-09T16:00:00Z",
    author: "Elena Torres",
    readMinutes: 5,
    aiSummary30s: "A global AI summit opens with African delegates advocating for inclusive regulation frameworks.",
    aiSummary2m: "International leaders gathered for a landmark AI regulation summit addressing safety, transparency, and equitable access. African representatives emphasized the need for standards that support local innovation.",
    aiSummaryFull: "The Global AI Regulation Summit convened delegates from more than 40 countries to debate governance frameworks for rapidly advancing artificial intelligence systems. African technology ministers called for funding mechanisms that prevent regulatory frameworks from disadvantaging emerging markets.",
    keyPoints: ["40 nations represented", "Focus on ethical AI", "Africa pushes inclusive standards"],
    timeline: [{ time: "10:00", event: "Opening plenary session" }],
    tags: ["AI", "Regulation", "Global"],
  },
  {
    id: "8",
    slug: "nollywood-streaming-record",
    title: "Nollywood Streaming Platforms Report Record Subscriptions",
    summary: "Nigerian film industry sees 35% subscriber growth as original series gain international audiences.",
    category: "entertainment",
    country: "nigeria",
    imageUrl: local("entertainment.jpg"),
    publishedAt: "2026-07-09T14:00:00Z",
    author: "Funke Adeyemi",
    readMinutes: 3,
    aiSummary30s: "Nollywood streaming services grew subscriptions 35% on the strength of new original series.",
    aiSummary2m: "Nigeria's streaming platforms reported record subscriber growth driven by premium original content and diaspora audiences. Industry analysts expect continued expansion across West Africa.",
    aiSummaryFull: "Major Nollywood-backed streaming services recorded a 35% year-over-year increase in paid subscriptions, fueled by high-production drama series and strategic partnerships with global distributors.",
    keyPoints: ["35% subscriber growth", "Original series driving demand", "Diaspora audience expanding"],
    timeline: [{ time: "12:00", event: "Industry report published" }],
    tags: ["Nollywood", "Entertainment", "Streaming"],
  },
  {
    id: "9",
    slug: "africa-malaria-vaccine-rollout",
    title: "Expanded Malaria Vaccine Rollout Reaches 12 African Nations",
    summary: "WHO-backed immunization program accelerates across West and Central Africa, targeting millions of children under five.",
    category: "health",
    country: "ghana",
    imageUrl: local("health.jpg"),
    publishedAt: "2026-07-10T11:00:00Z",
    author: "Dr. Fatima Bello",
    readMinutes: 4,
    aiSummary30s: "Malaria vaccine rollout expands to 12 African countries, protecting millions of young children.",
    aiSummary2m: "A coordinated malaria vaccine campaign has expanded to 12 African nations, with health ministries reporting strong uptake in Ghana, Nigeria, and Kenya. The program targets children under five in high-burden regions.",
    aiSummaryFull: "The World Health Organization and African health ministries announced a major expansion of malaria vaccine distribution across 12 countries. Early data from pilot programs show significant reductions in severe cases among vaccinated children.",
    keyPoints: ["12 nations in rollout", "Focus on children under five", "Strong uptake in Ghana and Nigeria", "WHO-backed program"],
    timeline: [
      { time: "08:00", event: "WHO briefing on rollout progress" },
      { time: "13:00", event: "Ghana vaccination centers report record day" },
    ],
    tags: ["Health", "Malaria", "Vaccine", "Africa"],
  },
] as const satisfies readonly Omit<NewsArticle, "body">[];

export const NEWS_ARTICLES: NewsArticle[] = RAW_ARTICLES.map((article) => withBody(article));

export function getArticleBySlug(slug: string): NewsArticle | undefined {
  return NEWS_ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: NewsArticle["category"]): NewsArticle[] {
  return NEWS_ARTICLES.filter((a) => a.category === category);
}

export function getBreakingNews(): NewsArticle[] {
  return NEWS_ARTICLES.filter((a) => a.isBreaking);
}

export function getAfricaNews(): NewsArticle[] {
  return NEWS_ARTICLES.filter((a) => a.country);
}

/** Hero slider: one featured story per major category */
export function getHeroArticles(): NewsArticle[] {
  const categories: NewsArticle["category"][] = [
    "politics",
    "sports",
    "entertainment",
    "technology",
    "business",
    "health",
    "science",
  ];
  const picked: NewsArticle[] = [];
  const breaking = getBreakingNews();
  if (breaking[0]) picked.push(breaking[0]);

  for (const cat of categories) {
    const article = NEWS_ARTICLES.find((a) => a.category === cat && !picked.some((p) => p.id === a.id));
    if (article) picked.push(article);
  }

  return picked.length > 0 ? picked : NEWS_ARTICLES.slice(0, 7);
}
