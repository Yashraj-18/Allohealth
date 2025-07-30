'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Users, Calendar, UserCheck, Clock } from 'lucide-react'
import { dashboardAPI } from '@/lib/api'

interface DashboardStats {
  totalDoctors: number
  todayAppointments: number
  patientsInQueue: number
  completedToday: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDoctors: 0,
    todayAppointments: 0,
    patientsInQueue: 0,
    completedToday: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardAPI.getStats()
        if (response.statusCode === 200) {
          setStats(response.data)
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        setStats({
          totalDoctors: 0,
          todayAppointments: 0,
          patientsInQueue: 0,
          completedToday: 0,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      name: 'Total Doctors',
      value: stats.totalDoctors,
      icon: UserCheck,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      name: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      name: 'Patients in Queue',
      value: stats.patientsInQueue,
      icon: Users,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
    },
    {
      name: 'Completed Today',
      value: stats.completedToday,
      icon: Clock,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
  ]

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-to-queue':
        router.push('/dashboard/queue')
        break
      case 'book-appointment':
        router.push('/dashboard/appointments')
        break
      case 'manage-doctors':
        router.push('/dashboard/doctors')
        break
      default:
        break
    }
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

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of clinic operations and patient flow
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div key={stat.name} className="card p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className={`text-2xl font-semibold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => handleQuickAction('add-to-queue')}
              className="card p-6 hover:shadow-lg transition-all duration-200 cursor-pointer text-left group hover:scale-105"
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    Add to Queue
                  </h3>
                  <p className="text-sm text-gray-500">Register a new patient</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleQuickAction('book-appointment')}
              className="card p-6 hover:shadow-lg transition-all duration-200 cursor-pointer text-left group hover:scale-105"
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                    Book Appointment
                  </h3>
                  <p className="text-sm text-gray-500">Schedule a new appointment</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleQuickAction('manage-doctors')}
              className="card p-6 hover:shadow-lg transition-all duration-200 cursor-pointer text-left group hover:scale-105"
            >
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <UserCheck className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                    Manage Doctors
                  </h3>
                  <p className="text-sm text-gray-500">Update doctor profiles</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <div className="card">
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { action: 'Patient John Doe checked in', time: '2 minutes ago', type: 'checkin' },
                  { action: 'Appointment with Dr. Smith completed', time: '5 minutes ago', type: 'completed' },
                  { action: 'New appointment booked for tomorrow', time: '10 minutes ago', type: 'booked' },
                  { action: 'Dr. Johnson added to schedule', time: '15 minutes ago', type: 'doctor' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'checkin' ? 'bg-blue-500' :
                        activity.type === 'completed' ? 'bg-green-500' :
                        activity.type === 'booked' ? 'bg-purple-500' : 'bg-yellow-500'
                      }`} />
                      <span className="ml-3 text-sm text-gray-900">{activity.action}</span>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 