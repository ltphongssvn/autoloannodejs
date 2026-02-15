// jest.config.js
export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'json-summary'],
  coveragePathIgnorePatterns: ['/node_modules/', '/coverage/', '/__tests__/'],
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/models/index.js'],
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 70,
      functions: 80,
      statements: 80,
    },
    './src/models/': {
      lines: 85,
      branches: 90,
      functions: 80,
      statements: 85,
    },
    './src/middleware/': {
      lines: 90,
      branches: 90,
      functions: 90,
      statements: 90,
    },
    './src/config/': {
      lines: 70,
      branches: 50,
      functions: 80,
      statements: 70,
    },
  },
};
