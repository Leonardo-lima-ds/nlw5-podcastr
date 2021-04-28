const withPwa = require('next-pwa');

module.exports = {
    images: {
        domains: ['storage.googleapis.com'],
    },
   
    withPwa: withPwa({
        pwa: {
            disable: process.env.NODE_ENV !== 'production',
            dist: 'public',
            register: true,
            sw: '/sw.js'
        }
    })
}