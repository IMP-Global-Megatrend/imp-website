/**
 * Hand-curated Lexical document for /articles/benchmark-constraints-and-goal-based-investing.
 * Source: IMP Global Megatrend Umbrella Fund Benchmark EN.docx.
 */
function tx(s: string) {
  return {
    type: 'text' as const,
    text: s.replace(/\u200b/g, ''),
    format: 0,
    detail: 0,
    mode: 'normal' as const,
    style: '',
    version: 1,
  }
}

function h(tag: 'h2' | 'h3', title: string) {
  return {
    type: 'heading' as const,
    tag,
    children: [tx(title)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  }
}

function p(body: string) {
  return {
    type: 'paragraph' as const,
    children: [tx(body)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    textFormat: 0,
    version: 1,
  }
}

/** Serialized editor root for Payload `posts.content`. */
export function getBenchmarkArticleLexicalRoot() {
  return {
    root: {
      type: 'root' as const,
      children: [
        h('h3', 'Lack of Representative Benchmarks'),
        p(
          'Funds particularly those with diversified, multi-asset strategies or a distinctive investment philosophy like the IMP Global Megatrend Umbrella Fund face inherent limitations in identifying a single benchmark that accurately reflects their positioning. This is especially true for strategies that focus on structural megatrends such as Technology/Technological Advancements, Changing Consumer Behavior/Demographics, Healthcare/Longevity Revolution, Shift in Economic Power, Mobility/Transportation, and Smart Infrastructure/Smart City. Our portfolio, for example, maintains a deliberate overweight in U.S. equities, especially within the technology and consumer sectors, which are central to these megatrends. Traditional indices, whether global or regional, often lack sufficient exposure to these themes or dilute them through broad sectoral or geographic diversification. As a result, using a conventional benchmark can lead to misleading comparisons that neither capture the thematic intent of the strategy nor fairly represent its risk-return profile.',
        ),
        h('h3', 'Misaligned Incentives and Risk Profiles'),
        p(
          'Benchmarking often emphasizes relative performance, measuring how a fund performs in comparison to a broad index, rather than focusing on absolute returns or the actual achievement of investor-specific objectives. This narrow focus can create misaligned incentives: fund managers may feel compelled to track or outperform a benchmark quarter by quarter, even if doing so requires increased portfolio turnover and short-term tactical positioning, or exposure to areas that do not align with their core conviction or risk framework. In extreme cases, it can promote "benchmark hugging" or excessive risk-taking simply to avoid lagging behind a peer group or index.',
        ),
        p(
          'For a future-oriented, conviction-driven strategy such as the IMP Global Megatrend Umbrella Fund, which is structurally tilted toward secular growth areas, this mindset is not only counterproductive but inconsistent with our fiduciary responsibility. Our goal is to deliver sustainable long-term value by investing in transformative megatrends that unfold over multiple economic cycles. Capital preservation in down markets and compounding growth in up markets matter far more to our investors than whether we outperformed the MSCI World in any given quarter. Benchmarks do not reflect the idiosyncratic nature of our exposures or the intentional risk we take to align with enduring megatrends and therefore, they are an inadequate tool for judging our success.',
        ),
        h('h3', 'Benchmark Manipulation and Bias'),
        p(
          'Another significant concern in the context of benchmarking is the potential for benchmark manipulation and bias. Studies and regulatory reviews have revealed that some institutional investors and asset managers design or select benchmarks that are inherently easier to outperform either through narrower sector exposure, regionally skewed indices, or custom composites that reflect a favorable historical backtest. This practice, often referred to as benchmark bias, creates the illusion of outperformance while distorting the true sources of return. It undermines the integrity of performance assessments and can mislead investors, particularly those unfamiliar with the construction or limitations of the chosen benchmark.',
        ),
        p(
          'For a forward-looking, unconstrained strategy like the IMP Global Megatrend Umbrella Fund, where portfolio construction is driven by structural themes rather than index weights, such practices are both inappropriate and unnecessary. Our strategy intentionally deviates from traditional benchmarks most of which underrepresent the high-growth segments we are invested in. As a result, anchoring our success to an artificially constructed or overly accommodating benchmark would obscure the real value we deliver: long-term, conviction-led exposure to global transformational megatrends. Instead of relying on biased or convenient comparators, we focus on transparent communication of our strategy, risk profile, and long-term outcomes.',
        ),
        h('h3', 'Overemphasis on Short-Term Performance'),
        p(
          'The constant pressure to outperform benchmarks on a monthly or quarterly basis can create a structural bias toward short-termism in portfolio management. This phenomenon often referred to as "benchmarkism" can lead even seasoned professionals to deviate from their strategic convictions in favor of temporary market trends or index-relative positioning. The consequence is often a dilution of investment discipline: decisions are made to manage optics and relative rankings, rather than to maximize long-term value creation or risk-adjusted returns over time; hence, not acting in the best interest of investors.',
        ),
        p(
          'For thematic, megatrend-oriented strategies like the IMP Global Megatrend Umbrella Fund, such short-term pressures are not only misaligned with our investment horizon, but actively detrimental. Our approach is grounded in identifying structural shifts that unfold over years, not quarters. Attempting to optimize for benchmark-relative performance in the short term would risk undermining the very exposures that drive long-term success. Instead, we deliberately maintain a high-conviction portfolio with thematic overweights that may periodically diverge from index behavior but are rooted in long-term secular growth dynamics.',
        ),
        p(
          "Our focus remains firmly on durable value creation and strategic alignment with transformational megatrends, not temporary peer rankings. In doing so, we seek to deliver meaningful, compounding outcomes that resonate with our investors' long-term objectives—not just their quarterly reports.",
        ),
        h('h2', 'Regulatory Evolution'),
        p(
          "Recognizing the growing disconnect between rigid benchmark frameworks and the evolving landscape of modern investment strategies, the European Commission has proposed significant reforms to the EU Benchmark Regulation (BMR). These proposals, aimed at reducing regulatory complexity and administrative burdens, acknowledge that a one-size-fits-all approach to benchmarking may not be appropriate in today's diverse financial environment.",
        ),
        p(
          'In December 2024, a political agreement was reached between the European Parliament and the Council to amend the BMR. One of the key changes includes introducing a minimum threshold of €50 billion in financial instruments and contracts referencing a benchmark, effectively narrowing the scope to only the most economically significant benchmarks . This move aims to alleviate compliance burdens, particularly for smaller benchmark administrators and users, and reflects a shift towards a more proportionate regulatory framework.',
        ),
        p(
          "For funds like the IMP Global Megatrend Umbrella Fund, these regulatory changes are particularly pertinent. Traditional benchmarks often fail to capture the nuanced exposures and strategic allocations inherent in such funds, especially when there's a deliberate overweight in sectors like U.S. technology and consumer innovation. The revised BMR acknowledges these challenges, providing a more accommodating environment for funds that deviate from conventional benchmark compositions.",
        ),
        p(
          "By streamlining benchmark regulations and recognizing the limitations of a uniform benchmarking approach, the European Commission's reforms support the evolution of investment strategies that prioritize long-term value creation over short-term benchmark outperformance. This regulatory shift aligns with our commitment to delivering long-term, conviction-driven investment solutions that are not constrained by traditional benchmarking limitations.",
        ),
        h('h2', 'Shift Towards Goal-Based Investing'),
        p(
          "Investors are increasingly moving away from traditional relative performance metrics and instead prioritizing investment solutions that align with their personalized financial goals. This evolution reflects a broader trend across fund and asset management: a growing emphasis on goals-based investing. Rather than measuring success by outperforming a market index often constructed without regard for an individual's risk tolerance, time horizon, or goals, investors today are more focused on achieving specific, tangible outcomes such as capital preservation, retirement readiness, legacy planning, or sustainable income.",
        ),
        p(
          "This shift has been noted in multiple industry reports. According to a 2023 study by BlackRock and reaffirmed by the CFA Institute, goals-based investing is becoming central to both private and institutional portfolios. The CFA Institute's research emphasizes that aligning portfolio construction with investor outcomes rather than arbitrary benchmarks can enhance satisfaction, improve behavioral outcomes, and reduce the tendency toward short-term decision-making driven by index fluctuations.",
        ),
        p(
          'For the IMP Global Megatrend Umbrella Fund, this shift is highly relevant. Our strategy is intentionally designed not to mimic benchmark compositions but to invest in long-term structural global themes. These trends are selected to deliver durable value and risk-adjusted returns across full market cycles, aligning naturally with investors who are seeking long-term capital growth, resilience, and purpose-driven exposure not merely outperformance of an index like the MSCI World or S&P 500 in any given year.',
        ),
        p(
          'In this context, traditional benchmarks are increasingly outdated as a primary reference point. They fail to capture what truly matters to investors: whether their portfolio is enabling them to reach their unique financial goals in a manner consistent with their values, time horizon, and risk appetite.',
        ),
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

export function getBenchmarkArticlePlainForMeta(): string {
  const doc = getBenchmarkArticleLexicalRoot()
  const parts: string[] = []
  const walk = (nodes: unknown) => {
    if (!Array.isArray(nodes)) return
    for (const n of nodes) {
      if (!n || typeof n !== 'object') continue
      const o = n as { type?: string; text?: string; children?: unknown[] }
      if (o.type === 'text' && typeof o.text === 'string') parts.push(o.text)
      if (Array.isArray(o.children)) walk(o.children)
    }
  }
  walk(doc.root.children)
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}
