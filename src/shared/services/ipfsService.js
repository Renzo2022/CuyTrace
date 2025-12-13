import axios from 'axios'

export const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || ''

const PINATA_PIN_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS'

export async function uploadToIPFS(file) {
  if (!file) throw new Error('No file provided')
  if (!PINATA_JWT) throw new Error('VITE_PINATA_JWT is missing')

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await axios.post(PINATA_PIN_FILE_URL, formData, {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      maxBodyLength: Infinity,
    })

    const hash = res?.data?.IpfsHash
    if (!hash) throw new Error('No IpfsHash returned from Pinata')

    return `https://gateway.pinata.cloud/ipfs/${hash}`
  } catch (error) {
    const msg = error?.response?.data?.error || error?.message || 'Upload failed'
    throw new Error(msg)
  }
}
