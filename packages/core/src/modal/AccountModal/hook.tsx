/* eslint-disable react/jsx-pascal-case */
import {
  AccountStep,
  AddAsset,
  AddAssetItem,
  Button,
  CheckActiveStatus,
  CreateAccount_Approve_Denied,
  CreateAccount_Approve_Submit,
  CreateAccount_Approve_WaitForAuth,
  CreateAccount_Denied,
  CreateAccount_Failed,
  CreateAccount_Submit,
  CreateAccount_WaitForAuth,
  Deposit_Approve_Denied,
  Deposit_Approve_Submit,
  Deposit_Approve_WaitForAuth,
  Deposit_Denied,
  Deposit_Failed,
  Deposit_Sign_WaitForRefer,
  Deposit_Submit,
  Deposit_WaitForAuth,
  DepositProps,
  ExportAccount_Approve_WaitForAuth,
  ExportAccount_Failed,
  ExportAccount_Success,
  ExportAccount_User_Denied,
  ForceWithdraw_Denied,
  ForceWithdraw_Failed,
  ForceWithdraw_First_Method_Denied,
  ForceWithdraw_In_Progress,
  ForceWithdraw_Submit,
  ForceWithdraw_WaitForAuth,
  HadAccount,
  NFTDeploy_Denied,
  NFTDeploy_Failed,
  NFTDeploy_First_Method_Denied,
  NFTDeploy_In_Progress,
  NFTDeploy_Submit,
  NFTDeploy_WaitForAuth,
  NFTDeposit_Approve_Denied,
  NFTDeposit_Approve_Submit,
  NFTDeposit_Approve_WaitForAuth,
  NFTDeposit_Denied,
  NFTDeposit_Failed,
  NFTDeposit_Submit,
  NFTDeposit_WaitForAuth,
  NFTMint_Denied,
  NFTMint_Failed,
  NFTMint_First_Method_Denied,
  NFTMint_In_Progress,
  NFTMint_Success,
  NFTMint_WaitForAuth,
  NFTTransfer_Failed,
  NFTTransfer_First_Method_Denied,
  NFTTransfer_In_Progress,
  NFTTransfer_Success,
  NFTTransfer_User_Denied,
  NFTTransfer_WaitForAuth,
  NFTWithdraw_Failed,
  NFTWithdraw_First_Method_Denied,
  NFTWithdraw_In_Progress,
  NFTWithdraw_Success,
  NFTWithdraw_User_Denied,
  NFTWithdraw_WaitForAuth,
  NoAccount,
  QRAddressPanel,
  SendAsset,
  SendAssetItem,
  SendNFTAsset,
  Transfer_Failed,
  Transfer_First_Method_Denied,
  Transfer_In_Progress,
  Transfer_Success,
  Transfer_User_Denied,
  Transfer_WaitForAuth,
  UnlockAccount_Failed,
  UnlockAccount_Success,
  UnlockAccount_User_Denied,
  UnlockAccount_WaitForAuth,
  UpdateAccount,
  UpdateAccount_Approve_WaitForAuth,
  UpdateAccount_Failed,
  UpdateAccount_First_Method_Denied,
  UpdateAccount_Success,
  UpdateAccount_User_Denied,
  useOpenModals,
  VendorMenu,
  Withdraw_Failed,
  Withdraw_First_Method_Denied,
  Withdraw_In_Progress,
  Withdraw_Success,
  Withdraw_User_Denied,
  Withdraw_WaitForAuth,
} from "@loopring-web/component-lib";
import {
  ConnectProviders,
  connectProvides,
  walletServices,
} from "@loopring-web/web3-provider";

import React, { useState } from "react";
import {
  Account,
  AccountStatus,
  AddAssetList,
  Bridge,
  copyToClipBoard,
  FeeInfo,
  NFTWholeINFO,
  SendAssetList,
  SendNFTAssetList,
  TradeTypes,
} from "@loopring-web/common-resources";
import {
  goActiveAccount,
  lockAccount,
  mintService,
  onchainHashInfo,
  store,
  unlockAccount,
  useAccount,
  useActiveAccount,
  useCheckActiveStatus,
  useExportAccount,
  useForceWithdraw,
  useModalData,
  useNFTDeploy,
  useNFTTransfer,
  useNFTWithdraw,
  useRampTransPost,
  useReset,
  useSystem,
  useTransfer,
  useUpdateAccount,
  useVendor,
  useWalletLayer2,
  useWithdraw,
  useCollectionAdvanceMeta,
  useToast,
  useNFTMintAdvance,
  useNotify,
} from "@loopring-web/core";
import * as sdk from "@loopring-web/loopring-sdk";

export function useAccountModalForUI({
  t,
  onClose,
  isLayer1Only = false,
  depositProps,
  ...rest
}: {
  t: any;
  etherscanBaseUrl: string;
  isLayer1Only?: boolean;
  depositProps: DepositProps<any, any>;
  account: Account;
  onClose?: any;
}) {
  const { goUpdateAccount } = useUpdateAccount();
  const { chainInfos, updateDepositHash, clearDepositHash } =
    onchainHashInfo.useOnChainInfo();
  const { updateWalletLayer2 } = useWalletLayer2();
  const { processRequestRampTransfer } = useRampTransPost();
  const { campaignTagConfig } = useNotify().notifyMap ?? {};

  const {
    modals: {
      isShowAccount,
      isShowWithdraw,
      isShowTransfer,
      // isShowNFTTransfer,
      // isShowNFTWithdraw,
    },
    setShowConnect,
    setShowAccount,
    setShowDeposit,
    setShowTransfer,
    setShowWithdraw,
    setShowResetAccount,
    setShowActiveAccount,
    setShowNFTTransfer,
    setShowNFTWithdraw,
  } = useOpenModals();
  rest = { ...rest, ...isShowAccount.info };
  const {
    nftDepositValue,
    nftTransferValue,
    nftWithdrawValue,
    nftDeployValue,
    transferValue,
    withdrawValue,
    forceWithdrawValue,
  } = useModalData();

  const { chainId, allowTrade } = useSystem();

  const { account, addressShort, shouldShow, setShouldShow } = useAccount();

  const {
    exportAccountAlertText,
    exportAccountToastOpen,
    setExportAccountToastOpen,
  } = useExportAccount();
  const {
    toastOpen: collectionToastOpen,
    setToastOpen: setCollectionToastOpen,
    closeToast: collectionToastClose,
  } = useToast();

  const { retryBtn: nftMintAdvanceRetryBtn } = useNFTMintAdvance();
  const { collectionAdvanceProps } = useCollectionAdvanceMeta({
    setCollectionToastOpen,
  });
  const { vendorListBuy } = useVendor();
  // const { nftMintProps } = useNFTMint();
  const { withdrawProps } = useWithdraw();
  const { transferProps, retryBtn: transferRetry } = useTransfer();
  const { nftWithdrawProps } = useNFTWithdraw();
  const { nftTransferProps } = useNFTTransfer();
  const { nftDeployProps } = useNFTDeploy();
  const { retryBtn: forceWithdrawRetry } = useForceWithdraw();
  const { resetProps } = useReset();
  const { activeAccountProps, activeAccountCheckFeeIsEnough } =
    useActiveAccount();

  // const { nftDepositProps } = useNFTDeposit();
  const { exportAccountProps } = useExportAccount();

  const [openQRCode, setOpenQRCode] = useState(false);

  const [copyToastOpen, setCopyToastOpen] = useState(false);

  const onSwitch = React.useCallback(() => {
    setShowAccount({ isShow: false });
    setShouldShow(true);
    setShowConnect({ isShow: shouldShow ?? false });
  }, [setShowAccount, setShouldShow, setShowConnect, shouldShow]);

  const onCopy = React.useCallback(async () => {
    copyToClipBoard(account.accAddress);
    setCopyToastOpen(true);
  }, [account, setCopyToastOpen]);

  const onViewQRCode = React.useCallback(() => {
    setOpenQRCode(true);
  }, [setOpenQRCode]);

  const onDisconnect = React.useCallback(async () => {
    walletServices.sendDisconnect("", "customer click disconnect");
    setShowAccount({ isShow: false });
  }, [setShowAccount]);

  const onQRClick = React.useCallback(() => {
    setShowAccount({ isShow: true, step: AccountStep.QRCode });
  }, [setShowAccount]);

  const unlockBtn = React.useMemo(() => {
    return (
      <Button
        variant={"contained"}
        fullWidth
        size={"medium"}
        onClick={() => {
          setShouldShow(true);
          unlockAccount();
        }}
      >
        {t("labelUnLockLayer2")}
      </Button>
    );
  }, [t, setShouldShow]);

  const lockBtn = React.useMemo(() => {
    return (
      <Button
        variant={"contained"}
        fullWidth
        size={"medium"}
        onClick={() => {
          lockAccount();
        }}
      >
        {t("labelLockLayer2")}
      </Button>
    );
  }, [t]);

  const onQRBack = React.useCallback(() => {
    if (Number.isInteger(isShowAccount.info?.backTo)) {
      setShowAccount({ isShow: true, step: isShowAccount.info?.backTo });
    } else {
      switch (account.readyState) {
        case AccountStatus.NO_ACCOUNT:
        case AccountStatus.DEPOSITING:
          setShowAccount({ isShow: true, step: AccountStep.NoAccount });
          break;
        case AccountStatus.LOCKED:
        case AccountStatus.ACTIVATED:
          setShowAccount({ isShow: true, step: AccountStep.HadAccount });
          break;
        default:
          setShowAccount({ isShow: false });
      }
    }
  }, [account.readyState, isShowAccount, setShowAccount]);

  const backToDepositBtnInfo = React.useMemo(() => {
    return {
      btnTxt: "labelRetry",
      callback: () => {
        setShowAccount({ isShow: false });
        if (!depositProps.isAllowInputToAddress) {
          setShowDeposit({ isShow: true });
        }
      },
    };
  }, [setShowAccount, depositProps.isAllowInputToAddress, setShowDeposit]);

  const backToNFTDepositBtnInfo = React.useMemo(() => {
    return {
      btnTxt: "labelRetry",
      callback: () => {
        setShowAccount({ isShow: false });
      },
    };
  }, [setShowAccount]);

  const backToMintBtnInfo = React.useMemo(() => {
    return {
      btnTxt: "labelRetry",
      callback: () => {
        setShowAccount({ isShow: false });
        if (isShowAccount.info?.isAdvanceMint) {
          nftMintAdvanceRetryBtn();
        }
      },
    };
  }, [
    isShowAccount.info?.isAdvanceMint,
    nftMintAdvanceRetryBtn,
    setShowAccount,
  ]);

  const backToDeployBtnInfo = React.useMemo(() => {
    return {
      btnTxt: "labelRetry",
      callback: () => {
        setShowAccount({ isShow: false });
      },
    };
  }, [setShowAccount]);

  const backToTransferBtnInfo = React.useMemo(() => {
    return {
      btnTxt: "labelRetry",
      callback: () => {
        transferRetry(false);
      },
    };
  }, [isShowTransfer.info, setShowAccount, setShowTransfer]);

  const backToWithdrawBtnInfo = React.useMemo(() => {
    return {
      btnTxt: "labelRetry",
      callback: () => {
        setShowAccount({ isShow: false });
        setShowWithdraw({
          isShow: true,
          info: {
            ...isShowWithdraw.info,
            isRetry: true,
          },
        });
      },
    };
  }, [isShowWithdraw, setShowAccount, setShowWithdraw]);

  const backToUnlockAccountBtnInfo = React.useMemo(() => {
    return {
      btnTxt: "labelRetry",
      callback: () => {
        setShowAccount({ isShow: true, step: AccountStep.HadAccount });
      },
    };
  }, [setShowAccount]);

  const backToUpdateAccountBtnInfo = React.useMemo(() => {
    return {
      btnTxt: "labelRetry",
      callback: () => {
        setShowAccount({ isShow: true, step: AccountStep.CheckingActive });
      },
    };
  }, [setShowAccount]);

  const backToResetAccountBtnInfo = React.useMemo(() => {
    return {
      btnTxt: "labelRetry",
      callback: () => {
        setShowAccount({ isShow: false });
        setShowResetAccount({ isShow: true });
      },
    };
  }, [setShowAccount, setShowResetAccount]);

  const closeBtnInfo = React.useMemo(() => {
    return {
      btnTxt: "labelClose",
      callback: (e: any) => {
        setShouldShow(false);
        setShowTransfer({ isShow: false });
        setShowWithdraw({ isShow: false });
        setShowAccount({ isShow: false });
        setShowResetAccount({ isShow: false });
        if (onClose) {
          onClose(e);
        }
      },
    };
  }, [
    onClose,
    setShouldShow,
    setShowAccount,
    setShowResetAccount,
    setShowTransfer,
    setShowWithdraw,
  ]);
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);
  const clearDeposit = React.useCallback(() => {
    clearDepositHash(account.accAddress);
  }, [clearDepositHash, account]);

  const updateDepositStatus = React.useCallback(async () => {
    const chainInfos = store.getState().localStore.chainHashInfos[chainId];
    const { accAddress } = account;
    clearTimeout(nodeTimer.current as NodeJS.Timeout);
    if (
      chainInfos &&
      chainInfos.depositHashes &&
      chainInfos.depositHashes[accAddress] &&
      connectProvides
    ) {
      const depositList = chainInfos.depositHashes[accAddress];
      let flag = false;
      depositList.forEach((txInfo) => {
        if (
          txInfo.status === "pending" &&
          connectProvides?.usedWeb3?.eth?.getTransactionReceipt
        ) {
          connectProvides.usedWeb3.eth
            .getTransactionReceipt(txInfo.hash)
            .then((result) => {
              if (result) {
                updateDepositHash(
                  txInfo.hash,
                  accAddress,
                  result.status ? "success" : "failed"
                );
              }
            });
          flag = true;
        }
      });

      if (flag) {
        let wait = 30000;
        if (
          account.readyState &&
          [AccountStatus.DEPOSITING, AccountStatus.NOT_ACTIVE].includes(
            // @ts-ignore
            account?.readyState
          )
        ) {
          wait = 10000;
        }
        nodeTimer.current = setTimeout(() => {
          updateDepositStatus();
        }, wait);
      }
      if (
        [AccountStatus.DEPOSITING, AccountStatus.NOT_ACTIVE].includes(
          // @ts-ignore
          account?.readyState
        )
      ) {
        updateWalletLayer2();
      }
    }
  }, [account, chainId, updateDepositHash, updateWalletLayer2, nodeTimer]);
  React.useEffect(() => {
    if (
      chainInfos?.depositHashes &&
      chainInfos?.depositHashes[account.accAddress]
    ) {
      updateDepositStatus();
    }
    return () => {
      clearTimeout(nodeTimer.current as NodeJS.Timeout);
    };
  }, [account.accAddress, chainInfos?.depositHashes]);
  const { setShowLayerSwapNotice } = useOpenModals();

  const addAssetList: AddAssetItem[] = React.useMemo(
    () => [
      {
        ...AddAssetList.BuyWithCard,
        handleSelect: (_e) => {
          setShowAccount({ isShow: true, step: AccountStep.PayWithCard });
        },
      },
      {
        ...AddAssetList.FromMyL1,
        handleSelect: () => {
          setShowAccount({ isShow: false });
          setShowDeposit({ isShow: true, symbol: isShowAccount?.info?.symbol });
        },
      },
      {
        ...AddAssetList.FromOtherL1,
        handleSelect: () => {
          window.open(
            Bridge +
              `?l2account=${account.accAddress}&token=${
                isShowAccount?.info?.symbol ?? ""
              }&__trace_isSharedBy=loopringExchange`
          );
          window.opener = null;
        },
      },
      {
        ...AddAssetList.FromOtherL2,
        handleSelect: () => {
          setShowAccount({
            isShow: true,
            step: AccountStep.QRCode,
            info: { backTo: AccountStep.AddAssetGateway },
          });
        },
      },
      {
        ...AddAssetList.FromExchange,
        handleSelect: () => {
          setShowLayerSwapNotice({ isShow: true });
        },
      },
    ],
    [
      account.accAddress,
      isShowAccount?.info?.symbol,
      setShowAccount,
      setShowDeposit,
    ]
  );
  const sendAssetList: SendAssetItem[] = React.useMemo(
    () => [
      {
        ...SendAssetList.SendAssetToL2,
        handleSelect: (_e) => {
          setShowAccount({ isShow: false });
          setShowTransfer({
            isShow: true,
            symbol: isShowAccount?.info?.symbol,
          });
        },
      },
      {
        ...SendAssetList.SendAssetToMyL1,
        handleSelect: () => {
          setShowAccount({ isShow: false });
          setShowWithdraw({
            isShow: true,
            info: { isToMyself: true },
            symbol: isShowAccount?.info?.symbol,
          });
        },
      },
      {
        ...SendAssetList.SendAssetToOtherL1,
        handleSelect: () => {
          setShowAccount({ isShow: false });
          setShowWithdraw({
            isShow: true,
            info: { isToMyself: false },
            symbol: isShowAccount?.info?.symbol,
          });
        },
      },
    ],
    [
      isShowAccount?.info?.symbol,
      setShowAccount,
      setShowTransfer,
      setShowWithdraw,
    ]
  );
  const sendNFTAssetList: SendAssetItem[] = React.useMemo(
    () => [
      {
        ...SendNFTAssetList.SendAssetToL2,
        handleSelect: (_e) => {
          setShowAccount({ isShow: false });
          setShowNFTTransfer({
            isShow: true,
          });
        },
      },
      {
        ...SendNFTAssetList.SendAssetToMyL1,
        handleSelect: () => {
          setShowAccount({ isShow: false });
          setShowNFTWithdraw({
            isShow: true,
            info: { isToMyself: true },
          });
        },
      },
      {
        ...SendNFTAssetList.SendAssetToOtherL1,
        handleSelect: () => {
          setShowAccount({
            isShow: false,
          });
          setShowNFTWithdraw({
            isShow: true,
            info: { isToMyself: false },
          });
        },
      },
    ],
    [
      isShowAccount?.info?.symbol,
      setShowAccount,
      setShowTransfer,
      setShowWithdraw,
    ]
  );
  const onBackReceive = React.useCallback(() => {
    setShowAccount({
      isShow: true,
      step: AccountStep.AddAssetGateway,
      info: { ...isShowAccount?.info },
    });
  }, [isShowAccount?.info, setShowAccount]);
  const onBackSend = React.useCallback(() => {
    setShowAccount({
      isShow: true,
      step: AccountStep.SendAssetGateway,
      info: { ...isShowAccount?.info },
    });
  }, [isShowAccount?.info, setShowAccount]);

  const { checkActiveStatusProps } = useCheckActiveStatus<FeeInfo>({
    onDisconnect,
    isDepositing: !!chainInfos?.depositHashes[account?.accAddress]?.length,
    chargeFeeTokenList: activeAccountProps.chargeFeeTokenList as FeeInfo[],
    checkFeeIsEnough: activeAccountCheckFeeIsEnough,
    isFeeNotEnough: activeAccountProps.isFeeNotEnough,
  });

  const accountList = React.useMemo(() => {
    return Object.values({
      [AccountStep.CheckingActive]: {
        view: <CheckActiveStatus {...checkActiveStatusProps} />,
        height: "auto",
      },
      [AccountStep.AddAssetGateway]: {
        view: (
          <AddAsset
            symbol={isShowAccount?.info?.symbol}
            addAssetList={addAssetList}
            allowTrade={allowTrade}
            isNewAccount={depositProps.isNewAccount}
          />
        ),
      },
      [AccountStep.SendAssetGateway]: {
        view: (
          <SendAsset
            isToL1={isShowAccount?.info?.isToL1}
            symbol={isShowAccount?.info?.symbol}
            sendAssetList={sendAssetList}
            allowTrade={allowTrade}
          />
        ),
      },
      [AccountStep.SendNFTGateway]: {
        view: (
          <SendNFTAsset
            nftData={{ ...isShowAccount?.info } as Partial<NFTWholeINFO>}
            sendAssetList={sendNFTAssetList}
            allowTrade={allowTrade}
            isNotAllowToL1={account.isContract1XAddress}
          />
        ),
      },
      [AccountStep.PayWithCard]: {
        view: (
          <VendorMenu
            vendorList={vendorListBuy}
            type={TradeTypes.Buy}
            vendorForce={undefined}
            campaignTagConfig={campaignTagConfig}
          />
        ),
        onBack: onBackReceive,
      },
      [AccountStep.NoAccount]: {
        view: (
          <NoAccount
            // className={
            //   /(guardian)|(depositto)/gi.test(pathname ?? "") ? "guardian" : ""
            // }
            {...{
              goActiveAccount,
              chainInfos,
              // isSupport,
              noButton: isLayer1Only,
              onClose,
              updateDepositHash,
              clearDepositHash: clearDeposit,
              ...account,
              etherscanUrl: rest.etherscanBaseUrl,
              onSwitch,
              onCopy,
              onViewQRCode,
              onDisconnect,
              addressShort,
            }}
          />
        ),
        onQRClick,
        height: isLayer1Only ? "auto" : null,
      },
      [AccountStep.HadAccount]: {
        view: (
          <HadAccount
            // className={
            //   /(guardian)|(depositto)/gi.test(pathname ?? "") ? "guardian" : ""
            // }
            {...{
              ...account,
              clearDepositHash: clearDeposit,
              chainInfos,
              noButton: isLayer1Only,
              onSwitch,
              onCopy,
              onClose,
              etherscanUrl: rest.etherscanBaseUrl,
              onViewQRCode,
              onDisconnect,
              addressShort,
              etherscanLink:
                rest.etherscanBaseUrl + "address/" + account.accAddress,
              mainBtn:
                account.readyState === AccountStatus.ACTIVATED
                  ? lockBtn
                  : unlockBtn,
            }}
          />
        ),
        onQRClick,
        height: isLayer1Only ? "auto" : null,
      },
      [AccountStep.QRCode]: {
        view: (
          <QRAddressPanel
            {...{
              ...rest,
              account,
              ...account,
              isNewAccount: depositProps.isNewAccount,
              isForL2Send:
                isShowAccount.info?.backTo === AccountStep.AddAssetGateway,
              etherscanUrl: rest.etherscanBaseUrl,
              t,
            }}
          />
        ),
        onBack: onQRBack,
        noClose: true,
      },
      [AccountStep.Deposit_Sign_WaitForRefer]: {
        view: (
          <Deposit_Sign_WaitForRefer
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Deposit_Approve_WaitForAuth]: {
        view: (
          <Deposit_Approve_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Deposit_Approve_Denied]: {
        view: (
          <Deposit_Approve_Denied
            btnInfo={backToDepositBtnInfo}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
        onBack: !depositProps.isAllowInputToAddress
          ? () => {
              setShowAccount({ isShow: false });
              setShowDeposit({ isShow: true });
            }
          : undefined,
      },
      [AccountStep.Deposit_Approve_Submit]: {
        view: (
          <Deposit_Approve_Submit
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
        onBack: !depositProps.isAllowInputToAddress
          ? () => {
              setShowAccount({ isShow: false });
              setShowDeposit({ isShow: true });
            }
          : undefined,
      },
      [AccountStep.Deposit_WaitForAuth]: {
        view: (
          <Deposit_WaitForAuth
            symbol={depositProps.tradeData.belong}
            value={depositProps.tradeData.tradeValue}
            chainInfos={chainInfos}
            updateDepositHash={updateDepositHash}
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
        onBack: !depositProps.isAllowInputToAddress
          ? () => {
              setShowAccount({ isShow: false });
              setShowDeposit({ isShow: true });
            }
          : undefined,
      },
      [AccountStep.Deposit_Denied]: {
        view: (
          <Deposit_Denied
            btnInfo={backToDepositBtnInfo}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
        onBack: !depositProps.isAllowInputToAddress
          ? () => {
              setShowAccount({ isShow: false });
              setShowDeposit({ isShow: true });
            }
          : undefined,
      },
      [AccountStep.Deposit_Failed]: {
        view: (
          <Deposit_Failed
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
        onBack: !depositProps.isAllowInputToAddress
          ? () => {
              setShowAccount({ isShow: false });
              setShowDeposit({ isShow: true });
            }
          : undefined,
      },
      [AccountStep.Deposit_Submit]: {
        view: (
          <Deposit_Submit
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTDeposit_Approve_WaitForAuth]: {
        view: (
          <NFTDeposit_Approve_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              ...nftDepositValue,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTDeposit_Approve_Denied]: {
        view: (
          <NFTDeposit_Approve_Denied
            btnInfo={backToNFTDepositBtnInfo}
            {...{
              ...rest,
              account,
              ...nftDepositValue,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false });
        },
      },
      [AccountStep.NFTDeposit_Approve_Submit]: {
        view: (
          <NFTDeposit_Approve_Submit
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              ...nftDepositValue,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false });
        },
      },
      [AccountStep.NFTDeposit_WaitForAuth]: {
        view: (
          <NFTDeposit_WaitForAuth
            symbol={nftDepositValue.name}
            value={nftDepositValue.tradeValue}
            chainInfos={chainInfos}
            updateDepositHash={updateDepositHash}
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              ...nftDepositValue,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false });
        },
      },
      [AccountStep.NFTDeposit_Denied]: {
        view: (
          <NFTDeposit_Denied
            btnInfo={backToNFTDepositBtnInfo}
            {...{
              ...rest,
              account,
              ...nftDepositValue,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false });
        },
      },
      [AccountStep.NFTDeposit_Failed]: {
        view: (
          <NFTDeposit_Failed
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              ...nftDepositValue,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false });
        },
      },
      [AccountStep.NFTDeposit_Submit]: {
        view: (
          <NFTDeposit_Submit
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              ...nftDepositValue,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTMint_WaitForAuth]: {
        view: (
          <NFTMint_WaitForAuth
            symbol={isShowAccount.info?.name}
            value={isShowAccount.info?.value}
            chainInfos={chainInfos}
            updateDepositHash={updateDepositHash}
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false });
        },
      },
      [AccountStep.NFTMint_Denied]: {
        view: (
          <NFTMint_Denied
            symbol={isShowAccount.info?.name}
            value={isShowAccount.info?.value}
            btnInfo={backToMintBtnInfo}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false });
        },
      },
      [AccountStep.NFTMint_First_Method_Denied]: {
        view: (
          <NFTMint_First_Method_Denied
            btnInfo={{
              btnTxt: "labelTryAnother",
              callback: () => {
                if (isShowAccount.info?.isAdvanceMint) {
                  nftMintAdvanceRetryBtn(true);
                } else {
                  mintService.signatureMint(true);
                }
              },
            }}
            symbol={isShowAccount.info?.name}
            value={isShowAccount.info?.value}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTMint_In_Progress]: {
        view: (
          <NFTMint_In_Progress
            symbol={isShowAccount.info?.name}
            value={isShowAccount.info?.value}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTMint_Failed]: {
        view: (
          <NFTMint_Failed
            btnInfo={closeBtnInfo}
            symbol={isShowAccount.info?.name}
            value={isShowAccount.info?.value}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false });
        },
      },
      [AccountStep.NFTMint_Success]: {
        view: (
          <NFTMint_Success
            btnInfo={closeBtnInfo}
            symbol={isShowAccount.info?.name}
            value={isShowAccount.info?.value}
            {...{
              t,
              ...rest,
              account,
              link: isShowAccount?.info?.hash
                ? {
                    name: "Txn Hash",
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
            }}
          />
        ),
      },
      [AccountStep.NFTDeploy_WaitForAuth]: {
        view: (
          <NFTDeploy_WaitForAuth
            symbol={nftDeployValue.name}
            value={nftDeployValue.tradeValue}
            chainInfos={chainInfos}
            updateDepositHash={updateDepositHash}
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              ...nftDeployValue,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false });
        },
      },
      [AccountStep.NFTDeploy_Denied]: {
        view: (
          <NFTDeploy_Denied
            btnInfo={backToDeployBtnInfo}
            {...{
              ...rest,
              account,
              ...nftDeployValue,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false });
        },
      },
      [AccountStep.NFTDeploy_First_Method_Denied]: {
        view: (
          <NFTDeploy_First_Method_Denied
            btnInfo={{
              btnTxt: "labelTryAnother",
              callback: () => {
                nftDeployProps.onNFTDeployClick(nftDeployValue as any, false);
              },
            }}
            {...{
              ...rest,
              account,
              ...nftDeployValue,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTDeploy_In_Progress]: {
        view: (
          <NFTDeploy_In_Progress
            {...{
              ...rest,
              account,
              ...nftDeployValue,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTDeploy_Failed]: {
        view: (
          <NFTDeploy_Failed
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              ...nftDeployValue,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false });
        },
      },
      [AccountStep.NFTDeploy_Submit]: {
        view: (
          <NFTDeploy_Submit
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              ...nftDeployValue,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false });
        },
      },

      [AccountStep.ForceWithdraw_WaitForAuth]: {
        view: (
          <ForceWithdraw_WaitForAuth
            symbol={nftDeployValue.name}
            value={nftDeployValue.tradeValue}
            chainInfos={chainInfos}
            updateDepositHash={updateDepositHash}
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              ...nftDeployValue,
              t,
            }}
          />
        ),
        // onBack: () => {
        //   setShowAccount({ isShow: false });
        // },
      },
      [AccountStep.ForceWithdraw_Denied]: {
        view: (
          <ForceWithdraw_Denied
            btnInfo={{
              btnTxt: "labelRetry",
              callback: () => {
                forceWithdrawRetry();
              },
            }}
            {...{
              ...rest,
              account,
              ...forceWithdrawValue,
              t,
            }}
          />
        ),
        // onBack: () => {
        //   setShowAccount({ isShow: false });
        // },
      },
      [AccountStep.ForceWithdraw_First_Method_Denied]: {
        view: (
          <ForceWithdraw_First_Method_Denied
            btnInfo={{
              btnTxt: "labelTryAnother",
              callback: () => {
                // setShowAccount({ isShow: false });
                forceWithdrawRetry(true);
              },
            }}
            {...{
              ...rest,
              account,
              ...forceWithdrawValue,
              t,
            }}
          />
        ),
      },
      [AccountStep.ForceWithdraw_In_Progress]: {
        view: (
          <ForceWithdraw_In_Progress
            {...{
              ...rest,
              account,
              ...forceWithdrawValue,
              t,
            }}
          />
        ),
      },
      [AccountStep.ForceWithdraw_Failed]: {
        view: (
          <ForceWithdraw_Failed
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              ...forceWithdrawValue,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
        // onBack: () => {
        //   setShowAccount({ isShow: false });
        // },
      },
      [AccountStep.ForceWithdraw_Submit]: {
        view: (
          <ForceWithdraw_Submit
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              ...forceWithdrawValue,
              t,
            }}
          />
        ),
        // onBack: () => {
        //   setShowAccount({ isShow: false });
        // },
      },
      // transfer
      [AccountStep.Transfer_WaitForAuth]: {
        view: (
          <Transfer_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_First_Method_Denied]: {
        view: (
          <Transfer_First_Method_Denied
            btnInfo={{
              btnTxt: "labelTryAnother",
              callback: () => {
                transferProps.onTransferClick(transferValue as any, false);
              },
            }}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_User_Denied]: {
        view: (
          <Transfer_User_Denied
            btnInfo={backToTransferBtnInfo}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_In_Progress]: {
        view: (
          <Transfer_In_Progress
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_Success]: {
        view: (
          <Transfer_Success
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              link: isShowAccount?.info?.hash
                ? {
                    name: "Txn Hash",
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_Failed]: {
        view: (
          <Transfer_Failed
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
      },

      // transferRamp
      [AccountStep.Transfer_RAMP_WaitForAuth]: {
        view: (
          <Transfer_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_RAMP_First_Method_Denied]: {
        view: (
          <Transfer_First_Method_Denied
            btnInfo={{
              btnTxt: "labelTryAnother",
              callback: () => {
                const { __request__ } =
                  store.getState()._router_modalData.transferRampValue;
                if (__request__) {
                  processRequestRampTransfer(__request__, false);
                } else {
                  setShowAccount({
                    isShow: true,
                    step: AccountStep.Transfer_RAMP_Failed,
                  });
                }
              },
            }}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_RAMP_User_Denied]: {
        view: (
          <Transfer_User_Denied
            btnInfo={{
              btnTxt: "labelRetry",
              callback: () => {
                const { __request__ } =
                  store.getState()._router_modalData.transferRampValue;
                if (__request__) {
                  processRequestRampTransfer(__request__, true);
                } else {
                  setShowAccount({
                    isShow: true,
                    step: AccountStep.Transfer_RAMP_Failed,
                  });
                }
              },
            }}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_RAMP_In_Progress]: {
        view: (
          <Transfer_In_Progress
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_RAMP_Success]: {
        view: (
          <Transfer_Success
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              link: isShowAccount?.info?.hash
                ? {
                    name: "Txn Hash",
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_RAMP_Failed]: {
        view: (
          <Transfer_Failed
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
      },

      // withdraw
      [AccountStep.Withdraw_WaitForAuth]: {
        view: (
          <Withdraw_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Withdraw_First_Method_Denied]: {
        view: (
          <Withdraw_First_Method_Denied
            btnInfo={{
              btnTxt: "labelTryAnother",
              callback: () => {
                withdrawProps.onWithdrawClick(withdrawValue as any, false);
              },
            }}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Withdraw_User_Denied]: {
        view: (
          <Withdraw_User_Denied
            btnInfo={backToWithdrawBtnInfo}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Withdraw_In_Progress]: {
        view: (
          <Withdraw_In_Progress
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Withdraw_Success]: {
        view: (
          <Withdraw_Success
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              link: isShowAccount?.info?.hash
                ? {
                    name: "Txn Hash",
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
              t,
            }}
          />
        ),
      },
      [AccountStep.Withdraw_Failed]: {
        view: (
          <Withdraw_Failed
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
      },

      // transfer
      [AccountStep.NFTTransfer_WaitForAuth]: {
        view: (
          <NFTTransfer_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTTransfer_First_Method_Denied]: {
        view: (
          <NFTTransfer_First_Method_Denied
            btnInfo={{
              btnTxt: "labelTryAnother",
              callback: () => {
                nftTransferProps.onTransferClick(
                  nftTransferValue as any,
                  false
                );
              },
            }}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTTransfer_User_Denied]: {
        view: (
          <NFTTransfer_User_Denied
            btnInfo={{
              btnTxt: "labelRetry",
              callback: () => {
                nftTransferProps.onTransferClick(nftTransferValue as any);
              },
            }}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTTransfer_In_Progress]: {
        view: (
          <NFTTransfer_In_Progress
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTTransfer_Success]: {
        view: (
          <NFTTransfer_Success
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              link: isShowAccount?.info?.hash
                ? {
                    name: "Txn Hash",
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTTransfer_Failed]: {
        view: (
          <NFTTransfer_Failed
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
      },

      // withdraw
      [AccountStep.NFTWithdraw_WaitForAuth]: {
        view: (
          <NFTWithdraw_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTWithdraw_First_Method_Denied]: {
        view: (
          <NFTWithdraw_First_Method_Denied
            btnInfo={{
              btnTxt: "labelTryAnother",
              callback: () => {
                nftWithdrawProps.onWithdrawClick(
                  nftWithdrawValue as any,
                  false
                );
              },
            }}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTWithdraw_User_Denied]: {
        view: (
          <NFTWithdraw_User_Denied
            btnInfo={{
              btnTxt: "labelRetry",
              callback: () => {
                nftWithdrawProps.onWithdrawClick(nftWithdrawValue as any);
              },
            }}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTWithdraw_In_Progress]: {
        view: (
          <NFTWithdraw_In_Progress
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTWithdraw_Success]: {
        view: (
          <NFTWithdraw_Success
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              link: isShowAccount?.info?.hash
                ? {
                    name: "Txn Hash",
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTWithdraw_Failed]: {
        view: (
          <NFTWithdraw_Failed
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
      },

      //create account

      [AccountStep.CreateAccount_Approve_WaitForAuth]: {
        view: (
          <CreateAccount_Approve_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_Approve_Denied]: {
        view: (
          <CreateAccount_Approve_Denied
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_Approve_Submit]: {
        view: (
          <CreateAccount_Approve_Submit
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_WaitForAuth]: {
        view: (
          <CreateAccount_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_Denied]: {
        view: (
          <CreateAccount_Denied
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_Failed]: {
        view: (
          <CreateAccount_Failed
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_Submit]: {
        view: (
          <CreateAccount_Submit
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },

      //update account

      [AccountStep.UpdateAccount]: {
        view: (
          <UpdateAccount
            {...{
              ...account,
              clearDepositHash: clearDeposit,
              chainInfos,
              etherscanUrl: rest.etherscanBaseUrl,
              onSwitch,
              onCopy,
              onViewQRCode,
              onDisconnect,
              addressShort,
            }}
            goUpdateAccount={() => {
              setShowAccount({ isShow: false });
              setShowActiveAccount({ isShow: true });
              // goUpdateAccount({});
            }}
            {...{ ...rest, account, t }}
          />
        ),
        onQRClick,
      },
      [AccountStep.UpdateAccount_Approve_WaitForAuth]: {
        view: (
          <UpdateAccount_Approve_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.UpdateAccount_First_Method_Denied]: {
        view: (
          <UpdateAccount_First_Method_Denied
            btnInfo={{
              btnTxt: t("labelTryAnother"),
              callback: (_e?: any) => {
                goUpdateAccount({ isFirstTime: false });
              },
            }}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
        onBack: () => {
          backToUpdateAccountBtnInfo.callback();
        },
      },
      [AccountStep.UpdateAccount_User_Denied]: {
        view: (
          <UpdateAccount_User_Denied
            btnInfo={backToUpdateAccountBtnInfo}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.UpdateAccount_Success]: {
        view: (
          <UpdateAccount_Success
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              link: isShowAccount?.info?.hash
                ? {
                    name: "Txn Hash",
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
              t,
            }}
          />
        ),
      },
      [AccountStep.UpdateAccount_Success]: {
        view: (
          <UpdateAccount_Success
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              link: isShowAccount?.info?.hash
                ? {
                    name: "Txn Hash",
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
              t,
            }}
          />
        ),
      },
      [AccountStep.UpdateAccount_Failed]: {
        view: (
          <UpdateAccount_Failed
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
      },

      [AccountStep.UnlockAccount_WaitForAuth]: {
        view: (
          <UnlockAccount_WaitForAuth
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.UnlockAccount_User_Denied]: {
        view: (
          <UnlockAccount_User_Denied
            btnInfo={backToUnlockAccountBtnInfo}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.UnlockAccount_Success]: {
        view: (
          <UnlockAccount_Success
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.UnlockAccount_Failed]: {
        view: (
          <UnlockAccount_Failed
            btnInfo={closeBtnInfo}
            resetAccount={() => {
              if (walletServices)
                if (isShowAccount.info && isShowAccount.info.walletType) {
                  const walletType = isShowAccount.info
                    .walletType as sdk.WalletType;
                  if (
                    walletType.isContract ||
                    walletType.isInCounterFactualStatus
                  ) {
                    return;
                  }
                }
              setShowAccount({ isShow: false });
              setShowActiveAccount({ isShow: true });
            }}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              walletType: isShowAccount?.info?.walletType,
              t,
            }}
          />
        ),
      },

      [AccountStep.ResetAccount_Approve_WaitForAuth]: {
        view: (
          <UpdateAccount_Approve_WaitForAuth
            patch={{ isReset: true }}
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.ResetAccount_First_Method_Denied]: {
        view: (
          <UpdateAccount_First_Method_Denied
            patch={{ isReset: true }}
            btnInfo={{
              btnTxt: t("labelTryAnother"),
              callback: (_e?: any) => {
                goUpdateAccount({ isReset: true, isFirstTime: false });
              },
            }}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
        onBack: () => {
          backToResetAccountBtnInfo.callback();
        },
      },
      [AccountStep.ResetAccount_User_Denied]: {
        view: (
          <UpdateAccount_User_Denied
            patch={{ isReset: true }}
            btnInfo={backToResetAccountBtnInfo}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.ResetAccount_Success]: {
        view: (
          <UpdateAccount_Success
            patch={{ isReset: true }}
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              link: isShowAccount?.info?.hash
                ? {
                    name: "Txn Hash",
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
              t,
            }}
          />
        ),
      },
      [AccountStep.ResetAccount_Failed]: {
        view: (
          <UpdateAccount_Failed
            patch={{ isReset: true }}
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
      },

      [AccountStep.ExportAccount_Approve_WaitForAuth]: {
        view: (
          <ExportAccount_Approve_WaitForAuth
            patch={{ isReset: true }}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.ExportAccount_User_Denied]: {
        view: (
          <ExportAccount_User_Denied
            patch={{ isReset: true }}
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.ExportAccount_Success]: {
        view: (
          <ExportAccount_Success
            patch={{ isReset: true }}
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.ExportAccount_Failed]: {
        view: (
          <ExportAccount_Failed
            patch={{ isReset: true }}
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
      },
    });
  }, [
    checkActiveStatusProps,
    isShowAccount.info,
    isShowAccount.error,
    addAssetList,
    allowTrade,
    depositProps.isNewAccount,
    depositProps.isAllowInputToAddress,
    depositProps.tradeData.belong,
    depositProps.tradeData.tradeValue,
    sendAssetList,
    vendorListBuy,
    onBackReceive,
    chainInfos,
    isLayer1Only,
    onClose,
    updateDepositHash,
    clearDeposit,
    account,
    rest,
    onSwitch,
    onCopy,
    onViewQRCode,
    onDisconnect,
    addressShort,
    onQRClick,
    lockBtn,
    unlockBtn,
    t,
    onQRBack,
    forceWithdrawRetry,
    backToDepositBtnInfo,
    closeBtnInfo,
    nftDepositValue,
    backToNFTDepositBtnInfo,
    backToMintBtnInfo,
    nftDeployValue,
    backToDeployBtnInfo,
    backToTransferBtnInfo,
    backToWithdrawBtnInfo,
    backToUpdateAccountBtnInfo,
    backToUnlockAccountBtnInfo,
    backToResetAccountBtnInfo,
    setShowAccount,
    setShowDeposit,
    nftMintAdvanceRetryBtn,
    nftDeployProps,
    transferProps,
    transferValue,
    withdrawProps,
    withdrawValue,
    nftTransferProps,
    nftTransferValue,
    nftWithdrawProps,
    nftWithdrawValue,
    setShowActiveAccount,
    goUpdateAccount,
  ]);

  const currentModal = accountList[isShowAccount.step];

  return {
    nftDeployProps,
    nftTransferProps,
    nftWithdrawProps,
    transferProps,
    withdrawProps,
    depositProps,
    resetProps,
    collectionAdvanceProps,
    activeAccountProps,
    exportAccountProps,
    exportAccountAlertText,
    exportAccountToastOpen,
    setExportAccountToastOpen,
    copyToastOpen,
    setCopyToastOpen,
    setCollectionToastOpen,
    openQRCode,
    setOpenQRCode,
    isShowAccount,
    account,
    closeBtnInfo,
    accountList,
    currentModal,
    onBackReceive,
    onBackSend,
    collectionToastOpen,
    collectionToastClose,
    // dualToastOpen,
  };
}
