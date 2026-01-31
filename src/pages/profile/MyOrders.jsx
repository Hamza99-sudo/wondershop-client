import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import { PageLoading } from '../../components/ui/Loading';
import { ordersAPI } from '../../services/api';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  useEffect(() => {
    fetchOrders();
  }, [pagination.page]);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getMyOrders({ page: pagination.page });
      setOrders(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoading />;

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold mb-4">No orders yet</h1>
        <p className="text-gray-600 mb-8">
          When you place orders, they will appear here.
        </p>
        <Link to="/shop" className="btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-bold text-lg">{order.orderNumber}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="flex items-center gap-4 mb-4">
              {order.items?.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0"
                >
                  {item.product?.images?.[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt=""
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No img
                    </div>
                  )}
                </div>
              ))}
              {order.items?.length > 3 && (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">
                    +{order.items.length - 3}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {order.items?.length} item(s)
                </p>
                <p className="font-bold text-lg">
                  ${parseFloat(order.total).toFixed(2)}
                </p>
              </div>
              <Link
                to={`/orders/${order.id}`}
                className="flex items-center gap-2 text-primary-600 hover:underline"
              >
                <Eye className="w-4 h-4" />
                View Details
              </Link>
            </div>

            {order.delivery && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm">
                  <span className="text-gray-500">Delivery:</span>{' '}
                  <StatusBadge status={order.delivery.status} />
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => setPagination({ ...pagination, page: p })}
      />
    </div>
  );
}
