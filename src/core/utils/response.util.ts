import { HttpStatus } from "@nestjs/common";
import { Response } from "../../common/types/response.types";

/**
 * Every successful response goes through this — controllers never build
 * response objects by hand, so all endpoints share one contract:
 *
 *   { "status": 200, "data": {...}, "message": "...", "timestamp": "..." }
 */
export class ResponseUtil {
  static ok<T>(data: T, message: string): Response<T> {
    return ResponseUtil.build(HttpStatus.OK, data, message);
  }

  static created<T>(data: T, message: string): Response<T> {
    return ResponseUtil.build(HttpStatus.CREATED, data, message);
  }

  private static build<T>(status: number, data: T, message: string): Response<T> {
    return {
      status,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }
}
