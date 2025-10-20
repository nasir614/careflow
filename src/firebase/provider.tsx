
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { app } from './config';

interface FirebaseContextType {
  app: FirebaseApp;
  auth?: Auth;
  firestore?: Firestore;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
}

export const FirebaseProvider = ({ children }: FirebaseProviderProps) => {
  // TODO: Initialize Auth and Firestore when needed
  const value = { app };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
