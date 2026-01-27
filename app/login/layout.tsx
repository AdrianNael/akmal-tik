// app/layout.tsx


import { Inter } from "next/font/google"
import "../globals.css"
import { ThemeProvider } from "@/components/ui/theme-provider"
import Background from "@/components/ui/background"
Background
const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Akmal -ID Card Generator",
  description:"Aplikasi berbasis web untuk membuat dan mengunduh ID Card mahasiswa secara otomatis",
    icons: {
    icon : "/universitas-pertamina-logo.png",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Background/>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
