const stats = [
  {
    value: '10K+',
    label: 'Resumes Reviewed',
  },
  {
    value: '98%',
    label: 'ATS Accuracy',
  },
  {
    value: '50K+',
    label: 'Active Users',
  },
  {
    value: '< 1s',
    label: 'Real-Time Updates',
  },
];

export function StatsSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-400/5" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
