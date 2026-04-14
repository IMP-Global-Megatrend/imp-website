/**
 * @jest-environment node
 */

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

import { revalidatePath } from 'next/cache'

import {
  revalidatePerformanceAnalysisPage,
  revalidatePerformanceAnalysisPageOnDelete,
} from '../revalidatePerformanceAnalysisPage'

describe('revalidatePerformanceAnalysisPage', () => {
  beforeEach(() => {
    jest.mocked(revalidatePath).mockClear()
  })

  it('revalidates the performance analysis route after change', () => {
    const payload = { logger: { info: jest.fn() } }
    const doc = { id: '1' }

    revalidatePerformanceAnalysisPage({
      doc,
      req: { payload, context: {} } as never,
    } as never)

    expect(revalidatePath).toHaveBeenCalledWith('/performance-analysis')
  })

  it('skips when disableRevalidate is set', () => {
    const payload = { logger: { info: jest.fn() } }

    revalidatePerformanceAnalysisPage({
      doc: {},
      req: { payload, context: { disableRevalidate: true } } as never,
    } as never)

    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('revalidates after delete', () => {
    const payload = { logger: { info: jest.fn() } }

    revalidatePerformanceAnalysisPageOnDelete({
      doc: {},
      req: { payload, context: {} } as never,
    } as never)

    expect(revalidatePath).toHaveBeenCalledWith('/performance-analysis')
  })
})
