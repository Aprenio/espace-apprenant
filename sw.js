// Espace apprenant : notifications de l'appli installée (convocations et rappels des oraux, envoyés par la fonction
// serveur « rappels »). Rien n'est mis en cache ici : l'appli se charge toujours depuis le site.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('push', (e) => {
  let d = {}
  try {
    d = e.data ? e.data.json() : {}
  } catch {
    d = { corps: e.data ? e.data.text() : '' }
  }
  e.waitUntil(
    self.registration.showNotification(d.titre || 'Espace apprenant', {
      body: d.corps || '',
      icon: '/icone-192.png',
      badge: '/icone-192.png',
      tag: d.tag || undefined,
      lang: 'fr',
      data: { url: d.url || '/' },
    }),
  )
})

// un toucher sur la notification ouvre l'appli (ou la remet devant) ; une adresse avec une demande (…/?caisse : la
// caisse à outils à signer) est ouverte même si l'appli l'est déjà
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const adresse = new URL((e.notification.data && e.notification.data.url) || '/', self.location.origin).href
  const demande = new URL(adresse).search !== ''
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((fenetres) => {
      const ouverte = fenetres.find((f) => f.url.startsWith(self.location.origin))
      if (!ouverte) return self.clients.openWindow(adresse)
      if (demande && typeof ouverte.navigate === 'function')
        return ouverte
          .navigate(adresse)
          .then((f) => (f || ouverte).focus())
          .catch(() => ouverte.focus())
      return ouverte.focus()
    }),
  )
})
