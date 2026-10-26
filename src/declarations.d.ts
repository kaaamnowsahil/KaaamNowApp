declare module '*.svg' {
  import type { FC } from 'react';
  import type { SvgProps } from 'react-native-svg';
  const content: FC<SvgProps>;
  export default content;
}

declare module 'react-native-razorpay' {
  export type RazorpaySuccess = {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  };
  const RazorpayCheckout: {
    /** Rejects with `{ code, description }` when the user cancels or payment fails. */
    open: (options: Record<string, unknown>) => Promise<RazorpaySuccess>;
  };
  export default RazorpayCheckout;
}
