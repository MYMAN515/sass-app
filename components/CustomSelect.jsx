// components/CustomSelect.jsx
'use client';

import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon, CheckIcon } from '@radix-ui/react-icons';

export default function CustomSelect({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-purple-200">{label}</label>

      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger
          className="
            inline-flex items-center justify-between
            bg-white/10 border border-white/30
            rounded-lg px-3 py-2 w-full text-left
            font-[var(--font-open-sans)] text-white
            focus:outline-none focus:ring-2 focus:ring-purple-500
          "
        >
          <Select.Value placeholder={`Select ${label}`} />
          <Select.Icon>
            <ChevronDownIcon className="text-purple-300" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            className="
              bg-white/10 border border-white/30
              rounded-lg overflow-hidden mt-1
              shadow-lg
            "
          >
            <Select.Viewport className="p-1">
              {options.map(opt => (
                <Select.Item
                  key={opt.value}
                  value={opt.value}
                  className="
                    relative flex items-center px-3 py-2
                    cursor-pointer text-white
                    hover:bg-purple-500/20 rounded-md
                  "
                >
                  <Select.ItemText>{opt.label}</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-3">
                    <CheckIcon />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
