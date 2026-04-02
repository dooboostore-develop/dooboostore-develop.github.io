const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname),
    clean: false, // 루트 폴더 소스 보호
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
      '@': path.resolve(__dirname, 'src')
    }
  },
  plugins: [
    // 메인 index.html 생성
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: 'body'
    }),
    // GitHub Pages SPA 라우팅 지원을 위한 404.html (index.html 복사본)
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: '404.html',
      inject: 'body'
    })
  ],
  devServer: {
    port: 3001,
    hot: true,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname)
    },
    devMiddleware: {
      publicPath: '/'
    }
  },
  devtool: 'source-map'
};
