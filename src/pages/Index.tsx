import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { FeatureCards } from '@/components/landing/FeatureCards';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { StatsSection } from '@/components/landing/StatsSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { ResumeManager } from '@/components/ResumeManager';
import { ATSToggle } from '@/components/ATSToggle';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <Hero />
        <FeatureCards />
        <HowItWorks />

        <section className="py-16 md:py-24 bg-muted/30 dark:bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
              <Card className="border border-border bg-card">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-transparent">
                    Upload Resume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center mb-6">
                    Upload and manage your resumes for stream reviews
                  </p>
                  <ResumeManager className="max-w-4xl mx-auto" />
                </CardContent>
              </Card>

              <ATSToggle />
            </div>
          </div>
        </section>

        <StatsSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
