"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebase-client";
import { persediaanData } from "../dummyData";

/**
 * Custom React Hook untuk mendengarkan perubahan koleksi `inventory` di Firestore secara realtime.
 * - Mengembalikan data live dengan latensi nol via onSnapshot
 * - Secara transparan fallback ke dummyData jika koleksi di Firestore masih kosong
 * - Otomatis melakukan unsubscribe saat unmount untuk mencegah memory leak
 */
export function useRealtimeInventory() {
  const [items, setItems] = useState(() => persediaanData.stokSaatIni || []);
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
            setIsLive(true);
          } else {
            // Fallback halus ke dummyData jika database belum di-seed
            setItems(persediaanData.stokSaatIni || []);
            setIsLive(false);
          }
          setLoading(false);
        },
        (err) => {
          console.warn("Firestore onSnapshot warning (fallback ke local):", err);
          setError(err);
          setIsLive(false);
          setLoading(false);
        }
      );
    } catch (e) {
      console.warn("Gagal inisialisasi onSnapshot listener:", e);
    }

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  return { items, loading, error, isLive };
}
