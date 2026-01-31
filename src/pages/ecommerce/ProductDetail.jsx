import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { PageLoading } from '../../components/ui/Loading';
import { productsAPI, getImageUrl } from '../../services/api';
import { formatPrice } from '../../utils/format';
import useCartStore from '../../store/cartStore';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(id);
      setProduct(response.data.data);
      if (response.data.data.stocks?.length > 0) {
        setSelectedVariant(response.data.data.stocks[0]);
      }
    } catch (error) {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Please select a variant');
      return;
    }
    addToCart(product, selectedVariant, quantity);
    toast.success('Added to cart!');
  };

  if (loading) return <PageLoading />;
  if (!product) return <div className="text-center py-12">Product not found</div>;

  const sizes = [...new Set(product.stocks?.map(s => s.size) || [])];
  const colors = [...new Set(product.stocks?.map(s => s.color) || [])];

  const isInStock = selectedVariant && selectedVariant.quantity > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour à la boutique
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
            {product.images?.[selectedImage] ? (
              <img
                src={getImageUrl(product.images[selectedImage])}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Pas d'image
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                    selectedImage === idx ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-gray-500 mb-2">{product.category?.name}</p>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-3xl font-bold text-primary-600">
              {formatPrice(product.retailPrice)}
            </span>
            <span className="text-gray-500">
              Prix gros: {formatPrice(product.wholesalePrice)}
              <span className="text-sm"> (min {product.minWholesaleQty} pcs)</span>
            </span>
          </div>

          <p className="text-gray-600 mb-6">{product.description}</p>

          {/* Size Selection */}
          {sizes.length > 0 && (
            <div className="mb-4">
              <label className="label">Size</label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const available = product.stocks?.some(s =>
                    s.size === size && s.quantity > 0 &&
                    (!selectedVariant || s.color === selectedVariant.color || !selectedVariant.color)
                  );
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        const variant = product.stocks?.find(s =>
                          s.size === size && (selectedVariant?.color ? s.color === selectedVariant.color : true)
                        );
                        if (variant) setSelectedVariant(variant);
                      }}
                      disabled={!available}
                      className={`px-4 py-2 border rounded-lg font-medium ${
                        selectedVariant?.size === size
                          ? 'border-primary-600 bg-primary-50 text-primary-600'
                          : available
                          ? 'hover:border-gray-400'
                          : 'opacity-50 cursor-not-allowed bg-gray-100'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {colors.length > 0 && (
            <div className="mb-6">
              <label className="label">Color</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const available = product.stocks?.some(s =>
                    s.color === color && s.quantity > 0 &&
                    (!selectedVariant || s.size === selectedVariant.size || !selectedVariant.size)
                  );
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        const variant = product.stocks?.find(s =>
                          s.color === color && (selectedVariant?.size ? s.size === selectedVariant.size : true)
                        );
                        if (variant) setSelectedVariant(variant);
                      }}
                      disabled={!available}
                      className={`px-4 py-2 border rounded-lg font-medium ${
                        selectedVariant?.color === color
                          ? 'border-primary-600 bg-primary-50 text-primary-600'
                          : available
                          ? 'hover:border-gray-400'
                          : 'opacity-50 cursor-not-allowed bg-gray-100'
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Status */}
          {selectedVariant && (
            <p className={`text-sm mb-4 ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
              {isInStock
                ? `${selectedVariant.quantity} in stock`
                : 'Out of stock'}
            </p>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <label className="font-medium">Quantity:</label>
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-gray-100"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 font-medium">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity(Math.min(selectedVariant?.quantity || 1, quantity + 1))
                }
                className="p-2 hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleAddToCart}
            disabled={!isInStock}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>

          {/* Product Info */}
          <Card className="mt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">SKU:</span>
                <span className="ml-2 font-medium">{product.sku}</span>
              </div>
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-2 font-medium">{product.category?.name}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
