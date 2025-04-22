import { AES, enc, MD5 } from "crypto-js"

export const encryptAESMd5 = (password: string, data: string) => {
  const md5Password = MD5(password).toString()
  return AES.encrypt(data, md5Password).toString()
}

export const decryptAESMd5 = (password: string, encryptedData: string) => {
  const md5Password = MD5(password).toString()
  return AES.decrypt(encryptedData, md5Password).toString(enc.Utf8)
}