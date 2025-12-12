import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OfferCard from './OfferCard';

const ExpandableOffers = ({ 
  order, 
  offers, 
  isOpen, 
  onAcceptOffer, 
  loading 
}) => {
 if (!isOpen) {
    return null;
  }

  const hasOffers = offers && offers.length > 0;

  return (
    <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: 1, 
            height: 'auto',
            transition: {
              opacity: { duration: 0.2 },
              height: { duration: 0.3, ease: 'easeInOut' }
            }
          }}
          exit={{ 
            opacity: 0, 
            height: 0,
            transition: {
              opacity: { duration: 0.1 },
              height: { duration: 0.2, ease: 'easeInOut' }
            }
          }}
          className="mt-4 ml-6 mr-2 border-l-2 border-gray-20 pl-4 pb-4 border-b border-gray-100"
        >
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-8 h-0.5 bg-blue-200"></div>
              عروض ({hasOffers ? offers.length : 0})
              <div className="w-8 h-0.5 bg-blue-200"></div>
            </h4>
            {hasOffers ? (
              <div className="space-y-3">
                {offers.map((offer) => (
                  <OfferCard
                    key={offer.offer_id}
                    offer={offer}
                    onAcceptOffer={(offerId) => onAcceptOffer(order.order_id, offerId)}
                    loading={loading}
                    orderStatus={order.order_status}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 italic">
                لا توجد عروض متاحة لهذا الطلب
              </div>
            )}
          </div>
        </motion.div>
    </AnimatePresence>
  );
};

export default ExpandableOffers;
