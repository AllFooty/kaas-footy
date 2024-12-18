import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Providers as QueryProvider } from "@/components/providers"
import { MainNav } from "@/components/layout/MainNav"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import "./globals.css"
import Link from "next/link"
import { UserNav } from "@/components/layout/UserNav"
import { ToasterProvider } from "@/components/ui/use-toast"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <QueryProvider>
            <ToasterProvider>
              <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#000000]">
                <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
                  <div className="flex h-14 items-center justify-between px-8 max-w-[1120px] mx-auto">
                    <div className="flex items-center space-x-4">
                      <Link 
                        href="/" 
                        className="font-semibold text-[#1D1D1F] dark:text-white hover:text-[#0066CC] dark:hover:text-[#0A84FF] transition-colors"
                      >
                        Kaas Footy
                      </Link>
                      <MainNav />
                    </div>
                    <div className="flex items-center space-x-4">
                      <ThemeToggle />
                      <UserNav />
                    </div>
                  </div>
                </header>
                <main>
                  {children}
                </main>
              </div>
            </ToasterProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
