// Mock Data for Development
// Toggle this flag to switch between mock and real API
export const USE_MOCK_DATA = true;

// Helper to simulate API delay
export const mockDelay = (ms = 800) => 
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock Users Data
export const MOCK_USERS = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
  },
];

// Mock Auth Response
export const MOCK_AUTH_USER = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  token: 'mock-jwt-token-12345',
};

// Mock Products Data (example)
export const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Product 1',
    price: 99.99,
    description: 'This is product 1',
    image: 'https://via.placeholder.com/300',
  },
  {
    id: 2,
    name: 'Product 2',
    price: 149.99,
    description: 'This is product 2',
    image: 'https://via.placeholder.com/300',
  },
];

// Add more mock data as needed for different features
// Mock Home Dashboard Data
export const MOCK_HOME_DATA = {
  dashboard: {
    news: [
      {
        id: 1,
        title: 'Company Achieves Record Q4 Results',
        description: 'We are thrilled to announce that our company has achieved record-breaking results in Q4 2025, exceeding all expectations.',
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
        date: '2026-02-08',
        category: 'Company News',
      },
      {
        id: 2,
        title: 'New Product Launch: Innovation 2026',
        description: 'Introducing our latest innovation that will revolutionize the industry. Join us for the virtual launch event.',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
        date: '2026-02-09',
        category: 'Product',
      },
      {
        id: 3,
        title: 'Team Building Event This Weekend',
        description: 'Join us for an exciting team building retreat. Activities include workshops, outdoor games, and networking.',
        image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
        date: '2026-02-10',
        category: 'Events',
      },
    ],
    quickLinks: [
      { id: 1, name: 'Apply Leave', icon: '📅', link: '/leave/apply' },
      { id: 2, name: 'View Payslip', icon: '💰', link: '/payroll/payslip' },
      { id: 3, name: 'Submit Timesheet', icon: '⏰', link: '/timesheet' },
      { id: 4, name: 'IT Support', icon: '💻', link: '/support/it' },
      { id: 5, name: 'Employee Directory', icon: '👥', link: '/people' },
      { id: 6, name: 'Policies', icon: '📋', link: '/policies' },
    ],
    events: [
      {
        id: 1,
        title: 'All Hands Meeting',
        date: '2026-02-15',
        time: '10:00 AM',
        location: 'Conference Hall A',
        attendees: 45,
      },
      {
        id: 2,
        title: 'Tech Talk: AI & ML',
        date: '2026-02-18',
        time: '2:00 PM',
        location: 'Virtual',
        attendees: 120,
      },
      {
        id: 3,
        title: 'Town Hall Q&A',
        date: '2026-02-22',
        time: '11:00 AM',
        location: 'Main Auditorium',
        attendees: 200,
      },
      {
        id: 4,
        title: 'Wellness Workshop',
        date: '2026-02-25',
        time: '4:00 PM',
        location: 'Online',
        attendees: 80,
      },
    ],
    newJoinees: [
      {
        id: 1,
        name: 'Sarah Johnson',
        position: 'Senior Developer',
        department: 'Engineering',
        joinDate: '2026-02-01',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      },
      {
        id: 2,
        name: 'Michael Chen',
        position: 'Product Manager',
        department: 'Product',
        joinDate: '2026-02-03',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      },
      {
        id: 3,
        name: 'Emily Davis',
        position: 'UX Designer',
        department: 'Design',
        joinDate: '2026-02-05',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      },
      {
        id: 4,
        name: 'Rahul Mehta',
        position: 'Business Analyst',
        department: 'Strategy',
        joinDate: '2026-02-07',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
      },
    ],
    courses: [
      {
        id: 1,
        title: 'Advanced JavaScript Patterns',
        instructor: 'John Smith',
        progress: 65,
        totalLessons: 24,
        completedLessons: 15,
        thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
        deadline: '2026-03-15',
      },
      {
        id: 2,
        title: 'Leadership & Management',
        instructor: 'Dr. Jane Wilson',
        progress: 40,
        totalLessons: 18,
        completedLessons: 7,
        thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
        deadline: '2026-03-20',
      },
      {
        id: 3,
        title: 'Data Analytics Fundamentals',
        instructor: 'Robert Taylor',
        progress: 85,
        totalLessons: 20,
        completedLessons: 17,
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
        deadline: '2026-02-28',
      },
    ],
    birthdays: [
      {
        id: 1,
        name: 'Alex Martinez',
        position: 'HR Manager',
        department: 'Human Resources',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        date: '2026-02-10',
      },
      {
        id: 2,
        name: 'Lisa Anderson',
        position: 'Marketing Lead',
        department: 'Marketing',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
        date: '2026-02-10',
      },
      {
        id: 3,
        name: 'Sanjay Patel',
        position: 'Operations Manager',
        department: 'Operations',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sanjay',
        date: '2026-02-10',
      },
      {
        id: 4,
        name: 'Priya Sharma',
        position: 'QA Engineer',
        department: 'Quality Assurance',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        date: '2026-02-10',
      },
    ],
    anniversaries: [
      {
        id: 1,
        name: 'David Brown',
        position: 'Senior Engineer',
        department: 'Engineering',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
        yearsCompleted: 5,
        joinDate: '2021-02-10',
      },
      {
        id: 2,
        name: 'Rachel Green',
        position: 'Finance Director',
        department: 'Finance',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel',
        yearsCompleted: 3,
        joinDate: '2023-02-10',
      },
      {
        id: 3,
        name: 'Anita Desai',
        position: 'HR Business Partner',
        department: 'Human Resources',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anita',
        yearsCompleted: 2,
        joinDate: '2024-02-10',
      },
    ],
  },
  news: [],
  quickLinks: [],
  events: [],
  newJoinees: [],
  courses: [],
  birthdays: [],
  anniversaries: [],
};
// Mock News Data (Extended)
export const MOCK_NEWS_DATA = [
  {
    id: 1,
    title: 'AIA receives Best Go Green Initiative Award',
    description: 'We are proud to announce that AIA Engineering has been honored with the Best Go Green Initiative Award at the Net Zero Summit and Awards. This award is a recognition of our commitment towards sustainable practices and environmental responsibility.',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
    date: '2026-03-11',
    category: 'Important',
  },
  {
    id: 2,
    title: 'Company Achieves Record Q4 Results',
    description: 'We are thrilled to announce that our company has achieved record-breaking results in Q4 2025, exceeding all expectations and setting new benchmarks for growth.',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
    date: '2026-02-08',
    category: 'Company News',
  },
  {
    id: 3,
    title: 'New Product Launch: Innovation 2026',
    description: 'Introducing our latest innovation that will revolutionize the industry. Join us for the virtual launch event on March 15th.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
    date: '2026-02-09',
    category: 'Product',
  },
  {
    id: 4,
    title: 'Team Building Event This Weekend',
    description: 'Join us for an exciting team building retreat. Activities include workshops, outdoor games, and networking opportunities.',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
    date: '2026-02-10',
    category: 'Events',
  },
  {
    id: 5,
    title: 'Annual Town Hall Meeting Announced',
    description: 'CEO will address all employees in the upcoming town hall meeting. Topics include company vision, strategic goals, and Q&A session.',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    date: '2026-02-12',
    category: 'Announcements',
  },
  {
    id: 6,
    title: 'Employee Wellness Program Launch',
    description: 'New comprehensive wellness program offers fitness classes, mental health support, and nutrition counseling for all employees.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    date: '2026-02-14',
    category: 'Company News',
  },
  {
    id: 7,
    title: 'Innovation Lab Opens New Facility',
    description: 'State-of-the-art research facility dedicated to developing cutting-edge solutions and fostering innovation.',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
    date: '2026-02-16',
    category: 'Product',
  },
  {
    id: 8,
    title: 'Sustainability Report 2025 Released',
    description: 'Our annual sustainability report highlights achievements in reducing carbon footprint and implementing green initiatives.',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
    date: '2026-02-18',
    category: 'Important',
  },
  {
    id: 9,
    title: 'Global Expansion: New Office in Singapore',
    description: 'Expanding our presence in Asia Pacific with a new regional headquarters in Singapore, creating 200+ jobs.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    date: '2026-02-20',
    category: 'Company News',
  },
  {
    id: 10,
    title: 'Tech Conference 2026 Registration Open',
    description: 'Annual technology conference featuring industry leaders, workshops, and networking opportunities. Early bird registration now available.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    date: '2026-02-22',
    category: 'Events',
  },
];