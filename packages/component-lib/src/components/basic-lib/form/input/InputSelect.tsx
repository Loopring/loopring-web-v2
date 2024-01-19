import { Box } from '@mui/material'
import { CoinInfo, CoinKey, globalSetup } from '@loopring-web/common-resources'
import React from 'react'
import { InputSelectProps } from './Interface'
import { useFocusRef, usePanelRef } from '../hooks'
import { WithTranslation } from 'react-i18next'
import { InputSearch } from './InputSearch'
import * as _ from 'lodash'

function _InputSelect<C, I extends string = CoinKey<C>>(
  {
    t,
    handleContentChange,
    wait = globalSetup.wait,
    panelRender,
    inputProps,
    placeholder,
    focusOnInput,
    backElement,
    selected,
  }: InputSelectProps<C, I> & WithTranslation,
  _ref: React.ForwardedRef<C>,
) {
  const [_value, setValue] = React.useState<{
    selected: string | undefined
    focusOnInput: boolean
  }>({
    selected: '',
    focusOnInput: focusOnInput ? focusOnInput : false,
  })
  const debounceContentChange = React.useCallback(
    _.debounce(({ value }: any) => {
      if (handleContentChange) {
        handleContentChange(value)
      }
    }, wait),
    [],
  )
  const _handleContentChange = (value: any) => {
    setValue({ ..._value, selected: value })
    debounceContentChange({ value })
  }

  const inputEle = useFocusRef({
    shouldFocusOn: _value.focusOnInput,
    value: _value.selected,
  })
  // let height = '100%';
  // let width = '100%';
  const panelRef = usePanelRef({
    // callback:({current})=>{
    //  height = current.offsetHeight;
    //   width = current.offsetWidth;
    // }
  })

  React.useEffect(() => {
    setValue({
      selected: '',
      focusOnInput: false,
    })
  }, [selected])
  return (
    <>
      <Box
        display={'flex'}
        alignItems={'center'}
        justifyContent={'space-between'}
        paddingBottom={2}
        paddingLeft={5 / 2}
        paddingRight={5 / 2}
      >
        <InputSearch
          key={'search'}
          fullWidth
          ref={inputEle}
          {...inputProps}
          aria-label={t(placeholder)}
          placeholder={t(selected ? selected : placeholder)}
          value={_value?.selected}
          className={'search-wrap'}
          onChange={_handleContentChange}
        />
        {backElement ? <Box marginLeft={2}>{backElement}</Box> : <></>}
      </Box>
      <Box flex={1} ref={panelRef}>
        {panelRender({ selected, value: _value.selected })}
      </Box>
    </>
  )
}

export const InputSelect = React.memo(React.forwardRef(_InputSelect)) as <C, I = CoinInfo<C>>(
  props: InputSelectProps<C, I> & WithTranslation & React.RefAttributes<HTMLDivElement>,
) => JSX.Element
//as React.ComponentType<InputButtonProps<coinType,CoinInfo> & RefAttributes<HTMLDivElement>>;
// export const InputSelectSearch=withTranslation()(()=><></>)
