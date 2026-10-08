/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopUpPackage, CheckoutFormData, OrderResponse, PaymentMethod } from './types';
import { createOrder } from './services/api';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PackagesGrid } from './components/PackagesGrid';
import { HowToRedeem } from './components/HowToRedeem';
import { LiveTransactions } from './components/LiveTransactions';
import { TrustBadges } from './components/TrustBadges';
import { Footer } from './components/Footer';
import { CheckoutModal } from './components/CheckoutModal';
import { PaymentModal } from './components/PaymentModal';
import { SuccessModal } from './components/SuccessModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { SupportModal } from './components/SupportModal';
import { UidGuideModal } from './components/UidGuideModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { AdminPanelModal } from './components/AdminPanelModal';

export default function App() {
  // Modal states
  const [selectedPackage, setSelectedPackage] = useState<TopUpPackage | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [uidGuideModalOpen, setUidGuideModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Active transaction state
  const [activeOrder, setActiveOrder] = useState<OrderResponse | null>(null);
  const [checkoutForm, setCheckoutForm] = useState<CheckoutFormData | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [trackQuery, setTrackQuery] = useState('');

  // Payment success state
  const [successDetails, setSuccessDetails] = useState<{
    utr: string;
    orderId: string;
    amount: number;
    diamonds: number;
    playerUid: string;
    buyerName: string;
    buyerPhone: string;
    planName: string;
  } | null>(null);

  // Check URL pathname or hash for /admin or #admin
  useEffect(() => {
    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash === '#admin' || hash === '#/admin') {
        setAdminModalOpen(true);
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);

    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, []);

  // 1. Open Checkout on package selection
  const handleSelectPackage = (pkg: TopUpPackage) => {
    setSelectedPackage(pkg);
    setCheckoutModalOpen(true);
  };

  // 2. Submit Checkout form and create FamGateway order
  const handleCheckoutSubmit = async (formData: CheckoutFormData) => {
    if (!selectedPackage) return;
    setIsCreatingOrder(true);
    setCheckoutForm(formData);

    try {
      const order = await createOrder({
        amount: selectedPackage.amount,
        diamonds: selectedPackage.diamonds,
        bonusDiamonds: selectedPackage.bonusDiamonds,
        playerUid: formData.playerUid,
        customerName: formData.buyerName || formData.ign || 'Free Fire Player',
        customerPhone: formData.phone || '',
      });

      setActiveOrder(order);
      setCheckoutModalOpen(false);
      setPaymentModalOpen(true);
    } catch (err) {
      console.error('Failed to create order:', err);
      alert('Unable to generate payment order. Please check your network connection.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // 3. Payment Verified Success
  const handlePaymentSuccess = (utr: string, details: any) => {
    setPaymentModalOpen(false);

    const bName = details.buyer_name || checkoutForm?.buyerName || checkoutForm?.ign || 'Buyer';
    const bPhone = details.buyer_phone || checkoutForm?.phone || '';
    const pPlan = `${(details.diamonds || selectedPackage?.diamonds || 0).toLocaleString('en-IN')} Diamonds Balance`;
    const pAmt = `${details.amount || selectedPackage?.amount || 0} INR`;
    const pUid = details.player_uid || checkoutForm?.playerUid || '';
    const pOrderId = details.order_id || activeOrder?.order_id || 'FF_ORDER';

    setSuccessDetails({
      utr,
      orderId: pOrderId,
      amount: details.amount || selectedPackage?.amount || 0,
      diamonds: details.diamonds || selectedPackage?.diamonds || 0,
      playerUid: pUid,
      buyerName: bName,
      buyerPhone: bPhone,
      planName: pPlan,
    });

    // Exact user requested WhatsApp message format to 9286520702:
    // "Hello, I am buyer_name i pruchased <this_plan> of <this_amount> and my uid is <player_uid>."
    const exactMsg = `Hello, I am ${bName} i pruchased ${pPlan} of ${pAmt} and my uid is ${pUid}. (Order ID: ${pOrderId}, UTR: ${utr})`;
    const targetUrl = `https://wa.me/919286520702?text=${encodeURIComponent(exactMsg)}`;

    try {
      window.open(targetUrl, '_blank');
    } catch (e) {
      console.warn('Popup blocked, WhatsApp can be triggered from SuccessModal', e);
    }

    setSuccessModalOpen(true);
  };

  // 4. Retry Payment on Expiry
  const handleRetryPayment = () => {
    setPaymentModalOpen(false);
    if (selectedPackage) {
      setCheckoutModalOpen(true);
    }
  };

  // 5. Track Order trigger from Success Modal
  const handleTrackFromSuccess = (orderId: string) => {
    setTrackQuery(orderId);
    setTrackModalOpen(true);
  };

  return (
    <div className="min-h-screen cyber-bg text-slate-100 flex flex-col font-terminal selection:bg-emerald-500 selection:text-slate-950 pb-16 md:pb-0">
      {/* Top Navbar */}
      <Navbar
        onOpenTrack={() => {
          setTrackQuery('');
          setTrackModalOpen(true);
        }}
        onOpenSupport={() => setSupportModalOpen(true)}
        onOpenUidGuide={() => setUidGuideModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section with Live Countdown Timer */}
        <HeroSection />

        {/* Pricing Cards Grid (The 4 Diamond Cards) */}
        <PackagesGrid onSelectPackage={handleSelectPackage} />

        {/* 3 Easy Steps How to Redeem */}
        <HowToRedeem onOpenUidGuide={() => setUidGuideModalOpen(true)} />

        {/* Trust Badges & Guarantee Highlights */}
        <TrustBadges onOpenSupport={() => setSupportModalOpen(true)} />
      </main>

      {/* Footer with Mandatory Disclaimer & Admin Access */}
      <Footer
        onOpenTrack={() => {
          setTrackQuery('');
          setTrackModalOpen(true);
        }}
        onOpenSupport={() => setSupportModalOpen(true)}
        onOpenUidGuide={() => setUidGuideModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
      />

      {/* Dynamic Animated Dispatch Notification in Left Corner */}
      <LiveTransactions />

      {/* Floating 24/7 WhatsApp Support Action (Right Corner) */}
      <FloatingWhatsApp onOpenSupport={() => setSupportModalOpen(true)} />

      {/* Checkout Form Modal */}
      <CheckoutModal
        pkg={selectedPackage}
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onSubmit={handleCheckoutSubmit}
        onOpenUidGuide={() => setUidGuideModalOpen(true)}
        isLoading={isCreatingOrder}
      />

      {/* FamGateway UPI Payment Modal with Polling & QR */}
      <PaymentModal
        order={activeOrder}
        pkg={selectedPackage}
        playerUid={checkoutForm?.playerUid || ''}
        buyerName={checkoutForm?.buyerName}
        buyerPhone={checkoutForm?.phone}
        paymentMethod={checkoutForm?.paymentMethod || 'fampay_upi'}
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        onRetry={handleRetryPayment}
      />

      {/* Payment Success Confirmation Modal */}
      {successDetails && (
        <SuccessModal
          isOpen={successModalOpen}
          onClose={() => setSuccessModalOpen(false)}
          utr={successDetails.utr}
          orderId={successDetails.orderId}
          amount={successDetails.amount}
          diamonds={successDetails.diamonds}
          playerUid={successDetails.playerUid}
          buyerName={successDetails.buyerName}
          buyerPhone={successDetails.buyerPhone}
          planName={successDetails.planName}
          onTrackOrder={handleTrackFromSuccess}
        />
      )}

      {/* UID Location Guide Modal */}
      <UidGuideModal
        isOpen={uidGuideModalOpen}
        onClose={() => setUidGuideModalOpen(false)}
      />

      {/* Order Tracking Modal */}
      <TrackOrderModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        initialQuery={trackQuery}
      />

      {/* 24/7 Support & FAQs Modal */}
      <SupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />

      {/* Store Admin Panel (Protected: FamPay UPI Update & Full Orders Tracking) */}
      <AdminPanelModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onFamPayIdUpdated={(newFamPayId) => {
          if (activeOrder) {
            setActiveOrder({
              ...activeOrder,
              fampay_id: newFamPayId,
            });
          }
        }}
      />
    </div>
  );
}
