import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, ArrowLeft, CreditCard, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { formatINR } from '../utils/formatCurrency';

export default function Checkout() {
  const { cart, refreshCart, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Redirect to login if guest attempts checkout
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      showToast('Please sign in or create an account to proceed with checkout.', 'info');
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, authLoading, navigate, showToast]);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user ? user.name : '',
    addressLine: '42 Editorial Avenue, Suite 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    phone: '+1 (555) 019-2834',
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '•••• •••• •••• 4242',
    cardName: user ? user.name : 'Priya Sharma',
    expiry: '12/28',
    cvv: '•••'
  });

  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!shippingAddress.fullName || !shippingAddress.addressLine || !shippingAddress.city ||
        !shippingAddress.state || !shippingAddress.postalCode) {
      setErrorMessage('Please complete all required shipping fields.');
      return;
    }

    if (!cart.items || cart.items.length === 0) {
      setErrorMessage('Your shopping bag is empty.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createOrder({
        shippingAddress,
        paymentDetails
      });

      if (res.success && res.order) {
        setCompletedOrder(res.order);
        clearCart();
        await refreshCart();
        showToast('Order confirmed! (Simulated payment verified - no real money was charged)');
      } else {
        setErrorMessage(res.message || 'Failed to place order.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred during order processing.');
    } finally {
      setSubmitting(false);
    }
  };

  // Order Confirmation View
  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8 animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-ivory text-burgundy border border-taupe-light mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-burgundy font-semibold block">Order Confirmed</span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-light">
            Thank you for shopping with StyleSense.
          </h1>
          <p className="font-mono text-xs text-charcoal">
            Order Reference: {completedOrder.orderNumber}
          </p>
        </div>

        {/* Academic Simulated Disclaimer */}
        <div className="p-4 bg-ivory border border-taupe-light/70 text-xs font-sans text-taupe-dark max-w-xl mx-auto text-left leading-relaxed">
          <strong className="text-charcoal">Academic Simulation Notice: </strong>
          This transaction was conducted in demonstration mode. Inventory was atomically locked and decremented in the database, order historical snapshots were created, and the shopping cart was cleared. <em>No real financial charges were incurred.</em>
        </div>

        {/* Summary Card */}
        <div className="bg-white border border-taupe-light/70 p-6 text-left space-y-4 max-w-xl mx-auto">
          <h3 className="font-serif text-lg font-light text-charcoal pb-3 border-b border-taupe-light/70">
            Purchased Pieces Snapshot
          </h3>
          <div className="space-y-3 text-xs font-sans">
            {completedOrder.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-charcoal">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-taupe ml-2">({item.size} / {item.color} × {item.quantity})</span>
                </div>
                <span className="font-medium">{formatINR(item.line_total)}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-taupe-light/70 flex justify-between font-semibold text-sm text-charcoal">
              <span>Total Paid (Simulated)</span>
              <span className="text-base">{formatINR(completedOrder.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Link to="/orders">
            <button className="editorial-btn-primary px-6 py-3 text-xs uppercase tracking-wider font-semibold">
              View Order History
            </button>
          </Link>
          <Link to="/shop">
            <button className="editorial-btn-secondary px-6 py-3 text-xs uppercase tracking-wider font-semibold">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-taupe-light flex items-center justify-between">
        <div>
          <span className="editorial-subheading">Secure Checkout</span>
          <h1 className="editorial-heading text-3xl sm:text-4xl mt-1">Delivery & Payment</h1>
        </div>
        <Link
          to="/cart"
          className="text-xs font-sans font-semibold uppercase tracking-wider text-taupe hover:text-charcoal flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Bag</span>
        </Link>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-sans flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Delivery & Payment Details */}
        <div className="lg:col-span-7 space-y-8">
          {/* Shipping Address Section */}
          <div className="bg-white border border-taupe-light p-6 sm:p-8 space-y-5 shadow-editorial">
            <h2 className="editorial-heading text-xl pb-3 border-b border-taupe-light">
              1. Delivery Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Full Recipient Name"
                  required
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Street Address / Suite"
                  required
                  value={shippingAddress.addressLine}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine: e.target.value })}
                />
              </div>

              <div>
                <Input
                  label="City"
                  required
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                />
              </div>

              <div>
                <Input
                  label="State / Region"
                  required
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                />
              </div>

              <div>
                <Input
                  label="Postal Code"
                  required
                  value={shippingAddress.postalCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                />
              </div>

              <div>
                <Input
                  label="Phone Number"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Payment Section (Clearly Labeled Simulated Payment) */}
          <div className="bg-white border border-taupe-light p-6 sm:p-8 space-y-5 shadow-editorial">
            <div className="flex items-center justify-between pb-3 border-b border-taupe-light">
              <h2 className="editorial-heading text-xl">
                2. Payment Method
              </h2>
              <span className="text-[10px] font-sans uppercase font-bold tracking-widest bg-burgundy/10 text-burgundy px-2 py-0.5">
                Simulated Sandbox
              </span>
            </div>

            {/* Academic Notice Banner */}
            <div className="p-3.5 bg-ivory border border-taupe-light text-xs font-sans text-taupe-dark flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-burgundy shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Academic Demo Mode: </strong>
                This payment method simulates a secure test gateway. No real credit card details or real money are collected or processed.
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Card Number"
                disabled
                value={paymentDetails.cardNumber}
                helperText="Pre-configured sandbox test card"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Expiry"
                  disabled
                  value={paymentDetails.expiry}
                />
                <Input
                  label="Security Code"
                  disabled
                  value={paymentDetails.cvv}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-5 bg-white border border-taupe-light p-6 sm:p-8 space-y-6 shadow-editorial sticky top-28">
          <h2 className="editorial-heading text-xl pb-3 border-b border-taupe-light">
            Order Review
          </h2>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-taupe-light/50">
            {cart.items?.map((item) => (
              <div key={item.id} className="pt-2 flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-12 h-14 object-cover object-top border border-taupe-light"
                  />
                  <div>
                    <p className="font-semibold text-charcoal line-clamp-1">{item.name}</p>
                    <p className="text-[11px] text-taupe">{item.size} • {item.color} • Qty {item.quantity}</p>
                  </div>
                </div>
                <span className="font-serif font-medium text-charcoal">{formatINR(item.line_total)}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-taupe-light/70 space-y-2 text-xs font-sans">
            <div className="flex justify-between text-taupe-dark">
              <span>Subtotal</span>
              <span className="font-serif">{formatINR(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-taupe-dark">
              <span>Shipping</span>
              <span className="font-serif">{cart.shippingFee === 0 ? 'FREE' : formatINR(cart.shippingFee)}</span>
            </div>
            <div className="flex justify-between text-taupe-dark">
              <span>Estimated Tax (8%)</span>
              <span className="font-serif">{formatINR(cart.taxAmount)}</span>
            </div>
            <div className="pt-3 border-t border-taupe-light flex justify-between font-bold text-base text-charcoal">
              <span className="uppercase tracking-wider">Total</span>
              <span className="font-serif text-2xl">{formatINR(cart.total)}</span>
            </div>
          </div>

          <Button
            type="submit"
            variant="burgundy"
            size="lg"
            loading={submitting}
            className="w-full"
            icon={Lock}
          >
            Place Simulated Order ({formatINR(cart.total)})
          </Button>

          <p className="text-[10px] text-center text-taupe-muted font-sans">
            By placing your order, you trigger atomic database stock verification and confirmation snapshots.
          </p>
        </div>
      </form>
    </div>
  );
}
