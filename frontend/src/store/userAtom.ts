import { atom } from 'recoil';
import type { User } from '../types';

// the logged in user, null means not logged in. filled in once /me answers back on app load
export const userAtom = atom<User | null>({
  key: 'userAtom',
  default: null,
});

// true until we have asked /me once, used so we dont flash the login page before we know
export const authLoadingAtom = atom<boolean>({
  key: 'authLoadingAtom',
  default: true,
});
