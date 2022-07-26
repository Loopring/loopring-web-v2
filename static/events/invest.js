"use strict";
var exports = module.exports;
exports.investJson = {
  banner: { mobile: "", laptop: "" },
  investAdvice: [
    {
      type: "AMM",
      router: "/invest/ammpool",
      banner: "https://static.loopring.io/assets/images/icon-default.png",
      titleI18n: "labelInvestAmm",
      desI18n: "labelInvestAmmDes",
      enable: true,
    },
    {
      type: "DEFI",
      router: "/invest/defi",
      banner: "https://static.loopring.io/assets/images/icon-default.png",
      titleI18n: "labelInvestDefi",
      desI18n: "labelInvestDefiDes",
      enable: true,
    },
  ],
};
