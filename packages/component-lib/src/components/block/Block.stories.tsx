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
import { coinMap, CoinType, FOREXMAP } from "../../static";
import { withTranslation } from "react-i18next";
import {
  AssetTitle,
  AssetTitleProps,
  RedPacketBgOpened,
  RedPacketClock,
  RedPacketDetail,
  RedPacketOpen,
  RedPacketQRCode,
  RedPacketTimeout,
  TradeTitle,
  VipPanel,
} from "./";
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
              priceU: +123,
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
              priceU: -123,
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

const AmmCardWrap = () => {
  const ref = React.createRef();
  const ammInfo: AmmCardProps<CoinType> = {
    handleClick(): void {},
    // ammCalcData,
    forexMap: FOREXMAP,
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
      priceU: 123,
      change: "0%",
      timeUnit: "24h",
      volume: Number("112312312"),
      floatTag: FloatTag.none,
    },
    amountU: 197764.89,
    totalLPToken: 12132131,
    totalA: 0.002,
    totalB: 12344,
    totalAU: 0.002,
    totalBU: 12344,
    rewardToken: "LRC",
    rewardA: 13,
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
    forexMap: FOREXMAP,
    coinAInfo: coinMap.ETH,
    coinBInfo: coinMap.LRC,
    tradeFloat: {
      priceU: +123,
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
                priceU: 123,
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
                priceU: 123,
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
  const url = `https://loopring.io/wallet?redpacket&id=${"sfgffddd"}&referrer=${"0x234234"}`;

  // @ts-ignore
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
        <h4>Red Pock</h4>
        <Grid
          container
          spacing={2}
          alignContent={"stretch"}
          justifyContent={"stretch"}
          marginY={2}
        >
          <Grid item>
            <RedPacketOpen
              amountStr={"1,000 LRC"}
              sender={"0x01....0101"}
              memo={
                "back test back test back test back test  back test back test"
              }
              viewDetail={() => undefined}
              onOpen={() => undefined}
            />
          </Grid>
          <Grid item>
            <RedPacketClock
              type={"official"}
              validSince={0}
              sender={".."}
              amountStr={".."}
              memo={".."}
              showRedPacket={function (): void {
                throw new Error("Function not implemented.");
              }}
            />
          </Grid>
          <Grid item>
            <RedPacketBgOpened type={"default"} />
          </Grid>
          <Grid item>
            <RedPacketBgOpened type={"official"} />
          </Grid>
          <Grid item>
            <RedPacketQRCode
              type={"default"}
              textAddress={"0x01....0101"}
              textContent={"back test back test back test back test"}
              amountStr={"1,000 LRC"}
              textSendBy={"Luck Red Packet"}
              textType={"Luck Red Packet"}
              textShared={"shared"}
              textNo={"1231414"}
              url={url}
              // qrCodeG={qrCodeG}
              textDes={""}
            />
          </Grid>
          <Grid item>
            <RedPacketQRCode
              url={url}
              type={"official"}
              textAddress={"0x01....0101"}
              textContent={"back test back test back test back test"}
              amountStr={"1,000 LRC"}
              textSendBy={""}
              textType={"Relay Red Packet"}
              textShared={"shared"}
              textNo={"1231414"}
              textDes={""}
            />
          </Grid>
          <Grid item>
            <RedPacketTimeout
              sender={"0x01....0101"}
              memo={
                "back test back test back test back test  back test back test"
              }
              viewDetail={() => undefined}
            />
          </Grid>
          <Grid item>
            <RedPacketDetail
              amountStr={"1,000 LRC"}
              sender={"0x01....0101"}
              memo={
                "back test back test back test back test  back test back test"
              }
              amountClaimStr={""}
              myAmountStr={""}
              claimList={[]}
              detail={
                {
                  champion: {
                    accountId: 0,
                    address: "",
                    ens: "",
                    amount: 0,
                  },
                  claimAmount: 0,
                  claims: [],
                  tokenId: 0,
                  hash: "",
                  helpers: [],
                } as any
              }
              isShouldSharedRely={false}
              totalCount={0}
              remainCount={0}
              onShared={function (): void {
                throw new Error("Function not implemented.");
              }}
              page={0}
              handlePageChange={function (
                _page: number,
                _limit?: number
              ): void {
                throw new Error("Function not implemented.");
              }}
            />
          </Grid>

          {/*<Grid item xs={4}>*/}
          {/*  <RedPacketCard*/}
          {/*    luckyTokenItem={REDPACKETMOCK}*/}
          {/*    idIndex={TOKEN_INFO.idIndex}*/}
          {/*    tokenMap={TOKEN_INFO.tokenMap}*/}
          {/*  />*/}
          {/*</Grid>*/}
        </Grid>

        <h4>Vip Panel</h4>
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
