const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ZipWebpackPlugin = require('zip-webpack-plugin'); // to zip the dist folder

const manifestJson = require('./src/manifest.json');
const extensionName = 'GPT-Prompter';
const extensionVersion = manifestJson.version;

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  return {
    mode: argv.mode,
    entry: {
      markdown: './src/markdown.js',
      content: './src/content.js',
      background: isDevelopment
        ? ['./src/background.js', './src/hot-reload.js']
        : './src/background.js',
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
      new ZipWebpackPlugin({
        path: path.resolve(__dirname, 'zips'),
        filename: `${extensionName}-${extensionVersion}.zip`,
      }), // Add the zip-webpack-plugin instance
    ],
  };
};
