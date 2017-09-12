var path = require('path')
var webpack = require('webpack')

var libraryName = 'jscMap';
var outputName = '';
if (process.env.NODE_ENV === 'development') {
  outputName = libraryName + '.js';
} else if (process.env.NODE_ENV === 'production') {
  outputName = libraryName + '.min.js';
}

var entryObj = {};

if (process.env.NODE_ENV === 'development') {
  entryObj.test = __dirname + '/src/test.js';
} else {
  entryObj.jscMap = __dirname + '/src/index.js';
}

module.exports = {
  entry: entryObj,
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: process.env.NODE_ENV === 'development' ? '[name].js' : '[name].min.js',
    library: libraryName,
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }, {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }, {
        test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: "img/[name].[hash:8].[ext]"
          }
        }]
      }
    ]
  },
  // 影响模块的解决方案
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src')
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    proxy: {
    }
  },
  performance: {
    hints: false
  },
  // devtool: '#eval-source-map'
}
console.log('环境--->', process.env.NODE_ENV);

process.noDeprecation = true;

if (process.env.NODE_ENV === 'development') {
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    })
  ])
} else if (process.env.NODE_ENV === 'production') {
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
