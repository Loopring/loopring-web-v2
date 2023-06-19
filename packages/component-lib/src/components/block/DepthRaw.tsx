import { Box, Grid, Typography } from "@mui/material";
import { MarketInfo } from "@loopring-web/loopring-sdk";
import { WithTranslation, withTranslation } from "react-i18next";
import { DepthViewData, MarketRowHeight } from "@loopring-web/common-resources";
import styled from "@emotion/styled";
import { useSettings } from "../../stores";

export type Row = DepthViewData & {
  type: DepthType;
  onClick: (
    event: MouseEvent,
    chooseDepth: DepthViewData,
    type: DepthType
  ) => void;
};
export const GridStyle = styled(Grid)`
  margin: 0;

  &:hover {
    background: var(--color-box-hover);
    transition: background 0.4s ease-out;
  }

  & > .MuiGrid-item {
    padding-top: 0;
    padding-left: 0;
  }
` as typeof Grid;

export enum DepthType {
  ask = "ask",
  bid = "bid",
}

export const Depth = ({
  onClick,
  depthLevel,
  ...rest
}: Row & { depthLevel?: number }) => {
  // const theme = useTheme();
  const { isMobile } = useSettings();
  const { price, amtForShow, amtTotalForShow, percentage, type } = rest;
  const digitNum = depthLevel || 0;
  let formattedPrice = price as any;
  let [_init, _dot] = String(price || "").split(".");
  if (_dot) {
    const dotLen = _dot.length;
    if (dotLen < digitNum) {
      for (let i = dotLen; i < digitNum; i++) {
        _dot += "0";
      }
      formattedPrice = _init + "." + _dot;
    }
  } else {
    let fakeDot = ".";
    for (let i = 0; i < digitNum; i++) {
      fakeDot += "0";
    }
    formattedPrice += fakeDot;
  }

  const color =
    type === DepthType.ask ? "var(--color-error)" : "var(--color-success)";
  return (
    <GridStyle
      container
      spacing={1}
      position={"relative"}
      wrap={"nowrap"}
      style={{ cursor: "pointer" }}
      onClick={(e) => onClick(e as any, { ...rest }, type)}
    >
      <Box
        style={{ opacity: 0.1, backgroundColor: color }}
        display={"block"}
        position={"absolute"}
        right={0}
        width={percentage * 100 + "%"}
        height={`${MarketRowHeight}px`}
        zIndex={42}
      />
      <Grid item xs={6} lg={4} alignSelf={"flex-start"} zIndex={55}>
        <Typography
          lineHeight={`${MarketRowHeight}px`}
          color={color}
          variant={"body2"}
        >
          {formattedPrice}
        </Typography>
      </Grid>
      <Grid
        item
        xs={6}
        lg={4}
        alignSelf={"flex-end"}
        textAlign={"right"}
        zIndex={55}
      >
        <Typography
          lineHeight={`${MarketRowHeight}px`}
          color={"text.secondary"}
          variant={"body2"}
        >
          {amtForShow}
        </Typography>
      </Grid>
      {!isMobile && (
        <Grid
          item
          xs={6}
          lg={4}
          alignSelf={"flex-end"}
          textAlign={"right"}
          zIndex={55}
        >
          <Typography
            lineHeight={`${MarketRowHeight}px`}
            color={"text.secondary"}
            variant={"body2"}
          >
            {amtTotalForShow}
          </Typography>
        </Grid>
      )}
    </GridStyle>
  );
};

export const DepthTitle = withTranslation("common")(
  ({
    marketInfo,
    t,
  }: {
    marketInfo: MarketInfo;
  } & WithTranslation) => {
    // @ts-ignore
    const [, baseSymbol, quoteSymbol] =
      marketInfo?.market?.match(/(\w+)-(\w+)/i);
    const { isMobile } = useSettings();

    return marketInfo?.market ? (
      <GridStyle container spacing={1} position={"relative"} wrap={"nowrap"}>
        <Grid item xs={6} lg={4} alignSelf={"flex-start"}>
          <Typography
            lineHeight={`${MarketRowHeight}px`}
            color={"var(--color-text-third)"}
            textOverflow={"ellipsis"}
            title={t("labelDepthPrice", { symbol: quoteSymbol })}
            variant={"body2"}
            component={"p"}
          >
            {t("labelDepthPrice", { symbol: quoteSymbol })}
          </Typography>
        </Grid>
        <Grid item xs={6} lg={4} alignSelf={"flex-end"}>
          <Typography
            lineHeight={`${MarketRowHeight}px`}
            title={t("labelDepthAmount", { symbol: baseSymbol })}
            color={"var(--color-text-third)"}
            textOverflow={"ellipsis"}
            overflow={"hidden"}
            variant={"body2"}
            textAlign={"right"}
            component={"p"}
          >
            {t("labelDepthAmount", { symbol: baseSymbol })}
          </Typography>
        </Grid>
        {!isMobile && (
          <Grid item xs={6} lg={4} alignSelf={"flex-end"}>
            <Typography
              lineHeight={`${MarketRowHeight}px`}
              color={"var(--color-text-third)"}
              variant={"body2"}
              textAlign={"right"}
              title={t("labelDepthTotal")}
              component={"p"}
            >
              {t("labelDepthTotal")}
            </Typography>
          </Grid>
        )}
      </GridStyle>
    ) : (
      <></>
    );
  }
);
export const DepthBlock = withTranslation("common")(
  ({
    depths,
    onClick,
    // tokenBaseInfo,
    type,
    depthLevel,
  }: {
    onClick: (
      event: MouseEvent,
      chooseDepth: DepthViewData,
      type: DepthType
    ) => void;
    type: DepthType;
    // quotePrecision:number,
    depths: DepthViewData[];
    marketInfo: MarketInfo;
    depthLevel?: number;
  } & WithTranslation) => {
    return (
      <>
        {depths.map((depth, index) => {
          // const amt_p = ;
          //
          // const amtTotal_p = getValuePrecisionThousand(toBig(depth.amtTotal).div('1e' + tokenBaseInfo.decimals),
          //     undefined, undefined, marketInfo.precisionForPrice, true);

          return (
            <Depth
              onClick={onClick}
              key={index}
              {...{
                ...depth,
                type,
                depthLevel,
              }}
            />
          );
        })}
      </>
    );
  }
);
