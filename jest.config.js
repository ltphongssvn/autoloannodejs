// jest.config.js
export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: [],
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'json-summary'],
  coveragePathIgnorePatterns: ['/node_modules/', '/coverage/', '/__tests__/helpers/'],
  // Industry standard coverage thresholds
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 70,
      functions: 80,
      statements: 80,
    },
    // Critical business logic: models
    './src/models/': {
      lines: 90,
      branches: 70,
      functions: 90,
      statements: 90,
    },
    // Critical business logic: controllers
    './src/controllers/': {
      lines: 90,
      branches: 70,
      functions: 90,
      statements: 90,
    },
    // Middleware
    './src/middleware/': {
      lines: 80,
      branches: 70,
      functions: 80,
      statements: 80,
    },
    // Services
    './src/services/': {
      lines: 80,
      branches: 70,
      functions: 80,
      statements: 80,
    },
  },
};
