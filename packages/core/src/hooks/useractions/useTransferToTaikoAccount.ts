import {
  AccountStep,
  TransferToTaikoAccountProps,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import { store, TokenMap, useAccount, useConfig, useContacts, useTokenMap } from '../../stores'
import { useEffect } from 'react'
import { useGetSet } from 'react-use'
import { LoopringAPI } from '../../api_wrapper'
import { MapChainId, WalletMap } from '@loopring-web/common-resources'
import { OffchainFeeInfo, OffchainFeeReqType, RabbitWithdrawRequest } from '@loopring-web/loopring-sdk'
import { ethers, utils } from 'ethers'
import { getTimestampDaysLater, isValidateNumberStr, numberFormat } from '../../utils'
import { makeWalletLayer2, parseRabbitConfig } from '../../hooks/help'
import Decimal from 'decimal.js'
import { DAYS } from '../../defs'
import { useWeb3ModalProvider } from '@web3modal/ethers5/react'

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
  const { coinJson, defaultNetwork, feeChargeOrder } = useSettings()
  const { tokenMap, idIndex } = useTokenMap()

  const { fastWithdrawConfig } = useConfig()
  const { account } = useAccount()

  const initialState = {
    transferToken: 'ETH',
    feeList: [] as OffchainFeeInfo[],
    feeToken: undefined as string | undefined,
    panel: 'main' as 'main' | 'contacts' | 'tokenSelection' | 'confirm',
    showFeeModal: false,
    amount: '',
    receipt: '',
    tokenFilterInput: '',
    maxTransferAmount: undefined as ethers.BigNumber | undefined,
    feeLoading: false
  }

  const [getState, setState] = useGetSet(initialState)

  const state = getState()
  const isOverMax =
    state.amount &&
    ethers.utils
      .parseUnits(state.amount, tokenMap[state.transferToken].decimals)
      .gt(state.maxTransferAmount ?? '0')
  
  const { contacts, updateContacts } = useContacts()
  const parsed = fastWithdrawConfig && idIndex && MapChainId[defaultNetwork]
    ? parseRabbitConfig(fastWithdrawConfig, MapChainId[defaultNetwork], idIndex)
    : undefined
  const transferTokenList = parsed?.toTaikoNetworkSupportedTokens || []
  const toTaikoNetwork = parsed?.toTaikoNetwork
  

  const refreshData = async (destinationNetwork: string) => {
    const globalState = store.getState()
    const account = globalState.account
    const idIndex = globalState.tokenMap.idIndex
    const defaultNetwork = globalState.settings.defaultNetwork
    const state = getState()

    setState({
      ...state,
      feeLoading: true
    })
    const feeRes = await LoopringAPI.userAPI
      ?.getUserCrossChainFee(
        {
          receiveFeeNetwork: destinationNetwork,
          requestType: OffchainFeeReqType.RABBIT_OFFCHAIN_WITHDRAWAL,
          calFeeNetwork: MapChainId[defaultNetwork],
          tokenSymbol: state.transferToken,
          amount: state.amount ? utils.parseUnits(state.amount, tokenMap[state.transferToken].decimals).toString() : '0',
        },
        account.apiKey,
      ).finally(() => {
        setState({
          ...state,
          feeLoading: false
        })
      })

    transferToken && LoopringAPI.rabbitWithdrawAPI?.getNetworkWithdrawalAgents({
      tokenId: transferToken.tokenId,
      network: toTaikoNetwork!,
      amount: '0'
    }).then(res => {
      const amounts = res.map(agent => {
        return ethers.BigNumber.from(agent.totalAmount).sub(agent.freezeAmount).toString()
      })
      const sorted = amounts.concat('0').sort((a, b) => ethers.BigNumber.from(b).gte(a) ? 1 : -1)
      const amount = sorted[0] ? sorted[0] : '0'
      setState((state) => ({
        ...state,
        maxTransferAmount: ethers.BigNumber.from(amount),
      }))
    })

    setState({
      ...state,
      feeList: feeRes?.fees || [],
    })
  }

  useEffect(() => {
    var timer: NodeJS.Timeout
    if (modals.isShowTransferToTaikoAccount.isShow && fastWithdrawConfig) {
      const defaultNetwork = store.getState().settings.defaultNetwork
      const idIndex = store.getState().tokenMap.idIndex
      const { toTaikoNetwork } = parseRabbitConfig(
        fastWithdrawConfig,
        MapChainId[defaultNetwork],
        idIndex,
      )
      timer = setInterval(() => {
        refreshData(toTaikoNetwork ?? '')
      }, 10 * 1000)
      refreshData(toTaikoNetwork ?? '')
    }
    return () => {
      timer && clearInterval(timer)
    }
  }, [modals.isShowTransferToTaikoAccount.isShow, fastWithdrawConfig])
  // : feeChargeOrder.filter(symbol => enoughFeeList.find(fee => fee.token === symbol))[0]
  const { walletMap } = makeWalletLayer2({ needFilterZero: true })
  const enoughFeeList = walletMap && tokenMap ? state.feeList.filter(fee => {
    
    return ethers.utils.parseUnits(walletMap[fee.token]?.count.toString() ?? '0', tokenMap[fee.token].decimals).gte(fee.fee)
    
    // return ethers.BigNumber.from(walletMap2[fee.token]?.count ?? '0').gte(fee.fee) 
  }) : []
  // const feeTokenSymbol = state.feeToken
  const feeInfo = enoughFeeList.find((f) => f.token === state.feeToken)
    ? enoughFeeList.find((f) => f.token === state.feeToken)
    : feeChargeOrder.map(order => enoughFeeList.find(fee => fee.token === order)).filter(fee => fee)[0]
  const feeTokenSymbol = feeInfo?.token
  console.log('feeTokenSymbol', feeTokenSymbol)
  const feeToken = tokenMap && feeTokenSymbol ? tokenMap[feeTokenSymbol] : undefined
  const transferToken = tokenMap[state.transferToken]
  const feeRaw = feeInfo?.fee
  

  const transferTokenWallet = walletMap ? walletMap[state.transferToken] : undefined

  const isInvalidAddress = state.receipt && !ethers.utils.isAddress(state.receipt)
  const sendBtnDisabled =
    state.feeLoading ||
    !state.amount ||
    new Decimal(state.amount).lessThanOrEqualTo('0') ||
    !state.receipt ||
    isOverMax ||
    isInvalidAddress
  const {walletProvider} = useWeb3ModalProvider()

  const sendBtn = {
    
    onClick: async () => {
      setState({
        ...state,
        panel: 'confirm',
      })
    },
    disabled: sendBtnDisabled,
    text: 'Send'
  }

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
    onClickConfirm: async () => {
      const network = MapChainId[defaultNetwork]
      const configiJSON = fastWithdrawConfig!
      const storageId = await LoopringAPI.userAPI?.getNextStorageId(
        {
          accountId: account.accountId,
          sellTokenId: transferToken.tokenId,
        },
        account.apiKey,
      )
      const agentId = configiJSON.networkL2AgentAccountIds[network]
      const agentAddr = configiJSON.networkL2AgentAddresses[network]
      const exchange = configiJSON.networkExchanges[network]
      

      const request: RabbitWithdrawRequest = {
        fromNetwork: network,
        toNetwork: toTaikoNetwork!,
        toAddress: state.receipt,
        transfer: {
          exchange: exchange,
          payerId: account.accountId,
          payerAddr: account.accAddress,
          payeeId: agentId,
          payeeAddr: agentAddr,
          token: {
            tokenId: transferToken.tokenId,
            volume: utils.parseUnits(state.amount, transferToken.decimals).toString(),
          },
          maxFee: {
            // @ts-ignore
            tokenId: feeToken.tokenId,
            volume: ethers.BigNumber.from(feeRaw!).toString() 
          },
          storageId: storageId!.offchainId,
          validUntil: getTimestampDaysLater(DAYS),
        },
      }
      const provider = new ethers.providers.Web3Provider(walletProvider as any)
      debugger
      const response = await LoopringAPI.rabbitWithdrawAPI?.submitRabitWithdraw(request, {
        exchangeAddr: exchange,
        signer: provider.getSigner(),
        eddsaSignKey: account.eddsaKey.sk,
        chainId: defaultNetwork as number,
      })
      setShowTransferToTaikoAccount({
        isShow: false
      })
      setState(initialState)
      
    },
    onInputAmount: (str) => {
      if (isValidateNumberStr(str, transferToken.precision) || str === '') {
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
      feeInfo:
        feeInfo && walletMap && tokenMap
          ? offchainFeeInfoToFeeInfo(feeInfo, tokenMap, walletMap as any)
          : undefined,
      chargeFeeTokenList:
        walletMap && tokenMap
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
      feeLoading: state.feeLoading,
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
      contacts: contacts as any,
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
          transferToken: symbol,
          panel: 'main',
        })
      },
    },
    receiptInput: state.receipt,
    amountInput: state.amount,
    onClickBack() {
      if (state.panel === 'main') {
        setShowTransferToTaikoAccount({ isShow: false })
        setState(initialState)
        setShowAccount({ isShow: true, step: AccountStep.SendAssetGateway })
      } else {
        setState({
          ...state,
          panel: 'main',
        })
      }
    },
    onClickClose() {
      setShowTransferToTaikoAccount({ isShow: false })
      setState(initialState)
    },
    open: modals.isShowTransferToTaikoAccount.isShow,
    supportedTokens: transferTokenList,
    sendBtn: sendBtn,
    maxAlert: {
      show: isOverMax,
      message:
        isOverMax && state.maxTransferAmount
          ? `Quota: ${numberFormat(utils.formatUnits(state.maxTransferAmount!, transferToken.decimals), {fixed: transferToken.precision}) } ${
              transferToken.symbol
            }`
          : '',
    },
    receiptError: {
      show: isInvalidAddress,
      message: 'invalid address',
    },
    receiptClear: {
      show: !!state.receipt,
      onClick: () => {
        setState({
          ...state,
          receipt: '',
        })
      },
    },
    showReceiptWarning: state.receipt && !isInvalidAddress,
  } as TransferToTaikoAccountProps
  console.log('output', state, output)
  return output
}
