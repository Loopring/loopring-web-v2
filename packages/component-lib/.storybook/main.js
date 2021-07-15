const path = require("path")
const nodePath = '../../'
const CopyWebpackPlugin = require('copy-webpack-plugin');
const toPath = (filePath) => path.join(process.cwd(), nodePath + filePath)
const toResolvedPath = targetPath => path.resolve(__dirname, targetPath);
module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/preset-create-react-app"
  ],
  typescript: {
    reactDocgen: 'none',
  },
  webpackFinal: async (config) => {
    const modules = [
      ...config.resolve.modules,
      path.resolve(__dirname, "..", "src"),
      "node_modules",
      //toPath("node_modules/@loopring-web"),
      // path.resolve(__dirname,'./'),
    ]
    return {
      ...config,
      plugins: [
        ...config.plugins,
        new CopyWebpackPlugin({
          patterns: [{
            from: path.resolve(__dirname, '..', '..', 'common-resources', "assets"),
            to: './static',
            toType: "dir"
          }],
        })
      ],


      resolve: {
        ...config.resolve,
        modules,
        alias: {
          ...config.resolve.alias,
          //"@loopring-web/static-resource" : path.resolve(__dirname, '..', 'src/static-resource'),
          //toPath("node_modules/@loopring-web/static-resource"),
          //path.resolve(__dirname, '..', 'node_modules/@loopring-web/static-resource'),
          // "@loopring-web/static-resource":path.resolve(__dirname, '..', 'node_modules/@loopring-web/static-resource'),
          "@emotion/core": toPath("node_modules/@emotion/react"),
          "emotion-theming": toPath("node_modules/@emotion/react"),
          "@emotion/styled-base": toPath("node_modules/@emotion/styled/base"),
        },
      },
    }
  },
}
