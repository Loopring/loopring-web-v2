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
import { VaultPositionsTableProps } from '@loopring-web/component-lib/src/components/tableList/assetsTable/VaultPositionsTable'

export interface VaultDashBoardPanelUIProps {
  t: TFunction;
  forexMap: ForexMap;
  theme: Theme;
  currency: CurrencyToTag;
  hideAssets: boolean;
  upColor: keyof typeof UpColor;
  showMarginLevelAlert: boolean;
  vaultAccountInfo?: sdk.VaultAccountInfo;
  localState: any;
  setLocalState: (state: any) => void;
  colors: string[];
  assetPanelProps: any;
  marketProps: any;
  vaultTokenMap: any;
  vaultTickerMap: any;
  VaultDustCollector: any;
  isShowVaultJoin: ModalStatePlayLoad;
  detail: any;
  setShowDetail: (detail: any) => void;
  hideLeverage: boolean;
  activeInfo: any;
  walletMap: any;
  _vaultAccountInfo: any;
  tokenPrices: any;
  getValueInCurrency: (value: string) => string;
  history: any;
  etherscanBaseUrl: string;
  onClickCollateralManagement: () => void;
  onClickCloseOut: () => void;
  onClickPortalTrade: () => void;
  liquidationThreshold: string;
  liquidationPenalty: string;
  assetsTab: 'assetsView' | 'positionsView';
  onChangeAssetsTab: (tab: 'assetsView' | 'positionsView') => void;
  onClickRecord: () => void;
  vaultPositionsTableProps: VaultPositionsTableProps;
  onClickHideShowAssets: () => void;
  accountActive: boolean
  totalEquity: string
}

export interface CollateralDetailsModalProps {
  open: boolean;
  onClose: () => void;
  onClickMaxCredit: () => void;
  collateralTokens: {
    name: string;
    logo: string;
    amount: string;
    valueInCurrency: string;
  }[];
  totalCollateral: string;
  maxCredit: string;
  coinJSON: any;
}

export interface MaximumCreditModalProps {
  open: boolean;
  onClose: () => void;
  onClickBack: () => void;
  collateralFactors: {
    name: string;
    collateralFactor: string;
  }[];
  maxLeverage: string;
}

export interface LeverageModalProps {
  open: boolean;
  maxLeverage: number;
  onClose: () => void;
  onClickMaxCredit: () => void;
  onClickReduce: () => void;
  onClickAdd: () => void;
  onClickLeverage: (leverage: number) => void;
  currentLeverage: number | undefined;
  borrowAvailable: string;
  borrowed: string;
  maximumCredit: string;
  isLoading: boolean;
}

export interface DebtModalProps {
  open: boolean
  onClose: () => void
  totalFundingFee: string
  totalBorrowed: string
  totalDebt: string
  borrowedVaultTokens:
    | {
        symbol: string
        coinJSON: any
        amount: string
        valueInCurrency: string
        onClick: () => void
      }[]
    | undefined
}

export interface DustCollectorUnAvailableModalProps {
  open: boolean
  onClose: () => void
}

export interface DustCollectorProps {
  open: boolean
  converting: boolean
  onClose: () => void
  dusts?: {
      symbol: string;
      amount: string;
      valueInCurrency: string;
      checked: boolean;
      coinJSON: any;
      onCheck: () => void;
    }[]
  totalValueInUSDT: string
  totalValueInCurrency: string
  onClickConvert: () => void
  onClickRecords: () => void
  convertBtnDisabled: boolean
}