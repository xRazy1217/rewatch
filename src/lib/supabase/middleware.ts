import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Rutas públicas
  const publicRoutes = ['/login', '/signup']
  const isPublicRoute = publicRoutes.some(r => pathname.startsWith(r))

  // Si no hay usuario y trata de acceder a rutas protegidas
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Si hay usuario y va a login/signup → redirige al feed
  if (user && isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/feed'
    return NextResponse.redirect(url)
  }

  // Si hay usuario sin onboarding completado
  if (user && pathname !== '/onboarding') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    // Si el username tiene el formato generado automáticamente (tiene _XXXX al final)
    // significa que no completó onboarding — lo mandamos ahí
    // (El trigger crea username como email_split + random number)
  }

  return supabaseResponse
}
