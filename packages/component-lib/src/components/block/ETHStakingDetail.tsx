import { Box, Divider, Typography } from '@mui/material'
import { ChartType, myLog, SoursURL, YEAR_DAY_MINUTE_FORMAT } from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import TrendAprChart from '../charts/scaleAreaChart/APRChart'

export const ETHStakingDetail = ({ symbol, trends, defiInfo }: any) => {
  const { t } = useTranslation()
  myLog('trends', trends)
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
            {t('labelEstAPR')}
          </Typography>
        </Typography>
      </Box>
      <Divider />
      {defiInfo && (
        <Box paddingX={3} marginTop={2}>
          <Typography variant={'h2'}>{'+' + defiInfo?.apy + '%'}</Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-third)'}>
            {moment().format(YEAR_DAY_MINUTE_FORMAT)}
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
            <TrendAprChart type={ChartType.Trend} data={trends} showXAxis />
          )}
        </Box>
      </Box>
    </>
  ) : (
    <></>
  )
}
