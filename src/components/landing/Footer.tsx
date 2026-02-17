import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center">
                <span className="text-white font-bold text-sm">RR</span>
              </div>
              <span className="font-bold text-lg">Resume Ratings</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered resume reviews for streamers and career coaches.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/rate" className="text-muted-foreground hover:text-foreground transition-colors">
                  Rate Content
                </Link>
              </li>
              <li>
                <Link to="/host" className="text-muted-foreground hover:text-foreground transition-colors">
                  Host Panel
                </Link>
              </li>
              <li>
                <Link to="/display" className="text-muted-foreground hover:text-foreground transition-colors">
                  Stream Display
                </Link>
              </li>
              <li>
                <Link to="/ats" className="text-muted-foreground hover:text-foreground transition-colors">
                  ATS Analysis
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/schedule" className="text-muted-foreground hover:text-foreground transition-colors">
                  Schedule
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-muted-foreground hover:text-foreground transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>
            {currentYear} Resume Ratings. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
