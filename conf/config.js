module.exports = {
    themisto: {
        url: 'localhost' || process.env.URL_THEMISTO,
        port: 5050 || process.env.PORT_THEMISTO,
        uri: '/api'
    },
    ganymede: {
        url: 'localhost' || process.env.URL_GANYMEDE,
        port: 5000 || process.env.PORT_GANYMEDE,
        uri: '/api'
    }
    
}