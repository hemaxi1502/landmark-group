import {useCallback, useEffect, useState} from 'react';
/**
 * Delivery pincode shared by the utility bar and the PDP delivery check.
 *
 * DEMO STUB: `estimateDelivery` uses a fixed rule. Replace it with the
 * logistics partner's serviceability API (e.g. via a resource route that
 * calls Xpressbees/Delhivery server-side) before launch.
 */
const KEY = 'delivery-pincode';
const EVENT = 'pincode-change';
export const isValidPincode = (value) => /^[1-9][0-9]{5}$/.test(value);
export function usePincode() {
  const [pincode, setState] = useState('');
  useEffect(() => {
    const sync = () => setState(window.localStorage.getItem(KEY) ?? '');
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  const setPincode = useCallback((value) => {
    try {
      window.localStorage.setItem(KEY, value);
    } catch {
      /* storage blocked */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return {pincode, setPincode};
}
export function estimateDelivery(pincode, from = new Date()) {
  // Metro pincode prefixes deliver faster in this stub.
  const metro = ['11', '40', '56', '60', '70', '50', '41', '38'].includes(
    pincode.slice(0, 2),
  );
  const days = metro ? 3 : 6;
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}
