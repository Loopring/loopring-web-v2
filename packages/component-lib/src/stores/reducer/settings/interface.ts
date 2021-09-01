import { LanguageKeys, ThemeKeys, UpColor } from '@loopring-web/common-resources';

export enum PlatFormType {
    mobile = 'mobile',
    desktop = 'desktop',
    tablet = 'tablet'
}

export type PlatFormKeys = keyof typeof PlatFormType

export interface SettingsState {
    themeMode: ThemeKeys
    language: LanguageKeys
    platform: PlatFormKeys
    currency: 'USD' | 'CYN'
    upColor: keyof typeof UpColor
    slippage: number | 'N'
    coinJson: any
}
