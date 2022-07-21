import { useHistory } from "react-router-dom";
import { useOpenModals } from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { Box, Button } from "@mui/material";
import React from "react";
import styled from "@emotion/styled/";

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

export const NFTCollectPanel = () => {
  const history = useHistory();
  const { setShowNFTMintAdvance } = useOpenModals();
  const { t } = useTranslation(["common"]);
  return (
    <Box
      flex={1}
      alignItems={"center"}
      display={"flex"}
      justifyContent={"center"}
    >
      <Box marginLeft={1}>
        <Button
          onClick={() => {
            setShowNFTMintAdvance({ isShow: true });
          }}
          variant={"outlined"}
          color={"primary"}
        >
          {t("labelAdvanceCreateCollection")}
        </Button>
      </Box>
      <Box marginLeft={1}>
        <Button
          onClick={() => {
            history.push("/nft/addCollection");
          }}
          variant={"outlined"}
          color={"primary"}
        >
          {t("labelCreateCollection")}
        </Button>
      </Box>
    </Box>
  );
};
