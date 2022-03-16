import styled from "@emotion/styled";
import { Meta, Story } from "@storybook/react/types-6-0";
import { withTranslation } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import {
  RawDataTradeItem,
  TradeItemCounterparty,
  TradeItemRole,
  TradeTable,
} from "./index";

const Style = styled.div`
  flex: 1;
  height: 100%;
  flex: 1;
`;

const rawData: RawDataTradeItem[] = [
  {
    role: TradeItemRole.maker,
    amount: {
      from: {
        key: "eth",
        value: 1234,
      },
      to: {
        key: "let",
        value: 5678,
      },
      volume: 1234,
    },
    counterParty: TradeItemCounterparty.orderbook,
    price: {
      key: "ETH",
      value: 1200,
    },
    // priceDollar: number;
    // priceYuan: number;
    fee: {
      key: "LRC",
      value: 0.1,
    },
    time: Date.now(),
    __raw__: {} as any,
  },
  {
    role: TradeItemRole.maker,
    amount: {
      from: {
        key: "eth",
        value: 1234,
      },
      to: {
        key: "let",
        value: 5678,
      },
      volume: 1234,
    },
    counterParty: TradeItemCounterparty.orderbook,
    price: {
      key: "ETH",
      value: 1200,
    },
    // priceDollar: number;
    // priceYuan: number;
    fee: {
      key: "LRC",
      value: 0.1,
    },
    time: Date.now(),
    __raw__: {} as any,
  },
  {
    role: TradeItemRole.maker,
    amount: {
      from: {
        key: "eth",
        value: 1234,
      },
      to: {
        key: "let",
        value: 5678,
      },
      volume: 1234,
    },
    counterParty: TradeItemCounterparty.orderbook,
    price: {
      key: "ETH",
      value: 1200,
    },
    // priceDollar: number;
    // priceYuan: number;
    fee: {
      key: "LRC",
      value: 0.1,
    },
    time: Date.now(),
    __raw__: {} as any,
  },
  {
    role: TradeItemRole.maker,
    amount: {
      from: {
        key: "eth",
        value: 1234,
      },
      to: {
        key: "let",
        value: 5678,
      },
      volume: 1234,
    },
    counterParty: TradeItemCounterparty.orderbook,
    price: {
      key: "ETH",
      value: 1200,
    },
    // priceDollar: number;
    // priceYuan: number;
    fee: {
      key: "LRC",
      value: 0.1,
    },
    time: Date.now(),
    __raw__: {} as any,
  },
];

const Template: Story<any> = withTranslation()((args: any) => {
  return (
    <>
      <Style>
        <MemoryRouter initialEntries={["/"]}>
          <TradeTable {...args} />
        </MemoryRouter>
      </Style>
    </>
  );
}) as Story<any>;

// @ts-ignore
export const Trade = Template.bind({});

Trade.args = {
  rawData: rawData,
  pagination: {
    pageSize: 5,
  },
  showFilter: true,
};

export default {
  title: "components/TableList/Trade",
  component: TradeTable,
  argTypes: {},
} as Meta;
