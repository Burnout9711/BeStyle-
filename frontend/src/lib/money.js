export const formatAED = (n) =>
  typeof n === 'number'
    ? new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(n)
    : '';