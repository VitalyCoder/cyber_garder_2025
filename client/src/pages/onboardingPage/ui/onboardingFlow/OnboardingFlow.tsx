import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import type { User } from '@/types'; 
import styles from './OnboardingFlow.module.css';
import { Step1Profile } from '../step1Profile';
import { Step2Settings } from '../step2Settings';

export const OnboardingFlow = () => {
  const navigate = useNavigate();

  const register = useUserStore((state) => state.register);
  const isLoading = useUserStore((state) => state.isLoading);

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

  const handleFinish = async () => {
    if (!formData.nickname || !formData.monthlyIncome) {
        alert("Пожалуйста, заполните обязательные поля");
        return;
    }

    try {
        await register({
            nickname: formData.nickname,
            monthlyIncome: formData.monthlyIncome,
            monthlySavings: formData.monthlySavings || 0,
            currentSavings: formData.currentSavings || 0,
            useSavingsCalculation: formData.useSavings || false,
            blacklistedCategories: formData.blacklistedCategories || [] 
        });

        navigate('/dashboard');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        alert("Не удалось создать профиль. Возможно, такой никнейм уже занят.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        <div className={styles.progressBar}>
          <div className={`${styles.progressStep} ${step >= 1 ? styles.active : ''}`} />
          <div className={`${styles.progressStep} ${step >= 2 ? styles.active : ''}`} />
        </div>

        {isLoading && (
            <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center rounded-3xl">
                <div className="animate-spin text-4xl">⏳</div>
            </div>
        )}

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