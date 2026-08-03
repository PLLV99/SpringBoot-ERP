import { ProductionInterface } from "./ProductionInterface";

export interface ProductionLossInterface {
  id: number;
  production: ProductionInterface;
  qty: number;
  unit: string;
  /** When the scrap happened - chosen by the operator, may be back-dated */
  productionDate: string;
  /** When the row was keyed in - set by the server, read-only */
  recordedAt: string;
  remark: string;
}
