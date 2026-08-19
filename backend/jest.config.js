// tests are written in ts, tsc builds them into dist and jest runs that
export default {
  testEnvironment: 'node',
  testMatch: ['**/dist/tests/*.test.js'],
  testTimeout: 20000,
};
