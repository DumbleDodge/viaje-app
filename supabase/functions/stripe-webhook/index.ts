import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    const event = await stripe.webhooks.constructEventAsync(
      body, 
      signature, 
      webhookSecret!
    )

    console.log(`🔔 Evento recibido: ${event.type}`)

    // CASO 1: PAGO COMPLETADO (SUSCRIPCIÓN NUEVA)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const userId = session.client_reference_id
      const customerId = session.customer // <--- ESTO ES LO QUE FALTABA

      if (userId && customerId) {
        console.log(`Procesando alta para usuario: ${userId} con Customer ID: ${customerId}`)
        
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ 
            is_pro: true,
            stripe_customer_id: customerId // <--- GUARDAMOS EL ID IMPORTANTE
          })
          .eq('id', userId)

        if (error) throw error
      }
    }

    // CASO 2: SUSCRIPCIÓN CANCELADA / EXPIRADA
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      const customerId = subscription.customer

      console.log(`Procesando baja para Customer ID: ${customerId}`)

      // Buscamos al usuario por su ID de Stripe y le quitamos el PRO
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_pro: false })
        .eq('stripe_customer_id', customerId)

      if (error) throw error
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    })

  } catch (err) {
    console.error(`❌ Error Webhook: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})
