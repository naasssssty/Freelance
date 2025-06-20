module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/src/__mocks__/fileMock.js'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
    '!src/setupTests.js',
    '!src/**/*.test.{js,jsx}',
    '!src/**/__tests__/**',
    '!src/assets/**',
    '!src/styles/**'
  ],
  coverageThreshold: {
    global: {
      branches: 0.5,
      functions: 0.5,
      lines: 5,
      statements: 5
    }
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx}'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/components/__tests__/Header.test.js',
    '<rootDir>/src/pages/__tests__/Login.test.js'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(axios|react-router-dom)/)'
  ],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '<rootDir>',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ]
}; 