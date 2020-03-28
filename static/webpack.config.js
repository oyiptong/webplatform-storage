const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = ({mode}) => {
  return {
    mode,
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html'
      }),
      new CopyWebpackPlugin([
        {
          context: 'node_modules/@webcomponents/webcomponentsjs',
          from: '**/*.js',
          to: 'webcomponents'
        },
        {
          from: 'sw.js',
          to: '.'
        },
        {
          from: '**/*.css',
          to: '.'
        },
        {
          from: '**/*.png',
          to: '.'
        },
        {
          from: '**/*.json',
          to: '.'
        },
      ])
    ],
    devtool: mode === 'development' ? 'source-map' : 'none',
  };
};
