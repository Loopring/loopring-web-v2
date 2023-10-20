import styled from '@emotion/styled'
import { Meta, Story } from '@storybook/react'
import { Box, Button, Grid } from '@mui/material'
import { withTranslation } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import { Popover, PopoverPure, PopoverType } from './index'
import { bindPopper, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import { bindHover } from 'material-ui-popup-state/es'

const Style = styled.div`
  flex: 1;
  height: 100%;
  flex: 1;
`

const Template: Story<any> = withTranslation()((args: any) => {
  const leftState = usePopupState({
    variant: 'popover',
    popupId: `popupId: 'left'`,
  })
  const rightState = usePopupState({
    variant: 'popover',
    popupId: `popupId: 'right'`,
  })
  const centerState = usePopupState({
    variant: 'popover',
    popupId: `popupId: 'center'`,
  })
  const topState = usePopupState({
    variant: 'popover',
    popupId: `popupId: 'top'`,
  })

  return (
    <>
      <Style>
        <MemoryRouter initialEntries={['/']}>
          <Popover {...args} />
          <Grid container>
            <Grid item xs={3}>
              <Button {...bindHover(rightState)}> Hover Open Right </Button>
              <PopoverPure
                className={'arrow-right'}
                {...bindPopper(rightState)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <Box height={100} width={120}>
                  Content:XXXXXXX
                </Box>
              </PopoverPure>
            </Grid>
            <Grid item xs={3}>
              <Button {...bindHover(leftState)}> click open </Button>
              <PopoverPure
                className={'arrow-left'}
                {...bindPopper(leftState)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
                <Box height={100} width={120}>
                  Content:XXXXXXX
                </Box>
              </PopoverPure>
            </Grid>
            <Grid item xs={3}>
              <Button {...bindTrigger(centerState)}> click open </Button>
              <PopoverPure
                className={'arrow-center'}
                {...bindPopper(centerState)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <Box height={100} width={200}>
                  Content:XXXXXXX
                </Box>
              </PopoverPure>
            </Grid>
            <Grid item xs={3} marginTop={8}>
              <Button {...bindTrigger(topState)}> click open </Button>
              <PopoverPure
                className={'arrow-top-center'}
                {...bindPopper(topState)}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <Box height={100} width={200}>
                  Content:XXXXXXX
                </Box>
              </PopoverPure>
            </Grid>
          </Grid>
        </MemoryRouter>
      </Style>
    </>
  )
}) as Story<any>

const children = (
  <Button style={{ margin: 12 }} variant='outlined'>
    btnContent
  </Button>
)

const popoverContent =
  'Because the pool price changes dynamically, the price you see when placing an order may be inconsistent with the final transaction price.'

// @ts-ignore
export const PopoverStory = Template.bind({})
PopoverStory.args = {
  type: PopoverType.click,
  popupId: 'testPopup',
  children,
  popoverContent,
  popoverStyle: {
    width: '180px',
    lineHeight: '16px',
    fontSize: '12px',
    margin: '12px',
  },
}

export default {
  title: 'basic-lib/Popover',
  component: Popover,
  argTypes: {},
} as Meta
