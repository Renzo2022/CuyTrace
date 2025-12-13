export default function Card({ as: As = 'div', className = '', ...props }) {
  const base = 'border-2 border-black shadow-brutal bg-white rounded-lg'
  return <As className={`${base} ${className}`} {...props} />
}
