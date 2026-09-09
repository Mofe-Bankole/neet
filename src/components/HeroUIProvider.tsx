'use client'

import { I18nProvider } from 'react-aria-components'
import { ReactNode } from 'react'

export function HeroUIProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <I18nProvider locale="en-US">
      {children}
    </I18nProvider>
  )
}