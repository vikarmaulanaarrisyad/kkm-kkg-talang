import { useState, useEffect } from "react";

export function useFormDraft<T>(key: string, initialState: T, isEditMode: boolean = false) {
  const [form, setForm] = useState<T>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    if (!isEditMode) {
      try {
        const draft = localStorage.getItem(key);
        if (draft) {
          const parsed = JSON.parse(draft);
          setForm((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error(`Failed to parse draft for key ${key}:`, e);
      }
    }
    setIsLoaded(true);
  }, [key, isEditMode]);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded && !isEditMode) {
      localStorage.setItem(key, JSON.stringify(form));
    }
  }, [form, key, isLoaded, isEditMode]);

  const clearDraft = () => {
    localStorage.removeItem(key);
  };

  return { form, setForm, clearDraft };
}
