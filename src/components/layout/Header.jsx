import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  Menu,
  LogOut,
  Package,
  LayoutDashboard,
  Search,
  Heart,
  Store,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import { useState } from 'react';

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isStaff } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      {/* Top Bar */}
      <div className="bg-primary-600 text-white text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <p className="hidden sm:block">Livraison gratuite à partir de 50 000 CFA d'achat!</p>
          <p className="sm:hidden text-center w-full">Livraison gratuite dès 50 000 CFA!</p>
          <div className="hidden sm:flex items-center gap-4">
            <a href="tel:+22507000000" className="hover:underline">77 879 25 90</a>
            <span>|</span>
            <a href="mailto:contact@wondershop.com" className="hover:underline">contact@wondershop.com</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Menu button and Logo */}
          <div className="flex items-center gap-4">
            {isStaff() && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-primary-600">WONDER</span>
                <span className="text-xl font-bold text-gray-900">SHOP</span>
              </div>
            </Link>
          </div>

          {/* Center: Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des produits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              />
            </div>
          </form>

          {/* Right: Nav items */}
          <div className="flex items-center gap-1">
            <Link
              to="/shop"
              className="hidden lg:flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 font-medium"
            >
              <Store className="w-5 h-5" />
              Boutique
            </Link>

            <Link
              to="/wholesale"
              className="hidden lg:flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 font-medium"
            >
              <Package className="w-5 h-5" />
              Gros
            </Link>

            {isStaff() && (
              <Link
                to="/admin"
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-700"
                title="Dashboard"
              >
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            )}

            <Link
              to="/cart"
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-700 relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.firstName?.charAt(0)}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.firstName}
                  </span>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border z-20 overflow-hidden">
                      <div className="p-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                        <p className="font-bold">{user?.firstName} {user?.lastName}</p>
                        <p className="text-sm text-primary-100">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-5 h-5 text-gray-500" />
                        Mon Profil
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Package className="w-5 h-5 text-gray-500" />
                        Mes Commandes
                      </Link>
                      <Link
                        to="/cart"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Heart className="w-5 h-5 text-gray-500" />
                        Mon Panier
                      </Link>
                      <div className="border-t">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 w-full text-left text-red-600"
                        >
                          <LogOut className="w-5 h-5" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-primary-600 font-medium hover:bg-primary-50 rounded-xl transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:block px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
