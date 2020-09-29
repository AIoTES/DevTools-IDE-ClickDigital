import { Pipe, PipeTransform } from '@angular/core';

interface Parent {
  name: string;
  icon: string;
  first_parent_icon: string;
}

// Item can be Tigger or Action Item

interface Item {
  parents: Array<Parent>;
  leafChild: any;
  first_parent: Parent;
}

type SelectItem = Item;

@Pipe({
  name: 'toItem'
})

export class SelectItemPipe implements PipeTransform {

  transform(item: Array<Item>, args?: any): Array<SelectItem> {
    return item.map(p => {
      const mapedItem = {
        parents: p.parents,
        leafChild: p.leafChild,
        first_parent_icon: undefined
      };
      mapedItem.first_parent_icon = p.parents.length > 0 ? p.parents[0].icon : p.leafChild.icon;

      return {...p, ...mapedItem};
    });
  }
}
