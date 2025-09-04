export type Pharmacy = {
  id: string
  name: string
  address: string
  city: string
  deliveryFee: number
  etaMinutes: number
}

const pharmacies: Pharmacy[] = [
  { id: 'ph-101', name: 'CityCare Pharmacy', address: '12 Mall Rd', city: 'Lahore', deliveryFee: 200, etaMinutes: 60 },
  { id: 'ph-102', name: 'HealthPlus Pharmacy', address: '45 Clifton Ave', city: 'Karachi', deliveryFee: 250, etaMinutes: 90 },
  { id: 'ph-103', name: 'QuickMeds', address: '89 Blue Area', city: 'Islamabad', deliveryFee: 180, etaMinutes: 75 }
]

export default pharmacies


