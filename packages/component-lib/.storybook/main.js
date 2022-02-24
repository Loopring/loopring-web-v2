const path = require("path");
const nodePath = "../../";
const CopyWebpackPlugin = require("copy-webpack-plugin");
const toPath = (filePath) => path.join(process.cwd(), nodePath + filePath);
const getCacheIdentifier = require("react-dev-utils/getCacheIdentifier");
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
  webpackFinal: async (config) => {
    const modules = [
      ...config.resolve.modules,
      path.resolve(__dirname, "..", "src"),
      "node_modules/@loopring-web/common-resources",
      //static-resources/src/loopring-interface/CoinInterface.ts
      // path.resolve(__dirname, '..', '..', 'common-resources', "static-resources"),
      // path.resolve(__dirname,'./'),
    ];
    config.module.rules.push({
      test: /\.(mjs|js|jsx|tsx|ts)$/,
      // exclude: [/node_modules/, /dist/],
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
    return {
      ...config,
      plugins: [
        ...config.plugins,
        // new CopyWebpackPlugin({
        //   patterns: [{
        //     from: path.resolve(__dirname, '..', '..', 'common-resources', "assets"),
        //     to: './static',
        //     toType: "dir"
        //   }],
        // })
      ],
      resolve: {
        ...config.resolve,
        modules,
        alias: {
          ...config.resolve.alias,
          "@emotion/core": toPath("node_modules/@emotion/react"),
          "emotion-theming": toPath("node_modules/@emotion/react"),
          "@emotion/styled": toPath("node_modules/@emotion/styled"),
        },
      },
    };
  },
};
