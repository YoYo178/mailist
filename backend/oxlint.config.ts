import { defineConfig } from 'oxlint';

export default defineConfig({
  categories: {
    correctness: 'error',
  },
  plugins: ['typescript', 'unicorn', 'oxc'],
  rules: {
    'eslint/no-unused-vars': 'error',
  },
  env: {
    builtin: true,
  },
});
