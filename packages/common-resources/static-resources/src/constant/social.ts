import * as Social from 'react-share'

export enum SOCIAL_NAME_MAP {
  Facebook = 'Facebook',
  WhatsApp = 'WhatsApp',
  Twitter = 'Twitter',
  Telegram = 'Telegram',
  Email = 'Email',
  Pinterest = 'Pinterest',
}

export const SOCIAL_LIST = Object.values(SOCIAL_NAME_MAP)

export const SOCIAL_COMPONENT_MAP = {
  [SOCIAL_NAME_MAP.Facebook]: {
    SocialNetworkName: SOCIAL_NAME_MAP.Facebook,
    SocialComponent: Social.FacebookShareButton,
    SocialIcon: Social.FacebookIcon,
  },
  [SOCIAL_NAME_MAP.WhatsApp]: {
    SocialNetworkName: SOCIAL_NAME_MAP.WhatsApp,
    SocialComponent: Social.WhatsappShareButton,
    SocialIcon: Social.WhatsappIcon,
  },
  [SOCIAL_NAME_MAP.Twitter]: {
    SocialNetworkName: SOCIAL_NAME_MAP.Twitter,
    SocialComponent: Social.TwitterShareButton,
    SocialIcon: Social.TwitterIcon,
  },
  [SOCIAL_NAME_MAP.Telegram]: {
    SocialNetworkName: SOCIAL_NAME_MAP.Telegram,
    SocialComponent: Social.TelegramShareButton,
    SocialIcon: Social.TelegramIcon,
  },
  [SOCIAL_NAME_MAP.Email]: {
    SocialNetworkName: SOCIAL_NAME_MAP.Email,
    SocialComponent: Social.EmailShareButton,
    SocialIcon: Social.EmailIcon,
  },
  [SOCIAL_NAME_MAP.Pinterest]: {
    SocialNetworkName: SOCIAL_NAME_MAP.Pinterest,
    SocialComponent: Social.PinterestShareButton,
    SocialIcon: Social.PinterestIcon,
  },
  // [SOCIAL_NAME_MAP.D]: {
  //   SocialNetworkName: SOCIAL_NAME_MAP.Pinterest,
  //   SocialComponent: Social.Discover,
  //   SocialIcon: Social.PinterestIcon,
  // },
}

export const SOCIAL_WITH_TITLE = new Set([
  SOCIAL_NAME_MAP.Facebook,
  SOCIAL_NAME_MAP.WhatsApp,
  SOCIAL_NAME_MAP.Twitter,
  // SOCIAL_NAME_MAP.telegram,
  // SOCIAL_NAME_MAP.pinterest,
])
