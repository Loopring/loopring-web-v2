import styled from "@emotion/styled";
import { Box, Typography } from "@mui/material";
import { IPFSSourceUpload } from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
const MaxSize = 50;
const StyleWrapper = styled(Box)`
  position: relative;
  width: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
` as typeof Box;
const TYPES = ["jpeg", "jpg", "gif", "png"];
export const NFTMintPanel = () => {
  const ipfsMediaSource: File[] = [];
  const { t } = useTranslation();
  return (
    <Box flex={1} display={"flex"} flexDirection={"column"} marginBottom={2}>
      <StyleWrapper paddingBottom={2}>
        <Typography component={"h3"} variant={"h4"} padding={5 / 2}>
          {t("labelLoadTitle", { types: TYPES })}
        </Typography>
        <Box paddingX={5 / 2}>
          <IPFSSourceUpload
            value={ipfsMediaSource}
            onChange={() => {}}
            maxSize={MaxSize}
            types={TYPES}
          />
        </Box>
      </StyleWrapper>
      <StyleWrapper
        flex={1}
        marginTop={2}
        display={"flex"}
        flexDirection={"column"}
        className={"MuiPaper-elevation2"}
      >
        <Typography component={"h3"} variant={"h4"} padding={5 / 2}>
          {t("labelIPFSStep2")}
        </Typography>
        <Box flex={1}></Box>
      </StyleWrapper>
    </Box>
  );
};
