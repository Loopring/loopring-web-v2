import { createMuiTheme } from "@material-ui/core";
import { ColorDarkDefault, ColorLightDefault } from "../css/color-lib";
import { borderFunc, unit } from "./utils";
import {
    MuiButton,
    MuiButtonBase,
    MuiCard,
    MuiCheckbox,
    MuiDivider,
    MuiIconButton,
    MuiInputBase,
    MuiInputLabel,
    MuiLink,
    MuiListItem,
    MuiListItemAvatar,
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
                light: colorBase.primaryLight,
                main: colorBase.primary,
                dark: colorBase.primaryDark,
                contrastText: "#fff"
            },
            secondary: {
                light: colorBase.secondary,
                main: colorBase.secondary,
                dark: colorBase.primaryDark,
                contrastText: "#fff",
                // light:
            },
            contrastThreshold: 3,
            tonalOffset: 0.2,
            background: {
                paper: colorBase.background().bg,
                default: colorBase.background().default,
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
                hover: colorBase.textPrimary,
                selected: colorBase.textPrimary,
                // disabledBackground: "rgba(0, 0, 0, 0.12)",
                disabled: colorBase.textDisable,
                active: colorBase.textPrimaryLight,
            },
            error: {
                main: colorBase.error,
                dark: colorBase.error,
                contrastText: "#fff",
            },
        },
        typography: {
            fontFamily: `DINCondensed, Helvetica, Arial, "华文细黑", "Microsoft YaHei", "微软雅黑", SimSun, "宋体", Heiti, "黑体", sans-serif`,
            fontSize: 12,
            h1: {
                fontSize: 48,
            },
            h2: {
                fontSize: 36,
            },
            h3: {
                fontSize: 16,
            },
            h4: {
                fontSize: 20,
            },
            h5: {
                fontSize: 14,
                margin: 0,
            },
            h6: {
                fontSize: 12,
                margin: 0,
            },
            subtitle1: {
                fontSize: 24,
            },
            button: {
                fontSize: 20,
            },
            body1: {
                fontSize: 14,
                fontColor: colorBase.textPrimary,
            },
            body2: {
                fontSize: 12,
                fontColor: colorBase.textSecondary,
            },
        },
        components: {
            MuiCard: MuiCard({colorBase}),
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
            MuiIconButton: MuiIconButton,
            MuiPaginationItem: MuiPaginationItem({colorBase}),
            MuiTextField: MuiTextField(),
            MuiInputBase: MuiInputBase({colorBase}),
            MuiMenuItem: MuiMenuItem({colorBase}),
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


