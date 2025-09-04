'use client'

import { useEffect, useMemo, useState } from 'react'
import NavBar from '@/components/ui/NavBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type LabOrderStatus = 'requested' | 'in_progress' | 'completed' | 'cancelled'

type LabOrder = {
  id: string
  labId: number
  labName: string
  tests: string[]
  patientName?: string
  patientPhone?: string
  notes?: string
  status: LabOrderStatus
  createdAt: string
  updatedAt?: string
}

const STORAGE_KEY = 'tt_lab_orders'

export default function LabDashboardPage() {
  const [orders, setOrders] = useState<Record<string, LabOrder>>({})
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<LabOrderStatus | 'all'>('all')

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    setOrders(parsed)
  }, [])

  const orderList = useMemo(() => Object.values(orders).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [orders])

  const filtered = useMemo(() => {
    return orderList.filter(o => {
      const matchesQuery = query
        ? [o.id, o.labName, o.patientName ?? '', o.tests.join(', ')].join(' ').toLowerCase().includes(query.toLowerCase())
        : true
      const matchesStatus = statusFilter === 'all' ? true : o.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [orderList, query, statusFilter])

  const updateStatus = (id: string, status: LabOrderStatus) => {
    setOrders(prev => {
      const updated = { ...prev }
      if (updated[id]) {
        updated[id] = { ...updated[id], status, updatedAt: new Date().toISOString() }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const clearCompleted = () => {
    const remaining = Object.fromEntries(Object.entries(orders).filter(([, o]) => o.status !== 'completed' && o.status !== 'cancelled'))
    setOrders(remaining)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <NavBar />
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Lab Dashboard</h1>
            <p className="text-gray-600">Manage incoming lab test orders</p>
          </div>
          <div className="flex gap-3">
            <input
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by ID, lab, patient, tests"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LabOrderStatus | 'all')}
            >
              <option value="all">All Status</option>
              <option value="requested">Requested</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button onClick={clearCompleted} variant="outline">Clear completed</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 && (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="p-8 text-center text-gray-600">No lab orders</CardContent>
            </Card>
          )}

          {filtered.map(o => (
            <Card key={o.id} className="border border-gray-200/60 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50/60 to-teal-50/60">
                <CardTitle className="flex items-center justify-between">
                  <span>Order #{o.id}</span>
                  <span className="text-sm text-gray-600">{new Date(o.createdAt).toLocaleString()}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="text-sm text-gray-700">Lab: {o.labName}</div>
                {o.patientName && <div className="text-sm text-gray-700">Patient: {o.patientName}{o.patientPhone ? ` (${o.patientPhone})` : ''}</div>}
                {o.tests?.length > 0 && (
                  <div className="text-sm text-gray-700">Tests: {o.tests.join(', ')}</div>
                )}
                {o.notes && <div className="text-sm text-gray-700">Notes: {o.notes}</div>}
                <div className="flex items-center gap-2 pt-2">
                  <label className="text-sm text-gray-600">Status</label>
                  <select
                    className="px-2 py-1 border border-gray-300 rounded-md"
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value as LabOrderStatus)}
                  >
                    <option value="requested">Requested</option>
                    <option value="in_progress">In progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}


