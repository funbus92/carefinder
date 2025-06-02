import DOMPurify from 'dompurify'
import { marked } from 'marked'

marked.setOptions({ breaks: true, gfm: true })

/** Render Markdown to sanitized HTML for public display. */
export function renderMarkdown(markdown: string): string {
  const raw = marked.parse(markdown) as string
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4',
      'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'hr',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })
}
