module.exports = {
  extends: [
    'stylelint-config-html',
    'stylelint-config-recommended-scss',
    'stylelint-config-recommended-vue/scss',
  ],
  overrides: [
    {
      files: [
        'src/**/*.{css,scss,sass,less,styl,vue}',
      ],
      rules: {
        // Only allow @kong/design-tokens or `--kong-ui-*` CSS custom properties
        'custom-property-pattern': [
          '^(kui-|kong-ui-).+$',
          {
            message: "Expected custom property \"%s\" to have prefix '--kong-ui-' or be sourced from @kong/design-tokens with prefix '--kui-'",
          },
        ],
        'custom-property-no-missing-var-function': true,
        // Disable the following rules
        'no-descending-specificity': null,
        'scss/comment-no-empty': null,
      },
    },
  ],
}
