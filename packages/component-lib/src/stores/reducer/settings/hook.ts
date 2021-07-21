import { useDispatch, useSelector } from 'react-redux'
import { setCoinJson, setCurrency, setLanguage, setPlatform, setSlippage, setTheme, setUpColor, } from './reducer'
import { PlatFormType, SettingsState } from "./interface";
import { LanguageKeys, LanguageType, ThemeKeys, ThemeType, UpColor } from '@loopring-web/common-resources';
import React from 'react';

export function useSettings(): SettingsState & {
    setPlatform(value: keyof typeof PlatFormType): void,
    setTheme(value: ThemeKeys): void,
    setUpColor(value: keyof typeof UpColor): void,
    setCurrency(value: 'USD' | 'CYN'): void,
    setLanguage(value: LanguageKeys): void,
    setSlippage(value: 'N' | number): void,
    setCoinJson(value: any): void
} {
    const settings: SettingsState = useSelector((state: any) => state.settings)
    const dispatch = useDispatch();
    return {
        ...settings,
        setTheme: React.useCallback((value: keyof typeof ThemeType) => dispatch(setTheme(value)), [dispatch]),
        setLanguage: React.useCallback((value: keyof typeof LanguageType) => dispatch(setLanguage(value)), [dispatch]),
        setPlatform: React.useCallback((value: keyof typeof PlatFormType) => dispatch(setPlatform(value)), [dispatch]),
        setCurrency: React.useCallback((value: 'USD' | 'CYN') => dispatch(setCurrency(value)), [dispatch]),
        setUpColor: React.useCallback((value: keyof typeof UpColor) => dispatch(setUpColor(value)), [dispatch]),
        setSlippage: React.useCallback((value: 'N' | number) => dispatch(setSlippage(value)), [dispatch]),
        setCoinJson: React.useCallback((value: any) => dispatch(setCoinJson(value)), [dispatch]),
    }

}
