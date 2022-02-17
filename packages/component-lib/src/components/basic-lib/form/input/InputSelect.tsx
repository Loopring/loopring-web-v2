import styled from "@emotion/styled";
import { Box } from "@mui/material";
import {
  CloseIcon,
  CoinInfo,
  CoinKey,
  globalSetup,
} from "@loopring-web/common-resources";
import React from "react";
import { InputSelectProps } from "./Interface";
import { useFocusRef, usePanelRef } from "../hooks";
import { WithTranslation } from "react-i18next";
import { InputSearch } from "./InputSearch";
import * as _ from "lodash";

const WrapStyled = styled(Box)`
  padding: 0;
  margin: 0;
  flex: 1;
  min-height: 100%;
  width: 100%;
  display: flex;

  .search-wrap {
    //flex-grow: 1;
    //width: 100%;
    //min-width: 100%;
    //& label{
    //  display: none;
    //}
    //
    .MuiInputBase-root {
      margin: 0;
      //width: 100%;
      max-width: inherit;
      height: var(--toolbar-row-height);

      .MuiInputBase-input {
        height: inherit;
      }
    }

` as typeof Box;

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
  _ref: React.ForwardedRef<C>
) {
  const [value, setValue] = React.useState<{
    selected: string | undefined;
    focusOnInput: boolean;
  }>({
    selected: "",
    focusOnInput: focusOnInput ? focusOnInput : false,
  });
  const debounceContentChange = React.useCallback(
    _.debounce(({ value }: any) => {
      if (handleContentChange) {
        handleContentChange(value);
      }
    }, wait),
    []
  );
  const _handleContentChange = (value: any) => {
    setValue({ ...value, selected: value });
    debounceContentChange({ value });
  };

  const inputEle = useFocusRef({
    shouldFocusOn: value.focusOnInput,
    value: value.selected,
  });
  // let height = '100%';
  // let width = '100%';
  const panelRef = usePanelRef({
    // callback:({current})=>{
    //  height = current.offsetHeight;
    //   width = current.offsetWidth;
    // }
  });

  const handleClear = React.useCallback(() => {
    // @ts-ignore
    // addressInput?.current?.value = "";
    setValue({ ...value, selected: "" });
  }, []);
  return (
    <WrapStyled
      flexDirection={"column"}
      alignItems={"stretch"}
      justifyContent={"flex-start"}
      ref={_ref}
    >
      <Box
        display={"flex"}
        flexWrap={"nowrap"}
        alignItems={"center"}
        justifyContent={"space-between"}
        paddingBottom={2}
        paddingLeft={5 / 2}
        paddingRight={5 / 2}
      >
        {/*/!*<Grid item xs={12} flex={1}>*!/*/}
        {/*<OutlinedInput*/}
        {/*    ref={inputEle}*/}
        {/*    {...inputProps}*/}
        {/*    key={'search'}*/}
        {/*    value={value.selected}*/}
        {/*    placeholder={t(selected ? selected : placeholder)}*/}
        {/*    onChange={_handleContentChange}*/}
        {/*    className={'search-wrap'}*/}
        {/*    aria-label={t(placeholder)}*/}
        {/*    startAdornment={<InputAdornment position="start">*/}
        {/*        <SearchIcon/>*/}
        {/*    </InputAdornment>}*/}
        {/*/>*/}
        <Box alignSelf={"stretch"} position={"relative"} flex={1}>
          {/* <SearchWrap/> */}
          <InputSearch
            key={"search"}
            fullWidth
            ref={inputEle}
            {...inputProps}
            aria-label={t(placeholder)}
            placeholder={t(selected ? selected : placeholder)}
            value={value?.selected}
            className={"search-wrap"}
            onChange={_handleContentChange}
          />
          {/* {value?.selected !== '' ? <IconClearStyled size={'small'}  style={{top:'6px'}} aria-label="Clear" onClick={handleClear}>
                    <CloseIcon/>
                </IconClearStyled> : ''} */}
        </Box>
        {backElement ? <Box marginLeft={2}>{backElement}</Box> : <></>}
        {/*</Grid>*/}
      </Box>
      <Box flex={1} ref={panelRef}>
        {panelRender({ selected, value: value.selected })}
      </Box>
    </WrapStyled>
  );
}

export const InputSelect = React.memo(React.forwardRef(_InputSelect)) as <
  C,
  I = CoinInfo<C>
>(
  props: InputSelectProps<C, I> &
    WithTranslation &
    React.RefAttributes<HTMLDivElement>
) => JSX.Element;
//as React.ComponentType<InputButtonProps<coinType,CoinInfo> & RefAttributes<HTMLDivElement>>;
// export const InputSelectSearch=withTranslation()(()=><></>)
