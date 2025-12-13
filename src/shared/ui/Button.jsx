export default function Button({ className = '', variant = 'primary', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 border-2 border-black shadow-brutal px-4 py-2 uppercase tracking-wide transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-60 disabled:pointer-events-none'

  const variants = {
    primary: 'bg-primary text-black',
    secondary: 'bg-secondary text-black',
    accent: 'bg-accent text-black',
    highlight: 'bg-highlight text-black',
    ghost: 'bg-white text-black',
  }

  const v = variants[variant] || variants.primary

  return <button className={`${base} ${v} ${className}`} {...props} />
}
