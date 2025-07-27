const imgLoading = $('#img-loading');
const bodyClassList = document.body.classList;

function setDarkMode() {
    bodyClassList.add('dark-mode');
    imgLoading.attr('src', '/assets/images/loadingDark.gif');
    location.hash = 'modal-loading';
}
function setLightMode() {
    imgLoading.attr('src', '/assets/images/loadingLight.gif');
    location.hash = 'modal-loading';
}

if (bodyClassList.contains('manual-dark')) setDarkMode();
else if (bodyClassList.contains('manual-light')) setLightMode();
else {
    const osThemeQuery = matchMedia('(prefers-color-scheme: dark)');
    if (osThemeQuery.matches) setDarkMode();
    else setLightMode();
}

const notyf = new Notyf({
    duration: 2000,
    position: { x: 'right', y: 'top' },
    dismissible: true,
    types: [
        {
            type: 'info',
            background: 'dodgerblue',
        },
    ],
});

function notyfFeatureComingSoon() {
    notyf.open({
        type: 'info',
        message: 'Feature coming soon!',
    });
}

function openCommunity(event) {
    location.href = `/c/${event.target.innerText}`;
}

$('#btn-theme').on('click', () => {
    const theme = document.body.classList.contains('dark-mode');
    $.ajax({
        url: '/settings/theme',
        type: 'PATCH',
        data: { theme },
    });
});

const imgModal = $('#img-modal');
$('body').on('click', '.link-modal-img', (event) => {
    imgModal.attr('src', event.target.src);
});

const inpSearch = $('#inp-search');
inpSearch.on('keypress', (event) => {
    if (event.which === 13) {
        const inpSearchVal = inpSearch.val().trim();
        if (inpSearchVal.length) {
            const type = inpSearchVal.substring(0, 1);
            const target = inpSearchVal.substring(1);
            if (type === '@') {
                notyf.open({
                    type: 'info',
                    message: 'Feature coming soon!',
                });
            } else if (type === '#') {
                const targetPath = `/c/${target}`;
                $.get(
                    targetPath,
                    () => (location.pathname = targetPath)
                ).fail(() => inpSearch.addClass('is-invalid'));
            } else {
                inpSearch.addClass('is-invalid');
            }
        }
    }
});

inpSearch.on('input', () => inpSearch.removeClass('is-invalid'));
inpSearch.on('blur', () => inpSearch.removeClass('is-invalid'));

function raiseValidityMsg(object, message) {
    const objectJS = object[0];
    objectJS.setCustomValidity(message);
    objectJS.reportValidity();
}

function createSubmitTrigger(object, triggerTarget) {
    object.on('keypress', (event) => {
        object[0].setCustomValidity('');
        if (event.which === 13) triggerTarget.trigger('click');
    });
}

function addFileDisplay(inputFile, imgFile) {
    const fileReader = new FileReader();
    fileReader.onload = (event) => imgFile.attr('src', event.target.result);
    inputFile.on('change', (event) => {
        fileReader.readAsDataURL(event.target.files[0]);
    });
}

function createPost(post) {
    return $(
        `<div class="div-post-box">
            <div class="card p-0 m-5 div-post-card">
                <div class="div-post-image">
                    <a href="#modal-image">
                        <img src="${post.file}" class="img-fluid fill-image link-modal-img">
                    </a>
                </div>
                <div class="m-10">
                    <div class="font-weight-medium font-size-18 mb-5">
                        ${post.title}
                    </div>
                    <div class="text-muted div-post-comm" onclick="openCommunity(event);">
                        ${post.belongsTo.name}
                    </div>
                    <div class="div-author" onclick="notyfFeatureComingSoon();">
                        ${post.author.handle}
                    </div>
                    <div class="div-saves" onclick="notyfPleaseLogIn();">
                        <i class="far fa-heart mr-5"></i>
                        ${post.numLikes}
                    </div>
                </div>
            </div>
        </div>`
    );
}

const contentLocation = location.pathname.split('/').pop();
let pageNo = 2;
const contentWrapper = $('.content-wrapper')[0];
const divContentBody = $('#div-content-body');
let loadNewPage = true;
function scrollPage() {
    if (
        loadNewPage &&
        contentWrapper.scrollTop + contentWrapper.clientHeight >=
            contentWrapper.scrollHeight - 400
    ) {
        loadNewPage = false;
        $.get(`${contentPath}?pageNo=${pageNo++}`, (posts) => {
            for (post of posts) divContentBody.append(createPost(post));
            loadNewPage = true;
        }).fail(() => (contentWrapper.onscroll = null));
    }
}
contentWrapper.onscroll = scrollPage;

const childScript = $('#script-main').data().childScript;
$.getScript(`/static/scripts/${childScript}`);
