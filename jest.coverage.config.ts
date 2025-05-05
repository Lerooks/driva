import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';
import type { Config } from 'jest';

const config: Config = {
  displayName: 'coverage',
  preset: 'ts-jest',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: '<rootDir>/',
  }),
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '<rootDir>/dist/', // Ignore dist folder
    '<rootDir>/src/shared/domain/errors/', // Ignore errors folder
    '<rootDir>/src/main.ts', // Ignore main.ts file
    '<rootDir>/src/shared/infrastructure/persistence/database/prisma/prisma.seeder.ts', // Ignore seeder file
  ],
};

export default config;
