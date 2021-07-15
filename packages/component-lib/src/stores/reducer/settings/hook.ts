import { useDispatch, useSelector } from 'react-redux'
import {
    setCurrency as dSetCurrency,
    setLanguage as dSetLanguage,
    setPlatform as dSetPlatform,
    setTheme as dSetTheme,
    setUpColor as dSetUpColor,
    setSlippage as dSetSlippage
} from './reducer'
import {  PlatFormType, SettingsState } from "./interface";
import {  LanguageKeys, LanguageType, ThemeKeys, ThemeType, UpColor } from 'static-resource';

// import { RootState } from 'stores'


export function useSettings(): SettingsState & {
    // settings: SettingsState,
    setPlatform(value: keyof typeof PlatFormType): void,
    setTheme(value: ThemeKeys): void,
    setUpColor(value: keyof typeof UpColor): void,
    setCurrency(value: 'USD'|'CYN'): void,
    setLanguage(value: LanguageKeys): void,
    setSlippage(value:'N'|number): void,
} {
    const settings:SettingsState = useSelector((state: any) => state.settings)
    const { themeMode,
        language,
        platform,
        currency,
        upColor,slippage} = settings;
    const dispatch = useDispatch();
    const setTheme = (value: keyof typeof ThemeType) => {
        dispatch(dSetTheme(value))
    }
    const setLanguage = (value: keyof typeof LanguageType) => {
        dispatch(dSetLanguage(value))
    }
    const setPlatform = (value: keyof typeof PlatFormType) => {
        dispatch(dSetPlatform(value))
    }
    const setCurrency = (value: 'USD'|'CYN') => {
        dispatch(dSetCurrency(value))
    }
    const setUpColor = (value: keyof typeof UpColor) => {
        dispatch(dSetUpColor(value))
    }
    const setSlippage = (value: 'N'|number) => {
        dispatch(dSetSlippage(value))
    }

    return {
        slippage,
        themeMode,
        language,
        platform,
        currency,
        upColor,
        setTheme, setLanguage, setPlatform, setCurrency, setUpColor ,setSlippage
    }

}
