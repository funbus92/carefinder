import { describe, it, expect } from 'vitest'
import { renderMarkdown } from '../markdown'

describe('markdown', () => {
  it('renders basic markdown to HTML', () => {
    const html = renderMarkdown('**Bold** and *italic*')
    expect(html).toContain('<strong>Bold</strong>')
    expect(html).toContain('<em>italic</em>')
  })

  it('strips script tags (XSS sanitization)', () => {
    const html = renderMarkdown('<script>alert("xss")</script>Hello')
    expect(html).not.toContain('<script>')
    expect(html).toContain('Hello')
  })

  it('strips dangerous event handlers from links', () => {
    const html = renderMarkdown('[click](javascript:alert(1))')
    expect(html).not.toContain('javascript:')
  })
})
