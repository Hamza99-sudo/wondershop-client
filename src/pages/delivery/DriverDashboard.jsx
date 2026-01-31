import { useEffect, useState } from 'react';
import { MapPin, Phone, Package, Clock, CheckCircle, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { PageLoading } from '../../components/ui/Loading';
import { deliveriesAPI } from '../../services/api';

const statusFlow = {
  ASSIGNED: 'PICKED_UP',
  PICKED_UP: 'IN_TRANSIT',
  IN_TRANSIT: 'DELIVERED',
};

const statusLabels = {
  ASSIGNED: 'Mark as Picked Up',
  PICKED_UP: 'Start Delivery',
  IN_TRANSIT: 'Mark as Delivered',
};

export default function DriverDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await deliveriesAPI.getMyDeliveries();
      setDeliveries(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (deliveryId, currentStatus) => {
    const nextStatus = statusFlow[currentStatus];
    if (!nextStatus) return;

    try {
      await deliveriesAPI.updateStatus(deliveryId, nextStatus);
      toast.success(`Delivery ${nextStatus.toLowerCase().replace('_', ' ')}`);
      fetchDeliveries();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleFailed = async (deliveryId) => {
    const notes = prompt('Please enter reason for failed delivery:');
    if (!notes) return;

    try {
      await deliveriesAPI.updateStatus(deliveryId, 'FAILED', notes);
      toast.success('Delivery marked as failed');
      fetchDeliveries();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <PageLoading />;

  const activeDeliveries = deliveries.filter(d =>
    ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status)
  );
  const completedDeliveries = deliveries.filter(d =>
    ['DELIVERED', 'FAILED'].includes(d.status)
  );

  const displayDeliveries = activeTab === 'active' ? activeDeliveries : completedDeliveries;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Deliveries</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Truck className="w-5 h-5 text-primary-600" />
            <span className="font-medium">{activeDeliveries.length} Active</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-white shadow text-primary-600'
              : 'text-gray-600'
          }`}
        >
          Active ({activeDeliveries.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'completed'
              ? 'bg-white shadow text-primary-600'
              : 'text-gray-600'
          }`}
        >
          Completed ({completedDeliveries.length})
        </button>
      </div>

      {/* Deliveries List */}
      {displayDeliveries.length === 0 ? (
        <Card className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {activeTab === 'active'
              ? 'No active deliveries'
              : 'No completed deliveries'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayDeliveries.map((delivery) => (
            <Card key={delivery.id}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-lg">{delivery.order?.orderNumber}</p>
                  <StatusBadge status={delivery.status} />
                </div>
                <p className="text-sm text-gray-500">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {new Date(delivery.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3 mb-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{delivery.recipientName}</p>
                    <p className="text-sm text-gray-600">{delivery.address}</p>
                  </div>
                </div>
                <a
                  href={`tel:${delivery.recipientPhone}`}
                  className="flex items-center gap-2 text-primary-600 hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  {delivery.recipientPhone}
                </a>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Items:</p>
                <div className="space-y-1">
                  {delivery.order?.items?.map((item) => (
                    <p key={item.id} className="text-sm text-gray-600">
                      {item.quantity}x {item.product?.name} ({item.size}/{item.color})
                    </p>
                  ))}
                </div>
                <p className="font-bold mt-2">
                  Total: ${parseFloat(delivery.order?.total || 0).toFixed(2)}
                </p>
              </div>

              {/* Notes */}
              {delivery.notes && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg text-sm">
                  <p className="font-medium text-yellow-800">Notes:</p>
                  <p className="text-yellow-700">{delivery.notes}</p>
                </div>
              )}

              {/* Actions */}
              {['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(delivery.status) && (
                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={() => handleStatusUpdate(delivery.id, delivery.status)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {statusLabels[delivery.status]}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleFailed(delivery.id)}
                  >
                    Failed
                  </Button>
                </div>
              )}

              {delivery.status === 'DELIVERED' && delivery.deliveredAt && (
                <p className="text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Delivered at {new Date(delivery.deliveredAt).toLocaleString()}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
