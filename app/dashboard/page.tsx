'use client'

import { useClerk } from '@clerk/nextjs'

const Dashboard = () => {
    const { signOut } = useClerk()
  return (<>
      <div>Dashboard</div>
      <button onClick={() => signOut({ redirectUrl: '/' })}>Sign out</button>
  </>
  )
  
}

export default Dashboard


