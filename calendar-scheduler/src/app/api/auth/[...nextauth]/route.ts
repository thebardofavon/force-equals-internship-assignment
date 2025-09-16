// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single()

          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching user:', fetchError)
            return false
          }

          // Update or insert user
          const { data, error } = await supabase
            .from('users')
            .upsert({
              email: user.email!,
              name: user.name!,
              image: user.image,
              google_access_token: account.access_token,
              google_refresh_token: account.refresh_token,
              role: existingUser?.role || 'buyer', // Keep existing role or default to buyer
            })
            .select()

          if (error) {
            console.error('Error upserting user:', error)
            return false
          }

          // Store user ID and role for later use
          user.id = data[0]?.id
          user.role = data[0]?.role

          return true
        } catch (error) {
          console.error('Sign in error:', error)
          return false
        }
      }
      return true
    },

    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          userId: user.id,
          role: user.role,
        }
      }

      // Return previous token if the access token has not expired yet
      return token
    },

    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.accessToken = token.accessToken as string
        session.user.id = token.userId as string
        session.user.role = token.role as 'buyer' | 'seller'
      }

      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }

// import NextAuth from 'next-auth'
// import GoogleProvider from 'next-auth/providers/google'
// import { createClient } from '@supabase/supabase-js'

// const supabase = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_ANON_KEY!
// )

// const handler = NextAuth({
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       authorization: {
//         params: {
//           scope: 'openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly',
//           access_type: 'offline',
//           prompt: 'consent',
//         },
//       },
//     }),
//   ],
//   callbacks: {
//     async signIn({ user, account, profile }) {
//       if (account?.provider === 'google') {
//         // Store/update user in database
//         const { data, error } = await supabase
//           .from('users')
//           .upsert({
//             email: user.email,
//             name: user.name,
//             image: user.image,
//             google_access_token: account.access_token,
//             google_refresh_token: account.refresh_token,
//             role: 'buyer', // Default role
//           })
//           .select()
        
//         return !error
//       }
//       return true
//     },
//     async jwt({ token, account, user }) {
//       if (account) {
//         token.accessToken = account.access_token
//         token.refreshToken = account.refresh_token
//       }
//       return token
//     },
//     async session({ session, token }) {
//       // Add access token to session
//       session.accessToken = token.accessToken as string
//       return session
//     },
//   },
// })

// export { handler as GET, handler as POST }