import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
// import { COOLING_RULES } from '@/shared/constants'; 
import type { User } from '@/types';
import styles from './OnboardingFlow.module.css';
import { Step1Profile } from '../step1Profile';
import { Step2Settings } from '../step2Settings';

export const OnboardingFlow = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<Partial<User>>({
    nickname: '',
    monthlyIncome: 0,
    monthlySavings: 0,
    currentSavings: 0,
    useSavings: false,
    blacklistedCategories: [],
  });

  const updateFormData = (updates: Partial<User>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleFinish = () => {
    const finalUser = {
      ...formData,
      id: Date.now(), 
    } as User;
    
    setUser(finalUser);
    navigate('/main');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        <div className={styles.progressBar}>
          <div className={`${styles.progressStep} ${step >= 1 ? styles.active : ''}`} />
          <div className={`${styles.progressStep} ${step >= 2 ? styles.active : ''}`} />
        </div>

        {step === 1 && (
          <Step1Profile 
            formData={formData}
            onChange={updateFormData}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <Step2Settings 
            formData={formData}
            onChange={updateFormData}
            onBack={() => setStep(1)}
            onFinish={handleFinish}
          />
        )}
      </div>
    </div>
  );
};