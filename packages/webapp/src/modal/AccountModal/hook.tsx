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
  UpdateAccount_Submit,
  UpdateAccount_Success,
  UpdateAccount_User_Denied,
  useOpenModals,
  Withdraw_Failed,
  Withdraw_First_Method_Denied,
  Withdraw_In_Progress,
  Withdraw_Success,
  Withdraw_User_Denied,
  Withdraw_WaitForAuth,
  NFTMint_WaitForAuth,
  NFTMint_Denied,
  NFTMint_Failed,
  NFTMint_Submit,
  NFTDeploy_WaitForAuth,
  NFTDeploy_Denied,
  NFTDeploy_Failed,
  NFTDeploy_Submit,
  NFTDeploy_First_Method_Denied,
  NFTDeploy_In_Progress,
  NFTMint_First_Method_Denied,
  NFTMint_In_Progress,
} from "@loopring-web/component-lib";
import { connectProvides, walletServices } from "@loopring-web/web3-provider";

import React, { useState } from "react";
import { AccountStatus, copyToClipBoard } from "@loopring-web/common-resources";
import { useAccount } from "stores/account";
import { lockAccount } from "services/account/lockAccount";
import { unlockAccount } from "services/account/unlockAccount";
import { useDeposit } from "hooks/useractions/useDeposit";

import { useTransfer } from "hooks/useractions/useTransfer";
import { useWithdraw } from "hooks/useractions/useWithdraw";
import { useGetAssets } from "../../pages/Layer2Page/AssetPanel/hook";
import { useUpdateAccount } from "hooks/useractions/useUpdateAccount";
import { useReset } from "hooks/useractions/useReset";
import { useExportAccount } from "hooks/useractions/useExportAccount";
import { useOnChainInfo } from "stores/localStore/onchainHashInfo";
import store from "../../stores";
import { useSystem } from "../../stores/system";
import { isContract } from "utils/web3_tools";
import { useNFTWithdraw } from "../../hooks/useractions/useNFTWithdraw";
import { useNFTTransfer } from "../../hooks/useractions/useNFTTransfer";
import { useNFTDeposit } from "../../hooks/useractions/useNFTDeposit";
import { LAST_STEP, useModalData } from "../../stores/router";
import { useActiveAccount } from "../../hooks/useractions/useActiveAccount";
import { useNFTMint } from "../../hooks/useractions/useNFTMint";
import { useWalletLayer2 } from "../../stores/walletLayer2";

export function useAccountModalForUI({
  t,
  etherscanBaseUrl,
  onClose,
  rest,
}: {
  t: any;
  etherscanBaseUrl: string;
  rest: any;
  onClose?: any;
}) {
  const { goUpdateAccount } = useUpdateAccount();
  const { chainInfos, updateDepositHash, clearDepositHash } = useOnChainInfo();
  const { updateWalletLayer2 } = useWalletLayer2();
  const {
    modals: { isShowAccount },
    setShowConnect,
    setShowAccount,
    setShowDeposit,
    setShowNFTDeposit,
    setShowNFTMint,
    setShowTransfer,
    setShowWithdraw,
    setShowResetAccount,
    setShowActiveAccount,
  } = useOpenModals();
  const { lastStep, nftMintValue, nftDepositValue, nftDeployValue } =
    useModalData();
  const { chainId } = useSystem();

  const { account, addressShort, shouldShow, setShouldShow } = useAccount();

  const {
    withdrawAlertText,
    withdrawToastOpen,
    setWithdrawToastOpen,
    withdrawProps,
    processRequest,
    lastRequest,
  } = useWithdraw();
  const {
    nftWithdrawAlertText,
    nftWithdrawToastOpen,
    setNFTWithdrawToastOpen,
    nftWithdrawProps,
    processRequestNFT: withdrawProcessRequestNFT,
    lastNFTRequest: withdrawNFTRequest,
  } = useNFTWithdraw({});

  const {
    exportAccountAlertText,
    exportAccountToastOpen,
    setExportAccountToastOpen,
  } = useExportAccount();

  const { depositProps } = useDeposit();
  const { nftDepositProps } = useNFTDeposit();
  const { nftMintProps } = useNFTMint();
  const { assetsRawData } = useGetAssets();

  const {
    transferAlertText,
    transferToastOpen,
    setTransferToastOpen,
    transferProps,
    lastRequest: transferLastRequest,
    processRequest: transferProcessRequest,
  } = useTransfer();
  const {
    nftTransferToastOpen,
    nftTransferAlertText,
    setNFTTransferToastOpen,
    nftTransferProps,
    processRequestNFT: transferProcessRequestNFT,
    lastNFTRequest: transferNFTRequest,
  } = useNFTTransfer({});

  const { resetProps } = useReset();
  const { activeAccountProps } = useActiveAccount();

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
    setShowDeposit({ isShow: true });
  }, [setShowAccount, setShowDeposit]);

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
      case "NO_ACCOUNT":
      case "DEPOSITING":
        setShowAccount({ isShow: true, step: AccountStep.NoAccount });
        break;
      case "LOCKED":
      case "ACTIVATED":
        setShowAccount({ isShow: true, step: AccountStep.HadAccount });
        break;
      default:
        setShowAccount({ isShow: false });
    }
  }, [account.readyState, setShowAccount]);

  const backToDepositBtnInfo = React.useMemo(() => {
    return {
      btnTxt: "labelRetry",
      callback: () => {
        setShowAccount({ isShow: false });
        setShowDeposit({ isShow: true });
        // setShowAccount({isShow: true, step: AccountStep.Deposit});
      },
    };
  }, [setShowAccount, setShowDeposit]);

  const backToNFTDepositBtnInfo = React.useMemo(() => {
    return {
      btnTxt: "labelRetry",
      callback: () => {
        setShowAccount({ isShow: false });
        setShowNFTDeposit({ isShow: true });
        // setShowAccount({isShow: true, step: AccountStep.Deposit});
      },
    };
  }, [setShowAccount, setShowNFTDeposit]);

  const backToMintBtnInfo = React.useMemo(() => {
    return {
      btnTxt: "labelRetry",
      callback: () => {
        setShowAccount({ isShow: false });
        setShowNFTMint({ isShow: true });
        // setShowAccount({isShow: true, step: AccountStep.Deposit});
      },
    };
  }, [setShowAccount, setShowNFTMint]);

  const backToDeployBtnInfo = React.useMemo(() => {
    return {
      btnTxt: "labelRetry",
      callback: () => {
        setShowAccount({ isShow: false });
        // setShowAccount({isShow: true, step: AccountStep.Deposit});
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

  const TryNewTransferAuthBtnInfo = React.useMemo(() => {
    return {
      btnTxt: "labelTryNext",
      callback: () => {
        setShowAccount({
          isShow: true,
          step: AccountStep.Transfer_WaitForAuth,
        });
        transferProcessRequest(transferLastRequest.request, false);
      },
    };
  }, [setShowAccount, transferProcessRequest, transferLastRequest.request]);

  const TryNewWithdrawAuthBtnInfo = React.useMemo(() => {
    return {
      btnTxt: "labelTryNext",
      callback: () => {
        setShowAccount({
          isShow: true,
          step: AccountStep.Withdraw_WaitForAuth,
        });
        processRequest(lastRequest.request, false);
      },
    };
  }, [setShowAccount, processRequest, lastRequest.request]);

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
      if (nodeTimer.current !== -1) {
        clearTimeout(nodeTimer as unknown as NodeJS.Timeout);
      }
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
  }, [account, chainId, updateDepositHash]);
  React.useEffect(() => {
    if (
      chainInfos?.depositHashes &&
      chainInfos?.depositHashes[account.accAddress]
    ) {
      updateDepositStatus();
    }
    return () => {
      clearTimeout(nodeTimer as unknown as NodeJS.Timeout);
    };
  }, [chainInfos?.depositHashes]);

  const isSupportCallback = React.useCallback(async () => {
    const isSupport = await isContract(
      connectProvides.usedWeb3,
      account.accAddress
    );
    setIsSupport(!isSupport);
  }, [account]);

  React.useEffect(() => {
    if (connectProvides && connectProvides.usedWeb3 && account.accAddress) {
      isSupportCallback();
    }
  }, [account.accAddress, isSupportCallback]);

  const accountList = React.useMemo(() => {
    return Object.values({
      [AccountStep.NoAccount]: {
        view: (
          <NoAccount
            {...{
              goDeposit,
              chainInfos,
              isSupport,
              updateDepositHash,
              clearDepositHash: clearDeposit,
              ...account,
              etherscanUrl: etherscanBaseUrl,
              onSwitch,
              onCopy,
              onViewQRCode,
              onDisconnect,
              addressShort,
            }}
          />
        ),
        onQRClick,
      },
      [AccountStep.QRCode]: {
        view: (
          <QRAddressPanel
            {...{
              ...rest,
              ...account,
              etherscanUrl: etherscanBaseUrl,
              t,
            }}
          />
        ),
        onBack,
        noClose: true,
      },
      [AccountStep.HadAccount]: {
        view: (
          <HadAccount
            {...{
              ...account,
              clearDepositHash: clearDeposit,
              chainInfos,
              onSwitch,
              onCopy,
              etherscanUrl: etherscanBaseUrl,
              onViewQRCode,
              onDisconnect,
              addressShort,
              etherscanLink: etherscanBaseUrl + "address/" + account.accAddress,
              mainBtn: account.readyState === "ACTIVATED" ? lockBtn : unlockBtn,
            }}
          />
        ),
        onQRClick,
      },

      [AccountStep.Deposit_Approve_WaitForAuth]: {
        view: (
          <Deposit_Approve_WaitForAuth
            providerName={account.connectName}
            {...{
              ...rest,
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
      [AccountStep.Deposit_Approve_Submit]: {
        view: (
          <Deposit_Approve_Submit
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
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
            providerName={account.connectName}
            {...{
              ...rest,
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
            providerName={account.connectName}
            {...{
              ...rest,
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
            providerName={account.connectName}
            {...{
              ...rest,
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
      [AccountStep.NFTDeposit_Submit]: {
        view: (
          <NFTDeposit_Submit
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
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
            symbol={nftMintValue.name}
            value={nftMintValue.tradeValue}
            chainInfos={chainInfos}
            updateDepositHash={updateDepositHash}
            providerName={account.connectName}
            {...{
              ...rest,
              ...nftMintValue,
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
      [AccountStep.NFTMint_Denied]: {
        view: (
          <NFTMint_Denied
            btnInfo={backToMintBtnInfo}
            {...{
              ...rest,
              ...nftMintValue,
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
      [AccountStep.NFTMint_First_Method_Denied]: {
        view: (
          <NFTMint_First_Method_Denied
            btnInfo={backToMintBtnInfo}
            {...{
              ...rest,
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
              ...nftMintValue,
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
      [AccountStep.NFTMint_Submit]: {
        view: (
          <NFTMint_Submit
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              ...nftMintValue,
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

      [AccountStep.NFTDeploy_WaitForAuth]: {
        view: (
          <NFTDeploy_WaitForAuth
            symbol={nftDeployValue.name}
            value={nftDeployValue.tradeValue}
            chainInfos={chainInfos}
            updateDepositHash={updateDepositHash}
            providerName={account.connectName}
            {...{
              ...rest,
              ...nftDeployValue,
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
      [AccountStep.NFTDeploy_Denied]: {
        view: (
          <NFTDeploy_Denied
            btnInfo={backToDeployBtnInfo}
            {...{
              ...rest,
              ...nftDeployValue,
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
      [AccountStep.NFTDeploy_First_Method_Denied]: {
        view: (
          <NFTDeploy_First_Method_Denied
            btnInfo={backToDeployBtnInfo}
            {...{
              ...rest,
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
              ...nftDeployValue,
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
      [AccountStep.NFTDeploy_Submit]: {
        view: (
          <NFTDeploy_Submit
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              ...nftDeployValue,
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
      // transfer
      [AccountStep.Transfer_WaitForAuth]: {
        view: (
          <Transfer_WaitForAuth
            providerName={account.connectName}
            {...{
              ...rest,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_First_Method_Denied]: {
        view: (
          <Transfer_First_Method_Denied
            btnInfo={TryNewTransferAuthBtnInfo}
            {...{
              ...rest,
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
              t,
            }}
          />
        ),
      },

      // withdraw
      [AccountStep.Withdraw_WaitForAuth]: {
        view: (
          <Withdraw_WaitForAuth
            providerName={account.connectName}
            {...{
              ...rest,
              t,
            }}
          />
        ),
      },
      [AccountStep.Withdraw_First_Method_Denied]: {
        view: (
          <Withdraw_First_Method_Denied
            btnInfo={TryNewWithdrawAuthBtnInfo}
            {...{
              ...rest,
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
              t,
            }}
          />
        ),
      },

      //create account

      [AccountStep.CreateAccount_Approve_WaitForAuth]: {
        view: (
          <CreateAccount_Approve_WaitForAuth
            providerName={account.connectName}
            {...{
              ...rest,
              t,
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_Approve_Denied]: {
        view: (
          <CreateAccount_Approve_Denied
            providerName={account.connectName}
            {...{
              ...rest,
              t,
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_Approve_Submit]: {
        view: (
          <CreateAccount_Approve_Submit
            providerName={account.connectName}
            {...{
              ...rest,
              t,
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_WaitForAuth]: {
        view: (
          <CreateAccount_WaitForAuth
            providerName={account.connectName}
            {...{
              ...rest,
              t,
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_Denied]: {
        view: (
          <CreateAccount_Denied
            providerName={account.connectName}
            {...{
              ...rest,
              t,
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_Failed]: {
        view: (
          <CreateAccount_Failed
            providerName={account.connectName}
            {...{
              ...rest,
              t,
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_Submit]: {
        view: (
          <CreateAccount_Submit
            providerName={account.connectName}
            {...{
              ...rest,
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
              etherscanUrl: etherscanBaseUrl,
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
            {...{ ...rest, t }}
          />
        ),
        onQRClick,
      },
      [AccountStep.UpdateAccount_Approve_WaitForAuth]: {
        view: (
          <UpdateAccount_Approve_WaitForAuth
            providerName={account.connectName}
            {...{
              ...rest,
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
              callback: (e?: any) => {
                goUpdateAccount({ isFirstTime: false });
              },
            }}
            {...{
              ...rest,
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
              t,
            }}
          />
        ),
      },
      [AccountStep.UpdateAccount_Submit]: {
        view: (
          <UpdateAccount_Submit
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
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
              t,
            }}
          />
        ),
      },
      [AccountStep.UnlockAccount_Failed]: {
        view: (
          <UnlockAccount_Failed
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
              t,
            }}
          />
        ),
      },

      [AccountStep.ResetAccount_Approve_WaitForAuth]: {
        view: (
          <UpdateAccount_Approve_WaitForAuth
            patch={{ isReset: true }}
            providerName={account.connectName}
            {...{
              ...rest,
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
              callback: (e?: any) => {
                goUpdateAccount({ isReset: true, isFirstTime: false });
              },
            }}
            {...{
              ...rest,
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
              t,
            }}
          />
        ),
      },
      [AccountStep.ResetAccount_Submit]: {
        view: (
          <UpdateAccount_Submit
            patch={{ isReset: true }}
            btnInfo={closeBtnInfo}
            {...{
              ...rest,
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
    updateDepositHash,
    clearDeposit,
    account,
    etherscanBaseUrl,
    onSwitch,
    onCopy,
    onViewQRCode,
    onDisconnect,
    addressShort,
    onQRClick,
    rest,
    t,
    onBack,
    lockBtn,
    unlockBtn,
    backToDepositBtnInfo,
    backToNFTDepositBtnInfo,
    backToMintBtnInfo,
    closeBtnInfo,
    depositProps.tradeData.belong,
    depositProps.tradeData.tradeValue,
    TryNewTransferAuthBtnInfo,
    backToTransferBtnInfo,
    TryNewWithdrawAuthBtnInfo,
    backToWithdrawBtnInfo,
    backToUpdateAccountBtnInfo,
    backToUnlockAccountBtnInfo,
    backToResetAccountBtnInfo,
    setShowAccount,
    setShowDeposit,
    goUpdateAccount,
  ]);

  const currentModal = accountList[isShowAccount.step];

  return {
    nftTransferToastOpen,
    nftTransferAlertText,
    setNFTTransferToastOpen,
    nftTransferProps,
    transferProcessRequestNFT,
    transferNFTRequest,
    nftWithdrawToastOpen,
    nftWithdrawAlertText,
    setNFTWithdrawToastOpen,
    nftWithdrawProps,
    withdrawProcessRequestNFT,
    withdrawNFTRequest,
    withdrawAlertText,
    withdrawToastOpen,
    nftDepositProps,
    setWithdrawToastOpen,
    transferProps,
    withdrawProps,
    depositProps,
    resetProps,
    activeAccountProps,
    exportAccountProps,
    exportAccountAlertText,
    exportAccountToastOpen,
    setExportAccountToastOpen,
    transferAlertText,
    transferToastOpen,
    setTransferToastOpen,
    assetsRawData,
    copyToastOpen,
    setCopyToastOpen,
    openQRCode,
    setOpenQRCode,
    isShowAccount,
    account,
    closeBtnInfo,
    accountList,
    currentModal,
    nftMintProps,
  };
}
