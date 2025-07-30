'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { BarChart3, TrendingUp, Users, Calendar, Clock, DollarSign } from 'lucide-react'

interface ReportData {
  totalPatients: number
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  averageWaitTime: number
  revenue: number
  monthlyStats: {
    month: string
    patients: number
    appointments: number
    revenue: number
  }[]
  doctorStats: {
    name: string
    appointments: number
    patients: number
  }[]
  specializationStats: {
    specialization: string
    appointments: number
    patients: number
  }[]
}

const mockReportData: ReportData = {
  totalPatients: 1247,
  totalAppointments: 2156,
  completedAppointments: 1892,
  cancelledAppointments: 264,
  averageWaitTime: 23,
  revenue: 125000,
  monthlyStats: [
    { month: 'Jan', patients: 120, appointments: 180, revenue: 12000 },
    { month: 'Feb', patients: 135, appointments: 195, revenue: 13500 },
    { month: 'Mar', patients: 142, appointments: 210, revenue: 14200 },
    { month: 'Apr', patients: 128, appointments: 185, revenue: 12800 },
    { month: 'May', patients: 156, appointments: 230, revenue: 15600 },
    { month: 'Jun', patients: 168, appointments: 245, revenue: 16800 },
  ],
  doctorStats: [
    { name: 'Dr. John Smith', appointments: 245, patients: 180 },
    { name: 'Dr. Sarah Johnson', appointments: 198, patients: 156 },
    { name: 'Dr. Mike Wilson', appointments: 187, patients: 142 },
    { name: 'Dr. Emily Brown', appointments: 165, patients: 128 },
  ],
  specializationStats: [
    { specialization: 'Cardiology', appointments: 320, patients: 245 },
    { specialization: 'Dermatology', appointments: 285, patients: 220 },
    { specialization: 'Orthopedics', appointments: 198, patients: 156 },
    { specialization: 'Pediatrics', appointments: 165, patients: 128 },
  ],
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('6months')

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod])

  const fetchReportData = async () => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setReportData(mockReportData)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCompletionRate = () => {
    if (!reportData) return 0
    return Math.round((reportData.completedAppointments / reportData.totalAppointments) * 100)
  }

  const getCancellationRate = () => {
    if (!reportData) return 0
    return Math.round((reportData.cancelledAppointments / reportData.totalAppointments) * 100)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="ml-4">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!reportData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No report data available</h3>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="mt-1 text-sm text-gray-500">
                Comprehensive overview of clinic performance and statistics
              </p>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-field w-48"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Patients</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {reportData.totalPatients.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Appointments</p>
                <p className="text-2xl font-semibold text-green-600">
                  {reportData.totalAppointments.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Wait Time</p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {reportData.averageWaitTime} min
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-purple-600">
                  ${reportData.revenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Appointment Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Completion Rate</span>
                  <span>{getCompletionRate()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${getCompletionRate()}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Cancellation Rate</span>
                  <span>{getCancellationRate()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${getCancellationRate()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
            <div className="space-y-3">
              {reportData.monthlyStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{stat.month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">{stat.patients} patients</span>
                    <span className="text-sm text-gray-500">{stat.appointments} appointments</span>
                    <span className="text-sm font-medium text-green-600">${stat.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Doctor Performance */}
        <div className="card mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Doctor Performance</h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patients
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.doctorStats.map((doctor, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{doctor.appointments}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{doctor.patients}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(doctor.appointments / Math.max(...reportData.doctorStats.map(d => d.appointments))) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {Math.round((doctor.appointments / Math.max(...reportData.doctorStats.map(d => d.appointments))) * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Specialization Analysis */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Specialization Analysis</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {reportData.specializationStats.map((spec, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{spec.appointments}</div>
                  <div className="text-sm text-gray-500">{spec.specialization}</div>
                  <div className="text-xs text-gray-400">{spec.patients} patients</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 