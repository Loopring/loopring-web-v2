import { Box, BoxProps, Modal as MuiModal } from "@mui/material";
import {
  AmmPanel,
  AmmProps,
  // DepositPanel,
  DepositGroup,
  ModalCloseButton,
  ModalPanelProps,
  ResetPanel,
  ExportAccountPanel,
  ResetProps,
  SwapPanel,
  SwapProps,
  // SwitchPanelStyled,
  TransferPanel,
  TransferProps,
  useOpenModals,
  WithdrawPanel,
  WithdrawProps,
  ActiveAccountPanel,
  DepositGroupProps,
  modalContentBaseStyle,
} from "../..";
import { FeeInfo, IBData } from "@loopring-web/common-resources";
import { WithTranslation, withTranslation } from "react-i18next";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import React from "react";

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
        padding-bottom: var(--toolbar-row-padding);
        background: initial;
        .container {
          height: 100%;
          padding-top: 0;
        }
      }
    }
  }
` as React.ElementType<
  { _height?: number | string; _width?: number | string } & BoxProps
>;

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
  // nftDepositProps,
  resetProps,
  activeAccountProps,
  ammProps,
  swapProps,
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
  // nftDepositProps: DepositProps<T, I>;
  resetProps: ResetProps<F>;
  activeAccountProps: ResetProps<F>;
  ammProps: AmmProps<any, any, T, any>;
  swapProps: SwapProps<T, I, any>;
  assetsData: any[];
  exportAccountProps: any;
  setExportAccountToastOpen: any;
}) => {
  const {
    modals,
    setShowAmm,
    setShowSwap,
    setShowTransfer,
    setShowDeposit,
    setShowWithdraw,
    setShowResetAccount,
    setShowActiveAccount,
    setShowExportAccount,
  } = useOpenModals();
  const {
    isShowTransfer,
    isShowWithdraw,
    isShowDeposit,
    isShowResetAccount,
    isShowExportAccount,
    isShowAmm,
    isShowSwap,
    isShowActiveAccount,
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
          >
            {" "}
          </WithdrawPanel>
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
          >
            {" "}
          </ResetPanel>
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
          >
            {" "}
          </ActiveAccountPanel>
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
          >
            {" "}
          </ExportAccountPanel>
        }
      />
      <Modal
        open={isShowAmm.isShow}
        onClose={() => setShowAmm({ ...isShowAmm, isShow: false } as any)}
        content={
          <AmmPanel<any, any, any, any>
            {...{
              ...rest,
              _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              _height: "var(--modal-height)",
              ...ammProps,
            }}
          >
            {" "}
          </AmmPanel>
        }
      />
      <Modal
        open={isShowSwap.isShow}
        onClose={() => setShowSwap({ ...isShowSwap, isShow: false } as any)}
        content={
          <SwapPanel<any, any, any>
            {...{
              ...rest,
              _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              _height: "var(--modal-height)",
              ...swapProps,
            }}
          >
            {" "}
          </SwapPanel>
        }
      />
    </>
  );
};
