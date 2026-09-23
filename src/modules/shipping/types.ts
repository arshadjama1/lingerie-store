export interface DtdcPackageDimensions {
  length: number; // in cm
  width: number; // in cm
  height: number; // in cm
  weightKg: number; // in kg
}

export interface DtdcOriginDetails {
  name: string;
  phone: string;
  alternate_phone?: string;
  address_line_1: string;
  address_line_2?: string;
  pincode: string | number;
  city: string;
  state: string;
  latitude?: string;
  longitude?: string;
}

export interface DtdcDestinationDetails {
  name: string;
  phone: string;
  alternate_phone?: string;
  address_line_1: string;
  address_line_2?: string;
  pincode: string | number;
  city: string;
  state: string;
  latitude?: string;
  longitude?: string;
}

export interface DtdcReturnDetails {
  name: string;
  phone: string;
  alternate_phone?: string;
  address_line_1: string;
  address_line_2?: string;
  pincode: string | number;
  city_name: string;
  state_name: string;
  email?: string;
  latitude?: string;
  longitude?: string;
}

export interface DtdcConsignmentItem {
  customer_code: string;
  service_type_id: string;
  load_type: "NON-DOCUMENT" | "DOCUMENT";
  description: string;
  consignment_type: "Forward" | "Reverse";
  dimension_unit: "cm";
  length: string;
  width: string;
  height: string;
  weight_unit: "kg";
  weight: string;
  declared_value: string;
  num_pieces: string;
  customer_reference_number: string;
  commodity_id: string;
  origin_details: DtdcOriginDetails;
  destination_details: DtdcDestinationDetails;
  return_details?: DtdcReturnDetails;
  is_risk_surcharge_applicable: boolean;
  cod_amount: string;
  cod_collection_mode: string;
  reference_number?: string;
  eway_bill?: string;
  invoice_number?: string;
  invoice_date?: string;
}

export interface DtdcSoftdataRequest {
  consignments: DtdcConsignmentItem[];
}

export interface DtdcSoftdataResponseItem {
  success: boolean;
  reference_number?: string; // AWB number
  customer_reference_number?: string;
  courier_partner?: string | null;
  courier_account?: string;
  chargeable_weight?: number;
  barCodeData?: string;
  error?: {
    message?: string;
    code?: string;
    reason?: string;
  };
}

export interface DtdcSoftdataResponse {
  status: string;
  data: DtdcSoftdataResponseItem[];
  message?: string;
}

export interface DtdcShipmentResult {
  awbNumber: string;
  referenceNumber: string;
  courierName: "DTDC";
  labelUrl?: string;
}

export interface DtdcCancelRequest {
  AWBNo: string[];
  customerCode: string;
}

export interface DtdcCancelResponse {
  status: string;
  success: boolean;
  failures?: Array<{
    reference_number: string;
    message: string;
    reason?: string;
    code?: string;
  }>;
  successConsignments?: Array<{
    success: boolean;
    reference_number: string;
  }>;
}

export interface DtdcCancelResult {
  success: boolean;
  awbNumber: string;
  message?: string;
}

export interface DtdcPincodeResponse {
  SERV_LIST?: Array<{
    Special_Destination?: string;
    COD_Serviceable?: string; // "YES" | "NO"
    GEC_Serviceable?: string;
    LITE_Serviceable?: string;
    DC_Serviceable?: string;
    Remote_Delivery_Area?: string;
  }>;
  ZIPCODE_RESP?: Array<{
    ORGPIN: string;
    DESTPIN: string;
    ORGCOUNTRY: string;
    DESTCOUNTRY: string;
    SERVFLAG: string; // "Y" | "N"
    SERV_COD: string; // "Y" | "N"
  }>;
  SERV_LIST_DTLS?: Array<{
    CODE: string;
    NAME: string;
    PCODE: string;
    TAT: string; // e.g. "1", "2"
  }>;
}

export interface DtdcServiceabilityResult {
  isServiceable: boolean;
  isCodAvailable: boolean;
  tatDays: number;
  orgPincode: string;
  desPincode: string;
  serviceName?: string;
}

export interface DtdcTrackingCheckpoint {
  statusCode: string;
  status: string;
  location: string;
  timestamp: string;
  remarks?: string;
}

export interface DtdcTrackingResult {
  awbNumber: string;
  currentStatus: string;
  expectedDeliveryDate?: string;
  destinationCity?: string;
  checkpoints: DtdcTrackingCheckpoint[];
}
