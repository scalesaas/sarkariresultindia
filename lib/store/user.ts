  import { create } from 'zustand'
  import {Session, User} from "@supabase/supabase-js"

  interface userState {
    user: User | undefined;
    setUser: (user: User | undefined) =>  void;
  }

  interface sessionState {
    Session: Session | null;
    Setsession: (Session: Session | null) =>  void;
  }

  export const useUser = create<userState>()((set) => ({
  user: undefined,
  setUser: (user) =>set(()=>({user})),
  }));

  export const userSession = create<sessionState>()((set) => ({
    Session: null,
    Setsession: (Session) =>set(()=>({Session})),
    }));