import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1D1D1F] dark:text-white">
          Create and Manage Soccer Tournaments with Ease
        </h1>
        <p className="text-lg text-[#424245] dark:text-[#86868B]">
          Organize leagues, knockouts, or hybrid tournaments. Track scores, standings, and more in real-time.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/tournaments/hub">
            <Button 
              size="lg"
              className="bg-[#0066CC] hover:bg-[#0077ED] text-white rounded-full px-8 h-12 text-base"
            >
              <Trophy className="mr-2 h-5 w-5" />
              Get Started
            </Button>
          </Link>
          <Link href="/tournaments/demo">
            <Button 
              variant="outline" 
              size="lg"
              className="rounded-full px-8 h-12 text-base border-[#D2D2D7] hover:border-[#86868B]"
            >
              View Demo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
