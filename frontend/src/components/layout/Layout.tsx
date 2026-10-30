import type { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout: FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
