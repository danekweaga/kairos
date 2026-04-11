import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createClient } from "@supabase/supabase-js"

type KeepAliveResponse = {
  status: "ok" | "degraded"
  service: "kairos"
  timestamp: string
  checks: {
    app: "ok"
    database: "ok" | "skipped" | "error"
  }
  details?: string
}

function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse<KeepAliveResponse>) {
  if (req.method !== "GET") {
    return res.status(405).json({
      status: "degraded",
      service: "kairos",
      timestamp: new Date().toISOString(),
      checks: {
        app: "ok",
        database: "skipped",
      },
      details: "Method not allowed",
    })
  }

  const admin = createAdminClient()
  const timestamp = new Date().toISOString()

  if (!admin) {
    return res.status(200).json({
      status: "ok",
      service: "kairos",
      timestamp,
      checks: {
        app: "ok",
        database: "skipped",
      },
      details: "Database check skipped (SUPABASE_SERVICE_ROLE_KEY not configured).",
    })
  }

  try {
    // Lightweight DB ping with minimal cost and no sensitive data.
    const { error } = await admin.from("profiles").select("id", { count: "exact", head: true }).limit(1)

    if (error) {
      return res.status(200).json({
        status: "degraded",
        service: "kairos",
        timestamp,
        checks: {
          app: "ok",
          database: "error",
        },
        details: "Database reachable but health query failed.",
      })
    }

    return res.status(200).json({
      status: "ok",
      service: "kairos",
      timestamp,
      checks: {
        app: "ok",
        database: "ok",
      },
    })
  } catch {
    return res.status(200).json({
      status: "degraded",
      service: "kairos",
      timestamp,
      checks: {
        app: "ok",
        database: "error",
      },
      details: "Unexpected database health check error.",
    })
  }
}
