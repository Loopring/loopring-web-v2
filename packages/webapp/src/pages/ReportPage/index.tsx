import styled from "@emotion/styled";
import { Box, Typography } from "@mui/material";
// @ts-ignore
import * as mailTemplate from "@loopring-web/common-resources/mail.html";
import React from "react";

const StyleBox = styled(Box)`
  background-color: var(--color-box);
  #zohoSupportWebToCase textarea,
  #zohoSupportWebToCase input[type="text"],
  #zohoSupportWebToCase select,
  .wb_common {
    width: 100%;
  }

  #zohoSupportWebToCase td {
    padding: 11px 5px;
  }

  #zohoSupportWebToCase textarea,
  #zohoSupportWebToCase input[type="text"],
  #zohoSupportWebToCase select {
    //border: 1px solid #ddd;
    //padding: 3px 0;
    //border-radius: 3px;
    text-indent: 0.5em;
    border-radius: 4px;
    border-color: var(--opacity);
    background: var(--field-opacity);
    padding: 0.3rem 0.3rem 0.3rem 0.8rem;
    font-size: 14px;
    letter-spacing: inherit;
    color: currentcolor;
    border: 0px;
    box-sizing: content-box;
    height: 2em;
    margin: 0px;
    -webkit-tap-highlight-color: transparent;
    display: block;
    min-width: 0px;
    width: 100%;
    animation-name: mui-auto-fill-cancel;
    animation-duration: 10ms;
  }
  #zohoSupportWebToCase select {
    appearance: none;
    -webkit-appearance: none;
  }
  #zohoSupportWebToCase select option {
    appearance: none;
    -webkit-appearance: none;
    background: var(--color-pop-bg);
    color: var(--color-primary);
  }

  #zohoSupportWebToCase textarea:focus-visible,
  #zohoSupportWebToCase input[type="text"]:focus-visible,
  #zohoSupportWebToCase select:focus-visible {
    outline: 1px solid;
  }

  #zohoSupportWebToCase select {
    box-sizing: unset;
  }

  #zohoSupportWebToCase .wb_selectDate {
    width: auto;
  }

  #zohoSupportWebToCase input.wb_cusInput {
    width: 108px;
  }
  .inline-flex {
    display: flex;
    flex-direction: column;
    max-width: 300px;
    margin: 0 auto;
  }
  .inline-flex label {
    margin-top: 16px;
    padding-bottom: 8px;
  }
  .zsCaptchablock {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .wb_FtCon {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 15px;
    padding-left: 10px;
  }

  .wb_logoCon {
    display: flex;
    margin-left: 5px;
  }

  .wb_logo {
    max-width: 16px;
    max-height: 16px;
  }

  .zsFormClass {
    //background-color: #FFFFFF;
    //width: 600px
  }
  .zsFontClass {
    color: var(--color-text-second);

    font-size: 14px;
    &[type="button"],
    &[type="submit"] {
      color: var(--color-text-button);

      cursor: pointer;
      border: 0;
      border-radius: 4px;
      padding: 8px 16px;
      background: var(--color-primary);
    }
  }
  .manfieldbdr {
    border-left: 1px solid #ff6448 !important;
  }

  .hleft {
    text-align: left;
  }

  input[type="file"]::-webkit-file-upload-button {
    cursor: pointer;
  }

  .wtcsepcode {
    margin: 0px 15px;
    color: var(--color-text-secondary);
    float: left;
  }

  .wtccloudattach {
    float: left;
    color: #00a3fe !important; //var(--color-text-primary)
    cursor: pointer;
    text-decoration: none !important;
  }

  .wtccloudattach:hover {
    text-decoration: none !important;
  }

  .wtcuploadinput {
    cursor: pointer;
    float: left;
    width: 62px;
    margin-top: -20px;
    opacity: 0;
    clear: both;
  }

  .wtcuploadfile {
    float: left;
    color: #00a3fe;
  }

  .filenamecls {
    margin-right: 15px;
    float: left;
    margin-top: 5px;
  }

  .clboth {
    clear: both;
  }

  #zsFileBrowseAttachments {
    clear: both;
    margin: 5px 0px 10px;
  }

  .zsFontClass {
    vertical-align: top;
  }

  #tooltip-zc {
    font: normal 12px Arial, Helvetica, sans-serif;
    line-height: 18px;
    position: absolute;
    padding: 8px;
    margin: 20px 0 0;
    background: #fff;
    border: 1px solid #528dd1;
    -moz-border-radius: 5px;
    -webkit-border-radius: 5px;
    border-radius: 5px;
    color: #eee;
    -webkit-box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.2);
    -moz-box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    color: #777;
  }

  .wtcmanfield {
    color: #f00;
    font-size: 16px;
    position: relative;
    top: 2px;
    left: 1px;
  }

  #zsCloudAttachmentIframe {
    width: 100%;
    height: 100%;
    z-index: 99999 !important;
    position: fixed;
    left: 0px;
    top: 0px;
    border-style: none;
    display: none;
    background-color: #fff;
  }

  .wtchelpinfo {
    background-position: -246px -485px;
    width: 15px;
    height: 15px;
    display: inline-block;
    position: relative;
    top: 2px;
    background-image: url("https://css.zohostatic.com/support/4488988/images/zs-mpro.png");
  }

  .zsMaxSizeMessage {
    font-size: 14px;
    color: var(--color-text-third);
  }
` as typeof Box;
export const ReportPage = () => {
  const ref = React.createRef<HTMLDivElement>();
  const renderCall = React.useCallback(() => {
    if (window && window.__renderReportCall__) {
      window.__renderReportCall__();
    }
  }, []);
  React.useEffect(() => {
    if (ref.current) {
      renderCall();
    }
    return () => {};
  }, [ref.current]);
  return (
    <StyleBox
      display={"flex"}
      className={"MuiPaper-elevation2"}
      flexDirection={"column"}
      flex={1}
      marginY={3}
      padding={3}
      borderRadius={1}
    >
      <div ref={ref} dangerouslySetInnerHTML={{ __html: mailTemplate }} />
    </StyleBox>
  );
};
