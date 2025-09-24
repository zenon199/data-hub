'use client'

import { UserButton } from "@clerk/nextjs"
import Link from "next/link"


const page = () => {
  return (
    <div className="flex items-center justify-between p-4  border-4">
      <Link href="/" className="text-2xl font-bold">Data Hub</Link>
      <div className="mr-6">
        <UserButton/>
      </div>
    </div>
  )
}

export default page
