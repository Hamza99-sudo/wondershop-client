import { useEffect, useState } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { productsAPI, ordersAPI, usersAPI } from '../../services/api';

export default function POS() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('RETAIL');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, [search]);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll({ search, limit: 50 });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await usersAPI.getAll({ role: 'CUSTOMER', limit: 100 });
      setCustomers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const handleProductClick = (product) => {
    if (product.stocks?.length > 1) {
      setSelectedProduct(product);
      setShowVariantModal(true);
    } else if (product.stocks?.length === 1) {
      addToCart(product, product.stocks[0]);
    } else {
      toast.error('No stock available');
    }
  };

  const addToCart = (product, variant) => {
    if (variant.quantity <= 0) {
      toast.error('Out of stock');
      return;
    }

    const existingIndex = cart.findIndex(
      item => item.productId === product.id && item.size === variant.size && item.color === variant.color
    );

    if (existingIndex > -1) {
      const newCart = [...cart];
      if (newCart[existingIndex].quantity < variant.quantity) {
        newCart[existingIndex].quantity += 1;
        setCart(newCart);
      } else {
        toast.error('Maximum stock reached');
      }
    } else {
      setCart([...cart, {
        productId: product.id,
        product,
        size: variant.size,
        color: variant.color,
        quantity: 1,
        maxQuantity: variant.quantity,
      }]);
    }
    setShowVariantModal(false);
  };

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    const newQty = newCart[index].quantity + delta;

    if (newQty <= 0) {
      newCart.splice(index, 1);
    } else if (newQty <= newCart[index].maxQuantity) {
      newCart[index].quantity = newQty;
    }
    setCart(newCart);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const getItemPrice = (item) => {
    const isWholesale = orderType === 'WHOLESALE' && item.quantity >= item.product.minWholesaleQty;
    return isWholesale ? parseFloat(item.product.wholesalePrice) : parseFloat(item.product.retailPrice);
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setProcessing(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        type: orderType,
        paymentMethod,
        customerId: selectedCustomer?.id,
      };

      const response = await ordersAPI.create(orderData);

      // Process payment immediately
      await ordersAPI.processPayment(response.data.data.id, { method: paymentMethod });

      toast.success(`Order ${response.data.data.orderNumber} created!`);
      setCart([]);
      setShowCheckoutModal(false);
      setSelectedCustomer(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Products Section */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Type:</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="RETAIL">Retail</option>
              <option value="WHOLESALE">Wholesale</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 content-start">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => handleProductClick(product)}
              disabled={product.totalStock <= 0}
              className={`p-3 bg-white rounded-lg border text-left hover:border-primary-500 transition-colors ${
                product.totalStock <= 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">No Image</span>
                )}
              </div>
              <p className="font-medium text-sm truncate">{product.name}</p>
              <p className="text-primary-600 font-bold">
                ${orderType === 'WHOLESALE'
                  ? parseFloat(product.wholesalePrice).toFixed(2)
                  : parseFloat(product.retailPrice).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">Stock: {product.totalStock}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <Card className="w-80 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Cart ({cart.length})
          </h2>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-sm text-red-600 hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* Customer Selection */}
        <div className="mb-4">
          <select
            value={selectedCustomer?.id || ''}
            onChange={(e) => {
              const customer = customers.find(c => c.id === e.target.value);
              setSelectedCustomer(customer || null);
            }}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Walk-in Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto space-y-2">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Cart is empty</p>
          ) : (
            cart.map((item, index) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.product.name}</p>
                    <p className="text-xs text-gray-500">{item.size} / {item.color}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(index)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(index, -1)}
                      className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(index, 1)}
                      className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-bold">
                    ${(getItemPrice(item) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Total */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between text-lg font-bold mb-4">
            <span>Total:</span>
            <span>${getSubtotal().toFixed(2)}</span>
          </div>
          <Button
            className="w-full"
            disabled={cart.length === 0}
            onClick={() => setShowCheckoutModal(true)}
          >
            Checkout
          </Button>
        </div>
      </Card>

      {/* Variant Selection Modal */}
      <Modal
        isOpen={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        title="Select Variant"
      >
        {selectedProduct && (
          <div className="space-y-2">
            <p className="font-medium mb-4">{selectedProduct.name}</p>
            {selectedProduct.stocks?.map((variant) => (
              <button
                key={`${variant.size}-${variant.color}`}
                onClick={() => addToCart(selectedProduct, variant)}
                disabled={variant.quantity <= 0}
                className={`w-full p-3 border rounded-lg flex items-center justify-between hover:border-primary-500 ${
                  variant.quantity <= 0 ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                }`}
              >
                <span>{variant.size} / {variant.color}</span>
                <span className="text-sm text-gray-500">
                  {variant.quantity > 0 ? `${variant.quantity} in stock` : 'Out of stock'}
                </span>
              </button>
            ))}
          </div>
        )}
      </Modal>

      {/* Checkout Modal */}
      <Modal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        title="Checkout"
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>Items:</span>
              <span>{cart.reduce((sum, i) => sum + i.quantity, 0)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${getSubtotal().toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="label">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`p-3 border rounded-lg flex items-center justify-center gap-2 ${
                  paymentMethod === 'CASH' ? 'border-primary-500 bg-primary-50' : ''
                }`}
              >
                <Banknote className="w-5 h-5" />
                Cash
              </button>
              <button
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 border rounded-lg flex items-center justify-center gap-2 ${
                  paymentMethod === 'CARD' ? 'border-primary-500 bg-primary-50' : ''
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Card
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowCheckoutModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCheckout}
              isLoading={processing}
            >
              Complete Sale
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
