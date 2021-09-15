import React from 'react';
import { useToast } from 'hooks/common/useToast';
import { MarketType } from '@loopring-web/common-resources';


export const useLimit = <C extends { [ key: string ]: any }>(market:MarketType):{
     [key: string]: any;
    // market: MarketType|undefined;
    // marketTicker: MarketBlockProps<C> |undefined,
} =>{

    const {toastOpen, setToastOpen, closeToast} = useToast();

    return {
        // alertOpen,
        // confirmOpen,
        toastOpen,
        closeToast
        // marketTicker,
    }
}