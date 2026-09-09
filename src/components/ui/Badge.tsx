'use client'

import { Badge as HeroBadge, BadgeProps } from '@heroui/react'
import { forwardRef } from 'react'

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, ...props }, ref) => (
    <HeroBadge ref={ref} className={className} {...props} />
  )
)

Badge.displayName = 'Badge'