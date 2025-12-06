import { type InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, className, ...props }: InputProps) => {
  return (
    <div className={styles.container}>
      {label && <span className={styles.label}>{label}</span>}
      <input 
        className={`${styles.field} ${className || ''}`}
        {...props} 
      />
    </div>
  );
};