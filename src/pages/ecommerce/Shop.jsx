import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, Grid, List, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import { PageLoading } from '../../components/ui/Loading';
import { productsAPI, categoriesAPI, getImageUrl } from '../../services/api';
import { formatPrice } from '../../utils/format';
import useCartStore from '../../store/cartStore';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [viewMode, setViewMode] = useState('grid');
  const addToCart = useCartStore((state) => state.addItem);

  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    order: searchParams.get('order') || 'desc',
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getAll({
        page: parseInt(searchParams.get('page') || '1'),
        limit: 12,
        ...filters,
      });
      setProducts(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleQuickAdd = (product) => {
    if (product.stocks?.length === 1) {
      addToCart(product, product.stocks[0], 1);
      toast.success('Added to cart!');
    } else {
      // Navigate to product page for variant selection
      window.location.href = `/shop/${product.id}`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <Card>
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h2>

            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="label">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => updateFilters('search', e.target.value)}
                  placeholder="Search..."
                  className="input"
                />
              </div>

              {/* Categories */}
              <div>
                <label className="label">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilters('category', e.target.value)}
                  className="input"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="label">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => updateFilters('minPrice', e.target.value)}
                    placeholder="Min"
                    className="input"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilters('maxPrice', e.target.value)}
                    placeholder="Max"
                    className="input"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="label">Sort By</label>
                <select
                  value={`${filters.sortBy}-${filters.order}`}
                  onChange={(e) => {
                    const [sortBy, order] = e.target.value.split('-');
                    updateFilters('sortBy', sortBy);
                    updateFilters('order', order);
                  }}
                  className="input"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="retailPrice-asc">Price: Low to High</option>
                  <option value="retailPrice-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A-Z</option>
                </select>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setSearchParams({})}
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {pagination.total || 0} products found
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <PageLoading />
          ) : products.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-500">No products found</p>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="group hover:shadow-md transition-shadow">
                  <Link to={`/shop/${product.id}`}>
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Pas d'image
                        </div>
                      )}
                    </div>
                  </Link>
                  <Link to={`/shop/${product.id}`}>
                    <h3 className="font-medium hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500">{product.category?.name}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-lg font-bold text-primary-600">
                      {formatPrice(product.retailPrice)}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleQuickAdd(product)}
                      disabled={product.totalStock <= 0}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                  {product.totalStock <= 0 && (
                    <p className="text-sm text-red-600 mt-2">Rupture de stock</p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <Card key={product.id} className="flex gap-4">
                  <Link to={`/shop/${product.id}`} className="w-32 h-32 flex-shrink-0">
                    <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          Pas d'image
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1">
                    <Link to={`/shop/${product.id}`}>
                      <h3 className="font-medium text-lg hover:text-primary-600">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mb-2">{product.category?.name}</p>
                    <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xl font-bold text-primary-600">
                        {formatPrice(product.retailPrice)}
                      </p>
                      <Button onClick={() => handleQuickAdd(product)} disabled={product.totalStock <= 0}>
                        Ajouter au panier
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set('page', p.toString());
              setSearchParams(newParams);
            }}
          />
        </main>
      </div>
    </div>
  );
}
