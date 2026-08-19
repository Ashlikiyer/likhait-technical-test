import { Check, ChevronDown } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

interface CategorySelectProps {
  id: string
  value: string
  options: string[]
  onChange: (value: string) => void
  required?: boolean
  "aria-invalid"?: boolean
}

export function CategorySelect({
  id,
  value,
  options,
  onChange,
  required,
  "aria-invalid": ariaInvalid,
}: CategorySelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-invalid={ariaInvalid}
        aria-required={required}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 text-left text-sm text-slate-950 shadow-sm transition-colors",
          "border-slate-300 hover:border-slate-400 focus-visible:border-slate-500 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-slate-500/20",
          "dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:border-slate-500",
          ariaInvalid && "border-destructive"
        )}
      >
        <span className={cn(!value && "text-slate-500 dark:text-slate-400")}>
          {value || "Select a category"}
        </span>
        <ChevronDown className={cn("size-4 text-slate-500 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          id={`${id}-options`}
          role="listbox"
          className="absolute z-[1100] mt-2 max-h-52 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          <button
            type="button"
            role="option"
            aria-selected={!value}
            onClick={() => {
              onChange("")
              setOpen(false)
            }}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Select a category
          </button>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={value === option}
              onClick={() => {
                onChange(option)
                setOpen(false)
              }}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {option}
              {value === option && <Check className="size-4 text-slate-700 dark:text-slate-300" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}