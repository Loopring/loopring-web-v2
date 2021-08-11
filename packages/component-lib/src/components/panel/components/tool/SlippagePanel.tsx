import { TGItemJSXInterface, ToggleButtonGroup } from '../../../basic-lib';
import React from 'react';
import CurrencyInput from 'react-currency-input-field';
import { globalSetup } from '@loopring-web/common-resources';
import styled from '@emotion/styled';
import { Box } from '@material-ui/core';
import { WithTranslation } from 'react-i18next';
import { useFocusRef } from '../../../basic-lib/form/hooks';

const Styled = styled(Box)`
  & {
    height: 108px;
    width: 176px;
    padding: 24px 16px;

    .MuiToggleButtonGroup-root {
      display: flex;
      flex: 1;
      flex-wrap: wrap;
      justify-content: space-evenly;
      align-content: space-between;

    }
  }
`
const InputStyled = styled(CurrencyInput)`
  text-align: right;
  color:var(--color-text-primary);

  ::placeholder {
    color: ${({theme}) => theme.colorBase.textSecondary};
  }
;
  width: 48px; //calc(100% - 2rem);
  height: 100%; //var(--btn-Input-height);
  border: 0;
  margin: 0;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  font-size: ${({theme}) => theme.fontDefault.h6};
  display: block;
  //padding: .8rem 1rem;
  min-width: 0;
  background: none;
  box-sizing: border-box;
  animation-name: mui-auto-fill-cancel;
  letter-spacing: inherit;
  animation-duration: 10ms;
  -webkit-tap-highlight-color: transparent;

  :focus {
    outline: 0;
    border-color: transparent;
  }
}

` as typeof CurrencyInput
export const SlippagePanel = ({
                                  slippageList,
                                  slippage,
                                  wait = globalSetup.wait,
                                  handleChange,
                                  ...rest
                              }: WithTranslation & {


    slippageList: Array<number | string>,
    slippage: number | string, wait?: number,
    handleChange: (newValue: any, customValue: any) => void
}) => {
    const [cValue, setcValue] = React.useState<number | undefined>(0.3);
    const inputEle = useFocusRef({
        shouldFocusOn: false,
        value: cValue,
    });
    const handleContChange = React.useCallback((value: any, _name: any) => {
            setcValue(value);
        }
        , []);
    const toggleData = slippageList.reduce((pre, value, index) => {
        let item: TGItemJSXInterface;
        if (RegExp('slippage:').test(value.toString())) {
            value = value.toString().replace('slippage:', '');
            if (!isNaN(Number(value)) && Number(value) !== cValue) {
                setcValue(Number(value))
            }
            item = {
                value: cValue,
                JSX: <>{rest.t('labelCustomer')} : <InputStyled ref={inputEle} placeholder={'N%'} allowDecimals={true}
                                                                decimalsLimit={2}
                                                                onValueChange={handleContChange} value={cValue}
                                                                maxLength={3} suffix="%"/></>,
                tlabel: cValue + '%',
                key: cValue + '-' + index,
            }
        } else {
            item = {
                value: value,
                JSX: <>{value}%</>,
                tlabel: value + '%',
                key: value + '-' + index,
            }
        }

        pre.push(item);
        return pre;
    }, [] as TGItemJSXInterface[])
    const [value, setValue] = React.useState(slippage);
    const _handleChange = (event: React.MouseEvent<HTMLElement>, newValue: number | string) => {
        if (event.target !== inputEle.current) {
            setValue(newValue);
            if (cValue !== 0.1 && cValue !== 0.5 && cValue !== 1)
                if (handleChange) {
                    handleChange(newValue, cValue !== 0.1 && cValue !== 0.5 && cValue !== 1 ? cValue : undefined)
                }
            //TODO close
        } else {

        }

    }
    return <Styled display={'flex'}>  {
        <ToggleButtonGroup exclusive {...{...rest, tgItemJSXs: toggleData, value: value, size: 'small'}}
                           handleChange={_handleChange}/>
    }
    </Styled>
}