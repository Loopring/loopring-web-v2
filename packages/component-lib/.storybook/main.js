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
const disableEsLint = (e) => {
  return (
    e.module.rules
      .filter(
        (e) =>
          e.use &&
          e.use.some((e) => e.options && void 0 !== e.options.useEslintrc)
      )
      .forEach((s) => {
        e.module.rules = e.module.rules.filter((e) => e !== s);
      }),
    e
  );
};
function findBabelRules(config) {
  let result_rule = {};
  config.module.rules.filter((rule) => {
    // console.log(rule);
    if (rule.oneOf) {
      result_rule = rule.oneOf.find((rule) => {
        return (
          rule.test &&
          rule.test.toString() === /\.(js|mjs|jsx|ts|tsx)$/.toString()
        );
      });
    }
  });
  return result_rule;
}
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

    config = disableEsLint(config);
    const rule = findBabelRules(config);

    const modules = [
      ...config.resolve.modules,
      path.resolve(__dirname, "..", "src"),
      "node_modules/@loopring-web/common-resources",
    ];
    rule.include = [
      ...rule.include,
      path.resolve(
        __dirname,
        "..",
        "..",
        "common-resources",
        "static-resources"
      ),
    ];

    rule.options.presets = [
      [
        "@babel/preset-env",
        {
          useBuiltIns: "usage",
          corejs: 3,
          loose: true,
          bugfixes: true,
          modules: false,
        },
      ],
      ["@babel/preset-react", { useBuiltIns: true }],
      ...rule.options.presets,
    ];
    console.log("rule.plugins:", rule.options.plugins);

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
