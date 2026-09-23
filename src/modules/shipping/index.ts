export {
  createDtdcShipment,
  getDtdcShippingLabel,
  cancelDtdcShipment,
  checkDtdcPincodeServiceability,
  getDtdcTracking,
  calculateDefaultPackageDimensions,
} from "./dtdc";

export type {
  DtdcPackageDimensions,
  DtdcShipmentResult,
  DtdcCancelResult,
  DtdcServiceabilityResult,
  DtdcTrackingCheckpoint,
  DtdcTrackingResult,
} from "./types";
