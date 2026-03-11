import Link from 'next/link'
import React from 'react'

import { AnimatedIcon } from '@/app/(frontend)/_components/AnimatedIcon'
import { PageHero } from '@/app/(frontend)/_components/PageHero'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main>
      <PageHero
        title="This page is currently unavailable."
        subtitle="You can return to the homepage or contact us for direct assistance."
        showBackground={false}
        showScrollIndicator={false}
        containerClassName="text-center"
        titleClassName="mx-auto"
        subtitleClassName="mx-auto"
      >
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3" data-transition-force="true">
          <Button
            asChild
            variant="heroCta"
            size="clear"
            className="px-4 md:px-5 bg-white text-black border-transparent normal-case tracking-normal text-[16px] font-medium"
          >
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5 transition-colors hover:text-primary-light focus-visible:text-primary-light"
            >
              <AnimatedIcon
                name="home"
                size={16}
                className="shrink-0 text-current transition-colors group-hover:text-primary-light group-focus-visible:text-primary-light"
                animateOnHover
              />
              <span>Go to Home</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="heroCta"
            size="clear"
            className="px-4 md:px-5 bg-white text-black border-transparent normal-case tracking-normal text-[16px] font-medium"
          >
            <Link
              href="/contact-us"
              className="group inline-flex items-center gap-2.5 transition-colors hover:text-primary-light focus-visible:text-primary-light"
            >
              <AnimatedIcon
                name="mailCheck"
                size={16}
                className="shrink-0 text-current transition-colors group-hover:text-primary-light group-focus-visible:text-primary-light"
                animateOnHover
              />
              <span>Contact us</span>
            </Link>
          </Button>
        </div>
      </PageHero>
    </main>
  )
}
