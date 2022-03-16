import { myLog, UpColor } from "@loopring-web/common-resources";
import {
  ChartType,
  ScaleAreaChart,
  ToggleButtonGroup,
  TradeTitle,
  useSettings,
} from "@loopring-web/component-lib";
import { Box, Grid, styled } from "@mui/material";
import { WithTranslation } from "react-i18next";
import { useBasicInfo } from "./hook";
import { VolToNumberWithPrecision } from "utils/formatter_tool";
import { useTokenMap } from "stores/token";
import { useAmmActivityMap } from "stores/Amm/AmmActivityMap";

const BoxStyle = styled(Box)`
  .recharts-responsive-container {
    flex: 1;
    height: 100%;
  }
` as typeof Box;
const BasicInfoPanel = ({
  props,
  coinAInfo,
  coinBInfo,
  tradeFloat,
  marketArray,
  t,
  ...rest
}: any & WithTranslation) => {
  const {
    baseShow,
    quoteShow,
    chartType,
    tgItemJSXs,
    handleChange,
    originData,
  } = useBasicInfo(props, coinAInfo, coinBInfo, marketArray, t);
  const { activityInProgressRules } = useAmmActivityMap();
  // const tradeRaceList = (ammActivityMap?.SWAP_VOLUME_RANKING?.InProgress || []).map(o => o.market)
  const { upColor, isMobile } = useSettings();
  const { marketMap } = useTokenMap();
  const baseToken = coinAInfo?.name;
  const quoteToken = coinBInfo?.name;
  const marketPrecision = marketMap
    ? marketMap[`${baseToken}-${quoteToken}`]?.precisionForPrice
    : 0;

  // myLog('basicInfo baseToken:', baseToken, ' quoteToken:', quoteToken)

  const trendChartData =
    originData && !!originData.length
      ? originData.sort((a: any, b: any) => a.timeStamp - b.timeStamp)
      : [];
  const depthChartData =
    originData && coinAInfo && originData.asksAmtTotals
      ? {
          ...originData,
          asksAmtTotals: originData.asksAmtTotals.map((amt: string) =>
            Number(VolToNumberWithPrecision(amt, baseToken))
          ),
          bidsAmtTotals: originData.bidsAmtTotals.map((amt: string) =>
            Number(VolToNumberWithPrecision(amt, baseToken))
          ),
        }
      : [];

  return (
    <>
      {isMobile ? (
        <ScaleAreaChart
          type={chartType}
          data={chartType === ChartType.Trend ? trendChartData : depthChartData}
          riseColor={upColor as keyof typeof UpColor}
          extraInfo={quoteToken}
          handleMove={() => {}}
          showXAxis
          marketPrecision={marketPrecision}
        />
      ) : (
        <Box display={"flex"} flexDirection={"column"} alignItems={"stretch"}>
          <Box
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <TradeTitle
              {...{
                baseShow,
                quoteShow,
                coinAInfo,
                coinBInfo,
                ...rest,
                t,
                tradeFloat,
                activityInProgressRules,
              }}
            ></TradeTitle>
            <ToggleButtonGroup
              exclusive
              {...{ ...rest, t, tgItemJSXs, value: chartType }}
              onChange={handleChange}
              size={"medium"}
            />
          </Box>
          <BoxStyle
            flex={1}
            display={"flex"}
            flexDirection={"column"}
            minHeight={"var(--chart-height)"}
            height={"var(--chart-height)"}
            maxHeight={420}
          >
            <ScaleAreaChart
              type={chartType}
              data={
                chartType === ChartType.Trend ? trendChartData : depthChartData
              }
              riseColor={upColor as keyof typeof UpColor}
              extraInfo={quoteToken}
              handleMove={() => {}}
              showXAxis
              marketPrecision={marketPrecision}
            />
          </BoxStyle>
        </Box>
      )}
    </>
  );
};

export default BasicInfoPanel;
