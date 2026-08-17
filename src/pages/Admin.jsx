import React, { useState, useContext, useRef } from 'react';
import { DataContext } from '../context/DataContext';
import { sanitizeUrl } from '../utils/sanitize';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { storage, auth, db } from '../firebase';
import seedData from '../data/seed.json';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Custom Sortable Row Component
function SortableRow({ item, keys, activeTab, onDelete, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-brand/10 hover:bg-brand/[0.02] ${isDragging ? 'bg-brand/5 shadow-md' : ''} bg-canvas`}
    >
      {/* Drag Handle */}
      <td className="p-4 w-10 text-center cursor-grab active:cursor-grabbing text-brand/30 hover:text-brand" {...attributes} {...listeners}>
        ⠿
      </td>

      {/* File Thumbnail */}
      {(activeTab === 'team' || activeTab === 'gallery' || activeTab === 'faculty') && (
        <td className="p-4 w-16">
          {(item.image || item.media) ? (
            <div className="w-10 h-10 bg-brand/10 rounded overflow-hidden flex items-center justify-center">
              {(item.image || item.media).startsWith('data:video') ? (
                <video src={item.image || item.media} className="w-full h-full object-cover" muted />
              ) : (
                <img src={item.image || item.media} className="w-full h-full object-cover" alt="thumbnail" />
              )}
            </div>
          ) : (
            <div className="w-10 h-10 bg-brand/5 rounded flex items-center justify-center text-brand/20 text-xs">
              NO IMG
            </div>
          )}
        </td>
      )}

      {/* Data Cells */}
      {keys.map(key => (
        <td key={key} className="p-4 text-sm font-medium text-brand truncate max-w-[150px]">
          {item[key]}
        </td>
      ))}

      {/* Actions */}
      <td className="p-4 text-right">
        <button
          onClick={() => onEdit(item)}
          className="text-xs font-bold uppercase tracking-widest text-accent hover:text-brand transition-colors mr-4"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(activeTab, item.id)}
          className="text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-400 transition-colors"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('content');
  const [editingId, setEditingId] = useState(null);

  const { data, updateContent, addItem, updateItem, deleteItem, reorderItems } = useContext(DataContext);
  const [formData, setFormData] = useState({});
  const fileInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Auth Error:", error.message);
      alert("Invalid admin credentials.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6 bg-canvas">
        <p className="text-sm font-bold uppercase tracking-widest text-brand/40 animate-pulse">Verifying…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6 bg-canvas">
        <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-6">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-brand text-center">
            Admin Login
          </h1>
          <input
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border-b border-brand/20 px-0 py-4 text-lg font-bold uppercase tracking-widest text-brand placeholder:text-brand/30 outline-none focus:border-accent transition-colors rounded-none text-center"
          />
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-b border-brand/20 px-0 py-4 text-lg font-bold uppercase tracking-widest text-brand placeholder:text-brand/30 outline-none focus:border-accent transition-colors rounded-none text-center"
          />
          <button type="submit" className="w-full py-4 bg-brand text-canvas font-bold uppercase tracking-widest hover:bg-accent transition-colors">
            Enter
          </button>
        </form>
      </div>
    );
  }

  if (!data?.content || Object.keys(data.content).length === 0) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center p-6 bg-canvas text-center">
        <h2 className="text-3xl font-black uppercase text-brand mb-4">Database is Empty</h2>
        <p className="text-brand/60 mb-8 max-w-md">Your Firebase database has not been initialized yet. Click the button below to seed the database with the default GeeksforGeeks template data.</p>
        <button
          onClick={async () => {
            try {
              await setDoc(doc(db, 'clubData', 'master'), seedData);
              alert('Database initialized successfully!');
            } catch (err) {
              console.error(err);
              alert('Failed to initialize. Check console.');
            }
          }}
          className="px-8 py-4 bg-brand text-canvas font-bold uppercase tracking-widest hover:bg-accent transition-colors border border-brand/20"
        >
          Initialize Database
        </button>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdateItem = async (e) => {
    e.preventDefault();
    const itemData = { ...formData };

    // Sanitize URL fields before saving
    const urlFields = ['linkedin', 'github', 'instagram', 'link', 'image', 'media'];
    urlFields.forEach((field) => {
      if (itemData[field]) {
        itemData[field] = sanitizeUrl(itemData[field]);
      }
    });

    if (activeTab === 'team' || activeTab === 'faculty') {
      if (activeTab === 'team' && !itemData.level) itemData.level = 'MEMBERS'; // default
    } else if (activeTab === 'gallery') {
      if (!itemData.eventTitle) itemData.eventTitle = 'Event 1: Highlights';
      itemData.span = 'col-span-1 row-span-1';
    }

    if (editingId) {
      updateItem(activeTab, editingId, itemData);
      setEditingId(null);
    } else {
      addItem(activeTab, itemData);
    }

    setFormData({});
  };

  const initiateEdit = (item) => {
    setEditingId(item.id);
    const formCopy = { ...item };
    delete formCopy.id;
    setFormData(formCopy);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const items = data[activeTab];
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const reorderedArray = arrayMove(items, oldIndex, newIndex);
      reorderItems(activeTab, reorderedArray);
    }
  };

  const renderTable = (items) => {
    if (!items || items.length === 0) return <p className="text-brand/50 uppercase tracking-widest text-sm py-4">No items found.</p>;

    // For Team and Events, only show essential keys in table so it doesn't overflow
    const ignoreKeys = ['id', 'image', 'media', 'bg', 'span', 'description', 'linkedin', 'github', 'instagram', 'email', 'link'];
    const keys = Object.keys(items[0]).filter(k => !ignoreKeys.includes(k));

    return (
      <div className="overflow-x-auto w-full">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-brand/20 text-[10px] font-bold uppercase tracking-widest text-brand/40">
                <th className="p-4 w-10"></th>
                {(activeTab === 'team' || activeTab === 'gallery' || activeTab === 'faculty') && <th className="p-4 w-16">FILE</th>}
                {keys.map(key => <th key={key} className="p-4">{key}</th>)}
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                {items.map(item => (
                  <SortableRow
                    key={item.id}
                    item={item}
                    keys={keys}
                    activeTab={activeTab}
                    onDelete={deleteItem}
                    onEdit={initiateEdit}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>
    );
  };

  const formFields = {
    events: ['title', 'date', 'time', 'location', 'type', 'status', 'description', 'link'],
    team: ['name', 'role', 'branch', 'domain', 'email', 'linkedin', 'github', 'instagram', 'description'],
    faculty: ['name', 'role', 'branch', 'domain', 'email', 'linkedin', 'github', 'instagram', 'description'],
    gallery: ['eventTitle', 'label'],
    stats: ['value', 'label'],
    focusAreas: ['label']
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-canvas flex flex-col md:flex-row">
      {/* Sidebar Nav */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-brand/10 p-6 flex flex-col gap-4">
        {['content', 'stats', 'focusAreas', 'events', 'faculty', 'team', 'gallery'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              cancelEdit();
            }}
            className={`text-left text-sm font-bold uppercase tracking-widest py-3 border-b transition-colors ${activeTab === tab ? 'text-brand border-brand' : 'text-brand/40 border-brand/5 hover:text-brand'}`}
          >
            {tab}
          </button>
        ))}

        <button
          onClick={handleLogout}
          className="mt-auto text-left text-xs font-bold uppercase tracking-widest py-3 text-red-600 hover:text-red-700 transition-colors border-t border-brand/10 pt-6"
        >
          [ Log Out ]
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-brand">Manage {activeTab}</h2>
          {activeTab === 'events' && (
            <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
              📅 Calendar Highlighting Enabled
            </span>
          )}
        </div>

        {activeTab === 'content' ? (
          <div className="space-y-12">
            {/* Sort keys so they appear in a logical, stable order */}
            {(() => {
              const CONTENT_ORDER = [
                // Hero
                'heroOverline', 'heroHeadline1', 'heroHeadline2', 'heroSubcopy', 'marqueeText',
                // About
                'aboutLabel', 'aboutHeadline', 'aboutMissionHeadline', 'aboutMission', 'aboutMissionSubcopy', 
                'aboutVisionHeadline', 'aboutVisionSubcopy', 'aboutFocusHeadline', 'aboutOpenHeadline', 
                'aboutOpenSubHeadline1', 'aboutOpenSubHeadline2', 'aboutOpenFooter',
                // Events
                'eventsLabel', 'eventsHeadline',
                // Gallery
                'galleryLabel', 'galleryHeadline',
                // Faculty
                'facultyLabel', 'facultyHeadline',
                // Team
                'teamLabel', 'teamHeadline',
                // Contact
                'contactLabel', 'contactHeadline', 'contactSubcopy', 'email',
                // Socials & Footer
                'socialDiscord', 'socialInstagram', 'socialLinkedin', 'socialGithub', 'footerCopyright'
              ];

              const orderedKeys = [
                ...CONTENT_ORDER,
                ...Object.keys(data.content).filter(k => !CONTENT_ORDER.includes(k))
              ];

              return orderedKeys.map((key) => {
                const value = data.content[key] || ''; // Fallback to empty string if undefined
                return (
                  <div key={key} className="border-b border-brand/20 pb-4">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-brand/50 mb-2">{key}</label>
                    {value.length > 50 || value.includes('\n') ? (
                      <textarea
                        value={value}
                        onChange={(e) => updateContent(key, e.target.value)}
                        rows={4}
                        className="w-full bg-transparent border border-brand/20 p-4 text-sm font-bold uppercase tracking-widest text-brand outline-none focus:border-accent transition-colors rounded-none resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateContent(key, e.target.value)}
                        className="w-full bg-transparent border-b border-brand/20 px-0 py-3 text-sm font-bold uppercase tracking-widest text-brand outline-none focus:border-accent transition-colors rounded-none"
                      />
                    )}
                  </div>
                );
              });
            })()}
          </div>
        ) : (
          <>
            {/* Add / Edit Form */}
            <div className={`mb-12 border p-6 transition-colors ${editingId ? 'border-accent/40 bg-accent/[0.02]' : 'border-brand/20'}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand/40">
                  {editingId ? `EDITING ${activeTab} ITEM` : `ADD NEW ${activeTab}`}
                </h3>
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="text-[10px] font-bold uppercase tracking-widest text-brand/50 hover:text-brand">
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleAddOrUpdateItem} className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                {formFields[activeTab].map(field => {
                  if (field === 'description') {
                    return (
                      <div key={field} className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-brand/50 mb-1">
                          Description
                        </label>
                        <textarea
                          name={field}
                          placeholder="EVENT DETAILS / DESCRIPTION"
                          value={formData[field] || ''}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full bg-transparent border border-brand/20 p-4 text-sm font-medium text-brand placeholder:text-brand/30 outline-none focus:border-accent transition-colors rounded-none resize-none"
                        />
                      </div>
                    );
                  }

                  if (field === 'date') {
                    return (
                      <div key={field} className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-brand/50">
                          Date (Highlights Day on Calendar) *
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-transparent border-b border-brand/20 px-0 py-3 text-sm font-bold uppercase tracking-widest text-brand outline-none focus:border-accent transition-colors rounded-none"
                        />
                      </div>
                    );
                  }

                  if (field === 'status' && activeTab === 'events') {
                    return (
                      <div key={field} className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-brand/50">
                          Event Status
                        </label>
                        <select
                          name="status"
                          value={formData.status || 'Upcoming'}
                          onChange={handleInputChange}
                          className="w-full bg-transparent border-b border-brand/20 px-0 py-3 text-sm font-bold uppercase tracking-widest text-brand outline-none focus:border-accent transition-colors rounded-none cursor-pointer"
                        >
                          <option value="Upcoming">Upcoming</option>
                          <option value="Registration Open">Registration Open</option>
                          <option value="Live">Live / Happening Today</option>
                          <option value="Completed">Completed</option>
                          <option value="Postponed">Postponed</option>
                        </select>
                      </div>
                    );
                  }

                  if (field === 'type' && activeTab === 'events') {
                    return (
                      <div key={field} className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-brand/50">
                          Event Type / Category
                        </label>
                        <input
                          type="text"
                          name="type"
                          placeholder="E.G. MEGA FEST, WORKSHOP, TALK"
                          value={formData.type || ''}
                          onChange={handleInputChange}
                          list="event-types"
                          className="w-full bg-transparent border-b border-brand/20 px-0 py-3 text-sm font-bold uppercase tracking-widest text-brand placeholder:text-brand/30 outline-none focus:border-accent transition-colors rounded-none"
                        />
                        <datalist id="event-types">
                          <option value="Mega Fest" />
                          <option value="Workshop" />
                          <option value="Competition" />
                          <option value="Hackathon" />
                          <option value="Talk" />
                          <option value="Cultural" />
                          <option value="Leadership" />
                          <option value="Meetup" />
                        </datalist>
                      </div>
                    );
                  }

                  if (field === 'eventTitle' && activeTab === 'gallery') {
                    const eventSuggestions = Array.from(
                      new Set([
                        ...(data.events || []).map((e) => e.title),
                        ...(data.gallery || []).map((g) => g.eventTitle).filter(Boolean)
                      ])
                    );

                    return (
                      <div key={field} className="flex flex-col gap-1 sm:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-brand/50">
                          Event / Carousel Heading (e.g. "Event 1: NIRVANA 2026", "Event 2: Web Dev Bootcamp") *
                        </label>
                        <input
                          type="text"
                          name="eventTitle"
                          placeholder="E.G. EVENT 1"
                          value={formData.eventTitle || ''}
                          onChange={handleInputChange}
                          list="gallery-event-headings"
                          required
                          className="w-full bg-transparent border-b border-brand/20 px-0 py-3 text-sm font-bold uppercase tracking-widest text-brand placeholder:text-brand/30 outline-none focus:border-accent transition-colors rounded-none"
                        />
                        <datalist id="gallery-event-headings">
                          {eventSuggestions.map((t) => (
                            <option key={t} value={t} />
                          ))}
                        </datalist>
                      </div>
                    );
                  }

                  const isUrl = field === 'linkedin' || field === 'github' || field === 'instagram' || field === 'link';
                  const isEmail = field === 'email';
                  let type = 'text';
                  if (isUrl) type = 'url';
                  if (isEmail) type = 'email';

                  let placeholder = field.toUpperCase();
                  if (field === 'time') placeholder = 'TIME (E.G. 10:00 AM)';
                  if (field === 'location') placeholder = 'LOCATION / VENUE (E.G. KDKCE AUDITORIUM)';
                  if (field === 'link') placeholder = 'REGISTRATION / INFO LINK (OPTIONAL)';
                  if (field === 'label' && activeTab === 'gallery') placeholder = 'PHOTO CAPTION / LABEL (E.G. OPENING CEREMONY)';

                  return (
                    <div key={field} className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand/50">
                        {field === 'label' && activeTab === 'gallery' ? 'PHOTO CAPTION / LABEL' : field.toUpperCase()}
                      </label>
                      <input
                        type={type}
                        name={field}
                        placeholder={placeholder}
                        value={formData[field] || ''}
                        onChange={handleInputChange}
                        required={field === 'name' || field === 'role' || field === 'title' || field === 'label' || field === 'value'}
                        className="w-full bg-transparent border-b border-brand/20 px-0 py-3 text-sm font-bold uppercase tracking-widest text-brand placeholder:text-brand/30 outline-none focus:border-accent transition-colors rounded-none"
                      />
                    </div>
                  );
                })}

                {/* Team Level Dropdown */}
                {activeTab === 'team' && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand/50">Level</span>
                    <select
                      name="level"
                      value={formData.level || 'MEMBERS'}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-brand/20 px-0 py-3 text-sm font-bold uppercase tracking-widest text-brand outline-none focus:border-accent transition-colors rounded-none appearance-none cursor-pointer"
                    >
                      <option value="CORE TEAM">CORE TEAM</option>
                      <option value="HEADS">HEADS</option>
                      <option value="CO-HEADS">CO-HEADS</option>
                      <option value="MEMBERS">MEMBERS</option>
                    </select>
                  </div>
                )}

                {/* Image URL Input for Team, Faculty, and Gallery */}
                {(activeTab === 'team' || activeTab === 'gallery' || activeTab === 'faculty') && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand/50">
                      Image URL {(!editingId && (activeTab === 'team' || activeTab === 'faculty')) ? "(Optional)" : ""}
                    </span>
                    <input
                      type="url"
                      placeholder="HTTPS://IMGUR.COM/EXAMPLE.JPG"
                      value={formData[activeTab === 'gallery' ? 'media' : 'image'] || ''}
                      onChange={(e) => setFormData({ ...formData, [activeTab === 'gallery' ? 'media' : 'image']: e.target.value })}
                      required={!editingId && activeTab === 'gallery'}
                      className="w-full bg-transparent border-b border-brand/20 px-0 py-3 text-sm font-bold uppercase tracking-widest text-brand placeholder:text-brand/30 outline-none focus:border-accent transition-colors rounded-none"
                    />
                  </div>
                )}

                <div className="sm:col-span-2 flex justify-end mt-4">
                  <button type="submit" className={`px-8 py-4 text-canvas text-sm font-black uppercase tracking-widest transition-colors ${editingId ? 'bg-accent hover:bg-brand' : 'bg-brand hover:bg-accent'}`}>
                    {editingId ? 'UPDATE ITEM' : 'ADD ITEM'}
                  </button>
                </div>
              </form>
            </div>

            {/* Data Table */}
            <div className="border border-brand/20">
              {renderTable(data[activeTab])}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
