import Image from 'next/image'
import { ARC_CHAIN_ID } from '@/lib/constants'

const CHAIN_STYLES: Record<number, { label: string; bg: string; ring: string }> = {
  11155111: { label: 'E', bg: 'linear-gradient(135deg,#8fa1f7,#627eea)', ring: 'rgba(98,126,234,0.35)' },
  84532: { label: 'B', bg: 'linear-gradient(135deg,#4d8dfd,#0052ff)', ring: 'rgba(0,82,255,0.35)' },
  421614: { label: 'A', bg: 'linear-gradient(135deg,#5fd0e8,#12aaff)', ring: 'rgba(18,170,255,0.35)' },
  43113: { label: 'A', bg: 'linear-gradient(135deg,#f28a8a,#e84142)', ring: 'rgba(232,65,66,0.35)' },
}

interface ChainIconProps {
  chainId: number
  size?: number
  className?: string
}

export function ChainIcon({ chainId, size = 24, className = '' }: ChainIconProps) {
  if (chainId === ARC_CHAIN_ID) {
    return (
      <Image
        src="/arcconnect-logo.png"
        alt="Arc Testnet"
        width={size}
        height={size}
        className={`rounded-full ring-1 ring-black/5 flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  const style = CHAIN_STYLES[chainId]

  if (!style) {
    return (
      <div
        className={`rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400 bg-gray-100 ring-1 ring-black/5 flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        ?
      </div>
    )
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: style.bg,
        boxShadow: `0 0 0 2px #ffffff, 0 0 0 3px ${style.ring}`,
        fontSize: size * 0.42,
      }}
    >
      {style.label}
    </div>
  )
}
