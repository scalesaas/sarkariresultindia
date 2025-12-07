  "use client"
  import React, { use } from 'react'
  import { useEffect } from 'react'
  import { createBrowserClient } from '@supabase/ssr'
  import { useUser , userSession } from '@/lib/store/user'
  export default function Sessioprovider() {
      const setUser = useUser((state) => state.setUser);
      const setsession = userSession((state) => state.Setsession);

      const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
      const readUserSession =async () => 
      {
          const {data} =await supabase.auth.getSession();
          console.log("session data")
          console.log(data)


          setUser(data.session?.user);
          setsession(data.session);
      }
      useEffect(() => {
      readUserSession();
      
          
      }, []);
    return (
      <div></div>
    )
  }
