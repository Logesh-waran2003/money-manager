export interface UpiData {
  vpa: string;
  name: string;
  amount?: string;
  note?: string;
  transactionId?: string;
}

export function parseUpiUrl(url: string): UpiData | null {
  if (!url.startsWith('upi://pay?')) {
    return null;
  }

  const params = new URLSearchParams(url.replace('upi://pay?', ''));
  
  const vpa = params.get('pa');
  const name = params.get('pn');
  
  if (!vpa || !name) {
    return null;
  }

  return {
    vpa,
    name,
    amount: params.get('am') || undefined,
    note: params.get('tn') || undefined,
    transactionId: params.get('tr') || undefined,
  };
}
