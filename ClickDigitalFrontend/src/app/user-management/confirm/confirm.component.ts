/**

 * This component allows a user to confirm their email address
 */
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { DataService } from '../../services/data.service';
import { UserManagerService } from '../../services/usermanager.service';
import { ProjectService } from '../../services/project.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmComponent implements OnInit {
  private token: string;

  constructor(private router: Router, private databaseService: DatabaseService,
              private dataService: DataService, private usermanager: UserManagerService, private projectService: ProjectService,
              private fb: FormBuilder, private route: ActivatedRoute) {

    this.route.fragment.subscribe(fragment => {
      fragment = fragment.split('?')[1];
      let params = new URLSearchParams(fragment);
      this.token = params.get('token');
    });
  }

  ngOnInit(): void {

  }

  /**
   * Sends the token to the backend to verify confirmation
   */
  confirmMail(): void {
    this.usermanager.confirmEmail(this.token)
      .subscribe(result => {
        console.log(result);
        setTimeout(() => {
              this.router.navigate(['']);
            },
            3000);
      }
      , err => {
        console.log('Error. ', err['error']);
      });
  }
}
