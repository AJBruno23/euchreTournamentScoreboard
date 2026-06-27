// Spread onto text inputs to discourage browser/password-manager autofill.
// data-* attributes are valid on HTML elements but not in the InputHTMLAttributes
// interface, so we leave the type inferred and let JSX handle it.
export const noAutofill = {
  autoComplete: 'off',
  'data-form-type': 'other',
  'data-lpignore': 'true',
} as const
