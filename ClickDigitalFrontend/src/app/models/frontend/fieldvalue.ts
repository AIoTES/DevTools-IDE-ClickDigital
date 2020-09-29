/**

 * This class helps to communicate with the database
 */
export class Fieldvalue {
  field: string;
  value;

  constructor(field: string, value) {
    this.field = field;
    this.value = value;
  }

}
