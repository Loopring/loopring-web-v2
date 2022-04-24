import React from "react";
import { MintCommands, mintService } from "./mintService";
import { NFT_MINT_VALUE, useModalData } from "stores/router";
import {
  AccountStep,
  NFTMintProps,
  useOpenModals,
} from "@loopring-web/component-lib";
import * as sdk from "@loopring-web/loopring-sdk";
import { useTokenMap } from "stores/token";
import { useAccount } from "stores/account";
import { useTranslation } from "react-i18next";
import { useBtnStatus } from "hooks/common/useBtnStatus";
import { useSystem } from "stores/system";
import { useWalletInfo } from "stores/localStore/walletInfo";
import { useWalletLayer2NFT } from "stores/walletLayer2NFT";
import store from "stores";
import { LoopringAPI } from "api_wrapper";
import { useChargeFees } from "hooks/common/useChargeFees";
import {
  AccountStatus,
  EmptyValueTag,
  ErrorType,
  Explorer,
  FeeInfo,
  MINT_LIMIT,
  MintTradeNFT,
  myLog,
  NFTMETA,
  SagaStatus,
  TOAST_TIME,
  TradeNFT,
  UIERROR_CODE,
} from "@loopring-web/common-resources";
import { useWalletLayer2Socket, walletLayer2Service } from "services/socket";
import { connectProvides } from "@loopring-web/web3-provider";
import { isAccActivated } from "hooks/useractions/checkAccStatus";
import { checkErrorInfo } from "hooks/useractions/utils";
import { ActionResult, ActionResultCode, DAYS } from "../../defs/common_defs";
import { getTimestampDaysLater } from "../../utils/dt_tools";

export function useNFTMint<
  Me extends NFTMETA,
  Mi extends MintTradeNFT<I>,
  I,
  C extends FeeInfo
>({
  chargeFeeTokenList,
  isFeeNotEnough,
  checkFeeIsEnough,
  handleFeeChange,
  feeInfo,
  tokenAddress,
}: {
  chargeFeeTokenList: FeeInfo[];
  isFeeNotEnough: boolean;
  checkFeeIsEnough: (isRequiredAPI?: boolean) => void;
  handleFeeChange: (value: FeeInfo) => void;
  feeInfo: FeeInfo;
  tokenAddress: string | undefined;
}) {
  const { tokenMap, totalCoinMap } = useTokenMap();
  const { exchangeInfo, chainId } = useSystem();
  const { account } = useAccount();
  const { nftMintValue, updateNFTMintData } = useModalData();
  const {
    btnStatus,
    btnInfo,
    enableBtn,
    disableBtn,
    setLabelAndParams,
    resetBtnInfo,
  } = useBtnStatus();
  const { t } = useTranslation("common");
  const [lastRequest, setLastRequest] = React.useState<any>({});
  const { checkHWAddr, updateHW } = useWalletInfo();
  const { page, updateWalletLayer2NFT } = useWalletLayer2NFT();
  // const [isAvaiableId, setIsAvaiableId] = React.useState(false);
  // const [isNFTCheckLoading, setIsNFTCheckLoading] = React.useState(false);
  const { setShowAccount, setShowNFTMint } = useOpenModals();

  const updateBtnStatus = React.useCallback(
    (error?: ErrorType & any) => {
      resetBtnInfo();
      if (
        !error &&
        nftMintValue.mintData.royaltyPercentage &&
        Number.isInteger(nftMintValue.mintData.royaltyPercentage / 1) &&
        nftMintValue.mintData.royaltyPercentage >= 0 &&
        nftMintValue.mintData.royaltyPercentage <= 10 &&
        nftMintValue &&
        tokenAddress &&
        nftMintValue.mintData.tradeValue &&
        Number(nftMintValue.mintData.tradeValue) > 0 &&
        Number(nftMintValue.mintData.tradeValue) <= MINT_LIMIT &&
        // (nftMintValue.mintData.image !== undefined ||
        //   nftMintValue.mintData.name !== undefined) &&
        nftMintValue.mintData.fee &&
        nftMintValue.mintData.fee.belong &&
        nftMintValue.mintData.fee.__raw__ &&
        !isFeeNotEnough
      ) {
        enableBtn();
        return;
      }
      if (
        !(
          !!nftMintValue.mintData.royaltyPercentage &&
          Number.isInteger(nftMintValue.mintData.royaltyPercentage / 1) &&
          nftMintValue.mintData.royaltyPercentage / 1 >= 0 &&
          nftMintValue.mintData.royaltyPercentage / 1 <= 10
        )
      ) {
        setLabelAndParams("labelNFTMintNoMetaBtn", {});
      }
      disableBtn();
      myLog("try to disable nftMint btn!");
    },
    [
      isFeeNotEnough,
      resetBtnInfo,
      nftMintValue,
      tokenAddress,
      enableBtn,
      setLabelAndParams,
      disableBtn,
    ]
  );

  React.useEffect(() => {
    updateBtnStatus();
  }, [isFeeNotEnough, nftMintValue, feeInfo]);
  useWalletLayer2Socket({});

  const resetNFTMINT = React.useCallback(
    (_nftMintValue?: NFT_MINT_VALUE<any>) => {
      if (!_nftMintValue) {
        _nftMintValue = { ...(nftMintValue ?? {}) };
      }
      checkFeeIsEnough();
      updateNFTMintData({
        ..._nftMintValue,
        mintData: {
          ..._nftMintValue.mintData,
          tradeValue: 0,
          nftIdView: "",
          nftId: undefined,
          tokenAddress,
          balance: 100000,
          fee: feeInfo,
        },
      });
    },
    [checkFeeIsEnough, tokenAddress, updateNFTMintData, nftMintValue]
  );
  const processRequest = React.useCallback(
    async (request: sdk.NFTMintRequestV3, isNotHardwareWallet: boolean) => {
      const { apiKey, connectName, eddsaKey } = account;

      try {
        if (connectProvides.usedWeb3 && LoopringAPI.userAPI) {
          let isHWAddr = checkHWAddr(account.accAddress);

          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true;
          }

          setLastRequest({ request });

          const response = await LoopringAPI.userAPI?.submitNFTMint(
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

          myLog("submitNFTMint:", response);

          if (isAccActivated()) {
            if (
              (response as sdk.RESULT_INFO).code ||
              (response as sdk.RESULT_INFO).message
            ) {
              // Withdraw failed
              const code = checkErrorInfo(
                response as sdk.RESULT_INFO,
                isNotHardwareWallet
              );
              if (code === sdk.ConnectorError.USER_DENIED) {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTMint_Denied,
                });
              } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTMint_First_Method_Denied,
                });
              } else {
                if (
                  [102024, 102025, 114001, 114002].includes(
                    (response as sdk.RESULT_INFO)?.code || 0
                  )
                ) {
                  checkFeeIsEnough(true);
                }

                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTMint_Failed,
                  error: response as sdk.RESULT_INFO,
                });
                resetNFTMINT();
              }
            } else if ((response as sdk.TX_HASH_API)?.hash) {
              // Withdraw success
              setShowAccount({
                isShow: true,
                step: AccountStep.NFTMint_In_Progress,
              });
              await sdk.sleep(TOAST_TIME);
              setShowAccount({
                isShow: true,
                step: AccountStep.NFTMint_Success,
                info: {
                  hash:
                    Explorer +
                    `tx/${(response as sdk.TX_HASH_API)?.hash}-nftMint`,
                },
              });
              if (isHWAddr) {
                myLog("......try to set isHWAddr", isHWAddr);
                updateHW({ wallet: account.accAddress, isHWAddr });
              }
              walletLayer2Service.sendUserUpdate();
              updateWalletLayer2NFT({ page });
              resetNFTMINT();
              // checkFeeIsEnough();
            }
          } else {
            resetNFTMINT();
          }
        }
      } catch (reason: any) {
        const code = checkErrorInfo(reason, isNotHardwareWallet);

        if (isAccActivated()) {
          if (code === sdk.ConnectorError.USER_DENIED) {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTMint_Denied,
            });
          } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTMint_First_Method_Denied,
            });
          } else {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTMint_Failed,
              error: {
                code: UIERROR_CODE.UNKNOWN,
                msg: reason?.message,
              },
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
      resetNFTMINT,
      updateHW,
      checkFeeIsEnough,
    ]
  );

  const handleOnNFTDataChange = React.useCallback(
    async (data: Partial<MintTradeNFT<I>>) => {
      let shouldUpdate = {};

      if (data.cid && LoopringAPI.nftAPI) {
        let nftId: string = "";
        //LoopringAPI.nftAPI.ipfsNftIDToCid()
        try {
          nftId = LoopringAPI.nftAPI.ipfsCid0ToNftID(data.cid);
          shouldUpdate = {
            nftId,
            // nftIdView: data.cidView,
            ...shouldUpdate,
          };
        } catch (error: any) {
          myLog("handleOnNFTDataChange ->.cid", error);
          shouldUpdate = {
            nftId: "",
            // nftIdView:'',
          };
        }

        if (nftId && nftId !== "") {
          try {
            const value = await fetch(
              sdk.LOOPRING_URLs.IPFS_META_URL +
                `${nftMintValue.mintData.nftIdView}`
            ).then((response) => response.json());

            if (value) {
              shouldUpdate = {
                nftId: nftId,
                name: value.name ?? t("labelUnknown"),
                image: value.image,
                description: value.description ?? EmptyValueTag,
                balance: MINT_LIMIT,
                royaltyPercentage: value.royalty_percentage,
                ...shouldUpdate,
              };
            } else {
              shouldUpdate = {
                nftId: nftId,
                name: undefined,
                image: undefined,
                description: undefined,
                balance: undefined,
                ...shouldUpdate,
              };
            }
          } catch (error: any) {
            shouldUpdate = {
              nftId: nftId,
              name: undefined,
              image: undefined,
              description: undefined,
              balance: undefined,
              ...shouldUpdate,
            };
            myLog(error);
          }
        }
      } else if (nftMintValue.mintData.nftIdView) {
      } else if (!nftMintValue.mintData.nftIdView) {
        shouldUpdate = {
          nftId: "",
          name: undefined,
          image: undefined,
          description: undefined,
          balance: undefined,
        };
      }
      updateNFTMintData({
        ...nftMintValue,
        mintData: { ...nftMintValue.mintData, ...data, ...shouldUpdate },
      });
    },
    [nftMintValue]
  );

  const onNFTMintClick = React.useCallback(
    async (_nftMintValue: Partial<Mi>, isFirstTime: boolean = true) => {
      let result: ActionResult = { code: ActionResultCode.NoError };
      if (
        account.readyState === AccountStatus.ACTIVATED &&
        nftMintValue.mintData.tradeValue &&
        tokenAddress &&
        nftMintValue.mintData.nftId &&
        nftMintValue.mintData.fee &&
        nftMintValue.mintData.fee.belong &&
        nftMintValue.mintData.fee.__raw__ &&
        // (nftMintValue.mintData.image !== undefined ||
        //   nftMintValue.mintData.name !== undefined) &&
        nftMintValue.mintData.royaltyPercentage &&
        Number.isInteger(nftMintValue.mintData.royaltyPercentage / 1) &&
        nftMintValue.mintData.royaltyPercentage >= 0 &&
        nftMintValue.mintData.royaltyPercentage <= 10 &&
        LoopringAPI.userAPI &&
        LoopringAPI.nftAPI &&
        !isFeeNotEnough &&
        exchangeInfo
      ) {
        setShowNFTMint({ isShow: false });
        setShowAccount({
          isShow: true,
          step: AccountStep.NFTMint_WaitForAuth,
        });
        try {
          const { accountId, accAddress, apiKey } = account;
          const fee = sdk.toBig(nftMintValue.mintData.fee.__raw__?.feeRaw ?? 0);
          const feeToken = tokenMap[nftMintValue.mintData.fee.belong];
          const storageId = await LoopringAPI.userAPI.getNextStorageId(
            {
              accountId,
              sellTokenId: feeToken.tokenId,
            },
            apiKey
          );
          const req: sdk.NFTMintRequestV3 = {
            exchange: exchangeInfo.exchangeAddress,
            minterId: accountId,
            minterAddress: accAddress,
            toAccountId: accountId,
            toAddress: accAddress,
            nftType: 0,
            tokenAddress,
            nftId: nftMintValue.mintData.nftId,
            amount: nftMintValue.mintData.tradeValue.toString(),
            validUntil: getTimestampDaysLater(DAYS),
            storageId: storageId?.offchainId,
            maxFee: {
              tokenId: feeToken.tokenId,
              amount: fee.toString(), // TEST: fee.toString(),
            },
            counterFactualNftInfo: {
              nftOwner: account.accAddress,
              nftFactory: sdk.NFTFactory[chainId],
              nftBaseUri: "",
            },
            royaltyPercentage:
              Math.floor(nftMintValue.mintData.royaltyPercentage) ?? 0,
            forceToMint: false,
          };
          myLog("onNFTMintClick req:", req);

          processRequest(req, isFirstTime);
        } catch (e: any) {
          // sdk.dumpError400(e);
          // transfer failed
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTMint_Failed,
            error: { code: 400, message: e.message } as sdk.RESULT_INFO,
          });
        }
        return;
      } else {
        result.code = ActionResultCode.DataNotReady;
      }
    },
    [nftMintValue]
  );
  const retryBtn = React.useCallback(
    (isHardwareRetry: boolean = false) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.NFTMint_WaitForAuth,
      });
      processRequest(lastRequest, !isHardwareRetry);
    },
    [lastRequest, processRequest, setShowAccount]
  );

  const nftMintProps: NFTMintProps<Me, Mi, I> = React.useMemo(() => {
    return {
      chargeFeeTokenList,
      isFeeNotEnough,
      handleFeeChange,
      feeInfo,
      metaData: nftMintValue.nftMETA as Me,
      handleOnNFTDataChange,
      onNFTMintClick,
      walletMap: {} as any,
      coinMap: totalCoinMap as any,
      tradeData: nftMintValue.mintData as Mi,
      nftMintBtnStatus: btnStatus,
      btnInfo,
    };
  }, [
    btnInfo,
    btnStatus,
    chargeFeeTokenList,
    feeInfo,
    handleFeeChange,
    handleOnNFTDataChange,
    isFeeNotEnough,
    nftMintValue,
    onNFTMintClick,
    totalCoinMap,
  ]);
  const subject = React.useMemo(() => mintService.onSocket(), []);

  const commonSwitch = React.useCallback(
    async ({ data, status }: { status: MintCommands; data?: any }) => {
      switch (status) {
        case MintCommands.SignatureMint:
        case MintCommands.CancelSignature:
        case MintCommands.HardwareSignature:
          nftMintProps.onNFTMintClick(nftMintValue as any, false);
          break;
        case MintCommands.Complete:
          break;
      }
    },
    [nftMintProps]
  );
  React.useEffect(() => {
    const subscription = subject.subscribe((props) => {
      commonSwitch(props);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    nftMintProps,
    retryBtn,
  };
}
