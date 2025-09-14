"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, FlaskConical, User } from "lucide-react";
import PRESCRIPTIONS from "@/data/patients/prescriptions.json";
import NOTES from "@/data/patients/doctor-notes.json";
import REPORTS from "@/data/patients/patient-reports.json";

interface DoctorNote {
	id: string;
	patientId: string;
	date: string; // ISO date
	doctor: string;
	summary: string;
	details: string;
}

interface PatientReport {
	id: string;
	patientId: string;
	type: "Lab Test" | "Imaging" | "Report";
	title: string;
	date: string; // ISO date
	fileUrl?: string;
	notes?: string;
}

interface PrescriptionItem {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
}

interface PrescriptionRecord {
    id: string;
    patientId: string;
    date: string; // ISO date
    doctor: string;
    diagnosis: string;
    medicines: PrescriptionItem[];
    labTests: string[];
    advice?: string;
    nextVisit?: string;
}

export default function PatientRecordPage() {
	const params = useParams();
	const patientId = (params?.id as string) || "";

	const notesForPatient = useMemo(
		() => (NOTES as DoctorNote[]).filter((n) => n.patientId === patientId).sort((a, b) => (a.date < b.date ? 1 : -1)),
		[patientId]
	);

	const reportsForPatient = useMemo(
		() => (REPORTS as PatientReport[]).filter((r) => r.patientId === patientId).sort((a, b) => (a.date < b.date ? 1 : -1)),
		[patientId]
	);

	const prescriptionsForPatient = useMemo(
		() => (PRESCRIPTIONS as PrescriptionRecord[]).filter((p) => p.patientId === patientId).sort((a, b) => (a.date < b.date ? 1 : -1)),
		[patientId]
	);

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Patient Record</h1>
				<div className="flex gap-2">
					<Link href={`/doctor/patients`}>
						<Button variant="outline" size="sm">Back to Patients</Button>
					</Link>
					<Link href={`/doctor/patients/${patientId}/record/e-priscription`}>
						<Button size="sm">Create E-Prescription</Button>
					</Link>
				</div>
			</div>

			{/* Doctor Notes */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="w-5 h-5" /> Doctor&apos;s Notes
						<Badge variant="outline">{notesForPatient.length}</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{notesForPatient.length === 0 ? (
						<p className="text-sm text-gray-500">No notes available for this patient yet.</p>
					) : (
						<div className="space-y-4">
							{notesForPatient.map((note) => (
								<div key={note.id} className="border rounded-md p-4">
									<div className="flex items-center justify-between mb-1">
										<div className="flex items-center gap-2 text-sm text-gray-600">
											<User className="w-4 h-4" />
											<span>{note.doctor}</span>
										</div>
										<div className="flex items-center gap-1 text-xs text-gray-500">
											<Calendar className="w-3 h-3" />
											<span>{note.date}</span>
										</div>
									</div>
									<p className="font-medium">{note.summary}</p>
									<p className="text-sm text-gray-600 mt-1 leading-relaxed">{note.details}</p>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Patient Uploaded Reports */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FlaskConical className="w-5 h-5" /> Lab Tests & Reports
						<Badge variant="outline">{reportsForPatient.length}</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{reportsForPatient.length === 0 ? (
						<p className="text-sm text-gray-500">No lab tests or reports uploaded yet.</p>
					) : (
						reportsForPatient.map((rep) => (
							<div key={rep.id} className="border rounded-md p-4 flex flex-col">
								<div className="flex items-center justify-between mb-2">
									<Badge className="text-xs" variant="secondary">{rep.type}</Badge>
									<div className="flex items-center gap-1 text-xs text-gray-500">
										<Calendar className="w-3 h-3" />
										<span>{rep.date}</span>
									</div>
								</div>
								<p className="font-medium">{rep.title}</p>
								{rep.notes && <p className="text-sm text-gray-600 mt-1">{rep.notes}</p>}
								<div className="mt-3">
									{rep.fileUrl ? (
										<Link href={rep.fileUrl} target="_blank">
											<Button variant="outline" size="sm">View File</Button>
										</Link>
									) : (
										<Button variant="outline" size="sm" disabled>No file</Button>
									)}
								</div>
							</div>
						))
					)}
				</CardContent>
			</Card>

			{/* Past Prescriptions */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="w-5 h-5" /> Past Prescriptions
						<Badge variant="outline">{prescriptionsForPatient.length}</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{prescriptionsForPatient.length === 0 ? (
						<p className="text-sm text-gray-500">No prescriptions recorded yet.</p>
					) : (
						<div className="space-y-4">
							{prescriptionsForPatient.map((rx) => (
								<div key={rx.id} className="border rounded-md p-4">
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center gap-2 text-sm text-gray-600">
											<User className="w-4 h-4" />
											<span>{rx.doctor}</span>
										</div>
										<div className="flex items-center gap-1 text-xs text-gray-500">
											<Calendar className="w-3 h-3" />
											<span>{rx.date}</span>
										</div>
									</div>
									<p className="font-medium">Diagnosis: {rx.diagnosis}</p>
									<div className="mt-2">
										<p className="text-sm font-medium">Medicines</p>
										<ul className="mt-1 list-disc pl-5 text-sm text-gray-700">
											{rx.medicines.map((m, idx) => (
												<li key={idx}>
													<span className="font-medium">{m.name}</span>{m.dosage ? ` ${m.dosage}` : ""} — {m.frequency} × {m.duration}
													{m.instructions ? ` (${m.instructions})` : ""}
												</li>
											))}
										</ul>
									</div>
									{rx.labTests?.length ? (
										<div className="mt-2 text-sm">
											<span className="font-medium">Lab tests:</span> {rx.labTests.join(', ')}
										</div>
									) : null}
									{rx.advice ? (
										<p className="mt-2 text-sm"><span className="font-medium">Advice:</span> {rx.advice}</p>
									) : null}
									{rx.nextVisit ? (
										<p className="mt-1 text-sm"><span className="font-medium">Next visit:</span> {rx.nextVisit}</p>
									) : null}
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
