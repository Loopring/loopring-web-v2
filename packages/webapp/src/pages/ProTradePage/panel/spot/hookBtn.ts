import React from 'react';
import * as sdk from 'loopring-sdk';
import {  TradeBtnStatus } from '@loopring-web/component-lib';
import { AccountStatus, fnType} from '@loopring-web/common-resources';
import * as _ from 'lodash';
import { accountStaticCallBack, btnClickMap, btnLabel } from 'layouts/connectStatusCallback';
import { useAccount } from 'stores/account';

export  const useSubmitBtn = ({
                          availableTradeCheck,
                          isLoading,
                          submitCallback,
                          ...rest}:{
    [key:string]:any,
    submitCallback: (...props:any[])=>any,
    availableTradeCheck:(...props:any[])=> { tradeBtnStatus:TradeBtnStatus,label:string },
    isLoading:boolean})=>{
    // let {calcTradeParams} = usePageTradePro();
    let {account,status:accountStatus} = useAccount();

    const btnStatus = React.useMemo((): string | undefined => {
        if (isLoading) {
            return TradeBtnStatus.LOADING
        } else {
            if (account.readyState === AccountStatus.ACTIVATED) {
                const {tradeBtnStatus}  = availableTradeCheck(rest)
               return tradeBtnStatus
            } else {
                return TradeBtnStatus.AVAILABLE
            }

        }
    }, [account.readyState,availableTradeCheck,rest])

    const _btnLabelArray = Object.assign(_.cloneDeep(btnLabel), {
        [ fnType.ACTIVATED ]: [(rest:any)=> {const {label} =  availableTradeCheck(rest) 
            return label}]
    });

    const _btnLabel = React.useMemo((): string => {
      return  accountStaticCallBack(_btnLabelArray,[rest])
    }, [_btnLabelArray,rest])

    const btnClickCallbackArray = Object.assign(_.cloneDeep(btnClickMap), {
        [ fnType.ACTIVATED ]: [submitCallback]
    })
    const onBtnClick = React.useCallback((props:any) => {
        accountStaticCallBack(btnClickCallbackArray, [props])
    }, [btnClickCallbackArray])

    return {
        btnStatus,
        onBtnClick,
        btnLabel:_btnLabel,
        // btnClickCallbackArray
    }
}