import { Component } from '@angular/core';

@Component({
  selector: 'app-custom-dropdown',
  templateUrl: './custom-dropdown.component.html',
  styleUrls: ['./custom-dropdown.component.scss']
})
export class CustomDropdownComponent {
  selectedOption!: string;
  options: any[] = [
    { value: 'option1', label: 'Option 1', image: 'assets/images/logo.jpeg' },
    { value: 'option2', label: 'Option 2', image: 'assets/images/logo.jpeg' },
  ];

  onOptionChange() {
    // Perform any desired action based on the selected value
    console.log(this.selectedOption);
  }
}
