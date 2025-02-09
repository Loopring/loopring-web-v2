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
  dustCollectorUnAvailableModalProps: DustCollectorUnAvailableModalProps
  dustCollectorModalProps: DustCollectorProps
  debtModalProps: DebtModalProps
  leverageModalProps: LeverageModalProps
  maximumCreditModalProps: MaximumCreditModalProps
  collateralDetailsModalProps: CollateralDetailsModalProps
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