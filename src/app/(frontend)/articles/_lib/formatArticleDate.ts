function ordinalSuffix(day: number): string {
  const mod100 = day % 100
  if (mod100 >= 11 && mod100 <= 13) return 'th'
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

export const formatArticleDate = (value?: string | null): string => {
  if (!value) return ''

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''

  const day = parsed.getDate()
  const month = parsed.toLocaleString('en-US', { month: 'long' })
  const year = parsed.getFullYear()

  return `${day}${ordinalSuffix(day)} of ${month} ${year}`
}
