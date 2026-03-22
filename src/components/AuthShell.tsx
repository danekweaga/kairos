import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { Card } from "@/components/ui/card"

type AuthShellProps = {
  title: string
  subtitle: string
  children: ReactNode
  footerPrompt?: ReactNode
}

export function AuthShell({ title, subtitle, children, footerPrompt }: AuthShellProps) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#f8f9fa] p-6 selection:bg-[#e2dfff] selection:text-[#4f4ccd]">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] h-[40%] w-[40%] rounded-full bg-[#4f4ccd]/5 blur-[120px]" />
        <div className="absolute right-[-5%] bottom-[-10%] h-[30%] w-[30%] rounded-full bg-[#d1d9f8]/20 blur-[100px]" />
      </div>

      <div className="w-full max-w-2xl">
        <Card className="relative overflow-hidden rounded-2xl border-0 bg-white p-10 shadow-[0_10px_30px_rgba(43,52,55,0.04),0_4px_8px_rgba(43,52,55,0.02)] md:p-16">
          <div className="absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full bg-gradient-to-br from-[#4f4ccd]/5 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-12 text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#4f4ccd] [font-family:Manrope,Inter,sans-serif]">{title}</h1>
              <p className="mt-2 text-sm tracking-wide text-[#586064]">{subtitle}</p>
            </div>

            <div className="w-full max-w-md">{children}</div>

            {footerPrompt ? <div className="mt-6 text-center text-sm text-[#586064]">{footerPrompt}</div> : null}

            <div className="mt-16 text-center">
              <p className="text-[10px] font-medium leading-relaxed tracking-[0.2em] text-[#737c7f] uppercase">
                Curating focus · Honoring time · Design by Kairos
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-8 flex justify-center">
          <Link
            to="/"
            className="group flex items-center gap-2 text-xs font-medium tracking-wide text-[#586064] transition-colors hover:text-[#2b3437]"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            <span>Return to explore</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
