import { Box, Grid } from "@mui/material";
import { useRouteMatch } from "react-router-dom";
import React from "react";
import { EmptyDefault } from "@loopring-web/component-lib";
import Template from "easy-template-string";
import gfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { useTheme } from "@emotion/react";

import { LoadingBlock } from "../LoadingPage";
import { MarkdownStyle } from "./style";

const url_path = "https://static.loopring.io/static/documents/notifaction";
export const MotifyMarkdownPage = () => {
  let match: any = useRouteMatch("/document/:path");
  const [path, setPath] = React.useState<null | string>(match?.params.path);
  const [input, setInput] = React.useState<string>("");

  React.useEffect(() => {
    if (path) {
      try {
        const _path = path.split("/").length > 1 ? path : `/${path}`;

        fetch(url_path + "/" + _path)
          .then((response) => response.text())
          .then((input) => {
            // return formatInput(input);
          })
          .then((input) => {
            // setInput(input);
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
    <MarkdownStyle
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
    </MarkdownStyle>
  );
};
