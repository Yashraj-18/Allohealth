// Mock Data - No Backend Required!
let mockDoctors = [
  {
    id: 1,
    name: 'Dr. John Smith',
    specialization: 'Cardiology',
    gender: 'male',
    location: 'Floor 1, Room 101',
    phone: '+1 234-567-8900',
    email: 'john.smith@clinic.com',
    availableSlots: ['09:00 AM', '10:00 AM', '02:00 PM', '03:00 PM'],
    isActive: true,
  },
  {
    id: 2,
    name: 'Dr. Sarah Johnson',
    specialization: 'Dermatology',
    gender: 'female',
    location: 'Floor 2, Room 205',
    phone: '+1 234-567-8901',
    email: 'sarah.johnson@clinic.com',
    availableSlots: ['09:30 AM', '11:00 AM', '02:30 PM', '04:00 PM'],
    isActive: true,
  },
  {
    id: 3,
    name: 'Dr. Mike Wilson',
    specialization: 'Orthopedics',
    gender: 'male',
    location: 'Floor 1, Room 103',
    phone: '+1 234-567-8902',
    email: 'mike.wilson@clinic.com',
    availableSlots: ['10:30 AM', '02:00 PM', '03:30 PM', '04:30 PM'],
    isActive: true,
  },
  {
    id: 4,
    name: 'Dr. Emily Brown',
    specialization: 'Pediatrics',
    gender: 'female',
    location: 'Floor 3, Room 301',
    phone: '+1 234-567-8903',
    email: 'emily.brown@clinic.com',
    availableSlots: ['09:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'],
    isActive: true,
  },
]

let mockQueue = [
  { id: 1, patientName: 'John Doe', queueNumber: 1, status: 'waiting', phone: '+1 555-0101' },
  { id: 2, patientName: 'Jane Smith', queueNumber: 2, status: 'with-doctor', phone: '+1 555-0102' },
  { id: 3, patientName: 'Bob Johnson', queueNumber: 3, status: 'waiting', phone: '+1 555-0103' },
]

let mockAppointments = [
  {
    id: 1,
    patientName: 'Alice Johnson',
    doctorId: 1,
    doctorName: 'Dr. John Smith',
    specialization: 'Cardiology',
    appointmentDate: '2025-07-31',
    appointmentTime: '09:00 AM',
    status: 'scheduled',
    phone: '+1 555-0201',
  },
  {
    id: 2,
    patientName: 'Bob Wilson',
    doctorId: 2,
    doctorName: 'Dr. Sarah Johnson',
    specialization: 'Dermatology',
    appointmentDate: '2025-07-31',
    appointmentTime: '10:00 AM',
    status: 'scheduled',
    phone: '+1 555-0202',
  },
  {
    id: 3,
    patientName: 'Carol Davis',
    doctorId: 3,
    doctorName: 'Dr. Mike Wilson',
    specialization: 'Orthopedics',
    appointmentDate: '2025-08-01',
    appointmentTime: '02:00 PM',
    status: 'scheduled',
    phone: '+1 555-0203',
  },
]

// Mock delay to simulate network requests
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock success response helper
const mockResponse = (data: any, message: string = 'Success') => ({
  statusCode: 200,
  message,
  data
})

// Auth API - Mock Implementation
export const authAPI = {
  login: async (email: string, password: string) => {
    await mockDelay(300)
    
    // Mock authentication - any email/password works!
    if (email && password) {
      return mockResponse({
        access_token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 1,
          name: 'Admin User',
          email: email,
          role: 'admin'
        }
      }, 'Login successful')
    }
    
    throw new Error('Invalid credentials')
  },
}

// Doctors API - Mock Implementation
export const doctorsAPI = {
  getAll: async (filters: { search?: string; specialization?: string; location?: string } = {}) => {
    await mockDelay()
    
    let filteredDoctors = [...mockDoctors]
    
    if (filters.search) {
      filteredDoctors = filteredDoctors.filter(doctor => 
        doctor.name.toLowerCase().includes(filters.search!.toLowerCase())
      )
    }
    
    if (filters.specialization) {
      filteredDoctors = filteredDoctors.filter(doctor => 
        doctor.specialization.toLowerCase() === filters.specialization!.toLowerCase()
      )
    }
    
    if (filters.location) {
      filteredDoctors = filteredDoctors.filter(doctor => 
        doctor.location.toLowerCase().includes(filters.location!.toLowerCase())
      )
    }
    
    return mockResponse(filteredDoctors, 'Doctors retrieved successfully')
  },
  
  getById: async (id: number) => {
    await mockDelay()
    const doctor = mockDoctors.find(d => d.id === id)
    if (!doctor) throw new Error('Doctor not found')
    return mockResponse(doctor, 'Doctor retrieved successfully')
  },
  
  create: async (doctorData: any) => {
    await mockDelay()
    const newDoctor = {
      id: Date.now(), // Use timestamp as ID
      ...doctorData,
      isActive: true,
    }
    mockDoctors.push(newDoctor)
    return mockResponse(newDoctor, 'Doctor created successfully')
  },
  
  update: async (id: number, doctorData: any) => {
    await mockDelay()
    const index = mockDoctors.findIndex(d => d.id === id)
    if (index === -1) throw new Error('Doctor not found')
    
    mockDoctors[index] = { ...mockDoctors[index], ...doctorData }
    return mockResponse(mockDoctors[index], 'Doctor updated successfully')
  },
  
  delete: async (id: number) => {
    await mockDelay()
    const index = mockDoctors.findIndex(d => d.id === id)
    if (index === -1) throw new Error('Doctor not found')
    
    mockDoctors[index].isActive = false
    return mockResponse(null, 'Doctor deleted successfully')
  },
  
  getAvailableSlots: async (id: number, date: string) => {
    await mockDelay()
    const doctor = mockDoctors.find(d => d.id === id)
    if (!doctor) throw new Error('Doctor not found')
    return mockResponse(doctor.availableSlots, 'Available slots retrieved successfully')
  },
}

// Queue API - Mock Implementation
export const queueAPI = {
  getAll: async () => {
    await mockDelay()
    return mockResponse(mockQueue, 'Queue retrieved successfully')
  },
  
  getCurrent: async () => {
    await mockDelay()
    const stats = {
      waiting: mockQueue.filter(p => p.status === 'waiting').length,
      'with-doctor': mockQueue.filter(p => p.status === 'with-doctor').length,
      completed: mockQueue.filter(p => p.status === 'completed').length,
    }
    return mockResponse({ queue: mockQueue, stats }, 'Current queue retrieved successfully')
  },
  
  getStats: async () => {
    await mockDelay()
    const stats = {
      waiting: mockQueue.filter(p => p.status === 'waiting').length,
      'with-doctor': mockQueue.filter(p => p.status === 'with-doctor').length,
      completed: mockQueue.filter(p => p.status === 'completed').length,
      total: mockQueue.length,
    }
    return mockResponse(stats, 'Queue stats retrieved successfully')
  },
  
  addPatient: async (patientData: { patientName: string; phone?: string }) => {
    await mockDelay()
    const newPatient = {
      id: Date.now(),
      queueNumber: mockQueue.length + 1,
      status: 'waiting' as const,
      patientName: patientData.patientName,
      phone: patientData.phone || '',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    mockQueue.push(newPatient)
    return mockResponse(newPatient, 'Patient added to queue successfully')
  },
  
  updateStatus: async (id: number, status: string) => {
    await mockDelay()
    const index = mockQueue.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Patient not found in queue')
    
    mockQueue[index].status = status as any
    return mockResponse(mockQueue[index], 'Queue status updated successfully')
  },
  
  remove: async (id: number) => {
    await mockDelay()
    const index = mockQueue.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Patient not found in queue')
    
    mockQueue.splice(index, 1)
    return mockResponse(null, 'Patient removed from queue successfully')
  },
}

// Appointments API - Mock Implementation
export const appointmentsAPI = {
  getAll: async (filters: { search?: string; doctorId?: number; date?: string; status?: string } = {}) => {
    await mockDelay()
    
    let filteredAppointments = [...mockAppointments]
    
    if (filters.search) {
      filteredAppointments = filteredAppointments.filter(appointment => 
        appointment.patientName.toLowerCase().includes(filters.search!.toLowerCase()) ||
        appointment.doctorName.toLowerCase().includes(filters.search!.toLowerCase())
      )
    }
    
    if (filters.doctorId) {
      filteredAppointments = filteredAppointments.filter(appointment => 
        appointment.doctorId === filters.doctorId
      )
    }
    
    if (filters.date) {
      filteredAppointments = filteredAppointments.filter(appointment => 
        appointment.appointmentDate === filters.date
      )
    }
    
    if (filters.status) {
      filteredAppointments = filteredAppointments.filter(appointment => 
        appointment.status === filters.status
      )
    }
    
    return mockResponse(filteredAppointments, 'Appointments retrieved successfully')
  },
  
  getToday: async () => {
    await mockDelay()
    const today = new Date().toISOString().split('T')[0]
    const todayAppointments = mockAppointments.filter(appointment => 
      appointment.appointmentDate === today
    )
    return mockResponse(todayAppointments, 'Today\'s appointments retrieved successfully')
  },
  
  getStats: async () => {
    await mockDelay()
    const today = new Date().toISOString().split('T')[0]
    const stats = {
      total: mockAppointments.length,
      today: mockAppointments.filter(a => a.appointmentDate === today).length,
      scheduled: mockAppointments.filter(a => a.status === 'scheduled').length,
      completed: mockAppointments.filter(a => a.status === 'completed').length,
      cancelled: mockAppointments.filter(a => a.status === 'cancelled').length,
    }
    return mockResponse(stats, 'Appointment stats retrieved successfully')
  },
  
  create: async (appointmentData: any) => {
    await mockDelay()
    const doctor = mockDoctors.find(d => d.id === appointmentData.doctorId)
    const newAppointment = {
      id: Date.now(),
      doctorName: doctor?.name || 'Unknown Doctor',
      specialization: doctor?.specialization || 'Unknown',
      status: 'scheduled',
      ...appointmentData,
    }
    mockAppointments.push(newAppointment)
    return mockResponse(newAppointment, 'Appointment created successfully')
  },
  
  update: async (id: number, appointmentData: any) => {
    await mockDelay()
    const index = mockAppointments.findIndex(a => a.id === id)
    if (index === -1) throw new Error('Appointment not found')
    
    const doctor = mockDoctors.find(d => d.id === appointmentData.doctorId)
    if (doctor) {
      appointmentData.doctorName = doctor.name
      appointmentData.specialization = doctor.specialization
    }
    
    mockAppointments[index] = { ...mockAppointments[index], ...appointmentData }
    return mockResponse(mockAppointments[index], 'Appointment updated successfully')
  },
  
  cancel: async (id: number) => {
    await mockDelay()
    const index = mockAppointments.findIndex(a => a.id === id)
    if (index === -1) throw new Error('Appointment not found')
    
    mockAppointments.splice(index, 1)
    return mockResponse(null, 'Appointment cancelled successfully')
  },
}

// Dashboard API - Mock Implementation
export const dashboardAPI = {
  getStats: async () => {
    await mockDelay()
    const today = new Date().toISOString().split('T')[0]
    const stats = {
      totalDoctors: mockDoctors.filter(d => d.isActive).length,
      todayAppointments: mockAppointments.filter(a => a.appointmentDate === today).length,
      patientsInQueue: mockQueue.filter(p => p.status === 'waiting').length,
      completedToday: mockAppointments.filter(a => a.appointmentDate === today && a.status === 'completed').length,
    }
    return mockResponse(stats, 'Dashboard stats retrieved successfully')
  },
}