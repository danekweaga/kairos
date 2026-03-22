import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FeelingQuick } from "@/lib/kairos-types"

type FeelingInputProps = {
  selectedFeeling: FeelingQuick | ""
  customFeeling: string
  onFeelingChange: (value: FeelingQuick) => void
  onCustomFeelingChange: (value: string) => void
}

const quickFeelings: FeelingQuick[] = ["tired", "distracted", "overwhelmed", "mentally blocked"]

export function FeelingInput({
  selectedFeeling,
  customFeeling,
  onFeelingChange,
  onCustomFeelingChange,
}: FeelingInputProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Quick feeling</Label>
        <div className="flex flex-wrap gap-2">
          {quickFeelings.map((feeling) => (
            <Button
              key={feeling}
              type="button"
              variant={selectedFeeling === feeling ? "default" : "outline"}
              onClick={() => onFeelingChange(feeling)}
            >
              {feeling}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-feeling">Describe how you feel (optional)</Label>
        <Input
          id="custom-feeling"
          value={customFeeling}
          onChange={(event) => onCustomFeelingChange(event.target.value)}
          placeholder="Example: I keep rereading without understanding."
        />
      </div>
    </div>
  )
}
