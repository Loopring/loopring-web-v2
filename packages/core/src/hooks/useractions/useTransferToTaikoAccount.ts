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
  const { coinJson, defaultNetwork } = useSettings()
  const { tokenMap, idIndex } = useTokenMap()

  const { fastWithdrawConfig } = useConfig()
  const { account } = useAccount()

  const [getState, setState] = useGetSet({
    transferToken: 'ETH',
    feeList: [] as OffchainFeeInfo[],
    feeToken: undefined as string | undefined,
    panel: 'main' as 'main' | 'contacts' | 'tokenSelection',
    showFeeModal: false,
    amount: '',
    receipt: '',
    tokenFilterInput: '',
    maxTransferAmount: undefined as ethers.BigNumber | undefined,
  })
  
  const state = getState()
  
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
      )
    
    const {walletMap}=makeWalletLayer2({ needFilterZero: true })
    
    const foundFee = feeRes?.fees.find(fee => {
      const count = (walletMap && walletMap[fee.token]?.count.toString()) ?? '0'
      const feeAmount = utils.formatUnits(fee.fee, globalState.tokenMap.tokenMap[fee.token].decimals)
      return new Decimal(count).gte(new Decimal(feeAmount))
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
      feeToken: state.feeToken ? state.feeToken : foundFee ? foundFee.token : undefined,
    })
  }

  useEffect(() => {
    var timer: NodeJS.Timeout
    if (modals.isShowTransferToTaikoAccount.isShow) {
      const defaultNetwork = store.getState().settings.defaultNetwork
        const idIndex = store.getState().tokenMap.idIndex
      const { toTaikoNetwork } = parseRabbitConfig(fastWithdrawConfig, MapChainId[defaultNetwork], idIndex)
        timer = setInterval(() => {
          refreshData(toTaikoNetwork ?? '')
        }, 10 * 1000)
        refreshData(toTaikoNetwork ?? '')

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

  const transferTokenWallet = walletMap ? walletMap[state.transferToken] : undefined

  const sendBtnDisabled = state.receipt 
    ? false 
    : true
  const {walletProvider} = useWeb3ModalProvider()

  const sendBtn = {
    onClick: async () => {
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
            volume: feeRaw!
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
      feeInfo: state.feeList.find((item) => item.token === state.feeToken) && state.feeToken && walletMap && tokenMap
        ? offchainFeeInfoToFeeInfo(
            state.feeList.find((item) => item.token === state.feeToken)!,
            tokenMap,
            walletMap as any,
          )
        : undefined,
      chargeFeeTokenList: walletMap && tokenMap
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
    open: modals.isShowTransferToTaikoAccount.isShow,
    supportedTokens: transferTokenList,
    sendBtn: sendBtn
  } as TransferToTaikoAccountProps
  console.log('output', state, output)
  return output
}
