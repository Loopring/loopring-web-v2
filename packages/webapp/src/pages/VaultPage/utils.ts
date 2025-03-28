import { DAYS, getTimestampDaysLater, LoopringAPI, NETWORKEXTEND, VaultLayer2Map } from "@loopring-web/core"
import { ChainId, ConnectorNames, toBig, VaultToken } from "@loopring-web/loopring-sdk"
import { ConnectProviders, connectProvides } from "@loopring-web/web3-provider"

import {
  SUBMIT_PANEL_CHECK,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  numberFormat,
  store,
  // useVaultSwap,
  MAPFEEBIPS,
  vaultSwapDependAsync,
  bignumberFix
} from '@loopring-web/core'
import { utils, BigNumber } from 'ethers'
import Decimal from 'decimal.js'
import _, { keys } from 'lodash'
import { promiseAllSequently } from "@loopring-web/core/src/utils/promise"
import { updateVaultLayer2 } from "@loopring-web/core/src/stores/vaultLayer2/reducer"

const checkIfNeedRepay = (symbol: string) => {
  const {
    vaultLayer2: { vaultLayer2 },
    invest: {
      vaultMap: {
        tokenMap
      },
    },
  } = store.getState()
  const asset = vaultLayer2?.[symbol]
  const tokenInfo = tokenMap[symbol]
  if (!asset) return false
  
  const minLoanAmount = tokenInfo?.vaultTokenAmounts?.minLoanAmount
  const repayVolume = BigNumber.from(asset.borrowed).lte(BigNumber.from(asset.total)) 
    ? asset.borrowed 
    : asset.total
  return new Decimal(asset?.borrowed ?? '0').gt('0') &&
    new Decimal(asset?.total ?? '0').gt('0') &&
    (!minLoanAmount || toBig(repayVolume ?? '0').gte(minLoanAmount))
}

export const checkHasTokenNeedRepay = () => {
  const {
    vaultLayer2: { vaultLayer2 },
  } = store.getState()
  return vaultLayer2
    ? keys(vaultLayer2).filter((symbol) => checkIfNeedRepay(symbol) && symbol !== 'undefined')
    : []
}

export const repayIfNeeded = async (symbol: string) => {
  
  const {
    vaultLayer2: { vaultLayer2 },
    invest: {
      vaultMap: {
        tokenMap,
      },
    },
    system: { exchangeInfo, chainId },
    account
  } = store.getState()
  const asset = vaultLayer2?.[symbol]
  const tokenInfo = tokenMap[symbol] as VaultToken
  if (!checkIfNeedRepay(symbol)) return
  const [{ broker }, { offchainId }] = await Promise.all([
    LoopringAPI.userAPI!.getAvailableBroker({
      type: 4,
    }),
    LoopringAPI.userAPI!.getNextStorageId(
      {
        accountId: account.accountId,
        sellTokenId: tokenInfo.vaultTokenId,
      },
      account.apiKey,
    ),
  ])
  const volume = BigNumber.from(asset!.borrowed).lte(BigNumber.from(asset!.total)) 
    ? asset!.borrowed 
    : asset!.total
  const volumeFixed = bignumberFix(
    BigNumber.from(volume),
    tokenInfo.decimals,
    tokenInfo.vaultTokenAmounts.qtyStepScale,
    'FLOOR'
  )
    

  const request = {
    exchange: exchangeInfo!.exchangeAddress,
    payerAddr: account.accAddress,
    payerId: account.accountId,
    payeeId: 0,
    payeeAddr: broker,
    storageId: offchainId,
    token: {
      tokenId: tokenInfo.vaultTokenId,
      volume: volumeFixed.toString(),
    },
    maxFee: {
      tokenId: tokenInfo.vaultTokenId,
      volume: '0',
    },
    validUntil: getTimestampDaysLater(DAYS),
    memo: '',
  }
  console.log('asdhjakshdjkha repayIfNeeded', symbol, request)

  return await LoopringAPI.vaultAPI?.submitVaultRepay(
    {
    
      request: request,
      web3: connectProvides.usedWeb3 as any,
      chainId: chainId === NETWORKEXTEND.NONETWORK ? ChainId.MAINNET : chainId,
      walletType: (ConnectProviders[account.connectName] ??
        account.connectName) as unknown as ConnectorNames,
      eddsaKey: account.eddsaKey.sk,
      apiKey: account.apiKey,
    },
    {
      accountId: account.accountId,
      counterFactualInfo: account.eddsaKey.counterFactualInfo,
    },
    '1'
  )
}

const recursiveCheckHash = async (hash: string): Promise<{
  operation: sdk.VaultOperation;
  order: sdk.VaultOrder;
  raw_data: {
    operation: sdk.VaultOperation;
    order: sdk.VaultOrder;
};
}> => {
  const { account } = store.getState()
  return LoopringAPI.vaultAPI!.getVaultGetOperationByHash(
    {
      accountId: account.accountId as any,
      // @ts-ignore
      hash: hash,
    },
    account.apiKey,
    '1',
  ).then((res) => {
    if (res.operation.status === sdk.VaultOperationStatus.VAULT_STATUS_PROCESSING || res.operation.status === sdk.VaultOperationStatus.VAULT_STATUS_PENDING) {
      return sdk.sleep(2000)
      .then(() => {
        return recursiveCheckHash(hash)
      })
    } else if (res.operation.status === sdk.VaultOperationStatus.VAULT_STATUS_FAILED) {
      throw res
    } else {
      return res
    }
  })
}

const closeShort = async (symbol: string) => {
  const {
    invest: {
      vaultMap: { tokenMap },
    },
    account,
  } = store.getState()
  
  const res = await LoopringAPI.vaultAPI?.closeShort(
    {
      request: {
        accountId: account.accountId,
        tokenId: tokenMap[symbol].vaultTokenId,
        timestamp: Date.now(),
      },
    },
    account.apiKey,
    account.eddsaKey.sk,
  )
  if ((res as sdk.RESULT_INFO).code || (res as sdk.RESULT_INFO).message) {
    throw res
  } else {
    const hash = (res as {hash: string}).hash
    return recursiveCheckHash(hash)
  }
}

const closeLongDust = async (symbol: string) => {
  const {
    vaultLayer2: { vaultLayer2 },
    invest: {
      vaultMap: { tokenMap },
    },
    account,
    system: { exchangeInfo },
  } = store.getState()
  const vaultAsset = vaultLayer2![symbol]
  const closeTokenInfo = tokenMap[symbol]
  const tokenId = closeTokenInfo.vaultTokenId

  const { offchainId } = await LoopringAPI.userAPI?.getNextStorageId(
    {
      accountId: account.accountId,
      sellTokenId: tokenId,
    },
    account.apiKey,
  )!
  const { broker } = await LoopringAPI.userAPI?.getAvailableBroker({
    type: 4,
  })!
  // debugger
  const dustTransfer = {
    exchange: exchangeInfo!.exchangeAddress,
    payerAddr: account.accAddress,
    payerId: account.accountId,
    payeeId: 0,
    payeeAddr: broker,
    storageId: offchainId,
    token: {
      tokenId: tokenId,
      volume: vaultAsset.total,
    },
    maxFee: {
      tokenId: tokenId,
      volume: '0',
    },
    validUntil: getTimestampDaysLater(DAYS),
    memo: '',
  }

  const res = await LoopringAPI.vaultAPI?.submitDustCollector(
    {
      dustTransfers: [dustTransfer],
      apiKey: account.apiKey,
      accountId: account.accountId,
      eddsaKey: account.eddsaKey.sk,
    },
    '1',
  )
  if ((res as sdk.RESULT_INFO).code || (res as sdk.RESULT_INFO).message) {
    throw res
  } else {
    const hash = (res as {hash: string}).hash
    return recursiveCheckHash(hash)
  }
}

const closeLongDustIfNeeded = async (symbol: string) => {
  const {
    vaultLayer2: { vaultLayer2 }
  } = store.getState()
  const vaultAsset = vaultLayer2 && symbol ? vaultLayer2[symbol] : undefined
  if (!vaultAsset || !new Decimal(vaultAsset.netAsset).isPos()) {
    return undefined
  } else {
    return closeLongDust(symbol)
  }
}

const closeLong = async (symbol: string, depth: sdk.DepthData) => {
  const {
    vaultLayer2: { vaultLayer2 },
    invest: {
      vaultMap: { tokenMap, marketMap, marketArray },
    },
    account,
    settings: { slippage },
    system: { exchangeInfo },
  } = store.getState()
  const vaultAsset = vaultLayer2![symbol]
  const sellToken = tokenMap[symbol] as VaultToken
  const buyToken = tokenMap['LVUSDT']
  const storageId = await LoopringAPI.userAPI?.getNextStorageId(
    {
      accountId: account.accountId,
      sellTokenId: sellToken?.vaultTokenId ?? 0,
    },
    account.apiKey,
  )
  const market = `${symbol}-LVUSDT`
  const marketInfo = marketMap[market] as sdk.VaultMarket

  const slippageReal = slippage === 'N' ? 0.1 : slippage
  
  const sellAmountBN = bignumberFix(
    BigNumber.from(vaultAsset.total).abs(),
    sellToken.decimals,
    sellToken.vaultTokenAmounts.qtyStepScale,
    'FLOOR',
  )
  const output = sdk.calcDex({
    info: marketInfo,
    input: utils.formatUnits(
      sellAmountBN.toString(),
      tokenMap[symbol].decimals,
    ),
    sell: sellToken.symbol,
    buy: buyToken.symbol,
    isAtoB: true,
    marketArr: marketArray,
    tokenMap: tokenMap,
    marketMap: marketMap as any,
    depth: depth!,
    feeBips: (marketInfo.feeBips ?? MAPFEEBIPS).toString(),
    slipBips: slippageReal.toString(),
  })

  const buyAmountBN = utils.parseUnits(
    numberFormat(output!.amountB!, { fixed: buyToken.decimals }),
    buyToken.decimals,
  )
  const request: sdk.VaultOrderRequest = {
    exchange: exchangeInfo!.exchangeAddress,
    storageId: storageId!.orderId,
    accountId: account.accountId,
    sellToken: {
      tokenId: sellToken?.vaultTokenId ?? 0,
      volume: sellAmountBN.toString(),
    },
    buyToken: {
      tokenId: buyToken?.vaultTokenId ?? 0,
      volume: buyAmountBN.toString(),
    },
    validUntil: getTimestampDaysLater(DAYS),
    maxFeeBips: MAPFEEBIPS,
    fillAmountBOrS: false,
    allOrNone: false,
    eddsaSignature: '',
    clientOrderId: '',
    orderType: sdk.OrderTypeResp.TakerOnly,
    fastMode: false,
  }
  const response = await LoopringAPI.vaultAPI?.submitVaultOrder(
    {
      request,
      privateKey: account.eddsaKey.sk,
      apiKey: account.apiKey,
    },
    '1',
  )
  if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
    throw response
  } else {
    const hash = (response as {hash: string}).hash
    return recursiveCheckHash(hash)
  }
  
}

const checkIsDust = async (symbol: string) => {
  const {
    vaultLayer2: { vaultLayer2 },
    invest: {
      vaultMap: { tokenMap, marketMap, marketArray },
    },
    settings: { slippage },
  } = store.getState()
  const vaultAsset = vaultLayer2![symbol]
  const sellToken = tokenMap[symbol]
  const buyToken = tokenMap['LVUSDT']
  const market = `${symbol}-LVUSDT`
  const marketInfo = marketMap[market] as sdk.VaultMarket
  const { depth } = await vaultSwapDependAsync({
    market: (marketInfo as any).vaultMarket,
    tokenMap: tokenMap,
  })

  const slippageReal = slippage === 'N' ? 0.1 : slippage
  const output = sdk.calcDex({
    info: marketInfo,
    input: utils.formatUnits(new Decimal(vaultAsset.netAsset).abs().toString(), sellToken.decimals),
    sell: sellToken.symbol,
    buy: buyToken.symbol,
    isAtoB: true,
    marketArr: marketArray,
    tokenMap: tokenMap,
    marketMap: marketMap as any,
    depth: depth!,
    feeBips: (marketInfo.feeBips ?? MAPFEEBIPS).toString(),
    slipBips: slippageReal.toString(),
  })
  const USDTAmount = output!.amountB!
  return { isDust: new Decimal(USDTAmount).lt('10'), depth }
}

const closePosition = async (symbol: string) => {

  console.log('asdhjakshdjkha close', symbol)
  const {
    vaultLayer2: { vaultLayer2 },
    system: { exchangeInfo },
  } = store.getState()
  const vaultAsset = vaultLayer2 && symbol ? vaultLayer2[symbol] : undefined
  if (!symbol || !vaultAsset || !exchangeInfo || new Decimal(vaultAsset.netAsset).isZero())
    throw new Error('error')

  if (!new Decimal(vaultAsset.netAsset).isPos()) {
    var response = await closeShort(symbol)
  } else {
    const { isDust, depth } = await checkIsDust(symbol)
    if (isDust) {
      response = await closeLongDust(symbol)
    } else {
      response = await closeLong(symbol, depth!)
    }
  }

  return response
}

export const closePositionAndRepayIfNeeded = async (symbol: string) => {
  const response = await closePosition(symbol)
  sdk.sleep(500).then(() => {
    return promiseAllSequently(
      [symbol, 'LVUSDT'].map((symbol) => () => repayIfNeeded(symbol).catch(() => undefined)),
    )
  })
  return response
}

const closePositions = async (symbols: string[]) => {
  return promiseAllSequently(
    symbols.map((symbol) => async () => {
      const res = await closePosition(symbol)
      await sdk.sleep(500)
      return res 
    }),
  ) as Promise<{
    operation: sdk.VaultOperation;
    order: sdk.VaultOrder;
  }[]>
}

export const closePositionsAndRepayIfNeeded = async (symbols: string[]) => {
  const responses = await closePositions(symbols)
  updateVaultLayer2({})
  await sdk.sleep(500)
  await promiseAllSequently(
    symbols.concat('LVUSDT').map((symbol) => () => repayIfNeeded(symbol).catch(() => undefined)),
  )
  return responses
}

export const filterPositions = (vaultLayer2: VaultLayer2Map<any>, tokenMap: sdk.LoopringMap<sdk.TokenInfo>, tokenPrices: sdk.LoopringMap<string>) => {
  return _.keys(vaultLayer2).filter((symbol) => {
    const asset = vaultLayer2 ? vaultLayer2[symbol] : undefined
    const tokenInfo = tokenMap?.[symbol]
    const tokenPrice = tokenPrices?.[symbol]
    
    if (!asset || !tokenInfo || !tokenPrice) return false
    const position = new Decimal(
      utils.formatUnits(BigNumber.from(asset.netAsset).add(asset.interest), tokenInfo.decimals),
    )
    const positionValue = position.abs().times(tokenPrice)
    console.log('askjdhakjwhe', symbol,asset, tokenInfo, tokenPrice, position.toString(), positionValue.toString())
    return symbol !== 'LVUSDT' && positionValue.greaterThan('10')
  })
}