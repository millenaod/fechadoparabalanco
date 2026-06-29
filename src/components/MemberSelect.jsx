export default function MemberSelect({ members, selected, onChange }) {
  function toggle(name) {
    if (selected.includes(name)) {
      onChange(selected.filter((m) => m !== name))
    } else {
      onChange([...selected, name])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {members.map((name) => {
        const active = selected.includes(name)
        return (
          <button
            key={name}
            type="button"
            onClick={() => toggle(name)}
            className={`h-10 px-4 rounded-full text-sm font-medium border transition-colors ${
              active
                ? 'bg-brand text-white border-brand'
                : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            {name}
          </button>
        )
      })}
    </div>
  )
}
