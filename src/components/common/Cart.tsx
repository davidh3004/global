import { useState, useEffect } from 'react';

interface CartItem {
  name: string;
  price: number;
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Escuchar eventos del carrito
    const handleAddToCart = (e: CustomEvent) => {
      const { name, price } = e.detail;
      setCart((prev) => [...prev, { name, price }]);
      setIsOpen(true);
    };

    window.addEventListener('addToCart', handleAddToCart as EventListener);
    return () => window.removeEventListener('addToCart', handleAddToCart as EventListener);
  }, []);

  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-[200] transition-opacity duration-250 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[380px] max-w-full bg-white z-[201] flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div className="font-display text-xl font-extrabold">Your Cart</div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-lg border border-gray-200 bg-transparent cursor-pointer flex items-center justify-center transition-colors duration-150 hover:bg-gray-100"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 stroke-gray-600 stroke-2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="text-center py-10 px-4 text-gray-400">
              <div className="text-4xl mb-3">🪣</div>
              <p className="font-semibold text-gray-600">Your cart is empty</p>
              <p className="text-xs text-gray-400 mt-1">Browse our materials to add items</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={index}
                className="flex gap-3 py-3.5 border-b border-gray-200"
              >
                <div className="flex-1">
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {item.price ? `$${item.price}/ton` : 'Call for pricing'}
                  </div>
                </div>
                <button
                  onClick={() => removeItem(index)}
                  className="text-[11px] text-gray-300 bg-none border-none cursor-pointer self-start hover:text-gray-600"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-gray-200">
            <div className="flex justify-between items-center mb-3.5">
              <div className="text-[13px] text-gray-400">Estimated total</div>
              <div className="font-display text-2xl font-extrabold">
                {total ? `$${total.toFixed(0)}` : 'By quote'}
              </div>
            </div>
            <button className="w-full py-3 rounded-lg bg-green text-white text-sm font-bold border-none cursor-pointer transition-all duration-150 mb-2 hover:bg-green-dark">
              Proceed to Checkout →
            </button>
            <button className="w-full py-2.5 rounded-lg border-[1.5px] border-gray-200 bg-transparent text-[13px] font-semibold text-gray-600 cursor-pointer transition-all duration-150 hover:border-green hover:text-green">
              Request Quote Instead
            </button>
          </div>
        )}
      </div>

      {/* Trigger button (se renderiza en el header) */}
      <div
        id="cartTriggerReact"
        className="relative cursor-pointer w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center transition-all duration-150 hover:border-green"
        onClick={() => setIsOpen(true)}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px] stroke-gray-600 stroke-2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
        </svg>
        {cart.length > 0 && (
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-green text-white text-[9px] font-bold flex items-center justify-center">
            {cart.length}
          </div>
        )}
      </div>
    </>
  );
}
