import styled from "@emotion/styled";
import { Meta, Story } from "@storybook/react/types-6-0";
import { MemoryRouter } from "react-router-dom";
import { MyPoolRow as Row, MyPoolTable } from "./index";
import { coinMap } from "../../../static";
import { CoinInfo } from "@loopring-web/common-resources";

const Style = styled.div`
  flex: 1;
  height: 100%;
  flex: 1;
`;

const rawData: Row<any>[] = [
  {
    feeA: 122,
    feeB: 21,
    feeDollar: 0.0012,
    reward: 123,
    rewardToken: coinMap["USDT"] as CoinInfo<any>,
    feeA24: 122,
    feeB24: 122,
    feeDollar24: 0.0012,
    reward24: 123,
    reward224: 123,
    rewardDollar24: 123,
    extraDollar24: 123,
    extraRewards24: [
      {
        tokenSymbol: "LRC",
        amount: 100,
      },
    ],
    balanceA: 12131,
    balanceB: 0.0012,
    balanceDollar: 232,
    ammDetail: {
      coinAInfo: coinMap["ETH"] as CoinInfo<any>,
      coinBInfo: coinMap["LRC"] as CoinInfo<any>,
      amountDollar: 12,
      totalLPToken: 12132131,
      totalA: 0.002,
      totalB: 12344,
      isNew: true,
      isActivity: false,
    },
  },
  {
    feeA: 122,
    feeB: 21,
    feeDollar: 0.0012,
    reward: 123,
    rewardToken: coinMap["USDT"] as CoinInfo<any>,
    feeA24: 122,
    feeB24: 122,
    feeDollar24: 0.0012,
    reward24: 123,
    reward224: 123,
    rewardDollar24: 123,
    extraDollar24: 123,
    extraRewards24: [
      {
        tokenSymbol: "LRC",
        amount: 100,
      },
    ],
    balanceA: 12131,
    balanceB: 0.0012,
    balanceDollar: 232,
    ammDetail: {
      coinAInfo: coinMap["ETH"] as CoinInfo<any>,
      coinBInfo: coinMap["LRC"] as CoinInfo<any>,
      amountDollar: 12,
      totalLPToken: 12132131,
      totalA: 0.002,
      totalB: 12344,
      isNew: true,
      isActivity: false,
    },
  },
  {
    feeA: 122,
    feeB: 21,
    feeDollar: 0.0012,
    reward: 123,
    rewardToken: coinMap["USDT"] as CoinInfo<any>,
    feeA24: 122,
    feeB24: 122,
    feeDollar24: 0.0012,
    reward24: 123,
    reward224: 123,
    rewardDollar24: 123,
    extraDollar24: 123,
    extraRewards24: [
      {
        tokenSymbol: "LRC",
        amount: 100,
      },
    ],
    balanceA: 12131,
    balanceB: 0.0012,
    balanceDollar: 232,
    ammDetail: {
      coinAInfo: coinMap["ETH"] as CoinInfo<any>,
      coinBInfo: coinMap["LRC"] as CoinInfo<any>,
      amountDollar: 12,
      totalLPToken: 12132131,
      totalA: 0.002,
      totalB: 12344,
      isNew: true,
      isActivity: false,
    },
  },
  {
    feeA: 122,
    feeB: 21,
    feeDollar: 0.0012,
    reward: 123,
    rewardToken: coinMap["USDT"] as CoinInfo<any>,
    feeA24: 122,
    feeB24: 122,
    feeDollar24: 0.0012,
    reward24: 123,
    reward224: 123,
    rewardDollar24: 123,
    extraDollar24: 123,
    extraRewards24: [
      {
        tokenSymbol: "LRC",
        amount: 100,
      },
    ],
    balanceA: 12131,
    balanceB: 0.0012,
    balanceDollar: 232,
    ammDetail: {
      coinAInfo: coinMap["ETH"] as CoinInfo<any>,
      coinBInfo: coinMap["LRC"] as CoinInfo<any>,
      amountDollar: 12,
      totalLPToken: 12132131,
      totalA: 0.002,
      totalB: 12344,
      isNew: true,
      isActivity: false,
    },
  },
  {
    feeA: 122,
    feeB: 21,
    feeDollar: 0.0012,
    reward: 123,
    rewardToken: coinMap["USDT"] as CoinInfo<any>,
    feeA24: 122,
    feeB24: 122,
    feeDollar24: 0.0012,
    reward24: 123,
    reward224: 123,
    rewardDollar24: 123,
    extraDollar24: 123,
    extraRewards24: [
      {
        tokenSymbol: "LRC",
        amount: 100,
      },
    ],
    balanceA: 12131,
    balanceB: 0.0012,
    balanceDollar: 232,
    ammDetail: {
      coinAInfo: coinMap["ETH"] as CoinInfo<any>,
      coinBInfo: coinMap["LRC"] as CoinInfo<any>,
      amountDollar: 12,
      totalLPToken: 12132131,
      totalA: 0.002,
      totalB: 12344,
      isNew: true,
      isActivity: false,
    },
  },
];

export const Template: Story<any> = (args: any) => {
  return (
    <>
      <Style>
        <MemoryRouter initialEntries={["/"]}>
          <MyPoolTable {...args} />
        </MemoryRouter>
      </Style>
    </>
  );
};

Template.bind({});

Template.args = {
  rawData: rawData,
  pagination: {
    pageSize: 5,
  },
};

export default {
  title: "components/TableList/MyPoolTable",
  component: MyPoolTable,
  argTypes: {},
} as Meta;
