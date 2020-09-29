/**
 * This class represents a dataprivacyelement in the view of the backend
 */

interface ObjectConfig {
  /**
   * A unique id to identify a sheet
   */
  id: string;
  /**
   * 
   */
  userId?: string;
   /**
   * 
   */
  priorVersion?: string;
  /**
   * 
   */
  contextID?: string;
  /**
   * 
   */
  title: string;
  /**
   * 
   */
  descriptions: DescriptionConfig;
   /**
   * 
   */
  children: DataPrivacyElementBackend[]
  /**
   * 
   */
  consentRequired?: boolean;
  /**
   * 
   */
  preChecked?: boolean;
  /**
   * 
   */
  inUse?: boolean;
  validFrom: number;
}

interface DescriptionConfig {
  /**
   * 
   */
  before?: string;
  /**
   * 
   */
  after?: string;
  /**
   * 
   */
  submit?: string;
}


export class DataPrivacyElementBackend{
  id: string; //ID
  userId: string = "";
  priorVersion: string = ""; //Verweis auf die vorherige Version
  contextID: string = ""; //statt children Verweis auf Elternknoten, verdeutliche ich an diesem Beispiel
  title: string = "";
  descriptions: DescriptionConfig = {
    before: "",
	after: "",
	submit: ""
  };
  children: DataPrivacyElementBackend[] = []; //nur im frontend wichtig, wegen
  consentRequired: boolean = true;
  preChecked: boolean = false;
  inUse: boolean = false;
  validFrom: Date;
  
  constructor(objectConfig: ObjectConfig) {
    this.id = objectConfig.id;
	this.userId = objectConfig.userId;
	this.title = objectConfig.title;
	if (objectConfig.hasOwnProperty('priorVersion')) this.priorVersion = objectConfig.priorVersion;
	if (objectConfig.hasOwnProperty('contextID')) this.contextID = objectConfig.contextID;
	if (objectConfig.descriptions.hasOwnProperty('before')) this.descriptions.before = objectConfig.descriptions.before;
	if (objectConfig.descriptions.hasOwnProperty('after')) this.descriptions.after = objectConfig.descriptions.after;
	if (objectConfig.descriptions.hasOwnProperty('submit')) this.descriptions.submit = objectConfig.descriptions.submit;
	if (objectConfig.hasOwnProperty('consentRequired')) this.consentRequired = objectConfig.consentRequired;
	if (objectConfig.hasOwnProperty('preChecked')) this.preChecked = objectConfig.preChecked;
	if (objectConfig.hasOwnProperty('inUse')) this.inUse = objectConfig.inUse;
	if (objectConfig.hasOwnProperty('validFrom')) this.validFrom = new Date(objectConfig.validFrom);
  }
  
  addChild(child: DataPrivacyElementBackend) {
    this.children.push(child);
  }
}
