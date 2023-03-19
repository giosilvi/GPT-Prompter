const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    markdown: './src/markdown.js',
    content: './src/content.js',
    background: './src/background.js',
    popup_world: './src/popup_world.js',
    popup: './src/popup.js',
    history: './src/history.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/popup.html',
      filename: 'popup.html',
      chunks: ['popup'],
    }),
    new HtmlWebpackPlugin({
      template: './src/history.html',
      filename: 'history.html',
      chunks: ['history'],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/style.css', to: 'style.css' },
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/icons', to: 'icons' }, 
      ],
    }),
  ],
};
