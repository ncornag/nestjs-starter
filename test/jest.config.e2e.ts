import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../src', //"."
  testRegex: '.*\\.e2e-spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        isolatedModules: true
      }
    ],
    'node_modules/nanoid/index.js': [
      'ts-jest',
      {
        isolatedModules: true
      }
    ]
  },
  transformIgnorePatterns: ['/node_modules/(?!(nanoid)/)'],
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1'
  }
};

export default config;
