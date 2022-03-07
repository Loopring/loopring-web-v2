export function getCachedSession(): any {
  const local = localStorage ? localStorage.getItem("walletconnect") : null;

  let session = null;
  if (local) {
    try {
      session = JSON.parse(local);
    } catch (error) {
      throw error;
    }
  }
  return session;
}
export const IsMobile = {
  Android: function () {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function () {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function () {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function () {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function () {
    return (
      navigator.userAgent.match(/IEMobile/i) ||
      navigator.userAgent.match(/WPDesktop/i)
    );
  },
  Ethereum: function () {
    //@ts-ignore
    return window?.ethereum && window?.ethereum.isImToken;
  },

  any: function () {
    return (
      IsMobile.Android() ||
      IsMobile.BlackBerry() ||
      IsMobile.iOS() ||
      IsMobile.Opera() ||
      IsMobile.Windows() ||
      IsMobile.Ethereum()
    );
  },
};

export const IsWhichWebView = {
  any: function () {
    //@ts-ignore
    if (window?.ethereum.isImToken) {
      return "isImToken";
    }
    //@ts-ignore
    if (window?.ethereum.isMetaMask) {
      return "isMetaMask";
    }
  },
};
