import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 10;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 200);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center z-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-teal-600 mb-2">YuvaSetu</h1>
        <p className="text-slate-600 mb-8">Connecting NGOs and Volunteers</p>
        
        {/* Progress bar */}
        <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-teal-600 transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen; 