export class Condition   {

   ID = 0;
   command = '';
   state: any = ''; // ON or OFF
   time = '';
   // for example: ["", "TUE", "", "", "FRI", "SAT", "SUN"] for save value is needed
   days: Array<string> = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
   location = '';
   weather = '';
   activity = '';
   trafficsituation = '';
   temperature = 0;
   operator = '';
   telephonenumber = 0;
   email = '';
   communicationtype = '';
   notification = '';
   physical = false;
   servicetype = '';
   entry = '';
   living = false;
   human = false;
   itemtype = '';
   place = '';
}
