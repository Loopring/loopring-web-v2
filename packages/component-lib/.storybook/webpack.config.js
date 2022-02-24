const path = require("path");
const toPath = (filePath) => path.join(process.cwd(), "../../" + filePath);
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = function ({ config, mode = "DEV" }) {
  const isProd = mode === "PRODUCTION";
  config.resolve = {
    ...config.resolve,
    // modules: [
    //   ...config.resolve.modules,
    //   path.resolve(__dirname, "..", "src"),
    //   path.resolve(__dirname, '..', '..', 'common-resources', "static-resources"),
    //   // path.resolve(__dirname,'./'),
    // ],
    alias: {
      ...config.resolve.alias,
      //"@loopring-web/static-resource" : path.resolve(__dirname, '..', 'src/static-resource'),
      //toPath("node_modules/@loopring-web/static-resource"),
      //path.resolve(__dirname, '..', 'node_modules/@loopring-web/static-resource'),
      // "@loopring-web/static-resource":path.resolve(__dirname, '..', 'node_modules/@loopring-web/static-resource'),
      "@emotion/core": toPath("node_modules/@emotion/react"),
      "@material-ui/core": toPath("node_modules/@mui/material"),
      "emotion-theming": toPath("node_modules/@emotion/react"),
      "@emotion/styled-base": toPath("node_modules/@emotion/styled/base"),
    },
  };
  config.module.rules.push({
    test: /\.(mjs|js|jsx|tsx|ts)$/,
    exclude: [/node_modules/, /dist/],
    include: [
      path.resolve(
        __dirname,
        "..",
        "..",
        "common-resources",
        "static-resources"
      ),
    ],

    // resolve: { fullySpecified: false },
    loader: "babel-loader",
    // loader: require.resolve('babel-loader'),
    options: {
      customize: require.resolve("babel-preset-react-app/webpack-overrides"),
      presets: [
        [
          require.resolve("babel-preset-react-app"),
          {
            runtime: !isProd ? "automatic" : "classic",
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
      // cacheIdentifier: getCacheIdentifier(
      //   'development',
      //   [
      //     'babel-plugin-named-asset-import',
      //     'babel-preset-react-app',
      //     'react-dev-utils',
      //     'react-scripts',
      //   ]
      // ),
      // @remove-on-eject-end
      plugins: [
        [
          require.resolve("babel-plugin-named-asset-import"),
          {
            loaderMap: {
              svg: {
                ReactComponent: "@svgr/webpack?-svgo,+titleProp,+ref![path]",
              },
            },
          },
        ],
        "production" && require.resolve("react-refresh/babel"),
      ].filter(Boolean),
      // This is a feature of `babel-loader` for webpack (not Babel itself).
      // It enables caching results in ./node_modules/.cache/babel-loader/
      // directory for faster rebuilds.
      cacheDirectory: true,
      // See #6846 for context on why cacheCompression is disabled
      cacheCompression: false,
      compact: "auto",
    },
  });
  config.module.rules.push({
    test: /\.css$/,
    use: [MiniCssExtractPlugin.loader, "css-loader"],
  });
  config.plugins.push(
    new MiniCssExtractPlugin({
      filename: isProd ? "[name].[contenthash].css" : "[name].css",
      chunkFilename: isProd ? "[id].[contenthash].css" : "[id].css",
      ignoreOrder: true,
    })
  );
  return config;
};
