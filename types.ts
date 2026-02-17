
export interface PricingTier {
  id: string;
  name: string;
  price: number;
  tokens: string;
  features: string[];
  popular?: boolean;
  color: string;
}

export interface PaymentStatus {
  status: 'idle' | 'pending' | 'success' | 'failed';
  message?: string;
  transactionId?: string;
}

export interface LipanaResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  id?: string;
  data?: {
    transactionId?: string;
    status?: string;
    checkoutRequestID?: string;
    message?: string;
  };
}
