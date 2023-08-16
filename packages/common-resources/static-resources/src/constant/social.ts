import * as Social from 'react-share'
import { DiscordSvg } from '../svg';
import { createElement } from 'react';
import { ExchangeIO } from './setting';
import { IPFSHTTPClient } from 'ipfs-http-client';
import { IPFS_LOOPRING_SITE } from './router';
import { myLog } from '../utils';

export enum SOCIAL_NAME_KEYS {
  Facebook = 'Facebook',
  WhatsApp = 'WhatsApp',
  Twitter = 'Twitter',
  Telegram = 'Telegram',
  Email = 'Email',
  Pinterest = 'Pinterest',
  Discord = 'Discord'
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
  [ SOCIAL_NAME_KEYS.Discord ]: {
    SocialNetworkName: SOCIAL_NAME_KEYS.Discord,
    SocialComponent: createElement(''),
    SocialIcon: DiscordSvg,
  }
}

export const SOCIAL_LIST = [
  SOCIAL_COMPONENT_MAP[ SOCIAL_NAME_KEYS.Facebook ],
  SOCIAL_COMPONENT_MAP[ SOCIAL_NAME_KEYS.Twitter ],
  SOCIAL_COMPONENT_MAP[ SOCIAL_NAME_KEYS.Email ],
]
// export const SOCIAL_WITH_TITLE = new Set([
//   SOCIAL_NAME_KEYS.Facebook,
//   // SOCIAL_NAME_KEYS.Discord,
//   SOCIAL_NAME_KEYS.Twitter,
//   SOCIAL_NAME_KEYS.Email,
//   // SOCIAL_NAME_KEYS.
//   // SOCIAL_NAME_KEYS.telegram,
//   // SOCIAL_NAME_KEYS.pinterest,
// ])


export const shareOnTwitter = async (message: string, image: string, ipfs?: IPFSHTTPClient, _url: string = ExchangeIO) => {
  let ipfsUrl = ''
  if (ipfs) {
    const {cid} = await ipfs.add(Buffer.from(image.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''), 'base64'))
    ipfsUrl = `${IPFS_LOOPRING_SITE}${cid}`;
  }
  myLog('ipfsUrl', ipfsUrl)
  const tweetText = encodeURIComponent(`${message}\n\nImage: ${ipfsUrl}`);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
  window.open(twitterUrl, '_blank');
};

export const shareOnFacebook = async (message: string, image: string, ipfs?: IPFSHTTPClient, url: string = ExchangeIO) => {
  let ipfsUrl = ''
  if (ipfs) {
    const {cid} = await ipfs.add(Buffer.from(image.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''), 'base64'))
    ipfsUrl = `${IPFS_LOOPRING_SITE}${cid}`;
  }
  myLog('ipfsUrl', ipfsUrl)
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    url
  )}&quote=${encodeURIComponent(message)}&picture=${encodeURIComponent(
    `${ipfsUrl}`
  )}`;
  window.open(facebookUrl, '_blank');
}

export const shareViaEmail = (message: string, image: string) => {
  const emailSubject = encodeURIComponent(message);
  const emailBody = encodeURIComponent(
    `${image}`
  );
  const mailtoUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;
  window.open(mailtoUrl, '_blank');
};

export const shareDownload = (name: string, url: Blob | string) => {
  const link = document.createElement('a');
  link.href = typeof url === "string" ? url : URL.createObjectURL(url);
  link.download = name;
  link.click();
  // const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
  //   window.location.href
  // )}&quote=${encodeURIComponent(message)}&picture=${encodeURIComponent(
  //   `${image}`
  // )}`;
  // window.open(facebookUrl, '_blank');
}

export const shareOnDiscord = (message: string, image: string) => {
  const discordShareUrl = `https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&scope=bot&permissions=0&response_type=code&redirect_uri=${encodeURIComponent(
    window.location.href
  )}&state=${encodeURIComponent(
    JSON.stringify({message, image: `${image}`})
  )}`;
  window.open(discordShareUrl, '_blank');
};
