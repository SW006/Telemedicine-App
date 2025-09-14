"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

type Medicine = {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

type PrescriptionDraft = {
  diagnosis: string
  medicines: Medicine[]
  labTests: string
  advice: string
  nextVisit?: string
}

export default function EPrescriptionPage() {
  const params = useParams()
  const patientId = (params?.id as string) || ""

  const storageKey = useMemo(() => `eprescription:${patientId}`, [patientId])

  const [diagnosis, setDiagnosis] = useState("")
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [labTests, setLabTests] = useState("")
  const [advice, setAdvice] = useState("")
  const [nextVisit, setNextVisit] = useState("")

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null
      if (raw) {
        const draft: PrescriptionDraft = JSON.parse(raw)
        setDiagnosis(draft.diagnosis || "")
        setMedicines(draft.medicines || [])
        setLabTests(draft.labTests || "")
        setAdvice(draft.advice || "")
        setNextVisit(draft.nextVisit || "")
      }
    } catch {
      // ignore malformed drafts
    }
  }, [storageKey])

  const addMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ])
  }

  const removeMedicine = (id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id))
  }

  const updateMedicine = (id: string, field: keyof Medicine, value: string) => {
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
  }

  const saveDraft = () => {
    const draft: PrescriptionDraft = { diagnosis, medicines, labTests, advice, nextVisit }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(draft))
      alert("Draft saved")
    } catch {
      alert("Could not save draft")
    }
  }

  const clearDraft = () => {
    setDiagnosis("")
    setMedicines([])
    setLabTests("")
    setAdvice("")
    setNextVisit("")
    try {
      window.localStorage.removeItem(storageKey)
    } catch {}
  }

  const printPrescription = () => {
    window.print()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">E-Prescription</h1>
          <p className="text-gray-600 mt-1 text-sm">Patient ID: {patientId}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/doctor/patients/${patientId}/record`}>
            <Button variant="outline" size="sm">Back to Record</Button>
          </Link>
          <Button variant="outline" size="sm" onClick={saveDraft}>Save Draft</Button>
          <Button variant="outline" size="sm" onClick={printPrescription}>Print</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Diagnosis</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter provisional/final diagnosis, complaints, vitals summary"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            className="min-h-24"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medicines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {medicines.length === 0 && (
            <p className="text-sm text-gray-500">No medicines added yet.</p>
          )}
          {medicines.map((med) => (
            <div key={med.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
              <div className="md:col-span-3">
                <Input
                  placeholder="Medicine name"
                  value={med.name}
                  onChange={(e) => updateMedicine(med.id, "name", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  placeholder="Dosage (e.g. 500mg)"
                  value={med.dosage}
                  onChange={(e) => updateMedicine(med.id, "dosage", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  placeholder="Frequency (e.g. 1-0-1)"
                  value={med.frequency}
                  onChange={(e) => updateMedicine(med.id, "frequency", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  placeholder="Duration (e.g. 5 days)"
                  value={med.duration}
                  onChange={(e) => updateMedicine(med.id, "duration", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  placeholder="Instructions (e.g. after food)"
                  value={med.instructions || ""}
                  onChange={(e) => updateMedicine(med.id, "instructions", e.target.value)}
                />
              </div>
              <div className="md:col-span-1 flex md:justify-end">
                <Button variant="destructive" size="sm" onClick={() => removeMedicine(med.id)}>Remove</Button>
              </div>
            </div>
          ))}
          <div>
            <Button size="sm" onClick={addMedicine}>Add Medicine</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lab Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="List recommended lab tests (each on new line)"
            value={labTests}
            onChange={(e) => setLabTests(e.target.value)}
            className="min-h-20"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advice & Follow-up</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="General advice, lifestyle modifications, warnings"
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            className="min-h-20"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Next visit (e.g. 2 weeks)"
              value={nextVisit}
              onChange={(e) => setNextVisit(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" onClick={clearDraft}>Clear</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={saveDraft}>Save Draft</Button>
            <Button onClick={printPrescription}>Print</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

