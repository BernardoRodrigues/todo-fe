import { formatDate } from "@angular/common";
import { Injectable } from "@angular/core";
import { CalendarDateFormatter, DateFormatterParams } from "angular-calendar";

@Injectable()
export class CustomDateFormatter extends CalendarDateFormatter {

    public monthViewColumnHeader({date, locale}: DateFormatterParams): string {
        return locale != null? formatDate(date, 'EEE', locale) : '';
    }

    

}