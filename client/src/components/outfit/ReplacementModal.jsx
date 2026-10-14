import React from 'react';
import Modal from '../common/Modal';
import { Check } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';

export default function ReplacementModal({
  isOpen,
  onClose,
  slotName,
  items = [],
  currentProductId,
  onSelectItem,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Select Replacement for ${slotName}`}
      subtitle="Modular Outfit Coordination"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        <p className="text-xs text-taupe font-sans">
          Choose a compatible replacement from our catalog. Total outfit cost will recalculate automatically.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {items.map((prod) => {
            const isCurrent = prod.id === currentProductId;
            return (
              <div
                key={prod.id}
                onClick={() => {
                  onSelectItem(prod);
                  onClose();
                }}
                className={`cursor-pointer border p-3 flex flex-col justify-between transition-all bg-white ${
                  isCurrent
                    ? 'border-burgundy ring-2 ring-burgundy/20 bg-burgundy-50/20'
                    : 'border-taupe-light hover:border-charcoal'
                }`}
              >
                <div className="aspect-[3/4] overflow-hidden bg-ivory mb-2 relative">
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-full h-full object-cover object-top"
                  />
                  {isCurrent && (
                    <div className="absolute top-2 right-2 bg-burgundy text-white p-1 rounded-full shadow-sm">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div>
                  <h5 className="font-serif text-xs font-medium text-charcoal line-clamp-1">{prod.name}</h5>
                  <p className="font-sans text-xs font-semibold text-charcoal mt-0.5">
                    {formatINR(prod.price)}
                  </p>
                </div>
                <button
                  type="button"
                  className={`mt-2 w-full py-1.5 text-[10px] font-sans font-semibold uppercase tracking-wider text-center border ${
                    isCurrent
                      ? 'border-burgundy text-burgundy bg-burgundy-50/50'
                      : 'border-charcoal text-charcoal hover:bg-charcoal hover:text-white'
                  }`}
                >
                  {isCurrent ? 'Current Selection' : 'Select'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
