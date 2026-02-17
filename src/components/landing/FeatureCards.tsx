import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Users, TrendingUp, Upload, Zap, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered ATS Analysis',
    description: 'Get instant ATS compatibility scores with detailed insights on formatting, keywords, and optimization opportunities.',
  },
  {
    icon: Users,
    title: 'Live Audience Ratings',
    description: 'Real-time feedback from viewers with interactive star ratings, reactions, and comments that appear instantly.',
  },
  {
    icon: Upload,
    title: 'Resume Management',
    description: 'Upload, organize, and switch between multiple resumes seamlessly during your live sessions.',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Analytics',
    description: 'Track engagement metrics, viewer participation, and resume performance with live statistics.',
  },
  {
    icon: Zap,
    title: 'Stream Integration',
    description: 'Browser-source ready overlays that integrate perfectly with OBS, StreamLabs, and other streaming software.',
  },
  {
    icon: BarChart3,
    title: 'Interactive Dashboard',
    description: 'Full host controls with soundboard, moderation tools, and display management all in one place.',
  },
];

export function FeatureCards() {
  return (
    <section className="py-16 md:py-24 bg-muted/30 dark:bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
            Everything You Need for{' '}
            <span className="bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-transparent">
              Interactive Reviews
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            Professional tools designed for streamers, career coaches, and content creators
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="card-glow-hover border border-border bg-card dark:bg-card/50"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-500/10 to-secondary-400/10 dark:from-primary-500/20 dark:to-secondary-400/20 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary-500" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
