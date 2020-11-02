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

export async function getAllItemsWithId() {
  const data = fetchAPI(`
    {
      items {
        id
      }
    }
  `)
  return data?.allItems
}

// TODO Stop querying all the content here, while still using SSG. Author, content and larger images formats are only needed for modals
export async function getAllItems() {
  const data = await fetchAPI(
    `
    query Items($where: JSON){
      items(where: $where) {
        id
        content {
          ... on ComponentPagesQuote {
            __typename
            author
            content
          }
          ... on ComponentPagesGallery {
            __typename
            Picture {
              image {
                formats
                url
              }
              caption
              subcaption
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
          ...{ status: 'published' }
        }
      }
    }
  )
  return data?.items
}

export async function getItem(id) {
  const data = await fetchAPI(
    `
  query ItemById($where: JSON) {
    items(where: $where) {
      id
      content {
        ... on ComponentPagesQuote {
          author
          content
          __typename
        }
        ... on ComponentPagesGallery {
          __typename
          Picture {
            image {
              formats
              url
            }
            caption
            subcaption
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

export async function getAbout() {
  const data = await fetchAPI(
    `
  query {
    about {
      content
    }
  }
  `
  )
  return {
    ...data,
    title: 'sobre',
    type: 'AboutPage'
  }
}

export async function getContaminations() {
  const data = await fetchAPI(
    `
  query {
    contamination {
      content
    }
  }
  `
  )
  return {
    ...data,
    title: 'contaminações',
    type: 'ContaminationsPage'
  }
}
