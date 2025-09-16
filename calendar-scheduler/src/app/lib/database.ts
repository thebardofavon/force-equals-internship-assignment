import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export interface User {
  id: string
  email: string
  name: string
  image?: string
  role: 'buyer' | 'seller'
  google_access_token?: string
  google_refresh_token?: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  seller_id: string
  buyer_id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  google_event_id?: string
  status: 'confirmed' | 'cancelled'
  created_at: string
  seller?: User
  buyer?: User
}

export class Database {
  static async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) return null
    return data
  }

  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  static async updateUserRole(email: string, role: 'buyer' | 'seller') {
    const { data, error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('email', email)
      .select()

    if (error) throw error
    return data[0]
  }

  static async getAllSellers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, image')
      .eq('role', 'seller')

    if (error) return []
    return data
  }

  static async createAppointment(appointmentData: {
    seller_id: string
    buyer_id: string
    title: string
    description?: string
    start_time: string
    end_time: string
    google_event_id?: string
  }): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select('*, seller:seller_id(name, email), buyer:buyer_id(name, email)')
      .single()

    if (error) throw error
    return data
  }

  static async getAppointmentsByUser(userId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, seller:seller_id(name, email, image), buyer:buyer_id(name, email, image)')
      .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
      .order('start_time', { ascending: true })

    if (error) return []
    return data
  }

  static async updateAppointmentStatus(id: string, status: 'confirmed' | 'cancelled') {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export default supabase