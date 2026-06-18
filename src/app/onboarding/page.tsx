import { OnboardingFlow } from '@/features/auth/components/OnboardingFlow'

export default function OnboardingPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #FDFAF7 0%, #FFF8F5 50%, #F0EBFF40 100%)' }}
    >
      <OnboardingFlow />
    </div>
  )
}
