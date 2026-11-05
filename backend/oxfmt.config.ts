import { defineConfig } from 'oxfmt';

export default defineConfig({
  semi: true,
  singleQuote: true,

  trailingComma: 'all',
  arrowParens: 'always',

  printWidth: 100,
  tabWidth: 2,
  useTabs: false,

  quoteProps: 'as-needed',
  bracketSpacing: true,
  bracketSameLine: false,

  endOfLine: 'lf',

  embeddedLanguageFormatting: 'auto',
});
