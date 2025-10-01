// src/api/shoppingLists.js
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebaseClient';

const shoppingListsCollection = collection(db, 'shoppingLists');

export const createShoppingList = async (listData) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  
  const docRef = await addDoc(shoppingListsCollection, {
    ...listData,
    userId: user.uid,
    createdAt: new Date(),
  });
  return { id: docRef.id, ...listData, userId: user.uid };
};

export const getShoppingListsByUser = async (userId) => {
  const q = query(shoppingListsCollection, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getShoppingListById = async (id) => {
  const docRef = doc(db, 'shoppingLists', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const updateShoppingList = async (id, listData) => {
  const docRef = doc(db, 'shoppingLists', id);
  await updateDoc(docRef, listData);
  return { id, ...listData };
};

export const deleteShoppingList = async (id) => {
  const docRef = doc(db, 'shoppingLists', id);
  await deleteDoc(docRef);
};