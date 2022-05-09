import { AmmCard, AmmProps, EmptyDefault } from "@loopring-web/component-lib";
import React from "react";
import { useHistory } from "react-router-dom";
import {
  AmmCardProps,
  AmmInData,
  AmmJoinData,
  AmmExitData,
  IBData,
} from "@loopring-web/common-resources";
import { Box, Grid, Tabs, Tab } from "@mui/material";
import { useAmmMiningUI } from "./hook";
import { Trans, withTranslation } from "react-i18next";
import { AmmPoolActivityRule, LoopringMap } from "@loopring-web/loopring-sdk";
import { useAccount } from "@loopring-web/core";

type ClickHandler = {
  handleClick: (pair: string) => void;
};

const AmmCardWrap = React.memo(
  React.forwardRef(
    (props: AmmCardProps<{ [key: string]: any }> & ClickHandler, ref) => {
      const pair = `${props.coinAInfo.name}-${props.coinBInfo.name}`;
      return props ? (
        <AmmCard
          ref={ref}
          {...props}
          handleClick={() => props.handleClick(pair)}
        />
      ) : (
        <></>
      );
    }
  )
);

const AmmList = <I extends { [key: string]: any }>({
  ammActivityViewMap,
}: {
  ammActivityViewMap: Array<AmmCardProps<I>>;
}) => {
  let history = useHistory();
  const { account } = useAccount();
  const jumpTo = React.useCallback(
    (pair: string) => {
      if (history) {
        history.push(`/liquidity/pools/coinPair/${pair}`);
      }
    },
    [history]
  );

  return (
    <>
      {ammActivityViewMap.length ? (
        ammActivityViewMap.map((item: AmmCardProps<I>, index) => (
          <Grid item xs={12} sm={6} lg={4} key={index}>
            <AmmCardWrap
              account={account}
              handleClick={jumpTo}
              {...(item as any)}
            />
          </Grid>
        ))
      ) : (
        <Box
          flex={1}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          flexDirection={"column"}
        >
          <EmptyDefault
            height={"calc(100% - 35px)"}
            marginTop={10}
            display={"flex"}
            flexWrap={"nowrap"}
            alignItems={"center"}
            justifyContent={"center"}
            flexDirection={"column"}
            message={() => {
              return (
                <Trans i18nKey="labelEmptyDefault">Content is Empty</Trans>
              );
            }}
          />{" "}
        </Box>
      )}{" "}
    </>
  );
};

export const AmmMiningView = withTranslation("common")(
  <
    T extends AmmJoinData<C extends IBData<I> ? C : IBData<I>>,
    TW extends AmmExitData<C extends IBData<I> ? C : IBData<I>>,
    I,
    ACD extends AmmInData<I>,
    C = IBData<I>
  >({
    ammProps,
    t,
    ammActivityMap,
    ...rest
  }: {
    ammProps: AmmProps<T, TW, I, ACD>;
    ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined;
  } & any) => {
    const { ammActivityViewMap, ammActivityPastViewMap } = useAmmMiningUI({
      ammActivityMap,
    });
    const [tabIndex, setTabIndex] = React.useState<0 | 1>(0);
    const handleChange = (event: any, newValue: 0 | 1) => {
      setTabIndex(newValue);
    };

    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Tabs
            value={tabIndex}
            onChange={handleChange}
            aria-label="tabs switch"
          >
            <Tab label={t("labelCurrentActivities")} />
            <Tab label={t("labelPastActivities")} />
          </Tabs>
        </Grid>
        <AmmList
          ammActivityViewMap={
            tabIndex === 0 ? ammActivityViewMap : ammActivityPastViewMap
          }
        />
      </Grid>
    );
  }
);
