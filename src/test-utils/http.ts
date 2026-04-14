/**
 * Helpers for building Web API Request objects in Jest (node) route tests.
 */

export function jsonRequest(
  url: string,
  body: unknown,
  init: Omit<RequestInit, 'body'> & { method?: string } = {},
): Request {
  const { method = 'POST', headers, ...rest } = init
  const headerInit =
    headers instanceof Headers
      ? headers
      : {
          'Content-Type': 'application/json',
          ...(headers as Record<string, string> | undefined),
        }

  return new Request(url, {
    method,
    headers: headerInit,
    body: JSON.stringify(body),
    ...rest,
  })
}

export function textRequest(
  url: string,
  body: string,
  headers: Record<string, string>,
  method = 'POST',
): Request {
  return new Request(url, {
    method,
    headers,
    body,
  })
}
