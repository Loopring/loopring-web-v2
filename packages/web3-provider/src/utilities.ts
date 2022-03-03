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
  any: function () {
    return (
      IsMobile.Android() ||
      IsMobile.BlackBerry() ||
      IsMobile.iOS() ||
      IsMobile.Opera() ||
      IsMobile.Windows()
    );
  },
};
