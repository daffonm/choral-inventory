"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebase-client";

/**
 * Custom React Hook untuk mendengarkan perubahan koleksi `inventory` di Firestore secara realtime.
 * - Latensi nol via Firestore onSnapshot
 * - Mengembalikan array bersih [] ketika Firestore kosong (tidak ada fallback dummy data)
 * - Otomatis melakukan unsubscribe saat unmount untuk mencegah memory leak
 */
export function useRealtimeInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};

    try {
      const q = query(collection(db, "inventory"), orderBy("sku", "asc"));

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setItems(data);
          } else {
            setItems([]);
          }
          setIsLive(true);
          setLoading(false);
        },
        (err) => {
          console.warn("Firestore onSnapshot error:", err);
          setError(err);
          setIsLive(false);
          setLoading(false);
        }
      );
    } catch (e) {
      console.warn("Gagal inisialisasi onSnapshot listener:", e);
      queueMicrotask(() => {
        setLoading(false);
      });
    }

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  return { items, loading, error, isLive };
}

export default useRealtimeInventory;
