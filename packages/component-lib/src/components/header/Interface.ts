import { HeaderMenuItemInterface } from '@loopring-web/common-resources';

export interface HeaderToolBarInterface {
    buttonComponent: number,
    args?: any
}

export interface HeaderProps {
    headerToolBarData: HeaderToolBarInterface[],
    headerMenuData: HeaderMenuItemInterface[],
    selected: string,
    className?: string,
}
