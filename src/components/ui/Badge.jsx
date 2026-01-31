const variants = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  gray: 'badge-gray',
};

export default function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span className={`${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// Status badge helper
export function StatusBadge({ status }) {
  const statusConfig = {
    // Order status
    PENDING: { variant: 'warning', label: 'Pending' },
    CONFIRMED: { variant: 'info', label: 'Confirmed' },
    PROCESSING: { variant: 'info', label: 'Processing' },
    SHIPPED: { variant: 'info', label: 'Shipped' },
    DELIVERED: { variant: 'success', label: 'Delivered' },
    CANCELLED: { variant: 'danger', label: 'Cancelled' },
    // Payment status
    PAID: { variant: 'success', label: 'Paid' },
    FAILED: { variant: 'danger', label: 'Failed' },
    REFUNDED: { variant: 'gray', label: 'Refunded' },
    // Delivery status
    ASSIGNED: { variant: 'info', label: 'Assigned' },
    PICKED_UP: { variant: 'info', label: 'Picked Up' },
    IN_TRANSIT: { variant: 'warning', label: 'In Transit' },
  };

  const config = statusConfig[status] || { variant: 'gray', label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
