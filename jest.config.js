module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@react-navigation|react-native-reanimated|expo-sqlite)/)',
  ],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  collectCoverageFrom: [
    'services/detection/**/*.ts',
    'services/validation.ts',
    '!services/**/*.d.ts',
    '!services/**/index.ts',
    '!services/**/__tests__/**',
    '!services/**/fixtures/**',
  ],
  coverageThreshold: {
    'services/detection/**/*.ts': {
      branches: 95,
      functions: 100,
      lines: 99,
      statements: 96,
    },
    'services/validation.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};
