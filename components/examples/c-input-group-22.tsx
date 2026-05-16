import { Field } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShieldEnergyIcon } from "@hugeicons/core-free-icons"

export function Pattern() {
  return (
    <Field className="max-w-xs">
      <InputGroup className="gap-0">
        <InputGroupAddon>
          <Popover>
            <PopoverTrigger
              render={
                <InputGroupButton
                  variant="ghost"
                  size="icon-xs"
                  className="cursor-help"
                />
              }
            >
              <HugeiconsIcon icon={ShieldEnergyIcon} strokeWidth={2} className="text-emerald-500" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72">
              <PopoverHeader>
                <PopoverTitle>Secure Connection</PopoverTitle>
                <PopoverDescription>
                  Your data is encrypted end-to-end using industry-standard
                  protocols.
                </PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
        <InputGroupInput
          defaultValue="https://reui.com"
          className="ps-0.5!"
          readOnly
        />
      </InputGroup>
    </Field>
  )
}