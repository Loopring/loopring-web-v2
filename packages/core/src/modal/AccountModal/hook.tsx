/* eslint-disable react/jsx-pascal-case */
import {
  AccountStep,
  Button,
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
  Deposit_Submit,
  Deposit_WaitForAuth,
  NFTDeposit_Approve_Denied,
  NFTDeposit_Approve_Submit,
  NFTDeposit_Approve_WaitForAuth,
  NFTDeposit_Denied,
  NFTDeposit_Failed,
  NFTDeposit_Submit,
  NFTDeposit_WaitForAuth,
  ExportAccount_Approve_WaitForAuth,
  ExportAccount_Failed,
  ExportAccount_Success,
  ExportAccount_User_Denied,
  HadAccount,
  NoAccount,
  QRAddressPanel,
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
  Transfer_Failed,
  Transfer_First_Method_Denied,
  Transfer_In_Progress,
  Transfer_Success,
  Transfer_User_Denied,
  Transfer_WaitForAuth,
  Withdraw_Failed,
  Withdraw_First_Method_Denied,
  Withdraw_In_Progress,
  Withdraw_Success,
  Withdraw_User_Denied,
  Withdraw_WaitForAuth,
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
  NFTMint_WaitForAuth,
  NFTMint_Denied,
  NFTMint_Failed,
  NFTMint_Success,
  NFTDeploy_WaitForAuth,
  NFTDeploy_Denied,
  NFTDeploy_Failed,
  NFTDeploy_Submit,
  NFTDeploy_First_Method_Denied,
  NFTDeploy_In_Progress,
  NFTMint_First_Method_Denied,
  NFTMint_In_Progress,
  Deposit_Sign_WaitForRefer,
  VendorMenu,
  AddAsset,
  AddAssetItem,
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
} from "@loopring-web/common-resources";
import {
  useAccount,
  lockAccount,
  unlockAccount,
  useDeposit,
  useTransfer,
  useWithdraw,
  useUpdateAccount,
  useReset,
  useExportAccount,
  useSystem,
  isContract,
  useNFTWithdraw,
  useNFTTransfer,
  onchainHashInfo,
  LAST_STEP,
  useActiveAccount,
  useWalletLayer2,
  useVendor,
  useModalData,
  useNFTDeploy,
  store,
  mintService,
} from "@loopring-web/core";

import { WalletType } from "@loopring-web/loopring-sdk";

export function useAccountModalForUI({
  t,
  onClose,
  isLayer1Only = false,
  ...rest
}: {
  t: any;
  etherscanBaseUrl: string;
  isLayer1Only?: boolean;
  account: Account;
  onClose?: any;
}) {
  const { goUpdateAccount } = useUpdateAccount();
  const { chainInfos, updateDepositHash, clearDepositHash } =
    onchainHashInfo.useOnChainInfo();
  const { updateWalletLayer2 } = useWalletLayer2();

  const {
    modals: { isShowAccount },
    setShowConnect,
    setShowAccount,
    setShowDeposit,
    setShowNFTMint,
    setShowTransfer,
    setShowWithdraw,
    setShowResetAccount,
    setShowActiveAccount,
  } = useOpenModals();
  rest = { ...rest, ...isShowAccount.info };
  const {
    lastStep,
    nftMintValue,
    nftDepositValue,
    nftTransferValue,
    nftWithdrawValue,
    nftDeployValue,
    transferValue,
    withdrawValue,
  } = useModalData();

  const { chainId, allowTrade } = useSystem();

  const { account, addressShort, shouldShow, setShouldShow } = useAccount();

  const {
    exportAccountAlertText,
    exportAccountToastOpen,
    setExportAccountToastOpen,
  } = useExportAccount();
  const vendorProps = useVendor();
  const { depositProps } = useDeposit();
  // const { nftMintProps } = useNFTMint();
  const { withdrawProps } = useWithdraw();
  const { transferProps } = useTransfer();
  const { nftWithdrawProps } = useNFTWithdraw({});
  const { nftTransferProps } = useNFTTransfer({});
  const { nftDeployProps } = useNFTDeploy({});
  const { resetProps } = useReset();
  const { activeAccountProps } = useActiveAccount();
  // const { nftDepositProps } = useNFTDeposit();
  const { exportAccountProps } = useExportAccount();

  const [openQRCode, setOpenQRCode] = useState(false);

  const [copyToastOpen, setCopyToastOpen] = useState(false);

  const [isSupport, setIsSupport] = React.useState<boolean>(false);

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

  const goDeposit = React.useCallback(() => {
    setShowAccount({ isShow: false });
    if (isLayer1Only) {
      setShowDeposit({ isShow: true });
    }
  }, [setShowAccount, setShowDeposit, isLayer1Only]);

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

  const onBack = React.useCallback(() => {
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
  }, [account.readyState, setShowAccount]);

  const backToDepositBtnInfo = React.useMemo(() => {
    return {
      btnTxt: "labelRetry",
      callback: goDeposit,
    };
  }, [goDeposit]);

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
      },
    };
  }, [setShowAccount]);

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
        if (lastStep === LAST_STEP.transfer) {
          setShowAccount({ isShow: false });
          setShowTransfer({ isShow: true });
        } else {
          setShowAccount({ isShow: false });
        }
      },
    };
  }, [lastStep, setShowAccount, setShowTransfer]);

  const backToWithdrawBtnInfo = React.useMemo(() => {
    return {
      btnTxt: "labelRetry",
      callback: () => {
        if (lastStep === LAST_STEP.withdraw) {
          setShowAccount({ isShow: false });
          setShowWithdraw({ isShow: true });
        } else {
          setShowAccount({ isShow: false });
        }
      },
    };
  }, [lastStep, setShowAccount, setShowWithdraw]);

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
        setShowAccount({ isShow: true, step: AccountStep.UpdateAccount });
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
  const addAssetList: AddAssetItem[] = [
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
        setShowDeposit({ isShow: true });
      },
    },
    {
      ...AddAssetList.FromOtherL1,
      handleSelect: () => {
        window.open(
          Bridge +
            `?owner=${
              account.accountId && account.accountId !== -1
                ? account.accountId
                : account.accAddress
            }`
        );
        window.opener = null;
      },
    },
    {
      ...AddAssetList.FromOtherL2,
      handleSelect: () => {
        setShowAccount({ isShow: true, step: AccountStep.QRCode });
      },
    },
    {
      ...AddAssetList.FromExchange,
      handleSelect: () => {
        window.open(`https://www.layerswap.io/?destNetwork=loopring_mainnet`);
        window.opener = null;
      },
    },
  ];
  const isSupportCallback = React.useCallback(async () => {
    const is_Contract = await isContract(
      connectProvides.usedWeb3,
      account.accAddress
    );
    setIsSupport(!is_Contract);
    // myLog("isSupportCallback", account.accAddress, !is_Contract);
  }, [account]);

  React.useEffect(() => {
    if (connectProvides && connectProvides.usedWeb3 && account.accAddress) {
      isSupportCallback();
    }
  }, [account.accAddress, isSupportCallback]);
  const accountList = React.useMemo(() => {
    return Object.values({
      [AccountStep.AddAssetGateway]: {
        view: <AddAsset addAssetList={addAssetList} allowTrade={allowTrade} />,
      },
      [AccountStep.PayWithCard]: {
        view: <VendorMenu {...{ ...vendorProps }} />,
      },
      [AccountStep.NoAccount]: {
        view: (
          <NoAccount
            // className={
            //   /(guardian)|(depositto)/gi.test(pathname ?? "") ? "guardian" : ""
            // }
            {...{
              goDeposit,
              chainInfos,
              isSupport,
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
              etherscanUrl: rest.etherscanBaseUrl,
              t,
            }}
          />
        ),
        onBack,
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
        onBack: goDeposit,
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
        onBack: () => {
          setShowAccount({ isShow: false });
          setShowDeposit({ isShow: true });
          // setShowAccount({isShow: true, step: AccountStep.Deposit});
        },
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
        onBack: () => {
          setShowAccount({ isShow: false });
          setShowDeposit({ isShow: true });
          // setShowAccount({isShow: true, step: AccountStep.Deposit});
        },
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
        onBack: () => {
          setShowAccount({ isShow: false });
          setShowDeposit({ isShow: true });
          // setShowAccount({isShow: true, step: AccountStep.Deposit});
        },
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
        onBack: () => {
          setShowAccount({ isShow: false });
          setShowDeposit({ isShow: true });
          // setShowAccount({isShow: true, step: AccountStep.Deposit});
        },
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
        onBack: () => {
          setShowAccount({ isShow: false });
          setShowDeposit({ isShow: true });
          // setShowAccount({isShow: true, step: AccountStep.Deposit});
        },
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
          setShowDeposit({ isShow: true });
          // setShowAccount({isShow: true, step: AccountStep.Deposit});
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
          setShowDeposit({ isShow: true });
          // setShowAccount({isShow: true, step: AccountStep.Deposit});
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
          setShowDeposit({ isShow: true });
          // setShowAccount({isShow: true, step: AccountStep.Deposit});
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
          setShowDeposit({ isShow: true });
          // setShowAccount({isShow: true, step: AccountStep.Deposit});
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
          setShowDeposit({ isShow: true });
          // setShowAccount({isShow: true, step: AccountStep.Deposit});
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
        onBack: () => {
          setShowAccount({ isShow: false });
          setShowDeposit({ isShow: true });
          // setShowAccount({isShow: true, step: AccountStep.Deposit});
        },
      },

      [AccountStep.NFTMint_WaitForAuth]: {
        view: (
          <NFTMint_WaitForAuth
            symbol={nftMintValue?.nftMETA?.name}
            value={nftMintValue?.mintData?.tradeValue}
            chainInfos={chainInfos}
            updateDepositHash={updateDepositHash}
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              ...nftMintValue.mintData,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false });
          setShowNFTMint({ isShow: true });
          // setShowAccount({isShow: true, step: AccountStep.Deposit});
        },
      },
      [AccountStep.NFTMint_Denied]: {
        view: (
          <NFTMint_Denied
            btnInfo={backToMintBtnInfo}
            {...{
              ...rest,
              account,
              ...nftMintValue,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false });
          setShowNFTMint({ isShow: true });
          // setShowAccount({isShow: true, step: AccountStep.Deposit});
        },
      },
      [AccountStep.NFTMint_First_Method_Denied]: {
        view: (
          <NFTMint_First_Method_Denied
            btnInfo={{
              btnTxt: "labelTryAnother",
              callback: () => {
                mintService.signatureMint(true);
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
      [AccountStep.NFTMint_In_Progress]: {
        view: (
          <NFTMint_In_Progress
            {...{
              ...rest,
              account,
              ...nftDeployValue,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTMint_Failed]: {
        view: (
          <NFTMint_Failed
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              account,
              ...nftMintValue,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false });
          setShowNFTMint({ isShow: true });
          // setShowAccount({isShow: true, step: AccountStep.Deposit});
        },
      },
      [AccountStep.NFTMint_Success]: {
        view: (
          <NFTMint_Success
            btnInfo={closeBtnInfo}
            {...{
              t,
              ...rest,
              account,
              ...nftMintValue,
              link: isShowAccount?.info?.hash
                ? {
                    name: "Txn Hash",
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false });
          setShowNFTMint({ isShow: true });
          // setShowAccount({isShow: true, step: AccountStep.Deposit});
        },
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
          // setShowAccount({isShow: true, step: AccountStep.Deposit});
        },
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
            btnInfo={backToTransferBtnInfo}
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
            btnInfo={backToWithdrawBtnInfo}
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
                    .walletType as WalletType;
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
    goDeposit,
    chainInfos,
    isSupport,
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
    onBack,
    backToDepositBtnInfo,
    closeBtnInfo,
    depositProps.tradeData.belong,
    depositProps.tradeData.tradeValue,
    isShowAccount.info,
    isShowAccount.error,
    nftDepositValue,
    backToNFTDepositBtnInfo,
    nftMintValue,
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
    setShowNFTMint,
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
    nftTransferProps,
    nftWithdrawProps,
    transferProps,
    withdrawProps,
    depositProps,
    resetProps,
    activeAccountProps,
    exportAccountProps,
    exportAccountAlertText,
    exportAccountToastOpen,
    setExportAccountToastOpen,
    copyToastOpen,
    setCopyToastOpen,
    openQRCode,
    setOpenQRCode,
    isShowAccount,
    account,
    closeBtnInfo,
    accountList,
    currentModal,
    // vendorProps,
  };
}
