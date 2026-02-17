import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-400" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          <div className="relative px-6 py-16 md:px-12 md:py-20 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Start Free Today
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-3xl mx-auto">
              Ready to Transform Your Resume Reviews?
            </h2>

            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Join thousands of streamers and career coaches using Resume Ratings to provide engaging, data-driven feedback.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/rate">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-white/90 rounded-full px-8 w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/host">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8 w-full sm:w-auto">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
