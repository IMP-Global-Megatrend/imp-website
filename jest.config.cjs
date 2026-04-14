const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

/** @type {import('jest').Config} */
const customJestConfig = {
  maxWorkers: '50%',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@payload-config$': '<rootDir>/src/payload.config.ts',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '/e2e/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/payload-types.ts',
    '!src/migrations/**',
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/\\.next/', '/e2e/', '/payload-types\\.ts$'],
  coverageThreshold: {
    global: {
      statements: 15,
      branches: 10,
      functions: 10,
      lines: 15,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
