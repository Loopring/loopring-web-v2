import React, { useCallback } from 'react'
import { connectProvides } from '@loopring-web/web3-provider'
import {
  AddressError,
  globalSetup,
  myLog,
  SDK_ERROR_MAP_TO_UI,
  UIERROR_CODE,
  NetworkMap,
  CustomError,
  ErrorMap,
  HEBAO_CONTRACT_MAP,
} from '@loopring-web/common-resources'
import _ from 'lodash'
import * as sdk from '@loopring-web/loopring-sdk'
import { checkAddr } from '../../utils'
import { LoopringAPI, store, useAccount, useContacts, useSystem } from '../../index'
import { ToastType, useOpenModals, useSettings } from '@loopring-web/component-lib'

export const useAddressCheck = (checkLayer2Status: boolean = true) => {
  const [address, setAddress] = React.useState<string>('')
  const _address = React.useRef<string>('')
  const { chainId } = useSystem()
  const { defaultNetwork } = useSettings()
  const [{ realAddr, ens, isENSWrong }, setRealAddr] = React.useState<{
    realAddr: string
    ens: string
    isENSWrong: boolean
  }>({
    realAddr: '',
    ens: '',
    isENSWrong: false,
  })
  // const [ens, setENS] = React.useState<string>('')

  const [addrStatus, setAddrStatus] = React.useState<AddressError>(AddressError.NoError)
  const [checkAddAccountId, setCheckAddaccountId] = React.useState<number | undefined>()
  const [isAddressCheckLoading, setIsAddressCheckLoading] = React.useState(false)
  const [isLoopringAddress, setIsLoopringAddress] = React.useState(false)
  const [isActiveAccount, setIsActiveAccount] = React.useState(false)
  const [isActiveAccountFee, setIsActiveAccountFee] = React.useState<boolean | 'not allow'>(false)
  const [isSameAddress, setIsSameAddress] = React.useState(false)
  const [isCFAddress, setIsCFAddress] = React.useState(false)
  const [isContractAddress, setIsContractAddress] = React.useState(false)
  const [isContract1XAddress, setIsContract1XAddress] = React.useState(false)
  const [loopringSmartWalletVersion, setLoopringSmartWalletVersion] = React.useState(
    undefined as { isLoopringSmartWallet: boolean; version?: string } | undefined,
  )
  const { setShowGlobalToast } = useOpenModals()
  const {
    account: { accAddress, apiKey, accountId },
  } = useAccount()
  const { updateContacts } = useContacts()

  const check = React.useCallback(async (address: any, web3: any) => {
    try {
      if (LoopringAPI.walletAPI && LoopringAPI.exchangeAPI) {
        if (
          /^0x[a-fA-F0-9]{40}$/g.test(address) ||
          /.*\.eth$/gi.test(address) ||
          (/^\d{5,8}$/g.test(address) && Number(address) > 10000)
        ) {
          myLog('address update ', address)
          setIsAddressCheckLoading(true)
          const { realAddr, addressErr, isContract, ens } = await checkAddr(address, web3)
          if (_address.current == address) {
            setRealAddr({ realAddr, ens, isENSWrong: false })
            setAddrStatus(addressErr)
            if (isContract) {
              setIsContractAddress(isContract)
            }
            if (addressErr === AddressError.NoError) {
              const [{ walletType }, response, { contractType: _contractType, raw_data }] =
                await Promise.all([
                  LoopringAPI.walletAPI.getWalletType({
                    wallet: realAddr,
                    network: sdk.NetworkWallet[NetworkMap[defaultNetwork]?.walletType],
                  }),
                  LoopringAPI.exchangeAPI.getAccount({
                    owner: realAddr,
                  }),
                  LoopringAPI.walletAPI.getContractType({
                    wallet: realAddr,
                    network: sdk.NetworkWallet[NetworkMap[defaultNetwork]?.walletType],
                  }),
                ])
              // for debounce & promise clean  (next user input sync function will cover by async)
              if (_address.current == address) {
                if (walletType && walletType?.isInCounterFactualStatus) {
                  setIsCFAddress(true)
                } else {
                  setIsCFAddress(false)
                }
                if (walletType && walletType.isContract) {
                  setIsContractAddress(true)
                } else {
                  setIsContractAddress(false)
                }
                if (walletType && walletType.loopringWalletContractVersion !== '') {
                  setLoopringSmartWalletVersion({
                    isLoopringSmartWallet: true,
                    version: walletType.loopringWalletContractVersion,
                  })
                } else {
                  setLoopringSmartWalletVersion({
                    isLoopringSmartWallet: false,
                  })
                }
                if (walletType && walletType.loopringWalletContractVersion?.startsWith('V1_')) {
                  setIsContract1XAddress(true)
                } else {
                  setIsContract1XAddress(false)
                }

                if (
                  raw_data &&
                  (raw_data as any)?.data[0]?.network &&
                  (raw_data as any)?.data[0]?.network !== NetworkMap[defaultNetwork].walletType
                ) {
                  setIsLoopringAddress(true)
                  setAddrStatus(AddressError.InvalidAddr)
                  setIsActiveAccount(false)
                  setIsActiveAccountFee('not allow')
                } else if (
                  realAddr &&
                  (_contractType as any)?.network &&
                  (_contractType as any)?.network === NetworkMap[defaultNetwork].walletType &&
                  (_contractType as any)?.extra?.createWalletFromInfo?.fromWallet &&
                  (_contractType as any)?.extra?.createWalletFromInfo?.fromWallet?.toLowerCase() ===
                    realAddr.toLowerCase()
                ) {
                  setIsLoopringAddress(true)
                  setIsActiveAccount(
                    response &&
                      ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)
                      ? false
                      : response?.accInfo?.nonce !== 0,
                  )
                  setIsActiveAccountFee('not allow')
                } else if (
                  response &&
                  ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)
                ) {
                  setIsLoopringAddress(false)
                  setIsActiveAccount(false)
                  setIsActiveAccountFee(false)
                } else {
                  setIsLoopringAddress(true)
                  setIsActiveAccount(response.accInfo.nonce !== 0)
                  setIsActiveAccountFee(
                    response.accInfo.nonce === 0 &&
                      /FirstUpdateAccountPaid/gi.test(response.accInfo.tags ?? ''),
                  )
                  setCheckAddaccountId(response.accInfo.accountId)
                }
              }
            } else {
              setIsCFAddress(false)
              setIsLoopringAddress(false)
              setLoopringSmartWalletVersion({
                isLoopringSmartWallet: false,
              })
            }
          }
          myLog('address update async', address, realAddr)
          setIsAddressCheckLoading(false)
        } else {
          throw new CustomError(ErrorMap.ERROR_ADDRESS_CHECK_ERROR) // Error('wrong address format')
        }
      } else {
        throw new CustomError(ErrorMap.ERROR_WRONG_APIKEY)
      }
    } catch (error) {
      error = {
        ...(error as any),
        ...LoopringAPI?.walletAPI?.genErr(error as any),
      }
      // @ts-ignore
      if (_address?.current == address && error?.code == sdk.LoopringErrorCode.HTTP_ERROR) {
        _address.current = ''
        setAddrStatus(AddressError.TimeOut)
        setRealAddr({ realAddr: '', ens: '', isENSWrong: false })
        setIsAddressCheckLoading(false)
      } else {
        setAddrStatus(address === '' ? AddressError.EmptyAddr : AddressError.InvalidAddr)
        myLog('address update address async', address, error)
        setRealAddr({ realAddr: '', ens: '', isENSWrong: false })
        _address.current = ''
        setIsLoopringAddress(false)
        setIsAddressCheckLoading(false)
      }
      if (address !== '' && (error as any)?.code !== 500000) {
        setShowGlobalToast({
          isShow: true,
          info: {
            type: ToastType.info,
            messageKey: (
              SDK_ERROR_MAP_TO_UI[(error as any)?.code ?? UIERROR_CODE.ERROR_ADDRESS_CHECK_ERROR] ??
              SDK_ERROR_MAP_TO_UI[UIERROR_CODE.ERROR_ADDRESS_CHECK_ERROR]
            )?.messageKey,
          },
        })
      }
    }
  }, [])

  const debounceCheck = _.debounce(
    async (address) => {
      myLog('address update sync', address)
      const found = store
        .getState()
        .contacts?.contacts?.find((contact) => contact.contactAddress === address)
      const listNoCheckRequired = [
        sdk.AddressType.LOOPRING_HEBAO_CF,
        sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_1_6,
        sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_2_0,
        sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_0_0,
        sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_1_0,
        sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_2_0,
        sdk.AddressType.EXCHANGE_OTHER,
        sdk.AddressType.EXCHANGE_BINANCE,
        sdk.AddressType.EXCHANGE_OKX,
        sdk.AddressType.EXCHANGE_HUOBI,
        sdk.AddressType.EXCHANGE_COINBASE,
        sdk.AddressType.CONTRACT,
      ].concat(checkLayer2Status ? [sdk.AddressType.EOA] : [])
      if (found && listNoCheckRequired.includes(found.addressType)) {
        let ens = '',
          isENSWrong = false
        if (found?.ens && connectProvides?.usedWeb3) {
          const ensAddr = await connectProvides?.usedWeb3.eth?.ens?.getAddress(found?.ens)
          if (ensAddr?.toLowerCase() !== address?.toLowerCase()) {
            isENSWrong = true
          }
        }
        setRealAddr({ realAddr: address, ens, isENSWrong })
        switch (found.addressType) {
          case sdk.AddressType.LOOPRING_HEBAO_CF:
          case sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_1_6:
          case sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_2_0:
          case sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_0_0:
          case sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_1_0:
          case sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_2_0: {
            if (found.addressType === sdk.AddressType.LOOPRING_HEBAO_CF) {
              // recheck CF Wallet
              const walletTypeResponse = await LoopringAPI.walletAPI?.getWalletType({
                wallet: realAddr,
                network: sdk.NetworkWallet[NetworkMap[defaultNetwork]?.walletType],
              })
              setIsCFAddress(!!walletTypeResponse?.walletType?.isInCounterFactualStatus)
              if (
                !walletTypeResponse?.walletType?.isInCounterFactualStatus &&
                walletTypeResponse?.walletType?.loopringWalletContractVersion
              ) {
                const addressType: number | string = HEBAO_CONTRACT_MAP.find(
                  (x) => x[0] === walletTypeResponse?.walletType?.loopringWalletContractVersion,
                )![1]
                await LoopringAPI.contactAPI?.updateContact(
                  {
                    // contactAddress: found.xaddress,
                    // isHebao: isHebao ? true : false,
                    // contactName: found.name,
                    ...found,
                    isHebao: true,
                    accountId: accountId,
                    addressType: addressType as number,
                  },
                  apiKey,
                )
                updateContacts()
              }
            } else {
              setIsCFAddress(false)
            }
            setIsContractAddress(true)
            setIsContract1XAddress(
              found.addressType === sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_1_6 ||
                found.addressType === sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_2_0,
            )
            setLoopringSmartWalletVersion({
              isLoopringSmartWallet: true,
              version: undefined,
            })
            setAddrStatus(AddressError.NoError)
            if (checkLayer2Status) {
              try {
                const response = await LoopringAPI.exchangeAPI?.getAccount({
                  owner: address, //realAddr != "" ? realAddr : address,
                })
                if (
                  (response &&
                    ((response as sdk.RESULT_INFO).code ||
                      (response as sdk.RESULT_INFO).message)) ||
                  !response
                ) {
                  setIsLoopringAddress(false)
                  setIsActiveAccount(false)
                  setIsActiveAccountFee(false)
                } else {
                  setIsLoopringAddress(true)
                  setIsActiveAccount(response.accInfo.nonce !== 0)
                  setIsActiveAccountFee(
                    response.accInfo.nonce === 0 &&
                      /FirstUpdateAccountPaid/gi.test(response.accInfo.tags ?? ''),
                  )
                }
              } catch {}
              setIsAddressCheckLoading(false)
            }
            break
          }
          case sdk.AddressType.EXCHANGE_OTHER:
          case sdk.AddressType.EXCHANGE_BINANCE:
          case sdk.AddressType.EXCHANGE_OKX:
          case sdk.AddressType.EXCHANGE_HUOBI:
          case sdk.AddressType.EXCHANGE_COINBASE: {
            setIsLoopringAddress(false)
            setIsActiveAccount(false)
            setIsActiveAccountFee(false)
            setIsCFAddress(false)
            setIsContractAddress(false)
            setIsContract1XAddress(false)
            setLoopringSmartWalletVersion({
              isLoopringSmartWallet: false,
            })
            setAddrStatus(AddressError.NoError)
            break
          }
          case sdk.AddressType.CONTRACT: {
            setIsLoopringAddress(false)
            setIsActiveAccount(false)
            setIsActiveAccountFee(false)
            setIsCFAddress(false)
            setIsContractAddress(true)
            setIsContract1XAddress(false)
            setLoopringSmartWalletVersion({
              isLoopringSmartWallet: false,
            })
            setAddrStatus(AddressError.IsNotLoopringContract)
            break
          }
          case sdk.AddressType.EOA: {
            setIsCFAddress(false)
            setIsContractAddress(false)
            setIsContract1XAddress(false)
            setLoopringSmartWalletVersion({
              isLoopringSmartWallet: false,
            })
            setAddrStatus(AddressError.NoError)
            if (checkLayer2Status) {
              setIsAddressCheckLoading(true)
              try {
                const response = await LoopringAPI.exchangeAPI?.getAccount({
                  owner: address, //realAddr != "" ? realAddr : address,
                })
                if (
                  (response &&
                    ((response as sdk.RESULT_INFO).code ||
                      (response as sdk.RESULT_INFO).message)) ||
                  !response
                ) {
                  setIsLoopringAddress(false)
                  setIsActiveAccount(false)
                  setIsActiveAccountFee(false)
                } else {
                  setIsLoopringAddress(true)
                  setIsActiveAccount(response.accInfo.nonce !== 0)
                  setIsActiveAccountFee(
                    response.accInfo.nonce === 0 &&
                      /FirstUpdateAccountPaid/gi.test(response.accInfo.tags ?? ''),
                  )
                }
              } catch {}
              setIsAddressCheckLoading(false)
            }
            break
          }
        }
      } else {
        check(address, connectProvides.usedWeb3)
      }
    },
    globalSetup.wait,
    { maxWait: 1000, leading: false, trailing: true },
  )
  const initAddresss = () => {
    setRealAddr({ realAddr: '', ens: '' })
    setAddrStatus(AddressError.NoError)
    setCheckAddaccountId(undefined)
    setIsLoopringAddress(false)
    setIsActiveAccount(false)
    setIsActiveAccountFee(false)
    setIsSameAddress(false)
    setIsCFAddress(false)
    setIsContractAddress(false)
    setIsContract1XAddress(false)
    setLoopringSmartWalletVersion(undefined)
  }

  React.useEffect(() => {
    // myLog("checkAddress", address, _address.current, isAddressCheckLoading);
    myLog('current address', _address.current, address)
    if (_address.current !== address) {
      if (isAddressCheckLoading == true) {
        //to async norsure should deleted
        initAddresss()
        debounceCheck.cancel()
      }
      _address.current = address
      debounceCheck(address)
    }

    return () => {
      debounceCheck.cancel()
    }
  }, [address, isAddressCheckLoading, chainId])
  const reCheck = React.useCallback(() => {
    debounceCheck(address)
    _address.current = address
    return () => {
      debounceCheck.cancel()
    }
  }, [address])

  React.useEffect(() => {
    setIsSameAddress(realAddr.toLowerCase() === accAddress.toLowerCase())
  }, [realAddr, accAddress])
  return {
    address,
    ens,
    realAddr,
    checkAddAccountId,
    setAddress,
    addrStatus,
    isAddressCheckLoading,
    isLoopringAddress,
    isActiveAccount,
    isCFAddress,
    isSameAddress,
    isContract1XAddress,
    isContractAddress,
    isActiveAccountFee,
    isENSWrong,
    loopringSmartWalletVersion,
    reCheck,
  }
}

// curl 'https://dev.loopring.io/api/v3/user/contact/update' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'Accept-Language: en-US,en;q=0.9,de;q=0.8,zh-CN;q=0.7,zh;q=0.6' \
//   -H 'Connection: keep-alive' \
//   -H 'Content-Type: application/json' \
//   -H 'Origin: https://localhost:3000' \
//   -H 'Referer: https://localhost:3000/' \
//   -H 'Sec-Fetch-Dest: empty' \
//   -H 'Sec-Fetch-Mode: cors' \
//   -H 'Sec-Fetch-Site: cross-site' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' \
//   -H 'X-API-KEY: Vbr9sQv63gaIzWK1dcI16NwSPHWpNQdCMgrQT1W9BxC2dMGlZVHaPKjUjAHyVEeQ' \
//   -H 'feeVersion: v2' \
//   -H 'pf: web' \
//   -H 'sec-ch-ua: "Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"' \
//   -H 'sec-ch-ua-mobile: ?0' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   --data-raw '{"accountId":10012,"contactAddress":"0x145E8aa4ECff3Bdea8d98739105AE038f1f0E352","contactName":"ens wrong","ens":"wrong.eth","isHebao":false,"network":"ETHEREUM"}' \
//   --compressed
