import js from '@eslint/js';
import ts from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: ['**/node_modules/**', 'dist', '.next', 'coverage'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      '@next/next': nextPlugin
    },
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      'no-console': ['warn', { allow: ['error', 'warn'] }]
    }
  }
);
