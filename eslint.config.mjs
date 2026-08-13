import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

/**
 * eslint-config-next v16 ships native flat configs, so there is no
 * FlatCompat/eslintrc shim here — passing these through the compat layer
 * crashes on a circular plugin reference.
 */
const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  {
    rules: {
      // The token layer is the only place raw values are allowed. Components
      // reference tokens; they never inline a hex or an easing curve.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXAttribute[name.name="className"] Literal[value=/#[0-9a-fA-F]{3,8}/]',
          message: 'No raw hex in components. Use a design token from src/app/globals.css.',
        },
        {
          selector: 'JSXAttribute[name.name="className"] Literal[value=/cubic-bezier/]',
          message: 'No raw easing in components. Use ease-enter / ease-exit / ease-continuous.',
        },
      ],
    },
  },
  {
    ignores: ['node_modules/**', '.next/**', 'next-env.d.ts', '.claude/**', 'design-system/**'],
  },
];

export default config;
