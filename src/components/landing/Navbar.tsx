import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeSwitch } from '@/components/ThemeSwitch';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border backdrop-blur-lg bg-background/70 dark:bg-background/60">
      <div className="container mx-auto flex h-16 md:h-18 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center">
              <span className="text-white font-bold text-sm">RR</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-transparent">
              Resume Ratings
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/rate" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Rate Content
          </Link>
          <Link to="/host" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Host Panel
          </Link>
          <Link to="/display" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Display
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitch />
          <Link to="/rate">
            <Button className="gradient-cta text-white hover:brightness-110 transition-all duration-200 rounded-full px-6">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
