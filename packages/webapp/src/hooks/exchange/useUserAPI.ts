import { useState, useCallback } from 'react'

import { useAccount } from 'stores/account/hook'

import { OrdersData, dumpError400, } from 'loopring-sdk'

import { REFRESH_RATE } from 'defs/common_defs'

import { useUserAPI } from './useApi'

import { getToken, fromWEI } from 'utils/swap_calc_utils'

import * as fm from 'loopring-sdk'

import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect'

export function useOrders() {

  const acc = useAccount().account

  const api = useUserAPI()

  const [orders, setOrders] = useState<OrdersData>()

  useCustomDCEffect(() => {

    if (!acc || !api) {
      return
    }

    let mounted = true

    const exit = (id: any) => {
      mounted = false
      clearInterval(id)
    }

    if (acc && acc.accountId > 0) {

      const id: any = setInterval(async () => {
        try {
          const { raw_data } = (await api.getOrders({
            accountId: acc.accountId
          }, acc.apiKey))
          if (mounted) {
            setOrders(raw_data)
          }
        } catch (err) {
          return exit(id)
        }
      }, REFRESH_RATE)

      return exit(id)

    }
  }, [acc, api])

  return {
    orders,
  }

}

export function useGetUserBalancesByToken(token: any) {

  const api = useUserAPI()

  //const [balance, setBalance] = useState<any>({total: '0', locked: '0', availableInWei: '0'})

  const [balance, setBalance] = useState<any>('0')

  const { apiKey, accountId } = useAccount()

  useCustomDCEffect(() => {
    if (!api || !apiKey || !accountId || !token) {
      return
    }

    api.getUserBalances({
      accountId,
      tokens: token.tokenId
    }, apiKey).then((data) => {
      const total = fm.toBig(data.userBalances[token.tokenId].total)
      const locked = fm.toBig(data.userBalances[token.tokenId].locked)
      const availableInWei = total.minus(locked)
      /*
      setBalance({
        total: data[0].total, 
        locked: data[0].locked, 
        availableInWei: availableInWei.toString(),
        available: fromWEI(tokens, symbol, availableInWei)
      })
      */
      setBalance(availableInWei.toString())
    }).catch((reason: any) => {
      dumpError400(reason, 'getUserBalances tokenId:' + token.tokenId)
    })

  }, [api, apiKey, accountId, token,])

  return {
    balance,
    setBalance,
  }

}

export function useGetUserBalances(tokens: any, toList: boolean = false) {

  const api = useUserAPI()

  //const [balance, setBalance] = useState<any>({total: '0', locked: '0', availableInWei: '0'})

  const [balances, setBalances] = useState<any>(undefined)

  const { apiKey, accountId } = useAccount()

  // console.log('enter! useGetUserBalances tokens:', tokens, 'symbol:', symbol, 'apiKey:', apiKey, ' accountId:', accountId )

  useCustomDCEffect(() => {

    if (!api || !apiKey || !accountId || !tokens) {
      return
    }

    let tokenList: any[] = []

    const keys = Reflect.ownKeys(tokens)

    let tokenMap: any = {}

    keys.forEach((item: any) => {
      const token = tokens[item]
      tokenList.push(token.tokenId)
      tokenMap[token.tokenId] = token
    })

    api.getUserBalances({
      accountId,
      tokens: tokenList.join(',')
    }, apiKey).then((data) => {

      let balances: any = {
        map: tokenMap,
        tokenId: {},
        symbol: {},
      }

      data.raw_data.forEach((item: any) => {
        const total = fm.toBig(item.total)
        const locked = fm.toBig(item.locked)
        const availableInWei = total.minus(locked)

        const token = tokenMap[item.tokenId]

        balances.tokenId[item.tokenId] = availableInWei.toString()
        balances.symbol[token.symbol] = availableInWei.toString()
      })

      setBalances(balances)

    }).catch((reason: any) => {
      dumpError400(reason, 'getUserBalances tokenId:' + tokens.tokenId)
    })

  }, [api, apiKey, accountId, tokens,])

  return {
    balances,
    setBalances,
  }

}

export function useGetUserBalance(tokens: any, symbol: any) {

  const api = useUserAPI()

  //const [balance, setBalance] = useState<any>({total: '0', locked: '0', availableInWei: '0'})

  const [balance, setBalance] = useState<any>('0')

  const { apiKey, accountId } = useAccount()

  useCustomDCEffect(() => {
    if (!api || !apiKey || !accountId || !tokens || !symbol) {
      return
    }

    const tokenInfo = getToken(tokens, symbol)

    api.getUserBalances({
      accountId,
      tokens: tokenInfo.tokenId
    }, apiKey).then((data) => {
      const total = fm.toBig(data.userBalances[tokenInfo.tokenId].total)
      const locked = fm.toBig(data.userBalances[tokenInfo.tokenId].locked)
      const availableInWei = total.minus(locked)
      
      setBalance(availableInWei.toString())

    }).catch((reason: any) => {
      dumpError400(reason, 'getUserBalances tokenId:' + tokens.tokenId)
    })

  }, [api, apiKey, accountId, tokens, symbol,])

  return {
    balance,
    setBalance,
  }

}