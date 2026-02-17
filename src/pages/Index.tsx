import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeSwitch } from '@/components/ThemeSwitch';
import { Upload, Monitor, Smartphone, Settings } from 'lucide-react';
import { ResumeManager } from '@/components/ResumeManager';
import { ATSToggle } from '@/components/ATSToggle';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b border-border backdrop-blur-lg bg-background/70 dark:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center">
              <span className="text-white font-bold text-sm">RR</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-transparent">
              Resume Ratings
            </span>
          </div>
          <ThemeSwitch />
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Internal Resume Review Tool
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload resumes, manage ratings, and control stream displays
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/rate" className="block">
              <Card className="card-glow-hover border border-border bg-card h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-500/10 to-secondary-400/10 dark:from-primary-500/20 dark:to-secondary-400/20 flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-primary-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Rate Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Viewer rating page for live feedback
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/host" className="block">
              <Card className="card-glow-hover border border-border bg-card h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-500/10 to-secondary-400/10 dark:from-primary-500/20 dark:to-secondary-400/20 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-primary-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Host Panel</h3>
                  <p className="text-sm text-muted-foreground">
                    Controls, soundboard, and resume switching
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/display" className="block">
              <Card className="card-glow-hover border border-border bg-card h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-500/10 to-secondary-400/10 dark:from-primary-500/20 dark:to-secondary-400/20 flex items-center justify-center">
                    <Monitor className="h-6 w-6 text-primary-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Stream Display</h3>
                  <p className="text-sm text-muted-foreground">
                    Live overlay for streaming software
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/ats" className="block">
              <Card className="card-glow-hover border border-border bg-card h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-500/10 to-secondary-400/10 dark:from-primary-500/20 dark:to-secondary-400/20 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary-500" />
                  </div>
                  <h3 className="text-xl font-semibold">ATS Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered resume analysis
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="space-y-8">
            <Card className="border border-border bg-card">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-transparent">
                  Resume Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center mb-6">
                  Upload and manage resumes for review sessions
                </p>
                <ResumeManager className="max-w-4xl mx-auto" />
              </CardContent>
            </Card>

            <ATSToggle />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
