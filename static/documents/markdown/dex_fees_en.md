> Last edit: 2021-02-19

## Loopring Exchange

Loopring Exchange charges fees per service type. Each service has a **flat-fee** and a **percentage fee**. For the percentage fee, there is a **minimum-fee** applied, so if the percentage does not hit the minimum, the minimum fee is in effect.
The actual fee charged for a service is `flat_fee + max(minimum_fee, percentage_fee * volume)`.

All users share the same **flat-fees** and **minimum-fees**, but VIPs have different percentage fee settings.

### Exchange Fee Table
Service | Flat-Fee | Minimum-Fee | Normal User | VIP1 | VIP2 | VIP3 | VIP4
:--- | :--- | :--- | :--- | :--- | :--- | :--- | :---
Stablecoin orderbook trade [0]| - | maker:0, taker:2,750 GAS [2] | maker：-0.02%, taker：${ORDERBOOK_TRADING_FEES_STABLECOIN.default}% | maker：-0.02%, taker：${ORDERBOOK_TRADING_FEES_STABLECOIN.vip_1}% | maker：-0.02%, taker：${ORDERBOOK_TRADING_FEES_STABLECOIN.vip_2}% | maker：-0.02%, taker：${ORDERBOOK_TRADING_FEES_STABLECOIN.vip_3}% | maker：-0.02%, taker：${ORDERBOOK_TRADING_FEES_STABLECOIN.vip_4}%
Other orderbook trade [0]| - | maker:0, taker:2,750 GAS [2] |maker：-0.02%, taker：${ORDERBOOK_TRADING_FEES.default}% | maker：-0.02%, taker：${ORDERBOOK_TRADING_FEES.vip_1}% | maker：-0.02%, taker：${ORDERBOOK_TRADING_FEES.vip_2}% | maker：-0.02%, taker：${ORDERBOOK_TRADING_FEES.vip_3}% | maker：-0.02%, taker：${ORDERBOOK_TRADING_FEES.vip_4}%
AMM swap | - | 2,750 GAS [2] | ${AMM_TRADING_FEES.default}% + 0.20%(liquidity provision fees) | ${AMM_TRADING_FEES.vip_1}% + 0.20%(liquidity provision fees)| ${AMM_TRADING_FEES.vip_2}% + 0.20%(liquidity provision fees) | ${AMM_TRADING_FEES.vip_3}% + 0.20%(liquidity provision fees)| ${AMM_TRADING_FEES.vip_4}% + 0.20%(liquidity provision fees)
AMM exit | 100,650 GAS [3] | - | - | - | - | - | -
AMM join | 100,650 GAS [3][4] | - | - | - | - | - | -
L2-to-L2 transfer | 700 GAS [3] | - | - | - | - | - | -
L1-to-L2 transfer (Deposit) | - | - | - | - | - | - | -
L2-to-L1 transfer (Withdrawal) | 45,050 GAS [3] | - | - | - | - | - | -
L2-to-L1 forced transfer (Forced Withdrawal) | 0.02 ETH | - | - | - | - | - | -
L2-to-L1 fast transfer (Fast Withdrawal) [1] | - | 145,050 GAS [3] | 0.50% | 0.50% | 0.50% | 0.50% | 0.50%
Submit order | - | - | - | - | - | - | -
Cancel order | - | - | - | - | - | - | -
Set L2 EdDSA key [2] | 16,050 GAS [3] | - | - | - | - | - | -

Note:

-  '-' means 0 or 0%.
- [1] The minimum amount for fast withdrawal is $5,000
- [2] Waived for the first operation or when this tx is approved with an on-chain hash.
- [3] Actual fee amount will be calculated using the realtime gas-price and fee token's ETH price.
- [4] The fee is temporarily waived.

Many of the above fee settings depends on the price of Ether. Loopring will adjust fee parameters if necessary.
Please keep in mind, since Loopring Exchange is on a zkRollup (secure L2 scaling solution), even though you as a user don't see/pay gas fees explicitly for L2 operations, we publish all proofs and data to Ethereum, so the rollup incurs an 'overhead' gas cost for this Ethereum-level security, which must be covered.

### Maker Rebates

Maker orders will receive 0.02% of trading volume as rebate.

### Affiliate & Referral Rewards

For every trade an affiliate or referrer contributes, the reward we pay per taker order in orderbooks is calculated as follows:

`
(trading_fee - maker_rebate) * trade_volume * 20%
`

the reward we pay per taker order in AMM is calculated as follows:

`
(trading_fee - liquidity_fee) * trade_volume * 20%
`

Out of this reward amount for a taker order, 50% will be given to the user's registration referrer for up to 3 months; and 50% will be given to the third-party platform (affiliate) that contributed the order. Said otherwise: if you - as any Loopring user - refer a friend, you get 10% of their 'net trading fees' for 3 months. If you - as an affiliate application that has an agreement with us - routes an order to Loopring, you get 10% of the 'net trading fee'.

If the taker doesn't have a registration referral or the order is submitted directly without going through a third-party platform, then there is no 'reward', it will go to Loopring relayer.
