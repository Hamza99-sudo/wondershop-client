import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { CreditCard, Banknote, Smartphone, Building2, Truck, Store, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import { ordersAPI, getImageUrl } from '../../services/api';
import { formatPrice } from '../../utils/format';

const paymentMethods = [
  { id: 'CASH', label: 'Paiement à la livraison', icon: Banknote },
  { id: 'MOBILE_MONEY', label: 'Mobile Money', icon: Smartphone },
  { id: 'CARD', label: 'Carte bancaire', icon: CreditCard },
  { id: 'TRANSFER', label: 'Virement bancaire', icon: Building2 },
];

const deliveryOptions = [
  {
    id: 'STANDARD',
    label: 'Livraison Standard',
    description: 'Livraison en 3-5 jours ouvrables',
    price: 2000,
    icon: Truck
  },
  {
    id: 'EXPRESS',
    label: 'Livraison Express',
    description: 'Livraison en 24-48 heures',
    price: 5000,
    icon: Truck
  },
  {
    id: 'PICKUP',
    label: 'Retrait en magasin',
    description: 'Gratuit - Récupérez votre commande en boutique',
    price: 0,
    icon: Store
  },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { items, orderType, getSubtotal, getItemPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [deliveryOption, setDeliveryOption] = useState('STANDARD');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: { pathname: '/checkout' } }} />;
  }

  if (items.length === 0) {
    return <Navigate to="/cart" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (deliveryOption !== 'PICKUP' && !shippingAddress.trim()) {
      toast.error('Veuillez entrer une adresse de livraison');
      return;
    }

    if (!phone.trim()) {
      toast.error('Veuillez entrer un numéro de téléphone');
      return;
    }

    setLoading(true);
    try {
      const selectedDelivery = deliveryOptions.find(d => d.id === deliveryOption);
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        type: orderType,
        shippingAddress: deliveryOption === 'PICKUP' ? 'Retrait en magasin' : shippingAddress,
        phone,
        notes: `${notes}\n[Livraison: ${selectedDelivery.label}]`,
        paymentMethod,
        deliveryFee: selectedDelivery.price,
      };

      const response = await ordersAPI.create(orderData);
      const order = response.data.data;

      clearCart();
      toast.success('Commande passée avec succès!');
      navigate(`/orders/${order.id}`, { state: { newOrder: true } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getSubtotal();
  const selectedDelivery = deliveryOptions.find(d => d.id === deliveryOption);
  const deliveryFee = selectedDelivery?.price || 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Finaliser la commande</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Options */}
          <Card>
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Option de livraison
            </h2>
            <div className="space-y-3">
              {deliveryOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setDeliveryOption(option.id)}
                  className={`w-full p-4 border rounded-lg flex items-center gap-4 transition-colors text-left ${
                    deliveryOption === option.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'hover:border-gray-400'
                  }`}
                >
                  <div className={`p-2 rounded-full ${deliveryOption === option.id ? 'bg-primary-100' : 'bg-gray-100'}`}>
                    <option.icon className={`w-5 h-5 ${deliveryOption === option.id ? 'text-primary-600' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                  <p className={`font-bold ${option.price === 0 ? 'text-green-600' : 'text-primary-600'}`}>
                    {option.price === 0 ? 'Gratuit' : formatPrice(option.price)}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          {/* Shipping Info */}
          <Card>
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Informations de livraison
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  value={user?.firstName}
                  disabled
                />
                <Input
                  label="Nom"
                  value={user?.lastName}
                  disabled
                />
              </div>
              <Input
                label="Email"
                type="email"
                value={user?.email}
                disabled
              />
              <Input
                label="Téléphone *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="Ex: +225 07 00 00 00 00"
              />
              {deliveryOption !== 'PICKUP' && (
                <div>
                  <label className="label">Adresse de livraison *</label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="input"
                    rows={3}
                    required
                    placeholder="Entrez votre adresse complète (quartier, ville, repères...)"
                  />
                </div>
              )}
              <div>
                <label className="label">Notes (Optionnel)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input"
                  rows={2}
                  placeholder="Instructions spéciales pour la livraison..."
                />
              </div>
            </div>
          </Card>

          {/* Payment Method */}
          <Card>
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Mode de paiement
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-4 border rounded-lg flex items-center gap-3 transition-colors ${
                    paymentMethod === method.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'hover:border-gray-400'
                  }`}
                >
                  <method.icon className={`w-6 h-6 ${paymentMethod === method.id ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span className="font-medium text-sm">{method.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Order Items */}
          <Card>
            <h2 className="font-bold text-lg mb-4">Articles commandés</h2>
            <div className="space-y-3">
              {items.map((item) => {
                const price = getItemPrice(item);
                return (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.product.images?.[0] ? (
                        <img
                          src={getImageUrl(item.product.images[0])}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          Pas d'image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.size} / {item.color} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold">{formatPrice(price * item.quantity)}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <h2 className="font-bold text-lg mb-4">Résumé de la commande</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Livraison ({selectedDelivery?.label})</span>
                <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                  {deliveryFee === 0 ? 'Gratuit' : formatPrice(deliveryFee)}
                </span>
              </div>
            </div>

            <div className="border-t my-4" />

            <div className="flex justify-between text-xl font-bold mb-6">
              <span>Total</span>
              <span className="text-primary-600">{formatPrice(total)}</span>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={loading}
            >
              Confirmer la commande
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              En passant cette commande, vous acceptez nos conditions générales de vente.
            </p>
          </Card>
        </div>
      </form>
    </div>
  );
}
