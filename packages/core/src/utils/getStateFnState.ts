
export const getStateFnState = <T>(setStateFn: React.Dispatch<React.SetStateAction<T>>) => {
  return new Promise<T>(res => {
    return setStateFn(state => {
      res(state)
      return state
    })
  })
}