import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const isPlainObject = (value: any) =>
  value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  !(value instanceof Date) &&
  !Buffer.isBuffer(value) &&
  (Object.getPrototypeOf(value) === Object.prototype ||
    Object.getPrototypeOf(value) === null);

const attachMongoId = (data: any, seen = new WeakMap<object, any>()): any => {
  if (Array.isArray(data)) {
    if (seen.has(data)) {
      return seen.get(data);
    }
    const nextArray: any[] = [];
    seen.set(data, nextArray);
    data.forEach((item) => {
      nextArray.push(attachMongoId(item, seen));
    });
    return nextArray;
  }

  if (isPlainObject(data)) {
    if (seen.has(data)) {
      return seen.get(data);
    }
    const next: any = {};
    seen.set(data, next);
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (key === 'id' && !('_id' in data)) {
        next._id = value;
      }
      next[key] = attachMongoId(value, seen);
    });
    if ('id' in data && !('_id' in data)) {
      next._id = data.id;
    }
    return next;
  }
  return data;
};

@Injectable()
export class MongoIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((data) => {
        if (data === response) return data;
        try {
          return attachMongoId(data);
        } catch (error) {
          console.error('MongoIdInterceptor failed:', error);
          return data;
        }
      }),
    );
  }
}
