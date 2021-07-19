/**
 *
 * @param value
 * @param minFractionDigits default = 6
 * @returns
 */
export const getThousandFormattedNumbers = (value: undefined | number, minFractionDigits: number = 6, option?: { isAbbreviate: boolean }) => {
    if (!Number.isFinite(value)) return value
    let result = value !== undefined ? value.toLocaleString('en', {
        minimumFractionDigits: minFractionDigits
    }).replace(/(\.\d+?)0*$/, '$1') : undefined
    return value == undefined ? undefined : option && option.isAbbreviate ? abbreviateNumber(value) : result;


}

export function abbreviateNumber(value: number) {
    let newValue = value, result: string = '';
    const suffixes = ["", "K", "M", "B", "T"];
    let suffixNum = 0;
    while (newValue >= 1000) {
        newValue /= 1000;
        suffixNum++;
    }

    result = newValue.toPrecision(3);

    result += suffixes[ suffixNum ];
    return result;
}

export const getFormattedHash = (hash?: string) => {
    if (!hash) return hash
    const firstSix = hash.slice(0, 6)
    const lastFour = hash.slice(hash.length - 4)
    return `${firstSix}****${lastFour}`
}
