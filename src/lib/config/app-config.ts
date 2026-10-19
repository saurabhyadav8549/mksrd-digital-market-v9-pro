export const APP_CONFIG = {
  brand: {
    name: "MKSRD Fruits and Vegetables Digital Market",
    shortName: "MKSRD Market",
    tagline: "Fresh Mandi Produce Delivered in 15 Mins",
    supportPhone: "+91 78811 24766",
  },
  admin: {
    password: "mksrd@55555",
  },
  deliveryRules: {
    freeDistanceThresholdKm: 1.0,
    freeOrderSubtotalThresholdRs: 150,
    standardDeliveryFeeRs: 5,
  },
  weightOptions: [
    { label: "250 g", valueKg: 0.25 },
    { label: "500 g", valueKg: 0.5 },
    { label: "750 g", valueKg: 0.75 },
    { label: "1 kg", valueKg: 1.0 },
    { label: "1.5 kg", valueKg: 1.5 },
    { label: "2 kg", valueKg: 2.0 },
    { label: "3 kg", valueKg: 3.0 },
    { label: "5 kg", valueKg: 5.0 },
  ],
  weightStepKg: 0.25,
};