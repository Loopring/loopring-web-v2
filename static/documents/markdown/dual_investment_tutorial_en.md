# What is Dual Investment?

Dual Investment is a non-principal protected structured product. Upon purchasing, you can select the underlying asset,
investment currency, investment amount, and delivery date. Your return will be denominated in the investment currency or
alternate currency, depending on the below conditions.

There are two types of Dual Investment products: “Buy Low” and “Sell High”.

Buy Low products gives you a chance to buy your desired crypto (such as LRC) at a lower price in the future with
stablecoins (USDC).

- Target Reached: On the Settlement Date, if the Market Price is at or below the Target Price, the target currency (LRC)
  will be bought;
- Target Not Reached: On the Settlement Date, if the Market Price is above the Target Price, then you will keep your
  stablecoins;  
  In both scenarios, you will first earn interest in stablecoins. Once the Target Price is reached, your subscription
  amount and interest income will be used to buy LRC.

Sell High products gives you a chance to sell your existing crypto (such as LRC) at a higher price in the future (for
USDC).

- Target Reached: On the Settlement Date, the Market Price is at or above the Target Price, your LRC will be sold for
  USDC.
- Target Not Reached: On the Settlement Date, the Market Price is below the Target Price, then you will keep your LRC.  
  In both scenarios, you will first earn interest in your existing currency (LRC). Once the Target Price is reached,
  your subscription amount and interest income will be sold for USDC.

Your token for investment is just locked but still in your account as Loopring is a DEX. 

Each purchased product has a settlement date. We will take an average of the market price in the last 30 minutes before 16:00 (UTC+8) on the delivery date as the settlement price. 

> **Please make sure that you fully understand the product and the risks before investing.**
***

## How to calculate my return?

When the target price is reached, your investment and interest income will be converted into USDC with a target price as
the conversion rate.

### Example 1:

###### Invest LRC for LRC-USDC Dual Investment

```text 
Target Price: 0.48   
Settlement Date: 21-AUG-2022   
APR: 73%  
Investment Currency: LRC  
```

Assume that the current time is August 18th, the LRC price is 0.42, and the user chooses to invest 1,000 LRC in Dual
Investment due in the week.

###### At 21-AUG-2022

- Scenario 1
    - `If the Settlement Price of LRC on that day is lower than the Target Price of 0.48 USDC, the user will get 0.6% of LRC, that is, 1000 * (1 + 73% / 365 * 3) LRC = 1006 LRC.`
- Scenario 2
    - `If the Settlement Price of LRC is higher than the Target Price of 0.48 USDC, the end user will get 0.6% of USDC, that is, 1000 * 0.48 * (1 + 73% / 365 * 3) USDC = 482.88 USDC.`

After the order expires, the user will get 0.6% of the income. The only uncertainty is the currency of the return, which
depends on the LRC/USDC settlement price at the time of expiration.

### Example 2:

###### Invest USDC for LRC-USDC Dual Investment

```text 
Target Price: 0.38  
Settlement Date: 21-AUG-2022   
APR: 73%  
Investment Currency: USDC  
```

Assume that the current time is August 18th, the LRC price is 0.42, and the user chooses to invest 1,000 USDC in Dual
Investment due in one week.

###### At 21-AUG-2022

- Scenario 1
    - `the Settlement Price of LRC on that day is lower than the Target Price of 0.38 USDC, the user will get 0.6% of LRC, that is, (1000/0.38) * (1 + 73% / 365 * 3) LRC = 2647.368 LRC.`
- Scenario 2
    - `If the settlement price of LRC is higher than the Target Price of 0.38 USDC, the end user will receive 0.6% of USDC, that is, 1000 * (1 + 73% / 365 * 3) USDC = 1006 USDC.`

After the order expires, the user will get 0.6% of the income. The only uncertainty is the currency of the return, which
depends on the LRC/USDC settlement price at the time of expiration.

### Definitions

| Noun | Description |
| :------------ | :------------ |
| Investment Currency  | The currency in which you have purchased the dual investment.  |
| Settlement Currency  | The currency you will receive when the order expires. It will be either the target currency or USDC. Each product is settled depending on whether reaching the target price.  |
| Settlement Date  | The date when the order is settled. Return from the order will be automatically credited into your account on this day after 16:00 (UTC+8) |
| APR  | Annualized Yield is calculated as the equivalent annual return. If continue purchasing with the given yield for a whole year. Annualized Yield = Yield &#47; (Expiry Date – Today) &#42;365.  *Tips: The holding period is actuarial to milliseconds.* |
| Target Price  | Target Price is a benchmark price. On Expiry Day, the Settlement Price will be compared against this benchmark price.  |
| Settlement Price  | The arithmetical average of the Settlement Index sampled every 4 seconds in the last 30 minutes before 16:00 (UTC+8) on the Expiry date.  |
| Settlement Index  | Settlement Index is derived from some leading exchanges. For ETH, it includes Bittrex, Bitstamp, Coinbase Pro, Gemini, Kraken, Itbit, and LMAX Digital; for LRC, it includes Huobi, Binance, OKEx, KuCoin, FTX. The index is calculated as the equally-weighted average of these values.  |

### FAQ

Q： What is the purchase deadline for the dual investment？  
A： Please complete the purchase before 15:00 (UTC+8) on the settlement day.

Q： What’s the difference between Dual investment and Covered Gain？  
A： Covered Gain cannot invest in stable coins. (e.g. USDC) Dual investment can purchase with both stable coins or target
crypto.

Q： Could dual investment redeem or withdraw before being settled？  
A： After purchasing the order, it cannot be canceled or redeemed until the settlement date. After settled, will return
to your trade account.

Q： What’s the risk of dual investment?  
A： According to the rule of dual investment, uncertainty is the settlement currency. The settlement currency will depend
on whether the settlement price has reached the target price at the delivery date.

Q： What are the benefits of using Dual Investment on Loopring?  
A：Your token for investment is just locked but still in your account as Loopring is a DEX. When the transaction expires, if the settlement price is not reached, you will get a profit and the frozen token will also be unlocked; if the settlement price is reached, your investment and interest income will be converted into the target token at the Target price.

*The risk of investing in LRC, if there is rising sharply, holding LRC will be sold into USDC at the target price.  
The risk of investing in USDC, if there is a slump, holding USDC will be converted into LRC at the target price. (Even
the LRC price is lower than the target price).*
***
