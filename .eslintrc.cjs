module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  env: {
    browser: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vuejs-accessibility/recommended',
    'standard',
  ],
  plugins: [
    '@typescript-eslint',
    'vuejs-accessibility',
  ],
  // add your custom rules here
  rules: {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // error on non-newlines between object properties
    'object-property-newline': 'error',
    // disallow lines between class members
    'lines-between-class-members': ['error', 'always'],
    // disallow blank lines between certain statements
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: ['block', 'block-like'], next: '*' },
      { blankLine: 'always', prev: '*', next: 'return' },
      { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
      { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var', 'if'] },
      { blankLine: 'always', prev: 'directive', next: '*' },
      { blankLine: 'any', prev: 'directive', next: 'directive' },
    ],
    // error on non-curly statements
    'curly': 'error',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    // we accept `foo'bar` but not accpet `foobar`
    'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    'quote-props': ['error', 'consistent-as-needed'],
    // disable no-unused-expressions since unit test will use some expressions like `to.be.true`
    'no-unused-expressions': 'off',
    'indent': ['error', 2, { offsetTernaryExpressions: true, SwitchCase: 1 }],
    // disable this rule since it may conflict with 'export default' in vue single file component
    'import/first': 'off',
    // disable this rule since it may conflict with some unit tests
    'prefer-promise-reject-errors': 'off',
    // trailing comma is beneficial for git diff
    'comma-dangle': ['error', { arrays: 'always-multiline', objects: 'always-multiline', imports: 'always-multiline', exports: 'always-multiline', functions: 'only-multiline' }],
    // allow extra parens for readability
    'no-extra-parens': 'off',
    '@typescript-eslint/no-extra-parens': 'off',

    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/camelcase': 'off',
    'camelcase': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' }],
    'no-useless-constructor': 'off',
    'object-curly-spacing': ['error', 'always'],
    'object-curly-newline': ['error', {
      ObjectExpression: {
        consistent: true,
        multiline: true,
      },
      ObjectPattern: {
        consistent: true,
        multiline: true,
      },
      ImportDeclaration: {
        consistent: true,
        multiline: true,
        minProperties: 5,
      },
      ExportDeclaration: {
        consistent: true,
        multiline: true,
        minProperties: 5,
      },
    }],
    'max-params': ['error', 4],
    'func-call-spacing': 'off',
    '@typescript-eslint/func-call-spacing': 'error',

    'vue/no-deprecated-dollar-listeners-api': 'error',
    'vue/no-deprecated-events-api': 'error',
    'vue/no-deprecated-v-on-native-modifier': 'error',

    // a11y
    'vuejs-accessibility/label-has-for': 'off',
    'vuejs-accessibility/no-autofocus': 'off',
    'vuejs-accessibility/form-control-has-label': 'off',
    'vuejs-accessibility/click-events-have-key-events': 'off',
    'vuejs-accessibility/mouse-events-have-key-events': 'off',
    'vuejs-accessibility/no-static-element-interactions': 'off',
  },
}
