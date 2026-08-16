import React, { createContext, useState, useEffect } from 'react';

// --- Initial Dummy Data ---
const initialData = {
  content: {
    heroOverline: 'GeeksforGeeks College Chapter',
    heroHeadline1: 'We Build',
    heroHeadline2: 'The Future',
    heroSubcopy: 'A community of builders, thinkers, and problem-solvers pushing the boundaries of code, design, and innovation.',
    marqueeText: 'INNOVATE • CREATE • BUILD • CODE • LEARN • COMPETE • COLLABORATE • SHIP • ',
    
    aboutLabel: 'About',
    aboutHeadline: 'More than\na club',
    aboutMissionHeadline: 'Mission',
    aboutMission: 'We bridge the gap between classroom theory and real-world engineering. Through hands-on workshops, competitive programming, and open-source contributions, we build developers who are industry-ready from day one.',
    aboutFocusHeadline: 'Focus Areas',
    aboutOpenHeadline: 'Open to',
    aboutOpenSubHeadline1: 'All Years &',
    aboutOpenSubHeadline2: 'All Branches',
    aboutOpenFooter: 'No prerequisites. Just curiosity.',

    eventsLabel: 'SCHEDULE',
    eventsHeadline: 'Upcoming &\nPast Events',
    
    galleryLabel: 'Gallery',
    galleryHeadline: 'Moments\nthat matter',
    
    facultyLabel: 'Faculty',
    facultyHeadline: 'Our\nMentors',
    
    teamLabel: 'Team',
    teamHeadline: 'The Core\nCrew',
    
    contactLabel: 'Contact',
    contactHeadline: 'Let\'s\nTalk',
    contactSubcopy: 'Ready to build something together? Drop us a message or join our Discord.',
    footerCopyright: '© 2026 GFG Club.',
  },
  stats: [
    { id: '1', value: 'EST. 2024', label: 'Founded' },
    { id: '2', value: '50+', label: 'Active Members' },
    { id: '3', value: '12', label: 'Projects Shipped' },
    { id: '4', value: '25+', label: 'Events Hosted' },
  ],
  focusAreas: [
    { id: '1', label: 'DSA' },
    { id: '2', label: 'Web Dev' },
    { id: '3', label: 'System Design' },
    { id: '4', label: 'Open Source' },
    { id: '5', label: 'ML/AI' },
    { id: '6', label: 'Competitive Programming' }
  ],
  events: [
    { 
      id: '1', 
      date: '2026-08-28', 
      title: 'NIRVANA – The Mega Fest 🌟 📌 Theme: Summer Aesthetic', 
      time: '10:00 AM', 
      location: 'KDKCE Main Ground', 
      type: 'Mega Fest', 
      status: 'Upcoming', 
      description: 'The flagship annual festival featuring tech competitions, project exhibitions, gaming arena, and musical showcases.',
      link: '#'
    },
    { 
      id: '2', 
      date: '2026-08-28', 
      title: 'NIRVANA FLASH MOB 2026 ✨', 
      time: '02:30 PM', 
      location: 'Central Courtyard', 
      type: 'Cultural', 
      status: 'Upcoming', 
      description: 'High-energy surprise flash mob performance by the GFG creative troupe.',
      link: '#'
    },
    { 
      id: '3', 
      date: '2026-08-15', 
      title: 'NIRVANA STUDENT PARLIAMENT 2026', 
      time: '11:00 AM', 
      location: 'Auditorium 1', 
      type: 'Leadership', 
      status: 'Completed', 
      description: 'Student body forum to discuss tech club initiatives and roadmap for the academic year.',
      link: '#'
    },
    { 
      id: '4', 
      date: '2026-09-05', 
      title: 'Workshop: React & Full-Stack Architecture', 
      time: '10:30 AM', 
      location: 'Lab 3, CS Dept', 
      type: 'Workshop', 
      status: 'Upcoming', 
      description: 'Hands-on frontend engineering session covering state management, performance optimization, and APIs.',
      link: '#'
    },
    { 
      id: '5', 
      date: '2026-09-18', 
      title: 'Hackathon — Code for Change 🚀', 
      time: '09:00 AM', 
      location: 'Innovation Hub', 
      type: 'Competition', 
      status: 'Registration Open', 
      description: '24-hour national hackathon challenging student engineers to build impactful solutions.',
      link: '#'
    },
  ],
  faculty: [
    { 
      id: '1', 
      name: 'Dr. Jane Doe', 
      role: 'FACULTY ADVISOR', 
      image: '', 
      description: 'Guiding the team with academic and industry experience.',
      email: 'jane.doe@example.com',
      branch: 'Computer Science',
      domain: 'Advisory',
      linkedin: '#',
      github: '#',
      instagram: '#'
    }
  ],
  team: [
    { 
      id: '1', 
      name: 'Alex Rivera', 
      role: 'PRESIDENT', 
      image: '', 
      level: 'CORE TEAM',
      description: 'Senior Computer Science major passionate about scalable backend architecture and open-source contributions.',
      email: 'alex@example.com',
      branch: 'Computer Science',
      domain: 'Backend / Systems',
      linkedin: '#',
      github: '#',
      instagram: '#'
    },
    { 
      id: '2', 
      name: 'Sam Chen', 
      role: 'VICE PRESIDENT', 
      image: '', 
      level: 'CORE TEAM',
      description: '',
      email: '',
      branch: 'Information Technology',
      domain: 'Full Stack',
      linkedin: '',
      github: '',
      instagram: ''
    },
    { 
      id: '3', 
      name: 'Jordan Lee', 
      role: 'SECRETARY', 
      image: '', 
      level: 'CORE TEAM',
      description: '',
      email: '',
      branch: 'Data Science',
      domain: 'Machine Learning',
      linkedin: '',
      github: '',
      instagram: ''
    },
    { 
      id: '4', 
      name: 'Taylor Swift', 
      role: 'HEAD OF DEV', 
      image: '', 
      level: 'HEADS',
      description: '',
      email: '',
      branch: 'Computer Science',
      domain: 'Frontend',
      linkedin: '',
      github: '',
      instagram: ''
    },
  ],
  gallery: [
    { id: '1', label: 'Hackathon 2024', span: 'col-span-2 row-span-2', media: '' },
    { id: '2', label: 'Workshop', span: 'col-span-1 row-span-1', media: '' },
  ]
};

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const localData = localStorage.getItem('gfg_club_data');
    if (localData) {
      // Merge with initialData to ensure new keys exist for backwards compatibility
      const parsed = JSON.parse(localData);
      return { 
        ...initialData, 
        ...parsed, 
        content: { ...initialData.content, ...(parsed.content || {}) },
        faculty: parsed.faculty || initialData.faculty,
        events: (parsed.events && parsed.events.length > 0)
          ? parsed.events.map(ev => ({
              time: '10:00 AM',
              location: 'KDKCE',
              description: '',
              link: '#',
              type: 'Event',
              status: 'Upcoming',
              ...ev
            }))
          : initialData.events
      };
    }
    return initialData;
  });

  useEffect(() => {
    localStorage.setItem('gfg_club_data', JSON.stringify(data));
  }, [data]);

  // --- CRUD Operations ---
  const updateContent = (key, value) => {
    setData(prev => ({
      ...prev,
      content: { ...prev.content, [key]: value }
    }));
  };

  const addItem = (category, item) => {
    setData(prev => ({ ...prev, [category]: [...prev[category], { ...item, id: Date.now().toString() }] }));
  };

  const updateItem = (category, id, updatedItem) => {
    setData(prev => ({
      ...prev,
      [category]: prev[category].map(item => item.id === id ? { ...item, ...updatedItem } : item),
    }));
  };

  const deleteItem = (category, id) => {
    setData(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== id),
    }));
  };

  const reorderItems = (category, reorderedArray) => {
    setData(prev => ({
      ...prev,
      [category]: reorderedArray
    }));
  };

  return (
    <DataContext.Provider value={{ data, updateContent, addItem, updateItem, deleteItem, reorderItems }}>
      {children}
    </DataContext.Provider>
  );
};
