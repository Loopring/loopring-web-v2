import {
  AccountStatus,
  IPFS_META_URL,
  myLog,
  NFTWholeINFO,
  SagaStatus,
} from "@loopring-web/common-resources";
import { useAccount } from "stores/account";
import React from "react";
import { LoopringAPI } from "api_wrapper";
import { connectProvides } from "@loopring-web/web3-provider";
import { useSystem } from "stores/system";
import { useWalletLayer2 } from "stores/walletLayer2";
import {
  LOOPRING_URLs,
  NftData,
  NFTTokenInfo,
} from "@loopring-web/loopring-sdk";
import { useModalData } from "stores/router";
import { useOpenModals } from "@loopring-web/component-lib";
import { BigNumber } from "bignumber.js";
import { useNFTDeposit } from "hooks/useractions/useNFTDeposit";
import { useNFTMint } from "hooks/useractions/useNFTMint";

BigNumber.config({ EXPONENTIAL_AT: 100 });
export const useMyNFT = () => {
  const [nftList, setNFTList] = React.useState<Partial<NFTWholeINFO>[]>([]);
  const { account } = useAccount();
  const [isShow, setIsShow] = React.useState(false);
  const [popItem, setPopItem] = React.useState<
    Partial<NFTWholeINFO> | undefined
  >(undefined);
  const { status: walletLayer2Status, nftLayer2 } = useWalletLayer2();
  const { updateNFTTransferData, updateNFTWithdrawData, updateNFTDeployData } =
    useModalData();

  const {
    setShowNFTTransfer,
    setShowNFTWithdraw,
    setShowNFTDeposit,
    setShowNFTMint,
    modals: { isShowNFTDeposit, isShowNFTMint },
  } = useOpenModals();
  const { etherscanBaseUrl } = useSystem();
  const { nftDepositProps } = useNFTDeposit();
  const { nftMintProps } = useNFTMint();

  const onDetailClose = React.useCallback(() => setIsShow(false), []);
  const popNFTDeposit = React.useCallback(
    () => setShowNFTDeposit({ isShow: true }),
    []
  );
  const onNFTDepositClose = React.useCallback(
    () => setShowNFTDeposit({ isShow: false }),
    []
  );
  const popNFTMint = React.useCallback(
    () => setShowNFTMint({ isShow: true }),
    []
  );
  const onNFTMintClose = React.useCallback(
    () => setShowNFTMint({ isShow: false }),
    []
  );
  const infoDetail = async (item: Partial<NFTWholeINFO>) => {
    const nftData: NftData = item.nftData as NftData;
    let [nftMap, isDeployed] = await Promise.all([
      LoopringAPI?.nftAPI?.getInfoForNFTTokens({
        nftDatas:
          // [item.tokenAddress]
          [nftData],
      }),
      LoopringAPI?.delegate
        ?.getCode(item.tokenAddress ?? "")
        .then(({ result: code }: any) => {
          return code && code.startsWith("0x") && code.length > 2;
        }),
    ]);
    const nftToken: Partial<NFTTokenInfo> =
      nftMap && nftMap[nftData as NftData] ? nftMap[nftData as NftData] : {};
    // isDeployed = !isDeployed;
    let tokenInfo: NFTWholeINFO = {
      ...item,
      isDeployed,
      ...nftToken,
    } as NFTWholeINFO;
    const _id = new BigNumber(tokenInfo.nftId ?? "0", 16);
    tokenInfo = {
      ...tokenInfo,
      nftIdView: _id.toString(),
      nftBalance: tokenInfo.total ? Number(tokenInfo.total) : 0,
    };
    if (!tokenInfo.isDeployed) {
      const cid = LoopringAPI?.nftAPI?.ipfsNftIDToCid(tokenInfo.nftId);
      const image = LOOPRING_URLs.IPFS_META_URL + cid;
      tokenInfo = {
        ...tokenInfo,
        image,
        isFailedLoadMeta: false,
      };
    } else if (!tokenInfo.name) {
      const meta = await LoopringAPI?.nftAPI?.getContractNFTMeta({
        _id: _id.toString(),
        nftId: tokenInfo.nftId,
        web3: connectProvides.usedWeb3,
        tokenAddress: tokenInfo.tokenAddress,
      });
      if (meta && (meta.name || meta.image)) {
        tokenInfo = {
          ...tokenInfo,
          ...meta,
          isFailedLoadMeta: false,
        };
      } else {
        tokenInfo = {
          ...tokenInfo,
          isFailedLoadMeta: true,
        };
      }
    } else {
      tokenInfo = {
        ...tokenInfo,
        isFailedLoadMeta: false,
      };
    }
    return tokenInfo;
  };

  const onDetail = React.useCallback(
    async (item: Partial<NFTWholeINFO>) => {
      const tokenInfo = await infoDetail(item);
      if (!tokenInfo.isDeployed) {
        await LoopringAPI.userAPI?.getAvailableBroker().then(({ broker }) => {
          updateNFTDeployData({ broker });
        });
        updateNFTDeployData(tokenInfo);
      } else {
        updateNFTWithdrawData(tokenInfo);
      }
      setPopItem(tokenInfo);
      updateNFTTransferData(tokenInfo);
      setShowNFTTransfer({ isShow: false, ...tokenInfo });
      setShowNFTWithdraw({ isShow: false, ...tokenInfo });
      setIsShow(true);
    },
    [setShowNFTTransfer, updateNFTTransferData, updateNFTWithdrawData]
  );
  const onNFTError = (item: Partial<NFTWholeINFO>, index?: number) => {
    let _index = index;

    setNFTList((state) => {
      if (index === undefined) {
        _index = state.findIndex(
          (_item) =>
            _item.tokenAddress === item.tokenAddress &&
            _item.nftId === item.tokenAddress
        );
      }
      if (_index) {
        state[_index] = {
          ...state[_index],
          isFailedLoadMeta: true,
        };
      }
      return state;
    });
  };
  const onNFTReload = async (item: Partial<NFTWholeINFO>, index?: number) => {
    const tokenInfo = await infoDetail(item);
    let _index = index;

    setNFTList((state) => {
      if (index === undefined) {
        _index = state.findIndex(
          (_item) =>
            _item.tokenAddress === item.tokenAddress &&
            _item.nftId === item.tokenAddress
        );
      }
      if (_index) {
        state[_index] = {
          ...state[_index],
          ...tokenInfo,
        };
      }
      return state;
    });
  };
  // const loadNFT = React.useCallback(async  (item: Partial<NFTWholeINFO>, index:number)=>{
  //
  // },[])

  React.useEffect(() => {
    if (
      account.readyState === AccountStatus.ACTIVATED &&
      walletLayer2Status === SagaStatus.UNSET
    ) {
      initNFT();
    }
  }, [walletLayer2Status]);
  const initNFT = React.useCallback(async () => {
    let mediaPromise: any[] = [];
    for (const { nftId, tokenAddress } of nftLayer2) {
      if (tokenAddress && nftId) {
        const _id = new BigNumber(nftId ?? "", 16);
        myLog("nftId", _id, _id.toString());
        mediaPromise.push(
          LoopringAPI?.nftAPI?.getContractNFTMeta({
            _id: _id.toString(),
            // @ts-ignore
            nftId,
            web3: connectProvides.usedWeb3,
            tokenAddress,
          })
        );
      }
    }
    const meta: any[] = await Promise.all(mediaPromise);
    setNFTList(
      nftLayer2.map((item, index) => {
        return {
          ...item,
          ...meta[index],
          etherscanBaseUrl,
        };
      })
    );
  }, [etherscanBaseUrl, nftLayer2]);

  return {
    nftList,
    isShow,
    popItem,
    onDetail,
    etherscanBaseUrl,
    onDetailClose,
    isShowNFTDeposit,
    isShowNFTMint,
    nftDepositProps,
    onNFTDepositClose,
    onNFTMintClose,
    nftMintProps,
    popNFTDeposit,
    popNFTMint,
    onNFTError,
    onNFTReload,
    nftLayer2,
  };
};
