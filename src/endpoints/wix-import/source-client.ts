import type {
  WixApiConfig,
  WixBlogPost,
  WixBlogCategory,
  WixBlogPostsResponse,
  WixBlogCategoriesResponse,
  WixDataItem,
  WixSitePage,
  WixPaginatedResponse,
} from '@/endpoints/wix-import/types'

const WIX_API_BASE = 'https://www.wixapis.com'

export class WixClient {
  private config: WixApiConfig

  constructor(config: WixApiConfig) {
    this.config = config
  }

  private get headers(): Record<string, string> {
    return {
      Authorization: this.config.apiKey,
      'wix-site-id': this.config.siteId,
      'wix-account-id': this.config.accountId,
      'Content-Type': 'application/json',
    }
  }

  private async request<T>(
    path: string,
    options?: RequestInit,
    retryAttempt = 0,
  ): Promise<T> {
    const url = `${WIX_API_BASE}${path}`
    const res = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...(options?.headers as Record<string, string>),
      },
    })

    if (!res.ok) {
      if ((res.status === 429 || res.status >= 500) && retryAttempt < 3) {
        const retryDelayMs = 500 * 2 ** retryAttempt
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
        return this.request<T>(path, options, retryAttempt + 1)
      }

      const errorBody = await res.text().catch(() => 'No response body')
      throw new Error(
        `Wix API error ${res.status} ${res.statusText} for ${path}: ${errorBody}`,
      )
    }

    return res.json() as Promise<T>
  }

  // -- Blog Posts --

  async listBlogPosts(options?: {
    limit?: number
    offset?: number
    sort?: string
    featured?: boolean
    categoryIds?: string[]
  }): Promise<WixBlogPostsResponse> {
    const { limit = 50, offset = 0, sort, featured, categoryIds } = options ?? {}

    const body: Record<string, unknown> = {
      paging: { limit, offset },
    }

    if (sort) body.sort = sort
    if (featured !== undefined) body.featured = featured
    if (categoryIds?.length) body.categoryIds = categoryIds

    return this.request<WixBlogPostsResponse>('/blog/v3/posts/query', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async getAllBlogPosts(options?: {
    limit?: number
    offset?: number
  }): Promise<WixBlogPost[]> {
    const allPosts: WixBlogPost[] = []
    const batchSize = 50
    let offset = options?.offset ?? 0
    const maxItems = options?.limit ?? Infinity

    while (allPosts.length < maxItems) {
      const currentLimit = Math.min(batchSize, maxItems - allPosts.length)
      const response = await this.listBlogPosts({ limit: currentLimit, offset })

      if (!response.posts?.length) break

      allPosts.push(...response.posts)
      offset += response.posts.length

      if (response.posts.length < currentLimit) break
      if (response.metaData && offset >= response.metaData.total) break
    }

    return allPosts
  }

  // -- Blog Categories --

  async listBlogCategories(options?: {
    limit?: number
    offset?: number
  }): Promise<WixBlogCategoriesResponse> {
    const { limit = 100, offset = 0 } = options ?? {}

    return this.request<WixBlogCategoriesResponse>('/blog/v3/categories/query', {
      method: 'POST',
      body: JSON.stringify({
        paging: { limit, offset },
      }),
    })
  }

  async getAllBlogCategories(): Promise<WixBlogCategory[]> {
    const allCategories: WixBlogCategory[] = []
    let offset = 0
    const batchSize = 100

    while (true) {
      const response = await this.listBlogCategories({ limit: batchSize, offset })

      if (!response.categories?.length) break

      allCategories.push(...response.categories)
      offset += response.categories.length

      if (response.categories.length < batchSize) break
      if (response.metaData && offset >= response.metaData.total) break
    }

    return allCategories
  }

  // -- Wix Data Collections (CMS) --

  async queryDataCollection(
    collectionId: string,
    options?: {
      limit?: number
      offset?: number
      filter?: Record<string, unknown>
      sort?: Array<{ fieldName: string; order: 'ASC' | 'DESC' }>
    },
  ): Promise<WixPaginatedResponse<WixDataItem>> {
    const { limit = 50, offset = 0, filter, sort } = options ?? {}

    const body: Record<string, unknown> = {
      dataCollectionId: collectionId,
      query: {
        paging: { limit, offset },
      },
    }

    if (filter) (body.query as Record<string, unknown>).filter = filter
    if (sort) (body.query as Record<string, unknown>).sort = sort

    const response = await this.request<
      WixPaginatedResponse<WixDataItem> & { dataItems?: WixDataItem[] }
    >(
      '/wix-data/v2/items/query',
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
    )

    return {
      ...response,
      items: response.items ?? response.dataItems ?? [],
    }
  }

  async getAllDataCollectionItems(
    collectionId: string,
    options?: { limit?: number },
  ): Promise<WixDataItem[]> {
    const allItems: WixDataItem[] = []
    const batchSize = 50
    let offset = 0
    const maxItems = options?.limit ?? Infinity

    while (allItems.length < maxItems) {
      const currentLimit = Math.min(batchSize, maxItems - allItems.length)
      const response = await this.queryDataCollection(collectionId, {
        limit: currentLimit,
        offset,
      })

      if (!response.items?.length) break

      allItems.push(...response.items)
      offset += response.items.length

      if (response.items.length < currentLimit) break
      if (response.pagingMetadata && !response.pagingMetadata.hasNext) break
    }

    return allItems
  }

  async getLatestDataCollectionItems(
    collectionId: string,
    options?: {
      limit?: number
    },
  ): Promise<WixDataItem[]> {
    const limit = Math.max(1, options?.limit ?? 1)
    const response = await this.queryDataCollection(collectionId, {
      limit,
      offset: 0,
      sort: [
        { fieldName: '_updatedDate', order: 'DESC' },
        { fieldName: '_createdDate', order: 'DESC' },
      ],
    })

    return response.items ?? []
  }

  // -- Wix Site Pages --

  async listSitePages(options?: {
    limit?: number
    offset?: number
  }): Promise<WixPaginatedResponse<WixSitePage>> {
    const { limit = 50, offset = 0 } = options ?? {}

    const body = JSON.stringify({
      query: {
        paging: { limit, offset },
      },
    })

    const endpoints = ['/site/v3/pages/query', '/site/v2/pages/query', '/site/v1/pages/query']
    let lastError: unknown
    for (const endpoint of endpoints) {
      try {
        const response = await this.request<{
          pages?: WixSitePage[]
          items?: WixSitePage[]
          metaData?: WixPaginatedResponse<WixSitePage>['metaData']
          pagingMetadata?: WixPaginatedResponse<WixSitePage>['pagingMetadata']
        }>(endpoint, {
          method: 'POST',
          body,
        })

        return {
          items: response.items ?? response.pages ?? [],
          metaData: response.metaData,
          pagingMetadata: response.pagingMetadata,
        }
      } catch (error) {
        lastError = error
      }
    }

    throw new Error(`Failed to query Wix site pages: ${String(lastError)}`)
  }

  async getAllSitePages(options?: {
    limit?: number
    offset?: number
  }): Promise<WixSitePage[]> {
    const allPages: WixSitePage[] = []
    const batchSize = 50
    let offset = options?.offset ?? 0
    const maxItems = options?.limit ?? Infinity

    while (allPages.length < maxItems) {
      const currentLimit = Math.min(batchSize, maxItems - allPages.length)
      const response = await this.listSitePages({ limit: currentLimit, offset })
      const items = response.items ?? []
      if (!items.length) break

      allPages.push(...items)
      offset += items.length

      if (items.length < currentLimit) break
      if (response.pagingMetadata && !response.pagingMetadata.hasNext) break
      if (response.metaData && offset >= response.metaData.total) break
    }

    return allPages
  }
}

export function createWixClient(): WixClient {
  const nodeEnv = String(process.env.NODE_ENV || '').trim().toLowerCase()
  const vercelEnv = String(process.env.VERCEL_ENV || '').trim().toLowerCase()
  const isCi = String(process.env.CI || '').trim().toLowerCase() === 'true'
  const isProductionRuntime = nodeEnv === 'production'
  const isHostedStage = vercelEnv === 'preview' || vercelEnv === 'production'

  if (isProductionRuntime || isHostedStage || isCi) {
    throw new Error(
      'Wix sync is disabled in production/build environments. Run sync only from local development.',
    )
  }

  const apiKey = process.env.WIX_API_KEY
  const siteId = process.env.WIX_SITE_ID
  const accountId = process.env.WIX_ACCOUNT_ID

  if (!apiKey || !siteId || !accountId) {
    throw new Error(
      'Missing Wix API credentials. Set WIX_API_KEY, WIX_SITE_ID, and WIX_ACCOUNT_ID environment variables.',
    )
  }

  return new WixClient({ apiKey, siteId, accountId })
}
