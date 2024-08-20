import { all, call, fork, put, take, takeLatest, delay } from 'redux-saga/effects'
import { getSystemStatus, updateRealTimeObj, updateSystem } from './reducer'
import { ENV } from './interface'
import { store, LoopringSocket, LoopringAPI, toggleCheck, makeVault } from '../../index'
import {
  ChainIdExtends,
  CustomError,
  DEFI_CONFIG,
  DUAL_CONFIG,
  ErrorMap,
  ForexMap,
  LocalStorageConfigKey,
  LEVERAGE_ETH_CONFIG,
  MapChainId,
  myLog,
  TokenPriceBase,
  CurrencyToTag,
  SUPPORTING_NETWORKS,
} from '@loopring-web/common-resources'
import { statusUnset as accountStatusUnset } from '../account/reducer'
import { getAmmMap, initAmmMap } from '../Amm/AmmMap/reducer'
import { getTickers } from '../ticker/reducer'
import { getAmmActivityMap } from '../Amm/AmmActivityMap/reducer'
import { updateWalletLayer1 } from '../walletLayer1/reducer'
import { getTokenMap } from '../token/reducer'
import { getNotify } from '../notify/reducer'
import { getTokenPrices } from '../tokenPrices/reducer'
import { getInvestTokenTypeMap } from '../invest/InvestTokenTypeMap/reducer'
import { getDualMap } from '../invest/DualMap/reducer'
import { getStakingMap } from '../invest/StakingMap/reducer'
import { clearAll as clearWalletInfoAll } from '../localStore/walletInfo'

import * as sdk from '@loopring-web/loopring-sdk'
import { getRedPacketConfigs } from '../redPacket/reducer'
import { getBtradeMap, getBtradeMapStatus } from '../invest/BtradeMap/reducer'
import { setShowGlobalToast } from '@loopring-web/component-lib'
import { updateDualSyncMap } from '../invest/DualMap/reducer'
import { updateDefiSyncMap } from '../invest/DefiMap/reducer'
import { getVaultMap, updateVaultSyncMap } from '../invest/VaultMap/reducer'
import { getVaultTickers } from '../invest/VaultTicker/reducer'
import { getExclusiveRedpacket } from '../targetRedpackt/reducer'
import { promiseAllSequently } from '../../utils/promise'

enum ENV_KEY {
  Bridge = 'bridge',
  LoopringIo = 'loopring.io',
  Earn = 'earn',
  Guardian = 'guardian',
}
export const defiAllAsync = async () => {
  if (LoopringAPI.defiAPI) {
    let { raw_data } = await LoopringAPI.defiAPI?.getDefiMarkets({})
    // const { baseURL } = store.getState().system
    const { defaultNetwork } = store.getState().settings
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]
    const [
      dualMap,
      { markets: marketMap, tokenArr: marketCoins, marketArr: marketArray },
      { markets: marketLeverageMap, tokenArr: marketLeverageCoins, marketArr: marketLeverageArray },
    ] = [
      sdk.makeInvestMarkets(raw_data, DUAL_CONFIG.products[network].join(',')),
      sdk.makeInvestMarkets(raw_data, DEFI_CONFIG.products[network].join(',')),
      sdk.makeInvestMarkets(raw_data, LEVERAGE_ETH_CONFIG.products[network].join(',')),
    ]
    store.dispatch(updateDualSyncMap({ dualMap }))
    // store.dispatch(updateDefiSyncMap({ dualMap }))
    store.dispatch(
      updateDefiSyncMap({
        defiMap: {
          marketArray,
          marketCoins,
          marketMap,
          marketLeverageMap,
          marketLeverageCoins,
          marketLeverageArray,
        },
      }),
    )
  }
}

const initConfig = function* <_R extends { [key: string]: any }>(
  _chainId: sdk.ChainId | 'unknown',
) {
  const APP_NAME = process.env?.REACT_APP_NAME ?? 'loopring.io'
  const { chainId } = store.getState().system
  const _tokenMap = JSON.parse(window.localStorage.getItem('tokenMap') ?? '{}')[chainId]
  const _ammpools = JSON.parse(window.localStorage.getItem('ammpools') ?? '{}')[chainId]
  const _markets = JSON.parse(window.localStorage.getItem('markets') ?? '{}')[chainId]
  const _btradeMarkets = JSON.parse(window.localStorage.getItem('btradeMarkets') ?? '{}')[chainId]
  const _vaultMarkets = JSON.parse(
    window.localStorage.getItem(LocalStorageConfigKey.vaultMarkets) ?? '{}',
  )[chainId]
  const _vaultTokenMap = JSON.parse(
    window.localStorage.getItem(LocalStorageConfigKey.vaultTokenMap) ?? '{}',
  )[chainId]
  const _disableWithdrawTokenList = JSON.parse(
    window.localStorage.getItem(LocalStorageConfigKey.disableWithdrawTokenList) ?? '{}',
  )[chainId]
  let tokensMap,
    coinMap,
    totalCoinMap,
    idIndex,
    addressIndex,
    tokenListRaw,
    markets,
    ammpools,
    pairs,
    marketArr,
    tokenArr,
    disableWithdrawTokenList,
    ammpoolsRaw,
    disableWithdrawTokenListRaw,
    marketRaw
  // const { checkHWAddr, updateHW } = useWalletInfo()
  store.dispatch(clearWalletInfoAll(undefined))
  if (_tokenMap && _ammpools && _markets && _disableWithdrawTokenList) {
    myLog('tokenConfig, ammpoolConfig, markets, disableWithdrawTokenList from local storge')
    const resultTokenMap = sdk.makeMarket(_tokenMap)
    tokensMap = resultTokenMap.tokensMap
    coinMap = resultTokenMap.coinMap
    totalCoinMap = resultTokenMap.totalCoinMap
    idIndex = resultTokenMap.idIndex
    addressIndex = resultTokenMap.addressIndex

    const resultMarket = sdk.makeMarkets(_markets)
    markets = resultMarket.markets
    pairs = resultMarket.pairs
    marketArr = resultMarket.marketArr
    tokenArr = resultMarket.tokenArr
    ammpools = sdk.makeAmmPool(_ammpools)?.ammpools

    store.dispatch(
      getTokenMap({
        tokensMap,
        coinMap,
        totalCoinMap,
        idIndex,
        addressIndex,
        marketMap: markets,
        pairs,
        marketArr,
        tokenArr,
        disableWithdrawTokenList: [..._disableWithdrawTokenList],
      }),
    )
    store.dispatch(initAmmMap({ ammpools, chainId }))
    try {
      store.dispatch(updateVaultSyncMap(makeVault(_vaultTokenMap, _vaultMarkets, 'isFormLocal')))
    } catch (e) {}
    ;(function (btradeMarkets) {
      if (btradeMarkets) {
        const {
          markets: marketMap,
          pairs,
          marketArr: marketArray,
          tokenArr: marketCoins,
        } = sdk.makeMarkets({ markets: btradeMarkets })
        const tradeMap = Reflect.ownKeys(pairs ?? {}).reduce((prev, key) => {
          const tradePairs = pairs[key as string]?.tokenList?.sort()
          prev[key] = {
            ...pairs[key as string],
            tradePairs,
          }
          return prev
        }, {})
        if (!marketArray?.length) {
          store.dispatch(
            getBtradeMapStatus({
              marketArray,
              marketCoins,
              marketMap,
              tradeMap,
            }),
          )
        }
      }
    })(_btradeMarkets)

    yield delay(1)
    store.dispatch(getTokenPrices(undefined))
    if (!Object.keys(store.getState().tokenPrices).length) {
      yield take('tokenPrices/getTokenPricesStatus')
    }
    store.dispatch(getTickers({ tickerKeys: marketArr }))
    yield take('tickerMap/getTickerStatus')
    store.dispatch(getAmmMap({ ammpools }))
    yield take('ammMap/getAmmMapStatus')
    store.dispatch(getAmmActivityMap({ ammpools }))
    myLog('getTokenPricesStatus update')

    Promise.all([
      LoopringAPI.exchangeAPI?.getTokens(),
      LoopringAPI.ammpoolAPI?.getAmmPoolConf(),
      LoopringAPI.exchangeAPI?.getMixMarkets(),
      LoopringAPI.exchangeAPI?.disableWithdrawTokenList() ?? {
        disableWithdrawTokenList: [],
        raw_data: undefined,
      },
    ]).then(
      ([
        { tokensMap, coinMap, totalCoinMap, idIndex, addressIndex, raw_data: tokenListRaw },
        { ammpools, raw_data: ammpoolsRaw },
        { pairs, marketArr, tokenArr, markets, raw_data: marketRaw },
        { disableWithdrawTokenList, raw_data: disableWithdrawTokenListRaw },
      ]: any) => {
        store.dispatch(
          getTokenMap({
            tokensMap,
            coinMap,
            totalCoinMap,
            idIndex,
            addressIndex,
            marketMap: markets,
            pairs,
            marketArr,
            tokenArr,
            disableWithdrawTokenList,
            tokenListRaw,
            disableWithdrawTokenListRaw,
            marketRaw,
          }),
        )
        store.dispatch(
          getTokenMap({
            tokensMap,
            coinMap,
            totalCoinMap,
            idIndex,
            addressIndex,
            marketMap: markets,
            pairs,
            marketArr,
            tokenArr,
            disableWithdrawTokenList,
            tokenListRaw,
            disableWithdrawTokenListRaw,
            marketRaw,
          }),
        )
        // myLog(
        //   "tokenConfig, ammpoolConfig, markets, disableWithdrawTokenList update from server-side update"
        // );
        store.dispatch(getAmmMap({ ammpools, ammpoolsRaw, chainId }))
        store.dispatch(getAmmActivityMap({ ammpools }))
      },
    )
  } else {
    ;[
      { tokensMap, coinMap, totalCoinMap, idIndex, addressIndex, raw_data: tokenListRaw },
      { ammpools, raw_data: ammpoolsRaw },
      { pairs, marketArr, tokenArr, markets, raw_data: marketRaw },
      { disableWithdrawTokenList, raw_data: disableWithdrawTokenListRaw },
    ] = yield all([
      call(async () => LoopringAPI.exchangeAPI?.getTokens()),
      call(async () => LoopringAPI.ammpoolAPI?.getAmmPoolConf()),
      call(async () => LoopringAPI.exchangeAPI?.getMixMarkets()),
      call(async () => {
        try {
          return await LoopringAPI.exchangeAPI?.disableWithdrawTokenList()
        } catch (e: any) {
          return {
            disableWithdrawTokenList: [],
            raw_data: undefined,
          }
        }
      }),
    ])
    myLog(
      'tokenConfig, ammpoolConfig, markets, disableWithdrawTokenList update from server-side init',
    )
    store.dispatch(
      getTokenMap({
        tokensMap,
        coinMap,
        totalCoinMap,
        idIndex,
        addressIndex,
        marketMap: markets,
        pairs,
        marketArr,
        tokenArr,
        disableWithdrawTokenList,
        tokenListRaw,
        disableWithdrawTokenListRaw,
        marketRaw,
      }),
    )
    store.dispatch(initAmmMap({ ammpools }))
    yield take('tokenMap/getTokenMapStatus')
    store.dispatch(getTokenPrices(undefined))
    yield take('tokenPrices/getTokenPricesStatus')
    store.dispatch(getTickers({ tickerKeys: marketArr }))
    yield take('tickerMap/getTickerStatus')
    store.dispatch(getAmmMap({ ammpools, ammpoolsRaw, chainId }))
    yield take('ammMap/getAmmMapStatus')
    store.dispatch(getAmmActivityMap({ ammpools }))
    if (store.getState().tokenMap.status === 'ERROR') {
      throw new CustomError({ ...ErrorMap.NO_SDK, message: 'tokenMap Error' })
    }
  }

  //APP_NAME
  switch (APP_NAME.toLowerCase()) {
    case ENV_KEY.Bridge.toLowerCase():
    case ENV_KEY.Guardian.toLowerCase():
      break
    case ENV_KEY.Earn.toLowerCase():
      store.dispatch(getDualMap(undefined))
      defiAllAsync()
      yield all([take('dualMap/getDualMapStatus')])
      store.dispatch(getInvestTokenTypeMap(undefined))
      break
    case ENV_KEY.LoopringIo.toLowerCase():
    default:
      store.dispatch(getRedPacketConfigs(undefined))
      store.dispatch(getNotify(undefined))
      store.dispatch(getStakingMap(undefined))
      store.dispatch(getBtradeMap(undefined))
      store.dispatch(getVaultMap(undefined))
      defiAllAsync()
      yield take('vaultMap/getVaultMapStatus')
      store.dispatch(getVaultTickers(undefined))
      yield all([
        take('defiMap/getDefiMapStatus'),
        take('dualMap/getDualMapStatus'),
        take('stakingMap/getStakingMapStatus'),
      ])
      store.dispatch(getInvestTokenTypeMap(undefined))

      break
  }

  yield delay(5)
  const { account, walletLayer1 } = store.getState()
  if (account.accAddress && walletLayer1.walletLayer1 === undefined) {
    store.dispatch(updateWalletLayer1(undefined))
  }
  store.dispatch(accountStatusUnset(undefined))
}
const should15MinutesUpdateDataGroup = async (
  chainId: sdk.ChainId,
): Promise<{
  gasPrice: number | undefined
  forexMap: ForexMap
}> => {
  // const { defaultNetwork } = store.getState().settings
  const network = MapChainId[chainId] ?? MapChainId[1]
  if (LoopringAPI.exchangeAPI && TokenPriceBase[network]) {
    let indexUSD = 0
    const tokenAddress = TokenPriceBase[network] //addressIndex[TokenPriceBase[network]];
    // const tokenId =
    //   chainId === sdk.ChainId.GOERLI
    //     ? '0xd4e71c4bb48850f5971ce40aa428b09f242d3e8a'
    //     : '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    
    const promiseArray = Object.keys(CurrencyToTag).map((key, index) => {
      if (key.toString().toUpperCase() === sdk.Currency.usd.toUpperCase()) {
        indexUSD = index
      }
      return () => (
        LoopringAPI?.exchangeAPI?.getLatestTokenPrices({
          currency: CurrencyToTag[key].toString(),
          tokens: tokenAddress,
        }) ?? Promise.resolve({ tokenPrices: null })
      )
    })
    const restForexs = await promiseAllSequently(promiseArray)

    const { gasPrice } = await LoopringAPI.exchangeAPI.getGasPrice();
    const baseUsd = restForexs[indexUSD].tokenPrices[tokenAddress] ?? 1
    const forexMap: ForexMap = Object.keys(CurrencyToTag).reduce<ForexMap>((prev, key, index) => {
      if (restForexs[index] && key && restForexs[index].tokenPrices) {
        // @ts-ignore
        prev[CurrencyToTag[key]] = Number(restForexs[index].tokenPrices[tokenAddress] / baseUsd)
      }
      return prev
    }, {} as ForexMap)

    return {
      gasPrice,
      forexMap,
    }
  }
  return {
    forexMap: {} as ForexMap,
    gasPrice: undefined,
  }
}

const getSystemsApi = async <_R extends { [key: string]: any }>(_chainId: any) => {
  const extendsChain: string[] = (SUPPORTING_NETWORKS ?? []) 
  .filter(
    (item) => ![1, 5, 11155111].includes(Number(item)),
  )
  const env =
    window.location.hostname === 'localhost'
      ? ENV.DEV
      : sdk.ChainId.SEPOLIA === Number(_chainId)
      ? ENV.UAT
      : ENV.PROD
  const chainId: sdk.ChainId = (
    SUPPORTING_NETWORKS.includes(_chainId.toString()) ? Number(_chainId) : ChainIdExtends.NONETWORK
  ) as sdk.ChainId
  if (_chainId === ChainIdExtends.NONETWORK) {
    throw new CustomError(ErrorMap.NO_NETWORK_ERROR)
  } else {
    LoopringAPI.InitApi(chainId as sdk.ChainId)
    if (LoopringAPI.exchangeAPI && LoopringAPI.walletAPI) {
      let baseURL, socketURL
      if (extendsChain.includes(chainId.toString())) {
        const socketPrefix = 'ws.' // process.env['REACT_APP_API_WS_' + chainId.toString() + '_PREFIX'] ?? ''
        baseURL = `https://${process.env['REACT_APP_API_URL_' + chainId.toString()]}`
        socketURL = `wss://${socketPrefix}${
          process.env['REACT_APP_API_URL_' + chainId.toString()]
        }/v3/ws`
      } else {
        if (sdk.ChainId.MAINNET === chainId) {
          baseURL = `https://${process.env.REACT_APP_API_URL_1}`
          socketURL = `wss://ws.${process.env.REACT_APP_API_URL_1}/v3/ws`
        } else {
          
          let socketPrefix = 'ws.' // process.env['REACT_APP_API_WS_' + chainId.toString() + '_PREFIX'] ?? ''
          baseURL = `https://${process.env.REACT_APP_API_URL_11155111}`
          socketURL = `wss://${socketPrefix}${process.env.REACT_APP_API_URL_11155111}/v3/ws`
          // @ts-ignore
          sdk.NFTFactory_Collection[sdk.ChainId.SEPOLIA] =
            process.env[
              `REACT_APP_SEPOLIA_${
                /dev\.loopring\.io/.test(process.env?.REACT_APP_API_URL_11155111 ?? '') ? 'DEV' : 'UAT'
              }_NFT_FACTORY_COLLECTION`
            ]
        }
      }
      LoopringAPI.setBaseURL(baseURL)
      if (process.env && process.env[`REACT_APP_WALLET_API_URL_${chainId}`]) {
        LoopringAPI.walletAPI?.setBaseUrl('https://' + process.env[`REACT_APP_WALLET_API_URL_${chainId}`]!)
      }
      const etherscanBaseUrl =
        sdk.ChainId.MAINNET === chainId
          ? `https://etherscan.io/`
          : sdk.ChainId.SEPOLIA === chainId
          ? `https://sepolia.etherscan.io/`
          : process.env[`REACT_APP_EXPLORER_URL_${chainId}`]
      
      let allowTrade, exchangeInfo
      try {
        const _exchangeInfo = JSON.parse(
          window.localStorage.getItem(LocalStorageConfigKey.exchangeInfo) ?? '{}',
        )
        ;[{ exchangeInfo }, allowTrade] = await Promise.all([
          _exchangeInfo[chainId]
            ? Promise.resolve({ exchangeInfo: _exchangeInfo[chainId] })
            : LoopringAPI.exchangeAPI.getExchangeInfo().then(({ exchangeInfo }) => {
                myLog('exchangeInfo from service because no localstorage ')
                window.localStorage.setItem(
                  LocalStorageConfigKey.exchangeInfo,
                  JSON.stringify({
                    ..._exchangeInfo,
                    [exchangeInfo.chainId]: exchangeInfo,
                  }),
                )
                return { exchangeInfo }
              }),
          // should15MinutesUpdateDataGroup(chainId),
          LoopringAPI.walletAPI.getAccountServices({}).then((result) => {
            return {
              ...result,
              legal: (result as any)?.raw_data?.legal ?? { enable: false },
            }
          }),
          toggleCheck(
            chainId,
            process.env.REACT_APP_DEX_TOGGLE,
            process.env.REACT_APP_DEX_WHITELIST,
          ),
        ])
        if (_exchangeInfo[chainId]) {
          LoopringAPI.exchangeAPI.getExchangeInfo().then(async ({ exchangeInfo }: any) => {
            window.localStorage.setItem(
              LocalStorageConfigKey.exchangeInfo,
              JSON.stringify({
                ..._exchangeInfo,
                [exchangeInfo.chainId]: exchangeInfo,
              }),
            )
            if (
              _exchangeInfo[exchangeInfo.chainId]?.exchangeAddress?.toLowerCase() !==
              exchangeInfo?.exchangeAddress?.toLowerCase()
            ) {
              await sdk.sleep(500)
              window.location.reload()
            }

            myLog('exchangeInfo from service')
          })
        }
      } catch (e: any) {
        allowTrade = {
          defiInvest: { enable: false },
          register: { enable: false },
          order: { enable: false },
          joinAmm: { enable: false },
          dAppTrade: { enable: false },
          raw_data: { enable: false },
          legal: { enable: false },
        }
        setShowGlobalToast({
          isShow: true,
          info: {
            content: ErrorMap.NO_SDK,
          },
        })
      }

      // @ts-ignore
      ;(window as any).loopringSocket = new LoopringSocket(socketURL)

      const updateForexGasPrice = () => {
        if (!LoopringAPI.exchangeAPI) return
        should15MinutesUpdateDataGroup(chainId).then(({ forexMap, gasPrice }) => {
          store.dispatch(updateRealTimeObj({ forexMap, gasPrice }))
        })
      }
      let { __timer__ } = store.getState().system
      __timer__ = ((__timer__) => {
        if (__timer__ && __timer__ !== -1) {
          clearInterval(__timer__ as NodeJS.Timeout)
        }
        return setInterval(async () => {
          updateForexGasPrice()
        }, 300000) //
      })(__timer__)
      updateForexGasPrice()
      return {
        allowTrade,
        chainId,
        etherscanBaseUrl,
        env,
        baseURL,
        socketURL,
        exchangeInfo,
        __timer__,
      }
    }
  }
}

export function* getUpdateSystem({ payload }: any) {
  try {
    const { chainId } = payload
    
    const {
      env,
      baseURL,
      allowTrade,
      fiatPrices,
      exchangeInfo,
      gasPrice,
      forexMap,
      etherscanBaseUrl,
      __timer__,
    } = yield call(getSystemsApi, chainId)

    yield put(
      getSystemStatus({
        env,
        dexToggleUrl: process.env.REACT_APP_DEX_TOGGLE,
        baseURL,
        allowTrade,
        fiatPrices,
        gasPrice,
        forexMap,
        exchangeInfo,
        etherscanBaseUrl,
        __timer__,
      }),
    )
    yield call(initConfig, chainId)
  } catch (err) {
    yield put(getSystemStatus({ error: err }))
  }
}

function* systemSaga() {
  yield all([takeLatest(updateSystem, getUpdateSystem)])
}

export const systemForks = [fork(systemSaga)]
