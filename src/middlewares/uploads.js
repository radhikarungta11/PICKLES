const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const { MulterError } = require('multer');

const MAX_AVATAR_SIZE = 1024 * 512;
const MAX_POST_FILE_SIZE = 1024 * 2048;
const MAX_BANNER_SIZE = 1024 * 2048;

cloudinary.config({
    cloud_name: process.env.CLDNRY_NAME,
    api_key: process.env.CLDNRY_API_KEY,
    api_secret: process.env.CLDNRY_API_SECRET,
});

const isCloud =
    process.env.CLDNRY_NAME &&
    process.env.CLDNRY_API_KEY &&
    process.env.CLDNRY_API_SECRET;

function saveImage(maxFileSize, fileName, folderName, localDest) {
    return multer({
        storage: isCloud
            ? new CloudinaryStorage({
                  cloudinary: cloudinary,
                  params: {
                      folder: folderName,
                  },
              })
            : new multer.diskStorage({
                  destination: function (req, file, cb) {
                      cb(null, localDest);
                  },
              }),
        limits: { fileSize: maxFileSize, files: 1 },
        fileFilter: (req, file, callback) => {
            if (file.mimetype.split('/').shift() !== 'image')
                return callback(new MulterError('LIMIT_UNEXPECTED_FILE'));
            callback(null, true);
        },
    }).single(fileName);
}

function processAvatar(req, res, next) {
    saveImage(
        MAX_AVATAR_SIZE,
        'avatar',
        'avatars',
        './uploads/images/avatars'
    )(req, res, (err) => {
        if (err) return res.status(400).send(err);
        if (req.body.avatar) return res.sendStatus(400);
        if (req.file)
            req.body.avatar = isCloud ? req.file.path : `/${req.file.path}`;
        next();
    });
}

function processPostFile(req, res, next) {
    saveImage(
        MAX_POST_FILE_SIZE,
        'file',
        'postFiles',
        './uploads/images/postFiles'
    )(req, res, (err) => {
        if (err) return res.status(400).send(err);
        if (req.body.file) return res.sendStatus(400);
        if (req.file)
            req.body.file = isCloud ? req.file.path : `/${req.file.path}`;
        next();
    });
}

function processBanner(req, res, next) {
    saveImage(
        MAX_BANNER_SIZE,
        'banner',
        'banners',
        './uploads/images/banners'
    )(req, res, (err) => {
        if (err) return res.status(400).send(err);
        if (req.body.banner) return res.sendStatus(400);
        if (req.file)
            req.body.banner = isCloud ? req.file.path : `/${req.file.path}`;
        next();
    });
}

module.exports = {
    processAvatar,
    processPostFile,
    processBanner,
};
