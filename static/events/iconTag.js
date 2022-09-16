"use strict";
var exports = module.exports;
exports.iconTag = {
  market: {
    startTime: Date.now(),
    endTime: Date.now(),
    List: [
      {
        iconSource: "https://static.loopring.io/assets/images/icon-amm.svg",
        symbol: ["LRC-ETH"],
      },
      {
        iconSource: "https://static.loopring.io/assets/images/icon-dual.svg",
        token: ["LRC-ETH", "USDT-USDC"],
      },
    ],
  },
  asset: {
    startTime: Date.now(),
    endTime: Date.now(),
    List: [
      {
        iconSource: "https://static.loopring.io/assets/images/icon-amm.svg",
        symbol: ["LRC-ETH"],
      },
      {
        iconSource: "https://static.loopring.io/assets/images/icon-dual.svg",
        symbol: ["LRC-ETH", "LP-USDT-USDC"],
      },
    ],
  },
  amm: {
    startTime: Date.now(),
    endTime: Date.now(),
    List: [
      {
        iconSource: "https://static.loopring.io/assets/images/icon-amm.svg",
        symbol: ["LRC-ETH", "LP-LRC-ETH"],
      },
    ],
  },
  fait: {
    startTime: Date.now(),
    endTime: Date.now(),
    List: [
      {
        iconSource: "https://static.loopring.io/assets/images/icon-amm.svg",
        symbol: ["ramp-on", "ramp-off"],
      },
    ],
  },
  stacking: {
    startTime: Date.now(),
    endTime: Date.now(),
    List: [
      {
        iconSource: "https://static.loopring.io/assets/images/icon-amm.svg",
        symbol: ["WSTETH-ETH"],
      },
    ],
  },
  dual: {
    startTime: Date.now(),
    endTime: Date.now(),
    List: [
      {
        iconSource: "https://static.loopring.io/assets/images/icon-amm.svg",
        vendor: ["LRC"],
      },
    ],
  },

  // banner: { mobile: "", laptop: "" },
  // investAdvice: [
  //   {
  //     type: "AMM",
  //     router: "/invest/ammpool",
  //     banner: "https://static.loopring.io/assets/images/icon-amm.svg",
  //     titleI18n: "labelInvestAmm",
  //     desI18n: "labelInvestAmmDes",
  //     enable: true,
  //   },
  //   {
  //     type: "STAKE",
  //     router: "/invest/defi",
  //     banner: "https://static.loopring.io/assets/images/icon-lido.svg",
  //     titleI18n: "labelInvestDefi",
  //     desI18n: "labelInvestDefiDes",
  //     enable: true,
  //   },
  //   {
  //     type: "DUAL",
  //     router: "/invest/dual",
  //     banner: "https://static.loopring.io/assets/images/icon-dual.svg",
  //     titleI18n: "labelInvestDual",
  //     desI18n: "labelInvestDualDes",
  //     enable: true,
  //   },
  // ],
};
