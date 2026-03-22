type ProgressBarProps = {
  value: number
}

export function ProgressBar({ value }: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, value))

  return (
    <div className="h-3 w-full rounded-full bg-muted">
      <div
        className="h-3 rounded-full bg-primary transition-all"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  )
}
