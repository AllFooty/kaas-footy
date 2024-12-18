import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

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
              <Link href="/tournaments/demo">
                <Button size="lg" className="text-lg w-full sm:w-auto">
                  View Demo Dashboard
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg">
                Learn More
              </Button>
            </div>
          </div>
          <div className="relative h-[400px] lg:h-[500px]">
            <Link href="/tournaments/demo" className="cursor-pointer">
              <Image
                src="/dashboard-preview.png"
                alt="Kaas Footy schedule dashboard"
                fill
                className="object-contain hover:scale-105 transition-transform duration-300"
                priority
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 