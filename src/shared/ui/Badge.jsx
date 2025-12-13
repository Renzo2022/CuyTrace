export default function Badge({ className = '', variant = 'default', ...props }) {
  const base = 'inline-flex items-center border-2 border-black shadow-brutal px-2 py-1 text-xs uppercase tracking-wide rounded-lg'

  const variants = {
    default: 'bg-white text-text',
    primary: 'bg-primary text-black',
    secondary: 'bg-secondary text-black',
    accent: 'bg-accent text-black',
    highlight: 'bg-highlight text-black',
  }

  const v = variants[variant] || variants.default

  return <span className={`${base} ${v} ${className}`} {...props} />
}
