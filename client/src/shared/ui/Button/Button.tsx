import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Button.module.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
}

export const Button = ({ variant = 'primary', className, children, ...props }: Props) => {
  return (
    <button 
      className={clsx(styles.button, styles[variant], className)} 
      {...props} 
    >
      {children}
    </button>
  );
};