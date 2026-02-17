import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-700/20 via-background to-background dark:from-primary-900/30 dark:via-background dark:to-background" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 md:space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              AI-Powered Resume Reviews,{' '}
              <span className="bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-transparent">
                Live & Interactive
              </span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-xl">
              Get instant, real-time feedback on resumes with AI-powered ATS analysis and live audience ratings. Perfect for streamers, career coaches, and job seekers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/rate">
                <Button size="lg" className="gradient-cta text-white hover:brightness-110 transition-all duration-200 rounded-full px-8 w-full sm:w-auto">
                  Start Rating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/host">
                <Button size="lg" variant="outline" className="rounded-full px-8 border-2 w-full sm:w-auto">
                  Host Dashboard
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-secondary-400/30 rounded-full blur-3xl animate-float" />
              <div className="absolute inset-8 bg-gradient-to-tr from-primary-500 to-secondary-400 rounded-full opacity-20 animate-glow-pulse" />
              <div className="absolute inset-16 bg-gradient-to-bl from-secondary-400 to-primary-600 rounded-full opacity-30" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
