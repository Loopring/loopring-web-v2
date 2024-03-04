import React from 'react'
import { Meta, Story } from '@storybook/react'

import { Box, Breadcrumbs, Grid, Link, Pagination, Switch, Typography } from '@mui/material'
import { ButtonProps, TGItemData, TGItemJSXInterface } from './Interface'
import {
  BtnPercentage,
  Button,
  LinkActionStyle,
  ModalCloseButton,
  ToggleButtonGroup,
} from './index'
import { WithTranslation, withTranslation } from 'react-i18next'
import styled from '@emotion/styled'

const Styled = styled.div`
  background: var(--color-global-bg);
`
const toggleData: TGItemData[] = [
  { value: '15M', key: '15m' },
  { value: '1H', key: '1h' },
  { value: '4HHH', key: '4HHH', disabled: true },
  { value: '1D', key: '1d' },
]
const ToggleButtonDefault = withTranslation()(({ ...rest }: any) => {
  const [value, setValue] = React.useState('4H')
  const [values, setValues] = React.useState(['4H', '1H'])
  const [cValue, setCValues] = React.useState('4H')
  const tgItemJSXs: TGItemJSXInterface[] = toggleData.map(({ value, label, key, disabled }) => {
    return {
      value,
      tlabel: rest.t(label),
      disabled,
      JSX: <>C {rest.t(key)}</>,
    }
  })
  const handleChange = (_e: React.MouseEvent, value: any) => {
    setCValues(value)
  }
  return (
    <Grid container direction={'column'} spacing={2}>
      <Grid item>
        {' '}
        <ToggleButtonGroup
          exclusive
          size={'large'}
          {...{ ...rest, data: toggleData, value, setValue }}
        />
      </Grid>
      <Grid item>
        {' '}
        <ToggleButtonGroup
          size={'medium'}
          {...{ ...rest, fata: toggleData, value: values, setValue: setValues }}
        />
      </Grid>
      <Grid item>
        {' '}
        <ToggleButtonGroup
          size={'small'}
          exclusive
          {...{
            ...rest,
            data: toggleData,
            value,
            setValue,
            size: 'small',
          }}
        />
      </Grid>
      <Grid item>
        {' '}
        <ToggleButtonGroup
          size={'small'}
          exclusive
          {...{
            ...rest,
            tgItemJSXs,
            value: cValue,
            handleChange,
            size: 'small',
          }}
        />
      </Grid>
    </Grid>
  )
})
const PaginationControlled = () => {
  const [page, setPage] = React.useState(1)
  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  return (
    <>
      <Typography>Page: {page}</Typography>
      <Pagination color={'primary'} count={10} page={page} onChange={handleChange} />
    </>
  )
}

export const LButton: Story<ButtonProps> = withTranslation()(
  ({ t, ...rest }: WithTranslation & any) => {
    const [switched, setSwitched] = React.useState(false)
    /*********Toggle Button**********/
    const [selected, setSelected] = React.useState(-1)
    /*********Toggle **********/

    return (
      <>
        <Styled>
          <h4>Button</h4>
          <Box>
            <Grid
              container
              spacing={2}
              alignContent={'center'}
              justifyContent={'flex-start'}
              flexWrap={'nowrap'}
            >
              <Grid item xs={6} margin={2}>
                <Button variant={'contained'} size={'large'} color={'primary'} fullWidth={true}>
                  {t(`Large contained FullWidth 58`)}
                </Button>
              </Grid>
            </Grid>
            <Grid container spacing={2} alignContent={'center'} justifyContent={'space-between'}>
              <Grid item>
                <Grid container direction={'column'} spacing={2}>
                  <Grid item>
                    {' '}
                    <Button variant={'contained'} size={'large'} color={'primary'}>
                      Large contained 58{' '}
                    </Button>
                  </Grid>
                  <Grid item>
                    {' '}
                    <Button
                      variant={'contained'}
                      size={'large'}
                      color={'primary'}
                      disabled={true}
                      loading={'true'}
                    >
                      Large contained 58{' '}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Grid container direction={'column'} spacing={2}>
                  <Grid item>
                    <Button variant={'contained'} size={'medium'} color={'primary'}>
                      default contained 44
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant={'contained'} size={'medium'} color={'primary'} disabled={true}>
                      default contained 44
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Grid container direction={'column'} spacing={2}>
                  <Grid item>
                    {' '}
                    <Button variant={'contained'} size={'small'} color={'primary'}>
                      small contained 32
                    </Button>
                  </Grid>
                  <Grid item>
                    {' '}
                    <Button variant={'outlined'} size={'medium'} color={'primary'}>
                      outline default 32
                    </Button>
                  </Grid>
                  <Grid item>
                    {' '}
                    <Button variant={'outlined'} size={'medium'} color={'secondary'}>
                      outline primary 32
                    </Button>
                  </Grid>
                  <Grid item>
                    {' '}
                    <Button variant={'outlined'} size={'medium'} disabled={true}>
                      outline default 32
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Button variant={'outlined'} size={'small'} color={'primary'}>
                  outline small 28
                </Button>
              </Grid>
              <Grid item>
                <Typography color={'textPrimary'} variant={'body1'}>
                  <LinkActionStyle color={'textPrimary'}>xxxxxxxxxxx</LinkActionStyle>
                </Typography>
              </Grid>
              <Grid item>
                <ModalCloseButton {...{ t, ...rest }} />
              </Grid>
              <Grid item>
                <Button variant={'text'} size={'medium'} color={'primary'}>
                  Text Btn
                </Button>
                <Button variant={'text'} size={'medium'} color={'primary'} disabled>
                  Text Btn
                </Button>
              </Grid>
              <Grid item>
                <Link underline={'none'}>Test Link</Link>
              </Grid>
            </Grid>
          </Box>

          <h4>Tab Button</h4>
          <Grid container spacing={2} alignContent={'center'} justifyContent={'space-around'}>
            <Grid item margin={2}>
              <Grid container direction={'column'} spacing={2}>
                <Grid item>
                  <Switch
                    checked={switched}
                    color='default'
                    onChange={(e) => setSwitched(e.target.checked)}
                  />
                </Grid>
                <Grid item>
                  <Switch
                    checked={!switched}
                    color='default'
                    onChange={(e) => setSwitched(!e.target.checked)}
                  />
                </Grid>
                <Grid item>
                  <Switch
                    checked={switched}
                    disabled
                    color='default'
                    onChange={(e) => setSwitched(e.target.checked)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <h4>Pagination</h4>
              <Grid item marginY={1}>
                <PaginationControlled />
              </Grid>
              <h4>Percentage selector</h4>
              <Grid item marginY={1}>
                <BtnPercentage
                  selected={selected}
                  handleChanged={(value: any) => {
                    console.log(value)
                    setSelected(value)
                  }}
                />
              </Grid>
            </Grid>

            <Grid item>
              <ToggleButtonDefault />
            </Grid>
            <Grid item>
              <Breadcrumbs aria-label='breadcrumb'>
                <Link color='textSecondary' href='/'>
                  Material-UI
                </Link>
                <Link color='textSecondary' href='/'>
                  Core
                </Link>
                <Typography color='textPrimary'>Breadcrumb</Typography>
              </Breadcrumbs>
            </Grid>
          </Grid>
          <h4>Font</h4>
          <Grid
            container
            spacing={2}
            alignContent={'left'}
            justifyContent={'flex-start'}
            direction={'column'}
          >
            <Grid item>
              <Typography variant={'h1'}>Font size h1 48</Typography>
            </Grid>
            <Grid item>
              <Typography variant={'h2'}>Font size h2 36</Typography>
            </Grid>
            <Grid item>
              <Typography variant={'h3'}>Font size h3 24</Typography>
            </Grid>
            <Grid item>
              <Typography variant={'h4'}>Font size h4 20</Typography>
            </Grid>
            <Grid item>
              <Typography variant={'h5'}>Font size h5 16</Typography>
            </Grid>
            <Grid item>
              <Typography variant={'h6'}>Font size h6 12</Typography>
            </Grid>
            <Grid item>
              <Typography variant={'subtitle1'}>Font size subtitle1</Typography>
            </Grid>
            <Grid item>
              <Typography variant={'body1'}>Font size body1</Typography>
            </Grid>
            <Grid item>
              <Typography variant={'body2'}>Font size body2</Typography>
            </Grid>
          </Grid>
          {/*<Grid container spacing={2} alignContent={'center'} justifyContent={'space-around'}>*/}
          {/*    /!*<Grid item> <Button variant={'outlined'} size={'large'} color={'primary'}>Large primary outlined</Button>*!/*/}
          {/*    /!*</Grid>*!/*/}
          {/*    <Grid item xs={4}> <Button variant={'outlined'} size={'medium'} color={'primary'}>default primary outlined</Button>*/}
          {/*    </Grid>*/}
          {/*    <Grid item> <Button variant={'outlined'} size={'small'} color={'primary'}>small primary outlined</Button>*/}
          {/*    </Grid>*/}
          {/*</Grid>*/}
          {/*<Grid container spacing={2} alignContent={'center'} justifyContent={'space-around'}>*/}
          {/*    /!*<Grid item> <Button variant={'outlined'} size={'large'} color={'secondary'}>Large secondary*!/*/}
          {/*    /!*    outlined</Button> </Grid>*!/*/}
          {/*    <Grid item> <Button variant={'outlined'} size={'medium'} color={'secondary'}>default secondary*/}
          {/*        outlined</Button></Grid>*/}
          {/*    <Grid item> <Button variant={'outlined'} size={'small'} color={'secondary'}>small secondary*/}
          {/*        outlined</Button> </Grid>*/}
          {/*</Grid>*/}
        </Styled>
        {/*</MemoryRouter>*/}
      </>
    )
  },
) as Story<ButtonProps>

//export const Button = Template.bind({});

export default {
  title: 'basic-lib/Buttons',
  component: LButton,
  argTypes: {},
} as Meta
// LButton.args = {}
