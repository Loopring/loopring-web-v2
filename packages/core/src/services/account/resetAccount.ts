import { resetUserRewards } from '../../stores/userRewards/reducer'
import { reset as resetWalletLayer1 } from '../../stores/walletLayer1/reducer'
import { reset as resetWalletLayer2 } from '../../stores/walletLayer2/reducer'
import { reset as resetwalletLayer2NFT } from '../../stores/walletLayer2NFT/reducer'
import { resetAmount } from '../../stores/amount/reducer'
import { store } from '../../stores'
import { resetTokenPrices } from '../../stores/tokenPrices/reducer'
import { resetTicker } from '../../stores/ticker/reducer'
import { updateToggleStatus } from '@loopring-web/component-lib'
import * as sdk from '@loopring-web/loopring-sdk'
import { myLog } from '@loopring-web/common-resources'

export async function resetLayer12Data() {
  store.dispatch(resetAmount(undefined))
  store.dispatch(resetUserRewards(undefined))
  store.dispatch(resetWalletLayer1(undefined))
  store.dispatch(resetWalletLayer2(undefined))
  store.dispatch(resetwalletLayer2NFT(undefined))
  let toggle = {}
  if (
    store.getState().system.chainId !== sdk.ChainId.GOERLI &&
    store.getState().system.dexToggleUrl
  ) {
    toggle = await fetch(store.getState().system.dexToggleUrl)
      .then((response) => {
        if (response.ok) {
          return response.json()
        }
      })
      .catch(() => ({}))
  }
  store.dispatch(
    updateToggleStatus({
      order: { enable: true, reason: undefined },
      joinAmm: { enable: true, reason: undefined },
      exitAmm: { enable: true, reason: undefined },
      transfer: { enable: true, reason: undefined },
      transferNFT: { enable: true, reason: undefined },
      defi: { enable: true, reason: undefined },
      deposit: { enable: true, reason: undefined },
      depositNFT: { enable: true, reason: undefined },
      withdraw: { enable: true, reason: undefined },
      withdrawNFT: { enable: true, reason: undefined },
      mintNFT: { enable: true, reason: undefined },
      deployNFT: { enable: true, reason: undefined },
      updateAccount: { enable: true, reason: undefined },
      LRCStackInvest: { enable: true, reason: undefined },
      redPacketNFTV1: { enable: true, reason: undefined },
      claim: { enable: true, reason: undefined },
      ...toggle,
    }),
  )
}

export async function resetSystemData() {
  store.dispatch(resetTokenPrices(undefined))
  store.dispatch(resetTicker(undefined))
}

export function resetLayer2Data() {
  store.dispatch(resetAmount(undefined))
  store.dispatch(resetUserRewards(undefined))
  store.dispatch(resetWalletLayer2(undefined))
  store.dispatch(resetwalletLayer2NFT(undefined))
}

const LoopFrozenFlag = true

export async function toggleCheck(
  chainId?: sdk.ChainId,
  dexToggleUrl?: string,
  whiteList?: string,
) {
  if (chainId === undefined) {
    const system = store.getState().system
    chainId = (system.chainId ?? sdk.ChainId.MAINNET) as sdk.ChainId
    dexToggleUrl = system.dexToggleUrl
  }

  const account = store.getState().account
  if (account?.frozen === LoopFrozenFlag) {
    myLog('account.frozen ___timer___', account.accountId)
    store.dispatch(
      updateToggleStatus({
        order: { enable: false, reason: 'account frozen' },
        joinAmm: { enable: false, reason: 'account frozen' },
        exitAmm: { enable: false, reason: 'account frozen' },
        transfer: { enable: false, reason: 'account frozen' },
        transferNFT: { enable: false, reason: 'account frozen' },
        // deposit: { enable: false, reason: "account frozen" },
        // depositNFT: { enable: false, reason: "account frozen" },
        withdraw: { enable: false, reason: 'account frozen' },
        withdrawNFT: { enable: false, reason: 'account frozen' },
        mintNFT: { enable: true, reason: 'account frozen' },
        deployNFT: { enable: false, reason: 'account frozen' },
        //forceWithdraw: { enable: false, reason: "account frozen" },
        defiInvest: { enable: false, reason: 'account frozen' },
        WSTEHTInvest: { enable: false, reason: 'account frozen' },
        RETHInvest: { enable: false, reason: 'account frozen' },
        dualInvest: { enable: false, reason: 'account frozen' },
        collectionNFT: { enable: false, reason: 'account frozen' },
        claim: { enable: false, reason: 'account frozen' },
        redPacketNFTV1: { enable: false, reason: 'account frozen' },
        LRCStackInvest: { enable: false, reason: 'account frozen' },
        BTradeInvest: { enable: false, reason: 'account frozen' },
        StopLimit: { enable: false, reason: 'account frozen' },
      }),
    )
  } else if (dexToggleUrl && chainId === sdk.ChainId.MAINNET) {
    Promise.all([
      dexToggleUrl
        ? fetch(dexToggleUrl).then((response) => (response?.ok ? response.json() : {}))
        : Promise.resolve(undefined),
      whiteList
        ? fetch(whiteList).then((response) => (response?.ok ? response.json() : {}))
        : Promise.resolve(undefined),
    ])
      .then(([toggle, _whiteListRes]) => {
        store.dispatch(
          updateToggleStatus({
            order: { enable: true, reason: undefined },
            joinAmm: { enable: true, reason: undefined },
            exitAmm: { enable: true, reason: undefined },
            transfer: { enable: true, reason: undefined },
            transferNFT: { enable: true, reason: undefined },
            defi: { enable: true, reason: undefined },
            deposit: { enable: true, reason: undefined },
            depositNFT: { enable: true, reason: undefined },
            withdraw: { enable: true, reason: undefined },
            withdrawNFT: { enable: true, reason: undefined },
            mintNFT: { enable: true, reason: undefined },
            deployNFT: { enable: true, reason: undefined },
            updateAccount: { enable: true, reason: undefined },
            LRCStackInvest: { enable: true, reason: undefined },
            redPacketNFTV1: { enable: true, reason: undefined },
            claim: { enable: true, reason: undefined },
            ...toggle,
            whiteList: _whiteListRes,
          }),
        )
      })
      .catch(() => [{}, {}])
  }
}
