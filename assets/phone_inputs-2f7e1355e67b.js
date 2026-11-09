(function ($) {
  'use strict';

  var errorText = 'Укажите корректный российский номер телефона: +7 и 10 цифр.';

  function nationalDigits(value) {
    value = value.trim();
    if (value && !/^\+?[0-9\s()\-]+$/.test(value)) return null;

    var digits = value.replace(/\D/g, '');
    if (value.indexOf('+7') === 0 && digits.charAt(0) === '7') {
      digits = digits.slice(1);
    } else if (digits.length === 11 && /^[78]/.test(digits)) {
      digits = digits.slice(1);
    } else if (value.charAt(0) === '+') {
      return null;
    }

    return digits.length <= 10 ? digits : null;
  }

  function normalize(value) {
    var digits = nationalDigits(value);
    return digits && /^[3489][0-9]{9}$/.test(digits) ? '+7' + digits : null;
  }

  function format(digits) {
    var value = '+7 (' + digits.slice(0, 3);
    if (digits.length >= 3) value += ')';
    if (digits.length > 3) value += ' ' + digits.slice(3, 6);
    if (digits.length > 6) value += '-' + digits.slice(6, 8);
    if (digits.length > 8) value += '-' + digits.slice(8, 10);
    return value;
  }

  function caretPosition(value, digitCount) {
    if (digitCount === 0) return 4;
    var seen = 0;
    for (var i = 4; i < value.length; i++) {
      if (/\d/.test(value.charAt(i)) && ++seen === digitCount) return i + 1;
    }
    return value.length;
  }

  function showError(input) {
    input.focus();
    var message = input.nextElementSibling;
    input.classList.add('error-input');
    input.setAttribute('aria-invalid', 'true');
    message.textContent = errorText;
    message.setAttribute('role', 'alert');
  }

  function clearError(input) {
    input.classList.remove('error-input');
    input.removeAttribute('aria-invalid');
    input.nextElementSibling.textContent = '';
  }

  function prepare(input) {
    // Убираем прежнюю маску +9, заданную общим сценарием темы.
    if ($.fn.unmask) $(input).unmask();
    input.setAttribute('inputmode', 'tel');
    input.setAttribute('autocomplete', 'tel-national');
    input.setAttribute('placeholder', '+7 (___) ___-__-__');
    if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('text-error')) {
      var message = document.createElement('div');
      message.className = 'text-error';
      input.insertAdjacentElement('afterend', message);
    }

    input.addEventListener('focus', function () {
      if (!input.value) {
        input.value = '+7 (';
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });

    input.addEventListener('input', function () {
      clearError(input);
      var beforeCaret = input.value.slice(0, input.selectionStart);
      var digitsBeforeCaret = nationalDigits(beforeCaret);
      var digits = nationalDigits(input.value);
      if (digits === null) {
        input.value = input.dataset.phonePrevious || '+7 (';
        showError(input);
        return;
      }
      input.value = format(digits);
      input.dataset.phonePrevious = input.value;
      input.setSelectionRange(caretPosition(input.value, (digitsBeforeCaret || '').length), caretPosition(input.value, (digitsBeforeCaret || '').length));
    });

    input.addEventListener('paste', function (event) {
      var clipboard = event.clipboardData || window.clipboardData;
      if (!clipboard) return;
      var pasted = clipboard.getData('text');
      var digits = nationalDigits(pasted);
      if (digits === null) {
        event.preventDefault();
        showError(input);
        return;
      }
      event.preventDefault();
      clearError(input);
      input.value = format(digits);
      input.dataset.phonePrevious = input.value;
      input.setSelectionRange(input.value.length, input.value.length);
    });

    input.addEventListener('blur', function () {
      if (input.value === '+7 (') input.value = '';
    });

    input.addEventListener('invalid', function (event) {
      event.preventDefault();
      showError(input);
    });

    if (input.value) {
      var initial = nationalDigits(input.value);
      if (initial !== null) input.value = format(initial);
    }
    input.dataset.phonePrevious = input.value;
  }

  document.addEventListener('submit', function (event) {
    var phones = event.target.querySelectorAll('input[type="tel"]');
    for (var i = 0; i < phones.length; i++) {
      if (!normalize(phones[i].value)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showError(phones[i]);
        return;
      }
    }
  }, true);

  $(function () {
    $('form input[type="tel"]').each(function () { prepare(this); });
  });
})(jQuery);
