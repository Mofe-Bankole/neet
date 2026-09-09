'use client'

import { Button as HeroButton, ButtonProps } from '@heroui/react'
import { forwardRef } from 'react'

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <HeroButton
        ref={ref}
        className={className}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'