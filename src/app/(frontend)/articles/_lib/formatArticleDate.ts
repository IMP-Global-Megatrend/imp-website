export const formatArticleDate = (value?: string | null): string => {
  if (!value) return ''

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''

  const day = parsed.getDate()
  const month = parsed.toLocaleString('en-US', { month: 'long' })
  const year = parsed.getFullYear()

  return `${day}th of ${month} ${year}`
}
