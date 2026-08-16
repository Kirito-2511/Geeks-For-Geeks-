import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import initialDbData from '../data/db.json';

export const DataContext = createContext();

const LOCAL_STORAGE_KEY = 'gfg_club_data';

export const DataProvider = ({ children }) => {
  // Initialize from db.json or fallback
  const [data, setData] = useState(() => {
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        return {
          ...initialDbData,
          ...parsed,
          content: { ...(initialDbData.content || {}), ...(parsed.content || {}) }
        };
      }
    } catch (e) {
      console.warn('Error loading localStorage data', e);
    }
    return initialDbData;
  });

  const isInitialSyncDone = useRef(false);

  // Helper to persist data both locally and to the server disk
  const persistToServerAndLocal = useCallback(async (newData) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }

    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
    } catch (e) {
      console.warn('Failed to sync data to /api/data server', e);
    }
  }, []);

  // Fetch latest data from server
  const fetchServerData = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && serverData.content) {
          setData(prev => {
            // Check if server data is different from current state
            if (JSON.stringify(prev) !== JSON.stringify(serverData)) {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverData));
              return serverData;
            }
            return prev;
          });
        }
      }
    } catch (e) {
      console.warn('Could not fetch /api/data', e);
    }
  }, []);

  // Initial sync & periodic polling across devices
  useEffect(() => {
    async function initSync() {
      try {
        // If this client had existing local edits, upload them to server
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed && parsed.content) {
            await persistToServerAndLocal(parsed);
          }
        }
        await fetchServerData();
      } catch (e) {
        console.warn('Init sync error', e);
      } finally {
        isInitialSyncDone.current = true;
      }
    }

    initSync();

    // Poll every 3 seconds so changes made in Admin console on PC immediately reflect on Phone
    const interval = setInterval(fetchServerData, 3000);

    const handleFocus = () => {
      fetchServerData();
    };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
    };
  }, [fetchServerData, persistToServerAndLocal]);

  // --- CRUD Operations ---
  const updateContent = (key, value) => {
    setData(prev => {
      const updated = {
        ...prev,
        content: { ...prev.content, [key]: value }
      };
      persistToServerAndLocal(updated);
      return updated;
    });
  };

  const addItem = (category, item) => {
    setData(prev => {
      const updated = {
        ...prev,
        [category]: [...(prev[category] || []), { ...item, id: Date.now().toString() }]
      };
      persistToServerAndLocal(updated);
      return updated;
    });
  };

  const updateItem = (category, id, updatedItem) => {
    setData(prev => {
      const updated = {
        ...prev,
        [category]: (prev[category] || []).map(item => (item.id === id ? { ...item, ...updatedItem } : item)),
      };
      persistToServerAndLocal(updated);
      return updated;
    });
  };

  const deleteItem = (category, id) => {
    setData(prev => {
      const updated = {
        ...prev,
        [category]: (prev[category] || []).filter(item => item.id !== id),
      };
      persistToServerAndLocal(updated);
      return updated;
    });
  };

  const reorderItems = (category, reorderedArray) => {
    setData(prev => {
      const updated = {
        ...prev,
        [category]: reorderedArray
      };
      persistToServerAndLocal(updated);
      return updated;
    });
  };

  return (
    <DataContext.Provider value={{ data, updateContent, addItem, updateItem, deleteItem, reorderItems }}>
      {children}
    </DataContext.Provider>
  );
};
