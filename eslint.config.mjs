import eslintKongUiConfig from '@kong/eslint-config-kong-ui'
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility'
import playwright from 'eslint-plugin-playwright'
import kongponentsUtilityClasses from './kongponent-utility-classes.js'

export default [
  ...eslintKongUiConfig,
  ...pluginVueA11y.configs['flat/recommended'],

  {
    files: ['**/*.js', '**/*.vue', '**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '_',
          caughtErrorsIgnorePattern: '_',
        },
      ],

      // Vue
      'vue/attributes-order': 'off',
      'vue/no-restricted-class': ['error', '/^k-/', ...kongponentsUtilityClasses],

      // a11y
      'vuejs-accessibility/label-has-for': 'off',
      'vuejs-accessibility/no-autofocus': 'off',
      'vuejs-accessibility/form-control-has-label': 'off',
      'vuejs-accessibility/click-events-have-key-events': 'off',
      'vuejs-accessibility/mouse-events-have-key-events': 'off',
      'vuejs-accessibility/no-static-element-interactions': 'off',
    },
  },

  // e2e tests
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/playwright/**'],
    rules: {
      'playwright/missing-playwright-await': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/prefer-to-have-length': 'error',
      'playwright/valid-expect': 'error',
      'playwright/no-skipped-test': 'off',
      'playwright/no-force-option': 'off',
      'playwright/no-wait-for-timeout': 'off',
    },
  },
]
