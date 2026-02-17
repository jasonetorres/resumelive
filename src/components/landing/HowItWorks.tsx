import { Upload, Monitor, Star, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Your Resume',
    description: 'Upload PDF or image files of resumes you want to review. Manage multiple resumes with ease.',
    step: '01',
  },
  {
    icon: Monitor,
    title: 'Go Live',
    description: 'Add the browser source to your stream and share the rating page with your audience.',
    step: '02',
  },
  {
    icon: Star,
    title: 'Get Real-Time Feedback',
    description: 'Viewers rate resumes with stars, reactions, and comments that appear instantly on your overlay.',
    step: '03',
  },
  {
    icon: TrendingUp,
    title: 'Analyze Results',
    description: 'Review ATS scores, audience ratings, and engagement metrics to provide comprehensive feedback.',
    step: '04',
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            Get started in minutes with our simple four-step process
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <div className="hidden lg:block absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-400 rounded-full blur-xl opacity-20" />
                    <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center">
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background border-2 border-primary-500 flex items-center justify-center text-xs font-bold text-primary-500">
                      {step.step}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
