import React, { createContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';

export const DataContext = createContext();

const LOCAL_STORAGE_KEY = 'gfg_club_data';

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({ content: {}, team: [], faculty: [], gallery: [] });

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: row, error } = await supabase
        .from('club_data')
        .select('data')
        .eq('id', 'master')
        .single();
      
      if (row && row.data) {
        setData(row.data);
      } else if (error && error.code !== 'PGRST116') {
        console.error("Supabase fetch error:", error);
      }
    };

    fetchInitialData();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'club_data', filter: 'id=eq.master' },
        (payload) => {
          if (payload.new && payload.new.data) {
            setData(payload.new.data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const persistData = async (newData) => {
    const { error } = await supabase
      .from('club_data')
      .upsert({ id: 'master', data: newData });
    
    if (error) {
      console.error("Error updating document: ", error);
    }
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
