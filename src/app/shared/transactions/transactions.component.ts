import { Component, OnInit } from '@angular/core';
import { TransactionsService } from 'src/app/endpoint/transactions.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  telephone: any = '';
  transactions: any;
  page: number = 1;
  count: number = 0;
  tableSize: number = 5;
  selectedItem: any;
  openModal = false;

  constructor(private transactionService: TransactionsService) {
    this.telephone = localStorage.getItem('Telephone');
  }
  ngOnInit(): void {
    this.getListTransaction(this.telephone);
  }

  selectedDetails(item: any) {
    this.selectedItem = item;
  }

  openModalDetails() {
    this.openModal = true;
  }

  closeModal() {
    this.openModal = false;
  }

  showSwal(icon?: any, title?: string,) {
    Swal.fire({
      position: 'center',
      icon,
      title,
      confirmButtonColor: '#056db6',
      showConfirmButton: true,
    });
  }

  getListTransaction(phoneNumber: any) {
    this.transactionService.getLastOfTransaction(phoneNumber).subscribe({
      next: (response) => {
        this.transactions = response["hydra:member"];
      },
      complete: () => {
      },
      error: (error) => {
        // Error occurred, handle the error here
        this.showSwal('error', 'Une erreur est survenue. Réessayer ultérieurement.')
      }
    });
  }

  onTableDataChange(event: any) {
    this.page = event;
    this.getListTransaction(this.telephone);
  }
}