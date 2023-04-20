const webpack = require("webpack");
const {
  override,
  addWebpackModuleRule,
  addWebpackPlugin,
  fixBabelImports,
  setWebpackOptimizationSplitChunks,
  addWebpackAlias,
} = require("customize-cra");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin"); //installed via npm

// Try the environment variable, otherwise use root
const ASSET_PATH = process.env.ASSET_PATH || "/";
// const rewireLess = require('react-app-rewire-less')

const { alias } = require("react-app-rewire-alias");

const path = require("path");

const GitRevisionPlugin = require("git-revision-webpack-plugin");
const gitRevisionPlugin = new GitRevisionPlugin();

// Deployment on Heroku
// During Heroku builds, the SOURCE_VERSION and STACK environment variables are set:
var onHeroku = process.env.SOURCE_VERSION && process.env.STACK;
// If we're on Heroku, we don't have access to the .git directory so we can't
// rely on git commands to get the version. What we *do* have during Heroku
// builds is a SOURCE_VERSION env with the git SHA of the commit being built,
// so we can use that instead to generate the version file.
function getCommitHash() {
  try {
    return onHeroku
      ? process.env.SOURCE_VERSION
      : gitRevisionPlugin.commithash();
  } catch (error) {
    return "";
  }
}

module.exports = override(
  addWebpackAlias({}),
  addWebpackPlugin(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "..", "common-resources", "assets"),
          to: "./static",
          toType: "dir",
        },
      ],
    })
  ),
  addWebpackPlugin(
    new webpack.DefinePlugin({
      "process.env.COMMITHASH": JSON.stringify(getCommitHash()),
      "process.env.TIME":
        '"' +
        new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }) +
        '/SH"',
    })
  ),
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: true,
  }),
  setWebpackOptimizationSplitChunks({
    // https://webpack.js.org/plugins/split-chunks-plugin/
    chunks: "async",
    maxSize: 4000000,
    maxAsyncRequests: 8,
    maxInitialRequests: 6,
  }),
  addWebpackModuleRule({
    test: /\.html$/i,
    exclude: /index.html/i,
    loader: "html-loader",
    options: {
      attrs: [":data-src"],
      minimize: true,
      removeComments: false,
      collapseWhitespace: false,
    },
  }),
  addWebpackModuleRule({
    test: /\.md$/,
    use: "raw-loader",
  }),

  (config) => {
    config.output.publicPath = ASSET_PATH;
    const setConfig = (index) => {
      console.log("-----> enter setConfig!!!!!!! index:", index);
      let babelLoader = config.module.rules[1].oneOf[index];
      babelLoader.include = babelLoader.include.replace("/webapp/src", "");
      babelLoader.include = [
        babelLoader.include,
        // path.resolve(__dirname, "../../node_modules/@walletconnect"),
        // path.resolve(__dirname, "../../node_modules/@web3modal"),
      ];
      console.log(
        "-----> enter setConfig!!!!!!! include:",
        babelLoader.include
      );
      config.module.rules[1].oneOf[index] = babelLoader;
    };
    setConfig(4);
    config.resolve.alias = {
      ...config.resolve.alias,
      "@material-ui/core/Menu": "@mui/material/Menu",
      "@material-ui/core": "@mui/material",
      "@material-ui/core/Popover": "@mui/material/Popover",
    };
    return config;
  }
);
