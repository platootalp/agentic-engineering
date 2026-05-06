import { Outlet } from 'react-router-dom'
import { Header } from '@/components/common/Header'

export function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <Outlet />
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
