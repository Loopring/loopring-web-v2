export const getMiningLinkList = (lan: 'cn' | 'en') => {
    return {
        'BCDT-ETH': `https://loopring.pro/#/embed/amm_mining_14_${lan}`,
        'USDC-USDT': `https://loopring.pro/#/embed/orderbook_mining_24_${lan}`,
        'BKT-USDT': `https://loopring.pro/#/embed/orderbook_mining_24_${lan}`,
    }
}
