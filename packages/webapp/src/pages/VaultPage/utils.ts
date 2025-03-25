import { DAYS, getTimestampDaysLater, LoopringAPI, NETWORKEXTEND, store, VaultUIMap } from "@loopring-web/core"
import { ChainId, ConnectorNames, toBig, VaultToken } from "@loopring-web/loopring-sdk"
import { ConnectProviders, connectProvides } from "@loopring-web/web3-provider"
import Decimal from "decimal.js"
import { keys } from "lodash"
import { BigNumber } from "ethers"
import { bignumberFix } from "@loopring-web/core/src/utils/numberFormat"
import { MarketType } from "@loopring-web/common-resources"

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