import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HospitalSummary {
  name: string
  address: string
  phone: string
  rating: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { recipientEmail, hospitals } = await req.json() as {
      recipientEmail: string
      hospitals: HospitalSummary[]
    }

    if (!recipientEmail || !hospitals?.length) {
      return new Response(JSON.stringify({ error: 'Email and hospitals required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const hospitalList = hospitals
      .map(
        (h, i) =>
          `${i + 1}. ${h.name}\n   ${h.address}\n   Phone: ${h.phone} | Rating: ${h.rating}/5`,
      )
      .join('\n\n')

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Carefinder <onboarding@resend.dev>',
        to: [recipientEmail],
        subject: `Hospital list shared via Carefinder (${hospitals.length} hospitals)`,
        text: `Here is a curated list of hospitals shared with you via Carefinder:\n\n${hospitalList}\n\nFind more at https://carefinder.vercel.app`,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Resend API error: ${err}`)
    }

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
