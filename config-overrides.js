const webpack = require('webpack')
const {
  override,
  addWebpackModuleRule,
  addWebpackPlugin,
  fixBabelImports,
  setWebpackOptimizationSplitChunks,
  addWebpackAlias,
} = require('customize-cra')

const CopyWebpackPlugin = require('copy-webpack-plugin')
// Try the environment variable, otherwise use root
const ASSET_PATH = process.env.ASSET_PATH || '/'
// const rewireLess = require('react-app-rewire-less')

// const { alias } = require('react-app-rewire-alias')

const path = require('path')

// const GitRevisionPlugin = require('git-revision-webpack-plugin')
// const gitRevisionPlugin = new GitRevisionPlugin()
const direct = './'
const packagesPath = './packages'
// Deployment on Heroku
// During Heroku builds, the SOURCE_VERSION and STACK environment variables are set:
// var onHeroku = process.env.SOURCE_VERSION && process.env.STACK
// If we're on Heroku, we don't have access to the .git directory so we can't
// rely on git commands to get the version. What we *do* have during Heroku
// builds is a SOURCE_VERSION env with the git SHA of the commit being built,
// so we can use that instead to generate the version file.
// function getCommitHash() {
//   try {
//     return onHeroku ? process.env.SOURCE_VERSION : gitRevisionPlugin.commithash()
//   } catch (error) {
//     return ''
//   }
// }

// console.log(__dirname)

exports = module.exports = override(
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
        '"' + new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }) + '/SH"',
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
  addWebpackModuleRule({
    test: /\.md$/,
    use: 'raw-loader',
  }),

  (config) => {
    config.output.publicPath = ASSET_PATH
    // config.resolve.fallback =   Object.assign(config.resolve.fallback??{}, {
    //   "stream": false,
    //   "crypto": false,
    //   // 'crypto-js':require.resolve('crypto-js'),
    //   'crypto-js/sha256' : require.resolve('crypto-js/sha256'),
    //   // 'crypto-js':require.resolve("crypto-js")
    //   // "stream": require.resolve("stream-browserify"),
    //   // "assert": require.resolve("assert"),
    //   "http": require.resolve("stream-http"),
    //   "https": require.resolve("https-browserify"),
    //   // "os": require.resolve("os-browserify"),
    //   // "url": require.resolve("url")
    // })
    const setConfig = (index) => {
      let babelLoader = config.module.rules[1].oneOf[index]
      console.log(
        '-----> enter setConfig!!!!!!! index:',
        index,
        babelLoader.include,
        // babelLoader.options.presets,
        // babelLoader.options.plugins
      )

      // babelLoader.include = babelLoader.include.replace(/\/web.*\/src/, '')

      babelLoader.include = [
        path.resolve(__dirname, packagesPath),
        ...[
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
      ]
      console.log('-----> enter setConfig!!!!!!! include:', babelLoader.include)
      config.module.rules[1].oneOf[index] = babelLoader
    }

    setConfig(4)
    config.resolve.alias = {
      ...config.resolve.alias,
      '@material-ui/core/Menu': '@mui/material/Menu',
      '@material-ui/core': '@mui/material',
      '@material-ui/core/Popover': '@mui/material/Popover',
    }

    return config
  },
)
