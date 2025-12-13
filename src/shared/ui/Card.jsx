export default function Card({ as: As = 'div', className = '', ...props }) {
  const base = 'border-2 border-black shadow-brutal bg-white'
  return <As className={`${base} ${className}`} {...props} />
}
