import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgxOtpInputConfig } from 'ngx-otp-input';
import { Subscription, interval, switchMap, takeWhile } from 'rxjs';
import { LoginService } from 'src/app/endpoint/login.service';
import { TransactionsService } from 'src/app/endpoint/transactions.service';
import { UsersService } from 'src/app/endpoint/users.service';
import Swal from 'sweetalert2';

interface ImageOption {
  imagePath: string;
  altText: string;
};

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  providers: [DatePipe],
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  currentSection = 'home';
  token: any = '';
  telephone: any;
  idUser: any;
  disburse_token: any;
  loginForm!: FormGroup;
  isLogged: boolean = false;
  registerForm!: FormGroup;
  secret: any;
  waveURL: any;
  isAuthenticated = false;
  secretUser: any;
  amount_total: any = 0;
  formattedDate: any;
  statusOfTransaction: any;
  modalRefLogin!: NgbModalRef;
  modalRefRegister!: NgbModalRef;
  modalRefSecret!: NgbModalRef;
  allDetailsUser: Array<any> = [];
  isLoading: boolean = false;
  showModalAuth: boolean = false;
  token_invoice: any;
  fees: any = 0;
  otpInputConfig: NgxOtpInputConfig = {
    otpLength: 4,
    isPasswordInput: true,
    autoblur: true,
    autofocus: true
  };
  amount: any;
  idTransaction: any;
  transactionForm!: FormGroup;
  selectedFirstImage: string = ''; // Stores the selected image path
  selectedFirstImageAlt: string = '';

  selectedSecondImage: string = ''; // Stores the selected image path
  selectedSecondImageAlt: string = '';
  imageOption: ImageOption[] = [
    {
      altText: 'Wave',
      imagePath: '../../../assets/images/wave.png'
    },
    {
      altText: 'Orange Money',
      imagePath: '../../../assets/images/om.png'
    },
    {
      altText: 'Free Money',
      imagePath: '../../../assets/images/free.png'
    }
  ];
  private subscription!: Subscription;
  token_transaction: any;
  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private usersService: UsersService,
    private datePipe: DatePipe,
    private transactionService: TransactionsService,
  ) {
    this.token = localStorage.getItem('Token');
    this.idUser = localStorage.getItem('Id');
    this.telephone = localStorage.getItem('Telephone');
  }

  ngOnInit(): void {
    // this.submitSoftPayWave();
    this.setDefaultFirstImage();
    this.setDefaultSecondImage();
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.maxLength(9)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });

    this.registerForm = this.formBuilder.group({
      roles: ['ROLE_USER', [Validators.required]],
      plainPassword: ['', [Validators.required]],
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      pays: ['', [Validators.required]],
      telephone: ['', [Validators.required, Validators.maxLength(9)]],
      secret: ['', [Validators.required, Validators.maxLength(4)]],
    });

    this.transactionForm = this.formBuilder.group({
      montant: [this.amount, [Validators.required]],
      destinataire: ['', [Validators.required, Validators.maxLength(9)]],
      code_om: [''],
      comptedebit: ['', [Validators.required, Validators.maxLength(9)]],
    });
  }

  setDefaultFirstImage(): void {
    // Your condition or logic to determine the default image
    // Here's an example of setting the first image as the default
    if (this.imageOption.length > 0) {
      this.selectedFirstImage = this.imageOption[0].imagePath;
      this.selectedFirstImageAlt = this.imageOption[0].altText;
    }
  }

  setDefaultSecondImage(): void {
    // Your condition or logic to determine the default image
    // Here's an example of setting the first image as the default
    if (this.imageOption.length > 0) {
      this.selectedSecondImage = this.imageOption[1].imagePath;
      this.selectedSecondImageAlt = this.imageOption[1].altText;
    }
  }

  onSelectFirstImage(option: ImageOption): void {
    this.selectedFirstImage = option.imagePath; // Update the selected image path
    this.selectedFirstImageAlt = option.altText;
    if (this.selectedFirstImageAlt === 'Free Money') {
      this.showSwal('error', '');
      Swal.fire({
        title: '<strong>Important</strong>',
        icon: 'info',
        html:
          '<p>Les transferts venant de Free Money sont momentanément indisponible. Utilisez les autres opérateurs pour vos transferts.</p>',
        showCloseButton: true,
        confirmButtonColor: '#056db6',
      });
    }
  }

  onSelectSecondImage(option: ImageOption): void {
    this.selectedSecondImage = option.imagePath; // Update the selected image path
    this.selectedSecondImageAlt = option.altText;
  }

  handleAmountChange(amount: any) {
    this.amount = amount.target.value;
    if (this.amount >= 5000) {
      this.fees = ((this.amount * 4) / 100);
      this.amount_total = Number(this.amount) + this.fees;
    } else {
      this.fees = ((amount.target.value * 4) / 100) + 10;
      this.amount_total = Number(this.amount) + this.fees;
    }
    this.submitCheckoutInvoice();
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
      this.showSwal('error', 'Code secret incorrecte.');
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
    this.modalRefLogin = this.modalService.open(content, { centered: true });
  }

  /**
   * Register modal
   * @param registercontent content
   */
  registerModal(registercontent: any) {
    const modalOptions: NgbModalOptions = {
      size: 'lg',
      centered: true
    };
    this.modalRefRegister = this.modalService.open(registercontent, modalOptions);
  }

  dismissLoginModal() {
    this.modalRefLogin.dismiss();
  }

  dismissRegisterModal() {
    this.modalRefRegister.dismiss();
  }


  get f() { return this.loginForm.controls; }

  showSwal(icon?: any, title?: string,) {
    Swal.fire({
      position: 'center',
      icon,
      title,
      confirmButtonColor: '#056db6',
      showConfirmButton: true,
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
        this.token = localStorage.setItem('Token', response.token);
        this.dismissLoginModal();
        this.getDetailsOfUsers();
        this.loginForm.reset();
        const modalOptions: NgbModalOptions = {
          size: 'md',
          backdrop: 'static',
          keyboard: false,
          centered: true
        };
        this.modalRefSecret = this.modalService.open(secret, modalOptions);
      },
      complete: () => {
        // Called when the request is completed (optional)
      },
      error: (error) => {
        // Error occurred, handle the error here
        this.isLogged = false;
        this.isLoading = false;
        this.showSwal('error', 'Une erreur est survenue. Vérifier vos crédentiale')
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
      nom: this.registerForm.value.prenom + ' ' + this.registerForm.value.nom,
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
      },
      error: (error) => {
        // Error occurred, handle the error here
        this.showSwal('error', 'Ce numéro a déjà un compte.')
      }
    });
  }

  getDetailsOfUsers() {
    const numberPhoneCustomer = '221' + this.loginForm.value.email
    this.usersService.getInfoUser(numberPhoneCustomer).subscribe({
      next: (response) => {
        this.secret = response[0].secret;
        this.idUser = response[0].id;
        this.telephone = response[0].telephone;
        localStorage.setItem('Telephone', this.telephone);
        localStorage.setItem('Id', this.idUser);
      },
      complete: () => {
        // Called when the request is completed (optional)
      },
      error: (error) => {
        // Error occurred, handle the error here
        this.showSwal('error', 'Une erreur est survenue. Vérifier vos identifiants.')
      }
    });
  }

  createTransaction() {
    this.isLoading = true;
    if (!this.idUser) {
      // User ID is null, handle the error here
      this.isLoading = false;
      this.showSwal('info', 'Il faut que vous vous connectiez à votre pour transacter.')
      return;
    }
    const amount = this.transactionForm.get('montant')?.value;
    // Check if the amount is less than 200
    if (amount < 200) {
      this.isLoading = false;
      this.showSwal('info', 'Le montant doit être supérieur ou égal à 500 FCFA.');
      this.transactionForm.get('montant')?.reset();
      return;
    }
    const currentDate = new Date();
    this.formattedDate = this.datePipe.transform(currentDate, 'yyyy-MM-ddTHH:mm:ss.SSSZ');
    let transactions;
    if (this.selectedFirstImageAlt == "Wave" && this.selectedSecondImageAlt == "Orange Money") {
      transactions = {
        date: this.formattedDate,
        montant: `${this.amount_total}`,
        destinataire: this.transactionForm.value.destinataire,
        comptedebit: this.transactionForm.value.comptedebit,
        statut: 'En attente',
        paydunyastatut: this.statusOfTransaction,
        type: "Wave -> OM",
        user: `/api/users/${this.idUser}`,
        reference: "",
        token: this.token_invoice
      };
    } else if (this.selectedFirstImageAlt == "Orange Money" && this.selectedSecondImageAlt == "Wave") {
      transactions = {
        date: this.formattedDate,
        montant: `${this.transactionForm.value.montant}`,
        destinataire: this.transactionForm.value.destinataire,
        comptedebit: this.transactionForm.value.comptedebit,
        statut: 'En attente',
        paydunyastatut: this.statusOfTransaction,
        type: "OM -> Wave",
        user: `/api/users/${this.idUser}`,
        reference: "",
        token: this.token_invoice
      };
    } else if (this.selectedFirstImageAlt == "Orange Money" && this.selectedSecondImageAlt == "Free Money") {
      transactions = {
        date: this.formattedDate,
        montant: `${this.transactionForm.value.montant}`,
        destinataire: this.transactionForm.value.destinataire,
        comptedebit: this.transactionForm.value.comptedebit,
        statut: 'En attente',
        paydunyastatut: this.statusOfTransaction,
        type: "OM -> Free",
        user: `/api/users/${this.idUser}`,
        reference: "",
        token: this.token_invoice
      };
      // } else if (this.selectedFirstImageAlt == "Free Money" && this.selectedSecondImageAlt == "Orange Money") {
      //   // transactions = {
      //   //   date: this.formattedDate,
      //   //   montant: `${this.transactionForm.value.montant}`,
      //   //   destinataire: this.transactionForm.value.destinataire,
      //   //   comptedebit: this.transactionForm.value.comptedebit,
      //   //   statut: 'En attente',
      //   //   paydunyastatut: this.statusOfTransaction,
      //   //   type: "Free -> OM",
      //   //   user: `/api/users/${this.idUser}`,
      //   //   reference: "",
      //   //   token: this.token_invoice
      //   // };
      // } else if (this.selectedFirstImageAlt == "Free Money" && this.selectedSecondImageAlt == "Wave") {
      //   // transactions = {
      //   //   date: this.formattedDate,
      //   //   montant: `${this.transactionForm.value.montant}`,
      //   //   destinataire: this.transactionForm.value.destinataire,
      //   //   comptedebit: this.transactionForm.value.comptedebit,
      //   //   statut: 'En attente',
      //   //   paydunyastatut: this.statusOfTransaction,
      //   //   type: "Free -> Wave",
      //   //   user: `/api/users/${this.idUser}`,
      //   //   reference: "",
      //   //   token: this.token_invoice
      //   // };
      //   this.isLoading = false;
      //   this.showSwal('error', 'Les transfert venant de free sont momentanément indisponible. Mais vous pouvez utiliser les autres opérateurs.');
      // 
    } else if (this.selectedFirstImageAlt == "Wave" && this.selectedSecondImageAlt == "Free Money") {
      transactions = {
        date: this.formattedDate,
        montant: `${this.transactionForm.value.montant}`,
        destinataire: this.transactionForm.value.destinataire,
        comptedebit: this.transactionForm.value.comptedebit,
        statut: 'En attente',
        paydunyastatut: this.statusOfTransaction,
        type: "Wave -> Free",
        user: `/api/users/${this.idUser}`,
        reference: "",
        token: this.token_invoice
      };
    }
    this.transactionService.createTransaction(transactions).subscribe({
      next: (response) => {
        this.getLastTransaction(this.telephone);
        let data;
        switch (response.type) {
          case 'Wave -> OM':
            // Transfert de Wave vers Orange Money
            data = {
              wave_senegal_fullName: response.user.nom,
              wave_senegal_email: response.user.email,
              wave_senegal_phone: this.transactionForm.value.comptedebit,
              wave_senegal_payment_token: response.token
            };
            this.transactionService.softPayWaveMoney(data).subscribe({
              next: (response) => {
                this.isLoading = false;
                if (response.success == true) {
                  window.open(response.url, '_system');
                  this.subscription = interval(4000) // Execute every 4 seconds
                    .pipe(
                      switchMap(() => this.transactionService.getStatusCheckout(this.token_transaction)),
                      takeWhile((response: any) => response.status !== 'completed', true)
                    )
                    .subscribe((response: any) => {
                      if (response.status === 'completed') {
                        this.subscription.unsubscribe();
                        this.updateStatusTransaction();
                        this.getInvoiceTransaction();
                        setTimeout(() => {
                          this.submitInvoiceTransaction();
                          this.transactionForm.reset();
                        }, 4000);
                        this.fees = 0;
                        this.amount_total = 0;
                        this.amount = 0;
                      }
                    });
                } else {
                  this.showSwal('error', 'Numéro de téléphone invalide.')
                }
              },
              complete: () => {
                // Called when the request is completed (optional)
              },
              error: (error) => {
                // Error occurred, handle the error here
                this.isLoading = false;
                this.showSwal('error', 'Une erreur est survenue. Réessayer ultérieurement.')
              }
            });
            break;
          case 'Wave -> Free':
            // Transfert de Wave vers Free Money
            data = {
              wave_senegal_fullName: response.user.nom,
              wave_senegal_email: response.user.email,
              wave_senegal_phone: this.transactionForm.value.comptedebit,
              wave_senegal_payment_token: response.token
            };
            this.transactionService.softPayWaveMoney(data).subscribe({
              next: (response) => {
                this.isLoading = false;
                if (response.success == true) {
                  window.open(response.url, '_blank');
                  this.subscription = interval(4000) // Execute every 4 seconds
                    .pipe(
                      switchMap(() => this.transactionService.getStatusCheckout(this.token_transaction)),
                      takeWhile((response: any) => response.status !== 'completed', true)
                    )
                    .subscribe((response: any) => {
                      if (response.status === 'completed') {
                        this.subscription.unsubscribe();
                        this.updateStatusTransaction();
                        this.getInvoiceTransaction();
                        setTimeout(() => {
                          this.submitInvoiceTransaction();
                          this.transactionForm.reset();
                        }, 4000);
                        this.fees = 0;
                        this.amount_total = 0;
                        this.amount = 0;
                      }
                    });
                } else {
                  this.showSwal('error', 'Numéro de téléphone invalide.')
                }
              },
              complete: () => {
                // Called when the request is completed (optional)
              },
              error: (error) => {
                // Error occurred, handle the error here
                this.isLoading = false;
                this.showSwal('error', 'Une erreur est survenue. Réessayer ultérieurement.')
              }
            });
            break;
          case 'OM -> Free':
            // Transfert de OM vers Free
            data = {
              customer_name: response.user.nom,
              customer_email: response.user.email,
              phone_number: this.transactionForm.value.comptedebit,
              authorization_code: this.transactionForm.value.code_om,
              invoice_token: response.token
            };
            this.transactionService.softPayOrangeMoney(data).subscribe({
              next: (response) => {
                this.isLoading = false;
                if (response.success == true) {
                  this.showSwal('success', response.message);
                  this.subscription = interval(4000) // Execute every 4 seconds
                    .pipe(
                      switchMap(() => this.transactionService.getStatusCheckout(this.token_transaction)),
                      takeWhile((response: any) => response.status !== 'completed', true)
                    )
                    .subscribe((response: any) => {
                      if (response.status === 'completed') {
                        this.subscription.unsubscribe();
                        this.updateStatusTransaction();
                        this.getInvoiceTransaction();
                        setTimeout(() => {
                          this.submitInvoiceTransaction();
                          this.transactionForm.reset();
                        }, 4000);
                        this.fees = 0;
                        this.amount_total = 0;
                        this.amount = 0;
                      }
                    });
                } else {
                  this.showSwal('error', 'Numéro de téléphone invalide.')
                }
              },
              complete: () => {
                // Called when the request is completed (optional)
              },
              error: (error) => {
                // Error occurred, handle the error here
                this.isLoading = false;
                this.showSwal('error', 'Une erreur est survenue. Réessayer ultérieurement.')
              }
            });
            break;
          case 'OM -> Wave':
            // Transfert de OM vers Wave
            data = {
              customer_name: response.user.nom,
              customer_email: response.user.email,
              phone_number: this.transactionForm.value.comptedebit,
              authorization_code: this.transactionForm.value.code_om,
              invoice_token: response.token
            };
            this.transactionService.softPayOrangeMoney(data).subscribe({
              next: (response) => {
                this.isLoading = false;
                if (response.success == true) {
                  this.showSwal('success', response.message);
                  this.subscription = interval(4000) // Execute every 4 seconds
                    .pipe(
                      switchMap(() => this.transactionService.getStatusCheckout(this.token_transaction)),
                      takeWhile((response: any) => response.status !== 'completed', true),
                    )
                    .subscribe((response: any) => {
                      if (response.status === 'completed') {
                        this.subscription.unsubscribe();
                        this.updateStatusTransaction();
                        this.getInvoiceTransaction();
                        setTimeout(() => {
                          this.submitInvoiceTransaction();
                          this.transactionForm.reset();
                        }, 4000);
                        this.fees = 0;
                        this.amount_total = 0;
                        this.amount = 0;
                      }
                    });
                } else {
                  this.showSwal('error', 'Numéro de téléphone invalide.')
                }
              },
              complete: () => {
                // Called when the request is completed (optional)
              },
              error: (error) => {
                // Error occurred, handle the error here
                this.isLoading = false;
                this.showSwal('error', 'Une erreur est survenue. Réessayer ultérieurement.')
              }
            });
            break;
          // case 'Free -> OM':
          //   // Transfert de Free vers OM
          //   data = {
          //     customer_name: response.user.nom,
          //     customer_email: response.user.email,
          //     phone_number: this.transactionForm.value.comptedebit,
          //     payment_token: response.token
          //   };
          //   this.transactionService.softPayFreeMoney(data).subscribe({
          //     next: (response) => {
          //       this.isLoading = false;
          //       if (response.success == true) {
          //         this.showSwal('success', response.message);
          //         this.subscription = interval(4000) // Execute every 4 seconds
          //           .pipe(
          //             switchMap(() => this.transactionService.getStatusCheckout(this.token_transaction)),
          //             takeWhile((response: any) => response.status !== 'completed', true)
          //           )
          //           .subscribe((response: any) => {
          //             if (response.status === 'completed') {
          //               this.subscription.unsubscribe();
          //               this.updateStatusTransaction();
          //               this.getInvoiceTransaction();
          //               setTimeout(() => {
          //                 this.submitInvoiceTransaction();
          //                 this.transactionForm.reset();
          //                 this.router.navigateByUrl('/transactions');
          //               }, 4000);
          //               this.fees = 0;
          //               this.amount_total = 0;
          //               this.amount = 0;
          //             }
          //           });
          //       } else {
          //         this.showSwal('error', 'Numéro de téléphone invalide.')
          //       }
          //     },
          //     complete: () => {
          //       // Called when the request is completed (optional)
          //     },
          //     error: (error) => {
          //       // Error occurred, handle the error here
          //       this.isLoading = false;
          //       this.showSwal('error', 'Une erreur est survenue. Réessayer ultérieurement.')
          //     }
          //   });
          //   break;
          // case 'Free -> Wave':
          //   // Transfert de Free vers Wave
          //   data = {
          //     customer_name: response.user.nom,
          //     customer_email: response.user.email,
          //     phone_number: this.transactionForm.value.comptedebit,
          //     payment_token: response.token
          //   };
          //   this.transactionService.softPayFreeMoney(data).subscribe({
          //     next: (response) => {
          //       this.isLoading = false;
          //       if (response.success == true) {
          //         this.showSwal('success', response.message);
          //         this.subscription = interval(4000) // Execute every 4 seconds
          //           .pipe(
          //             switchMap(() => this.transactionService.getStatusCheckout(response.token)),
          //             takeWhile((response: any) => response.token !== 'completed', true)
          //           )
          //           .subscribe((response: any) => {
          //             if (this.statusOfTransaction === 'completed') {
          //               this.subscription.unsubscribe();
          //               this.updateStatusTransaction();
          //               this.getInvoiceTransaction();
          //               setTimeout(() => {
          //                 this.submitInvoiceTransaction();
          //                 this.transactionForm.reset();
          //                 this.router.navigateByUrl('/transactions');
          //               }, 4000);
          //               this.fees = 0;
          //               this.amount_total = 0;
          //               this.amount = 0;
          //             }
          //           });
          //       } else {
          //         this.showSwal('error', 'Numéro de téléphone invalide.')
          //       }
          //     },
          //     complete: () => {
          //       // Called when the request is completed (optional)
          //     },
          //     error: (error) => {
          //       // Error occurred, handle the error here
          //       this.isLoading = false;
          //       this.showSwal('error', error.message)
          //     }
          //   });
          //   break;
          default:
            this.showSwal('error', 'Cet opérateur n\'est pas en base.')
            // Perform actions for invalid option
            break;
        }
      },
      complete: () => {
        // Called when the request is completed (optional)
      },
      error: (error) => {
        // Error occurred, handle the error here
        this.isLoading = false;
        this.showSwal('error', 'Une erreur est survenue. Réessayer ultérieurement.')
      }
    });
  }

  getLastTransaction(phoneNumber: any) {
    this.transactionService.getLastOfTransaction(phoneNumber).subscribe({
      next: (response) => {
        this.idTransaction = response["hydra:member"][0].id;
        this.token_transaction = response["hydra:member"][0].token;
      },
      complete: () => {
        // Called when the request is completed (optional)
      },
      error: (error) => {
        // Error occurred, handle the error here
        this.showSwal('error', 'Une erreur est survenue. Réessayer ultérieurement.')
      }
    });
  }

  getStatusOfTransaction(token: any) {
    this.transactionService.getStatusCheckout(token).subscribe({
      next: (response) => {
        if (response.response_code == '00') {
          this.statusOfTransaction = response.status;
        } else {
          this.statusOfTransaction = '';
        }
      },
      complete: () => {
        // Called when the request is completed (optional)
      },
      error: (error) => {
        // Error occurred, handle the error here
        this.showSwal('error', 'Une erreur est survenue. Réessayer ultérieurement.')
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  submitCheckoutInvoice(): void {
    const data = {
      invoice:
      {
        total_amount: this.amount_total,
        description: "Création de la transaction"
      },
      store:
      {
        name: "COK-SERVICE"
      }
    };

    this.transactionService.checkOutInvoice(data).subscribe({
      next: (response) => {
        if (response.response_code == '00') {
          this.token_invoice = response.token;
        } else {
          this.token_invoice = '';
        }
      },
      complete: () => {
        // Called when the request is completed (optional)
      },
      error: (error) => {
        // Error occurred, handle the error here
        this.showSwal('error', 'Une erreur est survenue. Réessayer ultérieurement.')
      }
    });
  }

  updateStatusTransaction() {
    this.transactionService.updateStatusOfTransaction(this.idTransaction).subscribe({
      next: (response) => {
        this.showSwal('success', 'Status transaction mise à jour avec succès.')
      },
      complete: () => {
        // Called when the request is completed (optional)
      },
      error: (error) => {
        // Error occurred, handle the error here
        this.showSwal('error', 'Une erreur est survenue. Réessayer ultérieurement.')
      }
    });
  }

  getInvoiceTransaction() {
    let invoice;
    switch (this.selectedSecondImageAlt) {
      case 'Wave':
        invoice = {
          account_alias: this.transactionForm.value.destinataire,
          amount: this.transactionForm.value.montant,
          withdraw_mode: "wave-senegal"
        };
        break;
      case 'Orange Money':
        invoice = {
          account_alias: this.transactionForm.value.destinataire,
          amount: this.transactionForm.value.montant,
          withdraw_mode: "orange-money-senegal"
        };
        break;
      case 'Free Money':
        invoice = {
          account_alias: this.transactionForm.value.destinataire,
          amount: this.transactionForm.value.montant,
          withdraw_mode: "free-money-senegal"
        };
        break;
      default:
        this.showSwal('error', 'Cet opérateur n\'est pas en base.')
        // Perform actions for invalid option
        break;
    }

    this.transactionService.getInvoice(invoice).subscribe({
      next: (response) => {
        if (response.response_code == '00') {
          this.disburse_token = response.disburse_token;
        } else {
          this.showSwal('error', 'L\'envoie n\'a pas abouti.')
        }
      },
      complete: () => {
        // Called when the request is completed (optional)
      },
      error: (error) => {
        // Error occurred, handle the error here
        this.showSwal('error', 'Une erreur est survenue. Réessayer ultérieurement.')
      }
    });
  }

  submitInvoiceTransaction() {
    const donnee = {
      disburse_invoice: this.disburse_token,
      disburse_id: this.idTransaction
    }
    this.transactionService.submitInvoice(donnee).subscribe({
      next: (response) => {
        if (response.response_code == '00') {
          Swal.fire({
            title: 'La transaction a été éffectuée avec succès.',
            icon: 'success',
            showConfirmButton: true,
            confirmButtonColor: '#056db6',
            confirmButtonText: 'Ok'
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload();
            }
          })
        } else {
          this.showSwal('error', 'Le remboursement n\'a pas totalement abouti.')
        }
      },
      complete: () => {
        // Called when the request is completed (optional)
      },
      error: (error) => {
        // Error occurred, handle the error here
        this.showSwal('error', 'Une erreur est survenue. Réessayer ultérieurement.')
      }
    });
  }
}
