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
  ActionResult,
  ActionResultCode,
  checkErrorInfo,
  DAYS,
  getTimestampDaysLater,
  LoopringAPI,
  store,
  useBtnStatus,
  useWalletLayer2Socket,
  walletLayer2Service,
  useSystem,
  useWalletLayer2NFT,
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
import { connectProvides } from "@loopring-web/web3-provider";
import { useHistory } from "react-router-dom";
import { useWalletInfo } from "../../stores/localStore/walletInfo";

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
  isFeeNotEnough: boolean;
  checkFeeIsEnough: (isRequiredAPI?: boolean) => void;
  handleFeeChange: (value: FeeInfo) => void;
  feeInfo: FeeInfo;
  handleTabChange: (value: 0 | 1) => void;
  nftMintValue: NFT_MINT_VALUE<any>;
}) {
  const subject = React.useMemo(() => mintService.onSocket(), []);
  const history = useHistory();
  const { tokenMap, totalCoinMap } = useTokenMap();
  const { exchangeInfo, chainId } = useSystem();
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
  const [lastRequest, setLastRequest] = React.useState<any>({});
  const { checkHWAddr, updateHW } = useWalletInfo();
  const { page, updateWalletLayer2NFT } = useWalletLayer2NFT();
  const { setShowAccount, setShowNFTMintAdvance } = useOpenModals();

  const updateBtnStatus = React.useCallback(
    (error?: ErrorType & any) => {
      resetBtnInfo();
      if (
        !error &&
        nftMintValue.nftMETA.royaltyPercentage !== undefined &&
        Number.isInteger(nftMintValue.nftMETA.royaltyPercentage / 1) &&
        nftMintValue.nftMETA.royaltyPercentage >= 0 &&
        nftMintValue.nftMETA.royaltyPercentage <= 10 &&
        nftMintValue.mintData.tokenAddress &&
        nftMintValue.mintData.tradeValue &&
        Number(nftMintValue.mintData.tradeValue) > 0 &&
        Number(nftMintValue.mintData.tradeValue) <= MINT_LIMIT &&
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
  }, [isFeeNotEnough, nftMintValue, feeInfo]);
  useWalletLayer2Socket({});

  const handleMintDataChange = React.useCallback(
    async (data: Partial<MintReadTradeNFT<I>>) => {
      const { nftMETA, mintData } = nftMintValue;
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
          // case "tokenAddress":
          //   buildMint.tokenAddress = data.tokenAddress;
          //   break;
        }
      });
      updateNFTMintData({
        mintData: buildMint,
        nftMETA: buildNFTMeta,
      });
    },
    [nftMintValue]
  );
  const resetNFTMINT = () => {
    checkFeeIsEnough();
    handleMintDataChange({
      fee: feeInfo,
    });
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
          setLastRequest({ request });
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTMint_In_Progress,
          });
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
            updateWalletLayer2NFT({ page });
            mintService.emptyData();
            history.push("/nft/");
            // checkFeeIsEnough();
          }
        }
      } catch (reason: any) {
        const code = checkErrorInfo(reason, isNotHardwareWallet);
        if (code === sdk.ConnectorError.USER_DENIED) {
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTMint_Denied,
            info: {
              symbol: nftMintValue.nftMETA?.name,
            },
          });
          mintService.goMintConfirm();
        } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTMint_First_Method_Denied,
            info: {
              symbol: nftMintValue.nftMETA?.name,
            },
          });
          mintService.signatureMint(true);
        } else {
          if (
            [102024, 102025, 114001, 114002].includes(
              (reason as sdk.RESULT_INFO)?.code || 0
            )
          ) {
            checkFeeIsEnough(true);
          }

          setShowAccount({
            isShow: true,
            step: AccountStep.NFTMint_Failed,
            info: {
              symbol: nftMintValue.nftMETA?.name,
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
      let result: ActionResult = { code: ActionResultCode.NoError };
      const nftMintValue = store.getState()._router_modalData.nftMintValue;
      if (
        account.readyState === AccountStatus.ACTIVATED &&
        nftMintValue.mintData.tradeValue &&
        nftMintValue.mintData.tokenAddress &&
        nftMintValue.mintData.nftId &&
        nftMintValue.mintData.fee &&
        nftMintValue.mintData.fee.belong &&
        nftMintValue.mintData.fee.__raw__ &&
        nftMintValue.nftMETA.royaltyPercentage !== undefined &&
        Number.isInteger(nftMintValue.nftMETA.royaltyPercentage / 1) &&
        nftMintValue.nftMETA.royaltyPercentage / 1 >= 0 &&
        nftMintValue.nftMETA.royaltyPercentage / 1 <= 10 &&
        LoopringAPI.userAPI &&
        LoopringAPI.nftAPI &&
        !isFeeNotEnough &&
        exchangeInfo
      ) {
        setShowNFTMintAdvance({ isShow: false });
        setShowAccount({
          isShow: true,
          step: AccountStep.NFTMint_WaitForAuth,
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
            tokenAddress: nftMintValue.mintData.tokenAddress,
            nftId: nftMintValue.mintData.nftId,
            amount: nftMintValue.mintData.tradeValue.toString(),
            maxFee: {
              tokenId: feeToken.tokenId,
              amount: fee.toString(), // TEST: fee.toString(),
            },
            counterFactualNftInfo: {
              nftOwner: account.accAddress,
              nftFactory: sdk.NFTFactory[chainId],
              nftBaseUri: "",
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
      });
      processRequest(lastRequest, !isHardwareRetry);
    },
    [lastRequest, processRequest, setShowAccount]
  );

  const nftMintProps: NFTMintProps<Me, Mi, I> = {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    // metaData: nftMintValue.nftMETA as Me,
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
  }, []);

  return {
    nftMintProps,
    retryBtn,
  };
}
