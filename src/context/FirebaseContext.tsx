import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  initializeApp, 
  FirebaseApp,
} from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  QueryConstraint,
} from 'firebase/firestore';
import {
  getStorage,
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvftUg2H-BcVX5FKOBDnQiN42L2k2g-NE",
  authDomain: "projectos-pagos.firebaseapp.com",
  projectId: "projectos-pagos",
  storageBucket: "projectos-pagos.firebasestorage.app",
  messagingSenderId:  "912132329662",
  appId: "1:912132329662:web:4ac5312bd673b60dd34eef",
  measurementId:  "G-J2YFGHYB7J",
};

export interface Project {
  id?: string;
  name: string;
  description: string;
  type: 'commercial' | 'house_additions' | 'buildings' | 'new_constructions' | 'attics_renovations' | 'basement_addition';
  createdDate: string;
  startedDate: string;
  revisionDate: string;
  deliveryDate: string;
  cost: number;
  active: boolean;
}

export interface Payment {
  id?: string;
  projectId: string;
  amount: number;
  note: string;
  date: string;
  imageUrl?: string;
}

interface FirebaseContextType {
  app: FirebaseApp | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
  projects: Project[];
  payments: Map<string, Payment[]>;
  addProject: (project: Project) => Promise<string>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProjects: () => Promise<void>;
  addPayment: (payment: Payment) => Promise<string>;
  getPayments: (projectId: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [app] = useState(() => initializeApp(firebaseConfig));
  const [db] = useState(() => getFirestore(app));
  const [storage] = useState(() => getStorage(app));
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Map<string, Payment[]>>(new Map());

  const getProjects = useCallback(async () => {
    try {
      const projectsCollection = collection(db, 'projects');
      const projectsSnapshot = await getDocs(projectsCollection);
      const projectsList: Project[] = [];
      
      projectsSnapshot.forEach((doc) => {
        projectsList.push({ id: doc.id, ...doc.data() } as Project);
      });
      
      setProjects(projectsList);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, [db]);

  const addProject = useCallback(async (project: Project): Promise<string> => {
    try {
      const projectsCollection = collection(db, 'projects');
      const docRef = await addDoc(projectsCollection, project);
      await getProjects();
      return docRef.id;
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  }, [db, getProjects]);

  const updateProject = useCallback(async (id: string, project: Partial<Project>) => {
    try {
      const projectRef = doc(db, 'projects', id);
      await updateDoc(projectRef, project);
      await getProjects();
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }, [db, getProjects]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      const projectRef = doc(db, 'projects', id);
      await deleteDoc(projectRef);
      await getProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }, [db, getProjects]);

  const getPayments = useCallback(async (projectId: string) => {
    try {
      const paymentsCollection = collection(db, 'payments');
      const constraints: QueryConstraint[] = [where('projectId', '==', projectId)];
      const q = query(paymentsCollection, ...constraints);
      const paymentsSnapshot = await getDocs(q);
      const paymentsList: Payment[] = [];
      
      paymentsSnapshot.forEach((doc) => {
        paymentsList.push({ id: doc.id, ...doc.data() } as Payment);
      });
      
      setPayments(prev => new Map(prev).set(projectId, paymentsList));
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  }, [db]);

  const addPayment = useCallback(async (payment: Payment): Promise<string> => {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }
      const paymentsCollection = collection(db, 'payments');
      const docRef = await addDoc(paymentsCollection, payment);
      await getPayments(payment.projectId);
      return docRef.id;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  }, [db, getPayments]);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    try {
      const storageRef = ref(storage, `payments/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }, [storage]);

  return (
    <FirebaseContext.Provider value={{
      app,
      db,
      storage,
      projects,
      payments,
      addProject,
      updateProject,
      deleteProject,
      getProjects,
      addPayment,
      getPayments,
      uploadImage,
    }}>
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
