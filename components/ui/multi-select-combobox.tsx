"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type MultiSelectComboboxProps = {
  value: string[]
  onChange: (value: string[]) => void
  options: string[]
  placeholder: string
  searchPlaceholder?: string
  emptyText?: string
}

export function MultiSelectCombobox({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder = "ค้นหา...",
  emptyText = "ไม่พบข้อมูล",
}: MultiSelectComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const [contentWidth, setContentWidth] = useState<number | null>(null)

  useEffect(() => {
    if (!triggerRef.current) return

    const updateWidth = () => {
      if (!triggerRef.current) return
      setContentWidth(triggerRef.current.offsetWidth)
    }

    updateWidth()

    const observer = new ResizeObserver(() => updateWidth())
    observer.observe(triggerRef.current)

    return () => observer.disconnect()
  }, [])

  const normalizedOptions = useMemo(() => {
    const unique = new Set(options.map((item) => item.trim()).filter(Boolean))
    return Array.from(unique)
  }, [options])

  function toggleSelect(item: string) {
    const exists = value.includes(item)
    if (exists) {
      onChange(value.filter((v) => v !== item))
      return
    }
    onChange([...value, item])
  }

  function handleAddCustom() {
    const custom = query.trim()
    if (!custom) return
    if (!value.includes(custom)) {
      onChange([...value, custom])
    }
    setQuery("")
  }

  const canAddCustom =
    query.trim().length > 0 &&
    !normalizedOptions.some((item) => item.toLowerCase() === query.trim().toLowerCase()) &&
    !value.some((item) => item.toLowerCase() === query.trim().toLowerCase())

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-auto min-h-11 w-full justify-between border-brand-100 bg-white px-3 py-2 text-left font-normal"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              {value.length === 0 ? (
                <span className="text-sm text-muted-foreground">{placeholder}</span>
              ) : (
                value.map((item) => (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="gap-1 rounded-full bg-brand-50 text-brand-500"
                    onClick={(event) => {
                      event.stopPropagation()
                    }}
                  >
                    {item}
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Remove ${item}`}
                      className="rounded-sm p-0.5 hover:bg-black/5 cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation()
                        onChange(value.filter((v) => v !== item))
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter" && event.key !== " ") return
                        event.preventDefault()
                        event.stopPropagation()
                        onChange(value.filter((v) => v !== item))
                      }}
                    >
                      <X className="size-3" />
                    </span>
                  </Badge>
                ))
              )}
            </div>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          style={contentWidth ? { width: `${contentWidth}px` } : undefined}
        >
          <Command shouldFilter>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder={searchPlaceholder}
            />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {canAddCustom && (
                  <CommandItem
                    value={`__add__${query}`}
                    onSelect={() => handleAddCustom()}
                  >
                    เพิ่ม &quot;{query.trim()}&quot;
                  </CommandItem>
                )}
                {normalizedOptions.map((item) => {
                  const selected = value.includes(item)
                  return (
                    <CommandItem
                      key={item}
                      value={item}
                      onSelect={() => toggleSelect(item)}
                    >
                      <Check
                        className={cn(
                          "size-4",
                          selected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {item}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
