import { cn } from '@/utilities/ui'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 focus-visible:ring-4 focus-visible:outline-1 aria-invalid:focus-visible:ring-0",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
        outlineBrand:
          'inline-flex items-center gap-2 border border-primary-light text-primary-light rounded text-[13px] uppercase tracking-[0.12em] font-medium hover:bg-primary-light/5 transition-colors',
        outlineMuted:
          'inline-flex items-center gap-2 border border-[#d9def0] text-[#0b1035] rounded text-[13px] font-medium hover:border-[#d9def0] hover:bg-transparent hover:text-primary-light transition-colors',
        headerSubscribe:
          'items-center gap-2 border border-white/70 px-4 py-2 rounded-none text-[13px] font-display font-normal uppercase tracking-[0.12em] text-white hover:bg-white hover:text-primary-light transition-colors duration-300 ease-out',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        heroCta:
          'items-center gap-2.5 border border-white/50 px-6 py-3 rounded-none text-[14px] font-display font-normal uppercase tracking-[0.15em] text-white hover:bg-white hover:text-primary-light transition-colors',
      },
      size: {
        clear: '',
        default: 'h-10 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-9 rounded-md px-3 has-[>svg]:px-2.5',
        lg: 'h-11 rounded-md px-8 has-[>svg]:px-4',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button: React.FC<ButtonProps> = ({ asChild = false, className, size, variant, ...props }) => {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
