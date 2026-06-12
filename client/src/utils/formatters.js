export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStockStatus = (quantity, reorderLevel) => {
  if (quantity <= 0) {
    return { text: 'Out of Stock', color: 'red' };
  }
  if (quantity <= reorderLevel) {
    return { text: 'Low Stock', color: 'orange' };
  }
  return { text: 'In Stock', color: 'green' };
};