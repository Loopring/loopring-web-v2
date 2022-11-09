import React from "react";
import {
  AccountStep,
  NFTMintProps,
  useOpenModals,
} from "@loopring-web/component-lib";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  MintCommands,
  mintService,
  NFT_MINT_VALUE,
  useModalData,
  useTokenMap,
  useAccount,
  ActionResultCode,
  DAYS,
  getTimestampDaysLater,
  LoopringAPI,
  store,
  useBtnStatus,
  useWalletLayer2Socket,
  walletLayer2Service,
  useSystem,
  useWalletLayer2NFT,
  getIPFSString,
} from "../../index";

import {
  AccountStatus,
  ErrorType,
  Explorer,
  FeeInfo,
  MINT_LIMIT,
  MintReadTradeNFT,
  MintTradeNFT,
  myLog,
  NFTMETA,
  TOAST_TIME,
  UIERROR_CODE,
} from "@loopring-web/common-resources";
import {
  ConnectProvidersSignMap,
  connectProvides,
} from "@loopring-web/web3-provider";
import { useHistory } from "react-router-dom";
import { useWalletInfo } from "../../stores/localStore/walletInfo";
import Web3 from "web3";

export function useNFTMint<
  Me extends NFTMETA,
  Mi extends MintTradeNFT<I>,
  I,
  _C extends FeeInfo
>({
  chargeFeeTokenList,
  isFeeNotEnough,
  checkFeeIsEnough,
  handleFeeChange,
  feeInfo,
  handleTabChange,
  nftMintValue,
}: {
  chargeFeeTokenList: FeeInfo[];
  isFeeNotEnough: {
    isFeeNotEnough: boolean;
    isOnLoading: boolean;
  };
  // resetIntervalTime: () => void;
  checkFeeIsEnough: (props?: {
    isRequiredAPI: true;
    intervalTime?: number;
  }) => void;
  handleFeeChange: (value: FeeInfo) => void;
  feeInfo: FeeInfo;
  handleTabChange: (value: 0 | 1) => void;
  nftMintValue: NFT_MINT_VALUE<any>;
}) {
  const subject = React.useMemo(() => mintService.onSocket(), []);
  const history = useHistory();
  const { tokenMap, totalCoinMap } = useTokenMap();
  const { exchangeInfo, chainId, baseURL } = useSystem();
  const { account } = useAccount();
  const { updateNFTMintData } = useModalData();
  const {
    btnStatus,
    btnInfo,
    enableBtn,
    disableBtn,
    setLabelAndParams,
    resetBtnInfo,
  } = useBtnStatus();
  const { checkHWAddr, updateHW } = useWalletInfo();
  const { page, updateWalletLayer2NFT } = useWalletLayer2NFT();
  const { setShowAccount, setShowNFTMintAdvance } = useOpenModals();
  const checkAvailable = ({
    nftMintValue,
    isFeeNotEnough,
  }: {
    nftMintValue: NFT_MINT_VALUE<any>;
    isFeeNotEnough: any;
  }) => {
    return (
      nftMintValue.nftMETA.royaltyPercentage !== undefined &&
      Number.isInteger(nftMintValue.nftMETA.royaltyPercentage / 1) &&
      nftMintValue.nftMETA.royaltyPercentage / 1 >= 0 &&
      nftMintValue.nftMETA.royaltyPercentage / 1 <= 10 &&
      nftMintValue.mintData.tokenAddress &&
      nftMintValue.mintData.tradeValue &&
      Number(nftMintValue.mintData.tradeValue) > 0 &&
      Number(nftMintValue.mintData.tradeValue) <= MINT_LIMIT &&
      nftMintValue.mintData.nftId &&
      nftMintValue.mintData.fee &&
      nftMintValue.mintData.fee.belong &&
      nftMintValue.mintData.fee.__raw__ &&
      !isFeeNotEnough.isFeeNotEnough
    );
  };
  const updateBtnStatus = React.useCallback(
    (error?: ErrorType & any) => {
      resetBtnInfo();
      if (!error && checkAvailable({ nftMintValue, isFeeNotEnough })) {
        enableBtn();
        return;
      }
      if (
        !(
          nftMintValue.nftMETA.royaltyPercentage !== undefined &&
          Number.isInteger(nftMintValue.nftMETA.royaltyPercentage / 1) &&
          nftMintValue.nftMETA.royaltyPercentage >= 0 &&
          nftMintValue.nftMETA.royaltyPercentage <= 10
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
      enableBtn,
      setLabelAndParams,
      disableBtn,
    ]
  );

  React.useEffect(() => {
    updateBtnStatus();
  }, [isFeeNotEnough.isFeeNotEnough, nftMintValue, feeInfo]);
  useWalletLayer2Socket({});

  const handleMintDataChange = React.useCallback(
    async (data: Partial<MintReadTradeNFT<I>>) => {
      const { nftMETA, mintData, collection } = nftMintValue;
      // const {
      //   nftMintValue: { nftMETA, mintData, collection },
      // } = store.getState()._router_modalData;
      const buildNFTMeta = { ...nftMETA };
      const buildMint = { ...mintData };
      Reflect.ownKeys(data).map((key) => {
        switch (key) {
          case "tradeValue":
            buildMint.tradeValue = data.tradeValue;
            break;
          case "fee":
            buildMint.fee = data.fee;
            break;
        }
      });
      updateNFTMintData({
        mintData: buildMint,
        nftMETA: buildNFTMeta,
        collection,
      });
    },
    [nftMintValue]
  );
  const resetNFTMINT = () => {
    if (nftMintValue.mintData.tokenAddress) {
      checkFeeIsEnough({ isRequiredAPI: true });
      handleMintDataChange({
        fee: feeInfo,
      });
    }
  };
  const processRequest = React.useCallback(
    async (request: sdk.NFTMintRequestV3, isNotHardwareWallet: boolean) => {
      const { apiKey, connectName, eddsaKey } = account;
      try {
        if (connectProvides.usedWeb3 && LoopringAPI.userAPI) {
          let isHWAddr = checkHWAddr(account.accAddress);

          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true;
          }
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTMint_In_Progress,
            info: {
              symbol: nftMintValue.nftMETA?.name,
              value: nftMintValue.mintData?.tradeValue,
            },
          });
          const response = await LoopringAPI.userAPI?.submitNFTMint(
            {
              request,
              web3: connectProvides.usedWeb3 as unknown as Web3,
              chainId:
                chainId !== sdk.ChainId.GOERLI ? sdk.ChainId.MAINNET : chainId,
              walletType: (ConnectProvidersSignMap[connectName] ??
                connectName) as unknown as sdk.ConnectorNames,
              eddsaKey: eddsaKey.sk,
              apiKey,
              isHWAddr,
            },
            {
              accountId: account.accountId,
              counterFactualInfo: eddsaKey.counterFactualInfo,
            } as any
          );

          myLog("submitNFTMint:", response);

          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            throw response;
          } else if ((response as sdk.TX_HASH_API)?.hash) {
            await sdk.sleep(TOAST_TIME);
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTMint_Success,
              info: {
                symbol: nftMintValue.nftMETA?.name,
                value: nftMintValue.mintData?.tradeValue,
                hash:
                  Explorer +
                  `tx/${(response as sdk.TX_HASH_API)?.hash}-nftMint-${
                    account.accountId
                  }-${request.maxFee.tokenId}-${request.storageId}`,
              },
            });
            if (isHWAddr) {
              myLog("......try to set isHWAddr", isHWAddr);
              updateHW({ wallet: account.accAddress, isHWAddr });
            }
            walletLayer2Service.sendUserUpdate();
            history.push({
              pathname: `/NFT/assetsNFT/byCollection/${nftMintValue.collection?.contractAddress}--${nftMintValue.collection?.id}`,
            });
            mintService.emptyData();
            history.push("/nft/");
          }
        }
      } catch (reason: any) {
        const code = sdk.checkErrorInfo(reason, isNotHardwareWallet);
        if (code === sdk.ConnectorError.USER_DENIED) {
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTMint_Denied,
            info: {
              symbol: nftMintValue.nftMETA?.name,
              value: nftMintValue.mintData?.tradeValue,
            },
          });
          mintService.goMintConfirm();
        } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTMint_First_Method_Denied,
            info: {
              symbol: nftMintValue.nftMETA?.name,
              value: nftMintValue.mintData?.tradeValue,
            },
          });
          mintService.signatureMint(true);
        } else {
          if (
            [102024, 102025, 114001, 114002].includes(
              (reason as sdk.RESULT_INFO)?.code || 0
            )
          ) {
            checkFeeIsEnough({ isRequiredAPI: true });
          }

          setShowAccount({
            isShow: true,
            step: AccountStep.NFTMint_Failed,
            info: {
              symbol: nftMintValue.nftMETA?.name,
              value: nftMintValue.mintData?.tradeValue,
            },
            error: {
              code: UIERROR_CODE.UNKNOWN,
              msg: reason?.message,
              ...reason,
            },
          });
          mintService.goMintConfirm();
        }
      }
    },
    [
      account,
      checkHWAddr,
      setShowAccount,
      chainId,
      nftMintValue.nftMETA?.name,
      updateWalletLayer2NFT,
      page,
      history,
      updateHW,
      checkFeeIsEnough,
    ]
  );

  const onNFTMintClick = React.useCallback(
    async (isFirstTime: boolean = true) => {
      let result = { code: ActionResultCode.NoError };
      const nftMintValue = store.getState()._router_modalData.nftMintValue;
      if (
        account.readyState === AccountStatus.ACTIVATED &&
        LoopringAPI.userAPI &&
        LoopringAPI.nftAPI &&
        exchangeInfo &&
        nftMintValue.collection &&
        nftMintValue.mintData &&
        nftMintValue.mintData.fee &&
        checkAvailable({ nftMintValue, isFeeNotEnough })
      ) {
        setShowNFTMintAdvance({ isShow: false });
        setShowAccount({
          isShow: true,
          step: AccountStep.NFTMint_WaitForAuth,
          info: {
            symbol: nftMintValue.nftMETA?.name,
            value: nftMintValue.mintData?.tradeValue,
          },
        });
        try {
          const { accountId, accAddress, apiKey } = account;
          const feeRaw =
            nftMintValue.mintData.fee.feeRaw ??
            nftMintValue.mintData.fee.__raw__?.feeRaw ??
            0;
          const fee = sdk.toBig(feeRaw);
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
            tokenAddress: nftMintValue.mintData.tokenAddress ?? "",
            nftId: nftMintValue.mintData.nftId ?? "",
            amount: nftMintValue.mintData.tradeValue?.toString() ?? "",
            maxFee: {
              tokenId: feeToken.tokenId,
              amount: fee.toString(), // TEST: fee.toString(),
            },
            counterFactualNftInfo: {
              nftOwner: account.accAddress,
              nftFactory:
                nftMintValue.collection.nftFactory ??
                sdk.NFTFactory_Collection[chainId],
              nftBaseUri: nftMintValue.collection.baseUri ?? "",
            },
            royaltyPercentage: nftMintValue.nftMETA.royaltyPercentage ?? 0,
            forceToMint: false,
            validUntil: getTimestampDaysLater(DAYS),
            storageId: storageId?.offchainId,
          };
          myLog("onNFTMintClick req:", req);

          processRequest(req, isFirstTime);
        } catch (e: any) {
          // sdk.dumpError400(e);
          // transfer failed
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTMint_Failed,
            info: {
              symbol: nftMintValue.nftMETA?.name,
              value: nftMintValue.mintData?.tradeValue,
            },
            error: { code: 400, message: e.message } as sdk.RESULT_INFO,
          });
        }
        return;
      } else {
        result.code = ActionResultCode.DataNotReady;
      }
    },
    []
  );
  const retryBtn = React.useCallback(
    (isHardwareRetry: boolean = false) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.NFTMint_WaitForAuth,
        info: {
          symbol: nftMintValue.nftMETA?.name,
          value: nftMintValue.mintData?.tradeValue,
        },
      });
      onNFTMintClick(!isHardwareRetry);
      // processRequest(lastRequest, !isHardwareRetry);
    },
    [
      nftMintValue.mintData?.tradeValue,
      nftMintValue.nftMETA?.name,
      onNFTMintClick,
      setShowAccount,
    ]
  );

  const nftMintProps: NFTMintProps<Me, Mi, I> = {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    baseURL,
    getIPFSString,
    handleMintDataChange,
    onNFTMintClick,
    walletMap: {} as any,
    coinMap: totalCoinMap as any,
    tradeData: nftMintValue.mintData as Mi,
    nftMintBtnStatus: btnStatus,
    btnInfo,
    mintService,
  };

  const commonSwitch = ({
    data,
    status,
  }: {
    status: MintCommands;
    data?: any;
  }) => {
    switch (status) {
      case MintCommands.MetaDataSetup:
        if (data?.emptyData) {
          resetNFTMINT();
        }
        break;
      case MintCommands.SignatureMint:
      // nftMintProps.onNFTMintClick(data?.isHardware);
      case MintCommands.MintConfirm:
        handleTabChange(1);
        break;
    }
  };
  React.useEffect(() => {
    const subscription = subject.subscribe((props) => {
      commonSwitch(props);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [subject]);

  return {
    nftMintProps,
    retryBtn,
  };
}
