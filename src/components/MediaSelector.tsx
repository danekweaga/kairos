import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MediaSelection, MediaSource } from "@/lib/kairos-types"
import { detectMediaSource, getEmbeddableMedia, isDirectAudioUrl } from "@/lib/session-helpers"
import { isValidHttpUrl, sanitizeText } from "@/lib/validation"

type MediaSelectorProps = {
  media: MediaSelection
  onChange: (value: MediaSelection) => void
}

const presets = [
  {
    title: "Lo-fi Focus Mix",
    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
  },
  {
    title: "Deep Work Ambient",
    url: "https://open.spotify.com/playlist/37i9dQZF1DX8NTLI2TtZa6",
  },
  {
    title: "Calm Piano",
    url: "https://www.youtube.com/watch?v=Dx5qFachd3A",
  },
]

function sourceLabel(source: MediaSource): string {
  if (source === "spotify") return "Spotify"
  if (source === "youtube") return "YouTube"
  if (source === "soundcloud") return "SoundCloud"
  if (source === "apple") return "Apple Music"
  if (source === "audio") return "Direct Audio"
  if (source === "preset") return "Preset"
  return "No Music"
}

export function MediaSelector({ media, onChange }: MediaSelectorProps) {
  const inferredSource = media.url ? detectMediaSource(media.url) : "unknown"
  const embeddable = useMemo(() => getEmbeddableMedia(media.url), [media.url])
  const safeMediaUrl = media.url && isValidHttpUrl(media.url) ? media.url : ""

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study with Audio</CardTitle>
        <CardDescription>Add a song, playlist, or audio link for your session.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="media-source">Media source</Label>
          <Select
            value={media.source}
            onValueChange={(value) =>
              onChange({
                ...media,
                source: value as MediaSource,
                url: value === "none" ? "" : media.url,
              })
            }
          >
            <SelectTrigger id="media-source" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No music</SelectItem>
              <SelectItem value="spotify">Spotify link</SelectItem>
              <SelectItem value="youtube">YouTube link</SelectItem>
              <SelectItem value="soundcloud">SoundCloud link</SelectItem>
              <SelectItem value="apple">Apple Music link</SelectItem>
              <SelectItem value="audio">Direct audio URL (.mp3/.wav/.m4a)</SelectItem>
              <SelectItem value="preset">Preset study playlists</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {media.source === "preset" ? (
          <div className="space-y-2">
            <Label>Pick a preset</Label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.title}
                  type="button"
                  variant={media.url === preset.url ? "default" : "outline"}
                  onClick={() =>
                    onChange({
                      source: "preset",
                  title: sanitizeText(preset.title, 120),
                      url: preset.url,
                    })
                  }
                >
                  {preset.title}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {media.source !== "none" && media.source !== "preset" ? (
          <div className="space-y-2">
            <Label htmlFor="media-link">Paste link</Label>
            <Input
              id="media-link"
              value={media.url}
              onChange={(event) =>
                onChange({
                  ...media,
                  url: event.target.value.trim(),
                  title: sanitizeText(media.title || "Custom media", 120),
                })
              }
              placeholder="https://..."
            />
            {media.url && !safeMediaUrl ? (
              <p className="text-sm text-destructive">Use a valid http(s) link.</p>
            ) : null}
          </div>
        ) : null}

        {safeMediaUrl ? (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
            <p className="text-sm text-muted-foreground">
              Source: {sourceLabel(media.source)}{" "}
              {inferredSource !== "unknown" ? `(detected: ${sourceLabel(inferredSource as MediaSource)})` : ""}
            </p>
            {media.title ? <p className="text-sm font-medium">{media.title}</p> : null}

            {isDirectAudioUrl(safeMediaUrl) ? (
              <audio controls className="w-full">
                <source src={safeMediaUrl} />
              </audio>
            ) : embeddable ? (
              <iframe
                className="h-40 w-full rounded-md border"
                src={embeddable.embedUrl}
                title="Study media"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No native embed available for this link. Use Open Link to play it in the source app/site.
              </p>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => window.open(safeMediaUrl, "_blank", "noopener,noreferrer")}
            >
              Open Link
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
