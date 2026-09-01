import Image from 'next/image'
import Link from 'next/link'
import { ConnectButton } from '@/components/ConnectButton'

interface SiteNavProps {
  active: 'bridge' | 'portfolio'
}

export function SiteNav({ active }: SiteNavProps) {
  const linkClass = (isActive: boolean) =>
    isActive
      ? 'text-gray-900 font-medium px-3 py-1.5 rounded-lg bg-gray-900/[0.04]'
      : 'px-3 py-1.5 rounded-lg hover:text-gray-900 hover:bg-gray-900/[0.04] transition-colors'

  return (
    <nav className="border-b border-gray-100 glass sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image
            src="/arcconnect-logo.png"
            alt="ArcConnect"
            width={30}
            height={30}
            className="rounded-lg shadow-sm"
          />
          <span className="font-semibold text-gray-900 tracking-tight">ArcConnect</span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100/80 pl-2 pr-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 pulse-dot" />
            Testnet
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-sm text-gray-500">
          <Link href="/" className={linkClass(active === 'bridge')}>Bridge</Link>
          <Link href="/portfolio" className={linkClass(active === 'portfolio')}>Portfolio</Link>
          <a href="https://docs.arc.io" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg hover:text-gray-900 hover:bg-gray-900/[0.04] transition-colors">Docs</a>
          <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg hover:text-gray-900 hover:bg-gray-900/[0.04] transition-colors">Explorer</a>
        </div>
        <ConnectButton />
      </div>
    </nav>
  )
}
