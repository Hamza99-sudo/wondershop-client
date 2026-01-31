import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, Plus, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import { PageLoading } from '../../components/ui/Loading';
import { stockAPI, productsAPI } from '../../services/api';

export default function Stock() {
  const [searchParams] = useSearchParams();
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [showLowStock, setShowLowStock] = useState(searchParams.get('lowStock') === 'true');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('edit'); // edit or add
  const [selectedStock, setSelectedStock] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    size: '',
    color: '',
    quantity: 0,
    alertLevel: 10,
    adjustment: 0,
    reason: '',
  });

  useEffect(() => {
    fetchStock();
    fetchProducts();
  }, [pagination.page, showLowStock]);

  const fetchStock = async () => {
    try {
      const response = await stockAPI.getAll({
        page: pagination.page,
        limit: 20,
        lowStock: showLowStock,
      });
      setStocks(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch stock');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll({ limit: 100 });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleEdit = (stock) => {
    setSelectedStock(stock);
    setModalType('edit');
    setFormData({
      quantity: stock.quantity,
      alertLevel: stock.alertLevel,
      adjustment: 0,
      reason: '',
    });
    setShowModal(true);
  };

  const handleAddVariant = () => {
    setSelectedStock(null);
    setModalType('add');
    setFormData({
      productId: '',
      size: '',
      color: '',
      quantity: 0,
      alertLevel: 10,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'edit') {
        if (formData.adjustment !== 0) {
          await stockAPI.adjust(selectedStock.id, {
            adjustment: formData.adjustment,
            reason: formData.reason,
          });
        } else {
          await stockAPI.update(selectedStock.id, {
            quantity: formData.quantity,
            alertLevel: formData.alertLevel,
          });
        }
        toast.success('Stock updated');
      } else {
        await stockAPI.addVariant(formData.productId, {
          size: formData.size,
          color: formData.color,
          quantity: formData.quantity,
          alertLevel: formData.alertLevel,
        });
        toast.success('Stock variant added');
      }
      setShowModal(false);
      fetchStock();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stock Management</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm">Show low stock only</span>
          </label>
          <Button onClick={handleAddVariant}>
            <Plus className="w-4 h-4 mr-2" />
            Add Variant
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Alert Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stocks.map((stock) => (
              <TableRow key={stock.id}>
                <TableCell className="font-medium">{stock.product?.name}</TableCell>
                <TableCell>{stock.product?.sku}</TableCell>
                <TableCell>{stock.size}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: stock.color.toLowerCase() }}
                    />
                    {stock.color}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{stock.quantity}</TableCell>
                <TableCell>{stock.alertLevel}</TableCell>
                <TableCell>
                  {stock.quantity <= stock.alertLevel ? (
                    <Badge variant="danger">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Low Stock
                    </Badge>
                  ) : (
                    <Badge variant="success">In Stock</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => handleEdit(stock)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
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

      {/* Stock Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalType === 'edit' ? 'Update Stock' : 'Add Stock Variant'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalType === 'add' ? (
            <>
              <div>
                <label className="label">Product</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Size"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="e.g., M, L, XL"
                  required
                />
                <Input
                  label="Color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="e.g., Black, White"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Initial Quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  min={0}
                />
                <Input
                  label="Alert Level"
                  type="number"
                  value={formData.alertLevel}
                  onChange={(e) => setFormData({ ...formData, alertLevel: parseInt(e.target.value) })}
                  min={0}
                />
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedStock?.product?.name}</p>
                <p className="text-sm text-gray-500">
                  {selectedStock?.size} / {selectedStock?.color}
                </p>
                <p className="text-sm">Current: <span className="font-medium">{selectedStock?.quantity}</span></p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Quick Adjustment</p>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Adjustment (+/-)"
                    type="number"
                    value={formData.adjustment}
                    onChange={(e) => setFormData({ ...formData, adjustment: parseInt(e.target.value) || 0 })}
                    placeholder="+10 or -5"
                  />
                  <Input
                    label="Reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Restock, Damage, etc."
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Or Set New Values</p>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="New Quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value), adjustment: 0 })}
                    min={0}
                  />
                  <Input
                    label="Alert Level"
                    type="number"
                    value={formData.alertLevel}
                    onChange={(e) => setFormData({ ...formData, alertLevel: parseInt(e.target.value) })}
                    min={0}
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {modalType === 'edit' ? 'Update' : 'Add'} Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
