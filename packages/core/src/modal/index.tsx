import {
  AlertNotSupport,
  DepositProps,
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

export const ModalGroup = withTranslation("common", {
  withRef: true,
})(
  ({
    isLayer1Only,
    onAccountInfoPanelClose,
    onWalletConnectPanelClose,
    depositProps,
    assetsRawData,
    ...rest
  }: WithTranslation & {
    isLayer1Only?: boolean;
    depositProps: DepositProps<any, any>;
    assetsRawData: AssetsRawDataItem[];
    onWalletConnectPanelClose?: (event: MouseEvent) => void;
    onAccountInfoPanelClose?: (event: MouseEvent) => void;
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
      },
      setShowSupport,
      setShowDeposit,
      setShowTransfer,
      setShowWithdraw,
      setShowResetAccount,
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

        <ModalAccountInfo
          {...{
            ...rest,
            assetsRawData,
            etherscanBaseUrl,
            account,
            open: isShowAccount.isShow,
            onClose: onAccountInfoPanelClose,
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
