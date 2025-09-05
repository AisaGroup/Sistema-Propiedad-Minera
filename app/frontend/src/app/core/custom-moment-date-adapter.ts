import { Injectable } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { Inject, Optional } from '@angular/core';
import moment from 'moment';

@Injectable()
export class CustomMomentDateAdapter extends MomentDateAdapter {
  constructor(@Optional() @Inject(MAT_DATE_LOCALE) dateLocale: string) {
    super(dateLocale);
    // Forzar el locale español
    moment.locale('es');
  }

  override parse(value: any, parseFormat: string | string[]): moment.Moment | null {
    if (value && typeof value === 'string') {
      // Intentar parsear con los formatos DD/MM/YYYY primero
      const formats = ['DD/MM/YYYY', 'DD/MM/YY', 'D/M/YYYY', 'D/M/YY'];
      for (const format of formats) {
        const parsed = moment(value, format, true);
        if (parsed.isValid()) {
          return parsed;
        }
      }
    }
    return super.parse(value, parseFormat);
  }

  override format(date: moment.Moment, displayFormat: string): string {
    if (!date || !date.isValid()) {
      return '';
    }
    
    // Para el input del datepicker, siempre usar DD/MM/YYYY
    if (displayFormat === 'input' || displayFormat === 'DD/MM/YYYY') {
      return date.format('DD/MM/YYYY');
    }
    
    return super.format(date, displayFormat);
  }

  override getDateNames(): string[] {
    return moment.weekdaysShort();
  }

  override getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    switch (style) {
      case 'long':
        return moment.weekdays();
      case 'short':
        return moment.weekdaysShort();
      case 'narrow':
        return moment.weekdaysMin();
    }
  }

  override getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    switch (style) {
      case 'long':
        return moment.months();
      case 'short':
        return moment.monthsShort();
      case 'narrow':
        return moment.monthsShort();
    }
  }
}
