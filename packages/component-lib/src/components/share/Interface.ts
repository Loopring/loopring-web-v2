import { SOCIAL_NAME_KEYS } from '@loopring-web/common-resources';

export type SocialButtonProps = {
  /** Social Network Enum */
  socialEnum: SOCIAL_NAME_KEYS
  size?: number
  sendShareEvent: (key: SOCIAL_NAME_KEYS) => void
}

export type ShareProps = {
  social: { [key in Partial<SOCIAL_NAME_KEYS>]: SocialButtonProps }
  size: number
  loading: boolean
  imageUrl: string
  direction?: 'row' | 'column'
}
