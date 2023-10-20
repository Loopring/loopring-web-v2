import React from 'react'
import { Meta, Story } from '@storybook/react'
import styled from '@emotion/styled'
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel as MuiFormControlLabel,
  Grid,
  Link,
  ListItemText,
  SelectChangeEvent,
  Typography,
} from '@mui/material'
import { InputCoinProps, MenuItem, OutlineSelect, OutlineSelectItem } from '../../basic-lib'
import { Trans, withTranslation } from 'react-i18next'
import {
  DatePicker,
  DateRangePicker,
  InputButton,
  InputButtonProps,
  InputSearch,
  InputSelect,
  InputSelectProps,
  TextField,
} from './input'
import {
  CheckBoxIcon,
  CheckedIcon,
  CloseIcon,
  CoinInfo,
  CoinKey,
  DropDownIcon,
  i18n,
  IBData,
  LanguageType,
} from '@loopring-web/common-resources'
import { DateRange } from '@mui/lab'
import { EmptyDefault } from '../empty'
import { coinMap, CoinType, inputProps, walletMap } from '../../../static'
import { CoinMenu } from '../lists'
import { InputCoin } from './input'
import { IconClearStyled } from '../../tradePanel'

const Style = styled.div`
  background: var(--color-global-bg);
`
export default {
  title: 'basic-lib/Form',
  component: TextField,
  argTypes: {},
} as Meta

const InputButtonWrap = () => {
  let information = { value: "hello, it's callback inject" }

  setTimeout(() => {
    information.value = 'I have update'
  }, 100)

  const ref = React.createRef<HTMLInputElement>()
  const handleError = ({ belong, balance, tradeValue }: IBData<CoinType>) => {
    if (typeof tradeValue !== 'undefined' && balance < tradeValue) {
      return { error: true, message: `Not enough ${belong} perform a deposit` }
    }
    return { error: false }
  }
  const [data, setData] = React.useState<IBData<CoinType>>({
    belong: 'ETH',
    balance: 23244,
    tradeValue: 0,
  })
  const handleCountChange = React.useCallback((ibData: IBData<CoinType>) => {
    setData(ibData)
  }, [])

  const handleOnClick = React.useCallback(
    (_event) => {
      console.log(information)
    },
    [information],
  )

  let _inputProps: InputButtonProps<IBData<CoinType>, CoinType, CoinInfo<CoinType>> = {
    isShowCoinIcon: true,
    isShowCoinInfo: true,
    handleOnClick,
    ...inputProps,
  }

  return (
    <>
      <Grid item xs={4}>
        <InputButton<IBData<CoinType>, CoinType, CoinInfo<CoinType>> {..._inputProps} />
      </Grid>

      <Grid item xs={4}>
        <InputButton<IBData<CoinType>, CoinType, CoinInfo<CoinType>>
          {...{
            ..._inputProps,
            ...{
              maxAllow: true,
              inputData: data,
              handleError,
              handleCountChange,
              ref,
            },
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <InputButton<IBData<CoinType>, CoinType, CoinInfo<CoinType>>
          {...{ ..._inputProps, ...{ inputData: data } }}
        />
      </Grid>
    </>
  )
}
export const BtnLanguage = ({ handleChange }: any) => {
  const _handleChange = React.useCallback(
    (event: SelectChangeEvent<any>) => {
      if (handleChange) {
        handleChange(event.target.value)
      }
    },
    [handleChange],
  )
  return (
    <OutlineSelect
      IconComponent={DropDownIcon}
      labelId='language-selected'
      id='language-selected'
      value={i18n.language}
      onChange={_handleChange}
    >
      <OutlineSelectItem value={LanguageType.en_US}>EN</OutlineSelectItem>
      <OutlineSelectItem value={LanguageType.zh_CN}>中文</OutlineSelectItem>
    </OutlineSelect>
  )
}
const InputIconWrap = () => {
  const ref = React.createRef<HTMLInputElement>()
  const handleError = ({ belong, balance, tradeValue }: IBData<CoinType>) => {
    if (typeof tradeValue !== 'undefined' && balance < tradeValue) {
      return { error: true, message: `Not enough ${belong} perform a deposit` }
    }
    return { error: false }
  }
  const [data, setData] = React.useState<IBData<CoinType>>({
    belong: 'ETH',
    balance: 23244,
    tradeValue: 0,
  })
  const handleCountChange = React.useCallback((ibData: IBData<CoinType>) => {
    setData(ibData)
  }, [])

  let _inputProps: InputCoinProps<IBData<CoinType>, CoinType, CoinInfo<CoinType>> = {
    handleCountChange,
    ...inputProps,
    isShowCoinIcon: true,
    isShowCoinInfo: true,
  } as any

  return (
    <>
      <Grid item xs={4}>
        <InputCoin<IBData<CoinType>, CoinType, CoinInfo<CoinType>>
          {...{
            ..._inputProps,
            ...{
              maxAllow: true,
              inputData: data,
              handleError,
              ref,
            },
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <InputCoin<IBData<CoinType>, CoinType, CoinInfo<CoinType>>
          {...{
            ..._inputProps,
            ...{
              order: 'right',
              maxAllow: true,
              inputData: data,
              handleError,
              ref,
            },
          }}
        />
      </Grid>
    </>
  )
}

const SimpleSelect = ({ t }: any) => {
  const datas = [
    { label: 'Text1', value: '1' },
    { label: 'Text2', value: '2' },
    { label: 'Text3', value: '3' },
    { label: 'Text4', value: '4' },
    { label: 'Text5', value: '5' },
    { label: 'Text6', value: '6' },
    { label: 'Text7', value: '7' },
    { label: 'Text8', value: '8' },
    { label: 'Text4TextTextTextTextText', value: '9' },
    { label: 'Text3', value: '10' },
    { label: 'Text4TextTextTextTextText', value: '11' },
    { label: 'Text4TextTextTextTextText', value: '12' },
  ]
  const [value, setValue] = React.useState('1')
  return (
    <>
      <FormControl>
        <TextField
          id='outlined-select-currency'
          select
          label='type'
          value={value}
          onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
            setValue(event.target.value as string)
          }}
          inputProps={{ IconComponent: DropDownIcon }}
        >
          {datas.map(({ label, value }) => (
            <MenuItem key={value} value={value}>
              {t(label)}
            </MenuItem>
          ))}
        </TextField>
      </FormControl>
    </>
  )
}
const InputSelectWrap = (rest: any) => {
  const ref = React.useRef<any>(null)
  const selected: CoinKey<CoinType> = 'TEST3'
  const backElement = React.useMemo(
    () => (
      <>
        {/*<Button variant={'text'} size={'medium'} color={'primary'}*/}
        {/*       */}
        {/*></Button>*/}
        <Typography component={'span'} fontSize={'body1'} color={'textPrimary'}>
          <Link
            color={'inherit'}
            style={{ color: 'var(--color-text-primary)', textAlign: 'right' }}
            onClick={() => {}}
          >
            Cancel
          </Link>
        </Typography>
      </>
    ),
    [],
  )
  const inputSelectProps: InputSelectProps<CoinType> = {
    placeholder: 'Search Coin',
    focusOnInput: true,
    allowScroll: true,
    selected: '',
    panelRender: () => <></>,
    backElement,
    handleContentChange: (value) => {
      console.log('FilterString', value)
      //setFilterString(value);
    },
  }
  const handleListItemClick = (value: any) => {
    console.log('handleListItemClick', value)
  }
  const filterBy = (coinInfo: CoinInfo<CoinType>, filterString: string) => {
    return filterString && filterString.length
      ? RegExp(filterString, 'i').test(coinInfo.simpleName)
      : true
  }
  const PanelRender = ({ selected, value }: any) => {
    return (
      <CoinMenu<CoinType, CoinInfo<CoinType>>
        {...{
          coinMap,
          height: '410px',
          filterBy,
          filterString: value,
          walletMap,
          selected,
          ...rest,
        }}
        ref={ref}
      />
    )

    {
      /*<CoinMenu<CoinType, CoinInfo<CoinType>>  style={{ width: '100px', height:'100px' }}*/
    }
    {
      /*    width={330} height={100} {...{coinMap, walletMap, ...rest}}></CoinMenu>*/
    }
    // </Box>
  }

  const PanelEmptyRender = () => {
    return (
      <Box alignSelf={'center'}>
        <EmptyDefault
          message={() => {
            return <Trans i18nKey='labelEmptyDefault'>Content is Empty</Trans>
          }}
        />
      </Box>
    )
  }

  return (
    <>
      <Grid item xs={6} md={4}>
        <Box height={500} width={338}>
          <InputSelect
            {...{
              ...inputSelectProps,
              panelRender: PanelRender,
              handleListItemClick,
              ...rest,
            }}
          />
        </Box>
      </Grid>
      <Grid item xs={6} md={4}>
        <Box height={500} width={338}>
          <InputSelect
            {...{
              ...inputSelectProps,
              panelRender: PanelRender,
              selected,
              handleListItemClick,
              ...rest,
            }}
          />
        </Box>
      </Grid>
      <Grid item xs={6} md={4}>
        <Box height={500} width={338}>
          <InputSelect
            {...{
              ...inputSelectProps,
              panelRender: PanelEmptyRender,
              ...rest,
            }}
          />
        </Box>
      </Grid>
    </>
  )
}
const MyDatePicker = (props: any) => {
  const [value, setValue] = React.useState<Date | undefined>(new Date())
  const [svalue, setSValue] = React.useState<DateRange<Date | string>>([new Date(), new Date()])
  return (
    <>
      <Grid item xs={4}>
        <DatePicker
          {...props}
          label='Basic example'
          value={value}
          onChange={(newValue: any) => setValue(newValue)}
        />
      </Grid>
      <Grid item xs={4}>
        <DateRangePicker
          {...props}
          value={svalue}
          onChange={(newValue: any) => setSValue(newValue)}
          startText='Start'
          endText='End'
        />
      </Grid>
    </>
  )
}
// const SearchWrap = () => {
//     const inputProps: OutlinedInputProps = {
//         placeholder: 'Search Coin',
//         value: '',
//         onChange: (value: any) => {
//             console.log('FilterString', value);
//             //setFilterString(value);
//         },
//     }
//     return <OutlinedInput
//         // ref={inputEle}
//         {...inputProps}
//         key={'search'}
//         // placeholder={'search'}
//         className={'search'}
//         aria-label={'search'}
//         startAdornment={<InputAdornment position="start">
//             <SearchIcon/>
//         </InputAdornment>}
//     />
// }
const Template: Story<any> = withTranslation()((props: any) => {
  const [value, setValue] = React.useState('')
  const [searchValue, setSearchValue] = React.useState('')

  const handleSearchChange = React.useCallback((value) => {
    setSearchValue(value)
  }, [])
  const handleClear = React.useCallback(() => {
    // @ts-ignore
    // addressInput?.current?.value = "";
    setSearchValue('')
  }, [])
  // const handleClear = React.useCallback(() => {
  //     // @ts-ignore
  //     // addressInput?.current?.value = "";
  //     setAddress('')
  // }, [])

  return (
    <Style>
      <h4>Select token ground btn and input value</h4>
      <Grid
        container
        spacing={2}
        alignItems={'center'}
        justifyContent={'flex-start'}
        marginBottom={2}
      >
        <Grid item xs={3}>
          <SimpleSelect {...props} />
        </Grid>
        <Grid item xs={3}>
          <TextField
            id='transferFeeType'
            select
            label={'label'}
            value={value}
            onChange={(event: React.ChangeEvent<any>) => {
              setValue(event.target?.value)
            }}
            inputProps={{ IconComponent: DropDownIcon }}
            fullWidth={true}
          >
            {[
              { belong: 'eth', fee: '0.1' },
              { belong: 'lrc', fee: '1000' },
            ].map(({ belong, fee }) => {
              return (
                <MenuItem key={belong} value={fee} withnocheckicon={'true'}>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{ display: 'inline' }}
                        component='span'
                        variant='body1'
                        color='text.primary'
                      >
                        {belong}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        sx={{ display: 'inline' }}
                        component='span'
                        variant='body1'
                        color='text.primaryLight'
                      >
                        {fee}
                      </Typography>
                    }
                  />
                </MenuItem>
              )
            })}
          </TextField>
        </Grid>
        <Grid item xs={3}>
          <BtnLanguage {...props} handleChange={(value: any) => console.log(value)} />
        </Grid>
        <Grid item xs={3}>
          <MuiFormControlLabel
            control={
              <Checkbox
                defaultChecked
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxIcon />}
                color='default'
              />
            }
            label='Label'
          />
        </Grid>

        <Grid item xs={3} marginTop={2} alignSelf={'stretch'} position={'relative'}>
          {/* <SearchWrap/> */}
          <InputSearch value={searchValue} fullWidth onChange={handleSearchChange} />
          {searchValue !== '' ? (
            <IconClearStyled
              size={'small'}
              style={{ top: '22px' }}
              aria-label='Clear'
              onClick={handleClear}
            >
              <CloseIcon />
            </IconClearStyled>
          ) : (
            ''
          )}
        </Grid>
        <Grid item xs={3} marginTop={2} alignSelf={'stretch'} position={'relative'}>
          <TextField
            value={searchValue}
            // error={addressError && addressError.error ? true : false}
            label={'input'}
            placeholder={'input'}
            onChange={() => {
              handleSearchChange(searchValue)
            }}
            // disabled={chargeFeeTokenList.length ? false : true}
            SelectProps={{ IconComponent: DropDownIcon }}
            // required={true}
            // inputRef={addressInput}
            // helperText={<Typography
            //     variant={'body2'}
            //     component={'span'}>{addressError && addressError.error ? addressError.message : ''}</Typography>}
            fullWidth={true}
          />
          {searchValue !== '' ? (
            <IconClearStyled
              size={'small'}
              style={{ top: '46px' }}
              aria-label='Clear'
              onClick={handleClear}
            >
              <CloseIcon />
            </IconClearStyled>
          ) : (
            ''
          )}
        </Grid>
        <MyDatePicker {...props} />
      </Grid>
      <h4>Select token ground btn and input value</h4>
      <Grid
        container
        spacing={2}
        alignItems={'center'}
        justifyContent={'flex-start'}
        marginBottom={2}
      >
        <InputButtonWrap />
        <InputIconWrap />
      </Grid>

      <h4>Select token menu with search</h4>
      <Grid
        container
        spacing={2}
        alignContent={'center'}
        justifyContent={'flex-start'}
        flexWrap={'wrap'}
        marginBottom={2}
      >
        <InputSelectWrap {...props} />
      </Grid>
    </Style>
  )
}) as Story<any>

// @ts-ignore
export const FormItem = Template.bind({})
FormItem.args = {}
