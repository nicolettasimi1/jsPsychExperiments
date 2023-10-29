function checkVpConsentLocal(alert_message = '') {
    if (alert_message === '') {
        alert_message = 'La preghiamo di rispondere a tutte le domande per continuare!!';
    }
    let consent = false;
    if ($('#consent_checkbox').is(':checked')) {
        consent = true;
    }
    if (consent) {
        return true;
    } else {
        window.alert(alert_message);
        return false;
    }
}

function vpConsentLocal(form, alert_message = '') {
    return {
        type: jsPsychExternalHtml,
        url: form,
        cont_btn: 'start',
        check_fn: function() {
            const vpInfo = checkVpConsentLocal(alert_message = alert_message);
            if (vpInfo !== false) {
                jsPsych.data.addProperties(vpInfo);
                return true;
            } else {
                return false;
            }
        },
    };
}
