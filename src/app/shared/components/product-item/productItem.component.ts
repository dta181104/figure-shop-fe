import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ProductItems } from '@/app/core/models/product-item.model';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [],
  templateUrl: './productItem.component.html',
  styleUrls: ['./productItem.component.css'],
})
export class ProductItemComponent implements OnChanges, OnDestroy {
  @Input() products: ProductItems[] = [];

  @Output() dataEvent = new EventEmitter<number>();

  currentYear: number = new Date().getFullYear();

  get totalPrice(): string {
    const sum = this.products.reduce((total, item) => {
      return total + item.price;
    }, 0);

    return `Total price ${sum}`;
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes['products'].currentValue);
    console.log(changes['products'].previousValue);
  }
  ngOnDestroy(): void {
    console.log('Conponent removed');
  }

  handleDelete = (id: number) => {
    this.dataEvent.emit(id);
  };
}
