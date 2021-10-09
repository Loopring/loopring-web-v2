import { HeaderMenuItemInterface } from '@loopring-web/common-resources';

export interface HeaderToolBarInterface {
    buttonComponent: number,
    args?: any
}

export interface HeaderProps {
    headerToolBarData: HeaderToolBarInterface[],
    headerMenuData: HeaderMenuItemInterface[],
    allowTrade:{
        register: { enable:boolean,reason?:string },
        order:  { enable:boolean,reason?:string },
        joinAmm:  { enable:boolean,reason?:string },
        dAppTrade:  { enable:boolean,reason?:string },
        raw_data:  { enable:boolean,reason?:string },
    }
    isWrap?: boolean,
    selected: string,
    className?: string,
}
