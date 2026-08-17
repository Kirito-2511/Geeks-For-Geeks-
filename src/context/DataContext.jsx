import React, { createContext, useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const DataContext = createContext();

const LOCAL_STORAGE_KEY = 'gfg_club_data';

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({ content: {}, team: [], faculty: [], gallery: [] });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'clubData', 'master'), (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data());
      }
    }, (error) => {
      console.error("Firestore connection error:", error);
    });

    return () => unsubscribe();
  }, []);

  const persistData = (newData) => {
    setDoc(doc(db, 'clubData', 'master'), newData).catch((error) => {
      console.error("Error updating document: ", error);
    });
  };

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
        [category]: [...(prev[category] || []), { ...item, id: crypto.randomUUID() }],
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
