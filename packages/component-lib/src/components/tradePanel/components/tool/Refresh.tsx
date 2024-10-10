import { CountDownStyled } from '../Styled'
import { Box, Typography } from '@mui/material'
import React from 'react'
import { globalSetup, refreshTime } from '@loopring-web/common-resources'
import * as _ from 'lodash'
import { useTheme } from '@emotion/react'

// @ts-ignore
export const CountDownIcon = React.memo(
  React.forwardRef(
    (
      { onRefreshData, wait = globalSetup.wait, countDownSeconds }: { wait?: number; onRefreshData?: () => void, countDownSeconds?: number },
      ref,
    ) => {
      const countDownRef = React.useRef<any>()
      // React.createRef
      const [refreshCount, setRefreshCount] = React.useState(0)
      const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1)
      const logoTimer = React.useRef<NodeJS.Timeout | -1>(-1)
      React.useEffect(() => {
        if (refreshCount === 0 && onRefreshData) {
          onRefreshData()
        }
      }, [refreshCount])
      // React.useEffect(()=>{
      //
      // },[shouldRefresh])

      const startCountDown = React.useCallback(() => {
        //@ts-ignore
        if (countDownRef && countDownRef.current) {
          //@ts-ignore
          countDownRef.current?.classList.add('countdown')
          //@ts-ignore
          countDownRef.current?.classList?.remove('logo')
          // setRefreshCount(refreshTime-1);
          if (nodeTimer.current !== -1) {
            clearInterval(nodeTimer.current as NodeJS.Timeout)
          }
          nodeTimer.current = setInterval(decreaseNum, 1000)
        }
      }, [countDownRef, nodeTimer])
      const refresh = React.useCallback(
        _.debounce(() => {
          //@ts-ignore
          if (countDownRef && countDownRef.current) {
            // setRefreshCount(0)
            if (nodeTimer.current !== -1) {
              clearInterval(nodeTimer.current as NodeJS.Timeout)
            }
            if (logoTimer.current !== -1) {
              clearTimeout(logoTimer.current as NodeJS.Timeout)
            }
            //@ts-ignore
            countDownRef.current?.classList?.remove('countdown')
            //@ts-ignore
            countDownRef.current?.classList?.add('logo')
            setRefreshCount(0)
            logoTimer.current = setTimeout(() => {
              startCountDown()
            }, 1000 - wait)
          }
        }, wait),
        [],
      )

      const decreaseNum = React.useCallback(
        () =>
          setRefreshCount((prev) => {
            if (prev > 1) {
              return prev - 1
            } else if (prev == 1) {
              //@ts-ignore
              countDownRef?.current?.classList?.remove('countdown')
              //@ts-ignore
              countDownRef?.current?.classList?.add('logo')

              return 0
            } else {
              //@ts-ignore
              countDownRef?.current?.classList?.add('countdown')
              //@ts-ignore
              countDownRef?.current?.classList?.remove('logo')
              return refreshTime - 1
            }
          }),
        [setRefreshCount, countDownRef, refreshTime],
      )

      const cleanSubscribe = React.useCallback(() => {
        clearInterval(nodeTimer.current as NodeJS.Timeout)
        clearTimeout(logoTimer.current as NodeJS.Timeout)
      }, [nodeTimer, logoTimer])
      React.useEffect(() => {
        // _refresh();
        return cleanSubscribe
      }, [])
      const theme = useTheme()
      return (
        <Box ref={ref}>
          <CountDownStyled
            ref={countDownRef}
            component={'button'}
            className={'clock-loading outlined logo'}
            onClick={refresh}
            color={theme.colorBase.logo}
            countDownSeconds={countDownSeconds}
          >
            <Typography component={'span'} className={'text-count'}></Typography>
            <Box className={'circle'} />
          </CountDownStyled>
        </Box>
      )
    },
  ),
)
