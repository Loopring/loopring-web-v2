import { CountDownStyled } from "../Styled";
import { Box, Typography } from "@mui/material";
import React from "react";
import { globalSetup, refreshTime } from "@loopring-web/common-resources";
import * as _ from "lodash";

// @ts-ignore
export const CountDownIcon = React.memo(
  React.forwardRef(
    (
      {
        onRefreshData,
        wait = globalSetup.wait,
      }: { wait?: number; onRefreshData?: () => void },
      ref
    ) => {
      const countDownRef = React.useRef<any>();
      // React.createRef
      const [refreshCount, setRefreshCount] = React.useState(0);
      const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);
      const logoTimer = React.useRef<NodeJS.Timeout | -1>(-1);
      // const [triggerRefresh,setTriggerRefresh]  = React.useState(false);
      // const refresh = () => {_refresh()}

      React.useEffect(() => {
        if (refreshCount === 0 && onRefreshData) {
          onRefreshData();
        }
      }, [refreshCount]);
      // React.useEffect(()=>{
      //
      // },[shouldRefresh])

      const startCountDown = React.useCallback(() => {
        //@ts-ignore
        if (countDownRef && countDownRef.current) {
          //@ts-ignore
          countDownRef.current?.classList.add("countdown");
          //@ts-ignore
          countDownRef.current?.classList?.remove("logo");
          // setRefreshCount(refreshTime-1);
          if (nodeTimer.current !== -1) {
            clearInterval(nodeTimer.current as NodeJS.Timeout);
          }
          nodeTimer.current = setInterval(decreaseNum, 1000);
        }
      }, [countDownRef, nodeTimer]);
      const refresh = React.useCallback(
        _.debounce(() => {
          //@ts-ignore
          if (countDownRef && countDownRef.current) {
            // setRefreshCount(0)
            if (nodeTimer.current !== -1) {
              clearInterval(nodeTimer.current as NodeJS.Timeout);
            }
            if (logoTimer.current !== -1) {
              clearTimeout(logoTimer.current as NodeJS.Timeout);
            }
            //@ts-ignore
            countDownRef.current?.classList?.remove("countdown");
            //@ts-ignore
            countDownRef.current?.classList?.add("logo");
            setRefreshCount(0);
            logoTimer.current = setTimeout(() => {
              startCountDown();
            }, 1000 - wait);
          }
        }, wait),
        []
      );

      const decreaseNum = React.useCallback(
        () =>
          setRefreshCount((prev) => {
            if (prev > 1) {
              return prev - 1;
            } else if (prev == 1) {
              //@ts-ignore
              countDownRef?.current?.classList?.remove("countdown");
              //@ts-ignore
              countDownRef?.current?.classList?.add("logo");

              return 0;
            } else {
              //@ts-ignore
              countDownRef?.current?.classList?.add("countdown");
              //@ts-ignore
              countDownRef?.current?.classList?.remove("logo");
              return refreshTime - 1;
            }
          }),
        [setRefreshCount, countDownRef, refreshTime]
      );

      const cleanSubscribe = React.useCallback(() => {
        clearInterval(nodeTimer.current as NodeJS.Timeout);
        clearTimeout(logoTimer.current as NodeJS.Timeout);
      }, [nodeTimer, logoTimer]);
      React.useEffect(() => {
        // _refresh();
        return cleanSubscribe;
      }, []);
      return (
        <Box ref={ref}>
          <CountDownStyled
            ref={countDownRef}
            component={"button"}
            className={"clock-loading outlined logo"}
            onClick={refresh}
          >
            <Typography component={"span"} className={"text-count"}>
              {/*{refreshCount>0?refreshCount:''}*/}
            </Typography>
            <Box className={"circle"} />
          </CountDownStyled>
        </Box>
      );
    }
  )
);
