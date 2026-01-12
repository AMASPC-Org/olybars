import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
    // js.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        ignores: ['_archive/**'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            '@typescript-eslint': typescript,
            react,
            'react-hooks': reactHooks,
        },
        rules: {
            // ...typescript.configs.recommended.rules,
            // ...react.configs.recommended.rules,
            // ...reactHooks.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            'no-unused-vars': 'off',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
];
