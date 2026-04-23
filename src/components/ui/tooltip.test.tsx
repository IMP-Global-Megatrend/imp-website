import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { render, screen } from '@testing-library/react'

describe('Tooltip', () => {
  it('renders trigger and content when open by default', () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Focus me</TooltipTrigger>
          <TooltipContent>Additional help</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    expect(screen.getByText('Focus me')).toBeInTheDocument()
    expect(screen.getByRole('tooltip', { name: 'Additional help' })).toBeInTheDocument()
  })
})
