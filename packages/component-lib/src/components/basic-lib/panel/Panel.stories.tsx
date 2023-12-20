import React from 'react'
import styled from '@emotion/styled'
import { Meta, Story } from '@storybook/react'
import { withTranslation } from 'react-i18next'
import { SwitchPanel } from './SwitchPanel'
import { MemoryRouter } from 'react-router-dom'
import {
  Box,
  Button,
  Grid,
  IconButton,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material'

import { AssetsIcon, DropDownIcon } from '@loopring-web/common-resources'
import { SubMenuItem } from '../lists'
import { SubMenu, SwitchPanelProps } from '.'

const Style = styled.div`
  background: var(--color-global-bg);

  height: 100%;
  flex: 1;
`

const FistWrap = ({ onChangeIndex }: any) => {
  // const _tradeValue = tradeValue as {buy:IBData<CoinType>|null,sell:IBData<CoinType>|null} ;
  // let information = {value: "hello, it's callback inject"};
  // setTimeout(() => {
  //     information.value = 'I have update';
  // }, 100);

  const handleOnClick = React.useCallback(
    (_event) => {
      onChangeIndex(1, { data: 'any' })
    },
    [onChangeIndex],
  )

  return (
    <Box
      flex={1}
      display={'flex'}
      justifyContent={'center'}
      alignItems={'center'}
      height={'100%'}
      width={'100%'}
    >
      <Button variant={'outlined'} size={'small'} color={'primary'} onClick={handleOnClick}>
        go to next panel
      </Button>
    </Box>
  )
}

const SecondWrap = () => {
  return <Box flex={1} height={'100%'} width={'100%'} style={{ background: 'cadetblue' }} />
}

const WrapSwitchPanel = (rest: any) => {
  const [index, setIndex] = React.useState<any>(0)
  const onChangeIndex = React.useCallback((index: 0 | 1, value: any) => {
    setIndex(index)
    console.log(value)
  }, [])
  const onTransitionEnd = () => {
    console.log('onTransitionEnd')
  }
  const props: SwitchPanelProps<'coinMap' | 'trade'> = {
    index: index, // show default show
    panelList: [
      {
        key: 'trade',
        element: <FistWrap key={'first'} {...{ ...rest, onChangeIndex, onTransitionEnd }} />,
        toolBarItem: (
          <Grid container justifyContent={'flex-end'}>
            {/*<Grid item >*/}
            <IconButton
              edge='end'
              className={'switch'}
              color='inherit'
              aria-label='to Professional'
            >
              toolbar
            </IconButton>
            {/*</Grid>*/}
            {/*<Grid item >*/}
            {/*<IconButton edge="end"*/}
            {/*            className={'clock-loading'}*/}
            {/*            color="inherit"*/}
            {/*            aria-label="3' price update">*/}
            {/*    <img src={loadingSvg} alt={'loading'}/>*/}
            {/*</IconButton>*/}
            {/*</Grid>*/}
          </Grid>
        ),
      },
      {
        key: 'coinMap',
        element: <SecondWrap key={'second'} {...{ ...rest, onChangeIndex }} />,
        toolBarItem: (
          <Grid container justifyContent={'flex-start'}>
            <IconButton
              edge='start'
              sx={{ transform: 'rotate(90deg)', transformOrigin: '50%' }}
              className={'switch'}
              color='inherit'
              onClick={() => onChangeIndex(0, { data: 0 })}
              aria-label='to Professional'
            >
              <DropDownIcon />
            </IconButton>
          </Grid>
        ),
      },
    ],
  }
  return <SwitchPanel {...{ ...rest, ...props }} />
}
const Template: Story<any> = withTranslation()((props: any) => {
  return (
    <Style>
      <MemoryRouter initialEntries={['/']}>
        <Box>
          <h4>Swith Panel</h4>
          <Grid container spacing={2} alignContent={'center'} justifyContent={'space-around'}>
            <Grid item sm={6}>
              <WrapSwitchPanel {...props}> </WrapSwitchPanel>
            </Grid>
            <Grid>
              <SubMenu>
                <SubMenuItem button selected={true}>
                  <ListItemAvatar>
                    <AssetsIcon />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{ display: 'block' }}
                        component='span'
                        variant='body1'
                        color='text.primary'
                      >
                        Assets
                      </Typography>
                    }
                  />
                </SubMenuItem>
                <SubMenuItem button>
                  <ListItemAvatar>
                    <AssetsIcon />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{ display: 'block' }}
                        component='span'
                        variant='body1'
                        color='text.primary'
                      >
                        Assets
                      </Typography>
                    }
                  />
                </SubMenuItem>
              </SubMenu>
            </Grid>
          </Grid>
        </Box>
      </MemoryRouter>
    </Style>
  )
}) as Story<any>

export default {
  title: 'basic-lib/Panel',
  component: SwitchPanel,
  argTypes: {},
} as Meta
export const PanelStory = Template.bind({})
