const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            experimentalWatchApi: true
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@simple-web-component/examples': path.resolve(__dirname, 'packages/@dooboostore/simple-web-component/examples')
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      // head 주입: script가 body 라우터 바깥에 있어서 SSG innerHtml 교체에 절대 안 쓸림.
      // publicPath '/' 유지: /package/*.html 서브경로에서도 절대경로로 로드.
      inject: 'head'
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: '404.html',
      inject: 'head'
    }),
    new CopyPlugin({
      patterns: [
        { from: "assets", to: "assets" }
      ],
    }),
  ],
  devServer: {
    port: 3001,
    hot: true,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'dist')
    },
    devMiddleware: {
      publicPath: '/'
    }
  },
  devtool: 'source-map'
};
