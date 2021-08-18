const path = require("path")

module.exports = {
  core: {
    builder: "webpack4",
  },
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/preset-create-react-app"
  ],
  reactOptions: {
    fastRefresh: true,
    strictMode: false
  },
  typescript: {
    reactDocgen: false
  },
  webpackFinal: config => {
    return {
      ...config,
      resolve: {...config.resolve},
      module: {...config.module}
    }
  },
}
// module.exports =  {
//   "stories": [
//     "../src/**/*.stories.mdx",
//     "../src/**/*.stories.@(js|jsx|ts|tsx)"
//   ],
//   "addons": [
//     "@storybook/addon-links",
//     "@storybook/addon-essentials",
//     "@storybook/preset-create-react-app"
//   ],
//   typescript: {
//     reactDocgen: 'none',
//   },
//   webpackFinal: async (config) => {
//     return config
//   }
// }

//   function ({config, mode = 'DEV'}) {
//   console.log(mode)
//   const isProd = mode === 'PRODUCTION';
//   return
// }
