// src/api/mealPlans.js
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebaseClient';

const mealPlansCollection = collection(db, 'weeklyMenus');

export const getMealPlansByUser = async (userId) => {
  const q = query(mealPlansCollection, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createMealPlan = async (mealPlanData) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  
  const docRef = await addDoc(mealPlansCollection, {
    ...mealPlanData,
    userId: user.uid,
    createdAt: new Date(),
  });
  return { id: docRef.id, ...mealPlanData, userId: user.uid };
};

export const getMealPlanById = async (id) => {
  const docRef = doc(db, 'weeklyMenus', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const updateMealPlan = async (id, mealPlanData) => {
  const docRef = doc(db, 'weeklyMenus', id);
  await updateDoc(docRef, mealPlanData);
  return { id, ...mealPlanData };
};

export const deleteMealPlan = async (id) => {
  const docRef = doc(db, 'weeklyMenus', id);
  await deleteDoc(docRef);
};