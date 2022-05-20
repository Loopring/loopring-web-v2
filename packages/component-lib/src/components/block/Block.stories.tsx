import styled from "@emotion/styled";
import { Meta, Story } from "@storybook/react/types-6-0";
import { MemoryRouter } from "react-router-dom";
import { Grid } from "@mui/material";
import {
  AmmCardProps,
  CoinInfo,
  FloatTag,
  PriceTag,
} from "@loopring-web/common-resources";
import { coinMap, CoinType } from "../../static";
import { withTranslation } from "react-i18next";
import { AssetTitle, AssetTitleProps, TradeTitle, VipPanel } from "./";
import { SettingPanel } from "./SettingPanel";
import { MarketBlock } from "./MarketBlock";
// import { PoolDetailTitle } from './PoolDetailTitle';
import { AmmCard } from "./AmmCard";
import React from "react";

const Style = styled.div`
  background: var(--color-global-bg);
  height: 100%;
  flex: 1;
`;

const vipData = [
  {
    level: "VIP 0",
    tradeVolume: "< 10,000 LRC",
    rule: "1,000.00",
    balance: "1,000.00",
    maker: "1,000.00",
    taker: "1,000.00",
  },
];
const TradeTitleWrap = withTranslation("common")((rest) => {
  // let tradeData: any = {sell: {belong: undefined}, buy: {belong: undefined}};
  let props: any = {
    // swapTradeData: tradeData,
    coinAInfo: coinMap.LRC,
    coinBInfo: coinMap.ETH,
  };
  return (
    <>
      <Grid item>
        <TradeTitle
          {...{
            ...rest,
            ...props,
          }}
        />
      </Grid>
      <Grid item>
        <TradeTitle
          {...{
            ...rest,
            ...props,
            tradeFloat: {
              priceDollar: +123,
              priceYuan: 2343232,
              timeUnit: "24h",
              change: 100,
              close: 121,
            },
          }}
        />
      </Grid>
      <Grid item>
        <TradeTitle
          {...{
            ...rest,
            ...props,
            tradeFloat: {
              priceDollar: -123,
              priceYuan: -2343232,
              timeUnit: "24h",
              change: 100,
              close: 121,
            },
          }}
        />
      </Grid>
    </>
  );
});
// const PoolDetailTitleWrap = withTranslation('common')((rest) => {
//     // let tradeData: any = {sell: {belong: undefined}, buy: {belong: undefined}};
//     let ammProps: any = {
//         // swapTradeData: tradeData,
//         ammCalcData,
//     }
//     return <>
//         <Grid item> <PoolDetailTitle  {...{
//             ...rest, ...ammProps,
//         }} /></Grid>
//         <Grid item> <PoolDetailTitle  {...{
//             ...rest, ...{
//                 ...ammProps,
//                 // swapTradeData: {sell: {belong: 'ETH'}, buy: {belong: 'LRC'}}
//             }, tradeFloat: {priceDollar: +123, priceYuan: 2343232, change: '+15%', timeUnit: "24h"}
//         }} /></Grid>
//         <Grid item> <PoolDetailTitle  {...{
//             ...rest, ...{
//                 ...ammProps,
//                 // swapTradeData: {sell: {belong: 'ETH'}, buy: {belong: 'LRC'}}
//             }, tradeFloat: {priceDollar: -123, priceYuan: -2343232, change: '-15%', timeUnit: "24h"}
//         }} /></Grid>
//
//     </>
// })

const AmmCardWrap = () => {
  const ref = React.createRef();
  const ammInfo: AmmCardProps<CoinType> = {
    handleClick(): void {},
    // ammCalcData,
    coinAInfo: coinMap.ETH as CoinInfo<CoinType>,
    coinBInfo: coinMap.LRC as CoinInfo<CoinType>,
    // @ts-ignore
    activity: {
      totalRewards: 241232132,
      myRewards: 1232.123,
      rewardToken: coinMap.ETH as CoinInfo<CoinType>,
      duration: {
        from: new Date("2021-1-1"),
        to: new Date(),
      },
    },
    APR: 56,
    tradeFloat: {
      priceDollar: 123,
      priceYuan: 2343232,
      change: "0%",
      timeUnit: "24h",
      volume: Number("112312312"),
      floatTag: FloatTag.none,
    },
    amountDollar: 197764.89,
    amountYuan: 194.89,
    totalLPToken: 12132131,
    totalA: 0.002,
    totalB: 12344,
    rewardToken: "LRC",
    rewardValue: 13,
    feeA: 121,
    feeB: 1232,
    isNew: true,
    isActivity: false,
  };

  return <AmmCard ref={ref} {...{ ...ammInfo }} />;
};

const MarketWrap = withTranslation("common")((rest) => {
  let props: any = {
    ...rest,
    coinAInfo: coinMap.ETH,
    coinBInfo: coinMap.LRC,
    tradeFloat: {
      priceDollar: +123,
      priceYuan: 2343232,
      change: "+15%",
      timeUnit: "24h",
      volume: "112312312 USBD",
      floatTag: FloatTag.increase,
    },
  };
  const RowStyled = styled(Grid)`
    & .MuiGrid-root:not(:last-of-type) > div {
      margin-right: ${({ theme }) => theme.unit * 3}px;
    }
  ` as typeof Grid;
  return (
    <>
      <RowStyled container>
        <Grid item xs={3}>
          <MarketBlock {...{ ...props }} />
        </Grid>
        <Grid item xs={3}>
          <MarketBlock
            {...{
              ...props,
              tradeFloat: {
                priceDollar: 123,
                priceYuan: 2343232,
                change: "0%",
                timeUnit: "24h",
                volume: "112312312 USBD",
                floatTag: FloatTag.none,
              },
            }}
          />
        </Grid>
        <Grid item xs={3}>
          <MarketBlock
            {...{
              ...props,
              tradeFloat: {
                priceDollar: 123,
                priceYuan: 2343232,
                change: "-15%",
                timeUnit: "24h",
                volume: "112312312 USBD",
                floatTag: FloatTag.decrease,
              },
            }}
          />
        </Grid>
        <Grid item xs={3}>
          <MarketBlock {...{ ...props }} />
        </Grid>
      </RowStyled>
    </>
  );
});

const SettingPanelWrap = (_rest: any) => {
  return <SettingPanel />;
};

const AssetTitleWrap = (rest: any) => {
  // const dispatch = useDispatch();
  const assetTitleProps: AssetTitleProps = {
    onShowReceive: () => {},
    onShowSend: () => {},
    accountId: 0,
    setHideL2Assets: () => undefined,
    hideL2Assets: false,
    assetInfo: {
      totalAsset: 123456.789,
      priceTag: PriceTag.Dollar,
    },
  };
  return (
    <>
      <Grid item xs={12}>
        <AssetTitle
          {...{
            ...rest,
            ...assetTitleProps,
          }}
        />
      </Grid>
    </>
  );
};
const Template: Story<any> = withTranslation("common")((...rest) => {
  return (
    <Style>
      <MemoryRouter initialEntries={["/"]}>
        <h4>MarketWrap row</h4>
        <MarketWrap />

        <h4>Trade Title</h4>
        <Grid
          container
          spacing={2}
          alignContent={"center"}
          justifyContent={"flex-start"}
          marginBottom={2}
        >
          <TradeTitleWrap />
        </Grid>
        {/*<h4>Amm Detail Title</h4>*/}
        {/*<Grid container spacing={2} alignContent={'center'} justifyContent={'flex-start'} marginBottom={2}>*/}
        {/*    <PoolDetailTitleWrap/>*/}
        {/*</Grid>*/}
        <h4>Amm Card</h4>
        <Grid
          container
          spacing={2}
          alignContent={"center"}
          justifyContent={"flex-start"}
          marginBottom={2}
        >
          <Grid item md={3} xs={4} lg={4}>
            <AmmCardWrap />
          </Grid>
          <Grid item md={3} xs={4} lg={4}>
            <AmmCardWrap />
          </Grid>
          <Grid item md={3} xs={4} lg={4}>
            <AmmCardWrap />
          </Grid>
        </Grid>

        {/*<h4>Account Info</h4>*/}
        {/*<Grid container spacing={2} alignContent={'center'} justifyContent={'flex-start'} marginBottom={2}>*/}
        {/*    <AccountInfoWrap/>*/}
        {/*</Grid>*/}
        <h4>Asset Title</h4>
        <Grid
          container
          spacing={2}
          alignContent={"center"}
          justifyContent={"flex-start"}
          marginBottom={2}
        >
          <AssetTitleWrap />
        </Grid>

        <h4>Setting Panel</h4>
        <Grid
          container
          spacing={2}
          alignContent={"stretch"}
          justifyContent={"stretch"}
          marginBottom={2}
        >
          <Grid item width={460}>
            <SettingPanelWrap />
          </Grid>
        </Grid>

        <h5>Vip Panel</h5>
        <Grid container spacing={2}>
          <Grid item>
            <VipPanel {...{ ...rest }} currentLevel={1} rawData={vipData} />
          </Grid>
        </Grid>
      </MemoryRouter>
    </Style>
  );
}) as Story<any>;

export default {
  title: "components/Block",
  component: TradeTitleWrap,
  argTypes: {},
} as Meta;
//@ts-ignore
export const BlockStory = Template.bind({});
// SwitchPanel.args = {}
