export const ONBOARDING_KEY = 'nong-liming-onboarding-complete';

export function isOnboardingComplete(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export function setOnboardingComplete(): void {
  localStorage.setItem(ONBOARDING_KEY, 'true');
}
