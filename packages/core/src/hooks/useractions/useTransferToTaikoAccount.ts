import {
  AccountStep,
  TransferToTaikoAccountProps,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import { store, TokenMap, useAccount, useContacts, useTokenMap, useWalletLayer2 } from '../../stores'
import { useEffect } from 'react'
import { useGetSet } from 'react-use'
import { LoopringAPI } from '../../api_wrapper'
import { MapChainId, WalletMap } from '@loopring-web/common-resources'
import { OffchainFeeInfo, OffchainFeeReqType } from '@loopring-web/loopring-sdk'
import { ethers, utils } from 'ethers'
import { isValidateNumberStr, numberFormat } from '../../utils'
import { makeWalletLayer2 } from '../../hooks/help'
import Decimal from 'decimal.js'

const offchainFeeInfoToFeeInfo = (offchainFeeInfo: OffchainFeeInfo, tokenMap: TokenMap<{
  [key: string]: any;
}>, walletMap: WalletMap<string, any>) => {
  return {
    belong: offchainFeeInfo.token,
    fee: ethers.utils.formatUnits(offchainFeeInfo.fee, tokenMap[offchainFeeInfo.token].decimals),
    feeRaw: offchainFeeInfo.fee,
    token: offchainFeeInfo.token,
    hasToken: !!offchainFeeInfo.token,
    count: walletMap[offchainFeeInfo.token]?.count,
    discount: offchainFeeInfo.discount ? offchainFeeInfo.discount : undefined,
    __raw__: {
      fastWithDraw: '',
      tokenId: tokenMap[offchainFeeInfo.token].tokenId,
      feeRaw: offchainFeeInfo.fee,
    }
  }
}

export const useTransferToTaikoAccount = (): TransferToTaikoAccountProps => {
  const { setShowAccount, setShowTransferToTaikoAccount, modals } = useOpenModals()
  const { coinJson } = useSettings()
  const { tokenMap } = useTokenMap()

  const transferTokenList = ['ETH', 'USDT']
  const [getState, setState] = useGetSet({
    transferToken: 'ETH',
    feeList: [] as OffchainFeeInfo[],
    feeToken: undefined as string | undefined,
    panel: 'main' as 'main' | 'contacts' | 'tokenSelection',
    showFeeModal: false,
    amount: '',
    receipt: '',
    tokenFilterInput: '',
  })
  const state = getState()
  const { contacts, updateContacts }=useContacts()
  

  const refreshData = async () => {
    const globalState = store.getState()
    const account = globalState.account
    const defaultNetwork = globalState.settings.defaultNetwork
    const destinationNetwork = MapChainId[defaultNetwork]
    const state = getState()
    const feeRes = await LoopringAPI.userAPI
      ?.getUserCrossChainFee(
        {
          receiveFeeNetwork: destinationNetwork,
          requestType: OffchainFeeReqType.RABBIT_OFFCHAIN_WITHDRAWAL,
          calFeeNetwork: destinationNetwork,
          tokenSymbol: state.transferToken,
          amount: state.amount ? utils.parseUnits(state.amount, tokenMap[state.transferToken].decimals).toString() : '0',
        },
        account.apiKey,
      )
      // todo remove
      .then((feeRes) => {
        if ((feeRes as any).resultInfo && (feeRes as any).resultInfo.code > 0) {
          return {
            fees: [
              {
                token: 'ETH',
                fee: '100000000000000000000',
                discount: 0,
              },
              {
                token: 'USDT',
                fee: '10000',
                discount: 0,
              },
            ],
          }
        } else {
          return feeRes
        }
      })
    const {walletMap}=makeWalletLayer2({ needFilterZero: true })
    
    const foundFee = feeRes?.fees.find(fee => {
      const count = (walletMap && walletMap[fee.token]?.count.toString()) ?? '0'
      const feeAmount = utils.formatUnits(fee.fee, globalState.tokenMap.tokenMap[fee.token].decimals)
      return new Decimal(count).gte(new Decimal(feeAmount))
    })

    setState({
      ...state,
      feeList: feeRes?.fees || [],
      feeToken: state.feeToken ? state.feeToken : foundFee ? foundFee.token : undefined,
    })
  }
  useEffect(() => {
    var timer: NodeJS.Timeout
    if (modals.isShowTransferToTaikoAccount.isShow || true) {
      timer = setInterval(() => {
        refreshData()
      }, 10 * 1000)
      refreshData()
      updateContacts()
    }
    return () => {
      timer && clearInterval(timer)
    }
  }, [modals.isShowTransferToTaikoAccount.isShow])

  const feeToken = state.feeToken ? tokenMap[state.feeToken] : undefined
  const transferToken = tokenMap[state.transferToken]
  const feeRaw = state.feeList.find((item) => item.token === state.feeToken)?.fee
  const { walletMap } = makeWalletLayer2({ needFilterZero: true })
  const { walletLayer2  } = useWalletLayer2()

  const transferTokenWallet = walletMap ? walletMap[state.transferToken] : undefined

  const output = {
    onClickContact: () => {
      setState({
        ...state,
        panel: 'contacts',
      })
    },
    onClickFee: () => {
      setState({
        ...state,
        showFeeModal: true,
      })
    },
    onClickSend: () => {},
    onInputAmount: (str) => {
      if (isValidateNumberStr(str, transferToken.precision)) {
        setState({
          ...state,
          amount: str,
        })
      }
    },
    onInputAddress: (addr) => {
      setState({
        ...state,
        receipt: addr,
      })
    },
    onClickToken: () => {
      setState({
        ...state,
        panel: 'tokenSelection',
      })
    },
    onClickBalance: () => {
      if (transferTokenWallet?.count.toString()) {
        setState({
          ...state,
          amount: transferTokenWallet.count.toString(),
        })
      }
    },
    fee:
      feeToken && feeRaw
        ? numberFormat(ethers.utils.formatUnits(feeRaw, feeToken.decimals), {
            fixed: feeToken.precision,
            removeTrailingZero: true,
          }) +
          ' ' +
          feeToken.symbol
        : '--',
    balance:
      transferTokenWallet && transferToken
        ? numberFormat(transferTokenWallet.count, {
            fixed: transferToken.precision,
            removeTrailingZero: true,
          }) +
          ' ' +
          state.transferToken
        : '--',
    token: {
      coinJSON: coinJson[state.transferToken],
      symbol: state.transferToken,
    },
    feeSelect: {
      open: state.showFeeModal,
      onClose: () => {
        setState({
          ...state,
          showFeeModal: false,
        })
      },
      feeInfo: state.feeList.find((item) => item.token === state.feeToken) && state.feeToken && walletMap && tokenMap
        ? offchainFeeInfoToFeeInfo(
            state.feeList.find((item) => item.token === state.feeToken)!,
            tokenMap,
            walletMap as any,
          )
        : undefined,
      chargeFeeTokenList: walletMap
        ? state.feeList.map((item) => offchainFeeInfoToFeeInfo(item, tokenMap, walletMap as any))
        : [],
      handleToggleChange: (feeInfo) => {
        setState({
          ...state,
          feeToken: feeInfo.token!,
        })
      },
      disableNoToken: false,
      onClickFee: () => {},
      feeLoading: false,
      isFeeNotEnough: (() => {
        const feeInfo = state.feeList.find((item) => item.token === state.feeToken)
        if (!feeInfo || !tokenMap) return false
        if (!walletMap || !state.feeToken || !walletMap[state.feeToken]?.count) return true
        const count = walletMap[state.feeToken]!.count
        return new Decimal(count).gte(
          utils.formatUnits(feeInfo.fee, tokenMap[state.feeToken].decimals),
        ) 
      })(),
      isFastWithdrawAmountLimit: false,
    },
    panel: state.panel,
    contacts: {
      onSelect: (address) => {
        setState({
          ...state,
          panel: 'main',
          receipt: address,
        })
      },
      scrollHeight: '200px',
      contacts: contacts,
    },
    tokenSelection: {
      filter: state.tokenFilterInput,
      tokens: coinJson
        ? transferTokenList
            .filter((token) => {
              if (state.tokenFilterInput) {
                return token.toLowerCase().includes(state.tokenFilterInput.toLowerCase())
              }
              return true
            })
            .map((token) => ({
              symbol: token,
              coinJSON: [coinJson[token]],
              amount: walletMap && walletMap[token] ? walletMap[token].count.toString() : '0',
            }))
        : [],
      onChangeFilter: (inputValue: string) => {
        setState({
          ...state,
          tokenFilterInput: inputValue,
        })
      },
      onClickClearFilter: () => {
        setState({
          ...state,
          tokenFilterInput: '',
        })
      },
      onClickCancel: () => {
        setState({
          ...state,
          panel: 'main',
        })
      },
      onClickToken: (symbol) => {
        setState({
          ...state,
          feeToken: symbol,
          panel: 'main',
        })
      },
    },
    receiptInput: state.receipt,
    amountInput: state.amount,
    onClickBack() {
      if (state.panel === 'main') {
        setShowTransferToTaikoAccount({isShow: false})
        setShowAccount({isShow: true,
          step: AccountStep.SendAssetGateway
        })
      } else {
        setState({
          ...state,
          panel: 'main',
        })
      } 
      
    },
    onClickClose() {
      setShowTransferToTaikoAccount({isShow: false})
    },
    open: modals.isShowTransferToTaikoAccount.isShow
  } as TransferToTaikoAccountProps
  console.log('output', state, output)
  return output
}
