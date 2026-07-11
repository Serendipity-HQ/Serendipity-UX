'use client'

import { Nav } from '@serendipity-hq/ui'
import { useApp } from '@/context/AppContext'

export default function AppNav() {
  const { isLoggedIn, user } = useApp()
  return <Nav isLoggedIn={isLoggedIn} isHost={user?.role === 'host'} />
}
