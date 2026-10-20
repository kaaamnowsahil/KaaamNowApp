require('dotenv').config({ path: `${__dirname}/.env.local` });

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-transform-export-namespace-from',
    [
      'transform-inline-environment-variables',
      { include: ['GOOGLE_MAPS_API_KEY'] },
    ],
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: [
          '.ios.js',
          '.android.js',
          '.js',
          '.ts',
          '.tsx',
          '.json',
          '.svg',
        ],
        alias: { '@': './src' },
      },
    ],
  ],
};
