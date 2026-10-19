import { APP_CONFIG } from "@/lib/config/app-config";

export interface DeliveryCalculationResult {
  fee: number;
  isFree: boolean;
  reason: string;
}

export function calculateDeliveryFee(
  subtotalRs: number,
  distanceKm: number
): DeliveryCalculationResult {
  const {
    freeDistanceThresholdKm,
    freeOrderSubtotalThresholdRs,
    standardDeliveryFeeRs,
  } = APP_CONFIG.deliveryRules;

  if (subtotalRs <= 0) {
    return { fee: 0, isFree: true, reason: "Empty cart" };
  }

  if (distanceKm <= freeDistanceThresholdKm) {
    return {
      fee: 0,
      isFree: true,
      reason: `FREE Delivery (Within ${freeDistanceThresholdKm} km radius)`,
    };
  }

  if (subtotalRs > freeOrderSubtotalThresholdRs) {
    return {
      fee: 0,
      isFree: true,
      reason: `FREE Delivery (Order above Rs. ${freeOrderSubtotalThresholdRs})`,
    };
  }

  return {
    fee: standardDeliveryFeeRs,
    isFree: false,
    reason: `Standard Delivery Charge (Distance > ${freeDistanceThresholdKm}km & Order <= Rs. ${freeOrderSubtotalThresholdRs})`,
  };
}

export function formatWeight(weightKg: number): string {
  if (weightKg < 1) {
    return `${Math.round(weightKg * 1000)} g`;
  }
  return `${weightKg} kg`;
}
