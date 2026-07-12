/**
 * The single success-response contract for the whole API.
 * Built exclusively by ResponseUtil — never by hand.
 */
export interface Response<T = unknown> {
  status: number;
  data: T;
  message: string;
  timestamp: string;
}
