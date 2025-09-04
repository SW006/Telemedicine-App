"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, FileBadge2, Megaphone, UserPlus2, XCircle } from "lucide-react";
import adminData from "@/data/admin/admin-data.json";

interface Application {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  speciality: string;
  pmdc_number: string;
  experience: number | null;
  message: string | null;
  profile_pic_path: string | null;
  pmdc_certificate_path: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export default function AdminDashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<"" | "pending" | "approved" | "rejected">("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState<boolean>(false);
  
  // Import data from JSON files
  const mockApplications = adminData.applications;
  const mockComplaints = adminData.complaints;

  interface Complaint {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
  }

  async function fetchApps(status?: string) {
    setLoading(true);
    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter mock applications based on status
    let filteredApps = mockApplications;
    if (status) {
      filteredApps = mockApplications.filter(app => app.status === status);
    }
    
    setApplications(filteredApps as Application[]);
    setLoading(false);
  }

  async function fetchComplaints() {
    try {
      setComplaintsLoading(true);
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      setComplaints(mockComplaints);
    } catch {
      setComplaints([]);
    } finally {
      setComplaintsLoading(false);
    }
  }

  useEffect(() => {
    fetchApps(filter || undefined);
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const takeAction = async (id: number, action: "approve" | "reject") => {
    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update mock data
    const updatedApps = applications.map(app => 
      app.id === id ? { ...app, status: action === "approve" ? "approved" as const : "rejected" as const } : app
    );
    
    // Update state based on current filter
    const newStatus = action === "approve" ? "approved" : "rejected";
    if (!filter || filter === newStatus) {
      setApplications(updatedApps.filter(app => !filter || app.status === filter));
    } else {
      setApplications(applications.filter(app => app.id !== id));
    }
  };

  const appStats = useMemo(() => {
    const pending = applications.filter(a => a.status === "pending").length;
    const approved = applications.filter(a => a.status === "approved").length;
    const rejected = applications.filter(a => a.status === "rejected").length;
    return {
      total: applications.length,
      pending,
      approved,
      rejected,
    };
  }, [applications]);

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Monitor applications and user complaints</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-blue-100 text-blue-700">
                <UserPlus2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total Applications</div>
                <div className="text-xl font-semibold">{appStats.total}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-amber-100 text-amber-700">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Pending</div>
                <div className="text-xl font-semibold">{appStats.pending}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-green-100 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Approved</div>
                <div className="text-xl font-semibold">{appStats.approved}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-red-100 text-red-700">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Rejected</div>
                <div className="text-xl font-semibold">{appStats.rejected}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="space-y-10">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold flex items-center gap-2"><FileBadge2 className="w-5 h-5 text-blue-600" /> Doctor Applications</h2>
            <div className="inline-flex rounded-md border bg-background p-1">
              <Button variant={filter === "" ? "default" : "ghost"} size="sm" onClick={() => setFilter("")}>All</Button>
              <Button variant={filter === "pending" ? "default" : "ghost"} size="sm" onClick={() => setFilter("pending")}>Pending</Button>
              <Button variant={filter === "approved" ? "default" : "ghost"} size="sm" onClick={() => setFilter("approved")}>Approved</Button>
              <Button variant={filter === "rejected" ? "default" : "ghost"} size="sm" onClick={() => setFilter("rejected")}>Rejected</Button>
            </div>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : applications.length === 0 ? (
            <p>No applications.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {applications.map(app => (
                <Card key={app.id}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      {app.profile_pic_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={app.profile_pic_path} alt="profile" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200" />
                      )}
                      <div className="min-w-0">
                        <CardTitle className="text-base leading-tight truncate">{app.first_name} {app.last_name}</CardTitle>
                        <div className="text-sm text-muted-foreground truncate">{app.email}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-foreground/80 space-y-1">
                      <div><span className="font-semibold">Phone:</span> {app.phone}</div>
                      <div><span className="font-semibold">City:</span> {app.city}</div>
                      <div><span className="font-semibold">Speciality:</span> {app.speciality}</div>
                      <div><span className="font-semibold">PMDC:</span> {app.pmdc_number}</div>
                      {app.message && <div className="text-muted-foreground">{app.message}</div>}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      {app.pmdc_certificate_path ? (
                        <Link href={app.pmdc_certificate_path} target="_blank" className="text-blue-600 underline">View PMDC</Link>
                      ) : (
                        <span className="text-muted-foreground">No PMDC file</span>
                      )}
                      <Badge
                        className={
                          app.status === 'pending'
                            ? 'bg-amber-100 text-amber-700 border-transparent'
                            : app.status === 'approved'
                            ? 'bg-green-100 text-green-700 border-transparent'
                            : 'bg-red-100 text-red-700 border-transparent'
                        }
                      >
                        {app.status}
                      </Badge>
                    </div>
                    {app.status === 'pending' && (
                      <div className="mt-4 flex gap-2">
                        <Button onClick={() => takeAction(app.id, 'approve')} className="bg-green-600 hover:bg-green-700">Approve</Button>
                        <Button onClick={() => takeAction(app.id, 'reject')} variant="destructive">Reject</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Megaphone className="w-5 h-5 text-blue-600" /> User Complaints</h2>
            <Button variant="secondary" onClick={() => fetchComplaints()} disabled={complaintsLoading}>
              {complaintsLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
          {complaintsLoading ? (
            <p>Loading complaints...</p>
          ) : complaints.length === 0 ? (
            <p>No complaints submitted yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {complaints.map((c) => (
                <Card key={c.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{c.subject}</CardTitle>
                      <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-foreground/80 mb-2">{c.message}</div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold">From:</span> {c.name} ({c.email})
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}


