export interface CourierConfig {
  value: string;
  name: string;
  prefix: string;
}

export const COURIER_CONFIG: CourierConfig[] = [
  { value: "Servientrega", name: "Servientrega", prefix: "SE" },
  { value: "LaarCourier", name: "LaarCourier", prefix: "LAAR" },
  { value: "TramacoExpress", name: "TramacoExpress", prefix: "TRM" },
  { value: "DHL", name: "DHL", prefix: "DHL" },
  { value: "FedEx", name: "FedEx", prefix: "FDX" },
  { value: "TransportePesado", name: "TransportePesado", prefix: "TP" },
  { value: "AutoEntrega", name: "AutoEntrega", prefix: "AUTO" },
];

export const getCourierConfig = (courierName: string): CourierConfig | undefined => {
  return COURIER_CONFIG.find(courier => courier.value === courierName);
};

export const generateTrackingNumber = (company: string): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();

  const courierConfig = getCourierConfig(company);

  if (!courierConfig) {
    return `TRK${timestamp.slice(-8)}${random}`;
  }

  const { prefix } = courierConfig;

  switch (prefix) {
    case "CE":
      return `${prefix}${timestamp.slice(-8)}${random}`;
    case "SEUR":
      return `${prefix}${timestamp.slice(-6)}${random.slice(0, 4)}`;
    case "MRW":
      return `${prefix}${timestamp.slice(-7)}${random.slice(0, 3)}`;
    case "DHL":
      return `${prefix}${timestamp.slice(-8)}${random}`;
    case "FDX":
      return `${prefix}${timestamp.slice(-8)}${random}`;
    case "1Z":
      return `${prefix}${random}${timestamp.slice(-6)}`;
    case "NCX":
      return `${prefix}${timestamp.slice(-8)}${random}`;
    case "GLS":
      return `${prefix}${timestamp.slice(-8)}${random}`;
    default:
      return `TRK${timestamp.slice(-8)}${random}`;
  }
};