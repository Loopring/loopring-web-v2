import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PlatFormType, SettingsState } from "./interface";
import { Currency, i18n, LanguageKeys, ThemeKeys, ThemeType, UpColor } from 'static-resource';
import moment from 'moment';
// import { localStore } from '../../../static-resource/src/storage';

const initialState: SettingsState = {
    themeMode: ThemeType.dark, //localStore.getItem('ThemeType')?localStore.getItem('ThemeType') as ThemeKeys :ThemeType.dark,
    language: i18n.language as LanguageKeys, //localStore.getItem('LanguageKey')?localStore.getItem('LanguageKey') as LanguageKeys: i18n.language as LanguageKeys,
    platform: PlatFormType.desktop,
    currency: Currency.dollar,//localStore.getItem('Currency')?localStore.getItem('Currency') as keyof typeof Currency: Currency.dollar,
    upColor: UpColor.green,//localStore.getItem('UpColor')?localStore.getItem('UpColor') as keyof typeof UpColor: UpColor.green,
    slippage: 'N',
}

export const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setTheme(state, action: PayloadAction<ThemeKeys>) {
            // localStore.setItem('ThemeType',action.payload)
            state.themeMode = action.payload
        },
        setLanguage(state, action: PayloadAction<LanguageKeys>) {
            i18n.changeLanguage(action.payload);
            if (action.payload) {
                action.payload === 'en_US' ? moment.locale('en') : moment.locale(action.payload.toLocaleLowerCase());
                state.language = action.payload
            }
        },
        setPlatform(state, action: PayloadAction<keyof typeof PlatFormType>) {
            state.platform = action.payload
        },
        setCurrency(state, action: PayloadAction<'USD' | 'CYN'>) {
            // localStore.setItem('Currency',action.payload)
            state.currency = action.payload
        },
        setUpColor(state, action: PayloadAction<keyof typeof UpColor>) {
            // localStore.setItem('UpColor',action.payload)
            state.upColor = action.payload
        },
        setSlippage(state, action: PayloadAction<'N' | number>) {
            // localStore.setItem('UpColor',action.payload)
            state.slippage = action.payload
        },
    },
})
export const {setTheme, setLanguage, setPlatform, setCurrency, setUpColor, setSlippage} = settingsSlice.actions
// export const { setTheme,setPlatform,setLanguage } = settingsSlice.actions