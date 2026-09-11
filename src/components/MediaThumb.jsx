export default function MediaThumb({ url, type, className = '', small = false }) {
  if (!url) return null
  const cls = `media-thumb${small ? ' sm' : ''} ${className}`.trim()
  if (type === 'video') {
    return (
      <div className={cls}>
        <video src={url} muted playsInline preload="metadata" />
      </div>
    )
  }
  return (
    <div className={cls}>
      <img src={url} alt="" />
    </div>
  )
}
