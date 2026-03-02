export default function SectionTitle({ sub, title, desc }) {
  return (
    <div className="text-center mb-10">
      {sub && <p className="text-amber-600 text-xs font-semibold tracking-[0.2em] uppercase mb-2">{sub}</p>}
      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">{title}</h2>
      {desc && <p className="text-gray-500 mt-3 max-w-lg mx-auto">{desc}</p>}
    </div>
  )
}
