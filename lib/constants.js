const baseURL = process.env.VERCEL_URL // eslint-disable-line no-undef
  ? `https://${process.env.VERCEL_URL}` // eslint-disable-line no-undef
  : 'http://localhost:3000'

export const WEBSITE_NAME = 'fluxus fungus'
export const HOME_OG_IMAGE_URL = baseURL + '/og_image.jpg'
