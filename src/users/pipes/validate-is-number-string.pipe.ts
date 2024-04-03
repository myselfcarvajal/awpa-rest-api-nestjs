import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ValidateIsNumberStringPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value !== 'string' || isNaN(Number(value))) {
      throw new BadRequestException('Invalid number string');
    }
    return value;
  }
}
