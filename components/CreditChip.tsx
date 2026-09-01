interface CreditChipProps {
  name: string
  handle: string
  initial: string
  gradient: string
}

export function CreditChip({ name, handle, initial, gradient }: CreditChipProps) {
  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full pl-1.5 pr-1.5 py-1.5 shadow-sm">
      <a
        href={`https://x.com/${handle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 group"
      >
        <span
          className={`w-6 h-6 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}
        >
          {initial}
        </span>
        <span className="leading-tight text-left">
          <span className="block text-xs font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {name}
          </span>
          <span className="block text-[11px] text-gray-400">@{handle}</span>
        </span>
      </a>
      <a
        href={`https://x.com/intent/follow?screen_name=${handle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors rounded-full px-3 py-1.5"
      >
        Follow
      </a>
    </div>
  )
}
