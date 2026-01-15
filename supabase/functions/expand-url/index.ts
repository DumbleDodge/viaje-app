import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    if (!url) throw new Error("URL requerida")

    console.log("Expanding URL:", url)

    // 1. Hacemos la petición al link corto
    const response = await fetch(url, { 
      method: 'HEAD', 
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    })
    const finalUrl = response.url
    console.log("Final URL:", finalUrl)

    // 2. Extraemos coordenadas
    let lat = null
    let lng = null

    // Patrón 1: @lat,lng
    const atMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (atMatch) {
        lat = parseFloat(atMatch[1])
        lng = parseFloat(atMatch[2])
    }

    // Patrón 2: !3d...!4d...
    if (!lat) {
        const pinMatch = finalUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
        if (pinMatch) {
            lat = parseFloat(pinMatch[1])
            lng = parseFloat(pinMatch[2])
        }
    }

    return new Response(JSON.stringify({ original: url, final: finalUrl, lat, lng }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})