import {
  SOCIAL_COMPONENT_MAP,
  // SOCIAL_NAME_KEYS,
  // SOCIAL_WITH_TITLE,
} from '@loopring-web/common-resources'
import { SocialButtonProps } from '../Interface';
import { Avatar } from '@mui/material';

//
// function getExtraSocialProps({
//   message,
//   socialEnum,
// }: {
//   message: string
//   socialEnum: SOCIAL_NAME_KEYS
// }) {
//   if (!message) return {}
//
//   if (SOCIAL_WITH_TITLE.has(socialEnum)) {
//     return { title: message }
//   }
//
//   if (socialEnum === SOCIAL_NAME_KEYS.Facebook) {
//     return { quote: message }
//   }
//
//   return { body: message }
// }

export const SocialButton = ({size, socialEnum, sendShareEvent}: SocialButtonProps) => {
  const {SocialNetworkName, SocialIcon} = SOCIAL_COMPONENT_MAP[ socialEnum ]
  return (
    <Avatar
      variant={'rounded'}
      // sx={{background:}}
      className={`shareSocialButton shareSocialButton--${SocialNetworkName}`}
      onClick={() => sendShareEvent(socialEnum)}>
      <SocialIcon
        round
        size={size}
        className={`shareSocialIcon shareSocialIcon--${SocialNetworkName}`}
      />
    </Avatar>
  )
}
