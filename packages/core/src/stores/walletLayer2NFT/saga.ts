import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getWalletLayer2NFTStatus, updateWalletLayer2NFT } from './reducer'
import { store, LoopringAPI } from '../../index'
import { CustomError, ErrorMap, MyNFTFilter, NFTLimit } from '@loopring-web/common-resources'
import { PayloadAction } from '@reduxjs/toolkit'

const getWalletLayer2NFTBalance = async <_R extends { [key: string]: any }>({
  page,
  nftDatas,
  collectionId,
  collectionContractAddress,
  filter,
}: {
  page: number
  nftDatas?: string
  collectionId: string | undefined
  collectionContractAddress: string | undefined
  filter?: MyNFTFilter | undefined
}) => {
  const offset = (page - 1) * NFTLimit
  const { accountId, apiKey } = store.getState().account
  if (apiKey && accountId && LoopringAPI.userAPI) {
    let userNFTBalances, totalNum
    if (collectionId) {
      ;({ userNFTBalances, totalNum } = await LoopringAPI.userAPI
        .getUserNFTBalancesByCollection(
          {
            accountId,
            tokenAddress: collectionContractAddress!,
            collectionId: Number(collectionId),
            limit: NFTLimit,
            offset,
            nonZero: true,
            metadata: true, // close metadata
            ...(nftDatas ? { nftDatas } : {}),
            ...(filter ?? {}),
          },
          apiKey,
        )
        .catch((_error) => {
          throw new CustomError(ErrorMap.TIME_OUT)
        }))
    } else {
      ;({ userNFTBalances, totalNum } = await LoopringAPI.userAPI
        .getUserNFTBalances(
          {
            accountId,
            // @ts-ignore
            tokenAddress: collectionContractAddress ?? undefined,
            limit: NFTLimit,
            offset,
            nonZero: true,
            metadata: true, // close metadata
            ...(nftDatas ? { nftDatas } : {}),
            ...(filter ?? {}),
          },
          apiKey,
        )
        .catch((_error) => {
          throw new CustomError(ErrorMap.TIME_OUT)
        }))
    }

    return {
      walletLayer2NFT: userNFTBalances ?? [],
      total: totalNum,
      collection: {
        contractAddress: collectionContractAddress,
        id: collectionId,
      },
      filter,
      page,
    }
  }
  return {}
}

export function* getPostsSaga({
  payload: { page = 1, collectionId, collectionContractAddress, nftDatas, filter },
}: PayloadAction<{
  page?: number
  nftDatas?: string
  // collection: CollectionMeta | undefined;
  collectionId: string | undefined
  collectionContractAddress: string | undefined
  filter?: MyNFTFilter | undefined
}>) {
  try {
    // @ts-ignore
    const walletLayer2NFT: any = yield call(getWalletLayer2NFTBalance, {
      page,
      nftDatas,
      collectionId,
      collectionContractAddress,
      filter,
    })
    yield put(getWalletLayer2NFTStatus({ ...walletLayer2NFT }))
  } catch (err) {
    yield put(getWalletLayer2NFTStatus({ error: err }))
  }
}

export function* walletLayer2NFTSaga() {
  yield all([takeLatest(updateWalletLayer2NFT, getPostsSaga)])
}

export const walletLayer2NFTFork = [fork(walletLayer2NFTSaga)]
