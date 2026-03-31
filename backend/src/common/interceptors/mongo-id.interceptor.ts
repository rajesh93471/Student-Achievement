import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

const isPlainObject = (value: any) =>
  value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date);

const attachMongoId = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(attachMongoId);
  }
  if (isPlainObject(data)) {
    const next: any = {};
    Object.keys(data).forEach((key) => {
      const value = (data as any)[key];
      if (key === "id" && !("_id" in data)) {
        next._id = value;
      }
      next[key] = attachMongoId(value);
    });
    if ("id" in data && !("_id" in data)) {
      next._id = (data as any).id;
    }
    return next;
  }
  return data;
};

@Injectable()
export class MongoIdInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => attachMongoId(data)));
  }
}
