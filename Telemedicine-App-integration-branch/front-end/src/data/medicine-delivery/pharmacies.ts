export interface Pharmacy {
  id: string
  name: string
  address: string
  city: string
  deliveryFee: number
  etaMinutes: number
  phone?: string
  email?: string
  operatingHours?: string
  paymentMethods?: string[]
  hasInsurancePartnership?: boolean
}

// API functions for pharmacies
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const fetchPharmacies = async (city?: string): Promise<Pharmacy[]> => {
  try {
    const url = new URL(`${API_BASE_URL}/pharmacies`)
    if (city) {
      url.searchParams.append('city', city)
    }
    
    const response = await fetch(url.toString())
    const data = await response.json()
    
    if (data.success) {
      return data.pharmacies.map((p: any) => ({
        id: p.id?.toString() || p.name,
        name: p.name,
        address: p.address,
        city: p.city,
        deliveryFee: p.delivery_fee || p.deliveryFee || 200,
        etaMinutes: p.eta_minutes || p.etaMinutes || 60,
        phone: p.phone,
        email: p.email,
        operatingHours: p.operating_hours || p.operatingHours,
        paymentMethods: p.payment_methods || p.paymentMethods,
        hasInsurancePartnership: p.has_insurance_partnership || p.hasInsurancePartnership
      }))
    }
    
    throw new Error(data.error || 'Failed to fetch pharmacies')
  } catch (error) {
    console.error('Error fetching pharmacies:', error)
    // Fallback data if API fails
    return [
      { id: 'ph-101', name: 'CityCare Pharmacy', address: '12 Mall Rd', city: 'Lahore', deliveryFee: 200, etaMinutes: 60 },
      { id: 'ph-102', name: 'HealthPlus Pharmacy', address: '45 Clifton Ave', city: 'Karachi', deliveryFee: 250, etaMinutes: 90 },
      { id: 'ph-103', name: 'QuickMeds', address: '89 Blue Area', city: 'Islamabad', deliveryFee: 180, etaMinutes: 75 }
    ]
  }
}

export const fetchNearbyPharmacies = async (latitude: number, longitude: number): Promise<Pharmacy[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/pharmacies/nearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ latitude, longitude })
    })
    
    const data = await response.json()
    
    if (data.success) {
      return data.pharmacies.map((p: any) => ({
        id: p.id?.toString() || p.name,
        name: p.name,
        address: p.address,
        city: p.city,
        deliveryFee: p.delivery_fee || p.deliveryFee || 200,
        etaMinutes: p.eta_minutes || p.etaMinutes || 60,
        phone: p.phone,
        email: p.email,
        operatingHours: p.operating_hours || p.operatingHours,
        paymentMethods: p.payment_methods || p.paymentMethods,
        hasInsurancePartnership: p.has_insurance_partnership || p.hasInsurancePartnership
      }))
    }
    
    throw new Error(data.error || 'Failed to fetch nearby pharmacies')
  } catch (error) {
    console.error('Error fetching nearby pharmacies:', error)
    return []
  }
}

export const createPharmacyOrder = async (orderData: any, token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pharmacies/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    })
    
    const data = await response.json()
    
    if (data.success) {
      return data.order
    }
    
    throw new Error(data.error || 'Failed to create pharmacy order')
  } catch (error) {
    console.error('Error creating pharmacy order:', error)
    throw error
  }
}

// Export fallback data for compatibility
const pharmacies: Pharmacy[] = [
  { id: 'ph-101', name: 'CityCare Pharmacy', address: '12 Mall Rd', city: 'Lahore', deliveryFee: 200, etaMinutes: 60 },
  { id: 'ph-102', name: 'HealthPlus Pharmacy', address: '45 Clifton Ave', city: 'Karachi', deliveryFee: 250, etaMinutes: 90 },
  { id: 'ph-103', name: 'QuickMeds', address: '89 Blue Area', city: 'Islamabad', deliveryFee: 180, etaMinutes: 75 }
]

export default pharmacies


