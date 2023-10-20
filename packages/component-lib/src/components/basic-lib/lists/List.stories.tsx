import { Meta, Story } from '@storybook/react'
import styled from '@emotion/styled'
import { MemoryRouter } from 'react-router-dom'
import { HeaderMenu, HeaderMenuSub, HeadMenuItem, Layer2Item } from './HeadMenuItem'

import { withTranslation } from 'react-i18next'
import {
  Box,
  Divider,
  GlobalStyles,
  Grid,
  IconButton,
  List as MuiList,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { coinMap, CoinType, layer2ItemData, walletMap } from '../../../static'
import { CoinMenu } from './CoinList'
import {
  ACTIVITY,
  AssetsIcon,
  CoinInfo,
  DownloadIcon,
  globalCss,
  NOTIFICATION_ITEM,
} from '@loopring-web/common-resources'
import React from 'react'
import { SubMenuItem } from './SubMenuList'
import { TabItemPlus } from './HeadToolbar'
import { ListItemActivity, NotificationListItem } from './Notification'
import { useTheme } from '@emotion/react'

const BtnDownload = ({ t }: any) => (
  <IconButton aria-label={t('downloadApp')}>
    <DownloadIcon />
  </IconButton>
)

const Style = styled.div`
  background: var(--color-global-bg);
`
const SubMenu = withTranslation('layout')((rest: any) => {
  return (
    <>
      <MuiList>
        <SubMenuItem button selected={true} {...rest}>
          <ListItemAvatar>
            <AssetsIcon />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography
                sx={{ display: 'block' }}
                component='span'
                variant='body1'
                color='text.button'
              >
                Assets
              </Typography>
            }
          />
        </SubMenuItem>
        <SubMenuItem button {...rest}>
          <ListItemAvatar>
            <AssetsIcon />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography
                sx={{ display: 'block' }}
                component='span'
                variant='body1'
                color='text.button'
              >
                Assets
              </Typography>
            }
          />
        </SubMenuItem>
        <SubMenuItem button selected={true} alignItems={'flex-start'} {...rest}>
          <ListItemAvatar>
            <AssetsIcon />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography
                sx={{ display: 'block' }}
                component='span'
                variant='body1'
                color='text.button'
              >
                AMM Records
              </Typography>
            }
            secondary={
              <Typography
                sx={{ display: 'inline' }}
                component='span'
                variant='body2'
                color='text.button'
              >
                (Joins & Exits )
              </Typography>
            }
          />
        </SubMenuItem>
        <Divider />
        <SubMenuItem button alignItems={'flex-start'} {...rest}>
          <ListItemAvatar>
            <AssetsIcon />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography
                sx={{ display: 'block' }}
                component='span'
                variant='body1'
                color='text.button'
              >
                AMM Records
              </Typography>
            }
            secondary={
              <Typography
                sx={{ display: 'inline' }}
                component='span'
                variant='body2'
                color='text.button'
              >
                (Joins & Exits )
              </Typography>
            }
          />
        </SubMenuItem>
      </MuiList>
    </>
  )
})

const LoopringHeader = (wrap: any) => {
  const layer2ItemDemo = layer2ItemData.map(({ label, router, child }) => (
    <Layer2Item {...{ ...wrap, label, router, child }} key={label.id} />
  ))
  return (
    <>
      <Grid item>
        <Box display='flex' alignContent='center' justifyContent={'flex-start'}>
          <HeaderMenu className={'wrap'} maxWidth='lg'>
            <HeadMenuItem
              selected={true}
              value={'markets'}
              layer={0}
              key={'markets-0'}
              label={{ id: 'markets', i18nKey: 'markets', icon: '' }}
              {...wrap}
            >
              <Typography component='div' key={'markets'}>
                {wrap.t('markets')}
              </Typography>
            </HeadMenuItem>
            <HeadMenuItem
              value={'layer2'}
              layer={0}
              key={'layer-0'}
              label={{ id: 'layer 2', i18nKey: 'layer', icon: '' }}
              {...wrap}
            >
              <Typography component='div' key={'layer 2'}>
                {wrap.t('layer 2')}
              </Typography>
            </HeadMenuItem>
            <HeaderMenuSub
              selected={true}
              className={'layer-0'}
              renderList={() => layer2ItemDemo}
              layer={0}
              key={'trade-0'}
              label={{ id: 'trade', i18nKey: 'trade', icon: '' }}
              {...wrap}
            />
            <Box
              component={'ul'}
              display='flex'
              alignItems='center'
              justifyContent={'flex-end'}
              color={'textSecondary'}
            >
              <TabItemPlus key={'1'}>
                <BtnDownload {...wrap} />
              </TabItemPlus>
            </Box>
          </HeaderMenu>
        </Box>
      </Grid>
      <Grid item>
        <ul>{layer2ItemDemo}</ul>
      </Grid>
    </>
  )
}
const CoinMapMenu = (rest: any) => {
  return (
    <CoinMenu<CoinType, CoinInfo<CoinType>>
      {...{
        coinMap,
        walletMap,
        handleListItemClick: (_event: any) => {
          // console.log('handleListItemClick', key)
        },
        ...rest,
      }}
    />
  )
}
const TabPanelBtn = () => {
  const [value, setValue] = React.useState('one')

  const handleChange = (_event: any, newValue: any) => {
    setValue(newValue)
  }
  return (
    <Tabs value={value} onChange={handleChange} aria-label='disabled tabs example'>
      <Tab label='Active' value='one' />
      <Tab label='Active' value='three' />
    </Tabs>
  )
}
const Template: Story<any> = withTranslation()(({ t }: any) => {
  const theme = useTheme()
  const activity: ACTIVITY = {
    type: '',
    link: `2021/12/2021-12-23`,
    title: '🎄 Loopring Holiday Trading Giveaway',
    description1: 'Loopring Holiday Trading Giveaway,$600,000 in Prizes!\n',
    description2: 'Period: 2021-12-23 12AM to 2021-12-31 12AM (UAT)',
    startDate: 1639526400000,
    endDate: 1612915200000,
    pairs: ['LRC-ETH'],
    // config: [string, number, number, number, number];
    // giftIcon?: string;
  }
  const notify: NOTIFICATION_ITEM = {
    name: '',
    type: '',
    version: '',
    title: '路印中继系统升级',
    description1: 'Loopring Relayer System Upgrade Notice',
    description2: 'Period: 2021-12-23 12AM to 2021-12-31 12AM (UAT)',
    link: `2021/12/2021-12-23`,
    startShow: 1639526400000,
    endShow: 1612915200000,
  }

  return (
    <Style>
      <MemoryRouter initialEntries={['/']}>
        <GlobalStyles styles={globalCss({ theme })} />
        <h4>Tabs List </h4>
        <Grid container spacing={2} alignContent={'center'} justifyContent={'flex-start'}>
          <LoopringHeader t={t} />
          <Grid item sm={2}>
            <TabPanelBtn />
          </Grid>
        </Grid>
        <h4>MenuList list for select</h4>
        <Grid container spacing={2} alignContent={'center'} justifyContent={'flex-start'}>
          <Grid item xs={3}>
            <Grid item style={{ backgroundColor: 'var(--color-pop-bg)' }}>
              <MenuItem value={1}>
                <ListItemText>{t('test key')}</ListItemText>
              </MenuItem>
              <MenuItem value={1} selected={true}>
                <ListItemText>{t('test key')}</ListItemText>
              </MenuItem>
            </Grid>
          </Grid>
          <Grid item xs={3}>
            <Box width={375} style={{ backgroundColor: 'var(--color-pop-bg)' }}>
              <ListItemActivity {...{ ...activity }} />
              <ListItemActivity {...{ ...activity }} type={''} />
              <ListItemActivity {...{ ...activity }} type={''} />
              <ListItemActivity {...{ ...activity }} type={''} />
              <NotificationListItem key={1} {...{ ...notify }} />
              <NotificationListItem key={1} {...{ ...notify }} />
            </Box>
          </Grid>
        </Grid>
        <Box>
          <Grid container spacing={2} alignContent={'center'} justifyContent={'space-around'}>
            <Grid item xs={6}>
              <h4>Left tab</h4>
              <Box width={200} style={{ backgroundColor: 'var(--color-pop-bg)' }}>
                <SubMenu />
              </Box>
            </Grid>
            <Grid item xs={6} alignContent={'center'} justifyContent={'space-around'}>
              <h4>CoinMap Menu</h4>
              <Box height={200} display={'flex'} style={{ backgroundColor: 'var(--color-pop-bg)' }}>
                <Box flex={1} minWidth={330} height={'100%'}>
                  {<CoinMapMenu t={t} height={200} />}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </MemoryRouter>
    </Style>
  )
}) as Story<any>

// @ts-ignore
export const ListItem = Template.bind({})
ListItem.args = {}
export default {
  title: 'basic-lib/ListItem',
  component: ListItem,
  argTypes: {},
} as Meta
