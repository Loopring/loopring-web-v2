import styled from "@emotion/styled";
import { Box, Button, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import React from "react";
import { useOpenModals } from "@loopring-web/component-lib";

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

export const CreateCollectPanel = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <StyledPaper
        flex={1}
        className={"MuiPaper-elevation2"}
        marginTop={0}
        marginBottom={2}
        display={"flex"}
        flexDirection={"column"}
      >
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          paddingX={5 / 2}
          paddingTop={5 / 2}
        >
          <Typography component={"h3"} variant={"h4"}>
            {t("labelCreateCollectionTitle")}
          </Typography>
        </Box>
        <Box flex={1} display={"flex"}>
          <Box marginLeft={1}>
            <Button onClick={() => {}} variant={"outlined"} color={"primary"}>
              {t("labelAdvanceCreateCollection")}
            </Button>
          </Box>
        </Box>
      </StyledPaper>
    </>
  );
};
