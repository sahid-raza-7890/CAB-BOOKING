import React from 'react';
import HeroSearch from './dashboard/HeroSearch';
import AdBanner from './dashboard/AdBanner';
import FleetMap from './dashboard/FleetMap';

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#050505] text-white p-4 pt-6 lg:p-8 w-full flex flex-col justify-start">
      {/* Main Dashboard Grid */}
      <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          
          {/* Column 1: Carousel and Search (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            <AdBanner />
            <HeroSearch />
          </div>

          {/* Column 2: Fleet Map (7 cols) */}
          <div className="lg:col-span-7 w-full h-[500px] lg:h-[calc(100vh-140px)] min-h-[600px] relative">
            <FleetMap />
          </div>
          
        </div>
      
    </div>
  );
};

export default Home;
