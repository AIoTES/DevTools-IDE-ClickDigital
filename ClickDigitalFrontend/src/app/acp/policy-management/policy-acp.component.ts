import { Component, OnInit, ViewEncapsulation, ViewContainerRef, ComponentFactoryResolver, ViewChild} from '@angular/core';
import { Message, MenuItem, ConfirmationService } from 'primeng/api';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import { TabMenuModule } from 'primeng/tabmenu';
import { ActivatedRoute, Router, NavigationStart} from '@angular/router';
import { SelectButtonModule } from 'primeng/selectbutton';
import {ListboxModule} from 'primeng/listbox';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import {DataPrivacyElementBackend} from '../../models/backend/dataprivacyelementbackend';
import {ACPService} from '../../services/acp.service';

@Component({
  selector: 'app-policy-acp',
  templateUrl: './policy-acp.component.html',
  styleUrls: ['./policy-acp.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, ACPService]
})

export class PolicyACPComponent implements OnInit { 
  @ViewChild('overview') overview;
  @ViewChild('add') add;
  @ViewChild('import') import;
  @ViewChild('export') export;
  @ViewChild('settings') settings;
  @ViewChild('change') change;
  protected privacyMsgs: Array<Message> = [];
  private children: string[];
  private arguments;
  private importTabEntries;
  private exportTabOptions;
  private exportTabEntries;
  
  protected addElementForm: FormGroup;
  protected changeElementForm: FormGroup;
  protected exportElementForm: FormGroup;
  protected importElementForm: FormGroup;
  protected availableElements;
  protected availableBackupElements;
  protected sequenceList;

  constructor(private confirmationService: ConfirmationService, private route: ActivatedRoute, private fb: FormBuilder, private acpS: ACPService) {
  }

  ngOnInit(): void {
	this.children = ['overview', 'add', 'import', 'export', 'settings', 'change'];
	this.availableElements = {};
	this.availableBackupElements = {};
    this.sequenceList = [];
	
	this.initAddArea();
	this.initExportArea();
	this.initChangeArea();
	
	//event listener for updating the displayed content (for the "policy" area)
	this.route.fragment.subscribe(
	  (fragments) => {
        let url = this.getPreparedURL();
        if (url[0] === 'policy') {
		  var key = url[1];
		  for (var currentKey of this.children) this[currentKey].nativeElement.style.display = "none";
		  if (this[key] != null) { 
		    var callName = 'update' + key.charAt(0).toUpperCase() + key.slice(1) + 'Area';
			if (this[callName] != null) {
		      this[callName](...this.arguments);
			  this.arguments = [];
		    }
			this[key].nativeElement.style.display = "";
		  } else {
		    this.privacyMsgs.push({
			  severity: 'error',
			  summary: 'Error',
			  detail: 'component of <b>' + key + '</b> is undefined'
		    });
		  }
		}
      }
	);
  }
  
  /* ---------------------------- SAMPLES ----------------------------*/
  /**
   * adjusts the URL accordingly to enable the trigger for updating content
   *
   * @param key which page should be displayed?
   */
  private show(key:string = '', ...args) {
    key = key === '' ? this.children[0] : key;
	this.arguments = args;
	if (key !== this.getPreparedURL()[1]) window.location.assign('/acp#policy/' + key);
  }
  
  /**
   * trivial
   */
  protected goBack() {
    window.history.back();
  }

  /**
   * URL content is adapted so that further processing of the fragments can function without problems
   */
  protected getPreparedURL():string[] {
	let url = this.route.snapshot.fragment;
	if (url == null) url = '';
    url = url.split('?')[0]; //Parameterangaben abschneiden

	return url.split('/');
  }
  
  /**
   * this method ensures that the privacy elements are loaded
   * the special thing about this method is that the upper elements are loaded separately from the lower elements to avoid loading sequence problems
   */
  protected loadPrivacyElements() {
	this.sequenceList = [];
	this.availableElements = {};
	
	this.acpS.getAllPrivacyElements('root').subscribe(result => {
	  result.forEach(function (obj) {
	    let item = new DataPrivacyElementBackend(obj);
        this.availableElements[obj.id] = item;
		this.sequenceList.push([obj.id]);
	  }.bind(this));
	  
	  this.acpS.getAllPrivacyElements('leaf').subscribe(result => {
        result.forEach(function (obj) {
		 
        let item = new DataPrivacyElementBackend(obj);
        this.availableElements[obj.id] = item;
        this.availableElements[obj.contextID].addChild(item); 
		  
        }.bind(this));
	  });
	});
  }
  
  /* ---------------------------- OVERVIEW AREA ----------------------------*/
  private updateOverviewArea() {
    this.loadPrivacyElements();
  }
  
  /**
   * input values are initialized according to the expected contents
   * PAGE[OVERVIEW]:BUTTON@`CHANGE` (prepareChangeArea(privacyID))-> PAGE[CHANGE]:INPUTS@AVAIL_ELEMS[PRIVACYID]
   * 
   * @param privacyID
   */
  private prepareChangeArea(privacyID:string) {
	this.show('change');
	
	let elem = this.availableElements[privacyID];
	this.changeElementForm.patchValue({
	  _id: elem.id,
	  id: elem.id,
	  priorVersion: elem.priorVersion,
      contextID: elem.contextID,
      title: elem.title,
      descriptionsBefore: elem.descriptions.before,
      descriptionsAfter: elem.descriptions.after,
      descriptionsSubmit: elem.descriptions.submit,
      validFrom: elem.validFrom,
      inUse: elem.inUse,
      consentRequired: elem.consentRequired,
      preChecked: elem.preChecked
    });
  }
  
  /**
   * input values are initialized according to the expected contents
   * PAGE[OVERVIEW]:BUTTON@`EXPORT` (prepareExportArea(privacyID))-> PAGE[EXPORT]:INPUTS@AVAIL_BACKUP_ELEMS[PRIVACYID]
   * 
   * @param privacyID
   */
  private prepareExportArea(privacyID:string) {
	this.show('export', 1);
	this.acpS.getPrivacyElement(privacyID).subscribe(result => {
	  this.exportElementForm.patchValue({
		backupID: '',
	    backupName: '',
        backupContent: this.convertPrivacyElementsToJSON(result)
      });
	});
  }
  
  /**
   * input values are initialized according to the expected contents
   * PAGE[OVERVIEW]:BUTTON@`REMOVE` (prepareRemoveArea(privacyID))-> (PAGE[OVERVIEW]:CONFIRM@`Are you sure ...` (accept)-> PAGE[OVERVIEW]:AVAIL_BACKUP_ELEMS\AVAIL_BACKUP_ELEMS[PRIVACYID])
   * 
   * @param privacyID
   */
  private prepareRemoveArea(privacyID:string) {
    this.confirmationService.confirm({
	  message: 'Are you sure that you want to perform this action?',
      accept: () => {
		this.acpS.removePrivacyElement(privacyID).subscribe(result => {
		  this.privacyMsgs.push({
            severity: 'success',
            summary: 'The element has been removed',
            detail: this.availableElements[privacyID].title
          });
		  if (this.availableElements[privacyID] != null) {
		    document.getElementById(privacyID).remove();
		    delete this.availableElements[privacyID];
		  }
		  this.show('overview');
		}, err => {
		  this.privacyMsgs.push({
            severity: 'error',
            summary: 'Error!'
          });
		});
      }
    });
  }
  
  /* ---------------------------- ADD AREA ----------------------------*/
  /**
   * input values are initialized according to the expected contents
   */
  private initAddArea() {
    let formControls = {};
	formControls['id'] = new FormControl('', Validators.nullValidator);
	formControls['contextID'] = new FormControl('', Validators.nullValidator);
	formControls['priorVersion'] = new FormControl('', Validators.nullValidator);
	formControls['title'] = new FormControl('', Validators.nullValidator);
	formControls['descriptionsBefore'] = new FormControl('', Validators.nullValidator);
	formControls['descriptionsAfter'] = new FormControl('', Validators.nullValidator);
	formControls['descriptionsSubmit'] = new FormControl('', Validators.nullValidator);
	formControls['validFrom'] = new FormControl('', Validators.nullValidator);
	formControls['inUse'] = new FormControl(true, Validators.nullValidator);
	formControls['consentRequired'] = new FormControl(true, Validators.nullValidator);
	formControls['preChecked'] = new FormControl('', Validators.nullValidator);
	this.addElementForm = this.fb.group(formControls);
  }
  
  private updateAddArea() {
    this.initAddArea();
  }
  
  /**
   * this method checks the inputs and inserts a new data privacy element if the inputs are correct
   * 
   * @param data the user inputs
   */
  private checkElementInsertion(data) {
    const privacyElement = {
	  id: data.id,
	  priorVersion: data.priorVersion,
	  contextID: data.contextID,
	  title: data.title,
	  descriptions: {
		before: data.descriptionsBefore,
		after: data.descriptionsAfter,
		submit: data.descriptionsSubmit
	  },
	  consentRequired: data.consentRequired,
	  preChecked: data.preChecked,
	  inUse: data.inUse,
      validFrom: data.validFrom == null ? 0 : data.validFrom 
    };

    this.acpS.addPrivacyElement(privacyElement).subscribe(result => {
	   this.privacyMsgs.push({
          severity: 'success',
          summary: 'The element has been added',
          detail: privacyElement.title
        });
		this.show('overview');
	  }, err => {
	    this.privacyMsgs.push({
          severity: 'error',
          summary: 'Error!'
        });
      }
	);
  }
  
  /* ---------------------------- EXPORT AREA ----------------------------*/
  /**
   * this method checks the inputs and inserts a new data privacy element if the inputs are correct
   */
  private initExportArea() {
    this.exportTabOptions = [
	  {label:'Database', value:'db'},
      {label:'TextField', value:'tf'}
	];

    let formControls = {};
    formControls['selectedTab'] = new FormControl('', Validators.nullValidator);
	formControls['selectedBackupElement'] = new FormControl('', Validators.nullValidator);
	formControls['backupID'] = new FormControl('', Validators.nullValidator);
	formControls['backupName'] = new FormControl('', Validators.compose([Validators.required, Validators.minLength(2)]));
	formControls['backupContent'] = new FormControl('', Validators.nullValidator);
    this.exportElementForm = this.fb.group(formControls);
	
	this.exportTabEntries = [
       {label: 'Current DB State', value: 'current'}
    ];
	
	this.acpS.getAllPrivacyBackups().subscribe(result => {
	  result.forEach(function (backupElement) {
        this.availableBackupElements[backupElement.id] = backupElement;
	    this.exportTabEntries.push({label: backupElement.name, value: backupElement.id});
      }.bind(this));
    });
	
	this.exportElementForm.controls.selectedBackupElement.valueChanges.subscribe(key => {
	  if (key === undefined) return;
	  if (key === 'current') {
        this.acpS.getAllPrivacyElements().subscribe(dpElements => {
          this.exportElementForm.patchValue({
			backupID: '',
			backupName: '',
			backupContent: this.convertPrivacyElementsToJSON(dpElements)
          });
          this.setExportTab(1);
		});
	  } else {
	    this.exportElementForm.patchValue({
		  backupID: this.availableBackupElements[key].id,
		  backupName: this.availableBackupElements[key].name,
		  backupContent: JSON.stringify(this.availableBackupElements[key].content)
        });
		this.setExportTab(1);
	  }
      
      this.setExportTabSelectedItem();
	});
  }
  
  private updateExportArea(selectedTabIndex:number) {
    this.setExportTab(selectedTabIndex);
  }
  
  private setExportTab(index = 0) {
    this.exportElementForm.controls.selectedTab.patchValue(this.exportTabOptions[index].value);
  }
  
  private setExportTabSelectedItem(index = null) {
    this.exportElementForm.controls.selectedBackupElement.patchValue(index == null ? undefined : this.exportTabEntries[index]);
  }

  /**
   * this method checks the inputs and inserts a new privacy backup element if the inputs are correct
   * 
   * @param data the user inputs
   */
  private checkBackupElementInsertion(data) {
	let backupElement = {
	  id: data.backupID === '' ? 'null' : data.backupID,
	  content: data.backupContent,
	  description: '',
	  name: data.backupName,
	  creationDate: new Date()
	};
	try {
      backupElement.content = JSON.parse(backupElement.content);
	  this.acpS.updatePrivacyBackup(backupElement.id, backupElement).subscribe(result => {
	    this.privacyMsgs.push({
          severity: 'success',
          summary: (backupElement.id === 'null' ? 'The backup has been added' : 'The backup has been changed'),
          detail: backupElement.name
        });
	    this.initExportArea();
		this.setExportTab();
	  }, err => {
	  });
    } catch (e) {
      this.privacyMsgs.push({
        severity: 'error',
        summary: 'Error!'
      });
    }
  }
  
  /**
   * this method creates a copy of an existing privacy backup element
   *
   * @param backupID
   */
  private createBackupCopy(backupID:string) {
	this.checkBackupElementInsertion({
	  backupID: '',
	  backupName: this.availableBackupElements[backupID].name + ' Copy',
	  backupContent: JSON.stringify(this.availableBackupElements[backupID].content)
	});
  }
  
  /**
   * this method remove an existing privacy backup element if the inputs are correct
   *
   * @param backupID
   */
  private removeBackupElement(backupID:string) {
    this.confirmationService.confirm({
	  message: 'Are you sure that you want to perform this action?',
      accept: () => {
		this.acpS.removePrivacyBackup(backupID).subscribe(result => {
		  this.privacyMsgs.push({
            severity: 'success',
            summary: 'The element has been removed',
            detail: backupID
          });
		  for (var i in this.exportTabEntries) {
			var selItem = this.exportTabEntries[i];
			if (selItem.value === backupID) {
			  this.exportTabEntries.splice(i, 1);
			  break;
			}
		  }
		  this.setExportTab();
		}, err => {
		  this.privacyMsgs.push({
            severity: 'error',
            summary: 'Error!'
          });
		});
      }
    });
  }
  
  /**
   * converts a DataPrivacyElementBackend type object to JSON format
   * 
   * @param dpElements DataPrivacyElementBackend
   */
  private convertPrivacyElementsToJSON(dpElements) {
	var result = '{';
	for (var currentElement of dpElements) {
	  result += '"' + currentElement.id + '":' + JSON.stringify(currentElement) + ',';
	}
	result = result.substr(0, result.length-1);
	result += '}';
	return result;
  }
  
   
  /* ---------------------------- IMPORT AREA ----------------------------*/
  /**
   * this method checks the inputs and inserts a new data privacy element if the inputs are correct
   */
  private initImportArea() {
	this.importTabEntries = [];
	
	let formControls = {};
	formControls['selectedBackupElement'] = new FormControl('', Validators.nullValidator);
	formControls['backupID'] = new FormControl('', Validators.nullValidator);
	formControls['backupName'] = new FormControl('', Validators.compose([Validators.required, Validators.minLength(2)]));
	formControls['backupContent'] = new FormControl('', Validators.nullValidator);
	formControls['mode'] = new FormControl('default', Validators.nullValidator);
    this.importElementForm = this.fb.group(formControls);
	
	this.acpS.getAllPrivacyBackups().subscribe(result => {
	  if (result.length == 0) {
		this.importElementForm.controls.backupContent.disable();
	  }
	  result.forEach(function (backupElement) {
        this.availableBackupElements[backupElement.id] = backupElement;
	    this.importTabEntries.push({label: backupElement.name, value: backupElement.id});
      }.bind(this));
    });
  }
   
  private updateImportArea() {
    this.initImportArea();
  }
  
  private setImportTabSelectedItem(index = null) {
    this.importElementForm.controls.selectedBackupElement.patchValue(index == null ? undefined : this.importTabEntries[index]);
  }
  
  /**
   * this method checks the inputs and imports a privacy backup element if user has accepted the hint
   * 
   * @param data the user inputs
   */
  private checkImportElementInsertion(data) {	
    this.confirmationService.confirm({
	  message: 'Are you sure that you want to perform this action?',
      accept: () => {
		this.acpS.importPrivacyBackup(data.selectedBackupElement, data.mode).subscribe(result => {
		  this.privacyMsgs.push({
            severity: 'success',
            summary: 'successful',
            detail: 'The backup was imported successfully.'
          });
		  this.show('overview');
		}, err => {
		  this.privacyMsgs.push({
            severity: 'error',
            summary: 'Error!'
          });
		});
      }
    });
  }
  
  /* ---------------------------- CHANGE AREA ----------------------------*/
  /**
   * this method checks the inputs and inserts a new data privacy element if the inputs are correct
   */
  private initChangeArea() {
	let formControls = {};
	formControls['_id'] = new FormControl('', Validators.nullValidator);
    formControls['id'] = new FormControl('', Validators.nullValidator);
	formControls['contextID'] = new FormControl('', Validators.nullValidator);
	formControls['priorVersion'] = new FormControl('', Validators.nullValidator);
	formControls['title'] = new FormControl('', Validators.nullValidator);
	formControls['descriptionsBefore'] = new FormControl('', Validators.nullValidator);
	formControls['descriptionsAfter'] = new FormControl('', Validators.nullValidator);
	formControls['descriptionsSubmit'] = new FormControl('', Validators.nullValidator);
	formControls['validFrom'] = new FormControl('', Validators.nullValidator);
	formControls['inUse'] = new FormControl(true, Validators.nullValidator);
	formControls['consentRequired'] = new FormControl(true, Validators.nullValidator);
	formControls['preChecked'] = new FormControl('', Validators.nullValidator);
    this.changeElementForm = this.fb.group(formControls);
  }
  
  private updateChangeArea() {
   
  }
  /**
   * this method checks the inputs and change the data privacy element if the inputs are correct
   * 
   * @param data the user inputs
   */
  private checkElementChanges(data) {
    let privacyID = data._id;

	const privacyElement = {
	  id: data.id,
	  priorVersion: data.priorVersion,
	  contextID: data.contextID,
	  title: data.title,
	  descriptions: {
		before: data.descriptionsBefore,
		after: data.descriptionsAfter,
		submit: data.descriptionsSubmit
	  },
	  consentRequired: data.consentRequired,
	  preChecked: data.preChecked,
	  inUse: data.inUse,
      validFrom: data.validFrom == null ? 0 : data.validFrom
    };

	this.acpS.updatePrivacyElement(privacyID, privacyElement).subscribe(result => {
      this.privacyMsgs.push({
        severity: 'success',
        summary: 'The element has been changed',
        detail: privacyElement.title
      });
	  this.initChangeArea();
      this.goBack();
	}, err => {
	  this.privacyMsgs.push({
        severity: 'error',
        summary: 'Error!'
      });
    });
  }
}
