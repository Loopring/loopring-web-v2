import { WithTranslation, withTranslation } from "react-i18next";
import {
  DepositProps,
  ModalAccount,
  // ModalCloseButton,
  ModalPanel,
  ModalQRCode,
  // SwitchPanelStyled,
  Toast,
  useOpenModals,
  // useSettings,
} from "@loopring-web/component-lib";
import { useSystem } from "@loopring-web/core";
import { useAccountModalForUI } from "./hook";
import {
  Account,
  AssetsRawDataItem,
  FeeInfo,
  TOAST_TIME,
} from "@loopring-web/common-resources";
// import { Box, Modal as MuiModal } from "@mui/material";
// import { NFTDetail } from "./components/NFTDetail";

export const ModalAccountInfo = withTranslation("common")(
  ({
    // onClose,
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
    // onClose?: (e: MouseEvent) => void;
    etherscanBaseUrl: string;
    assetsRawData: AssetsRawDataItem[];
  } & WithTranslation) => {
    // const { isMobile } = useSettings();
    const { baseURL } = useSystem();
    const {
      modals: {
        // isShowNFTDetail,
        isShowAccount,
      },
      // setShowNFTDetail,
      setShowAccount,
      setShowDeposit,
      setShowTransfer,
      setShowWithdraw,
    } = useOpenModals();
    const {
      exportAccountAlertText,
      exportAccountToastOpen,
      setExportAccountToastOpen,
      setCopyToastOpen,
      setOpenQRCode,
      account,
      collectionAdvanceProps,
      transferProps,
      withdrawProps,
      nftTransferProps,
      nftWithdrawProps,
      nftDeployProps,
      // nftMintAdvanceProps,
      // checkActiveStatusProps,
      resetProps,
      activeAccountProps,
      exportAccountProps,
      // dualTradeProps,
      copyToastOpen,
      openQRCode,
      accountList,
      currentModal,
      onBackReceive,
      onBackSend,
      collectionToastOpen,
      collectionToastClose,
    } = useAccountModalForUI({
      t,
      depositProps,
      etherscanBaseUrl,
      isLayer1Only,
      ...rest,
    });
    // myLog(
    //   "resetProps.chargeFeeTokenList",
    //   activeAccountProps.chargeFeeTokenList
    // );
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
        <Toast
          alertText={collectionToastOpen?.content ?? ""}
          severity={collectionToastOpen?.type ?? "success"}
          open={collectionToastOpen?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={collectionToastClose}
        />

        <ModalPanel
          baseURL={baseURL}
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
          collectionAdvanceProps={collectionAdvanceProps as any}
          nftTransferProps={
            {
              ...nftTransferProps,
            } as any
          }
          nftWithdrawProps={nftWithdrawProps as any}
          nftDeployProps={nftDeployProps as any}
          // dualTradeProps={dualTradeProps as any}
          // nftMintAdvanceProps={nftMintAdvanceProps as any}
          // nftWithdrawProps={nftWithdrawProps}
          resetProps={resetProps as any}
          activeAccountProps={activeAccountProps}
          exportAccountProps={exportAccountProps}
          assetsData={assetsRawData}
          setExportAccountToastOpen={setExportAccountToastOpen}
          account={account}
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
          onClose={() => {
            setShowAccount({ isShow: false });
          }}
          panelList={accountList}
          onBack={currentModal?.onBack}
          onQRClick={currentModal?.onQRClick}
          step={isShowAccount.step}
          etherscanBaseUrl={etherscanBaseUrl}
          isLayer2Only={isLayer1Only}
        />
        {/*<MuiModal*/}
        {/*  open={isShowNFTDetail.isShow}*/}
        {/*  onClose={() => {*/}
        {/*    setShowNFTDetail({ isShow: false });*/}
        {/*  }}*/}
        {/*  aria-labelledby="modal-modal-title"*/}
        {/*  aria-describedby="modal-modal-description"*/}
        {/*>*/}
        {/*  <SwitchPanelStyled*/}
        {/*    // width={"80%"}*/}
        {/*    width={isMobile ? "360px" : "80%"}*/}
        {/*    position={"relative"}*/}
        {/*    minWidth={isMobile ? "initial" : 1000}*/}
        {/*    style={{ alignItems: "stretch" }}*/}
        {/*  >*/}
        {/*    <Box display={"flex"} width={"100%"} flexDirection={"column"}>*/}
        {/*      <ModalCloseButton*/}
        {/*        onClose={() => {*/}
        {/*          setShowNFTDetail({ isShow: false });*/}
        {/*        }}*/}
        {/*        t={t}*/}
        {/*        {...rest}*/}
        {/*      />*/}
        {/*    </Box>*/}
        {/*    <Box*/}
        {/*      display={"flex"}*/}
        {/*      flexDirection={isMobile ? "column" : "row"}*/}
        {/*      flex={1}*/}
        {/*      justifyContent={"stretch"}*/}
        {/*    >*/}

        {/*    </Box>*/}
        {/*  </SwitchPanelStyled>*/}
        {/*</MuiModal>*/}
      </>
    );
  }
);
