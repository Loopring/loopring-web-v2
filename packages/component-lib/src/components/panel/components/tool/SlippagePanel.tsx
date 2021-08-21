import { TGItemJSXInterface, ToggleButtonGroup } from '../../../basic-lib';
import React from 'react';
import CurrencyInput from 'react-currency-input-field';
import { globalSetup } from '@loopring-web/common-resources';
import styled from '@emotion/styled';
import { Box } from '@material-ui/core';
import { WithTranslation } from 'react-i18next';
import { useFocusRef } from '../../../basic-lib/form/hooks';
import { useSettings } from '../../../../stores';

const Styled = styled(Box)`
  .MuiToggleButtonGroup-root {
    .MuiToggleButtonGroup-grouped:first-of-type {
      margin-left: -1px;
    }
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    
    justify-content: flex-start;
    align-content: space-between;
  }
  //background: var(--color-global-bg);
`
// ${({ theme }) => theme.border.defaultFrame({ c_key: 'var(--color-box-secondary)',d_R:1/2, d_W: 1 })};

// ${({ theme }) => theme.border.defaultFrame({ c_key: 'blur', d_W: 1 })};

const InputStyled = styled(CurrencyInput)`
  text-align: right;
  color: var(--color-text-primary);

  ::placeholder {
    color: var(--color-text-secondary);
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
    let {slippage:_slippage} = useSettings()
    const [customSlippage, setCustomSlippage] = React.useState<string|number | 'N'>(_slippage);
    // const [cValue, setCValue] = React.useState<number | 'N'>(_slippage);
    const inputEle = useFocusRef({
        shouldFocusOn: false,
        value: _slippage,
    });
    const suffix = '%';
    const [value, setValue] = React.useState(slippage);
    const _handleChange =(event: React.MouseEvent<HTMLElement>, newValue: number | string) => {
        if (event.target !== inputEle.current && newValue!== undefined) {
            if(newValue && newValue !== 'N' ){
                setValue(newValue)
                handleChange(newValue, customSlippage !== 0.1 && customSlippage !== 0.5 && customSlippage !== 1 ? customSlippage : undefined)
            }
        } else if(event.target === inputEle.current){
            var _value = inputEle.current?.value??''
            _value = _value.replace(suffix,'')
            setCustomSlippage(_value)
        }else{
        }


    }

    const toggleData =React.useMemo(()=> slippageList.reduce((pre, value, index) => {
        let item: TGItemJSXInterface;
        if (RegExp('slippage:').test(value.toString())) {
            item = {
                value: customSlippage,
                JSX: <>{rest.t('labelCustomer')} : <InputStyled ref={inputEle} placeholder={'N%'} allowDecimals={true}
                                                                decimalsLimit={2}
                                                                // onValueChange={(value, name) => _handleChange(InputEvent,value)}
                                                                onChange={_handleChange as any}
                                                                defaultValue={customSlippage === 'N'? '':customSlippage}
                                                                // value={customSlippage === 'N'? '':customSlippage}
                                                                maxLength={3} suffix={suffix}/></>,
                tlabel:'custom Slippage',
                key: 'custom'+ '-' + index,
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
    }, [] as TGItemJSXInterface[]) ,[customSlippage,_handleChange])

    return <Styled  className={'MuiPaper-elevation2'}
        height={'var(--slippage-pop-height)'}
        width={'var(--slippage-pop-width)'} padding={2}
        display={'flex'}>  {
        <ToggleButtonGroup exclusive {...{...rest, tgItemJSXs: toggleData, value: value, size: 'small'}}
                           onChange={_handleChange}/>
    }
    </Styled>
}