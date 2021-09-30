import { AbstractControl, FormControl, ValidatorFn } from "@angular/forms";
import * as moment from "moment";

export class DateValidators {


    static date(control: AbstractControl): any | null {
        return DateValidators.dateValidation()(control);
    }


    private static dateValidation(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
          const startDateDate = control.get('startDateDate') as FormControl;
          const startDateTime = control.get('startDateTime') as FormControl;
          const endDateDate = control.get('endDateDate') as FormControl;
          const endDateTime = control.get('endDateTime') as FormControl;
          const [ startDateHour, startDateMinutes ] = (startDateTime.value as string).split(':')
          const startDate = moment(new Date(startDateDate.value)).set('hour', +startDateHour).set('minute', +startDateMinutes)
          const [ endDateHour, endDateMinutes ] = (endDateTime.value as string).split(':')
          const endDate = moment(new Date(endDateDate.value)).set('hour', +endDateHour).set('minute', +endDateMinutes)
          console.log("End Date after start date: ", endDate.isAfter(startDate))
          return endDate.isAfter(startDate) ? null : { date: 'Start Date is after End Date' };
        }
      }

}