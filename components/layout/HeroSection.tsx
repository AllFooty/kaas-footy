import Image from "next/image";
import React from "react";

export function HeroSection() {
  return (
    <section className="relative px-6 py-24 md:py-32 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <Image 
                src="/logo.png" 
                alt="Kaas Footy Logo" 
                width={48} 
                height={48}
                className="rounded-lg"
              />
              <span className="text-2xl font-bold">Kaas Footy</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Streamline Your League Management!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Create perfect soccer league schedules in minutes. Streamline your league management with our comprehensive scheduling and organization tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Get Started
              </button>
              <button className="px-6 py-3 text-lg font-medium text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50">
                View Demo
              </button>
            </div>
          </div>
          <div className="relative h-[400px] lg:h-[500px]">
            <Image
              src="/dashboard-preview.png"
              alt="Kaas Footy schedule dashboard"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
} 