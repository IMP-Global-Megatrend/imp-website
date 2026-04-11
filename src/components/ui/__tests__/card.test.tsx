import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { render, screen } from '@testing-library/react'

describe('Card', () => {
  it('renders layout parts with data-slot markers', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    )

    expect(screen.getByText('Title').closest('[data-slot="card-title"]')).toBeInTheDocument()
    expect(screen.getByText('Description').closest('[data-slot="card-description"]')).toBeInTheDocument()
    expect(screen.getByText('Body').closest('[data-slot="card-content"]')).toBeInTheDocument()
    expect(screen.getByText('Footer').closest('[data-slot="card-footer"]')).toBeInTheDocument()
    expect(screen.getByText('Title').closest('[data-slot="card"]')).toBeInTheDocument()
  })
})
