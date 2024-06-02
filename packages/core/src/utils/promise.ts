
export const promiseAllSequently = async (promiseFns: (() => Promise<any>)[]) => {
  let list = [] as any[]
  for (let index = 0; index < promiseFns.length; index++) {
    const fn = promiseFns[index];
    const res = await fn().catch(e => {
      throw e
    })
    list = list.concat(res)
  }
  return list
}