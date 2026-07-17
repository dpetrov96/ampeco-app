module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['jest.setup.js', '**/__tests__/**/*.{js,ts,tsx}'],
      env: {
        jest: true,
      },
    },
    {
      files: ['src/features/map/clusterBadgeFallback.ts'],
      rules: {
        'no-bitwise': 'off',
      },
    },
  ],
};
