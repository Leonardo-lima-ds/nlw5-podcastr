const withPWA = require('next-pwa');

const pwa = withPWA({
    pwa: {
        dest: "public",
        regster: true,
        skipWaiting: true,
    }
});

module.exports = {
    images: {
        domains: ['storage.googleapis.com'],
    },

    pwa: pwa,

}