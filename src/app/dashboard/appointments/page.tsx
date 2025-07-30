'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { toast } from 'react-hot-toast'
import { Plus, Calendar, Clock, User, Search, Filter } from 'lucide-react'
import { appointmentsAPI, doctorsAPI } from '@/lib/api'

interface Doctor {
  id: number
  name: string
  specialization: string
  location: string
  phone: string
  email: string
  availableSlots: string[]
}

interface Appointment {
  id: number
  patientName: string
  doctorId: number
  doctor?: Doctor
  date: string
  timeSlot: string
  status: 'scheduled' | 'completed' | 'cancelled'
  phone?: string
  createdAt: string
  updatedAt: string
}



export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showRescheduleForm, setShowRescheduleForm] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [filters, setFilters] = useState({
    doctor: '',
    date: '',
    status: '',
    search: '',
  })

  const [bookingForm, setBookingForm] = useState({
    patientName: '',
    phone: '',
    doctorId: '',
    date: '',
    time: '',
  })

  const [rescheduleForm, setRescheduleForm] = useState({
    date: '',
    time: '',
  })

  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      // Fetch real data from backend
      const [appointmentsResponse, doctorsResponse] = await Promise.all([
        appointmentsAPI.getAll(filters),
        doctorsAPI.getAll(),
      ])
      
      if (appointmentsResponse.statusCode === 200) {
        setAppointments(appointmentsResponse.data)
      }
      
      if (doctorsResponse.statusCode === 200) {
        setDoctors(doctorsResponse.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesDoctor = !filters.doctor || appointment.doctor?.name === filters.doctor
    const matchesDate = !filters.date || appointment.date === filters.date
    const matchesStatus = !filters.status || appointment.status === filters.status
    const matchesSearch = !filters.search || 
      appointment.patientName.toLowerCase().includes(filters.search.toLowerCase()) ||
      appointment.doctor?.name.toLowerCase().includes(filters.search.toLowerCase())

    return matchesDoctor && matchesDate && matchesStatus && matchesSearch
  })

  const handleBookAppointment = async () => {
    if (!bookingForm.patientName || !bookingForm.doctorId || !bookingForm.date || !bookingForm.time) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const response = await appointmentsAPI.create({
        patientName: bookingForm.patientName,
        phone: bookingForm.phone || undefined,
        doctorId: parseInt(bookingForm.doctorId),
        date: bookingForm.date,
        timeSlot: bookingForm.time,
      })

      if (response.statusCode === 201) {
        // Refresh appointments to get updated data
        await fetchData()
        setBookingForm({
          patientName: '',
          phone: '',
          doctorId: '',
          date: '',
          time: '',
        })
        setShowBookingForm(false)
        toast.success(response.message)
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      toast.error('Failed to book appointment')
    }
  }

  const handleReschedule = async () => {
    if (!rescheduleForm.date || !rescheduleForm.time || !selectedAppointment) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const response = await appointmentsAPI.update(selectedAppointment.id, {
        date: rescheduleForm.date,
        timeSlot: rescheduleForm.time,
      })

      if (response.statusCode === 200) {
        // Refresh appointments to get updated data
        await fetchData()
        setRescheduleForm({ date: '', time: '' })
        setShowRescheduleForm(false)
        setSelectedAppointment(null)
        toast.success('Appointment rescheduled successfully')
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
      toast.error('Failed to reschedule appointment')
    }
  }

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    try {
      const response = await appointmentsAPI.cancel(appointmentId)
      
      if (response.statusCode === 200) {
        // Refresh appointments to get updated data
        await fetchData()
        toast.success('Appointment cancelled successfully')
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      toast.error('Failed to cancel appointment')
    }
  }

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ]

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage patient appointments and scheduling
              </p>
            </div>
            <button
              onClick={() => setShowBookingForm(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Book Appointment
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="input-field pl-10"
                    placeholder="Search patients..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <select
                  value={filters.doctor}
                  onChange={(e) => setFilters(prev => ({ ...prev, doctor: e.target.value }))}
                  className="input-field"
                >
                  <option value="">All Doctors</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.name}>{doctor.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="input-field"
                >
                  <option value="">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ doctor: '', date: '', status: '', search: '' })}
                  className="btn-secondary w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Book New Appointment</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Patient Name *</label>
                    <input
                      type="text"
                      value={bookingForm.patientName}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, patientName: e.target.value }))}
                      className="input-field mt-1"
                      placeholder="Enter patient name"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-field mt-1"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Doctor *</label>
                    <select
                      value={bookingForm.doctorId}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, doctorId: e.target.value }))}
                      className="input-field mt-1"
                    >
                      <option value="">Select a doctor</option>
                      {doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialization}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date *</label>
                    <input
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                      className="input-field mt-1"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time *</label>
                    <select
                      value={bookingForm.time}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, time: e.target.value }))}
                      className="input-field mt-1"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBookAppointment}
                    className="btn-primary"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reschedule Modal */}
        {showRescheduleForm && selectedAppointment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Reschedule Appointment</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Rescheduling appointment for {selectedAppointment.patientName} with {selectedAppointment.doctor?.name || 'N/A'}
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Date *</label>
                    <input
                      type="date"
                      value={rescheduleForm.date}
                      onChange={(e) => setRescheduleForm(prev => ({ ...prev, date: e.target.value }))}
                      className="input-field mt-1"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Time *</label>
                    <select
                      value={rescheduleForm.time}
                      onChange={(e) => setRescheduleForm(prev => ({ ...prev, time: e.target.value }))}
                      className="input-field mt-1"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowRescheduleForm(false)
                      setSelectedAppointment(null)
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReschedule}
                    className="btn-primary"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Table */}
        <div className="card">
          <div className="px-4 py-5 sm:p-6">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
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
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patientName}
                            </div>
                            {appointment.phone && (
                              <div className="text-sm text-gray-500">
                                {appointment.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {appointment.doctor?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(appointment.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {appointment.timeSlot}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {appointment.status === 'scheduled' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedAppointment(appointment)
                                    setShowRescheduleForm(true)
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Reschedule
                                </button>
                                <button
                                  onClick={() => handleCancelAppointment(appointment.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
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