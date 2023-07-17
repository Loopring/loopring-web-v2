import { TGItemJSXInterface, ToggleButtonGroup } from '../../../basic-lib'
import React from 'react'
import CurrencyInput from 'react-currency-input-field'
import { globalSetup, myLog } from '@loopring-web/common-resources'
import styled from '@emotion/styled'
import { Box, FormHelperText, InputAdornment } from '@mui/material'
import { TFunction } from 'react-i18next'
import { useFocusRef } from '../../../basic-lib/form/hooks'
import { useSettings } from '../../../../stores'

const Styled = styled(Box)`
  .MuiFormHelperText-root {
    font-size: ${({ theme }) => theme.fontDefault.body2};
    color: var(--color-error);
  }
  .MuiToggleButtonGroup-root {
    .MuiToggleButtonGroup-grouped:first-of-type {
      margin-left: -1px;
    }
    display: flex;
    flex: 1;
    flex-wrap: wrap;

    justify-content: flex-start;
    align-content: space-between;
    // .MuiButtonBase-root{
    //   .MuiFormControl-root{
    //     .MuiOutlinedInput-root{
    //       border:0
    //     }
    //     margin:0  -${({ theme }) => theme.unit - 1}px
    //   }
    // }
  }
  //.MuiInputBase-sizeSmall{
  //  height: 2.4rem;
  //}

  //background: var(--color-global-bg);
`
// ${({ theme }) => theme.border.defaultFrame({ c_key: 'var(--color-box-secondary)',d_R:1/2, d_W: 1 })};

// ${({ theme }) => theme.border.defaultFrame({ c_key: 'blur', d_W: 1 })};
const suffix = '%'

const InputStyled = styled(CurrencyInput)`
  position: relative;
  color: var(--color-text-primary);

  ::placeholder {
    color: var(--color-text-secondary);
  }
  height: 2.4rem;
  width: 92px; 
  padding: .3rem .3rem .3rem .8rem;
  background: var(--color-box);
  ${({ theme }) => theme.border.defaultFrame({ d_R: 1 / 2, c_key: 'var(--color-border)' })};
  text-align: left;
  min-width: 0;
  padding-right: 2rem;

  .MuiButtonBase-root & {
  }

  :focus {
    outline: 0;
    border-color: transparent;
  }

}

` as typeof CurrencyInput
const CUSTOMER_SLIPPAGE_NAME = 'customerSlippage'
export const SlippagePanel = ({
  slippageList,
  slippage,
  wait = globalSetup.wait,
  handleChange,
  max = 100,
  alertMax = 5,
  ...rest
}: { t: TFunction } & {
  slippageList: Array<number | string>
  slippage: number | string
  wait?: number
  max?: number
  alertMax?: number
  handleChange: (newValue: any, customValue: any) => void
}) => {
  let { slippage: _slippage } = useSettings()
  const [customSlippage, setCustomSlippage] = React.useState<string | number | 'N'>(_slippage)
  const [showAlert, setShowAlert] = React.useState<boolean>(
    _slippage !== 'N' && _slippage > alertMax,
  )
  // const [cValue, setCValue] = React.useState<number | 'N'>(_slippage);
  const inputEle = useFocusRef({
    shouldFocusOn: false,
    value: _slippage,
  })
  const [value, setValue] = React.useState(slippage)
  const _handleChange = (event: React.MouseEvent<HTMLElement> | any, newValue: number | string) => {
    if (event.target !== inputEle.current && newValue !== undefined) {
      if (newValue && newValue !== 'N') {
        setValue(newValue)
        handleChange(newValue, !slippageList.includes(customSlippage) ? customSlippage : undefined)
      }
    } else if (event.target?.name === CUSTOMER_SLIPPAGE_NAME && event.type === 'change') {
      var _value = event.target?.value ?? ''
      _value = _value.replace(suffix, '')
      if (Number(_value) < max) {
        setValue(_value)
        setCustomSlippage(_value)
        if (_value >= alertMax) {
          setShowAlert(true)
        } else {
          setShowAlert(false)
        }
      } else {
        setShowAlert(true)
        setValue(max)
        setCustomSlippage(max - 1)
      }
    } else {
    }
    event.preventDefault()
  }
  const handleOnBlur = React.useCallback(() => {
    try {
      if (customSlippage !== 'N' && value !== 'N') {
        handleChange(value, !slippageList.includes(customSlippage) ? customSlippage : undefined)
      }
    } catch (e) {
      myLog('ignore handleOnBlur', e)
    }
  }, [value, customSlippage])

  const toggleData = React.useMemo(
    () =>
      slippageList.reduce((pre, value, index) => {
        let item: TGItemJSXInterface
        if (RegExp('slippage:').test(value.toString())) {
          item = {
            value: customSlippage,
            JSX: (
              <Box
                position={'relative'}
                className={'MuiInputBase-root'}
                display={'flex'}
                flexDirection={'row'}
              >
                <InputStyled
                  className={'MuiInputBase-sizeSmall MuiInputBase-root '}
                  ref={inputEle}
                  name={CUSTOMER_SLIPPAGE_NAME}
                  allowDecimals={true}
                  decimalsLimit={2}
                  decimalSeparator='.'
                  groupSeparator=','
                  placeholder={rest.t('labelCustomer')}
                  onChange={_handleChange as any}
                  onMouseOut={(_e) => {
                    handleOnBlur()
                  }}
                  onBlur={() => {
                    handleOnBlur()
                  }}
                  defaultValue={customSlippage === 'N' ? '' : customSlippage}
                  maxLength={5}
                  autoComplete={'off'}
                  // suffix={suffix}
                />
                <InputAdornment
                  style={{
                    zIndex: 99,
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    height: '100%',
                    maxHeight: 'auto',
                  }}
                  position={'end'}
                >
                  {suffix}
                </InputAdornment>
              </Box>
            ),
            notWrap: true,
            key: 'custom' + '-' + index,
          }
        } else {
          item = {
            value: value,
            JSX: <span>{value}%</span>,
            tlabel: value + '%',
            key: value + '-' + index,
          }
        }

        pre.push(item)
        return pre
      }, [] as TGItemJSXInterface[]),
    [customSlippage, _handleChange],
  )

  return (
    <Styled
      className={'MuiPaper-elevation2'}
      flexDirection={'column'}
      height={'var(--slippage-pop-height)'}
      width={'var(--slippage-pop-width)'}
      padding={2}
      display={'flex'}
    >
      <ToggleButtonGroup
        exclusive
        {...{ ...rest, tgItemJSXs: toggleData, value: value, size: 'small' }}
        onChange={_handleChange}
      />

      {showAlert && <FormHelperText>{rest.t('labelSlippageAlert')}</FormHelperText>}
    </Styled>
  )
}
