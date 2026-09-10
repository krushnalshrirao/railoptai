import {
  collection,
  doc,
  getDocs,
  setDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserAccount } from '../types';
import { INITIAL_USERS } from '../data/initialData';

const USERS_COLLECTION = 'users';

/**
 * Ensures initial default railway users exist in the cloud Firestore database.
 */
export async function seedInitialUsersIfEmpty(): Promise<UserAccount[]> {
  try {
    const colRef = collection(db, USERS_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      console.log('Seeding initial users to Firestore cloud database...');
      for (const u of INITIAL_USERS) {
        await setDoc(doc(db, USERS_COLLECTION, u.id), u);
      }
      return INITIAL_USERS;
    } else {
      const list: UserAccount[] = [];
      snap.forEach((d) => {
        list.push(d.data() as UserAccount);
      });
      return list;
    }
  } catch (err) {
    console.warn('Could not seed users to Firestore, using initial fallback:', err);
    return INITIAL_USERS;
  }
}

/**
 * Subscribes to real-time updates for all registered user accounts from Firestore.
 * This guarantees that when a user registers on Laptop B, Laptop A immediately
 * receives the update and refreshes the Master Accounts Excel spreadsheet in real time!
 */
export function subscribeToCloudUsers(
  onUpdate: (users: UserAccount[]) => void,
  onError?: (err: unknown) => void
): () => void {
  try {
    const colRef = collection(db, USERS_COLLECTION);
    const q = query(colRef);

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        if (snapshot.empty) {
          // If the Firestore collection was completely empty, seed it with default users
          const seeded = await seedInitialUsersIfEmpty();
          onUpdate(seeded);
        } else {
          const loadedUsers: UserAccount[] = [];
          snapshot.forEach((docSnap) => {
            loadedUsers.push(docSnap.data() as UserAccount);
          });

          // Sort chronologically or by ID so order is consistent
          loadedUsers.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            if (timeA && timeB && !isNaN(timeA) && !isNaN(timeB)) {
              return timeA - timeB;
            }
            return a.id.localeCompare(b.id);
          });

          onUpdate(loadedUsers);
        }
      },
      (err) => {
        console.warn('Firestore onSnapshot listener error, falling back to server API:', err);
        if (onError) onError(err);
        // Fallback to fetch from backend server
        fetchUsersFromServer().then((fallbackUsers) => {
          if (fallbackUsers.length > 0) {
            onUpdate(fallbackUsers);
          }
        });
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('Failed to initialize Firestore users subscription:', err);
    // Fallback: poll server
    fetchUsersFromServer().then(onUpdate);
    const interval = setInterval(() => {
      fetchUsersFromServer().then(onUpdate);
    }, 5000);
    return () => clearInterval(interval);
  }
}

/**
 * Saves a new user directly to Firestore cloud database so all connected devices receive it instantly.
 */
export async function saveUserToCloud(newUser: UserAccount): Promise<boolean> {
  let firestoreSuccess = false;

  try {
    const userDocRef = doc(db, USERS_COLLECTION, newUser.id);
    await setDoc(userDocRef, {
      ...newUser,
      createdAt:
        newUser.createdAt ||
        new Date().toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      status: newUser.status || 'Active',
    });
    firestoreSuccess = true;
    console.log('Successfully saved user account to Firestore cloud database:', newUser.id);
  } catch (err) {
    console.warn('Could not save user to Firestore directly:', err);
  }

  // Also sync to backend Express server for dual-storage redundancy and server-side export endpoints
  try {
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
  } catch (serverErr) {
    console.warn('Could not sync user to /api/users backend endpoint:', serverErr);
  }

  return firestoreSuccess;
}

/**
 * Fetches all registered users from Firestore or server fallback.
 */
export async function fetchAllUsers(): Promise<UserAccount[]> {
  try {
    const colRef = collection(db, USERS_COLLECTION);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const list: UserAccount[] = [];
      snap.forEach((d) => list.push(d.data() as UserAccount));
      return list;
    }
  } catch (err) {
    console.warn('Failed to fetch users from Firestore:', err);
  }

  return fetchUsersFromServer();
}

/**
 * Helper to fetch from backend Express server
 */
export async function fetchUsersFromServer(): Promise<UserAccount[]> {
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.users) && data.users.length > 0) {
        return data.users;
      }
    }
  } catch (e) {
    console.warn('Server fetch error:', e);
  }
  return INITIAL_USERS;
}
