module.exports = {
    themisto: {
        port:  process.env.PORT || 5050,
        uri: '/api'
    },
    ganymede: {
        url: process.env.URL_GANYMEDE || 'localhost',
        port: process.env.PORT_GANYMEDE || 5000 ,
        uri: '/api'
    }
    
}