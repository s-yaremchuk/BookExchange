import { useState, FC } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const Navbar: FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 text-base font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/books" className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </span>
              <span className="text-lg font-bold text-slate-900">Book Exchange</span>
            </Link>

            <div className="hidden md:ml-8 md:flex md:space-x-1">
              <NavLink to="/books" className={navLinkClass}>
                Books
              </NavLink>
              <NavLink to="/me/books" className={navLinkClass}>
                My books
              </NavLink>
              {user?.role === 'ADMIN' && (
                <NavLink to="/admin" className={navLinkClass}>
                  Admin
                </NavLink>
              )}
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:gap-4">
            <div className="text-sm">
              <span className="text-slate-500">Signed in as </span>
              <span className="font-semibold text-slate-900">{user?.name}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <NavLink
            to="/books"
            className={mobileNavLinkClass}
            onClick={() => setIsOpen(false)}
          >
            Books
          </NavLink>
          <NavLink
            to="/me/books"
            className={mobileNavLinkClass}
            onClick={() => setIsOpen(false)}
          >
            My books
          </NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink
              to="/admin"
              className={mobileNavLinkClass}
              onClick={() => setIsOpen(false)}
            >
              Admin
            </NavLink>
          )}

          <div className="pt-4 border-t border-slate-200 mt-2">
            <div className="px-3 mb-3 text-sm">
              <div className="text-slate-500">Signed in as</div>
              <div className="font-semibold text-slate-900">{user?.name}</div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};
