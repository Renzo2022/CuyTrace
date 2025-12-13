export default function Input({ className = '', ...props }) {
  const base =
    'w-full border-2 border-black shadow-brutal bg-white px-3 py-2 rounded-lg font-bold placeholder:text-slate-500 focus:outline-none'

  return <input className={`${base} ${className}`} {...props} />
}
