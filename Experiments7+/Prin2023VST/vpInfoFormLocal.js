function checkVpInfoFormLocal(alert_message = '') {
    // get age, gender, handedness and VPs consent
    if (alert_message === '') {
        alert_message = 'La preghiamo di rispondere a tutte le domande per continuare!!';
    }

    let name = document.getElementById('name').value;
    let lastname = document.getElementById('lastname').value;
    let student_id = document.getElementById('student_id').value;
    let age = document.getElementById('age').value;

    let gender = '';
    if ($('#male').is(':checked')) {
        gender = 'male';
    } else if ($('#female').is(':checked')) {
        gender = 'female';
    } else if ($('#prefer_not_to_say').is(':checked')) {
        gender = 'prefer_not_to_say';
    }

    let consent = false;
    if ($('#consent_checkbox').is(':checked')) {
        consent = true;
    }

    if (consent && student_id !== '' && age !== '' && gender !== '') {
        return { name: name, lastname: lastname, student_id: student_id, age: age, gender: gender};
    } else {
        window.alert(alert_message);
        return false;
    }
}

function vpInfoFormLocal(form = './vpInfoFormLocal.html', alert_message = '') {
    return {
        type: jsPsychExternalHtml,
        url: form,
        cont_btn: 'start',
        check_fn: function() {
            const vpInfo = checkVpInfoFormLocal(alert_message = alert_message);
            if (vpInfo !== false) {
                jsPsych.data.addProperties(vpInfo);
                return true;
            } else {
                return false;
            }
        },
    };
}
