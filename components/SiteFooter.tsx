import { CreditChip } from '@/components/CreditChip'

export function SiteFooter() {
  return (
    <div className="mt-14 pt-6 border-t border-gray-900/[0.06] dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Gas token is USDC, not ETH ·{' '}
        <a
          href="https://docs.arc.io"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          docs.arc.io
        </a>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-400 dark:text-gray-500 mr-0.5">Built by</span>
        <CreditChip name="Bipin" handle="Bipin_xyz" initial="B" gradient="from-indigo-500 to-blue-500" />
        <CreditChip name="ArcConnect" handle="ArcConnect_" initial="A" gradient="from-violet-500 to-indigo-600" />
      </div>
    </div>
  )
}
