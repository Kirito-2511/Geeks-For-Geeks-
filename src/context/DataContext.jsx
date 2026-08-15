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

    eventsLabel: 'Events',
    eventsHeadline: 'What\'s\nhappening',
    
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
    { id: '1', date: 'AUG 28', title: 'Workshop: React Fundamentals', type: 'Workshop', status: 'Upcoming' },
    { id: '2', date: 'SEP 05', title: 'Hackathon — Code for Change', type: 'Competition', status: 'Registration Open' },
    { id: '3', date: 'SEP 12', title: 'Tech Talk: System Design at Scale', type: 'Talk', status: 'Upcoming' },
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
        faculty: parsed.faculty || initialData.faculty
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
