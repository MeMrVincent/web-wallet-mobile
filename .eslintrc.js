// eslint-disable-next-line vue/script-setup-uses-vars
module.exports = {
  root: true,
  globals: {
    process: true,
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    sourceType: 'module',
    ecmaVersion: 12,
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
    es6: true,
  },
  plugins: ['babel', 'prettier', 'vue'],
  extends: ['plugin:vue/recommended',
    'eslint:recommended'],
  rules: {
    'vue/comment-directive': 'off',
  'vue/multi-word-component-names': 'off',
    'vue/max-attributes-per-line': ['error', {
      singleline: 5, // Wrap if tag has more than 5 attributes
    }],
    'vue/script-setup-uses-vars': 'error', // Setup sugar verification
    'object-curly-spacing': ['error', 'always'], // Require spacing inside curly braces { a: 1 }
    'array-bracket-newline': ['error', { 'minItems': 5 }], // Wrap array brackets if items >= 5
    'arrow-spacing': 'error', // Require spaces before/after arrow () => {}
    // 'vue/no-unsupported-features': ['error', { // Verify unsupported features
    //   'version': "^3.0.0",
    //   'ignores': [],
    // }]
    'vue/block-tag-newline': ['error', { // Line breaks specification between block tags
      'singleline': 'always',
      'multiline': 'always',
      'maxEmptyLines': 0,
      'blocks': {
        'script': {
          'singleline': 'always',
          'multiline': 'always',
          'maxEmptyLines': 0,
        },
        'template': {
          'singleline': 'always',
          'multiline': 'always',
          'maxEmptyLines': 0,
        },
        'my-block': {
          'singleline': 'always',
          'multiline': 'always',
          'maxEmptyLines': 0,
        },
      },
    }],
    'curly': 'error',
    'default-case': 'error',
    'no-multi-spaces': ['error', { 'ignoreEOLComments': true }],
    'no-unmodified-loop-condition': 'error',
    'no-use-before-define': 'error',
    'indent': ['error', 2],
    'no-unneeded-ternary': 'error',
    'quotes': ['error', 'single'],
    'space-unary-ops': 'error',
    'jsx-quotes': ['error', 'prefer-single'],
    'key-spacing': 'error',
    'brace-style': 'error',
    'camelcase': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    'max-lines': ['error', { 'max': 1000, 'skipComments': true }],
    'no-var': 'error',
    'vue/html-indent': ['error', 2],
  },
};

