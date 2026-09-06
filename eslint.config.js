import eslintConfigPrettier from 'eslint-config-prettier';
import js from '@eslint/js';
import globals from 'globals';
import { dirname } from 'path';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      'out/**',
      'build/**',
      'dist/**',
      '*.config.js',
      '*.config.mjs',
      'public/sw.js',
      'coverage/**',
    ],
  },

  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
    },
  },

  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-implicit-coercion': 'warn',
      'consistent-return': 'warn',

      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  {
    ...tseslint.configs.disableTypeChecked,
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      ...tseslint.configs.disableTypeChecked.languageOptions,
      globals: globals.node,
    },
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      ...js.configs.recommended.rules,
    },
  },
  eslintConfigPrettier,
];

export default eslintConfig;
