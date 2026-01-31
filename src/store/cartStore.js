import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      orderType: 'RETAIL',

      addItem: (product, variant, quantity = 1) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          (item) =>
            item.productId === product.id &&
            item.size === variant.size &&
            item.color === variant.color
        );

        if (existingIndex > -1) {
          const newItems = [...items];
          newItems[existingIndex].quantity += quantity;
          set({ items: newItems });
        } else {
          set({
            items: [
              ...items,
              {
                productId: product.id,
                product: {
                  id: product.id,
                  name: product.name,
                  sku: product.sku,
                  retailPrice: product.retailPrice,
                  wholesalePrice: product.wholesalePrice,
                  minWholesaleQty: product.minWholesaleQty,
                  images: product.images,
                },
                size: variant.size,
                color: variant.color,
                quantity,
                maxQuantity: variant.quantity,
              },
            ],
          });
        }
      },

      updateQuantity: (index, quantity) => {
        const items = [...get().items];
        if (quantity <= 0) {
          items.splice(index, 1);
        } else {
          items[index].quantity = Math.min(quantity, items[index].maxQuantity);
        }
        set({ items });
      },

      removeItem: (index) => {
        const items = [...get().items];
        items.splice(index, 1);
        set({ items });
      },

      setOrderType: (type) => {
        set({ orderType: type });
      },

      clearCart: () => {
        set({ items: [], orderType: 'RETAIL' });
      },

      getSubtotal: () => {
        const { items, orderType } = get();
        return items.reduce((total, item) => {
          const isWholesale =
            orderType === 'WHOLESALE' &&
            item.quantity >= item.product.minWholesaleQty;
          const price = isWholesale
            ? parseFloat(item.product.wholesalePrice)
            : parseFloat(item.product.retailPrice);
          return total + price * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      getItemPrice: (item) => {
        const { orderType } = get();
        const isWholesale =
          orderType === 'WHOLESALE' &&
          item.quantity >= item.product.minWholesaleQty;
        return isWholesale
          ? parseFloat(item.product.wholesalePrice)
          : parseFloat(item.product.retailPrice);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;
