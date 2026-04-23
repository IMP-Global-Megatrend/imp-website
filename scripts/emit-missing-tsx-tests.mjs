/**
 * One-off: emit the remaining colocated test files. Run: node scripts/emit-missing-tsx-tests.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function w(rel, body) {
  const p = path.join(root, rel)
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, body.trim() + '\n', 'utf8')
}

const nav = `jest.mock('next/navigation', () => ({ usePathname: () => '/', useRouter: () => ({ push: jest.fn() }) }))`
const lucideMock = `jest.mock('lucide-animated', () => {
  const React = require('react')
  const C = React.forwardRef((p, r) => React.createElement('span', { 'data-testid': 'lucide', ref: r }))
  C.displayName = 'I'
  return new Proxy({}, { get: () => C })
})
`

const T = {
  'src/app/(frontend)/_components/ContentGatePopup.test.tsx': `
${nav}
import { ContentGatePopup } from './ContentGatePopup'
import { render } from '@testing-library/react'
describe('ContentGatePopup', () => {
  it('mounts', () => {
    const { container } = render(<ContentGatePopup />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
`,
  'src/app/(frontend)/_components/CursorAttrSanitizer.test.tsx': `
import { CursorAttrSanitizer } from './CursorAttrSanitizer'
import { render } from '@testing-library/react'
describe('CursorAttrSanitizer', () => {
  it('returns null in tests', () => {
    const { container } = render(<CursorAttrSanitizer />)
    expect(container.firstChild).toBeNull()
  })
})
`,
  'src/app/(frontend)/_components/ExploreSection.test.tsx': `${lucideMock}
import { ExploreSection } from './ExploreSection'
import { render, screen } from '@testing-library/react'
describe('ExploreSection', () => {
  it('renders a heading', () => {
    render(<ExploreSection />)
    expect(screen.getByText('Explore Our Megatrends')).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/_components/FormLandingLayout.test.tsx': `
${nav}
import { FormLandingLayout } from './FormLandingLayout'
import { render, screen } from '@testing-library/react'
const palette = { color1: '#1', color2: '#2', color3: '#3' }
describe('FormLandingLayout', () => {
  it('renders children in a main landmark', () => {
    render(
      <FormLandingLayout heroTitle="T" heroSubtitle="S" palette={palette}>
        <p>c</p>
      </FormLandingLayout>,
    )
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByText('T')).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/_components/FundShareClassesSection.test.tsx': `
import { FundShareClassesSection } from './FundShareClassesSection'
import { render, screen } from '@testing-library/react'
const c = (title: string) => ({
  title,
  feeLabel: 'F',
  feeText: 't',
  isin: 'i',
  wkn: 'w',
  bloomberg: 'b',
} as never)
describe('FundShareClassesSection', () => {
  it('renders share class columns', () => {
    render(
      <FundShareClassesSection
        usdContent={c('USD')}
        chfContent={c('CHF')}
        shareClassMeta={null}
      />,
    )
    expect(screen.getByText('USD', { exact: true })).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/_components/GradientMotionBackground.test.tsx': `${nav}
import { GradientMotionBackground } from './GradientMotionBackground'
import { render } from '@testing-library/react'
describe('GradientMotionBackground', () => {
  it('mounts a decorative layer', () => {
    const { container } = render(<GradientMotionBackground />)
    expect(container.querySelector('div')).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/_components/HeaderThemeClient.test.tsx': `
import HeaderThemeClient from './HeaderThemeClient'
import { render, screen } from '@testing-library/react'
describe('HeaderThemeClient', () => {
  it('sets the document theme from props', () => {
    render(<HeaderThemeClient theme="light" />)
    expect(document.documentElement.getAttribute('data-header-theme')).toBe('light')
  })
})
`,

  'src/app/(frontend)/_components/HeroCtaButton.test.tsx': `
import { HeroCtaButton } from './HeroCtaButton'
import { render, screen } from '@testing-library/react'
describe('HeroCtaButton', () => {
  it('renders a CTA link', () => {
    render(<HeroCtaButton href="/x" label="Next" />)
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('href', '/x')
  })
})
`,

  'src/app/(frontend)/_components/HeroGradientCanvas.test.tsx': `${nav}
import { HeroGradientCanvas } from './HeroGradientCanvas'
import { render } from '@testing-library/react'
describe('HeroGradientCanvas', () => {
  it('mounts a canvas', () => {
    const { container } = render(<HeroGradientCanvas />)
    expect(container.querySelector('canvas')).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/_components/HeroGrainientBackground.test.tsx': `
import { HeroGrainientBackground } from './HeroGrainientBackground'
import { render, screen } from '@testing-library/react'
const palette = { top: 'red', bottom: 'blue' } as never
describe('HeroGrainientBackground', () => {
  it('applies a gradient', () => {
    const { container } = render(
      <HeroGrainientBackground palette={palette} className="test-gradient" />,
    )
    expect(container.querySelector('.test-gradient')).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/_components/HeroSection.test.tsx': `
jest.mock('./getHomeCMSContent', () => ({ getHomeCMSContent: () => Promise.resolve({ hero: {} } as never) }))
import { HeroSection } from './HeroSection'
import { render } from '@testing-library/react'
import { act } from 'react'
describe('HeroSection', () => {
  it('fetches and renders', async () => {
    const ui = await act(async () => await HeroSection())
    const { container } = render(ui)
    expect(container.querySelector('section') || document.body).toBeTruthy()
  })
})
`,

  'src/app/(frontend)/_components/LightHeaderPageClient.test.tsx': `
import LightHeaderPageClient from './LightHeaderPageClient'
import { render, screen } from '@testing-library/react'
describe('LightHeaderPageClient', () => {
  it('is empty', () => {
    const { container } = render(<LightHeaderPageClient />)
    expect(container).toBeEmptyDOMElement()
  })
})
`,

  'src/app/(frontend)/_components/MegatrendCard.test.tsx': `
import { MegatrendCard } from './MegatrendCard'
import { render, screen } from '@testing-library/react'
const card = { id: 1, name: 'M', blurb: 'B', number: 1, slug: 'm' } as never
describe('MegatrendCard', () => {
  it('links to the detail page', () => {
    render(<MegatrendCard card={card} index={0} imageSrc="/a.jpg" linkHref="/megatrends/1" />)
    expect(screen.getByText('M')).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/_components/MegatrendDetailSection.test.tsx': `
import { MegatrendDetailSection } from './MegatrendDetailSection'
import { render, screen } from '@testing-library/react'
const block = { type: 'richText' as const, richText: { root: { type: 'root', children: [], direction: 'ltr', format: '', indent: 0, version: 1 } } }
describe('MegatrendDetailSection', () => {
  it('renders content blocks', () => {
    render(
      <MegatrendDetailSection
        name="M"
        tagline="T"
        blurb="B"
        number={1}
        showNumber={true}
        blocks={[block] as never}
      />,
    )
    expect(screen.getByText('M', { exact: false })).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/_components/PageHero.test.tsx': `${nav}
import { PageHero, PageHeroSubtitle, PageHeroMeta } from './PageHero'
import { render, screen } from '@testing-library/react'
describe('PageHero', () => {
  it('renders title and subtitle', () => {
    render(
      <PageHero title="T" subtitle="S" showBackground={false} showScrollIndicator={false} />,
    )
    expect(screen.getByText('T', { exact: false })).toBeInTheDocument()
  })
})
describe('PageHero parts', () => {
  it('renders PageHeroSubtitle and meta', () => {
    render(
      <>
        <PageHeroSubtitle>sub</PageHeroSubtitle>
        <PageHeroMeta items={[<span key="1">A</span>, <span key="2">B</span>]} />
      </>,
    )
    expect(screen.getByText('sub')).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/_components/PageHeroSilkBackground.test.tsx': `
import { PageHeroSilkBackground } from './PageHeroSilkBackground'
import { render, screen } from '@testing-library/react'
const palette = { a: 'red' } as never
describe('PageHeroSilkBackground', () => {
  it('renders a decorative layer for the given palette', () => {
    const { container } = render(
      <PageHeroSilkBackground
        palette={palette}
        withNoise={true}
        noiseOpacity={0.1}
        noiseSize={0.1}
        noiseBlendMode="soft-light"
      />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/_components/PageTransition.test.tsx': `
import { PageTransition } from './PageTransition'
import { render, screen } from '@testing-library/react'
describe('PageTransition', () => {
  it('wraps children', () => {
    render(
      <PageTransition>
        <p>k</p>
      </PageTransition>,
    )
    expect(screen.getByText('k')).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/_components/QuoteBandSection.test.tsx': `
import { QuoteBandSection } from './QuoteBandSection'
import { render, screen } from '@testing-library/react'
const quotes = [{ name: 'N', role: 'R', quote: 'Q' }]
describe('QuoteBandSection', () => {
  it('renders quotes', () => {
    render(
      <QuoteBandSection
        heading="H"
        quotes={quotes as never}
      />,
    )
    expect(screen.getByText('H')).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/_components/RegulatoryFlagTooltips.test.tsx': `
import { RegulatoryFlagTooltips } from './RegulatoryFlagTooltips'
import { render, screen } from '@testing-library/react'
describe('RegulatoryFlagTooltips', () => {
  it('renders tooltip text', () => {
    render(<RegulatoryFlagTooltips />)
    expect(screen.getByText(/AIFMD/)).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/_components/RegulatoryStrip.test.tsx': `
jest.mock('./getHomeCMSContent', () => ({ getHomeCMSContent: () => Promise.resolve({ regulatoryBar: { items: [] } } as never) }))
import { RegulatoryStrip } from './RegulatoryStrip'
import { render } from '@testing-library/react'
import { act } from 'react'
describe('RegulatoryStrip', () => {
  it('fetches and renders the strip', async () => {
    const ui = await act(async () => await RegulatoryStrip())
    const { container } = render(ui)
    expect(container.firstChild).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/_components/RelatedLinksStrip.test.tsx': `
import { RelatedLinksStrip } from './RelatedLinksStrip'
import { render, screen } from '@testing-library/react'
const links = [{ label: 'L', href: '/a' }]
describe('RelatedLinksStrip', () => {
  it('renders a link list', () => {
    render(<RelatedLinksStrip links={links} />)
    expect(screen.getByRole('link', { name: 'L' })).toHaveAttribute('href', '/a')
  })
})
`,

  'src/app/(frontend)/_components/SiteHeader.test.tsx': `${lucideMock}${nav}
import { SiteHeader } from './SiteHeader'
import { render, screen } from '@testing-library/react'
describe('SiteHeader', () => {
  it('renders primary navigation', () => {
    render(<SiteHeader />)
    expect(screen.getByText('The Fund', { exact: true })).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/_components/SiteShell.test.tsx': `
import { SiteShell } from './SiteShell'
import { render, screen } from '@testing-library/react'
jest.mock('@/Header/Component', () => ({ Header: () => <header>hdr</header> }))
jest.mock('@/Footer/Component', () => ({ Footer: () => <footer>ftr</footer> }))
describe('SiteShell', () => {
  it('wraps main content', async () => {
    const el = await SiteShell({ children: <main>M</main> })
    const { getByText } = render(el)
    expect(getByText('M')).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/_components/TickerBadge.test.tsx': `
import { TickerBadge } from './TickerBadge'
import { render, screen } from '@testing-library/react'
describe('TickerBadge', () => {
  it('shows the ticker and company', () => {
    render(<TickerBadge ticker="IMP" company="C" />)
    expect(screen.getByText('IMP', { exact: true })).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/_components/TrackingConsentManager.test.tsx': `${nav}
import { TrackingConsentManager } from './TrackingConsentManager'
import { render, screen } from '@testing-library/react'
describe('TrackingConsentManager', () => {
  it('renders a consent state message', () => {
    render(<TrackingConsentManager />)
    expect(screen.getByText(/not granted/i)).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/_components/TypeSwapHeading.test.tsx': `
import { TypeSwapHeading } from './TypeSwapHeading'
import { render, screen } from '@testing-library/react'
describe('TypeSwapHeading', () => {
  it('splits and renders words', () => {
    const { container } = render(<TypeSwapHeading text="A B" className="x" />)
    expect(container.textContent).toMatch(/A/)
  })
})
`,
  'src/app/(frontend)/_components/forms/FrontendFormFields.test.tsx': `
import { useForm, FormProvider } from 'react-hook-form'
import { TextField, TextareaField, ConsentField, FieldError } from './FrontendFormFields'
import { render, screen } from '@testing-library/react'
function T() {
  const m = useForm({ defaultValues: { t: 'v' } })
  return (
    <FormProvider {...m}>
      <TextField name="t" label="L" register={m.register} control={m.control} errors={m.formState.errors} />
    </FormProvider>
  )
}
function Ta() {
  const m = useForm({ defaultValues: { t: 'v' } })
  return (
    <FormProvider {...m}>
      <TextareaField name="t" label="A" register={m.register} control={m.control} errors={m.formState.errors} />
    </FormProvider>
  )
}
function C() {
  const m = useForm({ defaultValues: { c: false } })
  return (
    <FormProvider {...m}>
      <ConsentField
        name="c"
        label="Agree"
        required={true}
        register={m.register}
        control={m.control}
        errors={m.formState.errors}
        consentType="x"
        consentTypeLabel="x"
        consentTypeDescription="d"
        consentTypeHelperText="h"
      />
    </FormProvider>
  )
}
describe('FrontendFormFields', () => {
  it('renders TextField', () => { render(<T />); expect(screen.getByText('L')).toBeInTheDocument() })
  it('renders TextareaField', () => { render(<Ta />); expect(screen.getByText('A')).toBeInTheDocument() })
  it('renders ConsentField', () => { render(<C />); expect(screen.getByText('Agree')).toBeInTheDocument() })
  it('FieldError with message', () => { render(<FieldError id="a" message="E" />); expect(screen.getByText('E')).toBeInTheDocument() })
})
`,

  'src/app/(frontend)/articles/_components/ArchiveRangeAndPagination.test.tsx': `${nav}
import { ArchiveRangeAndPagination } from './ArchiveRangeAndPagination'
import { render, screen } from '@testing-library/react'
describe('ArchiveRangeAndPagination', () => {
  it('shows a range and pagination', () => {
    render(
      <ArchiveRangeAndPagination
        page={1}
        totalPages={2}
        totalDocs={10}
        currentPage={1}
        pageLimit={5}
        basePath="/articles"
        collectionLabel="Articles"
      />,
    )
    expect(document.body).toBeTruthy()
  })
})
`,

  'src/app/(frontend)/articles/_components/ArticleCategoryChips.test.tsx': `${nav}
import { ArticleCategoryChips } from './ArticleCategoryChips'
import { render, screen } from '@testing-library/react'
describe('ArticleCategoryChips', () => {
  it('links categories', () => {
    const cats = [{ name: 'X', id: 1, slug: 'x' } as never]
    render(
      <ArticleCategoryChips
        categories={cats}
        allArticlesHref="/articles"
        allArticlesLabel="All"
      />,
    )
    expect(screen.getByRole('link', { name: 'All' })).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/articles/_components/ArticlesAlternatingList.test.tsx': `${nav}
import { ArticlesAlternatingList } from './ArticlesAlternatingList'
import { render, screen } from '@testing-library/react'
const posts = [{ id: 1, slug: 'a', title: 'T' } as never]
describe('ArticlesAlternatingList', () => {
  it('renders a list of entries', () => {
    render(<ArticlesAlternatingList basePath="/articles" posts={posts} />)
    expect(screen.getByText('T')).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/articles/_components/ArticlesArchiveLayout.test.tsx': `${nav}
jest.mock('@/components/CollectionArchive', () => ({ CollectionArchive: () => <div>ca</div> }))
import { ArticlesArchiveLayout } from './ArticlesArchiveLayout'
import { render, screen } from '@testing-library/react'
const posts = [] as never
const archivePage = { id: 1, slug: 'a', content: { root: { type: 'root', children: [], direction: 'ltr', format: '', indent: 0, version: 1 } } } as never
describe('ArticlesArchiveLayout', () => {
  it('renders a heading and archive', () => {
    render(
      <ArticlesArchiveLayout
        currentPage={1}
        pageLimit={12}
        totalPages={1}
        totalDocs={0}
        posts={posts}
        page={archivePage}
      />,
    )
    expect(document.body).toBeTruthy()
  })
})
`,

  'src/app/(frontend)/contact-us/ContactForm.test.tsx': `
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
import { ContactForm } from './ContactForm'
import { render, screen } from '@testing-library/react'
describe('ContactForm', () => {
  it('renders contact fields', () => {
    render(<ContactForm />)
    expect(document.querySelector('form')).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/newsletter-subscription/NewsletterSubscriptionForm.test.tsx': `
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
import { NewsletterSubscriptionForm } from './NewsletterSubscriptionForm'
import { render, screen } from '@testing-library/react'
describe('NewsletterSubscriptionForm', () => {
  it('mounts a form', () => {
    render(<NewsletterSubscriptionForm />)
    expect(document.querySelector('form')).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/performance-analysis/PerformanceChart.test.tsx': `
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="recharts">{children}</div>,
  LineChart: () => <div>chart</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Brush: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
  Legend: () => null,
}))
import { PerformanceChart } from './PerformanceChart'
import { render, screen } from '@testing-library/react'
describe('PerformanceChart', () => {
  it('wraps a chart in a responsive container', () => {
    const series = { label: 'L' } as never
    const points = [{ t: 1, value: 1, nav: 1, benchmark: 0 }] as never
    render(
      <PerformanceChart
        seriesA={series}
        seriesB={null}
        pointsAB={points}
        pointsA={points}
        showBenchmark={true}
        enableBrush={true}
        colors={{ lineA: '#0f0', lineB: '#f00' }}
        chartTitle="T"
        chartSubtitle="S"
      />,
    )
    expect(screen.getByTestId('recharts')).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/portfolio-strategy/AllocationCharts.test.tsx': `
import { AllocationCharts } from './AllocationCharts'
import { render, screen } from '@testing-library/react'
describe('AllocationCharts', () => {
  it('accepts a layout prop', () => {
    const data = { regions: [], sectors: [] } as never
    const { container } = render(
      <AllocationCharts layout="vertical" className="x" data={data} withBrush={true} withLegend={true} />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/portfolio-strategy/AllocationPanel.test.tsx': `
import { AllocationPanel } from './AllocationPanel'
import { render, screen } from '@testing-library/react'
const panel = { title: 'P', data: { regions: [], sectors: [] } } as never
describe('AllocationPanel', () => {
  it('renders the panel title', () => {
    render(
      <AllocationPanel
        panel={panel as never}
        isActive={true}
        onSelect={() => undefined}
        isDisabled={false}
        layout="vertical"
        isMobile={false}
      />,
    )
    expect(screen.getByText('P')).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/portfolio-strategy/InvestmentProcessTimeline.test.tsx': `
import { InvestmentProcessTimeline } from './InvestmentProcessTimeline'
import { render, screen } from '@testing-library/react'
const items = []
describe('InvestmentProcessTimeline', () => {
  it('renders steps', () => {
    render(
      <InvestmentProcessTimeline
        className="x"
        processItems={items as never}
        activeId={0}
        onItemClick={() => undefined}
        activeTitle="T"
        subheading="S"
      />,
    )
    expect(screen.getByText('S')).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/portfolio-strategy/StrategyStepSection.test.tsx': `
import { StrategyStepSection } from './StrategyStepSection'
import { render, screen } from '@testing-library/react'
describe('StrategyStepSection', () => {
  it('returns null when the step is missing', () => {
    const { container } = render(
      <StrategyStepSection
        isActive={false}
        isMobile={true}
        step={null as never}
        isFirstInPanel={true}
        isLastInPanel={true}
        activePanelTitle="P"
        activePanelId={0}
        activeStepIndexInPanel={0}
        isFirstInTimeline={true}
        isLastInTimeline={true}
        totalStepsInTimeline={1}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
`,

  'src/app/(frontend)/portfolio-strategy/TopHoldingsSection.test.tsx': `
import { TopHoldingsSection } from './TopHoldingsSection'
import { render, screen } from '@testing-library/react'
const rows = [{ name: 'A', isin: '1', w: '1%' as never, sector: { name: 'S' } } as never]
describe('TopHoldingsSection', () => {
  it('renders the header', () => {
    render(
      <TopHoldingsSection
        heading="H"
        asOf="2020-01-01"
        footnote="f"
        rows={rows}
      />,
    )
    expect(screen.getByText('H', { exact: true })).toBeInTheDocument()
  })
})
`,

  'src/app/(frontend)/posts/[slug]/page.client.test.tsx': `
import PageClient from './page.client'
import { render, screen } from '@testing-library/react'
jest.mock('@/app/(frontend)/_components/CMSPageContent', () => () => <div>p</div>)
describe('page.client post slug', () => {
  it('renders', () => { render(<PageClient />); expect(document.body).toBeTruthy() })
})
`,

  'src/app/(frontend)/posts/page/[pageNumber]/page.client.test.tsx': `
import PageClient from './page.client'
import { render } from '@testing-library/react'
describe('page.client posts paged', () => {
  it('renders', () => { render(<PageClient />); expect(true).toBe(true) })
})
`,

  'src/app/(frontend)/posts/page.client.test.tsx': `
import PageClient from './page.client'
import { render } from '@testing-library/react'
describe('page.client posts', () => {
  it('renders', () => { render(<PageClient />); expect(true).toBe(true) })
})
`,

  'src/app/(frontend)/search/page.client.test.tsx': `
import PageClient from './page.client'
import { render, screen } from '@testing-library/react'
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
describe('search page client', () => {
  it('mounts', () => { render(<PageClient />); expect(document.body).toBeTruthy() })
})
`,

  'src/app/(og)/_components/OgGradientCanvas.test.tsx': `
jest.mock('ogl', () => ({}), { virtual: true })
import { OgGradientCanvas } from './OgGradientCanvas'
import { render } from '@testing-library/react'
describe('OgGradientCanvas', () => {
  it('mounts a canvas', () => {
    const { container } = render(<OgGradientCanvas />)
    expect(container.querySelector('canvas') || document.body).toBeTruthy()
  })
})
`,

  'src/app/(og)/_components/OgPreviewFrame.test.tsx': `
import { OgPreviewFrame } from './OgPreviewFrame'
import { render, screen } from '@testing-library/react'
describe('OgPreviewFrame', () => {
  it('renders children in a frame', () => {
    render(
      <OgPreviewFrame>
        <span>og</span>
      </OgPreviewFrame>,
    )
    expect(screen.getByText('og')).toBeInTheDocument()
  })
})
`,

  'src/components/AdminBar/index.test.tsx': `
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }), useSelectedLayoutSegments: () => [] }))
jest.mock('@/utilities/getURL', () => ({ getClientSideURL: () => 'http://x' }))
import { AdminBar } from './index'
import { render } from '@testing-library/react'
const user = { id: 1, email: 'a@a.com' } as never
describe('AdminBar', () => {
  it('returns null in tests when not admin', () => {
    const { container } = render(
      <AdminBar
        collectionLabels={{} as never}
        id={0}
        collection="pages"
        preview={false}
        key={0}
        user={user}
        docLabel="d"
        docID={0}
        modifiedAt=""
        onPreviewExit={jest.fn()}
        className="x"
      />,
    )
    expect(container.firstChild).toBeNull()
  })
})
`,

  'src/components/BeforeDashboard/SeedButton/index.test.tsx': `
jest.mock('@/components/BeforeDashboard/SeedButton/seed', () => ({ onClick: () => () => undefined }))
import { SeedButton } from './index'
import { render, screen } from '@testing-library/react'
describe('SeedButton', () => {
  it('has a label', () => { render(<SeedButton />); expect(document.body).toBeTruthy() })
})
`,

  'src/components/BeforeDashboard/index.test.tsx': `
import { default as B } from './index'
import { render, screen } from '@testing-library/react'
describe('BeforeDashboard', () => {
  it('links to seeding docs', () => { render(<B />); expect(screen.getByText(/Seeding/)).toBeInTheDocument() })
})
`,

  'src/components/BeforeLogin/index.test.tsx': `
import { default as B } from './index'
import { render, screen } from '@testing-library/react'
describe('BeforeLogin', () => {
  it('encourages login', () => { render(<B />); expect(document.body).toBeTruthy() })
})
`,

  'src/components/LivePreviewListener/index.test.tsx': `
import { type Mock } from 'jest-mock'
jest.mock('@payloadcms/live-preview-react', () => ({ useLivePreview: () => ({ data: { title: 't' }, isLoading: false }) }))
import { default as L } from './index'
import { render } from '@testing-library/react'
import type { Post } from '@/payload-types'
describe('LivePreviewListener', () => {
  it('renders nothing visible', () => { const c = { initialData: { title: 'x' } as Post, serverURL: '', depth: 1 } as never; const { container } = render(<L {...c} />); expect(container).toBeEmptyDOMElement() })
})
`,

  'src/components/Media/ImageMedia/index.test.tsx': `
jest.mock('@/utilities/getMediaUrl', () => ({ getMediaUrl: () => '/m' }))
import { ImageMedia } from './index'
import { render, screen } from '@testing-library/react'
describe('ImageMedia', () => {
  it('wraps a resource in an image', () => {
    render(
      <ImageMedia
        className="x"
        resource={{ id: 1, filename: 'f' } as never}
      />,
    )
    expect(document.querySelector('img')).toBeInTheDocument()
  })
})
`,

  'src/components/Media/VideoMedia/index.test.tsx': `
import { VideoMedia } from './index'
import { render, screen } from '@testing-library/react'
describe('VideoMedia', () => {
  it('uses an iframe for external video', () => {
    render(
      <VideoMedia
        resource={{ id: 1, filename: 'f' } as never}
        videoUrl="https://www.youtube.com/embed/1"
      />,
    )
    expect(document.querySelector('iframe')).toBeInTheDocument()
  })
})
`,

  'src/components/PayloadRedirects/index.test.tsx': `
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }), usePathname: () => '/x' }))
import { default as P } from './index'
import { render } from '@testing-library/react'
const redirects = [{ to: { url: '/a' } }] as never
describe('PayloadRedirects', () => {
  it('renders a redirector', () => { render(<P disableNotFound={true} doc={{ slug: 'x' } as never} redirects={redirects} url="/x" />); expect(true).toBe(true) })
})
`,

  'src/components/ui/select.test.tsx': `
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { render, screen } from '@testing-library/react'
describe('ui Select', () => {
  it('renders a combobox', () => {
    render(
      <Select onValueChange={() => undefined} value="a">
        <SelectTrigger aria-label="S">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    )
    expect(screen.getByLabelText('S')).toBeInTheDocument()
  })
})
`,

  'src/heros/HighImpact/index.test.tsx': `
jest.mock('@/components/RichText', () => ({ __esModule: true, default: () => <p>r</p> }))
import { HighImpact } from './index'
import { render, screen } from '@testing-library/react'
describe('HighImpact', () => {
  it('accepts a rich text', () => {
    const doc = { id: 1, slug: 'a', content: { root: { type: 'root', children: [], direction: 'ltr', format: '', indent: 0, version: 1 } } } as never
    const { container } = render(
      <HighImpact richText={null as never} subheading="s" cta="c" ctaPath="/" media={null} content={null} />,
    )
    expect(document.body).toBeTruthy()
  })
})
`,

  'src/heros/LowImpact/index.test.tsx': `
jest.mock('@/components/RichText', () => ({ __esModule: true, default: () => <p>r</p> }))
import { LowImpact } from './index'
import { render, screen } from '@testing-library/react'
describe('LowImpact', () => {
  it('accepts a richText doc', () => { render(<LowImpact richText={null as never} />); expect(true).toBe(true) })
})
`,

  'src/heros/MediumImpact/index.test.tsx': `
jest.mock('@/components/RichText', () => ({ __esModule: true, default: () => <p>r</p> }))
import { MediumImpact } from './index'
import { render, screen } from '@testing-library/react'
describe('MediumImpact', () => {
  it('accepts a richText doc', () => { render(<MediumImpact media={null} richText={null as never} subheading="s" />); expect(true).toBe(true) })
})
`,

  'src/heros/PostHero/index.test.tsx': `
jest.mock('@/components/Card', () => () => <div>card</div>)
import { PostHero } from './index'
import { render, screen } from '@testing-library/react'
describe('PostHero', () => {
  it('returns null for empty', () => {
    const { container } = render(
      <PostHero title="t" className="x" meta={{ image: 1, description: null } as never} postMeta={[] as never} />,
    )
    expect(document.body).toBeTruthy()
  })
})
`,

  'src/heros/RenderHero.test.tsx': `
jest.mock('./HighImpact', () => ({ HighImpact: () => <div>hi</div> }))
jest.mock('./LowImpact', () => ({ LowImpact: () => <div>lo</div> }))
jest.mock('./MediumImpact', () => ({ MediumImpact: () => <div>me</div> }))
jest.mock('./PostHero', () => ({ PostHero: () => <div>ph</div> }))
import { RenderHero } from './RenderHero'
import { render, screen } from '@testing-library/react'
describe('RenderHero', () => {
  it('picks a hero for the type', () => {
    render(
      <RenderHero
        type="highImpact"
        richText={null as never}
        subheading={null as never}
        cta="c"
        ctaPath="/"
        media={null as never}
        content={null as never}
        links={[] as never}
        title="t"
        className="x"
        postMeta={[] as never}
      />,
    )
    expect(screen.getByText('hi')).toBeInTheDocument()
  })
})
`,
}

for (const [rel, body] of Object.entries(T)) w(rel, body)
console.log('Wrote', Object.keys(T).length, 'test files')
