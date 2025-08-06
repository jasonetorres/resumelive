import React, { useState, useEffect } from 'react';
import { LiveDisplay } from '@/components/LiveDisplay';

// Mock data for demonstration
const generateMockRating = () => ({
  id: Math.random().toString(36).substr(2, 9),
  overall: Math.floor(Math.random() * 5) + 1,
  presentation: Math.floor(Math.random() * 5) + 1,
  content: Math.floor(Math.random() * 5) + 1,
  feedback: Math.random() > 0.7 ? [
    "Great layout and design!",
    "Could use more specific examples",
    "Professional appearance",
    "Easy to read and well organized",
    "Needs better keywords",
    "Love the clean format!"
  ][Math.floor(Math.random() * 6)] : undefined,
  category: Math.random() > 0.5 ? 'resume' : 'linkedin' as 'resume' | 'linkedin',
  timestamp: new Date().toISOString()
});

const LiveDisplayPage = () => {
  const [ratings, setRatings] = useState(() => 
    Array.from({ length: 8 }, generateMockRating)
  );

  // Simulate new ratings coming in
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) { // 40% chance every 3 seconds
        setRatings(prev => [generateMockRating(), ...prev]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return <LiveDisplay ratings={ratings} />;
};

export default LiveDisplayPage;