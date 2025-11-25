
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: { 
    path: path.resolve(__dirname,'dist'), 
    filename: 'bundle.js',
    clean: true
  },
  module: {
    rules: [
      { 
        test: /\.jsx?$/, 
        exclude: /node_modules/, 
        use: { 
          loader: 'babel-loader', 
          options: { presets: ['@babel/preset-react'] } 
        } 
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: 'body'
    })
  ],
  devServer: {
    static: './dist',
    port: 3000,
    hot: true,
    historyApiFallback: true
  },
  resolve: { extensions: ['.js', '.jsx'] }
};
