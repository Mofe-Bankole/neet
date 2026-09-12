'use client';

import { Input as HeroInput, InputProps } from '@heroui/react';
import { forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <HeroInput ref={ref} className={className} {...props} />
));

Input.displayName = 'Input';
