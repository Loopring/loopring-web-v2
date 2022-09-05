import { Box, BoxProps, Modal as MuiModal } from "@mui/material";
import {
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
  modalContentBaseStyle,
  InformationForAccountFrozen,
  DepositPanel,
  DepositProps,
  useSettings,
  LayerswapNotice,
  DeployNFTWrap,
  NFTDeployProps,
  AccountStep,
  CollectionAdvanceProps,
  DualWrapProps,
} from "../..";
import {
  Account,
  CollectionMeta,
  DualCalcData,
  FeeInfo,
  IBData,
  TradeNFT,
} from "@loopring-web/common-resources";
import { WithTranslation, withTranslation } from "react-i18next";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { CollectionAdvanceWrap } from "./components/CollectionAdvanceWrap";
import { DualWrap } from "./components/DualWrap/dualWrap";

const BoxStyle = styled(Box)<
  { _height?: number | string; _width?: number | string } & BoxProps
>`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  ${({ theme }) => modalContentBaseStyle({ theme: theme })}
  background: ${({ theme }) => theme.colorBase.box};

  .trade-wrap {
    margin-top: -26px;
  }

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
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* Internet Explorer 10+ */
        &::-webkit-scrollbar {
          /* WebKit */
          width: 0;
        }
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
    contentClassName,
    _width,
    ...rest
  }: ModalPanelProps & WithTranslation) => {
    const { isMobile } = useSettings();
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
          <Box
            className={contentClassName}
            maxWidth={isMobile ? "350px" : "inherit"}
          >
            {content}
          </Box>
        </BoxStyle>
        {/*</>*/}
      </MuiModal>
    );
  }
);

export const ModalPanel = <
  T extends IBData<I>,
  N extends IBData<I> & TradeNFT<I, any>,
  C extends CollectionMeta,
  DUAL extends DualCalcData,
  I,
  F = FeeInfo
>({
  transferProps,
  withdrawProps,
  depositProps,
  nftTransferProps,
  nftWithdrawProps,
  nftDeployProps,
  resetProps,
  // nftMintAdvanceProps,
  activeAccountProps,
  collectionAdvanceProps,
  dualTradeProps,
  assetsData,
  account,
  baseURL,
  ...rest
}: {
  _width?: number | string;
  _height?: number | string;
  transferProps: TransferProps<T, I>;
  withdrawProps: WithdrawProps<T, I>;
  baseURL: string;
  nftTransferProps: TransferProps<N, I>;
  nftWithdrawProps: WithdrawProps<N, I>;
  nftDeployProps: NFTDeployProps<N & { broker: string }, I, F>;
  depositProps: DepositProps<T, I>;
  // depositGroupProps: DepositGroupProps<T, I>;
  // nftDepositProps: NFTDepositProps<T, I>;
  collectionAdvanceProps: CollectionAdvanceProps<C>;
  dualTradeProps: DualWrapProps<T, I, DUAL>;
  // nftMintAdvanceProps: NFTMintAdvanceProps<T, I>;
  resetProps: ResetProps<F>;
  activeAccountProps: ResetProps<F>;
  assetsData: any[];
  exportAccountProps: any;
  account: Account;
  setExportAccountToastOpen: any;
}) => {
  const { isMobile } = useSettings();
  const {
    modals,
    // setShowAmm,
    // setShowSwap,
    setShowTransfer,
    setShowDeposit,
    setShowWithdraw,
    setShowResetAccount,
    setShowActiveAccount,
    setShowExportAccount,
    setShowNFTTransfer,
    setShowNFTWithdraw,
    setShowNFTDeploy,
    setShowAccount,
    setShowCollectionAdvance,
    setShowDual,
  } = useOpenModals();
  const {
    isShowTransfer,
    isShowWithdraw,
    isShowDeposit,
    isShowNFTTransfer,
    isShowNFTWithdraw,
    isShowNFTDeploy,
    isShowResetAccount,
    isShowExportAccount,
    isShowTradeIsFrozen,
    isShowActiveAccount,
    isShowCollectionAdvance,
    isShowLayerSwapNotice,
    isShowDual,
  } = modals;
  const theme = useTheme();
  return (
    <>
      <Modal
        open={isShowTransfer.isShow}
        contentClassName={"trade-wrap"}
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
        contentClassName={"trade-wrap"}
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
      {/*<Modal*/}
      {/*  open={isShowDeposit.isShow}*/}
      {/*  onClose={() => setShowDeposit({ isShow: false })}*/}
      {/*  content={*/}
      {/*    <DepositGroup*/}
      {/*      {...{*/}
      {/*        ...rest,*/}
      {/*        ...depositGroupProps,*/}
      {/*      }}*/}
      {/*    />*/}
      {/*  }*/}
      {/*/>*/}
      <Modal
        open={isShowNFTTransfer.isShow}
        contentClassName={"trade-wrap"}
        onClose={() => setShowNFTTransfer({ isShow: false })}
        content={
          <TransferPanel<any, any>
            {...{
              ...nftTransferProps,
              _width: isMobile ? "var(--mobile-full-panel-width)" : 440,
              _height: isMobile ? "auto" : 540,
              isThumb: false,
              type: "NFT",
              baseURL,
              assetsData,
            }}
            onBack={() => {
              setShowNFTTransfer({ isShow: false });
              setShowAccount({
                isShow: true,
                step: AccountStep.SendNFTGateway,
              });
            }}
          />
        }
      />
      <Modal
        open={isShowNFTWithdraw.isShow}
        contentClassName={"trade-wrap"}
        onClose={() => setShowNFTWithdraw({ isShow: false })}
        content={
          <WithdrawPanel<any, any>
            {...{
              // _width: isMobile ? "var(--mobile-full-panel-width)" : 440,
              // _height: isMobile ? "auto" : 540,
              _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              //    _height: DEFAULT_TRANSFER_HEIGHT + 100, ...transferProps, assetsData,
              _height: "auto",
              isThumb: false,
              ...nftWithdrawProps,
              type: "NFT",
              baseURL,
              assetsData,
            }}
            onBack={() => {
              setShowNFTWithdraw({ isShow: false });
              setShowAccount({
                isShow: true,
                step: AccountStep.SendNFTGateway,
              });
            }}
          />
        }
      />
      <Modal
        open={isShowNFTDeploy.isShow}
        contentClassName={"trade-wrap"}
        onClose={() => setShowNFTDeploy({ isShow: false })}
        content={
          <DeployNFTWrap<any, any, any>
            {...{
              ...nftDeployProps,
              assetsData,
            }}
            onBack={() => {
              setShowNFTDeploy({ isShow: false });
              // setShowNFTWithdraw({isShow:false});
              // setShowAccount({isShow:false,step:AccountStep.SendNFTGateway})
            }}
          />
        }
      />

      <Modal
        open={isShowDeposit.isShow}
        contentClassName={"trade-wrap"}
        onClose={() => setShowDeposit({ isShow: false })}
        content={
          <DepositPanel
            {...{
              ...rest,
              _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              _height: "auto",
              ...depositProps,
            }}
          />
        }
      />
      {/*<Modal*/}
      {/*  open={isShowDeposit.isShow}*/}
      {/*  onClose={() => setShowDeposit({ isShow: false })}*/}
      {/*  content={*/}
      {/*    <DepositPanel {...{ ...rest, ...depositGroupProps.depositProps }} />*/}
      {/*  }*/}
      {/*/>*/}

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
      <LayerswapNotice open={isShowLayerSwapNotice.isShow} account={account} />
      {/*<Modal*/}
      {/*  open={isShowNFTMintAdvance.isShow}*/}
      {/*  onClose={() => setShowNFTMintAdvance({ isShow: false })}*/}
      {/*  content={*/}
      {/*    <MintAdvanceNFTWrap*/}
      {/*      {...{*/}
      {/*        ...rest,*/}
      {/*        // _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,*/}
      {/*        // _height: `calc(var(--modal-height) - ${theme.unit * 6}px)`,*/}
      {/*        ...nftMintAdvanceProps,*/}
      {/*      }}*/}
      {/*    />*/}
      {/*  }*/}
      {/*/>*/}
      <Modal
        open={isShowCollectionAdvance.isShow}
        onClose={() => setShowCollectionAdvance({ isShow: false })}
        content={
          <CollectionAdvanceWrap
            {...{
              ...rest,
              // _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              // _height: `calc(var(--modal-height) - ${theme.unit * 6}px)`,
              ...collectionAdvanceProps,
            }}
          />
        }
      />
      <Modal
        open={isShowDual.isShow}
        onClose={() => setShowDual({ isShow: false, dualInfo: undefined })}
        content={
          <DualWrap
            {...{
              ...rest,
              // _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              // _height: `calc(var(--modal-height) - ${theme.unit * 6}px)`,
              ...dualTradeProps,
            }}
          />
        }
      />
    </>
  );
};
