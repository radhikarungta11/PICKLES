let contentPath = contentLocation
    ? `/api/communities/${contentLocation}/posts`
    : '/api/posts/recent';

function notyfPleaseLogIn() {
    notyf.error('Please log in!');
}

const inpHandleLogIn = $('#inp-handle-login');
const inpPasswordLogIn = $('#inp-password-login');
const btnLogInSubmit = $('#btn-login-submit');
const formLogIn = $('#form-login');

btnLogInSubmit.on('click', () => {
    const inpHandleLogInVal = inpHandleLogIn.val();
    const inpPasswordLogInVal = inpPasswordLogIn.val();
    if (/\S/.test(inpHandleLogInVal)) {
        if (/\S/.test(inpPasswordLogInVal)) {
            $.post(
                '/auth/login',
                formLogIn.serialize(),
                () => (location.href = location.pathname)
            ).fail((err) => {
                const status = err.status;
                if (status === 400) {
                    return notyf.error('Invalid data!');
                }
                if (status === 404) {
                    return notyf.error('Account not found!');
                }
                if (status === 401) {
                    return notyf.error('Password does not match!');
                }
            });
        } else raiseValidityMsg(inpPasswordLogIn, 'Value cannot be empty!');
    } else raiseValidityMsg(inpHandleLogIn, 'Value cannot be empty!');
});

createSubmitTrigger(inpHandleLogIn, btnLogInSubmit);
createSubmitTrigger(inpPasswordLogIn, btnLogInSubmit);

addFileDisplay($('#inp-avatar-signup'), $('#img-avatar-signup'));

const inpHandleSignUp = $('#inp-handle-signup');
const inpPasswordSignUp = $('#inp-password-signup');
const btnSignUpSubmit = $('#btn-signup-submit');
const formSignUp = document.getElementById('form-signup');

btnSignUpSubmit.on('click', () => {
    const inpHandleSignUpVal = inpHandleSignUp.val();
    const inpPasswordSignUpVal = inpPasswordSignUp.val();
    if (/\S/.test(inpHandleSignUpVal)) {
        if (/\S/.test(inpPasswordSignUpVal)) {
            $.ajax({
                url: '/auth/signup',
                type: 'POST',
                data: new FormData(formSignUp),
                cache: false,
                contentType: false,
                processData: false,
                error: (err) => {
                    const status = err.status;
                    if (status === 400) {
                        const msg = err.responseJSON.code;
                        if (msg === 'LIMIT_FILE_SIZE')
                            return notyf.error('Avatar size too large!');
                        if (msg === 'LIMIT_FILE_COUNT')
                            return notyf.error('Too many files!');
                        if (msg === 'LIMIT_UNEXPECTED_FILE')
                            return notyf.error('Unexpected file type!');
                        return notyf.error('Invalid data!');
                    }
                    if (status === 409) {
                        return notyf.error('Account already exists!');
                    }
                },
                success: () => (location.href = location.pathname),
            });
        } else raiseValidityMsg(inpPasswordSignUp, 'Value cannot be empty!');
    } else raiseValidityMsg(inpHandleSignUp, 'Value cannot be empty!');
});

createSubmitTrigger(inpHandleSignUp, btnSignUpSubmit);
createSubmitTrigger(inpPasswordSignUp, btnSignUpSubmit);

location.href = '#';
