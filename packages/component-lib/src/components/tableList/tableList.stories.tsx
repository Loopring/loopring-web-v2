import styled from "@emotion/styled";
import { Meta, Story } from "@storybook/react/types-6-0";
import { withTranslation } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { QuoteTable, QuoteTableRawDataItem } from "./QuoteTable";
import { OrderHistoryTable } from "./orderHistoryTable";
import { RawDataTransactionItem, TransactionTable } from "./transactionsTable";
import { OrderHistoryRawDataItem } from "./orderHistoryTable/OrderHistoryTable";
import { TradeStatus, TradeTypes } from "@loopring-web/common-resources";

const Style = styled.div`
  flex: 1;
  height: 100%;
  flex: 1;
`;

// type RawDataItem = (string | number | number[] | string[])[] | {}

const rawDatacoinBPrice: QuoteTableRawDataItem[] = [
  {
    pair: {
      coinA: "LRC",
      coinB: "BUSD",
    },
    close: 12.4,
    floatTag: "decrease",
    change: 8.12,
    high: 123.34,
    low: 23.41,
    volume: 21759000,
    changeDollar: 21759000,
    closeDollar: 21759000,
    coinAPriceDollar: 21759000,
    precision: 3,
    priceDollar: 3,
    reward: 3,
    rewardToken: "3",
    timeUnit: "24h",
  },
];

const rawDataOrderHistory: OrderHistoryRawDataItem[] = [
  {
    market: "ETH-LRC",
    side: TradeTypes.Sell,
    amount: {
      from: { key: "ETH", value: 1231 },
      to: { key: "ETH", value: 1231 },
    },
    average: "12",
    // filledAmount: OrderPair;
    price: {
      key: "ETH",
      value: 1231,
    },
    time: 1223,
    status: TradeStatus.Expired,
    hash: "xxxxxxxxxxx",
    orderId: "xxxxxx",
  },
  {
    market: "ETH-LRC",
    side: TradeTypes.Sell,
    amount: {
      from: { key: "ETH", value: 1231 },
      to: { key: "ETH", value: 1231 },
    },
    average: "12",
    // filledAmount: OrderPair;
    price: {
      key: "ETH",
      value: 1231,
    },
    time: 1223,
    status: TradeStatus.Expired,
    hash: "xxxxxxxxxxx",
    orderId: "xxxxxx",
  },
  {
    market: "ETH-LRC",
    side: TradeTypes.Sell,
    amount: {
      from: { key: "ETH", value: 1231 },
      to: { key: "ETH", value: 1231 },
    },
    average: "12",
    // filledAmount: OrderPair;
    price: {
      key: "ETH",
      value: 1231,
    },
    time: 1223,
    status: TradeStatus.Expired,
    hash: "xxxxxxxxxxx",
    orderId: "xxxxxx",
  },
  {
    market: "ETH-LRC",
    side: TradeTypes.Sell,
    amount: {
      from: { key: "ETH", value: 1231 },
      to: { key: "ETH", value: 1231 },
    },
    average: "12",
    // filledAmount: OrderPair;
    price: {
      key: "ETH",
      value: 1231,
    },
    time: 1223,
    status: TradeStatus.Expired,
    hash: "xxxxxxxxxxx",
    orderId: "xxxxxx",
  },
];

const rawDataTransaction: RawDataTransactionItem[] = [];

const Template: Story<any> = withTranslation()((args: any) => {
  const { type } = args;
  return (
    <>
      <Style>
        <MemoryRouter initialEntries={["/"]}>
          {type === "coinBPrice" ? (
            <QuoteTable {...args} />
          ) : type === "orderHistory" ? (
            <OrderHistoryTable {...args} />
          ) : (
            <TransactionTable {...args} />
          )}
        </MemoryRouter>
      </Style>
    </>
  );
}) as Story<any>;

// @ts-ignore
export const OrderHistory = Template.bind({});
// @ts-ignore
export const Quote = Template.bind({});
// @ts-ignore
export const Transaction = Template.bind({});

Quote.args = {
  rawData: rawDatacoinBPrice,
  type: "coinBPrice",
  onVisibleRowsChange: (data: any) => {
    console.log(data);
  },
};

OrderHistory.args = {
  rawData: rawDataOrderHistory,
  type: "orderHistory",
  showFilter: true,
  // pagination: {
  //     pageSize: 5
  // }
};

Transaction.args = {
  rawData: rawDataTransaction,
  type: "transaction",
  pagination: {
    pageSize: 5,
  },
  showFilter: true,
};
export default {
  title: "components/TableList",
  component: QuoteTable,
  argTypes: {},
} as Meta;
