jest.mock('@/blocks/Code/Component.client', () => ({
  Code: ({ code }: { code: string }) => <pre data-testid="code-client">{code}</pre>,
}))

import { CodeBlock } from './Component'
import { render, screen } from '@testing-library/react'

describe('CodeBlock', () => {
  it('passes code and language to the client Code component', () => {
    render(<CodeBlock blockType="code" code="console.log(1)" language="javascript" />)

    expect(screen.getByTestId('code-client')).toHaveTextContent('console.log(1)')
  })
})
