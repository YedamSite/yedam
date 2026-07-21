import React from 'react';
import VisaLogo from 'react-payment-logos/dist/logo/Visa';
import MastercardLogo from 'react-payment-logos/dist/logo/Mastercard';
import AmexLogo from 'react-payment-logos/dist/logo/Amex';
import PaypalLogo from 'react-payment-logos/dist/logo/Paypal';
import DinersLogo from 'react-payment-logos/dist/logo/Diners';

// We override the default width/height of 48px from the library by passing style props.
// This allows the parent component (e.g. envios page) to control the height via classes like 'h-8' or 'h-5',
// and the SVG will automatically scale its width according to its intrinsic viewBox aspect ratio.
export const Visa = ({ className, ...props }: any) => (
  <VisaLogo className={className} style={{ height: '100%', width: 'auto', maxHeight: '100%', display: 'block' }} {...props} />
);

export const Mastercard = ({ className, ...props }: any) => (
  <MastercardLogo className={className} style={{ height: '100%', width: 'auto', maxHeight: '100%', display: 'block' }} {...props} />
);

export const Amex = ({ className, ...props }: any) => (
  <AmexLogo className={className} style={{ height: '100%', width: 'auto', maxHeight: '100%', display: 'block' }} {...props} />
);

export const PayPal = ({ className, ...props }: any) => (
  <PaypalLogo className={className} style={{ height: '100%', width: 'auto', maxHeight: '100%', display: 'block' }} {...props} />
);

export const DinersClub = ({ className, ...props }: any) => (
  <DinersLogo className={className} style={{ height: '100%', width: 'auto', maxHeight: '100%', display: 'block' }} {...props} />
);
