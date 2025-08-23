// Stripe pricing table custom element declarations
declare namespace JSX {
  interface IntrinsicElements {
    'stripe-pricing-table': {
      'pricing-table-id': string;
      'publishable-key': string;
      'customer-email'?: string;
      'client-reference-id'?: string;
      [key: string]: any;
    };
  }
}

// Global Stripe types
declare global {
  interface Window {
    Stripe: any;
  }
}

export {};
