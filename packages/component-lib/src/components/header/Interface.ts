import { HeaderMenuItemInterface } from 'static-resource';

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
