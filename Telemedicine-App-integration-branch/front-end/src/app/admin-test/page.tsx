'use client';

import { useState } from 'react';
import { getDashboardPathByRole } from '@/lib/auth';

export default function AdminTest() {
  const [testEmail, setTestEmail] = useState('admin@teletabib.com');
  const [result, setResult] = useState('');

  const testRouting = () => {
    const isAdmin = testEmail.toLowerCase().includes('admin') || testEmail.toLowerCase() === 'admin@teletabib.com';
    const role = isAdmin ? 'doctor' : 'patient';
    const route = getDashboardPathByRole(role);
    
    setResult(`Email: ${testEmail}
Is Admin: ${isAdmin}
Role: ${role}  
Route: ${route}`);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">🔧 Admin Routing Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Email:</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button
            onClick={testRouting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Test Routing Logic
          </button>
          
          {result && (
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            </div>
          )}
        </div>
        
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="font-medium text-yellow-800 mb-2">Quick Tests:</h3>
          <div className="space-y-2 text-sm">
            <button 
              onClick={() => {setTestEmail('admin@teletabib.com'); setTimeout(testRouting, 100)}}
              className="block w-full text-left p-2 bg-white border rounded hover:bg-gray-50"
            >
              Test: admin@teletabib.com → should go to /doctor
            </button>
            <button 
              onClick={() => {setTestEmail('patient1@gmail.com'); setTimeout(testRouting, 100)}}
              className="block w-full text-left p-2 bg-white border rounded hover:bg-gray-50"
            >
              Test: patient1@gmail.com → should go to /patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}