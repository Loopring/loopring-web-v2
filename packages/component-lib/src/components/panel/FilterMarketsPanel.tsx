import React from 'react'
import { Box, Tab, Tabs, Typography } from '@mui/material'
import { WithTranslation, withTranslation } from 'react-i18next'
import SwipeableViews from 'react-swipeable-views'
import { useTheme } from '@emotion/react'

interface TabPanelProps {
  children?: React.ReactNode
  index: any
  value: any
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

export const FilterMarketPanel = withTranslation('common')(({ t }: WithTranslation) => {
  const [value, setValue] = React.useState(1)
  const theme = useTheme()

  const handleChange = (_event: any, newValue: any) => {
    setValue(newValue)
  }
  const handleChangeIndex = (index: number) => {
    setValue(index)
  }
  return (
    <Box display={'flex'} flexDirection={'column'}>
      <>
        {/*<AppBar position="static">*/}
        <Tabs value={value} onChange={handleChange} aria-label='tabs switch'>
          <Tab label={t('labelAll')} />
          <Tab label={t('labelFavorite')} />
          <Tab label={'ETH'} />
          <Tab label={'LRC'} />
        </Tabs>
        {/*</AppBar>*/}
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={value}
          onChangeIndex={handleChangeIndex}
        >
          <TabPanel value={value} index={0}></TabPanel>
          <TabPanel value={value} index={1}></TabPanel>
          <TabPanel value={value} index={2}></TabPanel>
          <TabPanel value={value} index={3}></TabPanel>
        </SwipeableViews>
      </>
    </Box>
  )
})
