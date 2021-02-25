async function fetchAPI(query, { variables } = {}) {
  // eslint-disable-next-line no-undef
  const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query,
      variables
    })
  })

  const json = await res.json()
  if (json.errors) {
    console.error(json.errors)
    throw new Error('Failed to fetch API')
  }

  return json.data
}

export async function getAllItemsWithId(lang) {
  const langFilter = lang !== 'pt' ? 'lang_' + lang : 'lang_pt_br'
  const data = fetchAPI(
    `
    query Items($where: JSON){
      items(where: $where) {
        id
      }
    }
  `,
    {
      variables: {
        where: {
          ...{ [langFilter]: true }
        }
      }
    }
  )
  return data?.allItems
}

// TODO Stop querying all the content here, while still using SSG. Author, content and larger images formats are only needed for modals
export async function getAllItems(lang) {
  const langSuffix = lang !== 'pt' ? '_' + lang : ''
  const langFilter = lang !== 'pt' ? 'lang_' + lang : 'lang_pt_br'
  const langKeys = {
    author: 'author' + langSuffix,
    content: 'content' + langSuffix,
    caption: 'caption' + langSuffix,
    subcaption: 'subcaption' + langSuffix
  }
  const data = await fetchAPI(
    `
    query Items($where: JSON){
      items(where: $where) {
        id
        content {
          ... on ComponentPagesQuote {
            __typename
            author: ` +
      langKeys['author'] +
      `
            content: ` +
      langKeys['content'] +
      `
          }
          ... on ComponentPagesGallery {
            __typename
            Picture {
              image {
                formats
                url
              }
              caption: ` +
      langKeys['caption'] +
      `
              subcaption: ` +
      langKeys['subcaption'] +
      `
            }
          }
          ... on ComponentPagesVideo {
            URL
            __typename
          }
        }
        status
      }
    }
  `,
    {
      variables: {
        where: {
          ...{
            status: 'published',
            [langFilter]: true
          }
        }
      }
    }
  )
  return data?.items
}

export async function getItem(id, lang) {
  const langSuffix = lang !== 'pt' ? '_' + lang : ''
  const langKeys = {
    author: 'author' + langSuffix,
    content: 'content' + langSuffix,
    caption: 'caption' + langSuffix,
    subcaption: 'subcaption' + langSuffix
  }
  const data = await fetchAPI(
    `
  query ItemById($where: JSON) {
    items(where: $where) {
      id
      content {
        ... on ComponentPagesQuote {
          author: ` +
      langKeys['author'] +
      `
          content: ` +
      langKeys['content'] +
      `
          __typename
        }
        ... on ComponentPagesGallery {
          __typename
          Picture {
            image {
              formats
              url
            }
            caption: ` +
      langKeys['caption'] +
      `
            subcaption: ` +
      langKeys['subcaption'] +
      `
          }
        }
        ... on ComponentPagesVideo {
          URL
          __typename
        }
      }
      status
    }
  }
  `,
    {
      variables: {
        where: {
          id,
          ...{ status: 'published' }
        }
      }
    }
  )
  return data
}

export async function getAbout(lang) {
  const langSuffix = lang !== 'pt' ? '_' + lang : ''
  const langKeys = {
    content: 'content' + langSuffix,
  }
  const pageTitle = lang === 'pt' ? 'sobre' : 'about';
  const data = await fetchAPI(
    `
  query {
    about {
      content: ` + langKeys['content'] + `
    }
  }
  `
  )
  return {
    ...data,
    title: pageTitle,
    type: 'AboutPage'
  }
}

export async function getContaminations(lang) {
  const langSuffix = lang !== 'pt' ? '_' + lang : ''
  const langKeys = {
    content: 'content' + langSuffix,
  }
  const pageTitle = lang === 'pt' ? 'contaminações' : 'contaminations';
  const data = await fetchAPI(
    `
  query {
    contamination {
      content: ` + langKeys['content'] + `
    }
  }
  `
  )
  return {
    ...data,
    title: pageTitle,
    type: 'ContaminationsPage'
  }
}
