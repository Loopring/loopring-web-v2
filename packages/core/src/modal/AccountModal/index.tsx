import { WithTranslation, withTranslation } from "react-i18next";
import {
  DepositProps,
  // DepositPanelType,
  ModalAccount,
  ModalPanel,
  ModalQRCode,
  Toast,
  useOpenModals,
  // useOpenModals,
} from "@loopring-web/component-lib";
import { TOAST_TIME } from "@loopring-web/core";
import { useAccountModalForUI } from "./hook";
import { Account, AssetsRawDataItem } from "@loopring-web/common-resources";

export const ModalAccountInfo = withTranslation("common")(
  ({
    onClose,
    etherscanBaseUrl,
    open,
    assetsRawData,
    isLayer1Only,
    depositProps,
    t,
    ...rest
  }: {
    open: boolean;
    isLayer1Only?: boolean;
    account: Account;
    depositProps: DepositProps<any, any>;
    onClose?: (e: MouseEvent) => void;
    etherscanBaseUrl: string;
    assetsRawData: AssetsRawDataItem[];
  } & WithTranslation) => {
    const {
      // modals: { isShowAccount },
      // setShowConnect,
      // setShowAccount,
      setShowDeposit,
      // setShowNFTMint,
      setShowTransfer,
      setShowWithdraw,
      // setShowResetAccount,
      // setShowActiveAccount,
    } = useOpenModals();
    // const {
    //   modals: {
    //     isShowDeposit ,
    //   },
    // } = useOpenModals();
    const {
      exportAccountAlertText,
      exportAccountToastOpen,
      setExportAccountToastOpen,
      setCopyToastOpen,
      setOpenQRCode,
      account,
      transferProps,
      withdrawProps,
      nftTransferProps,
      nftWithdrawProps,
      // nftDepositProps,
      // nftMintProps,
      nftMintAdvanceProps,
      resetProps,
      activeAccountProps,
      exportAccountProps,
      // assetsRawData,
      copyToastOpen,
      openQRCode,
      isShowAccount,
      closeBtnInfo,
      accountList,
      currentModal,
      onBackReceive,
      onBackSend,
    } = useAccountModalForUI({
      t,
      depositProps,
      etherscanBaseUrl,
      onClose,
      isLayer1Only,
      ...rest,
    });

    return (
      <>
        <Toast
          alertText={exportAccountAlertText as string}
          open={exportAccountToastOpen}
          autoHideDuration={TOAST_TIME}
          onClose={() => {
            setExportAccountToastOpen(false);
          }}
          severity={"success"}
        />

        <ModalPanel
          transferProps={{
            ...transferProps,
            onBack: () => {
              setShowTransfer({ isShow: false });
              onBackSend();
            },
          }}
          withdrawProps={{
            ...withdrawProps,
            onBack: () => {
              setShowWithdraw({ isShow: false });
              onBackSend();
            },
          }}
          depositProps={{
            ...depositProps,
            onBack: () => {
              setShowDeposit({ isShow: false });
              onBackReceive();
            },
          }}
          nftTransferProps={nftTransferProps}
          nftMintAdvanceProps={nftMintAdvanceProps as any}
          nftWithdrawProps={nftWithdrawProps}
          resetProps={resetProps as any}
          activeAccountProps={activeAccountProps}
          exportAccountProps={exportAccountProps}
          assetsData={assetsRawData}
          setExportAccountToastOpen={setExportAccountToastOpen}
          {...{ _height: "var(--modal-height)", _width: "var(--modal-width)" }}
        />
        <Toast
          alertText={t("labelCopyAddClip")}
          open={copyToastOpen}
          autoHideDuration={TOAST_TIME}
          onClose={() => {
            setCopyToastOpen(false);
          }}
          severity={"success"}
        />
        <ModalQRCode
          open={openQRCode}
          onClose={() => setOpenQRCode(false)}
          title={"ETH Address"}
          description={account?.accAddress}
          url={account?.accAddress}
        />
        <ModalAccount
          open={isShowAccount.isShow}
          onClose={closeBtnInfo.callback}
          panelList={accountList}
          onBack={currentModal?.onBack}
          onQRClick={currentModal?.onQRClick}
          step={isShowAccount.step}
          etherscanBaseUrl={etherscanBaseUrl}
          isLayer2Only={isLayer1Only}
        />
      </>
    );
  }
);
