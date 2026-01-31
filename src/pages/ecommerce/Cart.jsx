import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { getImageUrl } from '../../services/api';
import { formatPrice } from '../../utils/format';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    items,
    orderType,
    setOrderType,
    updateQuantity,
    removeItem,
    getSubtotal,
    getItemPrice,
    clearCart,
  } = useCartStore();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
        <p className="text-gray-600 mb-8">
          Vous n'avez pas encore ajouté d'articles à votre panier.
        </p>
        <Link to="/shop">
          <Button>Commencer vos achats</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order Type Toggle */}
          <Card>
            <div className="flex items-center justify-between">
              <span className="font-medium">Type de commande:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setOrderType('RETAIL')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    orderType === 'RETAIL'
                      ? 'bg-white shadow text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Détail
                </button>
                <button
                  onClick={() => setOrderType('WHOLESALE')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    orderType === 'WHOLESALE'
                      ? 'bg-white shadow text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Gros
                </button>
              </div>
            </div>
          </Card>

          {/* Items */}
          {items.map((item, index) => {
            const price = getItemPrice(item);
            const isWholesale =
              orderType === 'WHOLESALE' &&
              item.quantity >= item.product.minWholesaleQty;

            return (
              <Card key={`${item.productId}-${item.size}-${item.color}`}>
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.product.images?.[0] ? (
                      <img
                        src={getImageUrl(item.product.images[0])}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        Pas d'image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/shop/${item.productId}`}
                      className="font-medium hover:text-primary-600"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {item.size} / {item.color}
                    </p>

                    {isWholesale && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                        Prix de gros
                      </span>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <p className="font-bold">
                          {formatPrice(price * item.quantity)}
                        </p>
                        <button
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          <div className="flex justify-end">
            <button
              onClick={clearCart}
              className="text-sm text-red-600 hover:underline"
            >
              Vider le panier
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <h2 className="font-bold text-lg mb-4">Résumé de la commande</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Sous-total ({items.reduce((sum, i) => sum + i.quantity, 0)} articles)
                </span>
                <span>{formatPrice(getSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Livraison</span>
                <span className="text-green-600">Gratuite</span>
              </div>
            </div>

            <div className="border-t my-4" />

            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Total</span>
              <span>{formatPrice(getSubtotal())}</span>
            </div>

            <Button className="w-full" onClick={handleCheckout}>
              Passer la commande
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Link to="/shop" className="block text-center text-sm text-gray-600 mt-4 hover:underline">
              Continuer vos achats
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
