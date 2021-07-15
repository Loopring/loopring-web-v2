import { ColorDarkDefault, ColorLightDefault } from "../css/color-lib";
import { fontDefault } from "../css/global";
import { ThemeKeys } from '../interface';


export const pxToRem = (px: any, oneRemPx = 10) => `${px / oneRemPx}rem`;
export const unit: number = 8;
export const borderFunc = (themeMode: ThemeKeys) => {
    const colorBase = themeMode === 'dark' ? ColorDarkDefault : ColorLightDefault
    const borderColor = colorBase?.border() as any;
    return {
        defaultBorder: `1px solid ${borderColor?.default}`,
        defaultRadius: `${unit / 2}px`,
        FontDefault: fontDefault,
        defaultFrame: ({
                           d_W = 1,
                           d_R = 1,
                           c_key = 'primary'
                       }: { d_W?: number, d_R?: number, c_key?: 'primary' | 'selected' | 'blur' | 'focus' | 'outline' | string }) => {
            let color;
            switch (c_key) {
                case 'primary':
                case 'selected':
                case 'blur':
                case 'focus':
                    color = borderColor[ c_key ];
                    break;
                default:
                    color = c_key;
            }
            return `
        border: ${d_W}px solid ${color};
        border-radius: ${d_R * unit}px;
       `
        },
        borderConfig: ({
                           d_W = 1,
                           c_key = 'primary'
                       }: { d_W?: number, c_key?: 'primary' | 'selected' | 'blur' | 'focus' | string }) => {
            let color;
            switch (c_key) {
                case 'primary':
                case 'selected':
                case 'focus':
                case 'blur':
                    color = borderColor[ c_key ];
                    break;
                default:
                    color = c_key;
            }
            return `${d_W}px solid ${color}`;
        }
    }
}
