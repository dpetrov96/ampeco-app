module.exports = {
  preset: '@react-native/jest-preset',
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx|js)'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|supercluster|kdbush)/)',
  ],
};
