import { Box, Divider, Typography } from '@mui/material'
import {
  ChartType,
  DEFI_ADVICE_MAP,
  myLog,
  SoursURL,
  YEAR_DAY_MINUTE_FORMAT,
  UpColor,
} from '@loopring-web/common-resources'
import moment from 'moment'
import TrendAprChart from '../charts/scaleAreaChart/APRChart'
import { useSettings } from '../../stores'
import React, { useEffect } from 'react'

export const ETHStakingDetail = ({ symbol, trends, defiInfo: _defiInfo }: any) => {
  myLog('trends', trends)
  const [, baseSymbol] = symbol.match(/(\w+)-(\w+)/i)
  const { upColor } = useSettings()
  const colorRight =
    upColor === UpColor.green
      ? ['var(--color-success)', 'var(--color-error)']
      : ['var(--color-error)', 'var(--color-success)']
  const [defiInfo, setDefiInfo] = React.useState(undefined as undefined | {
    apy: string,
    timestamp:  number
  })
  useEffect(() => {
    setDefiInfo({
      apy: _defiInfo?.apy,
      timestamp: Date.now()
    })
  }, [_defiInfo])
  
  return symbol ? (
    <>
      <Box
        marginTop={-4}
        component={'header'}
        display={'flex'}
        flexDirection={'row'}
        justifyContent={'space-between'}
        width={'var(--modal-width)'}
      >
        <Typography
          component={'header'}
          height={'var(--toolbar-row-height)'}
          display={'flex'}
          paddingX={3}
          flexDirection={'row'}
          alignItems={'center'}
        >
          <Typography component={'span'} flexDirection={'column'} display={'flex'}>
            {DEFI_ADVICE_MAP[baseSymbol]?.project}
            {/*{t('labelEstAPR')}*/}
          </Typography>
        </Typography>
      </Box>
      <Divider />
      {defiInfo && (
        <Box paddingX={3} marginTop={2}>
          <Typography
            variant={'h2'}
            color={defiInfo?.apy?.toString().charAt(0) == '-' ? colorRight[1] : colorRight[0]}
          >
            {(defiInfo?.apy?.toString().charAt(0) == '-' ? '' : '+') + defiInfo?.apy + '%' + ' APR'}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-third)'}>
            {moment(defiInfo.timestamp).format(YEAR_DAY_MINUTE_FORMAT)}
          </Typography>
        </Box>
      )}
      <Box marginX={1} flex={1} display={'flex'}>
        <Box
          width={'100%'}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
          // height={"60%"}
          height={'calc(var(--swap-box-height) - 262px)'}
          sx={{
            minHeihgt: '300px',
          }}
          marginBottom={2}
          // minHeight={420}
        >
          {!trends?.length ? (
            <img
              className='loading-gif'
              alt={'loading'}
              width='36'
              src={`${SoursURL}images/loading-line.gif`}
            />
          ) : (
            <TrendAprChart type={ChartType.Trend} data={trends} showXAxis handleMove={(props) => {
              setDefiInfo({
                apy: props.apy,
                timestamp: props.createdAt 
              })
            }}/>
          )}
        </Box>
      </Box>
    </>
  ) : (
    <></>
  )
}
