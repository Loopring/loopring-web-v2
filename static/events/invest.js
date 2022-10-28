"use strict";
var exports = module.exports;
exports.investJson = {
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
      banner: "https://static.loopring.io/assets/images/icon-dual.svg",
      titleI18n: "labelInvestDual",
      desI18n: "labelInvestDualDes",
      enable: true,
    },
  ],
  STAKE: [
    {
      type: "STAKE",
      router: "/invest/defi/WSTETH",
      banner: "https://static.loopring.io/assets/images/icon-lido2.svg",
      titleI18n: "labelInvestWSTETH",
      desI18n: "labelInvestWSTETHDes",
      enable: true,
    },
    {
      type: "STAKE",
      router: "/invest/defi/RETH",
      banner: "https://static.loopring.io/assets/images/icon-pocket.svg",
      titleI18n: "labelInvestRETH",
      desI18n: "labelInvestRETHDes",
      enable: true,
    },
  ],
};
