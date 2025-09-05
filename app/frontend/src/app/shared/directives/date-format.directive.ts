import { Directive, ElementRef, Renderer2, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appDateFormat]',
  standalone: true
})
export class DateFormatDirective implements OnInit, OnDestroy {
  private isProcessing = false;

  constructor(
    private el: ElementRef<HTMLInputElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    // Escuchar cuando cambia el valor (por usuario o por Angular)
    this.renderer.listen(this.el.nativeElement, 'input', () => {
      this.formatInputValue();
    });

    // Formatear valor inicial con múltiples intentos
    setTimeout(() => this.formatInputValue(), 0);
    setTimeout(() => this.formatInputValue(), 100);
    setTimeout(() => this.formatInputValue(), 500);
    setTimeout(() => this.formatInputValue(), 1000);
  }

  ngOnDestroy() {
    // Método requerido por OnDestroy
  }

  private formatInputValue() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    const input = this.el.nativeElement;
    const value = input.value;

    if (value && this.isAmericanFormat(value)) {
      const formattedValue = this.convertToEuropeanFormat(value);
      this.renderer.setProperty(input, 'value', formattedValue);
    }
    
    setTimeout(() => {
      this.isProcessing = false;
    }, 10);
  }

  private isAmericanFormat(value: string): boolean {
    // Formato MM/DD/YYYY o M/D/YYYY
    const americanRegex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    return americanRegex.test(value);
  }

  private convertToEuropeanFormat(value: string): string {
    const parts = value.split('/');
    if (parts.length === 3) {
      const [month, day, year] = parts;
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    return value;
  }
}
