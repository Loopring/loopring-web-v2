import {
  AccountStep,
  AlertNotSupport,
  DepositProps,
  InformationForNoMetaNFT,
  ModalCloseButton,
  ModalSettingFee,
  OtherExchangeDialog,
  SwitchPanelStyled,
  useOpenModals,
} from "@loopring-web/component-lib";
import { ModalWalletConnectPanel } from "./WalletModal";
import { ModalAccountInfo } from "./AccountModal";
import { withTranslation, WithTranslation } from "react-i18next";
import { useSystem, useAccountModal, useAccount } from "@loopring-web/core";
import React from "react";
import {
  AccountStatus,
  AssetsRawDataItem,
} from "@loopring-web/common-resources";
import { Box, Modal as MuiModal } from "@mui/material";
import { ModalAccountL1Info } from "./AccountL1Modal";

export const ModalGroup = withTranslation("common")(
  ({
    isLayer1Only,
    onWalletConnectPanelClose,
    depositProps,
    assetsRawData,
    ...rest
  }: WithTranslation & {
    isLayer1Only?: boolean;
    depositProps: DepositProps<any, any>;
    assetsRawData: AssetsRawDataItem[];
    onWalletConnectPanelClose?: (event: MouseEvent) => void;
  }) => {
    const { etherscanBaseUrl } = useSystem();
    const {
      modals: { isShowFeeSetting, isShowIFrame },
      setShowFeeSetting,
      setShowIFrame,
      setShowOtherExchange,
    } = useOpenModals();
    useAccountModal();

    const {
      modals: {
        isShowAccount,
        isShowConnect,
        isShowSupport,
        isShowOtherExchange,
        isShowNFTMetaNotReady,
      },
      setShowAccount,
      setShowSupport,
      setShowDeposit,
      setShowTransfer,
      setShowWithdraw,
      setShowResetAccount,
      setNFTMetaNotReady,
    } = useOpenModals();
    const { account } = useAccount();

    React.useEffect(() => {
      if (account.readyState !== AccountStatus.ACTIVATED) {
        setShowDeposit({ isShow: false });
        setShowTransfer({ isShow: false });
        setShowWithdraw({ isShow: false });
        setShowResetAccount({ isShow: false });
      }
    }, [account.readyState]);

    return (
      <>
        <AlertNotSupport
          open={isShowSupport.isShow}
          handleClose={() => {
            setShowSupport({ isShow: false });
          }}
        />
        {/*<ModalRedPacketPanel etherscanBaseUrl={etherscanBaseUrl} />*/}
        <ModalWalletConnectPanel
          {...{
            ...rest,
            open: isShowConnect.isShow,
            onClose: onWalletConnectPanelClose,
          }}
        />
        <OtherExchangeDialog
          open={isShowOtherExchange.isShow}
          handleClose={(_e, agree) => {
            setShowOtherExchange({ isShow: false, agree });
          }}
        />
        <InformationForNoMetaNFT
          open={!!isShowNFTMetaNotReady.isShow}
          method={isShowNFTMetaNotReady?.info?.method}
          handleClose={(_e, isAgree) => {
            setNFTMetaNotReady({ isShow: false });
            if (isAgree) {
              setShowAccount({
                isShow: true,
                step: AccountStep.SendNFTGateway,
              });
            }
          }}
        />
        <ModalAccountInfo
          {...{
            ...rest,
            assetsRawData,
            etherscanBaseUrl,
            account,
            open: isShowAccount.isShow,
            depositProps,
            isLayer1Only,
          }}
        />
        <ModalSettingFee
          open={isShowFeeSetting.isShow}
          onClose={() => setShowFeeSetting({ isShow: false })}
        />
        <MuiModal
          open={isShowIFrame.isShow}
          onClose={() => setShowIFrame({ isShow: false, url: "" })}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <SwitchPanelStyled
            width={"80%"}
            position={"relative"}
            style={{ alignItems: "stretch" }}
          >
            <Box display={"flex"} width={"100%"} flexDirection={"column"}>
              <ModalCloseButton
                onClose={() => setShowIFrame({ isShow: false, url: "" })}
                {...rest}
              />
              {/*{onBack ? <ModalBackButton onBack={onBack}  {...rest}/> : <></>}*/}
            </Box>
            <iframe src={isShowIFrame.url} />
          </SwitchPanelStyled>
        </MuiModal>
      </>
    );
  }
);
export const ModalGroupL1 = withTranslation("common")(
  ({
    onWalletConnectPanelClose,
    depositProps,
    assetsRawData,
    ...rest
  }: WithTranslation & {
    depositProps: DepositProps<any, any>;
    assetsRawData: AssetsRawDataItem[];
    onWalletConnectPanelClose?: (event: MouseEvent) => void;
  }) => {
    const { etherscanBaseUrl } = useSystem();

    useAccountModal();

    const {
      modals: { isShowAccount, isShowConnect, isShowSupport },
      setShowSupport,
    } = useOpenModals();
    const { account } = useAccount();

    return (
      <>
        <AlertNotSupport
          open={isShowSupport.isShow}
          handleClose={() => {
            setShowSupport({ isShow: false });
          }}
        />
        {/*<ModalRedPacketPanel etherscanBaseUrl={etherscanBaseUrl} />*/}
        <ModalWalletConnectPanel
          {...{
            ...rest,
            open: isShowConnect.isShow,
            onClose: onWalletConnectPanelClose,
          }}
        />

        <ModalAccountL1Info
          {...{
            ...rest,
            assetsRawData,
            etherscanBaseUrl,
            account,
            open: isShowAccount.isShow,
            depositProps,
          }}
        />
      </>
    );
  }
);
export * from "./AmmPoolModal";
export * from "./RedPacketModal";
export * from "./DualModal";
export * from "./AccountModal/components/NFTDetail";
