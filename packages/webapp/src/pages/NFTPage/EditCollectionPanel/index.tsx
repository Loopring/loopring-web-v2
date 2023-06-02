import styled from "@emotion/styled";
import {
  Button,
  CreateCollectionWrap,
  Toast,
  ToastType,
} from "@loopring-web/component-lib";
import { Box } from "@mui/material";
import React from "react";
import { useCollectionPanel } from "./hook";
import { BackIcon, TOAST_TIME } from "@loopring-web/common-resources";

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

export const EditCollectionPanel = ({
  type,
}: {
  type: "addCollection" | "editCollection" | "addLegacyCollection";
}) => {
  // 0x47a6884c9f2e5627ad82bfa94c999a59e0310906
  const {
    goBack,
    title,
    collectionToastOpen,
    collectionToastClose,
    ...editCollectionViewProps
  } = useCollectionPanel({ type });

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
        severity={collectionToastOpen?.type ?? ToastType.success}
        open={collectionToastOpen?.open ?? false}
        autoHideDuration={TOAST_TIME}
        onClose={collectionToastClose}
      />
    </>
  );
};
