// Route Status Component
import dayjs from 'dayjs';
import { type FC, useEffect, useState } from 'react';

const RouteStatus: FC = () => {
  const [currentTime, setCurrentTime] = useState(dayjs().format('HH:mm:ss'));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs().format('HH:mm:ss'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 z-[1000] min-w-[200px]">
      <p className="text-lg text-gray-600">{currentTime}</p>
    </div>
  );
};

export default RouteStatus;
