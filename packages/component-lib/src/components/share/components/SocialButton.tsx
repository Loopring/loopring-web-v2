import {
  SOCIAL_COMPONENT_MAP,
  SOCIAL_NAME_MAP,
  SOCIAL_WITH_TITLE,
} from '@loopring-web/common-resources'

//
function getExtraSocialProps({
  message,
  socialEnum,
}: {
  message: string
  socialEnum: SOCIAL_NAME_MAP
}) {
  if (!message) return {}

  if (SOCIAL_WITH_TITLE.has(socialEnum)) {
    return { title: message }
  }

  if (socialEnum === SOCIAL_NAME_MAP.Facebook) {
    return { quote: message }
  }

  return { body: message }
}

export const SocialButton = ({ url, message, size, socialEnum, sendShareEvent, imageUrl }: any) => {
  const { SocialNetworkName, SocialComponent, SocialIcon } = SOCIAL_COMPONENT_MAP[socialEnum]
  const additionalProps = getExtraSocialProps({ message, socialEnum })

  /* Pinterest requires imageUrl for the "media" prop, but
   * it might not be loaded yet */

  return (
    <SocialComponent
      url={url}
      className={`shareSocialButton shareSocialButton--${SocialNetworkName}`}
      media={imageUrl}
      onClick={() => sendShareEvent(socialEnum)}
      {...additionalProps}
    >
      <SocialIcon
        round
        size={size}
        className={`shareSocialIcon shareSocialIcon--${SocialNetworkName}`}
      />
    </SocialComponent>
  )
}
