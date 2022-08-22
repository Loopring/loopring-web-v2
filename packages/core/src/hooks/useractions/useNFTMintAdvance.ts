import React from "react";

import {
  AccountStep,
  NFTMintAdvanceProps,
  useOpenModals,
} from "@loopring-web/component-lib";
import {
  AccountStatus,
  CollectionMeta,
  CustomError,
  EmptyValueTag,
  ErrorMap,
  ErrorType,
  Explorer,
  IPFS_HEAD_URL,
  MINT_LIMIT,
  myLog,
  NFT_TYPE_STRING,
  TOAST_TIME,
  TradeNFT,
  UIERROR_CODE,
} from "@loopring-web/common-resources";

import * as sdk from "@loopring-web/loopring-sdk";
import {
  ConnectProvidersSignMap,
  connectProvides,
} from "@loopring-web/web3-provider";
import {
  useAccount,
  useModalData,
  useSystem,
  useTokenMap,
  useWalletLayer2NFT,
} from "../../stores";
import { useBtnStatus, useMyCollection } from "../common";
import { LoopringAPI } from "../../api_wrapper";
import { checkErrorInfo } from "./utils";
import { isAccActivated } from "./checkAccStatus";
import {
  useChargeFees,
  useWalletLayer2Socket,
  walletLayer2Service,
} from "../../services";
import { useWalletInfo } from "../../stores/localStore/walletInfo";
import { useTranslation } from "react-i18next";
import { getIPFSString, getTimestampDaysLater, makeMeta } from "../../utils";
import { ActionResult, ActionResultCode, DAYS } from "../../defs";
import { useHistory } from "react-router-dom";
import fetchJsonp from "fetch-jsonp";

const CID = require("cids");

export const useNFTMintAdvance = <
  T extends TradeNFT<I, Co>,
  Co extends CollectionMeta,
  I
>() => {
  const { tokenMap, totalCoinMap } = useTokenMap();
  const { account } = useAccount();
  const { exchangeInfo, chainId } = useSystem();
  const collectionListProps = useMyCollection<Co>();
  const { nftMintAdvanceValue, updateNFTMintAdvanceData } = useModalData();
  const {
    btnStatus,
    btnInfo,
    enableBtn,
    disableBtn,
    setLabelAndParams,
    resetBtnInfo,
  } = useBtnStatus();
  const { t } = useTranslation("common");
  // const [lastRequest, setLastRequest] = React.useState<any>({});
  const { checkHWAddr, updateHW } = useWalletInfo();
  const { page, updateWalletLayer2NFT } = useWalletLayer2NFT();
  const [isNotAvailableCID, setIsNotAvailableCID] =
    React.useState<undefined | { reason: string }>(undefined);
  const [isNFTCheckLoading, setIsNFTCheckLoading] = React.useState(false);
  const { setShowAccount, setShowNFTMintAdvance } = useOpenModals();
  const { baseURL, etherscanBaseUrl } = useSystem();
  const history = useHistory();
  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    checkFeeIsEnough,
    handleFeeChange,
    feeInfo,
  } = useChargeFees({
    tokenAddress: nftMintAdvanceValue?.collectionMeta?.contractAddress, //tokenAddress?.toLowerCase(),
    requestType: sdk.OffchainNFTFeeReqType.NFT_MINT,
    updateData: ({ fee }) => {
      updateNFTMintAdvanceData({
        ...nftMintAdvanceValue,
        fee,
      });
    },
  });
  const checkAvailable = ({
    nftMintAdvanceValue,
    isFeeNotEnough,
    isNotAvailableCID,
  }: {
    nftMintAdvanceValue: Partial<T>;
    isFeeNotEnough: any;
    isNotAvailableCID: undefined | { reason: string };
  }) => {
    return (
      nftMintAdvanceValue.royaltyPercentage !== undefined &&
      Number.isInteger(nftMintAdvanceValue.royaltyPercentage) &&
      nftMintAdvanceValue.royaltyPercentage >= 0 &&
      nftMintAdvanceValue.royaltyPercentage <= 10 &&
      nftMintAdvanceValue &&
      nftMintAdvanceValue?.collection_metadata &&
      nftMintAdvanceValue.tradeValue &&
      Number(nftMintAdvanceValue.tradeValue) > 0 &&
      Number(nftMintAdvanceValue.tradeValue) <= MINT_LIMIT &&
      (nftMintAdvanceValue.image !== undefined ||
        nftMintAdvanceValue.name !== undefined) &&
      nftMintAdvanceValue.nftId &&
      nftMintAdvanceValue.fee &&
      nftMintAdvanceValue.fee.belong &&
      nftMintAdvanceValue.fee.feeRaw &&
      !isFeeNotEnough.isFeeNotEnough &&
      !isNotAvailableCID
    );
  };

  const updateBtnStatus = React.useCallback(
    (error?: ErrorType & any) => {
      resetBtnInfo();
      if (
        !error &&
        checkAvailable({
          nftMintAdvanceValue: nftMintAdvanceValue as any,
          isFeeNotEnough,
          isNotAvailableCID,
        })
      ) {
        enableBtn();
        return;
      }
      if (isNotAvailableCID) {
        setLabelAndParams("labelNFTMintWrongCIDBtn", {});
      } else if (
        (!nftMintAdvanceValue.image && !nftMintAdvanceValue.name) ||
        !(
          nftMintAdvanceValue.royaltyPercentage !== undefined &&
          Number.isInteger(nftMintAdvanceValue.royaltyPercentage / 1) &&
          nftMintAdvanceValue.royaltyPercentage >= 0 &&
          nftMintAdvanceValue.royaltyPercentage <= 10
        )
      ) {
        setLabelAndParams("labelNFTMintNoMetaBtn", {});
      }
      disableBtn();
      myLog("try to disable nftMintAdvance btn!");
    },
    [
      isNotAvailableCID,
      isFeeNotEnough,
      resetBtnInfo,
      nftMintAdvanceValue,
      enableBtn,
      setLabelAndParams,
      disableBtn,
    ]
  );

  useWalletLayer2Socket({});

  React.useEffect(() => {
    updateBtnStatus();
  }, [
    isFeeNotEnough.isFeeNotEnough,
    isNotAvailableCID,
    nftMintAdvanceValue,
    feeInfo,
  ]);

  const resetDefault = React.useCallback(() => {
    checkFeeIsEnough();
    updateNFTMintAdvanceData({
      ...nftMintAdvanceValue,
      tradeValue: 0,
      nftIdView: "",
      image: undefined,
      name: "",
      nftId: undefined,
      description: "",
      // collectionMeta:undefined,
      // tokenAddress,
      fee: feeInfo,
    });
  }, [checkFeeIsEnough, updateNFTMintAdvanceData]);
  const processRequest = React.useCallback(
    async (request: sdk.NFTMintRequestV3, isNotHardwareWallet: boolean) => {
      const { apiKey, connectName, eddsaKey } = account;

      try {
        if (connectProvides.usedWeb3 && LoopringAPI.userAPI) {
          let isHWAddr = checkHWAddr(account.accAddress);

          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true;
          }

          // setLastRequest({ ...request });

          const response = await LoopringAPI.userAPI?.submitNFTMint(
            {
              request,
              web3: connectProvides.usedWeb3,
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
            }
          );

          myLog("submitNFTMintAdvance:", response);

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
                  info: {
                    symbol: nftMintAdvanceValue.name,
                    value: nftMintAdvanceValue.tradeValue,
                    isAdvanceMint: true,
                  },
                });
              } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTMint_First_Method_Denied,
                  info: {
                    symbol: nftMintAdvanceValue.name,
                    value: nftMintAdvanceValue.tradeValue,
                    isAdvanceMint: true,
                  },
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
                  info: {
                    symbol: nftMintAdvanceValue.name,
                    value: nftMintAdvanceValue.tradeValue,
                  },
                  error: response as sdk.RESULT_INFO,
                });
                resetDefault();
              }
            } else if ((response as sdk.TX_HASH_API)?.hash) {
              // Withdraw success
              setShowAccount({
                isShow: true,
                step: AccountStep.NFTMint_In_Progress,
                info: {
                  symbol: nftMintAdvanceValue.name,
                  value: nftMintAdvanceValue.tradeValue,
                },
              });
              setShowAccount({
                isShow: true,
                step: AccountStep.NFTMint_Success,
                info: {
                  symbol: nftMintAdvanceValue.name,
                  value: nftMintAdvanceValue.tradeValue,
                  hash:
                    Explorer +
                    `tx/${(response as sdk.TX_HASH_API)?.hash}-nftMintAdvance`,
                },
              });
              await sdk.sleep(TOAST_TIME);
              history.push("/nft/");
              if (isHWAddr) {
                myLog("......try to set isHWAddr", isHWAddr);
                updateHW({ wallet: account.accAddress, isHWAddr });
              }
              walletLayer2Service.sendUserUpdate();
              updateWalletLayer2NFT({ page });
              resetDefault();
              // checkFeeIsEnough();
            }
          } else {
            resetDefault();
          }
        }
      } catch (reason: any) {
        const code = checkErrorInfo(reason, isNotHardwareWallet);

        if (isAccActivated()) {
          if (code === sdk.ConnectorError.USER_DENIED) {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTMint_Denied,
              info: {
                symbol: nftMintAdvanceValue.name,
                value: nftMintAdvanceValue.tradeValue,
                isAdvanceMint: true,
              },
            });
          } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTMint_First_Method_Denied,
              info: {
                symbol: nftMintAdvanceValue.name,
                value: nftMintAdvanceValue.tradeValue,
                isAdvanceMint: true,
              },
            });
          } else {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTMint_Failed,
              info: {
                symbol: nftMintAdvanceValue.name,
                value: nftMintAdvanceValue.tradeValue,
              },
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
      nftMintAdvanceValue.name,
      nftMintAdvanceValue.tradeValue,
      resetDefault,
      checkFeeIsEnough,
      updateWalletLayer2NFT,
      page,
      updateHW,
    ]
  );

  const handleOnNFTDataChange = React.useCallback(
    async (data: Partial<T>) => {
      let shouldUpdate = {};
      if (
        data.nftIdView &&
        LoopringAPI.nftAPI &&
        nftMintAdvanceValue.nftIdView !== data.nftIdView
      ) {
        setIsNFTCheckLoading(true);
        let nftId: string = "";
        try {
          let cid: string;
          if (/^Qm[a-zA-Z0-9]{44}$/.test(data.nftIdView)) {
            cid = data.nftIdView;
          } else {
            cid = new CID(data.nftIdView).toV0();
          }
          nftId = LoopringAPI.nftAPI.ipfsCid0ToNftID(cid);
          shouldUpdate = {
            nftId,
            // nftIdView: data.nftIdView,
            ...shouldUpdate,
          };
        } catch (error: any) {
          myLog("handleOnNFTDataChange -> data.nftId", error);
          // setIsAvailableId(false);
          setIsNotAvailableCID({
            reason: ErrorMap.IPFS_CID_TO_NFTID_ERROR.messageKey,
          });
          shouldUpdate = {
            nftId: "",
            // nftIdView:'',
          };
        }

        if (nftId && nftId !== "") {
          try {
            const value = await fetch(
              getIPFSString(`${IPFS_HEAD_URL}${data.nftIdView}`, baseURL)
            ).then((response) => response.json());
            let collectionMeta: CollectionMeta | undefined;
            if (value && value.collection_metadata) {
              const collectionMetadata: CollectionMeta = await fetchJsonp(
                getIPFSString(value.collection_metadata, baseURL)
              )
                .then((response) => {
                  debugger;
                  return response.json();
                })
                .catch((error: any) => {
                  console.log("Mint NFT read resource error:", error);
                });

              if (collectionMetadata.contractAddress) {
                const response = await LoopringAPI.userAPI
                  ?.getUserOwenCollection(
                    {
                      owner: account.accAddress,
                      address: collectionMetadata.contractAddress,
                    },
                    account.apiKey
                  )
                  .catch((_error) => {
                    throw new CustomError(ErrorMap.TIME_OUT);
                  });
                if (
                  (response &&
                    ((response as sdk.RESULT_INFO).code ||
                      (response as sdk.RESULT_INFO).message)) ||
                  !response.collections.length
                ) {
                  throw new CustomError(ErrorMap.ERROR_COLLECTION_INFO);
                }

                collectionMeta = (response as any)
                  .collections[0] as CollectionMeta;
                //TODO:  MOCK  and solve the cross domain
                collectionMeta.isCounterFactualNFT = true;
                collectionMeta.nftType = NFT_TYPE_STRING.ERC1155;
                // collectionMeta.name = '';
                if (
                  !collectionMeta.isCounterFactualNFT ||
                  // @ts-ignore
                  collectionMeta.nftType === NFT_TYPE_STRING.ERC721
                ) {
                  throw new CustomError(ErrorMap.ERROR_COLLECTION_NO_SUPPORT);
                }
              } else {
                throw new CustomError(ErrorMap.ERROR_COLLECTION_INFO);
              }

              shouldUpdate = {
                nftId: nftId,
                name: value.name ?? t("labelUnknown"),
                image: value.image,
                collection_metadata: value.collection_metadata,
                description: value.description ?? EmptyValueTag,
                balance: MINT_LIMIT,
                royaltyPercentage: value.royalty_percentage,
                ...shouldUpdate,
                tokenAddress: collectionMeta?.contractAddress,
                collectionMeta: collectionMetadata,
              };
              setIsNotAvailableCID(undefined);
            } else {
              shouldUpdate = {
                nftId: nftId,
                name: undefined,
                image: undefined,
                description: undefined,
                balance: undefined,
                ...shouldUpdate,
              };
              setIsNotAvailableCID({
                reason: ErrorMap.ERROR_COLLECTION_EMPTY.messageKey,
              });
            }
          } catch (error: any) {
            console.log("Mint NFT read resource error:", error);
            shouldUpdate = {
              nftId: nftId,
              name: undefined,
              image: undefined,
              description: undefined,
              balance: undefined,
              ...shouldUpdate,
            };
            setIsNotAvailableCID({ reason: error.messageKey });

            // setIsAvailableId(false);
            // myLog(error);
          }
        }
      } else if (!data.nftIdView) {
        setIsNotAvailableCID(undefined);
        shouldUpdate = {
          nftId: "",
          name: undefined,
          image: undefined,
          description: undefined,
          balance: undefined,
        };
      }
      setIsNFTCheckLoading(false);
      updateNFTMintAdvanceData({
        ...nftMintAdvanceValue,
        ...data,
        ...shouldUpdate,
      });
    },
    [nftMintAdvanceValue, t, updateNFTMintAdvanceData]
  );

  const onNFTMintAdvanceClick = React.useCallback(
    async (_nftMintAdvanceValue, isFirstTime: boolean = true) => {
      let result: ActionResult = { code: ActionResultCode.NoError };
      // pattern="^Qm[a-zA-Z0-9]{44}$"
      if (
        LoopringAPI.userAPI &&
        LoopringAPI.nftAPI &&
        exchangeInfo &&
        account.readyState === AccountStatus.ACTIVATED &&
        nftMintAdvanceValue &&
        nftMintAdvanceValue.collectionMeta?.contractAddress &&
        checkAvailable({
          nftMintAdvanceValue: nftMintAdvanceValue as any,
          isFeeNotEnough,
          isNotAvailableCID,
        })
      ) {
        setShowNFTMintAdvance({ isShow: false });
        setShowAccount({
          isShow: true,
          step: AccountStep.NFTMint_WaitForAuth,
          info: {
            symbol: nftMintAdvanceValue.name,
            value: nftMintAdvanceValue.tradeValue,
          },
        });
        try {
          const { accountId, accAddress, apiKey } = account;
          const fee = sdk.toBig(
            nftMintAdvanceValue?.fee?.feeRaw ??
              nftMintAdvanceValue?.fee?.__raw__?.feeRaw ??
              0
          );
          const feeToken = tokenMap[nftMintAdvanceValue?.fee?.belong ?? ""];
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
            tokenAddress: nftMintAdvanceValue.collectionMeta.contractAddress,
            nftId: nftMintAdvanceValue.nftId ?? "",
            amount: nftMintAdvanceValue.tradeValue?.toString() ?? "",
            validUntil: getTimestampDaysLater(DAYS),
            storageId: storageId?.offchainId,
            maxFee: {
              tokenId: feeToken.tokenId,
              amount: fee.toString(), // TEST: fee.toString(),
            },
            counterFactualNftInfo: {
              nftOwner: account.accAddress,
              nftFactory: sdk.NFTFactory[chainId],
              nftBaseUri: nftMintAdvanceValue.collectionMeta?.baseUri ?? "",
            },
            royaltyPercentage: Math.floor(
              nftMintAdvanceValue?.royaltyPercentage ?? 0
            ),
            forceToMint: false,
          };
          myLog("onNFTMintAdvanceClick req:", req);

          processRequest(req, isFirstTime);
        } catch (e: any) {
          sdk.dumpError400(e);
          // transfer failed
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTMint_Failed,
            info: {
              symbol: nftMintAdvanceValue.name,
              value: nftMintAdvanceValue.tradeValue,
            },
            error: { code: 400, message: e.message } as sdk.RESULT_INFO,
          });
        }
        return;
      } else {
        result.code = ActionResultCode.DataNotReady;
      }
    },
    [
      account,
      chainId,
      checkAvailable,
      exchangeInfo,
      isNotAvailableCID,
      isFeeNotEnough,
      nftMintAdvanceValue,
      processRequest,
      setShowAccount,
      setShowNFTMintAdvance,
      tokenMap,
    ]
  );
  const retryBtn = React.useCallback(
    (isHardwareRetry: boolean = false) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.NFTMint_WaitForAuth,
        info: {
          symbol: nftMintAdvanceValue.name,
          value: nftMintAdvanceValue.tradeValue,
        },
      });
      onNFTMintAdvanceClick({}, isHardwareRetry);
      // processRequest(lastRequest, !isHardwareRetry);
    },
    [
      // lastRequest,
      nftMintAdvanceValue.name,
      nftMintAdvanceValue.tradeValue,
      processRequest,
      setShowAccount,
    ]
  );
  const nftMintAdvanceProps: NFTMintAdvanceProps<T, Co, I> = {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    isNFTCheckLoading,
    isNotAvailableCID,
    collectionInputProps: {
      collectionListProps,
      collection: nftMintAdvanceValue.collectionMeta as Co,
      onSelected: (item) => {
        handleOnNFTDataChange({ collectionMeta: item } as unknown as T);
      },
      domain: LoopringAPI.delegate?.getCollectionDomain() ?? "",
      makeMeta,
    },
    etherscanBaseUrl,
    baseURL,
    getIPFSString,
    handleOnNFTDataChange,
    onNFTMintClick: onNFTMintAdvanceClick,
    walletMap: {} as any,
    coinMap: totalCoinMap as any,
    tradeData: { ...nftMintAdvanceValue } as any,
    nftMintBtnStatus: btnStatus,
    btnInfo,
  };

  return {
    nftMintAdvanceProps,
    retryBtn,
    resetDefault,
  };
};
