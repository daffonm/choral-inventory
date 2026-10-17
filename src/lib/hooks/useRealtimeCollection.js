"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { db } from "../firebase/firebase-client";

/**
 * Hook universal untuk mendengarkan koleksi Firestore apapun secara realtime.
 * - Tanpa dependensi dummy data
 * - Mengembalikan state loading yang presisi untuk skeleton display
 * - Mendukung sorting opsional
 */
export function useRealtimeCollection(collectionName, options = {}) {
  const { orderByField, orderDirection = "desc", whereField, whereOp = "==", whereValue } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(collectionName));
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!collectionName) {
      return;
    }

    let unsubscribe = () => {};

    try {
      let q = collection(db, collectionName);

      if (whereField && whereValue !== undefined) {
        q = query(q, where(whereField, whereOp, whereValue));
      }

      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setData(items);
          } else {
            setData([]);
          }
          setIsLive(true);
          setLoading(false);
        },
        (err) => {
          console.warn(`Firestore onSnapshot error for [${collectionName}]:`, err);
          setError(err);
          setData([]);
          setIsLive(false);
          setLoading(false);
        }
      );
    } catch (err) {
      console.warn(`Gagal inisialisasi onSnapshot [${collectionName}]:`, err);
      queueMicrotask(() => {
        setError(err);
        setLoading(false);
      });
    }

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [collectionName, orderByField, orderDirection, whereField, whereOp, whereValue]);

  return {
    data,
    loading,
    error,
    isLive,
    count: data.length,
  };
}

export default useRealtimeCollection;
