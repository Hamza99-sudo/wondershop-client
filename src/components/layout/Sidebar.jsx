import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Tags,
  BarChart3,
  Settings,
  Store,
  Box,
  X,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin',
    roles: ['ADMIN', 'STOCK_MANAGER', 'CASHIER'],
  },
  {
    title: 'POS / Sales',
    icon: ShoppingCart,
    path: '/admin/pos',
    roles: ['ADMIN', 'CASHIER'],
  },
  {
    title: 'Orders',
    icon: Package,
    path: '/admin/orders',
    roles: ['ADMIN', 'STOCK_MANAGER', 'CASHIER'],
  },
  {
    title: 'Products',
    icon: Store,
    path: '/admin/products',
    roles: ['ADMIN', 'STOCK_MANAGER'],
  },
  {
    title: 'Categories',
    icon: Tags,
    path: '/admin/categories',
    roles: ['ADMIN', 'STOCK_MANAGER'],
  },
  {
    title: 'Stock',
    icon: Box,
    path: '/admin/stock',
    roles: ['ADMIN', 'STOCK_MANAGER'],
  },
  {
    title: 'Deliveries',
    icon: Truck,
    path: '/admin/deliveries',
    roles: ['ADMIN', 'STOCK_MANAGER', 'CASHIER'],
  },
  {
    title: 'Users',
    icon: Users,
    path: '/admin/users',
    roles: ['ADMIN'],
  },
  {
    title: 'Reports',
    icon: BarChart3,
    path: '/admin/reports',
    roles: ['ADMIN'],
  },
];

const driverMenuItems = [
  {
    title: 'My Deliveries',
    icon: Truck,
    path: '/driver',
    roles: ['DELIVERY'],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, hasRole } = useAuthStore();

  const items = user?.role === 'DELIVERY' ? driverMenuItems : menuItems;
  const visibleItems = items.filter((item) => hasRole(item.roles));

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b lg:hidden">
          <span className="text-xl font-bold">Menu</span>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-6 p-3 bg-primary-50 rounded-lg">
            <p className="font-medium text-primary-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-primary-700">{user?.role}</p>
          </div>

          <nav className="space-y-1">
            {visibleItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin' || item.path === '/driver'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.title}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <NavLink
            to="/shop"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Store className="w-5 h-5" />
            Go to Shop
          </NavLink>
        </div>
      </aside>
    </>
  );
}
