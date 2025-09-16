// src/types/next-auth.d.ts
import NextAuth from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    refreshToken?: string
    user: {
      id?: string
      email?: string | null
      name?: string | null
      image?: string | null
      role?: 'buyer' | 'seller'
    }
  }

  interface User {
    id?: string
    role?: 'buyer' | 'seller'
    accessToken?: string
    refreshToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    role?: 'buyer' | 'seller'
    userId?: string
  }
}