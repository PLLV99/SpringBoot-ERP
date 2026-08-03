import { ProductionInterface } from "./ProductionInterface";

export interface ProductionLogInterface {
  id: number;
  production: ProductionInterface;
  qty: number;
  unit: string;
  /** When the batch was produced - chosen by the operator, may be back-dated */
  productionDate: string;
  /** When the row was keyed in - set by the server, read-only */
  recordedAt: string;
  remark: string;
}
