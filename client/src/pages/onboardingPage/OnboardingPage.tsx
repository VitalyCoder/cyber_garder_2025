import styles from './OnboardingPage.module.css';
import { OnboardingFlow } from './ui/onboardingFloww/OnboardingFlow';

export const OnboardingPage = () => {
  return (
    <div className={styles.page}>
      <OnboardingFlow />
    </div>
  );
};