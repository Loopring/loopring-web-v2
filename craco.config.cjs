const webpack = require('webpack')
const {addBeforeLoader, loaderByName, getLoader, addPlugins} = require('@craco/craco');


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
module.exports = function ({env}) {
    const dev = env === 'development'
    const prod = env === 'production'
    return {
        babel: {
            presets: [ /* ... */],
            plugins: [
                [
                    "import",
                    {
                        libraryName: 'antd',
                        libraryDirectory: 'es',
                        style: true,
                    }
                ],
            ],
            loaderOptions: { /* ... */},
            loaderOptions: (babelLoaderOptions, {env, paths}) => {
                const dev = env === 'development'
                const prod = env === 'production'
                // console.log(babelLoaderOptions)
                return babelLoaderOptions;
            },
        },
        webpack: {
            alias: {
                '@material-ui/core/Menu': '@mui/material/Menu',
                '@material-ui/core': '@mui/material',
                '@material-ui/core/Popover': '@mui/material/Popover',
                process: "process/browser"
            },
            plugins: {
                add: [
                    new CopyWebpackPlugin({
                        patterns: [
                            {
                                from: path.resolve(__dirname, packagesPath, 'common-resources', 'assets'),
                                to: './static',
                                toType: 'dir',
                            },
                        ],
                    }),
                    new webpack.DefinePlugin({
                        'process.env.TIME':
                            '"' + new Date().toLocaleString('en-US', {timeZone: 'Asia/Shanghai'}) + '/SH"',
                    }),
                    new webpack.ProvidePlugin({
                        process: 'process/browser',
                    }),
                    new webpack.ProvidePlugin({
                        Buffer: ['buffer', 'Buffer'],
                    }),
                ],
            },
            configure: (config, {env, paths}) => {
                const dev = env === 'development'
                const prod = env === 'production'
                config.ignoreWarnings = [/Failed to parse source map/];
                config.resolve.fallback = Object.assign(config.resolve.fallback ?? {}, {
                    "crypto": require.resolve("crypto-browserify"),
                    "crypto-js": require.resolve('crypto-js'),
                    "crypto-js/sha256": require.resolve('crypto-js/sha256'),
                    "stream": require.resolve("stream-browserify"),
                    "assert": require.resolve("assert/"),
                    "http": require.resolve("stream-http"),
                    "https": require.resolve("https-browserify"),
                    "os": require.resolve("os-browserify"),
                    "url": require.resolve("url"),
                    "util": require.resolve("util"),
                    "buffer": require.resolve("buffer"),
                    "timers": require.resolve("timers-browserify"),
                    'process/browser': require.resolve('process/browser')
                    // "fs": require.resolve('browserify-fs'),
                })
                config.node = {global: true}
                console.log(config.node)
                // node: { global: true, fs: 'empty'},
                // config.packages({
                //   packages: [
                //     {
                //       name: 'crypto-js',
                //       location: 'path-to/bower_components/crypto-js',
                //       main: 'index'
                //     }
                //   ]
                // });
                var {isFound, match} = getLoader(config, loaderByName('babel-loader'));
                if (isFound) {
                    console.log(match.loader)
                    match.loader.include = [
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
                }
                config.resolve.extensions.push('.html');
                config.resolve.extensions.push('.md');

                addBeforeLoader(config, loaderByName('babel-loader'), {
                    loader: 'html-loader',
                    test: /\.html$/i,
                    exclude: [/node_modules/, /index.html/i],
                    options: {
                        attrs: [':data-src'],
                        minimize: true,
                        removeComments: false,
                        collapseWhitespace: false,
                    },
                });
                addBeforeLoader(config, loaderByName('babel-loader'), {
                    test: /\.md$/,
                    use: 'raw-loader',
                });

                // }


                return config;
            },
        },
    };
};