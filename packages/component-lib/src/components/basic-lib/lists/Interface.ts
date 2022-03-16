import React from "react";
import {
  LinkProps,
  ListItemProps,
  MenuItemProps as muMenuItemProps,
} from "@mui/material";
import {
  CoinInfo,
  CoinKey,
  CoinMap,
  WalletCoin,
  WalletMap,
} from "@loopring-web/common-resources";
import { ListProps } from "react-virtualized";
import { List } from "immutable";

export type MuiMenuItemProps = muMenuItemProps & {
  withnocheckicon?: "true" | "false" | undefined;
};

export type BasicListItem = {
  label: {
    id: string;
    [key: string]: any;
  };
  router?: { path: string; [key: string]: any };
};

export type NotificationItem = {
  handleClick?: (event: React.MouseEvent) => void;
  startIcon: {
    className: string;
    iconItem: React.ElementType<any>;
  };
} & BasicListItem;

export type BasicHeaderItem = {
  status?: "disabled" | "hidden" | "default";
} & BasicListItem;

export type HeadMenuType<I extends BasicHeaderItem> = {
  children?: React.ElementType<any> | JSX.Element;
  className?: string;
  allowTrade?: object;
  renderList?: (props: { handleListKeyDown: ({ ...rest }) => any }) => any;
  onOpen?: boolean;
  selected?: boolean;
  setOnOpen?: () => {};
  toggle?: boolean;
  style?: any;
  layer?: number;
  anchorOrigin?: { vertical: string; horizontal: string };
} & I;
export type MenuItemLink<I extends BasicHeaderItem> = HeadMenuType<I> & {
  className?: string;
  allowTrade: any;
  handleListKeyDown?: () => any;
  layer: number;
} & LinkProps;

export type MenuItemProps<I extends BasicHeaderItem> = HeadMenuType<I> & {
  className?: string;
  handleListKeyDown?: () => any;
  layer: number;
} & muMenuItemProps;
export type SubMenuListProps<I> = {
  selected: string;
  subMenu: { [key: string]: List<I> };
};

export interface CoinItemProps<C> extends ListItemProps {
  itemKey: CoinKey<C>;
  coinInfo: CoinInfo<C>;
  walletCoin: WalletCoin<C>;
  select: CoinKey<C> | null;
  handleListItemClick: (event: React.MouseEvent, selected: CoinKey<C>) => void;
}

export type CoinMenuProps<R, I> = {
  listProps?: ListProps | any;
  selected: CoinKey<R> | null;
  nonZero: boolean;
  sorted: boolean;
  filterString: string;
  height?: string;
  allowScroll?: boolean; //boolean
  filterBy: (coinInfo: CoinInfo<R>, filterString: string) => boolean;
  coinMap: CoinMap<R, I extends CoinInfo<R> ? CoinInfo<R> : CoinInfo<R>>;
  walletMap:
    | WalletMap<R, I extends CoinInfo<R> ? WalletCoin<R> : WalletCoin<R>>
    | {};
  handleSelect?: (event: React.MouseEvent, selected: CoinKey<R>) => void;
};
