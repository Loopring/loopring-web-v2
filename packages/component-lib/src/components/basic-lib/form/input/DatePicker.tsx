import { Box, experimentalStyled, IconButton, InputAdornment, TextFieldProps } from '@mui/material'
import styled from '@emotion/styled'
import {
  DatePicker as MuDatePicker,
  DatePickerProps as MuDatePickerProps,
  DateRangePicker as MuDateRangePicker,
  DateRangePickerProps as MuDateRangePickerProps,
  DateTimePicker as MuDateTimePicker,
  DateTimePickerProps as MuDateTimePickerProps,
} from '@mui/lab'

import { TFunction } from 'i18next'
import {
  CalendarIcon,
  YEAR_DAY_FORMAT,
  YEAR_DAY_MINUTE_FORMAT,
} from '@loopring-web/common-resources'
import { TextField } from './style'

export const DateTextField = styled(TextField)`
  // && .MuiOutlinedInput-root.MuiInputBase-adornedEnd {
  //
  // }

  && .date-range-adornment {
    .MuiIconButton-edgeEnd {
      height: var(--btn-icon-size);
      width: var(--btn-icon-size);
    }
  }

  //position: relative;
  //
  //&& .MuiInputBase-input {
  //  padding-right: 1rem;
  //  position: relative;
  //  padding-right: 0px;
  //  cursor: pointer;
  //  pointer-events: none;
  //}
  //
  //.MuiIconButton-label {
  //  width: 100%;
  //  display: flex;
  //  align-items: baseline;
  //  justify-content: inherit;
  //}
  //
  //.MuiIconButton-edgeEnd, .MuiInputAdornment-positionEnd {
  //  position: absolute;
  //  left: 0;
  //  right: 0;
  //  bottom: 0;
  //  top: 1px;
  //  padding: 0;
  //  height: auto;
  //  //text-indent: -.4rem;
  //  margin-left: -.4rem;
  //  //padding-right: .4rem;
  //  width: 100%;
  //  display: flex;
  //  justify-content: flex-end;
  //  align-items: center;
  //
  //  & svg {
  //    font-size: 1.8rem;
  //    color:var(--color-text-primary)
  //  }
  //
  //}
  //
  //.MuiInputAdornment-positionEnd.date-range-adornment {
  //  pointer-events: none;
  //  cursor: pointer;
  //  top: 2px;
  //  margin-left: -.8rem;
  //
  //}
`

// const DateRangeDelimiterStyled = styled(DateRangeDelimiter)`
//     margin: 0 ${({theme}) => theme.unit}px !important;
// `

export type DateRangePickerProps = {} & Omit<MuDateRangePickerProps<Date>, 'renderInput'>

export const DateRangePicker = experimentalStyled(
  ({ ...props }: DateRangePickerProps & { t: TFunction }) => {
    return (
      <MuDateRangePicker
        {...props}
        disableFuture={props.disableFuture ? props.disableFuture : true}
        calendars={props.calendars ? props.calendars : 2}
        mask={props.mask ? props.mask : '__-__-__'}
        inputFormat={props.inputFormat ? props.inputFormat : 'YY-MM-DD'}
        // endIcon={<CalendarIcon/>}
        OpenPickerButtonProps={props.OpenPickerButtonProps}
        renderInput={(startProps: any, endProps: any) => {
          startProps.InputProps = {
            ...startProps.InputProps,
            endAdornment: (
              <InputAdornment
                variant={'standard'}
                position='end'
                className={'date-range-adornment'}
              >
                <IconButton size={'large'} edge={'end'}>
                  <CalendarIcon />
                </IconButton>
              </InputAdornment>
            ),
          }
          endProps.InputProps = {
            ...endProps.InputProps,
            endAdornment: (
              <InputAdornment
                variant={'standard'}
                position='end'
                className={'date-range-adornment'}
              >
                <IconButton size={'large'} edge={'end'}>
                  <CalendarIcon />
                </IconButton>
              </InputAdornment>
            ),
          }
          return (
            <>
              <DateTextField
                ref={startProps.inputRef}
                {...{ ...startProps, helperText: null, label: undefined }}
                placeholder={'YY-MM-DD'}
              />
              <Box sx={{ mx: 2 }}> - </Box>
              {/*<DateRangeDelimiterStyled>-</DateRangeDelimiterStyled>*/}
              <DateTextField
                ref={endProps.inputRef}
                {...{ ...endProps, helperText: null, label: undefined }}
                placeholder={'YY-MM-DD'}
              />
            </>
          )
        }}
      />
    )
  },
)<DateRangePickerProps>`

` as React.ComponentType<DateRangePickerProps & { t?: TFunction }>

export type DatePickerProps = Omit<MuDatePickerProps, 'renderInput'> & {
  textFiledProps?: TextFieldProps
}
export const DatePicker = styled(
  ({ t, inputFormat, value, ...props }: DatePickerProps & { t?: TFunction }) => (
    <MuDatePicker
      {...props}
      disableFuture={props.disableFuture ? props.disableFuture : true}
      mask={props.mask ? props.mask : '__-__-__'}
      inputFormat={inputFormat ? inputFormat : YEAR_DAY_FORMAT}
      openTo={props.openTo ? props.openTo : 'day'}
      views={props.views ? props.views : ['year', 'day']}
      value={value}
      components={{ OpenPickerIcon: CalendarIcon }}
      OpenPickerButtonProps={
        props.OpenPickerButtonProps
          ? props.OpenPickerButtonProps
          : {
              size: 'large',
            }
      }
      desktopModeMediaQuery={'@media (min-width: 720px)'}
      renderInput={(_props) => {
        return (
          <DateTextField
            ref={_props.inputRef}
            {...{ ..._props, ...props?.textFiledProps, helperText: null }}
          />
        )
      }}
    />
  ),
)<DatePickerProps>`` as React.ComponentType<DatePickerProps & { t?: TFunction }>

export type DateTimePickerProps = Omit<MuDateTimePickerProps, 'renderInput'>

export const DateTimePicker = ({
  t,
  inputFormat,
  value,
  fullWidth = false,
  textFiledProps,
  ...props
}: DateTimePickerProps & {
  t?: TFunction
  fullWidth?: boolean
  textFiledProps?: Partial<TextFieldProps>
}) => (
  <MuDateTimePicker
    {...props}
    disableFuture={props.disableFuture ? props.disableFuture : false}
    mask={props.mask ? props.mask : '__-__-__'}
    inputFormat={inputFormat ? inputFormat : YEAR_DAY_MINUTE_FORMAT}
    openTo={props.openTo ? props.openTo : 'day'}
    views={props.views ? props.views : ['day', 'hours', 'minutes']}
    value={value}
    components={{
      OpenPickerIcon: CalendarIcon,
    }}
    OpenPickerButtonProps={
      props.OpenPickerButtonProps
        ? props.OpenPickerButtonProps
        : {
            size: 'large',
          }
    }
    desktopModeMediaQuery={'@media (min-width: 720px)'}
    renderInput={(_props) => {
      return (
        <DateTextField
          ref={_props.inputRef}
          fullWidth={fullWidth}
          {...{ ...textFiledProps, ..._props, helperText: null }}
        />
      )
    }}
  />
)
// (({ theme }) => ({
//     position: 'relative',
//     '& .MuiIconButton-edgeEnd': {
//         position: 'absolute',
//         left: 0,
//         right: 0,
//         padding: 0,
//         height: '100%',
//         display: 'flex',
//         justifyContent: 'center',
//         color: theme.palette.primary.light
//     }
// }))
