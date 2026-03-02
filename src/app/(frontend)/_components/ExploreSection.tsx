import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function ExploreSection() {
  return (
    <section className="border-t border-[#e52828] py-16 md:py-20 bg-white">
      <div className="container text-center max-w-2xl mx-auto">
        <h2 className="text-[28px] md:text-[34px] leading-[1.25] text-[#0b1035]">
          Explore Our Megatrends
        </h2>
        <p className="mt-4 text-[#5f6477] text-[16px] leading-relaxed">
          Discover the six structural forces shaping global markets and the investment opportunities
          they create.
        </p>
        <div className="mt-8">
          <Button
            asChild
            variant="outlineBrand"
            size="clear"
            className="px-6 py-3"
          >
            <Link href="/megatrends">
              Explore details
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
