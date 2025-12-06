import styles from './OnboardingPage.module.css';
import { OnboardingFlow } from './ui/onboardingFlow/OnboardingFlow';

export const OnboardingPage = () => {
  return (
    <div className={styles.page}>
      <OnboardingFlow />
    </div>
  );
};