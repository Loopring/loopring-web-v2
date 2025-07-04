const CLOSURE_ANNOUNCEMENT_KEY = 'loopring_closure_announcement_dismissed'

export const isClosureAnnouncementDismissed = (): boolean => {
  try {
    return localStorage.getItem(CLOSURE_ANNOUNCEMENT_KEY) === 'true'
  } catch (error) {
    return false
  }
}

export const setClosureAnnouncementDismissed = (): void => {
  try {
    localStorage.setItem(CLOSURE_ANNOUNCEMENT_KEY, 'true')
  } catch (error) {
    console.warn('Failed to save closure announcement state:', error)
  }
}