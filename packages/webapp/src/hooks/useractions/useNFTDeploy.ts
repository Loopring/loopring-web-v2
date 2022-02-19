import { useAccount } from "../../stores/account";
import {
  AccountStep,
  NFTDeployProps,
  useOpenModals,
} from "@loopring-web/component-lib";
import React from "react";

import {
  AccountStatus,
  myLog,
  TradeNFT,
  UIERROR_CODE,
  WalletMap,
} from "@loopring-web/common-resources";
import { useBtnStatus } from "../common/useBtnStatus";
import { useTokenMap } from "../../stores/token";
import { useWalletLayer2 } from "../../stores/walletLayer2";
import { useModalData } from "../../stores/router";
import { makeWalletLayer2 } from "../help";
import {
  useWalletLayer2Socket,
  walletLayer2Service,
} from "../../services/socket";
import { connectProvides } from "@loopring-web/web3-provider";
import { LoopringAPI } from "../../api_wrapper";
import * as sdk from "@loopring-web/loopring-sdk";
import { getTimestampDaysLater } from "../../utils/dt_tools";
import { DAYS, TOAST_TIME } from "../../defs/common_defs";
import { useSystem } from "../../stores/system";
import { isAccActivated } from "./checkAccStatus";
import { checkErrorInfo } from "./utils";
import { useWalletInfo } from "../../stores/localStore/walletInfo";
import store from "../../stores";
import { useChargeFees } from "../common/useChargeFees";

export function useNFTDeploy<T extends TradeNFT<I> & { broker: string }, I>({
  doDeployDone,
}: {
  isLocalShow?: boolean;
  doDeployDone?: () => void;
}) {
  const { btnStatus, enableBtn, disableBtn } = useBtnStatus();
  const { tokenMap } = useTokenMap();
  const { account } = useAccount();
  const { exchangeInfo, chainId } = useSystem();
  const { updateWalletLayer2 } = useWalletLayer2();
  const { nftDeployValue, updateNFTDeployData, resetNFTDeployData } =
    useModalData();
  const [walletMap2, setWalletMap2] = React.useState(
    makeWalletLayer2(true).walletMap ?? ({} as WalletMap<I>)
  );
  const { setShowAccount } = useOpenModals();

  const { checkHWAddr, updateHW } = useWalletInfo();

  const processRequestNFT = React.useCallback(
    async (request: sdk.OriginDeployNFTRequestV3, isFirstTime: boolean) => {
      const { apiKey, connectName, eddsaKey } = account;

      try {
        if (connectProvides.usedWeb3) {
          let isHWAddr = checkHWAddr(account.accAddress);

          isHWAddr = !isFirstTime ? !isHWAddr : isHWAddr;

          const response = await LoopringAPI.userAPI?.submitDeployNFT(
            {
              request,
              web3: connectProvides.usedWeb3,
              chainId:
                chainId !== sdk.ChainId.GOERLI ? sdk.ChainId.MAINNET : chainId,
              walletType: connectName as sdk.ConnectorNames,
              eddsaKey: eddsaKey.sk,
              apiKey,
              isHWAddr,
            },
            {
              accountId: account.accountId,
              counterFactualInfo: eddsaKey.counterFactualInfo,
            }
          );

          myLog("submitInternalTransfer:", response);

          if (isAccActivated()) {
            if (
              (response as sdk.RESULT_INFO).code ||
              (response as sdk.RESULT_INFO).message
            ) {
              // Withdraw failed
              const code = checkErrorInfo(
                response as sdk.RESULT_INFO,
                isFirstTime
              );
              if (code === sdk.ConnectorError.USER_DENIED) {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTDeploy_Denied,
                });
              } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTDeploy_First_Method_Denied,
                });
              } else {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTDeploy_Failed,
                  error: response as sdk.RESULT_INFO,
                });
              }
            } else if ((response as sdk.TX_HASH_API)?.hash) {
              // Withdraw success
              setShowAccount({
                isShow: true,
                step: AccountStep.NFTDeploy_In_Progress,
              });
              await sdk.sleep(TOAST_TIME);
              setShowAccount({
                isShow: true,
                step: AccountStep.NFTDeploy_Submit,
              });
              if (isHWAddr) {
                myLog("......try to set isHWAddr", isHWAddr);
                updateHW({ wallet: account.accAddress, isHWAddr });
              }
              walletLayer2Service.sendUserUpdate();
              if (doDeployDone) {
                doDeployDone();
              }
              resetNFTDeployData();
              updateWalletLayer2();
            }
          } else {
            resetNFTDeployData();
          }
        }
      } catch (reason) {
        const code = checkErrorInfo(reason, isFirstTime);

        if (isAccActivated()) {
          if (code === sdk.ConnectorError.USER_DENIED) {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTDeploy_Denied,
            });
          } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTDeploy_First_Method_Denied,
            });
          } else {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTDeploy_Failed,
              error: { code: UIERROR_CODE.UNKNOWN, msg: reason.message },
            });
          }
        }
      }
    },
    [
      account,
      checkHWAddr,
      chainId,
      setShowAccount,
      doDeployDone,
      resetNFTDeployData,
      updateWalletLayer2,
      updateHW,
    ]
  );
  const { chargeFeeTokenList, isFeeNotEnough, handleFeeChange, feeInfo } =
    useChargeFees({
      tokenAddress: nftDeployValue.tokenAddress,
      requestType: sdk.OffchainNFTFeeReqType.NFT_DEPLOY,
      updateData: (feeInfo, _chargeFeeList) => {
        updateNFTDeployData({ ...nftDeployValue, fee: feeInfo });
      },
    });

  const checkBtnStatus = React.useCallback(() => {
    if (tokenMap && !isFeeNotEnough) {
      enableBtn();
      myLog("enableBtn");
      return;
    }
    disableBtn();
  }, [disableBtn, enableBtn, isFeeNotEnough, tokenMap]);

  React.useEffect(() => {
    checkBtnStatus();
  }, [checkBtnStatus, nftDeployValue]);

  const onNFTDeployClick = async (
    _nftDeployValue: T,
    isFirsTime: boolean = true
  ) => {
    const { accountId, accAddress, readyState, apiKey, eddsaKey } = account;
    const nftDeployValue = {
      ...store.getState()._router_modalData.nftDeployValue,
      ..._nftDeployValue,
    };

    if (
      readyState === AccountStatus.ACTIVATED &&
      tokenMap &&
      LoopringAPI.userAPI &&
      exchangeInfo &&
      nftDeployValue &&
      nftDeployValue.broker &&
      nftDeployValue.tokenAddress &&
      connectProvides.usedWeb3 &&
      nftDeployValue?.nftData &&
      nftDeployValue.fee &&
      nftDeployValue?.fee.belong &&
      eddsaKey?.sk
    ) {
      try {
        setShowAccount({
          isShow: true,
          step: AccountStep.NFTDeploy_WaitForAuth,
        });
        const feeToken = tokenMap[nftDeployValue.fee.belong];
        const fee = sdk.toBig(nftDeployValue.fee.__raw__?.feeRaw ?? 0);

        const storageId = await LoopringAPI.userAPI?.getNextStorageId(
          {
            accountId,
            sellTokenId: Number(feeToken.tokenId),
          },
          apiKey
        );
        const req: sdk.OriginDeployNFTRequestV3 = {
          nftData: nftDeployValue.nftData,
          tokenAddress: nftDeployValue.tokenAddress,
          transfer: {
            exchange: exchangeInfo.exchangeAddress,
            payerAddr: accAddress,
            payerId: accountId,
            payeeAddr: nftDeployValue.broker,
            storageId: storageId.offchainId,
            token: {
              tokenId: feeToken.tokenId,
              volume: fee.toString(), // TEST: fee.toString(),
            },
            validUntil: getTimestampDaysLater(DAYS),
          },
        };

        myLog("nftDeploy req:", req);

        processRequestNFT(req, isFirsTime);
      } catch (e) {
        sdk.dumpError400(e);
        // nftTransfer failed
        setShowAccount({
          isShow: true,
          step: AccountStep.NFTDeploy_Failed,
          error: { code: UIERROR_CODE.UNKNOWN, msg: e.message },
        });
      }
    } else {
      return false;
    }
  };

  const walletLayer2Callback = () => {
    const walletMap = makeWalletLayer2(true).walletMap ?? ({} as WalletMap<I>);
    setWalletMap2(walletMap);
  };

  useWalletLayer2Socket({ walletLayer2Callback });

  const nftDeployProps = {
    coinMap: {},
    handleOnNFTDataChange<T>(data: T): void {},
    tradeData: nftDeployValue as T,
    walletMap: walletMap2 as WalletMap<any>,
    onNFTDeployClick: (trade: T) => {
      onNFTDeployClick(trade);
    },
    nftDeployBtnStatus: btnStatus,
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
  } as NFTDeployProps<any, any>;

  return {
    nftDeployProps,
    updateNFTDeployData,
  };
}
