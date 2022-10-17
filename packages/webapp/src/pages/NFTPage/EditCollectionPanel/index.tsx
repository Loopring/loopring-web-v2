import styled from "@emotion/styled";
import {
  Button,
  CreateCollectionWrap,
  Toast,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import React from "react";
import { useHistory } from "react-router-dom";
import { useCollectionPanel } from "./hook";
import { BackIcon, TOAST_TIME } from "@loopring-web/common-resources";

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

export const EditCollectionPanel = () => {
  const {
    goBack,
    title,
    collectionToastOpen,
    collectionToastClose,
    ...editCollectionViewProps
  } = useCollectionPanel();

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        marginBottom={2}
      >
        <Button
          startIcon={<BackIcon fontSize={"small"} />}
          variant={"text"}
          size={"medium"}
          sx={{ color: "var(--color-text-secondary)" }}
          color={"inherit"}
          onClick={goBack}
        >
          {title}
        </Button>
      </Box>
      <StyledPaper
        flex={1}
        display={"flex"}
        justifyContent={"center"}
        marginBottom={2}
      >
        <CreateCollectionWrap {...{ ...editCollectionViewProps }} />
      </StyledPaper>
      <Toast
        alertText={collectionToastOpen?.content ?? ""}
        severity={collectionToastOpen?.type ?? "success"}
        open={collectionToastOpen?.open ?? false}
        autoHideDuration={TOAST_TIME}
        onClose={collectionToastClose}
      />
    </>
  );
};
