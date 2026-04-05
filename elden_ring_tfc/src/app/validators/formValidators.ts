import {FormControl, FormGroup, ValidationErrors} from '@angular/forms';

export class FormValidators {
  static notOnlyWhiteSpace(control: FormControl): ValidationErrors | null {
    if ((control.value != null) && (control.value.trim().length == 0)) {
      return {notOnlyWhiteSpace: true};
    } else {
      return null;
    }
  }

  static forbiddenWord(words: string[]): ValidationErrors{
    return (control: FormControl): ValidationErrors | null => {
      let result = null;
      words.forEach(word => {
        const regExp = new RegExp(word, 'i');
        const forbidden = regExp.test(control.value);
        if (forbidden) result = {forbiddenWord: {value: control.value}};
      })
      return result;
    }
  }

  static minValue(value: number): ValidationErrors{
    return (control: FormControl): ValidationErrors | null => {
      if (control.value <= value) return  {minValue: true};
      else return null;
    }
  }

  static allowedExtension (regex: RegExp): ValidationErrors {
    return (control: FormControl): ValidationErrors | null => {
      const allowed = regex.test(control.value);
      return allowed ? null : {allowedExtension: true}
    }
  }

  static passwordMatch(form: FormGroup): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;

    if (!password || !confirm) return null;

    return password === confirm ? null : { passwordMismatch: true };
  }
}
