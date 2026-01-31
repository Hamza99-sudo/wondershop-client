import { useEffect, useState } from 'react';
import { Truck, User, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import { PageLoading } from '../../components/ui/Loading';
import { deliveriesAPI, usersAPI } from '../../services/api';

const DELIVERY_STATUSES = ['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED'];

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');

  useEffect(() => {
    fetchDeliveries();
    fetchDrivers();
  }, [pagination.page, statusFilter]);

  const fetchDeliveries = async () => {
    try {
      const response = await deliveriesAPI.getAll({
        page: pagination.page,
        limit: 10,
        status: statusFilter,
      });
      setDeliveries(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await usersAPI.getDrivers();
      setDrivers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    }
  };

  const handleAssign = (delivery) => {
    setSelectedDelivery(delivery);
    setSelectedDriver(delivery.driverId || '');
    setShowAssignModal(true);
  };

  const handleAssignDriver = async () => {
    try {
      await deliveriesAPI.assignDriver(selectedDelivery.id, selectedDriver);
      toast.success('Driver assigned');
      setShowAssignModal(false);
      fetchDeliveries();
    } catch (error) {
      toast.error('Failed to assign driver');
    }
  };

  const handleStatusChange = async (deliveryId, newStatus) => {
    try {
      await deliveriesAPI.updateStatus(deliveryId, newStatus);
      toast.success('Delivery status updated');
      fetchDeliveries();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Deliveries</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input max-w-xs"
        >
          <option value="">All Statuses</option>
          {DELIVERY_STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((delivery) => (
              <TableRow key={delivery.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{delivery.order?.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      ${parseFloat(delivery.order?.total || 0).toLocaleString()}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{delivery.recipientName}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {delivery.recipientPhone}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-start gap-2 max-w-xs">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{delivery.address}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {delivery.driver ? (
                    <div>
                      <p className="font-medium">
                        {delivery.driver.firstName} {delivery.driver.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{delivery.driver.phone}</p>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleAssign(delivery)}>
                      Assign Driver
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <select
                    value={delivery.status}
                    onChange={(e) => handleStatusChange(delivery.id, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                    disabled={!delivery.driver && delivery.status === 'PENDING'}
                  >
                    {DELIVERY_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  {delivery.driver && (
                    <Button size="sm" variant="secondary" onClick={() => handleAssign(delivery)}>
                      Change Driver
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(p) => setPagination({ ...pagination, page: p })}
        />
      </Card>

      {/* Assign Driver Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Driver"
      >
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Order</p>
            <p className="font-medium">{selectedDelivery?.order?.orderNumber}</p>
            <p className="text-sm mt-2 text-gray-500">Delivery Address</p>
            <p className="text-sm">{selectedDelivery?.address}</p>
          </div>

          <div>
            <label className="label">Select Driver</label>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="input"
            >
              <option value="">Choose a driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.firstName} {driver.lastName} ({driver._count?.deliveries || 0} active)
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignDriver} disabled={!selectedDriver}>
              Assign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
