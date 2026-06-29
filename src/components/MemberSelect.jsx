export default function MemberSelect({ families, selected, onChange }) {
  function toggleMember(name) {
    if (selected.includes(name)) {
      onChange(selected.filter((m) => m !== name))
    } else {
      onChange([...selected, name])
    }
  }

  function toggleFamily(members) {
    const allSelected = members.every((m) => selected.includes(m))
    if (allSelected) {
      onChange(selected.filter((m) => !members.includes(m)))
    } else {
      const next = [...selected]
      members.forEach((m) => { if (!next.includes(m)) next.push(m) })
      onChange(next)
    }
  }

  return (
    <div className="space-y-5">
      {families.map((family, i) => {
        const allSel = family.members.every((m) => selected.includes(m))
        const someSel = family.members.some((m) => selected.includes(m))

        return (
          <div key={i}>
            {family.name ? (
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {family.name}
                </span>
                <button
                  type="button"
                  onClick={() => toggleFamily(family.members)}
                  className={`text-xs px-3 py-1 rounded-full border font-semibold transition-colors ${
                    allSel
                      ? 'bg-brand text-white border-brand'
                      : someSel
                      ? 'bg-brand-light text-brand border-brand'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  {allSel ? 'Todos ✓' : 'Todos'}
                </button>
              </div>
            ) : (
              <div className="mb-2 h-px bg-gray-100" />
            )}

            <div className="flex flex-wrap gap-2">
              {family.members.map((name) => {
                const active = selected.includes(name)
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleMember(name)}
                    className={`h-9 px-4 rounded-full text-sm font-medium border transition-colors ${
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
          </div>
        )
      })}
    </div>
  )
}
