const ASSIGNMENT_BASE = "/assignments";

export default {
  create: (orderId: string, userDeliveryId: string) =>
    `${ASSIGNMENT_BASE}/order/${orderId}/DeliveryDriver/${userDeliveryId}`,
  list: `${ASSIGNMENT_BASE}`,
  delete: (id: string) => `${ASSIGNMENT_BASE}/${id}`,
  update: (id: string) => `${ASSIGNMENT_BASE}/${id}`,
  reportJSON: (driverId: string) => `${ASSIGNMENT_BASE}/reports/driver/${driverId}/today/json`,
  reportCSV: (driverId: string) => `${ASSIGNMENT_BASE}/reports/driver/${driverId}/today/csv`,
  reportPDF: (driverId: string) => `${ASSIGNMENT_BASE}/reports/driver/${driverId}/today/pdf`,
  reportEXCEL: (driverId: string) => `${ASSIGNMENT_BASE}/reports/driver/${driverId}/today/excel`,

};
