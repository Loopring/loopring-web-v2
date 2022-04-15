import { Box, BoxProps, Modal as MuiModal } from "@mui/material";
import {
  DepositGroup,
  ModalCloseButton,
  ModalPanelProps,
  ResetPanel,
  ExportAccountPanel,
  ResetProps,
  TransferPanel,
  TransferProps,
  useOpenModals,
  WithdrawPanel,
  WithdrawProps,
  ActiveAccountPanel,
  DepositGroupProps,
  modalContentBaseStyle,
  SwitchPanelStyled,
  DepositNFTWrap,
  MintNFTWrap,
  NFTMintProps,
  NFTDepositProps,
  InformationForAccountFrozen,
} from "../..";
import { FeeInfo, IBData } from "@loopring-web/common-resources";
import {
  useTranslation,
  WithTranslation,
  withTranslation,
} from "react-i18next";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import React from "react";
//padding-bottom: var(--toolbar-row-padding);
const BoxStyle = styled(Box)<
  { _height?: number | string; _width?: number | string } & BoxProps
>`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  ${({ theme }) => modalContentBaseStyle({ theme: theme })}
  background: ${({ theme }) => theme.colorBase.box};
  .trade-panel {
    position: relative;
    height: ${({ _height }) =>
      _height && Number.isNaN(_height)
        ? _height + "px"
        : _height
        ? _height
        : "auto"};
    .react-swipeable-view-container {
      & > div {
        padding: 0 ${({ theme }) => (theme.unit * 5) / 2}px
          ${({ theme }) => theme.unit * 5}px;
        overflow-x: hidden;
        overflow-y: scroll !important;
        background: initial;
        .container {
          height: 100%;
          padding-top: 0;
        }
      }
    }
  }
` as (
  props: { _height?: number | string; _width?: number | string } & BoxProps
) => JSX.Element;

const Modal = withTranslation("common")(
  ({
    open,
    onClose,
    content,
    _height,
    _width,
    ...rest
  }: ModalPanelProps & WithTranslation) => {
    return (
      <MuiModal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <BoxStyle
          style={{ boxShadow: "24" }}
          {...{
            _width: `var(--modal-width)`,
            _height: _height,
          }}
        >
          <Box display={"flex"} width={"100%"} flexDirection={"column"}>
            <ModalCloseButton onClose={onClose} {...rest} />
            {/*{onBack ? <ModalBackButton onBack={onBack}  {...rest}/> : <></>}*/}
          </Box>
          <Box className={"trade-wrap"}>{content}</Box>
        </BoxStyle>
        {/*</>*/}
      </MuiModal>
    );
  }
);

export const ModalPanel = <T extends IBData<I>, I, F = FeeInfo>({
  transferProps,
  withdrawProps,
  depositGroupProps,
  nftTransferProps,
  nftWithdrawProps,
  nftDepositProps,
  resetProps,
  nftMintProps,
  activeAccountProps,
  assetsData,
  ...rest
}: {
  _width?: number | string;
  _height?: number | string;
  transferProps: TransferProps<T, I>;
  withdrawProps: WithdrawProps<T, I>;
  depositGroupProps: DepositGroupProps<T, I>;
  nftTransferProps: TransferProps<T, I>;
  nftWithdrawProps: WithdrawProps<T, I>;
  nftDepositProps: NFTDepositProps<T, I>;
  nftMintProps: NFTMintProps<T, I>;
  resetProps: ResetProps<F>;
  activeAccountProps: ResetProps<F>;
  assetsData: any[];
  exportAccountProps: any;
  setExportAccountToastOpen: any;
}) => {
  const { t } = useTranslation();
  const {
    modals,
    // setShowAmm,
    // setShowSwap,
    setShowTransfer,
    setShowDeposit,
    setShowWithdraw,
    setShowNFTDeposit,
    setShowResetAccount,
    setShowActiveAccount,
    setShowExportAccount,
    setShowNFTMint,
  } = useOpenModals();
  const {
    isShowTransfer,
    isShowWithdraw,
    isShowDeposit,
    isShowNFTDeposit,
    isShowResetAccount,
    isShowExportAccount,
    isShowTradeIsFrozen,
    isShowActiveAccount,
    isShowNFTMint,
  } = modals;
  const theme = useTheme();
  return (
    <>
      <Modal
        open={isShowTransfer.isShow}
        onClose={() => setShowTransfer({ isShow: false })}
        content={
          <TransferPanel<any, any>
            {...{
              ...rest,
              _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              //    _height: DEFAULT_TRANSFER_HEIGHT + 100, ...transferProps, assetsData,
              _height: "auto",
              ...transferProps,
              assetsData,
            }}
          />
        }
      />
      <Modal
        open={isShowWithdraw.isShow}
        onClose={() => setShowWithdraw({ isShow: false })}
        content={
          <WithdrawPanel<any, any>
            {...{
              ...rest,
              _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              _height: "auto",
              ...withdrawProps,
              assetsData,
            }}
          />
        }
      />
      <Modal
        open={isShowDeposit.isShow}
        onClose={() => setShowDeposit({ isShow: false })}
        content={
          <DepositGroup
            {...{
              ...rest,
              ...depositGroupProps,
            }}
          />
        }
      />
      <Modal
        open={isShowResetAccount.isShow}
        onClose={() =>
          setShowResetAccount({ ...isShowResetAccount, isShow: false })
        }
        content={
          <ResetPanel<any, any>
            {...{
              ...rest,
              _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              _height: `calc(var(--modal-height) - ${theme.unit * 6}px)`,
              ...resetProps,
              assetsData,
            }}
          />
        }
      />
      <Modal
        open={isShowActiveAccount.isShow}
        onClose={() =>
          setShowActiveAccount({ ...isShowActiveAccount, isShow: false })
        }
        content={
          <ActiveAccountPanel<any, any>
            {...{
              ...rest,
              _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              _height: `calc(var(--modal-height) - ${theme.unit * 6}px)`,
              ...activeAccountProps,
            }}
          />
        }
      />
      <Modal
        open={isShowExportAccount.isShow}
        onClose={() =>
          setShowExportAccount({ ...isShowExportAccount, isShow: false })
        }
        content={
          <ExportAccountPanel
            {...{
              ...rest,
              _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              _height: `calc(var(--modal-height) + ${theme.unit * 16}px)`,
            }}
          />
        }
      />
      <InformationForAccountFrozen
        open={isShowTradeIsFrozen.isShow}
        type={isShowTradeIsFrozen.type ?? "Action"}
      />
      <MuiModal
        open={isShowNFTDeposit.isShow}
        onClose={() => setShowNFTDeposit({ isShow: false })}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <SwitchPanelStyled
          position={"relative"}
          style={{ alignItems: "stretch" }}
        >
          <Box display={"flex"} width={"100%"} flexDirection={"column"}>
            <ModalCloseButton
              onClose={() => setShowNFTDeposit({ isShow: false })}
              t={t}
              {...rest}
            />
          </Box>
          <Box
            display={"flex"}
            flexDirection={"column"}
            flex={1}
            justifyContent={"stretch"}
          >
            <DepositNFTWrap {...nftDepositProps} />
          </Box>
        </SwitchPanelStyled>
      </MuiModal>
      <MuiModal
        open={isShowNFTMint.isShow}
        onClose={() => setShowNFTMint({ isShow: false })}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <SwitchPanelStyled
          position={"relative"}
          style={{ alignItems: "stretch" }}
        >
          <Box display={"flex"} width={"100%"} flexDirection={"column"}>
            <ModalCloseButton
              onClose={() => setShowNFTMint({ isShow: false })}
              t={t}
              {...rest}
            />
          </Box>
          <Box
            display={"flex"}
            flexDirection={"column"}
            flex={1}
            justifyContent={"stretch"}
          >
            <MintNFTWrap {...nftMintProps} />
          </Box>
        </SwitchPanelStyled>
      </MuiModal>
    </>
  );
};
