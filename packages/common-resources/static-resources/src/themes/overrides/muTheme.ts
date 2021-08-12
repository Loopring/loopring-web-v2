import { createMuiTheme } from "@material-ui/core";
import { ColorDarkDefault, ColorLightDefault } from "../css/color-lib";
import { borderFunc, unit } from "./utils";
import {
    MuiButton,
    MuiButtonBase,
    MuiCard,
    MuiCardContent,
    MuiCardActions,
    MuiCheckbox,
    MuiDivider, MuiIconButton,
    MuiInputBase,
    MuiInputLabel,
    MuiLink,
    MuiList,
    MuiListItem,
    MuiListItemAvatar,
    MuiMenu,
    MuiMenuItem,
    MuiModal,
    MuiPaginationItem,
    MuiPaper,
    MuiPopover,
    MuiRadio,
    MuiSvgIcon,
    MuiSwitch,
    MuiTab,
    MuiTabs,
    MuiTextField,
    MuiToggleButton,
    MuiToolbar,
    radius,
} from "./overrides-mui";
import { MuPickDate } from './overrides-date-pick';
import { fontDefault } from "../css/global";
import { LoopringTheme, ThemeKeys } from '../interface';

export { unit };
export const getTheme = (themeMode: ThemeKeys): LoopringTheme => {
    const colorBase: typeof ColorDarkDefault = themeMode === 'dark' ? ColorDarkDefault : ColorLightDefault
    const theme = createMuiTheme({
        spacing: unit,
        palette: {
            mode: themeMode,
            primary: {
                light: colorBase.primary,
                main: colorBase.primary,
                dark: colorBase.primary,
                contrastText: themeMode === 'dark'?"#fff":'#000',
            },
            secondary: {
                light: colorBase.secondary,
                main: colorBase.secondary,
                dark: colorBase.secondary,
                contrastText: themeMode === 'dark'?"#fff":'#000',
                // light:
            },
            contrastThreshold: 3,
            tonalOffset: 0.2,
            background: {
                paper: colorBase.box,
                default: colorBase.globalBg,
            },
            text: {
                primary: colorBase.textPrimary,
                secondary: colorBase.textSecondary,
                disabled: colorBase.textDisable,
                //hint: colorBase.textHint,
            },
            // divider: "rgba(0, 0, 0, 0.12)",
            common: {"black": "#000", "white": "#fff"},
            action: {
                hoverOpacity: 0.05,
                hover: colorBase.secondaryHover,
                selected: colorBase.secondaryPressed,
                // disabledBackground: "rgba(0, 0, 0, 0.12)",
                disabled: colorBase.textDisable,
                active: colorBase.secondaryPressed,
            },
            warning:{
                main: colorBase.warning,
            },
            error: {
                main: colorBase.error,
                dark: colorBase.error,
                contrastText: themeMode === 'dark'?"#fff":'#000',
            },
        },
        typography: {
            fontFamily: `DINCondensed, Helvetica, Arial, "华文细黑", "Microsoft YaHei", "微软雅黑", SimSun, "宋体", Heiti, "黑体", sans-serif`,
            fontSize: 14,
            h1: {
                fontSize: fontDefault.h1,
                lineHeight: '4.6rem'
            },
            h2: {
                fontSize: fontDefault.h2,
                lineHeight: '3.8rem'
            },
            h3: {
                fontSize: fontDefault.h3,
                lineHeight: '3.2rem'
            },
            h4: {
                fontSize: fontDefault.h4,
                lineHeight: '2.8rem',
            },
            h5: {
                fontSize: fontDefault.h5,
                lineHeight: '2.4rem',
                margin:0
            },
            h6: {
                fontSize: fontDefault.h6,
                margin: 0,
            },
            subtitle1: {
                fontSize: 24,
            },
            button: {
                fontSize: 20,
            },
            body1: {
                fontSize: fontDefault.body1,
                fontColor: colorBase.textPrimary,
            },
            body2: {
                fontSize: 12,
                fontColor: colorBase.textSecondary,
            },
        },
        components: {
            MuiCard: MuiCard({colorBase}),
            MuiCardContent: MuiCardContent(),
            MuiCardActions: MuiCardActions(),
            MuiCheckbox: MuiCheckbox({colorBase}),
            MuiLink: MuiLink({colorBase}),
            MuiModal: MuiModal({colorBase}),
            // MuiBackdrop:MuiBackdrop({colorBase}),
            MuiPopover: MuiPopover({colorBase}),
            MuiToolbar: MuiToolbar(),
            MuiSvgIcon: MuiSvgIcon(),
            MuiTabs: MuiTabs(),
            MuiTab: MuiTab({colorBase}),
            MuiButtonBase: MuiButtonBase,
            MuiRadio: MuiRadio({colorBase}),
            MuiButton: MuiButton({colorBase, themeMode}),
            MuiToggleButton: MuiToggleButton({colorBase}),
            MuiSwitch: MuiSwitch({colorBase}),
            MuiIconButton: MuiIconButton({colorBase}),
            MuiPaginationItem: MuiPaginationItem({colorBase}),
            MuiTextField: MuiTextField(),
            MuiInputBase: MuiInputBase({colorBase,themeMode}),
            MuiMenu: MuiMenu({colorBase}),
            MuiMenuItem: MuiMenuItem({colorBase,themeMode}),
            MuiList: MuiList(),
            MuiListItem: MuiListItem({colorBase}),
            MuiListItemAvatar: MuiListItemAvatar(),
            MuiInputLabel: MuiInputLabel({colorBase}),
            // MuiPopover: MuiPopover({colorBase, themeMode}),
            MuiPaper: MuiPaper({colorBase, themeMode}),
            MuiDivider: MuiDivider({colorBase}),
            ...MuPickDate({colorBase, themeMode})
        },
        shape: {borderRadius: radius}
    });
    return {
        ...theme, ...{
            unit,
            mode: themeMode,
            border: borderFunc(themeMode), fontDefault,
            colorBase: themeMode === 'dark' ? ColorDarkDefault : ColorLightDefault
        }
    }
}


