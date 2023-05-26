const __language__ = {
  en: {
    labelNavZkRollupLayer2: "zkRollup Layer 2",
    labelNavWallet: "Wallet",
  },
};
(function init() {
  const onColorChange = (value) => {
    window.localStorage.set("themeMode", value);
    link = document.getElementById("themeModeCss");
    link.set(
      "href",
      value !== "dark"
        ? "./static/wallet_light.css"
        : "./static/wallet_dark.css"
    );
    document.getElementById("themeModeCss").setAttribute("link", link);
  };
  var value = window.localStorage.get("themeMode");
  if (!value) {
    value = "dark";
  }
  onColorChange(value);

  // Language now english only

  const onlanguagechange = (value) => {
    window.localStorage.set("language", value);
    window.i18n = __language__[value];
  };

  var i18nLng = window.localStorage.get("lng");
  if (!i18nLng) {
    i18nLng = "en";
  }
  onlanguagechange(value);
})();
