export type SocialButtonProps = {
  url: string
  /** Social Network Enum */
  socialEnum: string
  /** Message to be shared */
  message?: string
  /** Button size in pixels */
  size?: number

  imageUrl?: string
  /** Function that sends share event to analytics */
  sendShareEvent: () => void
}
export type CarouselItem = { imageUrl: string; size: [number, number], height?: number, width?: number, name?: string }

export type ShareProps = {
  /** Social Networks configuration */
  social: SocialButtonProps
  size: number
  /** share URL title */
  title: string
  /** Indcates if the component should render the Content Loader */
  loading: boolean

  imageUrl: string
  /** Function that sends share event to analytics */
  sendShareEvent: () => {}
}
