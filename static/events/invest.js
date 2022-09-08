"use strict";
var exports = module.exports;
exports.investJson = {
  banner: { mobile: "", laptop: "" },
  investAdvice: [
    {
      type: "AMM",
      router: "/invest/ammpool",
      banner: "https://static.loopring.io/assets/images/icon-amm.svg",
      titleI18n: "labelInvestAmm",
      desI18n: "labelInvestAmmDes",
      enable: true,
    },
    {
      type: "STAKE",
      router: "/invest/defi",
      banner: "https://static.loopring.io/assets/images/icon-lido.svg",
      titleI18n: "labelInvestDefi",
      desI18n: "labelInvestDefiDes",
      enable: true,
    },
    {
      type: "DUAL",
      router: "/invest/dual",
      banner: "https://static.loopring.io/assets/images/icon-lido.svg",
      titleI18n: "labelInvestDual",
      desI18n: "labelInvestDualDes",
      enable: true,
    },
  ],
};
