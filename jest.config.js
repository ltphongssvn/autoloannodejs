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
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/models/index.js'],
  // Industry standard coverage thresholds
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 70,
      functions: 80,
      statements: 80,
    },
  },
};
