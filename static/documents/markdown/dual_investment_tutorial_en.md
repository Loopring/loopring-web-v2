# What is Dual Investment?

Dual Investment is a non-principal protected structured product. Upon purchasing, you can select the underlying asset,
investment currency, investment amount, and delivery date. Your return will be denominated in the investment currency or
alternate currency, depending on the below conditions. The Settlement Price is below/above the Target Price at the
delivery date.

- The target is reached if Settlement Price > Target Price;
- The target is not reached if Settlement Price ≤ Target Price;

Your token for investment is just locked but still in your account as Loopring is a DEX. When the transaction expires,
if the settlement price is greater than the Target price, you will get a profit and the frozen token will also be
unlocked; if the settlement price reaches or is lower than the Target price, your investment and interest income will be
converted into the target token at the Target price.
Each purchased product has a settlement date. We will take an average of the market price in the last 30 minutes before
16:00 (UTC+8) on the delivery date as the settlement price.

> **Please make sure that you fully understand the product and the risks before investing.**
***

## How to calculate my return?

When the target price is reached, your investment and interest income will be converted into USDT with a target price as
the conversion rate.

### Example 1:

###### Invest LRC for LRC-USDT Dual Investment

```text 
Target Price: 0.48   
Settlement Date: 21-AUG-2022   
ROI: 0.6%  
APR: 73%  
Investment Currency: LRC  
```

Assume that the current time is August 18th, the LRC price is 0.42, and the user chooses to invest 1,000 LRC in Dual
Investment due in the week.

###### At 21-AUG-2022

- Scenario 1
    - `If the Settlement Price of LRC on that day is lower than the Target Price of 0.48 USDT, the user will get 0.6% of LRC, that is, 1000 * (1 + 0.6%) LRC = 1006 LRC.`
- Scenario 2
    - `If the Settlement Price of LRC is higher than the Target Price of 0.48 USDT, the end user will get 0.6% of USDT, that is, 1000 * 0.48 * (1 + 0.6%) USDT = 482.88 USDT.`

After the order expires, the user will get 0.6% of the income. The only uncertainty is the currency of the return, which
depends on the LRC/USDT settlement price at the time of expiration.

### Example 2:

###### Invest USDT for USDT-LRC Dual Investment

```text 
Target Price: 0.38  
Settlement Date: 21-AUG-2022  
ROI: 0.6%  
APR: 73%  
Investment Currency: USDT  
```

Assume that the current time is August 18th, the LRC price is 0.42, and the user chooses to invest 1,000 USDT in Dual
Investment due in one week.

###### At 21-AUG-2022

- Scenario 1
    - `the Settlement Price of LRC on that day is lower than the Target Price of 0.38 USDT, the user will get 0.6% of LRC, that is, (1000/0.38) * (1 + 0.6%) LRC = 2647.368 LRC.`
- Scenario 2
    - `If the settlement price of LRC is higher than the Target Price of 0.38 USDT, the end user will receive 0.6% of USDT, that is, 1000 * (1 + 0.6%) USDT = 1006 USDT.`

After the order expires, the user will get 0.6% of the income. The only uncertainty is the currency of the return, which
depends on the LRC/USDT settlement price at the time of expiration.

### Definitions

| Noun | Description |
| :------------ | :------------ |
| Investment Currency  | The currency in which you have purchased the dual investment.  |
| Settlement Currency  | The currency you will receive when the order expires. It will be either the target currency or USDT. Each product is settled depending on whether reaching the target price.  |
| Settlement Date  | The date when the order is settled. Return from the order will be automatically credited into your account on this day after 16:00 (UTC+8) |
| ROI  | The income return on investment. It is expressed in percentages and is used to calculate the settlement amount.  |
| APR  | Annualized Yield is calculated as the equivalent annual return. If continue purchasing with the given yield for a whole year. Annualized Yield = Yield &#47; (Expiry Date – Today) &#42;365.  *Tips: The holding period is actuarial to milliseconds.* |
| Target Price  | Target Price is a benchmark price. On Expiry Day, the Settlement Price will be compared against this benchmark price.  |
| Settlement Price  | The arithmetical average of the Settlement Index sampled every 4 seconds in the last 30 minutes before 16:00 (UTC+8) on the Expiry date.  |
| Settlement Index  | Settlement Index is derived from some leading exchanges. For ETH, it includes Bittrex, Bitstamp, Coinbase Pro, Gemini, Kraken, Itbit, and LMAX Digital; for LRC, it includes Huobi, Binance, OKEx, KuCoin, FTX. The index is calculated as the equally-weighted average of these values.  |

### FAQ

Q： What is the purchase deadline for the dual investment？  
A： Please complete the purchase before 15:00 (UTC+8) on the settlement day.

Q： What’s the difference between Dual investment and Covered Gain？  
A： Covered Gain cannot invest in stable coins. (e.g. USDT) Dual investment can purchase with both stable coins or target
crypto.

Q： Could dual investment redeem or withdraw before being settled？  
A： After purchasing the order, it cannot be canceled or redeemed until the settlement date. After settled, will return
to your trade account.

Q： What’s the risk of dual investment?  
A： According to the rule of dual investment, uncertainty is the settlement currency. The settlement currency will depend
on whether the settlement price has reached the target price at the delivery date.

*The risk of investing in LRC, if there is rising sharply, holding LRC will be sold into USDT at the target price.  
The risk of investing in USDT, if there is a slump, holding USDT will be converted into LRC at the target price. (Even
the LRC price is lower than the target price).*
***
