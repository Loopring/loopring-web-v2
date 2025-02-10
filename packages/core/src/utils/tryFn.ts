export const tryFn = <T>(tryCall: () => T, catchCall?: (e: any) => T, finallyCall?: () => void) => {
  try {
    return tryCall()
  } catch (e) {
    if (catchCall) {
      return catchCall(e)
    } else {
      throw e
    }
  } finally {
    if (finallyCall) {
      finallyCall()
    }
  }
  
}