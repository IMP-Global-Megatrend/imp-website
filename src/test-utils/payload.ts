/**
 * Minimal Payload-like client for mocking getPayload() in route tests.
 */

export type PayloadMockOverrides = {
  find?: jest.Mock
  create?: jest.Mock
  auth?: jest.Mock
  logger?: { error: jest.Mock; info?: jest.Mock }
}

export function createPayloadMock(overrides: PayloadMockOverrides = {}) {
  const logger = {
    error: overrides.logger?.error ?? jest.fn(),
    info: overrides.logger?.info ?? jest.fn(),
  }

  return {
    find: overrides.find ?? jest.fn().mockResolvedValue({ docs: [] }),
    create: overrides.create ?? jest.fn().mockResolvedValue({}),
    auth:
      overrides.auth ??
      jest.fn().mockResolvedValue({
        user: null,
      }),
    logger,
  }
}
