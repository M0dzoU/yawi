import { Component, OnInit } from '@angular/core';
interface ImageOption {
  imagePath: string;
  altText: string;
}
@Component({
  selector: 'app-custom-dropdown',
  templateUrl: './custom-dropdown.component.html',
  styleUrls: ['./custom-dropdown.component.scss']
})
export class CustomDropdownComponent implements OnInit {
  selectedImage: string = ''; // Stores the selected image path
  selectedImageAlt: string = '';
  imageOptions: ImageOption[] = [
    {
      altText: 'Wave',
      imagePath: '../../../assets/images/wave.png'
    },
    {
      altText: 'Orange money',
      imagePath: '../../../assets/images/om.png'
    },
    {
      altText: 'Free Money',
      imagePath: '../../../assets/images/free.png'
    }
  ];

  ngOnInit(): void {
    // Set default image based on your condition or logic
    this.setDefaultImage();
  }

  setDefaultImage(): void {
    // Your condition or logic to determine the default image
    // Here's an example of setting the first image as the default
    if (this.imageOptions.length > 0) {
      this.selectedImage = this.imageOptions[0].imagePath;
      this.selectedImageAlt = this.imageOptions[0].altText;
    }
  }

  onSelectImage(option: ImageOption): void {
    this.selectedImage = option.imagePath; // Update the selected image path
    this.selectedImageAlt = option.altText;
  }
}
