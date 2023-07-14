export function coinPairInit({ coinKey, _tradeCalcData, tokenMap, coinMap }: any) {
  if (coinKey) {
    const [_match, sell, buy] = coinKey.match(/(\w+)-(\w+)/i)
    // @ts-ignore
    if (sell && coinMap && coinMap[sell]) {
      _tradeCalcData.coinSell = sell
    } // @ts-ignore
    if (
      sell !== buy &&
      buy &&
      -1 !== tokenMap[sell].tradePairs.findIndex((ele: any) => ele === buy)
    ) {
      _tradeCalcData.coinBuy = buy
      return _tradeCalcData
    }
  }
  if (!_tradeCalcData.coinSell || _tradeCalcData.coinSell === '') {
    _tradeCalcData.coinSell = 'LRC'
    _tradeCalcData.coinBuy = 'ETH'
    return _tradeCalcData
  }
  if (
    !_tradeCalcData.coinBuy ||
    _tradeCalcData.coinBuy === '' ||
    _tradeCalcData.coinBuy === 'undefined'
  ) {
    // @ts-ignore
    if (tokenMap && tokenMap[_tradeCalcData.coinSell]?.tradePairs) {
      _tradeCalcData.coinBuy = tokenMap[_tradeCalcData.coinSell]?.tradePairs[0]
    } else {
      _tradeCalcData.coinSell = 'LRC'
      _tradeCalcData.coinBuy = 'ETH'
    }
  }
  return _tradeCalcData
}
