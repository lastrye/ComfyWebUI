import CryptoJS from 'crypto-js'

export const encryptData = (data: any, secret: string) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secret).toString()
}

export const decryptData = (ciphertext: string, secret: string) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secret)
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}
