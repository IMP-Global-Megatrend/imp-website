import { SiteShell } from '../_components/SiteShell'
import { getCMSPageBySlug } from '../_components/getCMSPageBySlug'
import { CMSPageContent } from '../_components/CMSPageContent'

const megatrends = [
  {
    icon: '/images/technology_icon.png',
    title: 'Technology/Technological Advancements',
    subtitle: "Redefining what's possible.",
    description: [
      'The exponential rise of technologies such as artificial intelligence (AI), machine learning, quantum computing, and the Internet of Things (IoT) is transforming not only industries but entire economic models.',
      'Semiconductors are foundational, enabling everything from data center acceleration to edge computing and next-gen consumer devices.',
      'Cloud computing, robotics, and automation are driving efficiency across manufacturing, logistics, and services.',
      'Cybersecurity has become mission-critical in an interconnected world, with zero-trust architectures and behavioral threat detection technologies becoming key defensive frontiers.',
    ],
    conclusion:
      'We invest in companies at the core of this innovation stack — from component suppliers to platforms and enablers — with a focus on scalable, defensible, and capital-light business models.',
  },
  {
    icon: '/images/consumer_icon.png',
    title: 'Changing Consumer Behavior/Demographics',
    subtitle: 'A new era of demand.',
    description: [
      'Shifting demographics and evolving preferences are altering global consumption patterns:',
      'Aging populations in developed markets are creating demand for healthcare, financial planning, and experience-based services.',
      'Urbanization is redefining housing, infrastructure, and mobility needs.',
      'The mobile-first generation, particularly in Asia and Africa, is accelerating the rise of e-commerce, digital entertainment, and decentralized service delivery.',
      'Intergenerational wealth transfer is shaping investment behavior, sustainability preferences, and spending priorities.',
    ],
    conclusion:
      'We target businesses that are successfully capturing this shift — from digital platforms and healthtech firms to premium consumer brands and urban infrastructure providers.',
  },
  {
    icon: '/images/healthcare_icon.png',
    title: 'Healthcare/Longevity Revolution',
    subtitle: 'Investing in longer, healthier lives.',
    description: [
      'Medical science is evolving from reactive treatment to proactive, personalized healthcare. This revolution is underpinned by:',
      'Biotechnology and genomics, unlocking targeted therapies and regenerative medicine.',
      'Digital health platforms, telemedicine, and AI-powered diagnostics, bringing scalable precision to care delivery.',
      'Advanced surgical robotics and medtech innovations enhancing patient outcomes and operational efficiency.',
    ],
    conclusion:
      'We focus on companies at the forefront of life sciences, diagnostics, healthcare infrastructure, and biopharmaceutical innovation, offering scalable solutions to global healthcare challenges.',
  },
  {
    icon: '/images/economic_icon.png',
    title: 'Shift in Economic Power',
    subtitle: 'Emerging markets at the frontier of growth.',
    description: [
      'The epicenter of global economic activity is moving. Asia, Latin America, and select parts of Africa are witnessing a surge in productivity, innovation, and consumption. Key drivers include:',
      'The rise of a digitally native middle class with increasing purchasing power.',
      'Growth in financial inclusion through mobile banking, fintech apps, and digital payment ecosystems.',
      'Adoption of decentralized finance (DeFi) and digital currencies, which are reducing friction and increasing access in global transactions.',
      'Local innovation hubs in cities like Bangalore, Shenzhen, and São Paulo that are shaping global technology supply chains.',
    ],
    conclusion:
      'We invest in companies that are either emerging champions within these regions or global firms poised to capitalize on this rebalancing of economic power.',
  },
  {
    icon: '/images/mobility_icon.png',
    title: 'Mobility/Transportation',
    subtitle: 'The reinvention of movement.',
    description: [
      'A radical redefinition of how people and goods move is underway, centered on sustainability, safety, and smart systems.',
      'Electric vehicles (EVs) are going mainstream, supported by battery innovation, policy incentives, and charging infrastructure build-out.',
      'Autonomous driving and mobility-as-a-service (MaaS) platforms are improving safety, accessibility, and urban efficiency.',
      'Drone logistics and AI-based traffic optimization are pushing boundaries in last-mile delivery and infrastructure planning.',
      'Smart cities and intelligent infrastructure are integrating mobility solutions to reduce congestion and emissions.',
    ],
    conclusion:
      'We invest in companies at the core of this innovation stack — from component suppliers to platforms and enablers — with a focus on scalable, defensible, and capital-light business models.',
  },
  {
    icon: '/images/infrastructure_icon.png',
    title: 'Smart Infrastructure/Smart City',
    subtitle: "The backbone of tomorrow's urban life.",
    description: [
      'Cities are transforming into intelligent, connected ecosystems, powered by digitalization, electrification, and advanced technologies.',
      'AI, IoT, 5G, and edge computing are embedded into housing, transportation, energy grids, and public services.',
      'Real-time analytics enable predictive maintenance, efficient resource allocation, and resilient city operations.',
      'Data centers, transmission networks, and utility systems are scaling to meet surging connectivity and electrification demands.',
      'Smart construction and adaptive energy systems are addressing sustainability and urban growth challenges.',
    ],
    conclusion:
      'We target companies building and enabling this next-generation infrastructure — from critical components and platforms to service providers — with a focus on scalable, adaptive, and high-barrier business models.',
  },
]

export default async function MegatrendsPage() {
  const cmsPage = await getCMSPageBySlug('megatrends')
  if (cmsPage) {
    return <CMSPageContent page={cmsPage as never} />
  }

  return (
    <SiteShell>
      <main className="bg-white text-[#0b1035]">
        {/* Hero */}
        <section className="bg-[#2b3dea] pt-32 pb-16 md:pt-40 md:pb-20">
          <div className="container">
            <h1 className="text-white text-[38px] md:text-[48px] leading-[1.12] tracking-tight max-w-3xl">
              The Six Megatrends Powering Our Portfolio
            </h1>
            <p className="mt-4 text-white/70 text-[17px] max-w-2xl leading-[1.6]">
              Megatrends focus on a deep, structural force reshaping the global economy. These themes are enduring, transformative, and global.
            </p>
          </div>
        </section>

        {/* Intro */}
        <section className="container py-16 md:py-20">
          <h2 className="text-[26px] leading-[1.3] text-[#0b1035] mb-4">
            Investing at the Intersection of Innovation, Demographics, and Sustainability
          </h2>
          <p className="text-[#2b3045] leading-relaxed max-w-4xl mb-4">
            At the heart of the IMP Global Megatrend Umbrella Fund is our deep conviction in the power of structural change. We focus on six transformational megatrends that are reshaping the global economy, society, and our daily lives.
          </p>
          <p className="text-[#5f6477] leading-relaxed max-w-4xl">
            These trends are not fleeting fads; they are multi-decade forces that cut across sectors and geographies &mdash; creating durable, secular growth opportunities for companies aligned with them.
          </p>
        </section>

        {/* Megatrend sections */}
        <div className="container pb-16 md:pb-20 space-y-16">
          {megatrends.map((trend, idx) => (
            <section key={trend.title} className="grid md:grid-cols-[80px_1fr] gap-6 md:gap-8">
              <div className="flex items-start">
                <img
                  src={trend.icon}
                  alt=""
                  className="w-[60px] h-[60px] object-contain"
                />
              </div>
              <div>
                <p className="text-[12px] text-[#5f6477] uppercase tracking-[0.15em] mb-2">
                  Megatrend {idx + 1}
                </p>
                <h2 className="text-[26px] leading-[1.2] text-[#0b1035] mb-2">
                  {trend.title}
                </h2>
                <p className="text-[#0040ff] text-[17px] mb-4">{trend.subtitle}</p>
                <div className="space-y-3 text-[#2b3045] leading-relaxed">
                  {trend.description.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
                <p className="mt-5 text-[#2b3045] leading-relaxed font-medium">
                  {trend.conclusion}
                </p>
              </div>
            </section>
          ))}
        </div>

        {/* Thematic Framework */}
        <section className="bg-[#f5f7ff] py-16 md:py-20">
          <div className="container max-w-4xl">
            <h2 className="text-[26px] leading-[1.3] text-[#0b1035] mb-4">
              Our Thematic Framework in Action
            </h2>
            <p className="text-[#2b3045] leading-relaxed mb-4">
              Each company in our portfolio must demonstrate direct revenue exposure to one or more of these six megatrends. Rather than following index composition, we build a high-conviction portfolio that reflects our forward-looking thematic convictions.
            </p>
            <p className="text-[#2b3045] leading-relaxed">
              We believe that investing through the lens of these megatrends not only aligns capital with positive change, but also positions investors to capture asymmetric growth in a complex and rapidly evolving global economy.
            </p>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
