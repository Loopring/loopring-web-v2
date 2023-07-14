const webpack = require('webpack')
const {
  override,
  addWebpackPlugin,
  fixBabelImports,
  addLessLoader,
  setWebpackOptimizationSplitChunks,
  addWebpackAlias,
} = require('customize-cra')

const GitRevisionPlugin = require('git-revision-webpack-plugin')
const gitRevisionPlugin = new GitRevisionPlugin()

// Deployment on Heroku
// During Heroku builds, the SOURCE_VERSION and STACK environment variables are set:
var onHeroku = process.env.SOURCE_VERSION && process.env.STACK
// If we're on Heroku, we don't have access to the .git directory so we can't
// rely on git commands to get the version. What we *do* have during Heroku
// builds is a SOURCE_VERSION env with the git SHA of the commit being built,
// so we can use that instead to generate the version file.
function getCommitHash() {
  try {
    return onHeroku ? process.env.SOURCE_VERSION : gitRevisionPlugin.commithash()
  } catch (error) {
    return ''
  }
}

const path = require('path')
const toPath = (filePath) => path.join(process.cwd(), '../../' + filePath)
const hasJsxRuntime = (() => {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
    return false
  }

  try {
    require.resolve('react/jsx-runtime')
    return true
  } catch (e) {
    return false
  }
})()
const getCacheIdentifier = require('react-dev-utils/getCacheIdentifier')
module.exports = override(
  addWebpackAlias({}),

  /*
  addWebpackPlugin(
    new DuplicatePackageCheckerPlugin({
      verbose: false,
      emitError: false,
      strict: true,
    }),
  ),
  */

  // addWebpackPlugin(gitRevisionPlugin),
  // addWebpackPlugin(
  //   new CopyWebpackPlugin({
  //       patterns: [{from: path.resolve(__dirname, "..", "assets"), to: './static', toType: "dir"}],
  //     }
  //   )
  // ),
  addWebpackPlugin(
    new webpack.DefinePlugin({
      'process.env.COMMITHASH': JSON.stringify(getCommitHash()),
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
  addLessLoader({
    lessOptions: {
      javascriptEnabled: true,
      modifyVars: { '@primary-color': '#1DA57A' },
      sourceMap: false,
    },
  }),
  (config, mode) => {
    // 增加处理less module配置 customize-cra 不提供 less.module 只提供css.module
    const oneOf_loc = config.module.rules.findIndex((n) => n.oneOf) // 这里的config是全局的
    config.module.rules[oneOf_loc].oneOf = [
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=10240',
        options: { name: '[path][name].[ext]' },
      },
      ...config.module.rules[oneOf_loc].oneOf,
    ]
    const isProd = mode === 'PRODUCTION'
    config.resolve = {
      ...config.resolve,
      modules: [
        ...config.resolve.modules,
        path.resolve(__dirname, '..', 'src'),
        path.resolve(__dirname, '..', '..', 'common-resources', 'static-resources'),
        // path.resolve(__dirname,'./'),
      ],
      alias: {
        ...config.resolve.alias,
        //"@loopring-web/static-resource" : path.resolve(__dirname, '..', 'src/static-resource'),
        //toPath("node_modules/@loopring-web/static-resource"),
        //path.resolve(__dirname, '..', 'node_modules/@loopring-web/static-resource'),
        // "@loopring-web/static-resource":path.resolve(__dirname, '..', 'node_modules/@loopring-web/static-resource'),
        '@emotion/core': toPath('node_modules/@emotion/react'),
        'emotion-theming': toPath('node_modules/@emotion/react'),
        '@emotion/styled-base': toPath('node_modules/@emotion/styled/base'),
      },
    }
    config.module.rules.push({
      test: /\.(mjs|js|jsx|tsx|ts)$/,
      exclude: [/node_modules/, /dist/],
      include: [path.resolve(__dirname, '..', '..', 'common-resources', 'static-resources')],
      // this should be handled by the general `resolve.extensions` option
      // resolve: { fullySpecified: false },
      loader: 'babel-loader',
      // loader: require.resolve('babel-loader'),
      options: {
        customize: require.resolve('babel-preset-react-app/webpack-overrides'),
        presets: [
          [
            require.resolve('babel-preset-react-app'),
            {
              runtime: hasJsxRuntime ? 'automatic' : 'classic',
            },
          ],
        ],
        // @remove-on-eject-begin
        babelrc: false,
        configFile: false,
        // Make sure we have a unique cache identifier, erring on the
        // side of caution.
        // We remove this when the user ejects because the default
        // is sane and uses Babel options. Instead of options, we use
        // the react-scripts and babel-preset-react-app versions.
        cacheIdentifier: getCacheIdentifier('development', [
          'babel-plugin-named-asset-import',
          'babel-preset-react-app',
          'react-dev-utils',
          'react-scripts',
        ]),
        // @remove-on-eject-end
        plugins: [
          [
            require.resolve('babel-plugin-named-asset-import'),
            {
              loaderMap: {
                svg: {
                  ReactComponent: '@svgr/webpack?-svgo,+titleProp,+ref![path]',
                },
              },
            },
          ],
          'production' && require.resolve('react-refresh/babel'),
        ].filter(Boolean),
        // This is a feature of `babel-loader` for webpack (not Babel itself).
        // It enables caching results in ./node_modules/.cache/babel-loader/
        // directory for faster rebuilds.
        cacheDirectory: true,
        // See #6846 for context on why cacheCompression is disabled
        cacheCompression: false,
        compact: 'auto',
      },
    })

    return config
  },
  /*
  function override(config, env) {
    config = rewireLess.withLoaderOptions({
      javascriptEnabled: true,
    })(config, env)

    return config
  },
  */
)
