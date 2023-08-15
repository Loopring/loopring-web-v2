import * as Social from 'react-share'

export enum SOCIAL_NAME_KEYS {
  Facebook = 'Facebook',
  WhatsApp = 'WhatsApp',
  Twitter = 'Twitter',
  Telegram = 'Telegram',
  Email = 'Email',
  Pinterest = 'Pinterest',
}


// Object.values(SOCIAL_NAME_KEYS)

export const SOCIAL_COMPONENT_MAP = {
  [ SOCIAL_NAME_KEYS.Facebook ]: {
    SocialNetworkName: SOCIAL_NAME_KEYS.Facebook,
    SocialComponent: Social.FacebookShareButton,
    SocialIcon: Social.FacebookIcon,
  },
  [ SOCIAL_NAME_KEYS.WhatsApp ]: {
    SocialNetworkName: SOCIAL_NAME_KEYS.WhatsApp,
    SocialComponent: Social.WhatsappShareButton,
    SocialIcon: Social.WhatsappIcon,
  },
  [ SOCIAL_NAME_KEYS.Twitter ]: {
    SocialNetworkName: SOCIAL_NAME_KEYS.Twitter,
    SocialComponent: Social.TwitterShareButton,
    SocialIcon: Social.TwitterIcon,
  },
  [ SOCIAL_NAME_KEYS.Telegram ]: {
    SocialNetworkName: SOCIAL_NAME_KEYS.Telegram,
    SocialComponent: Social.TelegramShareButton,
    SocialIcon: Social.TelegramIcon,
  },
  [ SOCIAL_NAME_KEYS.Email ]: {
    SocialNetworkName: SOCIAL_NAME_KEYS.Email,
    SocialComponent: Social.EmailShareButton,
    SocialIcon: Social.EmailIcon,
  },
  [ SOCIAL_NAME_KEYS.Pinterest ]: {
    SocialNetworkName: SOCIAL_NAME_KEYS.Pinterest,
    SocialComponent: Social.PinterestShareButton,
    SocialIcon: Social.PinterestIcon,
  },
  // [SOCIAL_NAME_KEYS.D]: {
  //   SocialNetworkName: SOCIAL_NAME_KEYS.Pinterest,
  //   SocialComponent: Social.Discover,
  //   SocialIcon: Social.PinterestIcon,
  // },
}

export const SOCIAL_LIST = [
  SOCIAL_COMPONENT_MAP[ SOCIAL_NAME_KEYS.Facebook ],
  SOCIAL_COMPONENT_MAP[ SOCIAL_NAME_KEYS.Twitter ],
  SOCIAL_COMPONENT_MAP[ SOCIAL_NAME_KEYS.Facebook ],
]
export const SOCIAL_WITH_TITLE = new Set([
  SOCIAL_NAME_KEYS.Facebook,
  SOCIAL_NAME_KEYS.WhatsApp,
  SOCIAL_NAME_KEYS.Twitter,
  // SOCIAL_NAME_KEYS.telegram,
  // SOCIAL_NAME_KEYS.pinterest,
])
