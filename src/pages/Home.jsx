import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Truck, CreditCard, Shield, Star, Package } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { productsAPI, categoriesAPI, getImageUrl } from '../services/api';
import { formatPrice } from '../utils/format';

// Images de catégories
const categoryImages = {
  'T-Shirts': 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400',
  'Jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
  'Dresses': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
  'Jackets': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
  'Accessories': 'https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?w=400',
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll({ limit: 8 }),
        categoriesAPI.getAll(),
      ]);
      setFeaturedProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const features = [
    { icon: ShoppingBag, title: 'Large Sélection', desc: 'Des milliers de produits à découvrir' },
    { icon: Truck, title: 'Livraison Rapide', desc: 'Expédition fiable et rapide' },
    { icon: CreditCard, title: 'Paiement Sécurisé', desc: 'Plusieurs options de paiement' },
    { icon: Shield, title: 'Qualité Garantie', desc: 'Produits 100% authentiques' },
  ];

  return (
    <div>
      {/* Hero Section avec image de fond */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-800/70" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-20 text-white">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              ✨ Nouvelle Collection Disponible
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Bienvenue chez <span className="text-yellow-400">WONDERSHOP</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Votre destination mode pour des vêtements et accessoires de qualité.
              Prix de gros et détail imbattables!
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100 shadow-lg">
                  Découvrir la Boutique
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/wholesale">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                  <Package className="w-5 h-5 mr-2" />
                  Prix de Gros
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-white/20">
              <div>
                <p className="text-3xl font-bold text-yellow-400">500+</p>
                <p className="text-gray-300">Produits</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-400">1000+</p>
                <p className="text-gray-300">Clients Satisfaits</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-400">24/7</p>
                <p className="text-gray-300">Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories avec images */}
      {categories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Nos Catégories</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explorez notre large gamme de produits soigneusement sélectionnés pour vous
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {categories.slice(0, 5).map((category) => (
                <Link
                  key={category.id}
                  to={`/shop?category=${category.id}`}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-2xl aspect-square shadow-md">
                    <img
                      src={categoryImages[category.name] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-bold text-white text-lg">
                        {category.name}
                      </h3>
                      <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
                        Voir plus <ArrowRight className="w-4 h-4" />
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bannière Promo */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div
            className="relative overflow-hidden rounded-3xl p-8 md:p-12"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-pink-600/80" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-white text-center md:text-left">
                <span className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold mb-4">
                  OFFRE SPÉCIALE
                </span>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  Jusqu'à -30% sur les Prix de Gros
                </h3>
                <p className="text-white/80">
                  Profitez de remises exceptionnelles pour vos achats en quantité
                </p>
              </div>
              <Link to="/wholesale">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl whitespace-nowrap">
                  En Profiter Maintenant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold">Produits Populaires</h2>
                <p className="text-gray-600 mt-2">Nos articles les plus demandés</p>
              </div>
              <Link to="/shop" className="text-primary-600 hover:underline flex items-center gap-1 font-medium">
                Voir Tout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link key={product.id} to={`/shop/${product.id}`}>
                  <Card className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
                    <div className="aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                      {product.images?.[0] ? (
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Pas d'image
                        </div>
                      )}
                      {/* Badge nouveau */}
                      <span className="absolute top-3 left-3 px-2 py-1 bg-primary-600 text-white text-xs font-bold rounded-lg">
                        NOUVEAU
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-sm text-gray-500 ml-1">(4.8)</span>
                      </div>
                      <h3 className="font-semibold truncate group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-primary-600">
                          {formatPrice(product.retailPrice)}
                        </p>
                        {product.wholesalePrice < product.retailPrice && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Gros: {formatPrice(product.wholesalePrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Témoignages */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Ce que disent nos clients</h2>
            <p className="text-gray-600">Des milliers de clients satisfaits</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Aminata K.', text: 'Excellente qualité et livraison rapide! Je recommande vivement.', city: 'Abidjan' },
              { name: 'Moussa D.', text: 'Les prix de gros sont vraiment avantageux. Parfait pour mon business.', city: 'Dakar' },
              { name: 'Fatou B.', text: 'Service client au top et produits conformes aux photos. Merci!', city: 'Bamako' },
            ].map((testimonial, i) => (
              <Card key={i} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-4">"{testimonial.text}"</p>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.city}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section
        className="py-20 relative overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 to-primary-700/90" />
        <div className="relative max-w-7xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à Faire de Bonnes Affaires?
          </h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto text-lg">
            Rejoignez notre communauté et profitez de nos meilleurs prix.
            Inscription gratuite et sans engagement!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100 shadow-xl">
                Créer un Compte
              </Button>
            </Link>
            <Link to="/wholesale">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                Voir les Prix de Gros
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
