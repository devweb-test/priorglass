function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, data) {
    var date = new Date;
        date.setMinutes(date.getMinutes() + 15);
        document.cookie = name + "=" + data + "; path=/; expires=" + date.toUTCString();
}

jQuery(document).ready(function(){

    jQuery('.client_file').change(function() {
        if (jQuery(this).val() != '') {
            jQuery(this).prev().text('Выбрано файлов: ' + jQuery(this)[0].files.length);
        } else {
            jQuery(this).prev().text('Прикрепить файлы');
        }
    });

    jQuery('.file-input').change(function() {
        if (jQuery(this).val() != '') {
            jQuery(this).prev().text('Выбрано файлов: ' + jQuery(this)[0].files.length);
        } else {
            jQuery(this).prev().text('Прикрепить файлы');
        }
    });

    var form_type = '';
    var form_id = '';
    jQuery("a.popup").on('click', function(){
        form_type = jQuery(this).attr("href");
        form_id = form_type;

    });

    jQuery(form_id +' input').on('blur', function() {
        if( validate(jQuery(this), jQuery(this).attr('name')) != undefined  ){
            jQuery(this).addClass('error-input');
        }
    }).on('focus', function() {
        jQuery(this).removeClass('error-input');
        jQuery(this).next('.text-error').text('');
        jQuery('.description-form').css('display', 'block');
    jQuery('.error-form').remove();
    });
    jQuery('.text-error, .error-form').on('click', function(){
    jQuery(this).text('');
    jQuery(this).prev('input').removeClass('error-input');
    jQuery('.description-form').css('display', 'block');
    jQuery('.error-form').remove();
    });
    var checkboxes = jQuery(form_id+' input#agree');
    checkboxes.click(function() {
      if (jQuery(this).prop("checked")){
        jQuery(this).closest('form').find('button').prop( "disabled", false ).removeClass("disabled");
      } else {
        jQuery(this).closest('form').find('button').prop( "disabled", true ).addClass("disabled");
      }
    });

    function submitMailForm($form) {
        var $button = $form.find('button[type="submit"]');
        var $description = $form.find('.description-form');
        var $title = $form.find('.title-form');
        var pageTitle = jQuery('h1').first().text();

        if ($form.data('sending')) {
            return false;
        }

        $form.find('input[name="title_page"]').val(pageTitle);
        /*
         * В разметке старых всплывающих форм технические поля имеют
         * повторяющиеся id. Устанавливаем значения внутри текущей формы,
         * чтобы заявка не отклонялась серверной антиспам-проверкой.
         */
        $form.find('input[name="user_age"]').val('wYW8CciZFB21');
        $form.find('input[name="passport_data"]').val('d0pi4btvt152');
        $form.find('.error-form, .progress').remove();

        if ($form.find('input[name="client_fio"]').val() === '' || $form.find('input[name="client_telephone"]').val() === '') {
            $description.hide();
            $title.after('<div class="error-form">Заполните имя и номер телефона.</div>');
            return false;
        }

        if (!$form.find('[name="g-recaptcha-response"]').val()) {
            $description.hide();
            $title.after('<div class="error-form">Подтвердите, что вы не робот.</div>');
            return false;
        }

        $button.prop('disabled', true).addClass('disabled');
        $form.data('sending', true);
        jQuery.ajax({
            type: 'POST',
            url: $form.attr('action'),
            data: new FormData($form[0]),
            processData: false,
            contentType: false,
            beforeSend: function () {
                $description.hide();
                $title.after('<div class="progress"><img src=(window.OFFLINE_ROOT+"assets/loading-4-d58d957b6d3c.gif") alt="Отправляем заявку" /></div>');
            },
            success: function (data) {
                $form.data('sending', false);
                $button.prop('disabled', false).removeClass('disabled');
                $form.find('.progress').remove();

                if (jQuery.trim(data) !== 'send_mail') {
                    $description.show();
                    $title.after('<div class="error-form">Не удалось отправить заявку. Попробуйте ещё раз.</div>');
                    return;
                }

                $description.show();
                jQuery.magnificPopup.close();
                setTimeout(function () {
                    jQuery.magnificPopup.open({items: {src: '#thanks_window'}, type: 'inline'});
                }, 1000);
            },
            error: function () {
                $form.data('sending', false);
                $button.prop('disabled', false).removeClass('disabled');
                $form.find('.progress').remove();
                $description.show();
                $title.after('<div class="error-form">Не удалось отправить заявку. Попробуйте ещё раз.</div>');
            }
        });

        return false;
    }

    /*
     * В разметке двух форм оставлены старые обработчики XMLHttpRequest.
     * Останавливаем их на этапе перехвата и отправляем заявки единым способом.
     */
    document.addEventListener('submit', function (event) {
        if (event.target && (event.target.id === 'second_form' || event.target.id === 'contact_form')) {
            event.preventDefault();
            event.stopImmediatePropagation();
            submitMailForm(jQuery(event.target));
        }
    }, true);

    jQuery(document).on('submit', '.form-send-mail', function (event) {
        event.preventDefault();
        return submitMailForm(jQuery(this));
    });

    /* Старые inline-обработчики добавляются в разметке позже и дублируют AJAX. */
    function detachLegacyFormSubmitHandlers() {
        jQuery('#callback_form, #second_form, #contact_form').off('submit');
    }

    /* В старой разметке обработчики могут добавляться уже после DOMContentLoaded. */
    [0, 100, 500, 1000].forEach(function (delay) {
        window.setTimeout(detachLegacyFormSubmitHandlers, delay);
    });
    /*
     * На части старых страниц обработчики добавляются после инициализации
     * общего скрипта. Перед открытием формы снимаем их ещё раз, когда
     * разметка страницы уже полностью загружена.
     */
    jQuery(document).on('click', 'a.popup', function () {
        var target = jQuery(this).attr('href');
        if (target === '#callback' || target === '#second_callback' || target === '#contact') {
            detachLegacyFormSubmitHandlers();
        }
    });

    jQuery(document).on('submit', '.open-form', function (e) {

        e.preventDefault();

        if( jQuery(this).find('input[name="user_name"]').val() == ''){
            jQuery(this).find('input[name="user_name"]').next().text('Необходимо ввести Ваше имя');
            return false;
        }

        if( jQuery(this).find('input[name="user_tel"]').val() == '' ){
            jQuery(this).find('input[name="user_tel"]').next().text('Необходимо ввести номер телефона');
            return false;
        }

        jQuery(this).closest('form').find('.button-submit_form').prop( "disabled", true ).addClass("disabled");

        var formData = jQuery(this).serialize();
        var actionForm = jQuery(this).attr('action');
        ga('send', 'event', 'form_calc', 'send'); yaCounter20720524.reachGoal('form_calc_send');
        jQuery.ajax({
            type: 'POST',
            url: actionForm,
            data: formData,
            success: function(data) {
                jQuery('.button-submit_form').prop( "disabled", false ).removeClass("disabled");
            },
            error:  function(xhr, str){
                jQuery('.button-submit_form').prop( "disabled", false ).removeClass("disabled");
                console.log(xhr);
                console.log(str);
            }
        });
        return false;
    });

    jQuery(document).on('mouseleave', function () {
        var cookie = getCookie("time");

        if (cookie != 'on') {
            setCookie('time', 'on');
            jQuery.magnificPopup.open({items: {src: '#second_callback'},type: 'inline'});
        }
    });

});



function validate(input, type){
    var element = input.val();
    var errorText;

    if (type == 'client_fio') {
        if(element.length < 3){
            errorText = "Необходимо ввести Ваше имя";
            input.next('.text-error').text(errorText);
        }
        else if( element.length >= 3 )
        {
            var pattern = /^[а-яА-ЯёЁa-zA-Z -]+$/;
            if (!pattern.test(element)) {
                errorText = 'Введите имя корректно, например, Иван';
                input.next('.text-error').text(errorText);
            }
        }
    }
        if( type == 'client_telephone' ){
        if( element.length < 6 ){
            errorText = "Слишком короткий номер телефона";
            input.next('.text-error').text(errorText);
        } else if(element.length >= 6){
            var pattern = /^(\s*)?(\+)?([- _():=+]?\d[- _():=+]?){10,14}(\s*)?$/;
            if (!pattern.test(element)) {
                errorText = 'Введите номер телефона корректно';
                input.next('.text-error').text(errorText);
            }
        }
    }
    if( type == 'client_mail' ){
        if( element.length != 0 && element.length < 6 ){
            errorText = "Слишком короткий адрес электронной почты";
            input.next('.text-error').text(errorText);
        } else if( element.length >= 6 ){
             var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
            if (!pattern.test(element)) {
                errorText = 'Введен некорректный адрес электронной почты.';
                input.next('.text-error').text(errorText);
            }
        }
    }
    return errorText;

}
