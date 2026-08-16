import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import initialDbData from '../data/db.json';

export const DataContext = createContext();

const LOCAL_STORAGE_KEY = 'gfg_club_data';

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    try {
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localData) {
        const parsed = JSON.parse(localData);
        if (parsed && parsed.content) {
          return {
            ...initialDbData,
            ...parsed,
            content: { ...(initialDbData.content || {}), ...(parsed.content || {}) }
          };
        }
      }
    } catch (e) {
      console.warn('Could not parse localStorage', e);
    }
    return initialDbData;
  });

  const isSavingRef = useRef(false);

  // Helper to persist data to localStorage and server db.json file
  const persistData = useCallback(async (newData) => {
    isSavingRef.current = true;
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
      console.warn('Failed to post data to /api/data server', e);
    } finally {
      setTimeout(() => {
        isSavingRef.current = false;
      }, 500);
    }
  }, []);

  // Fetch the latest shared data from the server
  const fetchServerData = useCallback(async () => {
    if (isSavingRef.current) return;
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && serverData.content) {
          setData((prev) => {
            const prevStr = JSON.stringify(prev);
            const nextStr = JSON.stringify(serverData);
            if (prevStr !== nextStr) {
              try {
                localStorage.setItem(LOCAL_STORAGE_KEY, nextStr);
              } catch (e) {
                // ignore
              }
              return serverData;
            }
            return prev;
          });
        }
      }
    } catch (e) {
      // Offline fallback
    }
  }, []);

  // Sync on startup and poll across network devices (PC <-> Phone)
  useEffect(() => {
    fetchServerData();

    // Poll every 2.5 seconds so changes in Admin immediately update connected phones/devices
    const interval = setInterval(fetchServerData, 2500);

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
  }, [fetchServerData]);

  // --- CRUD Operations ---
  const updateContent = (key, value) => {
    setData((prev) => {
      const updated = {
        ...prev,
        content: { ...prev.content, [key]: value },
      };
      persistData(updated);
      return updated;
    });
  };

  const addItem = (category, item) => {
    setData((prev) => {
      const updated = {
        ...prev,
        [category]: [...(prev[category] || []), { ...item, id: Date.now().toString() }],
      };
      persistData(updated);
      return updated;
    });
  };

  const updateItem = (category, id, updatedItem) => {
    setData((prev) => {
      const updated = {
        ...prev,
        [category]: (prev[category] || []).map((item) =>
          item.id === id ? { ...item, ...updatedItem } : item
        ),
      };
      persistData(updated);
      return updated;
    });
  };

  const deleteItem = (category, id) => {
    setData((prev) => {
      const updated = {
        ...prev,
        [category]: (prev[category] || []).filter((item) => item.id !== id),
      };
      persistData(updated);
      return updated;
    });
  };

  const reorderItems = (category, reorderedArray) => {
    setData((prev) => {
      const updated = {
        ...prev,
        [category]: reorderedArray,
      };
      persistData(updated);
      return updated;
    });
  };

  return (
    <DataContext.Provider
      value={{ data, updateContent, addItem, updateItem, deleteItem, reorderItems }}
    >
      {children}
    </DataContext.Provider>
  );
};
