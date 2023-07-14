export const htmlDecode = (input: string) => {
  const doc = new DOMParser().parseFromString(input, 'text/html')?.documentElement?.textContent
  return doc ?? ''
}
