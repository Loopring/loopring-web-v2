const path = require("path");
const nodePath = "../../";
const CopyWebpackPlugin = require("copy-webpack-plugin");
const toPath = (filePath) => path.join(process.cwd(), nodePath + filePath);
const getCacheIdentifier = require("react-dev-utils/getCacheIdentifier");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const hasJsxRuntime = (() => {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === "true") {
    return false;
  }

  try {
    require.resolve("react/jsx-runtime");
    return true;
  } catch (e) {
    return false;
  }
})();
module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/preset-create-react-app",
  ],
  typescript: {
    reactDocgen: "none",
  },
  webpackFinal: async (config, { configType }) => {
    const isProd = configType.toLowerCase() === "production";

    const modules = [
      ...config.resolve.modules,
      path.resolve(__dirname, "..", "src"),
      path.resolve(
        __dirname,
        "..",
        "..",
        "common-resources",
        "static-resources"
      ),
      // "node_modules/@loopring-web/common-resources",
      //static-resources/src/loopring-interface/CoinInterface.ts
      // path.resolve(__dirname, '..', '..', 'common-resources', "static-resources"),
      // path.resolve(__dirname,'./'),
    ];
    console.log(
      path.resolve(
        __dirname,
        "..",
        "..",
        "common-resources",
        "static-resources"
      )
    );
    config.module.rules.push({
      test: /\.(mjs|js|jsx|tsx|ts)$/,
      // exclude: [/node_modules/, /dist/],
      include: [
        path.resolve(__dirname, "..", "src"),
        // "node_modules/@loopring-web/common-resources",
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
              runtime: hasJsxRuntime ? "automatic" : "classic",
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
        cacheIdentifier: getCacheIdentifier("development", [
          "babel-plugin-named-asset-import",
          "babel-preset-react-app",
          "react-dev-utils",
          "react-scripts",
        ]),
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
          require.resolve("react-refresh/babel"),
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
      test: /\.s(a|c)ss$/,
      use: [
        {
          loader: MiniCssExtractPlugin.loader,
          options: { emit: false, esModule: false, hmr: false },
        },
        "css-loader",
      ],
    });
    config.plugins = config.plugins.concat([
      new MiniCssExtractPlugin({
        filename: isProd ? "[name].[contenthash].css" : "[name].css",
        chunkFilename: isProd ? "[id].[contenthash].css" : "[id].css",
        ignoreOrder: true,
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(
              __dirname,
              "..",
              "..",
              "common-resources",
              "assets"
            ),
            to: "./static",
            toType: "dir",
          },
        ],
      }),
    ]);

    return {
      ...config,
      plugins: [...config.plugins],
      resolve: {
        ...config.resolve,
        modules,
        alias: {
          ...config.resolve.alias,
          "@emotion/core": toPath("node_modules/@emotion/react"),
          "emotion-theming": toPath("node_modules/@emotion/react"),
          "@emotion/styled": toPath("node_modules/@emotion/styled"),
          "@material-ui/core/Menu": "@mui/material/Menu",
          "@material-ui/core": "@mui/material",
          "@material-ui/core/Popover": "@mui/material/Popover",
        },
      },
    };
  },
};
