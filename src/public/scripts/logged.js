let contentPath = contentLocation
    ? `/api/communities/${contentLocation}/posts`
    : '/api/users/communityFeed';

$('#btn-logout').on('click', () =>
    $.ajax({
        url: '/auth/logout',
        type: 'DELETE',
        success: () => (location.href = location.pathname),
    })
);

const divContentHeader = $('#div-content-header');
const navbarNav = $('.navbar-nav');
function setContent(event, path) {
    contentPath = path;
    pageNo = 1;
    divContentHeader.html('');
    divContentBody.html('');
    navbarNav.find('.active').removeClass('active');
    event.target.parentElement.classList.add('active');
    scrollPage();
    contentWrapper.onscroll = scrollPage;
}

$('.btn-following-feed').on('click', (event) =>
    setContent(event, '/api/users/followingFeed')
);
$('.btn-recent-posts').on('click', (event) =>
    setContent(event, '/api/posts/recent')
);

const inpPostFile = $('#inp-post-file');
const imgPostFile = $('#img-post-file');
addFileDisplay(inpPostFile, imgPostFile);

const inpPostTitle = $('#inp-post-title');
const inpPostComm = $('#inp-post-comm');
const btnAddPostSubmit = $('#btn-add-post-submit');
const formAddPost = document.getElementById('form-add-post');

btnAddPostSubmit.on('click', () => {
    const inpPostFileVal = inpPostFile.val();
    const inpPostTitleVal = inpPostTitle.val();
    const inpPostCommVal = inpPostComm.val();
    if (/\S/.test(inpPostFileVal)) {
        if (/\S/.test(inpPostTitleVal)) {
            if (/\S/.test(inpPostCommVal)) {
                $.ajax({
                    url: '/api/posts',
                    type: 'POST',
                    data: new FormData(formAddPost),
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
                        if (status === 404) {
                            return notyf.error('Community does not exist!');
                        }
                    },
                    success: () => (location.href = `/c/${inpPostCommVal}`),
                });
            } else raiseValidityMsg(inpPostComm, 'Value cannot be empty!');
        } else raiseValidityMsg(inpPostTitle, 'Value cannot be empty!');
    } else notyf.error('File cannot be empty!');
});

createSubmitTrigger(inpPostTitle, btnAddPostSubmit);
createSubmitTrigger(inpPostComm, btnAddPostSubmit);

const inpCommBanner = $('#inp-comm-banner');
const imgCreateCommBanner = $('#img-create-comm-banner');
addFileDisplay(inpCommBanner, imgCreateCommBanner);

const inpCommName = $('#inp-comm-name');
const inpCommDescription = $('#inp-comm-description');
const btnCreateCommSubmit = $('#btn-create-comm-submit');
const formCreateComm = document.getElementById('form-create-comm');

btnCreateCommSubmit.on('click', () => {
    const inpCommBannerVal = inpCommBanner.val();
    const inpCommNameVal = inpCommName.val();
    const inpCommDescriptionVal = inpCommDescription.val();
    if (/\S/.test(inpCommBannerVal)) {
        if (/\S/.test(inpCommNameVal)) {
            if (/\S/.test(inpCommDescriptionVal)) {
                $.ajax({
                    url: '/api/communities',
                    type: 'POST',
                    data: new FormData(formCreateComm),
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
                            return notyf.error('Community already exists!');
                        }
                    },
                    success: () => (location.href = `/c/${inpCommNameVal}`),
                });
            } else
                raiseValidityMsg(inpCommDescription, 'Value cannot be empty!');
        } else raiseValidityMsg(inpCommName, 'Value cannot be empty!');
    } else notyf.error('File cannot be empty!');
});

createSubmitTrigger(inpCommName, btnCreateCommSubmit);
createSubmitTrigger(inpCommDescription, btnCreateCommSubmit);

const iconFollowComm = $('#icon-follow-comm');
const spanFollowComm = $('#span-follow-comm');
const divFollowedComm = $('#div-followed-comm');
const imgCommBannerSrc = $('#img-comm-banner').attr('src');
const communityName = decodeURIComponent(location.pathname.split('/').pop());

$('#btn-follow-comm').on('click', () => {
    $.ajax({
        url: '/api/users/followedCommunities',
        type: 'PATCH',
        data: { name: communityName },
        success: () => {
            iconFollowComm
                .toggleClass('fa-user-plus')
                .toggleClass('fa-user-check')
                .toggleClass('text-success');
            const numUsers = parseInt(spanFollowComm.text());
            if (iconFollowComm.hasClass('text-success')) {
                spanFollowComm.text(`${numUsers + 1} members`);
                divFollowedComm.prepend(
                    $(
                        `<a href="/c/${communityName}" class="sidebar-link sidebar-link-with-icon" id="${communityName}">
                            <span class="w-25 h-25 mr-10">
                                <img src="${imgCommBannerSrc}"
                                    class="img-fluid fill-image align-middle">
                            </span>
                            ${communityName}
                        </a>`
                    )
                );
            } else {
                spanFollowComm.text(`${numUsers - 1} members`);
                $(`#${communityName}`).remove();
            }
        },
    });
});

location.href = '#';
