import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { EnergyLevel } from "@/lib/kairos-types"

type EnergySelectorProps = {
  energyLevel: EnergyLevel
  onChange: (value: EnergyLevel) => void
}

export function EnergySelector({ energyLevel, onChange }: EnergySelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Energy Selector</CardTitle>
        <CardDescription>Choose your current energy and get a matching recommendation.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {(["low", "medium", "high"] as EnergyLevel[]).map((level) => (
            <Button
              key={level}
              type="button"
              variant={energyLevel === level ? "default" : "outline"}
              onClick={() => onChange(level)}
            >
              {level[0].toUpperCase() + level.slice(1)}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
