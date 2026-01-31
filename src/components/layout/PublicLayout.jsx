import { Outlet, Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Heart } from 'lucide-react';
import Header from './Header';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        {/* Newsletter Section */}
        <div className="bg-primary-600">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Abonnez-vous à notre newsletter</h3>
                <p className="text-primary-100">Recevez nos offres exclusives et nouveautés</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Votre email..."
                  className="px-4 py-3 rounded-lg text-gray-900 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
                  S'abonner
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold mb-4">
                <span className="text-primary-400">WONDER</span>SHOP
              </h3>
              <p className="text-gray-400 mb-6">
                Votre destination mode pour des vêtements et accessoires de qualité.
                Prix de gros et détail imbattables!
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Liens Rapides */}
            <div>
              <h4 className="font-bold text-lg mb-4">Liens Rapides</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/shop" className="text-gray-400 hover:text-white transition-colors">
                    Boutique
                  </Link>
                </li>
                <li>
                  <Link to="/wholesale" className="text-gray-400 hover:text-white transition-colors">
                    Prix de Gros
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-400 hover:text-white transition-colors">
                    Créer un compte
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                    Se connecter
                  </Link>
                </li>
              </ul>
            </div>

            {/* Service Client */}
            <div>
              <h4 className="font-bold text-lg mb-4">Service Client</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Livraison
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Retours & Échanges
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Conditions Générales
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-400">
                  <MapPin className="w-5 h-5 text-primary-400" />
                  <span>Senegal,Dakar</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <Phone className="w-5 h-5 text-primary-400" />
                  <span>77 879 25 90</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <Mail className="w-5 h-5 text-primary-400" />
                  <span>contact@wondershop.com</span>
                </li>
              </ul>

              {/* Payment Methods */}
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-2">Moyens de paiement acceptés</p>
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-gray-800 rounded text-xs">Mobile Money</div>
                  <div className="px-3 py-1 bg-gray-800 rounded text-xs">Cash</div>
                  <div className="px-3 py-1 bg-gray-800 rounded text-xs">Carte</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} WONDERSHOP. Tous droits réservés.
              </p>
              <p className="text-gray-400 text-sm flex items-center gap-1">
                Fait  <Heart className="w-4 h-4 text-red-500 fill-red-500" /> à DAKAR
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
