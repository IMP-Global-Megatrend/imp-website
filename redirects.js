const redirects = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header',
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  const seoCanonicalRedirects = [
    {
      source: '/home',
      destination: '/',
      permanent: true,
    },
    {
      source: '/posts/page/1',
      destination: '/posts',
      permanent: true,
    },
  ]

  const redirects = [internetExplorerRedirect, ...seoCanonicalRedirects]

  return redirects
}

export default redirects
