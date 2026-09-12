'use client';

import { Button as HeroButton, ButtonProps } from '@heroui/react';
import { forwardRef } from 'react';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return <HeroButton ref={ref} className={className} variant={variant} size={size} {...props} />;
  },
);

Button.displayName = 'Button';
