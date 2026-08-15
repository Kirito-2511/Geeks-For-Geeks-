import React, { useState, useContext, useRef } from 'react';
import { DataContext } from '../context/DataContext';
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

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') setIsAuthenticated(true);
    else alert('Incorrect password');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6 bg-canvas">
        <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-6">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-brand text-center">
            Admin Login
          </h1>
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, fileData: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOrUpdateItem = (e) => {
    e.preventDefault();
    const itemData = { ...formData };
    
    if (activeTab === 'team' || activeTab === 'faculty') {
      if (formData.fileData) itemData.image = formData.fileData;
      if (activeTab === 'team' && !itemData.level) itemData.level = 'MEMBERS'; // default
      delete itemData.fileData;
    } else if (activeTab === 'gallery') {
      if (formData.fileData) itemData.media = formData.fileData;
      itemData.span = 'col-span-1 row-span-1';
      delete itemData.fileData;
    }

    if (editingId) {
      updateItem(activeTab, editingId, itemData);
      setEditingId(null);
    } else {
      addItem(activeTab, itemData);
    }
    
    setFormData({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const initiateEdit = (item) => {
    setEditingId(item.id);
    const formCopy = { ...item };
    delete formCopy.id;
    // Don't carry over raw large base64 to input fields, but keep them for reference if needed
    setFormData(formCopy);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    
    // For Team, only show essential keys in table so it doesn't overflow
    const ignoreKeys = ['id', 'image', 'media', 'bg', 'span', 'description', 'linkedin', 'github', 'instagram', 'email'];
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
    events: ['date', 'title', 'type', 'status'],
    team: ['name', 'role', 'branch', 'domain', 'email', 'linkedin', 'github', 'instagram', 'description'], // Added new fields
    faculty: ['name', 'role', 'branch', 'domain', 'email', 'linkedin', 'github', 'instagram', 'description'],
    gallery: ['label'],
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
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 max-w-5xl">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-brand mb-10">Manage {activeTab}</h2>

        {activeTab === 'content' ? (
          <div className="space-y-12">
            {Object.entries(data.content).map(([key, value]) => (
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
            ))}
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
                        <textarea
                          name={field}
                          placeholder={field.toUpperCase()}
                          value={formData[field] || ''}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full bg-transparent border border-brand/20 p-4 text-sm font-bold uppercase tracking-widest text-brand placeholder:text-brand/30 outline-none focus:border-accent transition-colors rounded-none resize-none"
                        />
                      </div>
                    );
                  }
                  
                  const isUrl = field === 'linkedin' || field === 'github' || field === 'instagram';
                  const isEmail = field === 'email';
                  let type = 'text';
                  if (isUrl) type = 'url';
                  if (isEmail) type = 'email';

                  return (
                    <input
                      key={field}
                      type={type}
                      name={field}
                      placeholder={field.toUpperCase()}
                      value={formData[field] || ''}
                      onChange={handleInputChange}
                      required={field === 'name' || field === 'role' || field === 'date' || field === 'title' || field === 'label' || field === 'value'}
                      className="w-full bg-transparent border-b border-brand/20 px-0 py-3 text-sm font-bold uppercase tracking-widest text-brand placeholder:text-brand/30 outline-none focus:border-accent transition-colors rounded-none"
                    />
                  );
                })}
                
                {/* Team Level Dropdown */}
                {activeTab === 'team' && (
                  <div className="flex flex-col gap-2">
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

                {/* File Upload for Team, Faculty, and Gallery */}
                {(activeTab === 'team' || activeTab === 'gallery' || activeTab === 'faculty') && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand/50">
                      Upload File (PNG/JPG/MP4/WAV) {(!editingId && (activeTab === 'team' || activeTab === 'faculty')) ? "(Optional)" : (editingId && (formData.image || formData.media) ? "(Optional to replace)" : "")}
                    </span>
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg, video/mp4, audio/wav"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      required={!editingId && activeTab === 'gallery'}
                      className="w-full bg-transparent border-b border-brand/20 px-0 py-2 text-xs font-bold uppercase tracking-widest text-brand focus:border-accent transition-colors rounded-none file:mr-4 file:py-2 file:px-4 file:border file:border-brand/20 file:text-xs file:font-bold file:uppercase file:bg-transparent file:text-brand hover:file:bg-brand/5 file:cursor-pointer cursor-pointer"
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
