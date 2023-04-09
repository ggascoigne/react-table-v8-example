module.exports = {
  extends: '@ggascoigne/eslint-config/ts',
  parserOptions: {
    project: ['./tsconfig.json', 'packages/*/tsconfig.json', 'apps/*/tsconfig.json'],
  },
  rules: {
    'no-console': 'off',
  },
}
