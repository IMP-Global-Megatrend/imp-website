import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AnimatedIcon } from '@/app/(frontend)/_components/AnimatedIcon'

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
            <Link href="/megatrends" className="group">
              Explore details
              <AnimatedIcon name="arrowUpRight" size={12} className="shrink-0 text-current" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
