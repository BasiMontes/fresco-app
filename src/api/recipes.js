// src/api/recipes.js
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from './firebaseClient';

const recipesCollection = collection(db, 'recipes');

export const getRecipes = async (userId = null) => {
  let q = recipesCollection;
  if (userId) {
    q = query(recipesCollection, where('userId', '==', userId));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getRecipeById = async (id) => {
  const docRef = doc(db, 'recipes', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const createRecipe = async (recipeData) => {
  const docRef = await addDoc(recipesCollection, recipeData);
  return { id: docRef.id, ...recipeData };
};

export const updateRecipe = async (id, recipeData) => {
  const docRef = doc(db, 'recipes', id);
  await updateDoc(docRef, recipeData);
  return { id, ...recipeData };
};

export const deleteRecipe = async (id) => {
  const docRef = doc(db, 'recipes', id);
  await deleteDoc(docRef);
};