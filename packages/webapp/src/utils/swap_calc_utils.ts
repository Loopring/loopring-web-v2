import { utils } from 'ethers'

import * as fm from 'loopring-sdk'

import BigNumber from 'bignumber.js'

import { CoinInfo, CoinMap, } from '@loopring-web/component-lib/src/static-resource'
import { DepthData, getBaseQuote, LoopringMap, MarketInfo, MarketStatus, TokenInfo, } from 'loopring-sdk'
import { BIG0, BIG1, BIG10, BIG10K, MULTI_FACTOR, } from '../defs/swap_defs'

export function getIcon(symbol: string, tokens: any) {
    const token: any = tokens[symbol]
    return getIconByTokenInfo(token)
}

export function getIconByTokenInfo(token: TokenInfo) {
    if (token) {
        const addr = utils.getAddress(token.address)
        const path = `https://exchange.loopring.io/assets/images/ethereum/assets/${addr}/logo.png`
        return path
    }
    return ''
}

export function makeCoinInfo(token: TokenInfo) {
    if (token) {
        const info: CoinInfo<any> = {
            icon: getIconByTokenInfo(token),
            name: token.symbol,
            simpleName: token.symbol,
            description: token.name,
            company: token.name,
        }
        return info
    }
    return undefined
}

export const getLeft = (pairs: any, tokens: any) => {
    if (pairs) {

        const left = Reflect.ownKeys(pairs)

        let coinMapLeft: CoinMap<any, CoinInfo<any>> = {}

        left.forEach((key: any) => {
            coinMapLeft[key] = {
                icon: getIcon(key, tokens),
                name: key,
                simpleName: key,
                description: '',
                company: ''
            }
        })

        return {
            left,
            coinMapLeft,
        }
    }

    return undefined
}

export const getRight = (pairs: any, left: any, tokens: any) => {
    if (pairs) {
        const right = pairs[left].tokenList

        let coinMapRight: CoinMap<any, CoinInfo<any>> = {}

        if (right) {
            right.forEach((key: any) => {
                coinMapRight[key] = {
                    icon: getIcon(key, tokens),
                    name: key,
                    simpleName: key,
                    description: '',
                    company: ''
                }
            })

            return {
                right,
                coinMapRight,
            }
        }
    }
    return undefined
}

export const getToken = (tokens: any, token: any) => {
    if (!tokens) {
        throw Error('no tokens list!')
    }
    return tokens[token]
}

export const getTokenInfoByToken = (ammBalance: any, tokens: any, token: any) => {

    const tokenInfo = getToken(tokens, token)

    const tokenVol = ammBalance.pooledMap[tokenInfo.tokenId].volume
    const reserve = fm.toBig(tokenVol)

    return {
        tokenInfo, tokenVol, reserve,
    }
}

const getKey = (base: any, quote: any) => {

    if (!base || !quote) {
        return {
            key: undefined,
            key_bak: undefined,
            isOK: false,
        }
    }

    const isLRCETH = false
    const key = isLRCETH ? 'LRCETH-Pool' : ('AMM-' + base + '-' + quote)
    const key_bak = isLRCETH ? 'LRCETH-Pool' : ('AMM-' + quote + '-' + base)
    return {
        key,
        key_bak,
        isOK: true,
    }
}

const getInfoByKey = (raw_data: any, keyPair: any) => {
    const {
        key,
        key_bak,
    } = keyPair

    if (raw_data[key]) return raw_data[key]
    return raw_data[key_bak]
}

export const getBalances = (ammpools: any, ammPoolsBalances: any, base: any, quote: any, tokens: any) => {

    const { ammInfo,
        ammBalance,
    } = getAmmInfo(ammpools, ammPoolsBalances, base, quote)

    const baseToken = getToken(tokens, base)
    const quoteToken = getToken(tokens, quote)

    const baseBalance = ammBalance.pooledMap[baseToken.tokenId]
    const quoteBalance = ammBalance.pooledMap[quoteToken.tokenId]

    return {
        ammInfo,
        ammBalance,
        baseBalance,
        quoteBalance,
    }

}

export const getAmmInfoOnly = (ammpools: any, base: any, quote: any) => {

    const keyPair = getKey(base, quote)

    const ammInfo = getInfoByKey(ammpools, keyPair)

    if (!ammInfo) {
        throw Error('no ammInfo!')
    }

    return {
        ammInfo,
    }

}

export const getAmmInfo = (ammpools: any, ammPoolsBalances: any, base: any, quote: any) => {

    const keyPair = getKey(base, quote)

    const ammInfo = getInfoByKey(ammpools, keyPair)
    const ammBalance = getInfoByKey(ammPoolsBalances, keyPair)

    if (!ammInfo || !ammBalance) {
        throw Error('no ammInfo! no ammBalance!')
    }

    const feeBips = parseInt(ammInfo.feeBips)

    return {
        ammInfo,
        ammBalance,
        feeBips,
    }

}

const getAmt = (rawAmt: any, tokenInfo: any) => {
    if (rawAmt === undefined) {
        rawAmt = 0
    }

    return fm.toBig(rawAmt).times('1e' + tokenInfo.decimals)
}

export const applySlippageTolerance = (
    tokens: any,
    token: any,
    value: any,
    slippageTolerance: number = 0.01
) => {
    const tokenInfo = getToken(tokens, token)
    const f = 1e7
    const feeFactor = fm.toBig(f * (1 - slippageTolerance))
    const amount = fm.toBig(value).times('1e' + tokenInfo.decimals)
    const outInWei = amount.times(feeFactor).dividedBy(f)
    const out = fromWEI(tokens, token, outInWei)

    return {
        outInWei,
        out,
    }
}

export const applyOrderFee = (tokens: any, token: any, value: any, feeBip: any) => {
    const tokenInfo = getToken(tokens, token)
    const feeFactor = fm.toBig(MULTI_FACTOR - feeBip)
    const amount = fm.toBig(value).times('1e' + tokenInfo.decimals)
    const appliedAmount = amount.times(feeFactor).dividedBy(MULTI_FACTOR)
    return appliedAmount
}

export function fromWEI(tokens: any, symbol: any, valueInWEI: any, precision?: any, ceil?: any) {
    try {
        const tokenInfo = getToken(tokens, symbol)
        const precisionToFixed = precision ? precision : tokenInfo.precision
        const value = fm.toBig(valueInWEI).div('1e' + tokenInfo.decimals)
        return fm.toFixed(value, precisionToFixed, ceil)
    } catch (error) {
    }
    return '0'
}


export function toWEI(tokens: any, symbol: any, value: any, rm: any = 3) {
    const tokenInfo = getToken(tokens, symbol)
    if (typeof tokenInfo === 'undefined') {
        return '0'
    }

    return fm.toBig(value)
        .times('1e' + tokenInfo.decimals)
        .toFixed(0, rm)
}

export const getAmountOut = (amt: any, ammpools: any, ammPoolsBalances: any, tokens: any,
    base: any, quote: any, takerRate: number, currentPrice: number) => {

    if (amt === undefined) {
        amt = 0
    }

    const { ammBalance, feeBips, } = getAmmInfo(ammpools, ammPoolsBalances, base, quote)

    const { tokenInfo: baseTokenInfo, reserve: reserveIn } = getTokenInfoByToken(ammBalance, tokens, base)
    const { tokenInfo: quoteTokenInfo, reserve: reserveOut } = getTokenInfoByToken(ammBalance, tokens, quote)

    const amountIn = getAmt(amt, baseTokenInfo)
    const feeBipsFactor = fm.toBig(MULTI_FACTOR - feeBips)
    const amountInWithFee = amountIn.times(feeBipsFactor)
    const numerator = amountInWithFee.times(reserveOut)
    const denominator = reserveIn.times(MULTI_FACTOR).plus(amountInWithFee)
    const amountOutInWei: any = numerator.dividedBy(denominator)

    let quoteAmt: any = fromWEI(tokens, quote, amountOutInWei)

    const _amount1ApplyOrderFeeInWei = applyOrderFee(tokens, quote, quoteAmt, takerRate + feeBips)

    let _amount1ApplyOrderFee = Number(fromWEI(tokens, quote, _amount1ApplyOrderFeeInWei))

    let priceImpact = 0
    if (_amount1ApplyOrderFee < 0) {
        _amount1ApplyOrderFee = 0
        quoteAmt = null
    } else {
        const newPrice = Number(quoteAmt) / Number(amt)
        priceImpact = (newPrice - currentPrice) / currentPrice
    }

    return {
        quoteAmt,
        _amount1ApplyOrderFeeInWei,
        _amount1ApplyOrderFee,
        priceImpact,
    }

}

export const getAmountOut_Reverse = (amt: any, ammpools: any, ammPoolsBalances: any, tokens: any,
    base: any, quote: any, takerRate: number, currentPrice: number) => {

    if (amt === undefined) {
        amt = 0
    }
    
    const { ammBalance, feeBips, } = getAmmInfo(ammpools, ammPoolsBalances, base, quote)

    const { tokenInfo: baseTokenInfo, reserve: reserveIn } = getTokenInfoByToken(ammBalance, tokens, base)
    const { tokenInfo: quoteTokenInfo, reserve: reserveOut } = getTokenInfoByToken(ammBalance, tokens, quote)

    const amountOut = getAmt(amt, quoteTokenInfo)

    if (amountOut.gt(reserveOut)) {
        return {
            baseAmt: 0,
            _amount1ApplyOrderFeeInWei: 0,
            _amount1ApplyOrderFee: 0,
            priceImpact: 0,
            hasError: false,
        }
    }

    const numerator = amountOut.times(reserveIn).times(MULTI_FACTOR)
    const feeBipsFactor = fm.toBig(MULTI_FACTOR - feeBips)

    // If amountOut is larger than reserveOut?
    // It's handled before getAmountOut_reserve
    const reserveOutSubAmountOut = reserveOut.minus(amountOut)

    const denominator = feeBipsFactor.times(reserveOutSubAmountOut)
    const amountInInWei = numerator.dividedBy(denominator)

    let baseAmt: any = fromWEI(tokens, quote, amountInInWei)

    const _amount1ApplyOrderFeeInWei = applyOrderFee(tokens, quote, amt, takerRate + feeBips)

    let _amount1ApplyOrderFee = Number(fromWEI(tokens, quote, _amount1ApplyOrderFeeInWei))

    let priceImpact = 0
    if (_amount1ApplyOrderFee < 0) {
        _amount1ApplyOrderFee = 0
        baseAmt = null
    } else {
        const newPrice = Number(amt) / Number(baseAmt)
        priceImpact = (newPrice - currentPrice) / currentPrice
    }

    return {
        baseAmt,
        _amount1ApplyOrderFeeInWei,
        _amount1ApplyOrderFee,
        priceImpact,
        hasError: false,
    }

}

export function isEmpty(input: any) {
    if (!input || input.trim() === '') {
        return true
    }

    return false
}

function getAmountOutWithFeeBips(amountIn: string, feeBips: string, reserveIn: string, reserveOut: string ) {
    const amountInBig = fm.toBig(amountIn)
    const reserveInBig = fm.toBig(reserveIn)
    const reserveOutBig = fm.toBig(reserveOut)
    
    if (amountInBig.lt(BIG0) || reserveInBig.lt(BIG0) || reserveOutBig.lt(BIG0)) {
        return BIG0
    }
    const feeBipsBig = fm.toBig(feeBips)

    const amountInWithFee = amountInBig.times(BIG10K.minus(feeBipsBig))
    const numerator = amountInWithFee.times(reserveOutBig)
    const denominator = reserveInBig.times(BIG10K).plus(amountInWithFee)

    return numerator.div(denominator)
}

function getAmountInWithFeeBips(amountOut: string, feeBips: string, reserveIn: string, reserveOut: string ) {
    const amountOutBig = fm.toBig(amountOut)
    const reserveInBig = fm.toBig(reserveIn)
    const reserveOutBig = fm.toBig(reserveOut)
    
    if (amountOutBig.lt(BIG0) || reserveInBig.lt(BIG0) || reserveOutBig.lt(BIG0)) {
        return BIG0
    }
    const feeBipsBig = fm.toBig(feeBips)

    const numerator = reserveInBig.times(amountOutBig).times(BIG10K)
    const denominator = reserveOutBig.times(amountOutBig).times(BIG10K.minus(feeBipsBig))

    return numerator.div(denominator).plus(BIG1)
}

function getOutputOrderbook(input: string, feeBips: string, isAtoB: boolean) {
    let output: string  = "0"
    let remain: string  = input
}

export function getOutputAmount(base: string, quote: string, market: string, 
    input: string, isAtoB: boolean, feeBips: string, 
    tokenMap: LoopringMap<TokenInfo>, marketMap: LoopringMap<MarketInfo>, depth: DepthData) {

    if (isEmpty(input) || isEmpty(feeBips) || !(market in Object.keys(marketMap))) {
        return undefined
    }

    const { base: baseRaw, quote: quoteRaw } = getBaseQuote(market)

    const marketInfo: MarketInfo = marketMap[market]

    const isSwapEnabled = marketInfo.status === MarketStatus.ALL || marketInfo.status === MarketStatus.AMM

    input = input.trim()

    let exceedDepth = false

    const reserveIn = ''
    const reserveOut = ''

    if (isAtoB) {

        // bids_amtTotal -> bidsSizeShown
        // asks_volTotal -> asksQuoteSizeShown
        const amountInWei = toWEI(tokenMap, base, input)

        if (isEmpty(depth.bids_amtTotal) || isEmpty(depth.asks_volTotal)) {
            exceedDepth = true
        } else {

            if (base === baseRaw) {
                exceedDepth = fm.toBig(amountInWei).lt(fm.toBig(depth.bids_amtTotal))
            } else {
                exceedDepth = fm.toBig(amountInWei).lt(fm.toBig(depth.asks_volTotal))
            }

        }

        let amountB = new BigNumber(0)

        if (exceedDepth) {
            if (isSwapEnabled) {
                amountB = getAmountOutWithFeeBips(amountInWei, feeBips, reserveIn, reserveOut)
            }
        } else {
            amountB = fm.toBig(toWEI(tokenMap, base, getOutputOrderbook(input, feeBips, isAtoB)))
        }

        return fromWEI(tokenMap, quote, amountB)

    } else {

        // asks_amtTotal -> asksSizeShown
        // bids_volTotal -> bidsQuoteSizeShown

        if (isEmpty(depth.bids_volTotal) || isEmpty(depth.asks_amtTotal)) {
            exceedDepth = true
        } else {
            const amountInWei = toWEI(tokenMap, quote, input)

            if (base === baseRaw) {
                exceedDepth = fm.toBig(amountInWei).gt(fm.toBig(depth.bids_volTotal))
            } else {
                exceedDepth = fm.toBig(amountInWei).gt(fm.toBig(depth.asks_amtTotal))
            }

        }

        let amountSBint = BIG0

        const amountB: string = toWEI(tokenMap, quote, input)

        if (exceedDepth) {
            if (isSwapEnabled) {
                amountSBint = getAmountInWithFeeBips(amountB, feeBips, reserveIn, reserveOut)
            }
        } else {
            amountSBint = fm.toBig(toWEI(tokenMap, base, getOutputOrderbook(input, feeBips, isAtoB)))
        }

        if (amountSBint.gt(BIG0)) {
            return fromWEI(tokenMap, base, amountSBint)
        }

        return '0'

    }

}
