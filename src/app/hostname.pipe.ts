import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hostname'
})
export class HostnamePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (args.length === 0) {
      return value;
    }
    return value.filter(o => args.includes(o.hostname))
  }

}
