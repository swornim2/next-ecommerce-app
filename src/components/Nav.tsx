import Link from "next/link"
import { ReactNode } from "react"

export function Nav({ children }: { children: ReactNode }) {
  return (
    <nav className="flex gap-4 items-center border-b border-gray-200 px-4 h-14">
      {children}
    </nav>
  )
}

type NavLinkProps = {
  href: string
  children: ReactNode
  className?: string
}

export function NavLink({ href, children, className = "" }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`hover:text-blue-500 transition-colors ${className}`}
    >
      {children}
    </Link>
  )
}
