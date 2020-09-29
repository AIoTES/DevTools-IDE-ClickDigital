import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'selectedTrigger'
})
export class SelectedTriggerPipe implements PipeTransform {

  transform(value: any, args?: any): Array<any> {
    return value.split('AND');
  }

}
