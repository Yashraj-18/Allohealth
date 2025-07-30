'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { toast } from 'react-hot-toast'
import { Plus, Edit, Trash2, Search, User, MapPin, Calendar } from 'lucide-react'
import { doctorsAPI } from '@/lib/api'

interface Doctor {
  id: number
  name: string
  specialization: string
  gender: 'male' | 'female' | 'other'
  location: string
  phone: string
  email: string
  availableSlots: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}



const specializations = [
  'Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics', 
  'Neurology', 'Oncology', 'Psychiatry', 'General Medicine'
]

const locations = [
  'Floor 1, Room 101', 'Floor 1, Room 103', 'Floor 2, Room 205', 
  'Floor 3, Room 301', 'Floor 2, Room 207', 'Floor 1, Room 105'
]

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [filters, setFilters] = useState({
    specialization: '',
    location: '',
    search: '',
  })

  const [doctorForm, setDoctorForm] = useState({
    name: '',
    specialization: '',
    gender: 'male' as Doctor['gender'],
    location: '',
    phone: '',
    email: '',
    availableSlots: [] as string[],
  })

  const router = useRouter()

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setIsLoading(true)
      const response = await doctorsAPI.getAll(filters)
      if (response.statusCode === 200) {
        setDoctors(response.data)
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      toast.error('Failed to fetch doctors')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSpecialization = !filters.specialization || doctor.specialization === filters.specialization
    const matchesLocation = !filters.location || doctor.location === filters.location
    const matchesSearch = !filters.search || 
      doctor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(filters.search.toLowerCase())

    return matchesSpecialization && matchesLocation && matchesSearch
  })

  const handleAddDoctor = async () => {
    if (!doctorForm.name || !doctorForm.specialization || !doctorForm.location || !doctorForm.phone || !doctorForm.email) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const response = await doctorsAPI.create({
        ...doctorForm,
        availableSlots: doctorForm.availableSlots.length > 0 ? doctorForm.availableSlots : ['09:00 AM', '10:00 AM', '02:00 PM'],
      })

      if (response.statusCode === 201) {
        // Refresh doctors list
        await fetchDoctors()
        setDoctorForm({
          name: '',
          specialization: '',
          gender: 'male',
          location: '',
          phone: '',
          email: '',
          availableSlots: [],
        })
        setShowAddForm(false)
        toast.success(response.message)
      }
    } catch (error) {
      console.error('Error adding doctor:', error)
      toast.error('Failed to add doctor')
    }
  }

  const handleEditDoctor = async () => {
    if (!selectedDoctor || !doctorForm.name || !doctorForm.specialization || !doctorForm.location || !doctorForm.phone || !doctorForm.email) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const response = await doctorsAPI.update(selectedDoctor.id, {
        ...doctorForm,
        availableSlots: doctorForm.availableSlots.length > 0 ? doctorForm.availableSlots : ['09:00 AM', '10:00 AM', '02:00 PM'],
      })

      if (response.statusCode === 200) {
        // Refresh doctors list
        await fetchDoctors()
        setDoctorForm({
          name: '',
          specialization: '',
          gender: 'male',
          location: '',
          phone: '',
          email: '',
          availableSlots: [],
        })
        setShowEditForm(false)
        setSelectedDoctor(null)
        toast.success(response.message)
      }
    } catch (error) {
      console.error('Error updating doctor:', error)
      toast.error('Failed to update doctor')
    }
  }

  const handleDeleteDoctor = async (doctorId: number) => {
    const doctorToDelete = doctors.find(d => d.id === doctorId)
    if (!confirm(`Are you sure you want to delete ${doctorToDelete?.name}?`)) {
      return
    }

    try {
      const response = await doctorsAPI.delete(doctorId)
      
      if (response.statusCode === 200) {
        // Refresh doctors list
        await fetchDoctors()
        toast.success(response.message)
      }
    } catch (error) {
      console.error('Error deleting doctor:', error)
      toast.error('Failed to delete doctor')
    }
  }

  const openEditForm = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setDoctorForm({
      name: doctor.name,
      specialization: doctor.specialization,
      gender: doctor.gender,
      location: doctor.location,
      phone: doctor.phone,
      email: doctor.email,
      availableSlots: doctor.availableSlots,
    })
    setShowEditForm(true)
  }

  const toggleTimeSlot = (slot: string) => {
    setDoctorForm(prev => ({
      ...prev,
      availableSlots: prev.availableSlots.includes(slot)
        ? prev.availableSlots.filter(s => s !== slot)
        : [...prev.availableSlots, slot]
    }))
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
              <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage doctor profiles and availability
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Doctor
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="input-field pl-10"
                    placeholder="Search doctors..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <select
                  value={filters.specialization}
                  onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
                  className="input-field"
                >
                  <option value="">All Specializations</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="input-field"
                >
                  <option value="">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ specialization: '', location: '', search: '' })}
                  className="btn-secondary w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Doctor Modal */}
        {(showAddForm || showEditForm) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {showAddForm ? 'Add New Doctor' : 'Edit Doctor'}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      value={doctorForm.name}
                      onChange={(e) => setDoctorForm(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field mt-1"
                      placeholder="Enter doctor name"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Specialization *</label>
                    <select
                      value={doctorForm.specialization}
                      onChange={(e) => setDoctorForm(prev => ({ ...prev, specialization: e.target.value }))}
                      className="input-field mt-1"
                    >
                      <option value="">Select specialization</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      value={doctorForm.gender}
                      onChange={(e) => setDoctorForm(prev => ({ ...prev, gender: e.target.value as Doctor['gender'] }))}
                      className="input-field mt-1"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location *</label>
                    <select
                      value={doctorForm.location}
                      onChange={(e) => setDoctorForm(prev => ({ ...prev, location: e.target.value }))}
                      className="input-field mt-1"
                    >
                      <option value="">Select location</option>
                      {locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone *</label>
                    <input
                      type="tel"
                      value={doctorForm.phone}
                      onChange={(e) => setDoctorForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-field mt-1"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      value={doctorForm.email}
                      onChange={(e) => setDoctorForm(prev => ({ ...prev, email: e.target.value }))}
                      className="input-field mt-1"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => toggleTimeSlot(slot)}
                        className={`px-3 py-2 text-sm rounded-md border ${
                          doctorForm.availableSlots.includes(slot)
                            ? 'bg-primary-100 border-primary-300 text-primary-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowAddForm(false)
                      setShowEditForm(false)
                      setSelectedDoctor(null)
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={showAddForm ? handleAddDoctor : handleEditDoctor}
                    className="btn-primary"
                  >
                    {showAddForm ? 'Add Doctor' : 'Update Doctor'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-gray-500">{doctor.specialization}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditForm(doctor)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doctor.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {doctor.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {doctor.availableSlots.length} slots available
                  </div>
                  <div className="text-sm text-gray-600">
                    {doctor.phone}
                  </div>
                  <div className="text-sm text-gray-600">
                    {doctor.email}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Available Slots:</h4>
                  <div className="flex flex-wrap gap-1">
                    {doctor.availableSlots.slice(0, 3).map(slot => (
                      <span
                        key={slot}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {slot}
                      </span>
                    ))}
                    {doctor.availableSlots.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{doctor.availableSlots.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!isLoading && filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 