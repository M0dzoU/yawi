import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TransactionsService } from 'src/app/endpoint/transactions.service';

@Component({
  selector: 'app-test-api',
  templateUrl: './test-api.component.html',
  styleUrls: ['./test-api.component.scss']
})
export class TestApiComponent implements OnInit {
  invoiceForm!: FormGroup;
  softPayForm!: FormGroup;
  token: any;
  constructor(private formBuilder: FormBuilder, private transactionService: TransactionsService) { }

  ngOnInit(): void {
    this.invoiceForm = this.formBuilder.group({
      amount: ['', [Validators.required]],
    });
    this.softPayForm = this.formBuilder.group({
      customer_name: ['', [Validators.required]],
      customer_email: ['', [Validators.required]],
      phone_number: ['', [Validators.required]],
      authorization_code: ['', [Validators.required]],

    });
  }

  submitInvoice(): void {
    if (this.invoiceForm.invalid) {
      return;
    }
    const credentials = {
      invoice:
      {
        total_amount: this.invoiceForm.value.amount,
        description: "Transaction"
      },
      store:
      {
        name: "COK-Service"
      }
    };

    this.transactionService.checkOutInvoice(credentials).subscribe({
      next: (response) => {
        console.log(response);
        if (response.response_code == '00') {
          this.token = response.token;
          console.log(this.token);
          

        } else {
          this.token = '';
        }
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

  submitSoftPayOM(): void {
    if (this.softPayForm.invalid) {
      return;
    }
    const data = {
      customer_name: this.softPayForm.value.customer_name,
      customer_email: this.softPayForm.value.customer_email,
      phone_number: this.softPayForm.value.phone_number,
      authorization_code: this.softPayForm.value.authorization_code,
      invoice_token: this.token
    };

    this.transactionService.softPayOrangeMoney(data).subscribe({
      next: (response) => {
        console.log(response);
        if (response.response_code == '00') {


        } else {
          this.token = '';
        }
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
