import { Box, Grid } from "@mui/material";
import { useRouteMatch } from "react-router-dom";
import React from "react";
import { EmptyDefault } from "@loopring-web/component-lib";
import Template from "easy-template-string";
import gfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import styled from "@emotion/styled";
import { css, useTheme } from "@emotion/react";
//@ts-ignore
import cssStyle from "github-markdown-css/github-markdown.css";
import { ThemeType } from "@loopring-web/common-resources";
import { LoadingBlock } from "../LoadingPage";

const url_path = "https://static.loopring.io/documents";

const style = css`
  ${cssStyle}
`;
const BoxStyle = styled(Grid)`
  ${({ theme }) => `
      .markdown-body{
        border-radius: ${theme.unit / 2}px;
        max-width:1200px;
          --color-fg-default: ${theme.colorBase.textPrimary};
          --color-fg-muted: ${theme.colorBase.textThird};
          --color-fg-subtle: ${theme.colorBase.textSecondary};
          --color-canvas-default: ${theme.colorBase.box};
          --color-border-default: ${theme.colorBase.border};
          --color-border-muted: ${theme.colorBase.divide};
          --color-canvas-subtle:${theme.colorBase.fieldOpacity};

         ${
           theme.mode === ThemeType.dark
             ? `
          --color-prettylights-syntax-comment: #8b949e;
          --color-prettylights-syntax-constant: #79c0ff;
          --color-prettylights-syntax-entity: #d2a8ff;
          --color-prettylights-syntax-storage-modifier-import: #c9d1d9;
          --color-prettylights-syntax-entity-tag: #7ee787;
          --color-prettylights-syntax-keyword: #ff7b72;
          --color-prettylights-syntax-string: #a5d6ff;
          --color-prettylights-syntax-variable: #ffa657;
          --color-prettylights-syntax-brackethighlighter-unmatched: #f85149;
          --color-prettylights-syntax-invalid-illegal-text: #f0f6fc;
          --color-prettylights-syntax-invalid-illegal-bg: #8e1519;
          --color-prettylights-syntax-carriage-return-text: #f0f6fc;
          --color-prettylights-syntax-carriage-return-bg: #b62324;
          --color-prettylights-syntax-string-regexp: #7ee787;
          --color-prettylights-syntax-markup-list: #f2cc60;
          --color-prettylights-syntax-markup-heading: #1f6feb;
          --color-prettylights-syntax-markup-italic: #c9d1d9;
          --color-prettylights-syntax-markup-bold: #c9d1d9;
          --color-prettylights-syntax-markup-deleted-text: #ffdcd7;
          --color-prettylights-syntax-markup-deleted-bg: #67060c;
          --color-prettylights-syntax-markup-inserted-text: #aff5b4;
          --color-prettylights-syntax-markup-inserted-bg: #033a16;
          --color-prettylights-syntax-markup-changed-text: #ffdfb6;
          --color-prettylights-syntax-markup-changed-bg: #5a1e02;
          --color-prettylights-syntax-markup-ignored-text: #c9d1d9;
          --color-prettylights-syntax-markup-ignored-bg: #1158c7;
          --color-prettylights-syntax-meta-diff-range: #d2a8ff;
          --color-prettylights-syntax-brackethighlighter-angle: #8b949e;
          --color-prettylights-syntax-sublimelinter-gutter-mark: #484f58;
          --color-prettylights-syntax-constant-other-reference-link: #a5d6ff;   
          --color-accent-fg: #58a6ff;
          --color-accent-emphasis: #1f6feb;
          --color-danger-fg: #f85149;
          }`
             : `
          --color-prettylights-syntax-comment: #6e7781;
          --color-prettylights-syntax-constant: #0550ae;
          --color-prettylights-syntax-entity: #8250df;
          --color-prettylights-syntax-storage-modifier-import: #24292f;
          --color-prettylights-syntax-entity-tag: #116329;
          --color-prettylights-syntax-keyword: #cf222e;
          --color-prettylights-syntax-string: #0a3069;
          --color-prettylights-syntax-variable: #953800;
          --color-prettylights-syntax-brackethighlighter-unmatched: #82071e;
          --color-prettylights-syntax-invalid-illegal-text: #f6f8fa;
          --color-prettylights-syntax-invalid-illegal-bg: #82071e;
          --color-prettylights-syntax-carriage-return-text: #f6f8fa;
          --color-prettylights-syntax-carriage-return-bg: #cf222e;
          --color-prettylights-syntax-string-regexp: #116329;
          --color-prettylights-syntax-markup-list: #3b2300;
          --color-prettylights-syntax-markup-heading: #0550ae;
          --color-prettylights-syntax-markup-italic: #24292f;
          --color-prettylights-syntax-markup-bold: #24292f;
          --color-prettylights-syntax-markup-deleted-text: #82071e;
          --color-prettylights-syntax-markup-deleted-bg: #FFEBE9;
          --color-prettylights-syntax-markup-inserted-text: #116329;
          --color-prettylights-syntax-markup-inserted-bg: #dafbe1;
          --color-prettylights-syntax-markup-changed-text: #953800;
          --color-prettylights-syntax-markup-changed-bg: #ffd8b5;
          --color-prettylights-syntax-markup-ignored-text: #eaeef2;
          --color-prettylights-syntax-markup-ignored-bg: #0550ae;
          --color-prettylights-syntax-meta-diff-range: #8250df;
          --color-prettylights-syntax-brackethighlighter-angle: #57606a;
          --color-prettylights-syntax-sublimelinter-gutter-mark: #8c959f;
          --color-prettylights-syntax-constant-other-reference-link: #0a3069;
          --color-accent-fg: #0969da;
          --color-accent-emphasis: #0969da;
          --color-danger-fg: #cf222e;
        `
         }
      }
  `};

  ul {
    list-style: inherit;
  }
  ol {
    list-style: decimal;
  }
  ${style}
` as typeof Grid;
const formatInput = async (textContent: string): Promise<string> => {
  // let [data, content] = args;
  const data = await fetch("https://api3.loopring.io/api/v2/exchange/feeInfo")
    .then((res) => res.json())
    .then((data) => data.data);
  let {
    ORDERBOOK_TRADING_FEES_STABLECOIN,
    ORDERBOOK_TRADING_FEES,
    AMM_TRADING_FEES,
  } = data;
  ORDERBOOK_TRADING_FEES_STABLECOIN = Object.keys(
    ORDERBOOK_TRADING_FEES_STABLECOIN
  ).reduce((pre, key) => {
    pre["ORDERBOOK_TRADING_FEES_STABLECOIN." + key] = (
      ORDERBOOK_TRADING_FEES_STABLECOIN[key].takerRate / 100
    ).toFixed(2);
    return pre;
  }, {});
  ORDERBOOK_TRADING_FEES = Object.keys(ORDERBOOK_TRADING_FEES).reduce(
    (pre, key) => {
      pre["ORDERBOOK_TRADING_FEES." + key] = (
        ORDERBOOK_TRADING_FEES[key].takerRate / 100
      ).toFixed(2);
      return pre;
    },
    {}
  );
  AMM_TRADING_FEES = Object.keys(AMM_TRADING_FEES).reduce((pre, key) => {
    pre["AMM_TRADING_FEES." + key] = (
      AMM_TRADING_FEES[key].takerRate / 100
    ).toFixed(2);
    return pre;
  }, {});
  const template1 = new Template(textContent);
  return template1.interpolate({
    ...ORDERBOOK_TRADING_FEES_STABLECOIN,
    ...ORDERBOOK_TRADING_FEES,
    ...AMM_TRADING_FEES,
  });
};
const list = [
  "wallet_fees_zh.md",
  "wallet_fees_en.md",
  "dex_fees_en.md",
  "dex_fees_zh.md",
];
export const MarkDonwPage = () => {
  let match: any = useRouteMatch("/document/:path");
  const [path, setPath] = React.useState<null | string>(match?.params.path);
  const [input, setInput] = React.useState<string>("");

  React.useEffect(() => {
    if (path) {
      try {
        const _path = path.split("/").length > 1 ? path : `markdown/${path}`;

        fetch(url_path + "/" + _path)
          .then((response) => response.text())
          .then((input) => {
            if (list.findIndex((f) => f === path) !== -1) {
              return formatInput(input);
            } else {
              return input;
            }
          })
          .then((input) => {
            setInput(input);
          })
          .catch(() => {
            setPath(null);
          });
      } catch (e: any) {
        setPath(null);
      }
    }
  }, [path]);
  const theme = useTheme();

  return (
    <BoxStyle
      container
      minHeight={"calc(100% - 260px)"}
      flex={1}
      marginTop={3}
      marginBottom={2}
    >
      <Grid item xs={12}>
        {path ? (
          input ? (
            <Box
              flex={1}
              padding={3}
              boxSizing={"border-box"}
              className={`${theme.mode}  ${theme.mode}-scheme markdown-body MuiPaper-elevation2`}
            >
              <ReactMarkdown plugins={[gfm]} children={input} />
            </Box>
          ) : (
            <LoadingBlock />
          )
        ) : (
          <EmptyDefault
            height={"100%"}
            message={() => (
              <Box
                flex={1}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
              >
                No Content
              </Box>
            )}
          />
        )}
      </Grid>
    </BoxStyle>
  );
};
