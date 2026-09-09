'use client'

import { Avatar as HeroAvatar, AvatarProps } from '@heroui/react'
import { forwardRef } from 'react'

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, ...props }, ref) => (
    <HeroAvatar ref={ref} className={className} {...props} />
  )
)

Avatar.displayName = 'Avatar'