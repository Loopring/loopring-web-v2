const SPECIAL_TOKEN_NAME_MAP = new Map(
  [
    ['LRTAIKO', 'lrTAIKO'],
  ]
);


export const WITHDRAW_TOKEN_FILTER_LIST = ['LRTAIKO']

export const mapSpecialTokenName = (original: string) => {
  return SPECIAL_TOKEN_NAME_MAP.get(original) || original
}