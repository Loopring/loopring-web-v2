export const getMiningLinkList = (lan: string) => {
  if (lan === 'cn') {
    lan = 'zh'
  }
  return {
    'BCDT-ETH': `https://loopring.io/#/embed/amm_mining_14_${lan}`,
    'USDC-USDT': `https://loopring.io/#/embed/orderbook_mining_24_${lan}`,
    'BKT-USDT': `https://loopring.io/#/embed/orderbook_mining_24_${lan}`,
  }
}
