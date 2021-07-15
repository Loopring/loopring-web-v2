export enum HeaderMenuTabStatus {
    hidden = 'hidden',
    disabled = 'disabled',
    default = 'default'
}

export interface HeaderMenuItemInterface {
    label: {
        icon?: any,
        id: string,
        style?: any,
        description?: string,
        i18nKey: string
    },
    child?: Array<HeaderMenuItemInterface>,
    router?: { path: string, [ key: string ]: any },
    status?: keyof typeof HeaderMenuTabStatus
    extender?: React.ElementType<any> | JSX.Element | undefined,
}


