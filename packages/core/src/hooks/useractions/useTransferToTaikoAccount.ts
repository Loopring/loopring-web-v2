import {
  AccountStep,
  TransferToTaikoAccountProps,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import { store, TokenMap, useAccount, useConfig, useContacts, useSystem, useTokenMap, useWalletLayer2 } from '../../stores'
import { useEffect } from 'react'
import { useGetSet } from 'react-use'
import { LoopringAPI } from '../../api_wrapper'
import { Account, MapChainId, NetworkMap, UIERROR_CODE, WalletMap } from '@loopring-web/common-resources'
import { ChainId, checkErrorInfo, ConnectorError, ExchangeAPI, OffchainFeeInfo, OffchainFeeReqType, RabbitWithdrawRequest, RESULT_INFO, sleep, TokenInfo } from '@loopring-web/loopring-sdk'
import { ethers, utils } from 'ethers'
import { getTimestampDaysLater, isValidateNumberStr, numberFormat } from '../../utils'
import { makeWalletLayer2, parseRabbitConfig } from '../../hooks/help'
import Decimal from 'decimal.js'
import { DAYS } from '../../defs'
import { useWeb3ModalProvider } from '@web3modal/ethers5/react'
import { useDebouncedCallback } from '../../hooks/common'
import _ from 'lodash'
import { parseRabbitConfig2 } from '../../hooks/help/parseRabbitConfig'

const offchainFeeInfoToFeeInfo = (offchainFeeInfo: OffchainFeeInfo, tokenMap: TokenMap<{
  [key: string]: any;
}>, walletMap: WalletMap<string, any>) => {
  return {
    belong: offchainFeeInfo.token,
    fee: tokenMap[offchainFeeInfo.token] ? ethers.utils.formatUnits(offchainFeeInfo.fee, tokenMap[offchainFeeInfo.token].decimals) : '',
    feeRaw: offchainFeeInfo.fee,
    token: offchainFeeInfo.token,
    hasToken: !!offchainFeeInfo.token,
    count: walletMap[offchainFeeInfo.token]?.count,
    discount: offchainFeeInfo.discount ? offchainFeeInfo.discount : undefined,
    __raw__: {
      fastWithDraw: '',
      tokenId: tokenMap[offchainFeeInfo.token]?.tokenId,
      feeRaw: offchainFeeInfo.fee,
    }
  }
}

const networkById = (id: ChainId) => {
  return MapChainId[id] ? (167009 === id ? 'TAIKO' : MapChainId[id]) : undefined
}

const transferToOtherNetwork = async ({
  account,
  transferToken,
  feeToken,
  state,
  configJSON,
  feeRaw,
  walletProvider,
  chainId: defaultNetwork,
  balance
}: {
  account: Account
  transferToken: TokenInfo
  feeToken: TokenInfo
  state: any
  configJSON:  {
    toOtherNetworks: {
      network: string
      supportedTokens: string[]
    }[]
    agentId?: number
    agentAddr?: string
    exchange?: string
  }
  feeRaw: string
  walletProvider: any
  chainId: number
  balance: string
}) => {
  const network = networkById(defaultNetwork)!
  const toNetwork = configJSON.toOtherNetworks[0]?.network
  
  // Get next storage Id for the transfer
  const storageId = await LoopringAPI.userAPI?.getNextStorageId(
    {
      accountId: account.accountId,
      sellTokenId: transferToken.tokenId,
    },
    account.apiKey,
  )
  // Get agent and exchange information from config
  // Prepare the transfer request

  if (
    transferToken.tokenId === feeToken?.tokenId &&
    utils
      .parseUnits(state.amount, transferToken.decimals)
      .add(feeRaw!)
      .gt(utils.parseUnits(balance, transferToken.decimals))
  ) {
    var transferVolume = utils
      .parseUnits(state.amount, transferToken.decimals)
      .sub(ethers.BigNumber.from(feeRaw!))
      .toString()
  } else {
    transferVolume = utils.parseUnits(state.amount, transferToken.decimals).toString()
  }
  const request: RabbitWithdrawRequest = {
    fromNetwork: network,
    toNetwork: toNetwork,
    toAddress: state.receipt,
    transfer: {
      exchange: configJSON.exchange!,
      payerId: account.accountId,
      payerAddr: account.accAddress,
      payeeId: configJSON.agentId!,
      payeeAddr: configJSON.agentAddr!,
      token: {
        tokenId: transferToken.tokenId,
        volume: transferVolume,
      },
      maxFee: {
        // @ts-ignore
        tokenId: feeToken.tokenId,
        volume: ethers.BigNumber.from(feeRaw).toString(),
      },
      storageId: storageId!.offchainId,
      validUntil: getTimestampDaysLater(DAYS),
      counterFactualInfo: account.eddsaKey.counterFactualInfo,
    },
  }
  // Setup provider for transaction signing
  const provider = new ethers.providers.Web3Provider(walletProvider as any)

  // Submit the withdraw request
  return LoopringAPI.rabbitWithdrawAPI!.submitRabitWithdraw(request, {
    exchangeAddr: configJSON.exchange!,
    signer: provider.getSigner(),
    eddsaSignKey: account.eddsaKey.sk,
    chainId: defaultNetwork as number,
  })
}

export const useTransferToTaikoAccount = (): TransferToTaikoAccountProps => {
  const { setShowAccount, setShowTransferToTaikoAccount, setShowBridge, modals } = useOpenModals()
  const { coinJson, defaultNetwork, feeChargeOrder } = useSettings()
  const { app } = useSystem()
  const { tokenMap, idIndex } = useTokenMap()
  const { updateWalletLayer2 } = useWalletLayer2()

  const { fastWithdrawConfig } = useConfig()
  const { account } = useAccount()

  const initialState = {
    transferToken: undefined as string | undefined,
    feeList: undefined as OffchainFeeInfo[] | undefined,
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
  const transferTokenSymbol = state.transferToken 
    ? state.transferToken 
    : modals.isShowTransferToTaikoAccount.info?.initSymbol 
      ? modals.isShowTransferToTaikoAccount.info?.initSymbol 
      : 'ETH'
  const transferToken = tokenMap[transferTokenSymbol]
  const isOverMax =
    state.amount &&
    ethers.utils
      .parseUnits(state.amount, transferToken.decimals)
      .gt(state.maxTransferAmount ?? '0')
  
  
  const { contacts, updateContacts } = useContacts()
  
  const fromNetwork = networkById(defaultNetwork)
  const parsed = fastWithdrawConfig && idIndex && fromNetwork
    ? parseRabbitConfig2(fastWithdrawConfig, fromNetwork, idIndex)
    : undefined
  
  console.log('asjdhjashdjsa', parsed)
  const transferTokenList = parsed?.toOtherNetworks[0]?.supportedTokens || []

  // const toTaikoNetwork = parsed?.toOtherNetworks[0].network

  const refreshData = async () => {
    const globalState = store.getState()
    const account = globalState.account
    const idIndex = globalState.tokenMap.idIndex
    const defaultNetwork = globalState.settings.defaultNetwork
    const fastWithdrawConfig = globalState.config.fastWithdrawConfig

    const fromNetwork = networkById(defaultNetwork)
    const parsed = fastWithdrawConfig && idIndex && fromNetwork
      ? parseRabbitConfig2(fastWithdrawConfig, fromNetwork, idIndex)
      : undefined
    const destinationNetwork = parsed?.toOtherNetworks[0]?.network

    const state = getState()
    const modals = globalState.modals
    const transferTokenSymbol = state.transferToken
      ? state.transferToken
      : modals.isShowTransferToTaikoAccount.info?.initSymbol
      ? modals.isShowTransferToTaikoAccount.info?.initSymbol
      : 'ETH'
    const transferToken = tokenMap[transferTokenSymbol]

    setState((state) => ({
      ...state,
      feeLoading: true
    }))
    const feeRes = await LoopringAPI.rabbitWithdrawAPI
      ?.getUserCrossChainFee(
        {
          receiveFeeNetwork: fromNetwork!,
          requestType: OffchainFeeReqType.RABBIT_OFFCHAIN_WITHDRAWAL,
          calFeeNetwork: destinationNetwork!,
          tokenSymbol: transferTokenSymbol,
          amount: state.amount ? utils.parseUnits(state.amount, transferToken.decimals).toString() : '0',
        },
        account.apiKey,
      ).finally(() => {
        setState(state => ({
          ...state,
          feeLoading: false
        }))
      })

    const destinationNetworkId = _.toPairs(MapChainId).find(([_, v]) => v === destinationNetwork)?.[0]
    const desExchangeAPI = new ExchangeAPI({baseUrl: `https://${process.env[`REACT_APP_API_URL_${destinationNetworkId}`]}`})
    const desTokens = await desExchangeAPI.getTokens()
    transferToken && LoopringAPI.rabbitWithdrawAPI?.getNetworkWithdrawalAgents({
      tokenId: desTokens.tokensMap[transferToken.symbol].tokenId,
      network: destinationNetwork!,
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

    setState((state) => ({
      ...state,
      feeList: feeRes?.fees || [],
    }))
  }

  useEffect(() => {
    var timer: NodeJS.Timeout
    if (modals.isShowTransferToTaikoAccount.isShow && fastWithdrawConfig) {
      timer = setInterval(() => {
        refreshData()
      }, 10 * 1000)
      refreshData()
    }
    return () => {
      timer && clearInterval(timer)
    }
  }, [modals.isShowTransferToTaikoAccount.isShow, fastWithdrawConfig])
  const { walletMap } = makeWalletLayer2({ needFilterZero: true })
  const enoughFeeList = walletMap && tokenMap ? state.feeList?.filter(fee => {
    
    return ethers.utils.parseUnits(walletMap[fee.token]?.count.toString() ?? '0', tokenMap[fee.token].decimals).gte(fee.fee)
    
  }) : []
  const _feeInfo = [state.feeToken, ...feeChargeOrder]
    .map((order) => enoughFeeList?.find((fee) => fee.token === order))
    .filter((fee) => fee)[0]
  const feeInfo = _feeInfo
    ? _feeInfo
    : state.feeList?.find(feeInfo => feeInfo.token === 'ETH')
  const feeTokenSymbol = feeInfo?.token
  const feeToken = (tokenMap && feeTokenSymbol) ? tokenMap[feeTokenSymbol] : undefined
  
  const feeRaw = feeInfo?.fee
  

  const transferTokenWallet = walletMap ? walletMap[transferTokenSymbol] : undefined

  const isInvalidAddress = state.receipt && !ethers.utils.isAddress(state.receipt)
  const balance = 
      transferTokenWallet && transferToken
        ? transferTokenWallet.count
        : undefined;
  const isOverBalance =
    state.amount &&
    new Decimal(state.amount)
      .gt(balance ?? '0')
  const isFeeNotEnough = (() => {
    if (!tokenMap) return false
    if (!feeInfo || !walletMap || !feeTokenSymbol || !walletMap[feeTokenSymbol]?.count || !feeToken)
      return true
    const count = walletMap[feeTokenSymbol]!.count
    return new Decimal(count).lt(utils.formatUnits(feeInfo.fee, feeToken.decimals))
  })()
  const sendBtnDisabled =
    state.feeLoading ||
    !state.amount ||
    new Decimal(state.amount).lessThanOrEqualTo('0') ||
    !state.receipt ||
    isOverMax ||
    isOverBalance ||
    isFeeNotEnough ||
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
  const debouncedRefreshData = useDebouncedCallback(refreshData, 500)

  const isToEthereum =
    parsed?.toOtherNetworks[0]?.network &&
    ['SEPOLIA', 'ETHEREUM'].includes(parsed?.toOtherNetworks[0]?.network)
  const confirmSend = async () => {
    setShowAccount({
      step: AccountStep.Transfer_To_Taiko_In_Progress,
      isShow: true,
      info: {
        isToEthereum
      }
    })
    return transferToOtherNetwork({
      account,
      chainId: defaultNetwork,
      transferToken,
      feeToken: feeToken!,
      state,
      configJSON: parsed!,
      feeRaw: feeRaw!,
      walletProvider: walletProvider,
      balance: balance?.toString() ?? '0',
    }).then((response) => {
      if ((response as any)?.resultInfo?.code || (response as any)?.resultInfo?.message) {
        throw (response as any).resultInfo
      } else if (response.status === 'failed') {
        throw new Error('withdraw filed')
      }
      setShowTransferToTaikoAccount({
        isShow: false
      })
      setState(initialState)
      setShowAccount({
        step: AccountStep.Transfer_To_Taiko_Success,
        isShow: true,
        info: {
          isToEthereum
        }
      })
      sleep(1000).then(() => {
        updateWalletLayer2()
      })
    })
    .catch(e => {
      const msg = checkErrorInfo(e, false)
      const userDenied = [ConnectorError.USER_DENIED, ConnectorError.USER_DENIED_2].includes(
        msg as ConnectorError,
      ) || 'User rejected the request.' === msg
      if (userDenied) {
        setShowAccount({
          step: AccountStep.Transfer_To_Taiko_User_Denied,
          isShow: true,
          info: {
            isToEthereum
          }
        })
      } else {
        setShowAccount({
          step: AccountStep.Transfer_To_Taiko_Failed,
          isShow: true,
          error: {
            code: UIERROR_CODE.UNKNOWN,
            msg: e?.message,
            ...(e instanceof Error
              ? {
                  message: e?.message,
                  stack: e?.stack,
                }
              : e ?? {}),
          },
          info: {
            isToEthereum
          }
        })
      }
    })
    
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
    onClickConfirm: confirmSend,
    onInputAmount: (str) => {
      if (isValidateNumberStr(str, transferToken.precision) || str === '') {
        setState({
          ...state,
          amount: str,
        })
        debouncedRefreshData()
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
    balance: balance
      ? numberFormat(balance, {
          fixed: transferToken.precision,
          removeTrailingZero: true,
        }) +
        ' ' +
        transferTokenSymbol
      : '--',
    token: {
      coinJSON: coinJson[transferTokenSymbol],
      symbol: transferTokenSymbol,
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
          ? state.feeList?.map((item) => offchainFeeInfoToFeeInfo(item, tokenMap, walletMap as any))
          : [],
      handleToggleChange: (feeInfo) => {
        setState({
          ...state,
          feeToken: feeInfo.token!,
        })
      },
      disableNoToken: false,
      onClickFee: () => {},
      feeLoading: state.feeLoading || state.feeList === undefined,
      // isFeeNotEnough: true,
      isFeeNotEnough,
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
          amount: '',
        })
        refreshData()
      },
    },
    receiptInput: state.receipt,
    amountInput: state.amount,
    onClickBack() {
      if (state.panel === 'main') {
        if (modals.isShowTransferToTaikoAccount.from === 'bridge') {
          setShowBridge({ isShow: true })
        } else {
          setShowAccount({
            isShow: true,
            step: AccountStep.SendAssetGateway,
            info: { symbol: modals.isShowTransferToTaikoAccount.info?.initSymbol },
          })
        }
        setShowTransferToTaikoAccount({ isShow: false })
        setState(initialState)
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
      show: isOverMax || isOverBalance,
      message:
        isOverMax && state.maxTransferAmount
          ? `Quota: ${numberFormat(
              utils.formatUnits(state.maxTransferAmount!, transferToken.decimals),
              { fixed: transferToken.precision, removeTrailingZero: true },
            )} ${transferToken.symbol}`
          : isOverBalance
          ? `Insufficient ${transferToken.symbol} balance`
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
    retrySend: () => {
      confirmSend()
    },
    title: isToEthereum
      ? 'Send to Ethereum'
      : 'Send to TAIKO',
    hideContactBtn: app === 'earn'
  } as TransferToTaikoAccountProps
  return output
}
