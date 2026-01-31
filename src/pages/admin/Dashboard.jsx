import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  Truck,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { PageLoading } from '../../components/ui/Loading';
import { dashboardAPI } from '../../services/api';
import { formatPrice } from '../../utils/format';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, salesRes, productsRes, ordersRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getSales({ period: '7days' }),
        dashboardAPI.getTopProducts({ limit: 5 }),
        dashboardAPI.getRecentOrders({ limit: 5 }),
      ]);

      setStats(statsRes.data.data);
      setSalesData(salesRes.data.data);
      setTopProducts(productsRes.data.data);
      setRecentOrders(ordersRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoading />;

  const statCards = [
    {
      title: 'Revenu Total',
      value: formatPrice(stats?.monthRevenue || 0),
      change: stats?.revenueChange || 0,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: "Commandes du Jour",
      value: stats?.todayOrders || 0,
      subtitle: formatPrice(stats?.todayRevenue || 0),
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Clients',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'Alertes Stock',
      value: stats?.lowStockCount || 0,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      link: '/admin/stock?lowStock=true',
    },
    {
      title: 'Livraisons en Attente',
      value: stats?.pendingDeliveries || 0,
      icon: Truck,
      color: 'bg-orange-500',
      link: '/admin/deliveries',
    },
    {
      title: 'Total Produits',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-indigo-500',
    },
  ];

  const salesChartData = {
    labels: salesData.map((d) => d.date),
    datasets: [
      {
        label: 'Revenue',
        data: salesData.map((d) => d.total),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value} CFA`,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tableau de Bord</h1>
        <span className="text-sm text-gray-500">
          Dernière mise à jour: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-sm text-gray-500">{stat.subtitle}</p>
                )}
                {stat.change !== undefined && (
                  <div className={`flex items-center gap-1 text-sm mt-2 ${
                    stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {Math.abs(stat.change)}% vs last month
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            {stat.link && (
              <Link
                to={stat.link}
                className="absolute inset-0 hover:bg-gray-50/50 transition-colors"
              />
            )}
          </Card>
        ))}
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ventes (7 derniers jours)</CardTitle>
          </CardHeader>
          <div className="h-64">
            <Line data={salesChartData} options={chartOptions} />
          </div>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Produits Populaires</CardTitle>
              <Link to="/admin/products" className="text-sm text-primary-600 hover:underline">
                Voir tout
              </Link>
            </div>
          </CardHeader>
          <div className="space-y-4">
            {topProducts.map((item, index) => (
              <div key={item.product?.id || index} className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.product?.name}</p>
                  <p className="text-sm text-gray-500">{item.totalQuantity} vendus</p>
                </div>
                <p className="font-semibold text-green-600">
                  {formatPrice(item.totalRevenue || 0)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Commandes Récentes</CardTitle>
            <Link to="/admin/orders" className="text-sm text-primary-600 hover:underline">
              Voir tout
            </Link>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">Commande</th>
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Articles</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Statut</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-3">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="font-medium text-primary-600 hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3">{order.customer}</td>
                  <td className="py-3">{order.itemCount}</td>
                  <td className="py-3 font-medium">{formatPrice(order.total || 0)}</td>
                  <td className="py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
