import { css } from "@emotion/react";

export default css`
  html,
  body,
  div,
  span,
  applet,
  object,
  iframe,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  blockquote,
  pre,
  a,
  abbr,
  acronym,
  address,
  big,
  cite,
  code,
  del,
  dfn,
  em,
  img,
  ins,
  kbd,
  q,
  s,
  samp,
  small,
  strike,
  strong,
  sub,
  sup,
  tt,
  var,
  b,
  u,
  i,
  center,
  dl,
  dt,
  dd,
  ol,
  ul,
  li,
  fieldset,
  form,
  label,
  legend,
  table,
  caption,
  tbody,
  tfoot,
  thead,
  tr,
  th,
  td,
  article,
  aside,
  canvas,
  details,
  embed,
  figure,
  figcaption,
  footer,
  header,
  hgroup,
  menu,
  nav,
  output,
  ruby,
  section,
  summary,
  time,
  mark,
  audio,
  video {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
    box-sizing: border-box;
  }

  address,
  caption,
  cite,
  code,
  dfn,
  em,
  strong,
  th,
  var,
  b {
    font-weight: normal;
    font-style: normal;
  }

  abbr,
  acronym {
    border: 0;
  }

  article,
  aside,
  details,
  figcaption,
  figure,
  footer,
  header,
  hgroup,
  menu,
  nav,
  section {
    display: block;
  }
  *,
  *::after,
  *::before {
    margin: 0;
    padding: 0;
    box-sizing: inherit;
  }
  *:focus-visible {
    outline: rgba(0, 0, 0, 0);
  }

  html {
    text-size-adjust: 100%;
    box-sizing: border-box;
    scroll-behavior: smooth;
  }
  body {
    line-height: 1;
  }
  ol,
  ul {
    list-style: none;
  }
  blockquote,
  q {
    quotes: none;
  }

  blockquote {
    &:before,
    &:after {
      content: "";
      content: none;
    }
  }
  q {
    &:before,
    &:after {
      content: "";
      content: none;
    }
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
  }
  caption,
  th {
    text-align: left;
  }
  textarea {
    resize: none;
  }
  a {
    text-decoration: none;
    cursor: pointer;
  }
  button {
    padding: 0;
    border: none;
    background: none;
  }
  html {
    overscroll-behavior-x: none;
    overscroll-behavior-y: none;
    text-underline-offset: 3px;
  }

  iframe {
    display: none;
  }

  #iubenda-pp,
  #iframeBanxaTarget {
    iframe {
      display: initial;
    }
  }

  #iframeBanxaTarget {
    z-index: 9999;

    #iframeBanxaClose {
      transform: scale(2);
      position: absolute;
      top: 20px;
      right: 20px;
      cursor: pointer;
      padding: 4px;
      border-bottom-left-radius: 80%;
      background: rgba(255, 255, 255, 0.6);
    }
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: none;
    align-items: center;
    justify-content: center;
    background-color: rgba(166, 174, 185, 0.7);
  }
  #walletconnect-qrcode-modal {
    font-size: 16px;
    .walletconnect-modal__mobile__toggle {
      a {
        color: rgb(76, 130, 251);
      }
    }
  }
  #iframeBanxaTarget {
    z-index: 9999;
    #iframeBanxaClose {
      transform: scale(2);
      position: absolute;
      top: 20px;
      right: 20px;
      cursor: pointer;
      padding: 4px;
      border-bottom-left-radius: 80%;
      background: rgba(255, 255, 255, 0.6);
    }
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: none;
    align-items: center;
    justify-content: center;
    background-color: rgba(166, 174, 185, 0.7);
  }
`;
