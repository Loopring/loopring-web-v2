import {
  Account,
  HeaderMenuItemInterface,
  Notify,
} from "@loopring-web/common-resources";

export interface HeaderToolBarInterface {
  buttonComponent: number;
  args?: any;
}

export interface HeaderProps<R> {
  headerToolBarData: { [key: number]: R };
  headerMenuData: HeaderMenuItemInterface[];
  notification?: Notify;
  account?: Account;
  allowTrade: {
    register: { enable: boolean; reason?: string };
    order: { enable: boolean; reason?: string };
    joinAmm: { enable: boolean; reason?: string };
    dAppTrade: { enable: boolean; reason?: string };
    raw_data: { enable: boolean; reason?: string };
  };
  isMobile: boolean;
  isWrap?: boolean;
  selected: string;
  className?: string;
  isLandPage?: boolean;
}
