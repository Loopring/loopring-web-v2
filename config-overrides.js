const webpack = require('webpack')
const {
  override,
  addWebpackModuleRule,
  addWebpackPlugin,
  fixBabelImports,
  setWebpackOptimizationSplitChunks,
  addWebpackResolve,
  addWebpackAlias,
  babelInclude
} = require('customize-cra')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const ASSET_PATH = process.env.ASSET_PATH || '/'


const path = require('path')

const direct = './'
const packagesPath = './packages'

module.exports = {
  webpack: override(
    // addWebpackAlias({
    //   '@material-ui/core/Menu': path.resolve(__dirname, 'node_modules', '@mui/material/Menu'),
    //   '@material-ui/core': path.resolve(__dirname, 'node_modules', '@mui/material'),
    //   '@material-ui/core/Popover': path.resolve(__dirname, 'node_modules', '@mui/material/Popover'),
    // }),

    addWebpackPlugin(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, packagesPath, 'common-resources', 'assets'),
            to: './static',
            toType: 'dir',
          },
        ],
      }),
    ),
    addWebpackPlugin(
      new webpack.DefinePlugin({
        'process.env.TIME':
          '"' + new Date().toLocaleString('en-US', {timeZone: 'Asia/Shanghai'}) + '/SH"',
      }),
    ),
    fixBabelImports('import', {
      libraryName: 'antd',
      libraryDirectory: 'es',
      style: true,
    }),
    setWebpackOptimizationSplitChunks({
      // https://webpack.js.org/plugins/split-chunks-plugin/
      chunks: 'async',
      maxSize: 4000000,
      maxAsyncRequests: 8,
      maxInitialRequests: 6,
    }),
    addWebpackModuleRule({
      test: /\.html$/i,
      exclude: /index.html/i,
      loader: 'html-loader',
      options: {
        attrs: [':data-src'],
        minimize: true,
        removeComments: false,
        collapseWhitespace: false,
      },
    }),
    addWebpackResolve({
      fallback: {
        "crypto": require.resolve("crypto-browserify"),
        "crypto-js": require.resolve('crypto-js'),
        "crypto-js/sha256": require.resolve('crypto-js/sha256'),
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify"),
        "url": require.resolve("url"),
        "util": require.resolve("util"),
        "buffer": require.resolve('buffer'),
        "timers": require.resolve("timers-browserify"),
        'process/browser': require.resolve('process/browser')
        // "fs": require.resolve('browserify-fs'),
      }
    }),
    addWebpackModuleRule({
      test: /\.md$/,
      use: 'raw-loader',
    }),
    babelInclude(
      [
        path.resolve(__dirname, packagesPath),
        path.resolve(
          __dirname,
          `${process.env.NODE_ENV === 'development' ? direct : direct}`,
          `node_modules/@web3modal`,
        ),
        path.resolve(
          __dirname,
          `${process.env.NODE_ENV === 'development' ? direct : direct}`,
          `node_modules/@walletconnect`,
        ),
        path.resolve(
          __dirname,
          `${process.env.NODE_ENV === 'development' ? direct : direct}`,
          `node_modules/@metamask`,
        ),
        path.resolve(
          __dirname,
          `${process.env.NODE_ENV === 'development' ? direct : direct}`,
          `node_modules/@scure`,
        ),
        path.resolve(
          __dirname,
          `${process.env.NODE_ENV === 'development' ? direct : direct}`,
          `node_modules/@noble`,
        ),
        path.resolve(
          __dirname,
          `${process.env.NODE_ENV === 'development' ? direct : direct}`,
          `node_modules/@ethereumjs`,
        ),
        path.resolve(
          __dirname,
          `${process.env.NODE_ENV === 'development' ? direct : direct}`,
          `node_modules/micro-ftch`,
        ),
        path.resolve(
          __dirname,
          `${process.env.NODE_ENV === 'development' ? direct : direct}`,
          `node_modules/react-spring`,
        ),
        path.resolve(
          __dirname,
          `${process.env.NODE_ENV === 'development' ? direct : direct}`,
          `node_modules/@react-spring`,
        ),
        path.resolve(
          __dirname,
          `${process.env.NODE_ENV === 'development' ? direct : direct}`,
          `node_modules/@loopring-web/loopring-sdk`,
        ),
      ],
    ),

    (config) => {
      config.output.publicPath = ASSET_PATH
      config.ignoreWarnings = [/Failed to parse source map/];
      console.log('config.resolve', config.resolve)
      let loaders = config.resolve
      // loaders.fallback =   Object.assign(config.resolve.fallback??{}, )
      config.node = {global: true}

      // const setConfig = (index) => {
      //   let babelLoader = config.module.rules[1].oneOf[index]
      //   console.log(
      //     '-----> enter setConfig!!!!!!! index:',
      //     index,
      //     babelLoader.include,
      //     // babelLoader.options.presets,
      //     // babelLoader.options.plugins
      //   )
      //
      //   // babelLoader.include = babelLoader.include.replace(/\/web.*\/src/, '')
      //
      //   babelLoader.include = [
      //     path.resolve(__dirname, packagesPath),
      //     ...[
      //       path.resolve(
      //         __dirname,
      //         `${process.env.NODE_ENV === 'development' ? direct : direct}`,
      //         `node_modules/@web3modal`,
      //       ),
      //       path.resolve(
      //         __dirname,
      //         `${process.env.NODE_ENV === 'development' ? direct : direct}`,
      //         `node_modules/@walletconnect`,
      //       ),
      //       path.resolve(
      //         __dirname,
      //         `${process.env.NODE_ENV === 'development' ? direct : direct}`,
      //         `node_modules/@metamask`,
      //       ),
      //       path.resolve(
      //         __dirname,
      //         `${process.env.NODE_ENV === 'development' ? direct : direct}`,
      //         `node_modules/@scure`,
      //       ),
      //       path.resolve(
      //         __dirname,
      //         `${process.env.NODE_ENV === 'development' ? direct : direct}`,
      //         `node_modules/@noble`,
      //       ),
      //       path.resolve(
      //         __dirname,
      //         `${process.env.NODE_ENV === 'development' ? direct : direct}`,
      //         `node_modules/@ethereumjs`,
      //       ),
      //       path.resolve(
      //         __dirname,
      //         `${process.env.NODE_ENV === 'development' ? direct : direct}`,
      //         `node_modules/micro-ftch`,
      //       ),
      //       path.resolve(
      //         __dirname,
      //         `${process.env.NODE_ENV === 'development' ? direct : direct}`,
      //         `node_modules/react-spring`,
      //       ),
      //       path.resolve(
      //         __dirname,
      //         `${process.env.NODE_ENV === 'development' ? direct : direct}`,
      //         `node_modules/@react-spring`,
      //       ),
      //       path.resolve(
      //         __dirname,
      //         `${process.env.NODE_ENV === 'development' ? direct : direct}`,
      //         `node_modules/@loopring-web/loopring-sdk`,
      //       ),
      //     ],
      //   ]
      //   console.log('-----> enter setConfig!!!!!!! include:', babelLoader.include)
      //   config.module.rules[1].oneOf[index] = babelLoader
      // }
      //
      // setConfig(4)
      config.resolve.alias = {
        ...config.resolve.alias,
        '@material-ui/core/Menu': '@mui/material/Menu',
        '@material-ui/core': '@mui/material',
        '@material-ui/core/Popover': '@mui/material/Popover',
      }

      return config
    }
  )
}


