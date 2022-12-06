import { WithTranslation, withTranslation } from "react-i18next";
import styled from "@emotion/styled";
import { Box, Modal, Typography } from "@mui/material";
import { ReactNode } from "react";
import { ModalBackButton, ModalCloseButton } from "@loopring-web/component-lib";

type GuardianModalProps = {
  open: boolean;
  onClose: {
    bivarianceHack(event: {}, reason: "backdropClick" | "escapeKeyDown"): void;
  }["bivarianceHack"];
  title: ReactNode;
  body: ReactNode;
  onBack?: () => void;
  showBackButton?: boolean;
};

const GuardianModalContentStyled = styled(Box)`
  & > div {
    background: var(--color-pop-bg);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: ${({ theme }) => theme.unit * 75}px;
  }
  &.guardianPop .content {
    padding-top: ${({ theme }) => 5 * theme.unit}px;
    border-radius: ${({ theme }) => theme.unit}px;
  }
`;


export const GuardianModal = withTranslation("common")(
  ({
    onClose,
    open,
    body,
    title,
    onBack,
    showBackButton,
    t
  }: GuardianModalProps & WithTranslation) => {
    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <GuardianModalContentStyled
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          className={"guardianPop"}
        >
          <Box
            className={"content"}
            paddingTop={3}
            paddingBottom={3}
            display={"flex"}
            flexDirection={"column"}
          >
            {showBackButton && <ModalBackButton onBack={onBack} />}
            <ModalCloseButton onClose={onClose} t={t} />
            <Box
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              flexDirection={"column"}
            >
              {title && (
                <Typography
                  variant={"h4"}
                  component="h3"
                  className="modalTitle"
                  marginBottom={3}
                >
                  {title}
                </Typography>
              )}
            </Box>
            <Box paddingX={5}>{body}</Box>
          </Box>
        </GuardianModalContentStyled>
      </Modal>
    );
  }
);
