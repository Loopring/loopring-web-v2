import { WithTranslation, withTranslation } from "react-i18next";
import {
  DepositPanelType,
  ModalAccount,
  ModalPanel,
  ModalQRCode,
  Toast,
  useOpenModals,
} from "@loopring-web/component-lib";
import { TOAST_TIME } from "defs/common_defs";
import { useAccountModalForUI } from "./hook";

export const ModalAccountInfo = withTranslation("common")(
  ({
    onClose,
    etherscanBaseUrl,
    open,
    t,
    ...rest
  }: {
    open: boolean;
    onClose?: (e: MouseEvent) => void;
    etherscanBaseUrl: string;
  } & WithTranslation) => {
    const {
      modals: {
        isShowDeposit: { partner },
      },
    } = useOpenModals();
    const {
      exportAccountAlertText,
      exportAccountToastOpen,
      setExportAccountToastOpen,
      setCopyToastOpen,
      setOpenQRCode,
      account,
      transferProps,
      withdrawProps,
      depositProps,
      nftTransferProps,
      nftWithdrawProps,
      nftDepositProps,
      nftMintProps,
      resetProps,
      activeAccountProps,
      exportAccountProps,
      assetsRawData,
      copyToastOpen,
      openQRCode,
      isShowAccount,
      closeBtnInfo,
      accountList,
      currentModal,
      vendorProps,
    } = useAccountModalForUI({ t, etherscanBaseUrl, rest, onClose });

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
          transferProps={transferProps}
          withdrawProps={withdrawProps}
          depositGroupProps={{
            depositProps: depositProps,
            tabIndex: partner
              ? DepositPanelType.ThirdPart
              : DepositPanelType.Deposit,
            vendorMenuProps: vendorProps,
          }}
          nftTransferProps={nftTransferProps}
          nftMintProps={nftMintProps}
          nftDepositProps={nftDepositProps}
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
        />
      </>
    );
  }
);
