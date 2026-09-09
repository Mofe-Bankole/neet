'use client'

import { Badge as HeroBadge, BadgeProps } from '@heroui/react'
import { forwardRef } from 'react'

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, color = 'default', variant = 'primary', size = 'md', ...props }, ref) => (
    <HeroBadge ref={ref} className={className} color={color} variant={variant} size={size} {...props} />
  )
)

Badge.displayName = 'Badge'