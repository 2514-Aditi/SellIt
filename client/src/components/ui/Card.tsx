import React from 'react';
import { cn } from '../../lib/utils';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('bg-white rounded-lg shadow-md p-6', className)}>{children}</div>
);

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn('mb-4', className)}>{children}</div>;

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <h3 className={cn('text-xl font-semibold', className)}>{children}</h3>;

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn('', className)}>{children}</div>;


