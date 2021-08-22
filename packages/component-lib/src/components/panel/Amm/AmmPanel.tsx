import { PanelContent, SwipeableViewsStyled } from '../../basic-lib';
import { AmmChgData, AmmDepositWrap, AmmWithdrawWrap } from '../components';
import { BoxProps, Grid, Tab, Tabs, Toolbar } from '@material-ui/core';
import { useLocation } from 'react-router-dom'
import qs from 'query-string'
import { AmmData, AmmInData, IBData } from '@loopring-web/common-resources';
import { WithTranslation, withTranslation } from 'react-i18next';
import { AmmPanelType, AmmProps } from './Interface';
import React, { useEffect } from 'react';
import { useDeepCompareEffect } from 'react-use';
import { Box } from '@material-ui/core/';
import { useTheme } from '@emotion/react';
import { CountDownIcon } from '../components/tool/Refresh';
import styled from '@emotion/styled';
import { boxLiner, toolBarPanel } from '../../styled';
// import { WithdrawProps } from '../Interface';

enum AmmPanelTypeMap {
    Deposit = 0,
    WithDraw = 1
}

const WrapStyle = styled(Box)<BoxProps & { _height?: number | string, _width?: number | string; }>`
  ${({ _width, _height}) => `       
      width: ${typeof _width === 'string' ? _width : typeof _width === 'number' ? _width + 'px' : `var(--swap-box-width)`};   
      height: ${typeof _height === 'string' ? _height : typeof _height === 'number' ? _height + 'px' : `var(--swap-box-height)`};`}
  ${({theme}) => boxLiner({theme})}
  ${({theme}) => toolBarPanel({theme})}
  border-radius: ${({theme}) => theme.unit}px;
  .MuiToolbar-root{
    //padding-left:0;
    justify-content: space-between;
  }
` as (props: BoxProps & { _height?: number | string, _width?: number | string }) => JSX.Element;
const TabPanelBtn = ({t, value, handleChange}: WithTranslation & any) => {
  return <Tabs
      value={value}
      onChange={handleChange}
      aria-label="disabled tabs example"
  >
      <Tab label={t('labelLiquidityDeposit')} value={0}/>
      <Tab label={t('labelLiquidityWithdraw')} value={1}/>
  </Tabs>
}
export const AmmPanel = withTranslation('common', {withRef: true})(<T extends AmmData<C extends IBData<I> ? C : IBData<I>>, I,
  ACD extends AmmInData<I>,
  C = IBData<I>>(
  {
      t,
      tabSelected = AmmPanelType.Join,
      ammDepositData,
      ammWithdrawData,
      disableDeposit,
      disableWithdraw,
      handleAmmAddChangeEvent,
      handleAmmRemoveChangeEvent,
      ammCalcData,
      tokenDepositAProps,
      tokenDepositBProps,
      tokenWithDrawAProps,
      tokenWithDrawBProps,
      ammDepositBtnStatus,
      ammWithdrawBtnStatus,
      ammDepositBtnI18nKey,
      ammWithdrawBtnI18nKey,
      onRefreshData,
      onAmmAddClick,
      onAmmRemoveClick,
      onChangeEvent,
      handleError,
      height,
      width,
      anchors,
      ...rest
  }: AmmProps<T, I, ACD, C> & WithTranslation) => {
  const [index, setIndex] = React.useState(AmmPanelTypeMap[ tabSelected ]);
  const [ammChgDepositData, setAmmChgDepositData] = React.useState<AmmChgData<T>>({
      tradeData: ammDepositData,
      type: 'coinA'
  });
  const [ammChgWithdrawData, setAmmChgWithdrawData] = React.useState<Pick<AmmChgData<T>, 'tradeData'> & { type?: 'coinA' | 'coinB' | 'percentage' }>({tradeData: ammWithdrawData});
  let routerLocation = useLocation()

  useEffect(() => {
    if (routerLocation) {
        const search = routerLocation?.search
        const customType = qs.parse(search)?.type
        setIndex(customType === 'remove' ? AmmPanelTypeMap.WithDraw : AmmPanelTypeMap.Deposit)
    }
  }, [routerLocation])
  //
  useDeepCompareEffect(() => {
      if (ammDepositData !== ammChgDepositData.tradeData) {
          setAmmChgDepositData({...ammChgDepositData, tradeData: ammDepositData});
      }
      if (ammWithdrawData !== ammChgWithdrawData.tradeData && ammChgWithdrawData.type !== 'percentage') {
          setAmmChgWithdrawData({...ammChgWithdrawData, tradeData: ammWithdrawData});
      }
  }, [ammDepositData, ammWithdrawData]);

  const _onChangeAddEvent = React.useCallback(async ({tradeData, type}: AmmChgData<T>) => {
      await handleAmmAddChangeEvent(tradeData, type)
      if (typeof onChangeEvent == 'function') {
          setAmmChgDepositData(onChangeEvent({tradeData, type} as AmmChgData<T>));
      } else {
          setAmmChgDepositData({tradeData, type})
      }
  }, [handleAmmAddChangeEvent, onChangeEvent])
  const _onChangeRemoveEvent = React.useCallback(async ({
                                                            tradeData,
                                                            type,
                                                            // percentage
                                                        }: Pick<AmmChgData<T>, 'tradeData'> & { type: 'coinA' | 'coinB' | 'percentage', percentage?: number }) => {

      await handleAmmRemoveChangeEvent(tradeData, type === 'percentage' ? 'coinA' : type)
      if (typeof onChangeEvent == 'function') {
          setAmmChgWithdrawData(onChangeEvent({tradeData, type} as AmmChgData<T>));
      } else {
          setAmmChgWithdrawData({tradeData, type});
      }

  }, [handleAmmRemoveChangeEvent, onChangeEvent]);
  // const [tab, setTab] = React.useState(0);
  const handleTabChange = React.useCallback((_event: any, newValue: any) => {
      if (index !== newValue) {
          setIndex(newValue);
      }

  }, [index]);
  const panelList: Pick<PanelContent<"ammJoin" | "ammExit">, 'key' | 'element'>[] = [
      {
          key: "ammJoin",
          element: React.useMemo(() => <AmmDepositWrap<T, I, ACD, C> key={"ammJoin"} {...{
              t,
              ...rest,
              disableDeposit,
              ammDepositBtnStatus,
              ammDepositBtnI18nKey,
              ammCalcData,
              onAmmAddClick,
              handleError,
              onChangeEvent: _onChangeAddEvent,
              ammData: ammChgDepositData.tradeData,
              tokenAProps: {...tokenDepositAProps},
              tokenBProps: {...tokenDepositBProps},
          }}/>, [rest, ammChgDepositData, tokenDepositAProps, tokenDepositBProps, disableDeposit,
              ammDepositBtnStatus,
              ammDepositBtnI18nKey,
              rest,
              ammCalcData,
              onAmmAddClick,
              handleError]),
      },
      {
          key: "ammExit",
          element: React.useMemo(() => <AmmWithdrawWrap<T, I, ACD, C> key={"ammExit"} {...{
              t,
              ...rest,
              anchors,
              disableDeposit,
              ammWithdrawBtnStatus,
              ammWithdrawBtnI18nKey,
              ammCalcData,
              onAmmRemoveClick,
              handleError,
              selectedPercentage: -1,
              onChangeEvent: _onChangeRemoveEvent,
              ammData: ammChgWithdrawData.tradeData,
              tokenAProps: {...tokenWithDrawAProps},
              tokenBProps: {...tokenWithDrawBProps},
          }}/>, [
              rest,
              tokenWithDrawAProps, tokenWithDrawBProps, anchors,
              disableDeposit,
              ammWithdrawBtnStatus,
              ammWithdrawBtnI18nKey,
              ammCalcData,
              onAmmRemoveClick,
              handleError,]),
      },
  ];
  const theme = useTheme();
  return <WrapStyle display={'flex'} className={'trade-panel container'}
                    paddingTop={'var(--toolbar-row-padding)'}
                    paddingBottom={3} flexDirection={'column'} flexWrap={'nowrap'}>
      {/*<Grid container className={''} direction={'column'}*/}
      {/*      justifyContent={"space-between"} */}
      {/*      // paddingTop={'var(--toolbar-row-padding)'}*/}
      {/*      }>*/}
          <Toolbar className={'large'} variant={'regular'}   >
              <Box alignSelf={'center'} justifyContent={'flex-start'} display={'flex'} marginLeft={-2}>
                  <TabPanelBtn {...{t, value: index, handleChange: handleTabChange, ...rest}} />
              </Box>
              <Box alignSelf={'center'}>
                  <CountDownIcon onRefreshData={onRefreshData}/>
              </Box>

          </Toolbar>
          <SwipeableViewsStyled  axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'} index={index} >
              {panelList.map((panel, index) => {
                  return <Grid item justifyContent={'space-evenly'} alignItems={'stretch'} height={'100%'}
                               key={index}>{panel.element}</Grid>
              })}
          </SwipeableViewsStyled>

  </WrapStyle>
}) as <T extends AmmData<C extends IBData<I> ? C : IBData<I>>, I,
  ACD extends AmmInData<I>,
  C = IBData<I>>(props: AmmProps<T, I, ACD, C> & React.RefAttributes<any>) => JSX.Element;


