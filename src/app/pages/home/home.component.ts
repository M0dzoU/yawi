import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgxOtpInputConfig } from 'ngx-otp-input';
import { LoginService } from 'src/app/endpoint/login.service';
import { UsersService } from 'src/app/endpoint/users.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  currentSection = 'home';
  token: any = '';
  loginForm!: FormGroup;
  isLogged: boolean = false;
  registerForm!: FormGroup;
  secret: any;
  isAuthenticated = false;
  secretUser: any;
  modalRef!: NgbModalRef;
  isLoading: boolean = false;
  showModalAuth: boolean = false;
  otpInputConfig: NgxOtpInputConfig = {
    otpLength: 4,
    isPasswordInput: true,
    autoblur: true,
    autofocus: true
  };
  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private usersService: UsersService
  ) {
    this.token = localStorage.getItem('Token');
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });

    this.registerForm = this.formBuilder.group({
      roles: ['ROLE_USER', [Validators.required]],
      plainPassword: ['', [Validators.required]],
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      pays: ['', [Validators.required]],
      telephone: ['', [Validators.required]],
      secret: ['', [Validators.required, Validators.maxLength(4)]],
    });
  }

  handeOtpChange(value: string[]): void { }

  handleFillEvent(value: string): void {
    this.isLoading = true;
    if (value === this.secret) {
      this.isAuthenticated = true;
      setTimeout(() => {
        window.location.reload();
        this.isLoading = false;
      }, 3000);
    } else {
      this.isAuthenticated = false;
      this.isLoading = false;
    }
  }

  /**
   * Window scroll method
   */
  windowScroll() {
    const navbar = document.getElementById('navbar');
    if (document.body.scrollTop >= 50 || document.documentElement.scrollTop > 50) {
      navbar?.classList.add('nav-sticky');
    } else {
      navbar?.classList.remove('nav-sticky');
    }
  }

  /**
   * Section changed method
   * @param sectionId specify the current sectionID
   */
  onSectionChange(sectionId: string) {
    this.currentSection = sectionId;
  }

  /**
   * Toggle navbar
   */
  toggleMenu() {
    document.getElementById('navbarCollapse')?.classList.toggle('show');
  }

  /**
   * Login modal
   */
  loginModal(content: any) {
    this.modalRef = this.modalService.open(content, { centered: true });
  }

  /**
   * Secret modal
   */
  secretModal(secret: any) {
    const modalOptions: NgbModalOptions = {
      size: 'sm',
      centered: true,
      backdrop: 'static',
      keyboard: false

    };
    this.modalRef = this.modalService.open(secret, modalOptions);
  }

  /**
   * Register modal
   * @param registercontent content
   */
  registerModal(registercontent: any) {
    this.dismissLoginModal();
    const modalOptions: NgbModalOptions = {
      size: 'lg',
      centered: true
    };
    this.modalRef = this.modalService.open(registercontent, modalOptions);
  }

  dismissLoginModal() {
    this.modalRef.dismiss();
  }

  dismissRegisterModal() {
    this.modalRef.dismiss();
  }


  get f() { return this.loginForm.controls; }

  showSwal(icon?: any, title?: string,) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: icon,
      title: title,
    });
  }

  login(secret: any) {
    if (this.loginForm.invalid) {
      return;
    }
    this.isLoading = true;
    const credentials = {
      email: '221' + this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.loginService.loginUser(credentials).subscribe({
      next: (response) => {
        this.isLogged = true;
        this.isLoading = false;
        this.showSwal('success', 'Connexion réussie.');
        this.token = localStorage.setItem('Token', response.token);
        this.dismissLoginModal();
        this.getDetailsOfUsers();
        this.loginForm.reset();
        const modalOptions: NgbModalOptions = {
          size: 'sm',
          centered: true
        };
        this.modalRef = this.modalService.open(secret, modalOptions);
      },
      complete: () => {
        // Called when the request is completed (optional)
        console.log('Request completed');
      },
      error: (error) => {
        // Error occurred, handle the error here
        this.isLogged = false;
        this.isLoading = false;
        console.error(error);
      }
    });
  }

  logout() {
    localStorage.clear();
    window.location.reload();
  }

  register() {
    if (this.registerForm.invalid) {
      return;
    }

    const data = {
      email: '221' + this.registerForm.value.telephone,
      roles: [this.registerForm.value.roles],
      plainPassword: this.registerForm.value.plainPassword,
      nom: this.registerForm.value.prenom + this.registerForm.value.nom,
      pays: this.registerForm.value.pays,
      telephone: '221' + this.registerForm.value.telephone,
      secret: this.registerForm.value.secret
    };

    this.usersService.createNewUser(data).subscribe({
      next: (response) => {
        this.showSwal('success', 'Inscription réussie.');
        this.registerForm.reset();
        this.dismissRegisterModal();
      },
      complete: () => {
        // Called when the request is completed (optional)
        console.log('Request completed');
      },
      error: (error) => {
        // Error occurred, handle the error here
        console.error(error);
      }
    });
  }

  getDetailsOfUsers() {
    const numberPhoneCustomer = '221' + this.loginForm.value.email
    this.usersService.getInfoUser(numberPhoneCustomer).subscribe({
      next: (response) => {
        this.secret = response[0].secret;
        console.log(this.secret);

      },
      complete: () => {
        // Called when the request is completed (optional)
        console.log('Request completed');
      },
      error: (error) => {
        // Error occurred, handle the error here
        console.error(error);
      }
    });
  }
}
