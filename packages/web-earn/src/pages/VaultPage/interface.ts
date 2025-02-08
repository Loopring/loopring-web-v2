import { ReactNode } from 'react'
import {
  CurrencyToTag,
  VaultAction,
  UpColor,
  ForexMap,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  ModalStatePlayLoad,
} from '@loopring-web/component-lib'
import { TFunction } from 'react-i18next'
import { Theme } from '@emotion/react'

export interface VaultDashBoardPanelUIProps {
  t: TFunction;
  forexMap: ForexMap;
  theme: Theme;
  isMobile: boolean;
  currency: CurrencyToTag;
  hideAssets: boolean;
  upColor: keyof typeof UpColor;
  priceTag: string;
  showMarginLevelAlert: boolean;
  vaultAccountInfo?: sdk.VaultAccountInfo;
  marginLevel: string;
  positionOpend: boolean;
  localState: any;
  setLocalState: (state: any) => void;
  colors: string[];
  assetPanelProps: any;
  marketProps: any;
  vaultTokenMap: any;
  vaultTickerMap: any;
  VaultDustCollector: any;
  dusts: any;
  totalDustsInCurrency: string;
  converting: boolean;
  convert: () => void;
  isShowVaultJoin: ModalStatePlayLoad;
  onActionBtnClick: (action: VaultAction) => void;
  onBtnClose: () => void;
  showNoVaultAccount: boolean;
  btnProps: any;
  dialogBtn: ReactNode;
  detail: any;
  setShowDetail: (detail: any) => void;
  hideLeverage: boolean;
  changeLeverage: (leverage: number) => Promise<void>;
  activeInfo: any;
  tokenFactors: any;
  maxLeverage: any;
  collateralTokens: any;
  walletMap: any;
  _vaultAccountInfo: any;
  tokenMap: any;
  tokenPrices: any;
  coinJson: any;
  idIndex: any;
  vaultIdIndex: any;
  showLeverage: any;
  closeShowLeverage: () => void;
  setShowVaultLoan: (info: any) => void;
  getValueInCurrency: (value: string) => string;
  history: any;
  collateralToken: any;
  totalDustsInUSDT: string | undefined;
  etherscanBaseUrl: string;
  network: string;
}