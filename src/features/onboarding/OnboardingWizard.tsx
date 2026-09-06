import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { setOnboardingComplete } from '@/lib/onboarding';
import { seedDatabaseForBeginner } from '@/lib/seedDatabase';
import { ThaiLotusIcon as User } from '@/components/ThaiIcons';
import { ThaiFlameIcon as Sparkles } from '@/components/ThaiIcons';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useToast } from '@/components/toast-provider';

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { show } = useToast();

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleComplete = async () => {
    if (!level) return;
    setIsSubmitting(true);
    try {
      if (level === 'beginner') {
        await seedDatabaseForBeginner();
      }
      setOnboardingComplete();
      onComplete();
    } catch (e) {
      console.error('Error during onboarding completion:', e);
      show('Setup Error', {
        detail: 'Failed to load your starter deck. You can import one later!',
        type: 'error',
      });
      setOnboardingComplete();
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Desktop Graphic Side */}
      <div className="hidden md:flex md:w-1/2 bg-primary/5 items-center justify-center border-r border-border p-12">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-48 h-48 mx-auto rounded-full flex items-center justify-center shadow-2xl overflow-hidden mb-8">
            <Logo className="w-full h-full" />
          </div>
          <h1 className="text-4xl font-bold font-sarabun text-primary">Nong Li Ming</h1>
          <p className="text-xl text-muted-foreground">Your guided path to mastering the Thai language.</p>
        </div>
      </div>

      {/* Wizard Side */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="max-w-md w-full relative z-10">
          {/* Mobile Mascot (Hidden on desktop) */}
          <div className="flex justify-center mb-8 md:hidden">
            <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
              <Logo className="w-full h-full" />
            </div>
          </div>

          <div className="bg-card shadow-xl rounded-3xl p-6 md:p-8 border border-border">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground">Sawasdee! 🙏</h2>
                    <p className="text-muted-foreground mt-2">I'm Nong Li Ming. What should I call you?</p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <input
                        type="text"
                        value={name}
                        onChange={e => {
                          setName(e.target.value);
                        }}
                        placeholder="Your name"
                        className="w-full bg-background border border-input rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                      />
                    </div>

                    <button
                      onClick={handleNext}
                      disabled={!name.trim()}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground">Nice to meet you, {name}!</h2>
                    <p className="text-muted-foreground mt-2">What is your goal for learning Thai?</p>
                  </div>

                  <div className="grid gap-3">
                    {['Travel', 'Family / Partner', 'Work', 'Culture & Media', 'Just for fun'].map(option => (
                      <button
                        key={option}
                        onClick={() => {
                          setGoal(option);
                          setTimeout(handleNext, 150);
                        }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${goal === option ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      >
                        <h3 className="font-semibold text-foreground">{option}</h3>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground">Where are you starting?</h2>
                    <p className="text-muted-foreground mt-2">This helps us tailor your experience.</p>
                  </div>

                  <div className="grid gap-4">
                    <button
                      onClick={() => {
                        setLevel('beginner');
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4 ${level === 'beginner' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                    >
                      <div
                        className={`p-2 rounded-lg ${level === 'beginner' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                      >
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Beginner</h3>
                        <p className="text-sm text-muted-foreground">I'm new to Thai or know very little.</p>
                      </div>
                      {level === 'beginner' && <CheckCircle2 className="h-5 w-5 text-primary ml-auto self-center" />}
                    </button>

                    <button
                      onClick={() => {
                        setLevel('intermediate');
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4 ${level === 'intermediate' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                    >
                      <div
                        className={`p-2 rounded-lg ${level === 'intermediate' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Intermediate</h3>
                        <p className="text-sm text-muted-foreground">I can read some Thai and know basic words.</p>
                      </div>
                      {level === 'intermediate' && (
                        <CheckCircle2 className="h-5 w-5 text-primary ml-auto self-center" />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={handleComplete}
                    disabled={!level || isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {isSubmitting ? 'Setting up...' : "Let's Go!"} <ArrowRight className="h-5 w-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-8">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${step === i ? 'w-6 bg-primary' : 'w-2 bg-muted'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
