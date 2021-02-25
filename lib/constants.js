const baseURL = process.env.VERCEL_URL // eslint-disable-line no-undef
  ? `https://${process.env.VERCEL_URL}` // eslint-disable-line no-undef
  : 'http://localhost:3000'

export const WEBSITE_NAME = 'fluxus fungus'
export const WEBSITE_DESCRIPTION_PT =
  'Nada é estático. Tudo é fluxo. Fluxus Fungus é um projeto da artista visual Tuane Eggers, desenvolvido por Augusto Bennemann — aberto a contaminações.'
export const WEBSITE_DESCRIPTION_EN =
  'Nothing is static. Everything is flow. Fluxus Fungus is a project by visual artist Tuane Eggers, developed by Augusto Bennemann - open to contaminations.'
export const HOME_OG_IMAGE_URL = baseURL + '/og_image.jpg'
