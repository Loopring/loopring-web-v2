import type { StorybookConfig } from '@storybook/react-webpack5'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import path, { join, dirname } from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
const nodePath = '../../'
import webpack from 'webpack'
const toPath = (filePath) => path.join(process.cwd(), nodePath + filePath)
const disableEsLint = (e) => {
  return (
    e.module.rules
      .filter((e) => e.use && e.use.some((e) => e.options && void 0 !== e.options.useEslintrc))
      .forEach((s) => {
        e.module.rules = e.module.rules.filter((e) => e !== s)
      }),
    e
  )
}
function findBabelRules(config): any {
  let result_rule = {}
  config.module.rules.filter((rule) => {
    // console.log(rule);
    if (rule.oneOf) {
      result_rule = rule.oneOf.find((rule) => {
        return rule.test && rule.test.toString() === /\.(js|mjs|jsx|ts|tsx)$/.toString()
      })
    }
  })
  return result_rule as any
}

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')))
}
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/preset-create-react-app'),
    getAbsolutePath('@storybook/addon-onboarding'),
    getAbsolutePath('@storybook/addon-interactions'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async (config, { configType }) => {
    config = disableEsLint(config)

    // @ts-ignore
    const isProd = configType.toLowerCase() === 'production'
    const rule = findBabelRules(config)
    const modules = [
      // @ts-ignore
      ...config?.resolve?.modules,
      path.resolve(__dirname, '..', 'src'),
      'node_modules/@loopring-web/common-resources',
    ]
    rule.include = [
      ...rule.include,
      path.resolve(__dirname, '..', '..', 'common-resources', 'static-resources'),
    ]
    rule.options.presets = [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'usage',
          corejs: 3,
          loose: true,
          bugfixes: true,
          modules: false,
        },
      ],
      [
        '@babel/preset-react',
        {
          useBuiltIns: true,
        },
      ],
      ...rule.options.presets,
    ]
    console.log('rule.plugins:', rule.options.plugins)
    // @ts-ignore
    config.module.rules.push({
      test: /\.s(a|c)ss$/,
      use: [
        {
          loader: MiniCssExtractPlugin.loader,
          options: {
            emit: false,
            esModule: false,
            hmr: false,
          },
        },
        'css-loader',
      ],
    })
    config.plugins = [
      // @ts-ignore
      ...config?.plugins,
      new MiniCssExtractPlugin({
        filename: isProd ? '[name].[contenthash].css' : '[name].css',
        chunkFilename: isProd ? '[id].[contenthash].css' : '[id].css',
        ignoreOrder: true,
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, '..', '..', 'common-resources', 'assets'),
            to: './static',
            toType: 'dir',
          },
        ],
      }),
    ]
    return {
      ...config,
      framework: '@storybook/react',
      plugins: [...config.plugins],
      resolve: {
        ...config.resolve,
        modules,
        extensions: [...config?.resolve?.extensions, '.ts', '.js'],
        fallback: {
          ...config?.resolve?.fallback,
          crypto: require.resolve('crypto-browserify'),
          'crypto-js': require.resolve('crypto-js'),
          'crypto-js/sha256': require.resolve('crypto-js/sha256'),
          stream: require.resolve('stream-browserify'),
          assert: require.resolve('assert'),
          http: require.resolve('stream-http'),
          https: require.resolve('https-browserify'),
          os: require.resolve('os-browserify'),
          url: require.resolve('url'),
          util: require.resolve('util'),
          buffer: require.resolve('buffer'),
          timers: require.resolve('timers-browserify'),
          'process/browser': require.resolve('process/browser'),
        },
        alias: {
          // @ts-ignore
          ...config.resolve.alias,
          '@emotion/core': toPath('node_modules/@emotion/react'),
          'emotion-theming': toPath('node_modules/@emotion/react'),
          '@emotion/styled': toPath('node_modules/@emotion/styled'),
          '@material-ui/core/Menu': '@mui/material/Menu',
          '@material-ui/core': '@mui/material',
          '@material-ui/core/Popover': '@mui/material/Popover',
        },
      },
    }
  },
}
export default config
export const framework = '@storybook/react'
