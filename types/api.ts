export interface ApiError {
  message: string;
  status?: number;
}

export interface ScanResultItem {
  name: string;
  price: number;
  quantity?: number;
  confidence?: number;
}

export interface ScanResult {
  merchant: string;
  total: number;
  currency: string;
  date: string;
  category: string;
  items: ScanResultItem[];
  receiptNumber?: string;
  paymentMethod?: string;
  confidence: {
    merchant: number;
    total: number;
    date: number;
    category: number;
    currency?: number;
    items?: number;
  };
}

export interface EmailParsedReceipt {
  from: string;
  subject: string;
  bodyText: string;
  attachments?: string[];
  merchant?: string;
  total?: number;
  date?: string;
  confidence?: number;
}
