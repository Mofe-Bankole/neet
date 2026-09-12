'use client';

import {
  Card as HeroCard,
  CardHeader as HeroCardHeader,
  CardContent as HeroCardContent,
  CardFooter as HeroCardFooter,
  CardTitle as HeroCardTitle,
  CardDescription as HeroCardDescription,
  CardProps,
  CardHeaderProps,
  CardContentProps,
  CardFooterProps,
  CardTitleProps,
  CardDescriptionProps,
} from '@heroui/react';
import { forwardRef } from 'react';

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <HeroCard ref={ref} className={className} {...props} />
));

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => <HeroCardHeader ref={ref} className={className} {...props} />,
);

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => <HeroCardContent ref={ref} className={className} {...props} />,
);

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => <HeroCardFooter ref={ref} className={className} {...props} />,
);

export const CardTitle = forwardRef<HTMLDivElement, CardTitleProps>(
  ({ className, ...props }, ref) => <HeroCardTitle ref={ref} className={className} {...props} />,
);

export const CardDescription = forwardRef<HTMLDivElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <HeroCardDescription ref={ref} className={className} {...props} />
  ),
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';
