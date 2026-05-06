import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './card'

describe('Card', () => {
  it('should render card with content', () => {
    render(
      <Card>
        <CardContent>Card Content</CardContent>
      </Card>
    )
    expect(screen.getByText('Card Content')).toBeInTheDocument()
  })

  it('should apply custom className to Card', () => {
    render(<Card className="custom-card">Content</Card>)
    expect(screen.getByText('Content')).toHaveClass('custom-card')
  })

  describe('CardHeader', () => {
    it('should render header content', () => {
      render(
        <Card>
          <CardHeader>Header Content</CardHeader>
        </Card>
      )
      expect(screen.getByText('Header Content')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<CardHeader className="custom-header">Header</CardHeader>)
      expect(screen.getByText('Header')).toHaveClass('custom-header')
    })
  })

  describe('CardTitle', () => {
    it('should render as h3 by default', () => {
      render(<CardTitle>Card Title</CardTitle>)
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Card Title')
    })

    it('should apply custom className', () => {
      render(<CardTitle className="custom-title">Title</CardTitle>)
      expect(screen.getByRole('heading')).toHaveClass('custom-title')
    })
  })

  describe('CardDescription', () => {
    it('should render description text', () => {
      render(<CardDescription>Description text</CardDescription>)
      expect(screen.getByText('Description text')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<CardDescription className="custom-desc">Description</CardDescription>)
      expect(screen.getByText('Description')).toHaveClass('custom-desc')
    })
  })

  describe('CardContent', () => {
    it('should render content', () => {
      render(<CardContent>Main content</CardContent>)
      expect(screen.getByText('Main content')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<CardContent className="custom-content">Content</CardContent>)
      expect(screen.getByText('Content')).toHaveClass('custom-content')
    })
  })

  describe('CardFooter', () => {
    it('should render footer content', () => {
      render(<CardFooter>Footer content</CardFooter>)
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<CardFooter className="custom-footer">Footer</CardFooter>)
      expect(screen.getByText('Footer')).toHaveClass('custom-footer')
    })
  })

  describe('complete card composition', () => {
    it('should render complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Job Position</CardTitle>
            <CardDescription>Software Engineer at Tech Corp</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Job responsibilities and details</p>
          </CardContent>
          <CardFooter>
            <button>Apply</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByRole('heading', { name: 'Job Position' })).toBeInTheDocument()
      expect(screen.getByText('Software Engineer at Tech Corp')).toBeInTheDocument()
      expect(screen.getByText('Job responsibilities and details')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
    })
  })
})
