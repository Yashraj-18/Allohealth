'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { toast } from 'react-hot-toast'
import { Plus, RefreshCw, Clock, UserCheck, CheckCircle } from 'lucide-react'
import { queueAPI } from '@/lib/api'

interface Patient {
  id: number
  queueNumber: number
  patientName: string
  status: 'waiting' | 'with-doctor' | 'completed'
  timestamp: string
  phone?: string
  createdAt: string
}

const statusColors = {
  waiting: 'bg-yellow-100 text-yellow-800',
  'with-doctor': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
}

const statusIcons = {
  waiting: Clock,
  'with-doctor': UserCheck,
  completed: CheckCircle,
}

export default function QueuePage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPatient, setNewPatient] = useState({ name: '', phone: '' })
  const router = useRouter()

  useEffect(() => {
    fetchQueue()
  }, [])

  const fetchQueue = async () => {
    try {
      setIsRefreshing(true)
      const response = await queueAPI.getCurrent()
      if (response.statusCode === 200) {
        setPatients(response.data.queue)
      }
    } catch (error) {
      console.error('Error fetching queue:', error)
      toast.error('Failed to fetch queue data')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const updatePatientStatus = async (patientId: number, newStatus: Patient['status']) => {
    try {
      const response = await queueAPI.updateStatus(patientId, newStatus)
      if (response.statusCode === 200) {
        // Refresh the queue to get updated data
        await fetchQueue()
        toast.success('Patient status updated successfully')
      }
    } catch (error) {
      console.error('Error updating patient status:', error)
      toast.error('Failed to update patient status')
    }
  }

  const addPatientToQueue = async () => {
    if (!newPatient.name.trim()) {
      toast.error('Please enter patient name')
      return
    }

    try {
      const response = await queueAPI.addPatient({
        patientName: newPatient.name,
        phone: newPatient.phone || undefined,
      })
      
      if (response.statusCode === 201) {
        // Refresh the queue to get updated data
        await fetchQueue()
        setNewPatient({ name: '', phone: '' })
        setShowAddForm(false)
        toast.success(response.message)
      }
    } catch (error) {
      console.error('Error adding patient to queue:', error)
      toast.error('Failed to add patient to queue')
    }
  }

  const getStatusCount = (status: Patient['status']) => {
    return patients.filter(p => p.status === status).length
  }

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Queue</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage patient queue and track their status
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchQueue}
                disabled={isRefreshing}
                className="btn-secondary flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Patient
              </button>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
          <div className="card p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Waiting</p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {getStatusCount('waiting')}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">With Doctor</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {getStatusCount('with-doctor')}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-green-600">
                  {getStatusCount('completed')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Patient Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Patient to Queue</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Patient Name *</label>
                    <input
                      type="text"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field mt-1"
                      placeholder="Enter patient name"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-field mt-1"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addPatientToQueue}
                    className="btn-primary"
                  >
                    Add to Queue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Queue Table */}
        <div className="card">
          <div className="px-4 py-5 sm:p-6">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Queue #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patients.map((patient) => {
                      const StatusIcon = statusIcons[patient.status]
                      return (
                        <tr key={patient.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-lg font-semibold text-gray-900">
                              #{patient.queueNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.patientName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {patient.phone || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(patient.timestamp || patient.createdAt).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[patient.status]}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {patient.status.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {patient.status === 'waiting' && (
                                <button
                                  onClick={() => updatePatientStatus(patient.id, 'with-doctor')}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Start
                                </button>
                              )}
                              {patient.status === 'with-doctor' && (
                                <button
                                  onClick={() => updatePatientStatus(patient.id, 'completed')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 