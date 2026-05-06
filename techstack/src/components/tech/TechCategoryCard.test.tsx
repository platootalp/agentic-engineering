import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TechCategoryCard } from './TechCategoryCard'
import type { TechCategory } from '@/data/tech/types'

const mockCategory: TechCategory = {
  id: 'test-framework',
  name: '测试框架',
  icon: '🧪',
  color: '#10B981',
  problem: '自动化测试',
  description: '用于编写和运行自动化测试的框架',
  mainstream: [
    { name: 'Vitest', description: '下一代测试框架', popularity: 'high' },
    { name: 'Jest', description: '流行的测试框架', popularity: 'high' },
    { name: 'Playwright', description: '端到端测试', popularity: 'rising' },
    { name: 'Cypress', description: '现代E2E测试', popularity: 'medium' },
  ],
}

describe('TechCategoryCard', () => {
  it('renders category information correctly', () => {
    render(<TechCategoryCard category={mockCategory} />)

    expect(screen.getByText('测试框架')).toBeInTheDocument()
    expect(screen.getByText('自动化测试')).toBeInTheDocument()
    expect(screen.getByText('用于编写和运行自动化测试的框架')).toBeInTheDocument()
    expect(screen.getByText('🧪')).toBeInTheDocument()
  })

  it('displays mainstream technologies', () => {
    render(<TechCategoryCard category={mockCategory} />)

    expect(screen.getByText('Vitest')).toBeInTheDocument()
    expect(screen.getByText('Jest')).toBeInTheDocument()
  })

  it('shows popularity badges', () => {
    render(<TechCategoryCard category={mockCategory} />)

    expect(screen.getAllByText('高流行度').length).toBeGreaterThanOrEqual(1)
  })

  it('toggles expansion when button is clicked', () => {
    render(<TechCategoryCard category={mockCategory} />)

    const expandButton = screen.getByText('展开')
    expect(expandButton).toBeInTheDocument()

    fireEvent.click(expandButton)

    expect(screen.getByText('收起')).toBeInTheDocument()
    expect(screen.getByText('Cypress')).toBeInTheDocument()
  })
})
