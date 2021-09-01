import { experimentalStyled, InputAdornment, TextField, } from "@material-ui/core";
import styled from "@emotion/styled";
import {
    DatePicker as MuDatePicker,
    DatePickerProps as MuDatePickerProps,
    DateRangeDelimiter,
    DateRangePicker as MuDateRangePicker,
    DateRangePickerProps as MuDateRangePickerProps
} from '@material-ui/pickers';

import { TFunction } from 'i18next';
import { CalendarIcon } from '@loopring-web/common-resources';

const DateTextField = styled(TextField)`
  position: relative;

  && .MuiInputBase-input {
    padding-right: 1rem;
    position: relative;
    padding-right: 0px;
    cursor: pointer;
    pointer-events: none;
  }

  .MuiIconButton-label {
    width: 100%;
    display: flex;
    align-items: baseline;
    justify-content: inherit;
  }

  .MuiIconButton-edgeEnd, .MuiInputAdornment-positionEnd {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 1px;
    padding: 0;
    height: auto;
    //text-indent: -.4rem;
    margin-left: -.4rem;
    //padding-right: .4rem;
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    & svg {
      font-size: 1.8rem;
      color:var(--color-text-primary)
    }

  }

  .MuiInputAdornment-positionEnd.date-range-adornment {
    pointer-events: none;
    cursor: pointer;
    top: 2px;
    margin-left: -.8rem;

  }

`;

const DateRangeDelimiterStyled = styled(DateRangeDelimiter)`
    margin: 0 ${({theme}) => theme.unit}px !important;
`

export type DateRangePickerProps = {} & Omit<MuDateRangePickerProps, 'renderInput'>;

export const DateRangePicker = experimentalStyled(({...props}: DateRangePickerProps & { t: TFunction }) => {

    return <MuDateRangePicker
        {...props}
        calendars={props.calendars ? props.calendars : 2}
        mask={props.mask ? props.mask : "__-__-__"}
        inputFormat={props.inputFormat ? props.inputFormat : 'YY-MM-DD'}
        openPickerIcon={<CalendarIcon/>}
        OpenPickerButtonProps={props.OpenPickerButtonProps}
        renderInput={(startProps, endProps) => {
            startProps.InputProps = {
                ...startProps.InputProps, endAdornment: (
                    <InputAdornment position="end" component={'button'} className={'date-range-adornment'}>
                        <span className={'MuiIconButton-label'}>
                            <CalendarIcon/>
                        </span>
                    </InputAdornment>
                )
            }
            endProps.InputProps = {
                ...endProps.InputProps, readOnly: true, endAdornment: (
                    <InputAdornment position="end" component={'button'} className={'date-range-adornment'}>
                        <span className={'MuiIconButton-label'}>
                            <CalendarIcon/>
                        </span>
                    </InputAdornment>
                )
            }
            return (<>
                <DateTextField {...{...startProps, helperText: null, label: undefined}} placeholder={'YY-MM-DD'}/>
                <DateRangeDelimiterStyled>-</DateRangeDelimiterStyled>
                <DateTextField {...{...endProps, helperText: null, label: undefined}} placeholder={'YY-MM-DD'}/>
            </>)
        }
        }
    />
})<DateRangePickerProps>`

` as React.ComponentType<DateRangePickerProps & { t?: TFunction }>

export type DatePickerProps = {} & Omit<MuDatePickerProps, 'renderInput'>;
export const DatePicker = styled(({
                                      t,
                                      inputFormat,
                                      value,
                                      ...props
                                  }: DatePickerProps & { t?: TFunction }) => <MuDatePicker

    disableFuture={props.disableFuture ? props.disableFuture : true}
    mask={props.mask ? props.mask : "__-__-__"}
    inputFormat={inputFormat ? inputFormat : 'YY-MM-DD'}
    openTo={props.openTo ? props.openTo : 'date'}
    views={props.views ? props.views : ["year", "date"]}
    value={value}
    openPickerIcon={<CalendarIcon/>}
    renderInput={(props) => {
        props.InputProps = {...props.InputProps}
        return (<DateTextField {...{...props, helperText: null}}  />)
    }}
    {...props} />
)<DatePickerProps>`

` as React.ComponentType<DatePickerProps & { t?: TFunction }>
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
