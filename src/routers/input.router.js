'use strict'

const express   = require('express');
const webEngine = require('../search-engine/engine');
const axios     = require('axios');
const config    = require('../../conf/config');

const api       = express.Router();

// Variables de Configuración
// Servidor Garymede
let SERVER = config.ganymede.url
let PORT   = config.ganymede.port
let URI    = config.ganymede.uri

//Url de Servidor
let URL_GANYMEDE = `http://${SERVER}:${PORT}${URI}/input/search-result`;

if(process.env.NODE_ENV == 'production'){
    URL_GANYMEDE = `https://${SERVER}${URI}/input/search-result`;
}

/**
 * @name runWebSearcher
 * @description Función que arranca el Motor De Busqueda Puppeteer
 * @type Función
 * @param {*} data 
 */
const runWebSearcher = async (data) => {
    let search_result;
    search_result = await webEngine.run(data).catch( ( err ) => console.log( err.message) )
    return search_result;
}

/**
 * @description Función que arranca el Motor De Busqueda Puppeteer.
 * @type Ruta End-point.
 * @param req Request
 * @param res Response
 */
api.post('/engine-search/input', (req,res) => {
    let body = req.body;
    let response = body;
    if(body.data && body.status){
        if(body.data.query){
            res.status(200).send( { ok: true, message: 'Engine Running' } );
            runWebSearcher(body.data)
                .then(result=> {
                    response.result = result;
                    response.status = 'fullfiled';
                    axios.default.post( URL_GANYMEDE, response )
                    .catch(err => console.log(err) );
                }).catch(err => {
                    if(err){
                        response.status = 'failed';
                        axios.default.post( URL_GANYMEDE, response )
                            .then( ( res ) => {
                                console.log( res.data );
                            }).catch(err => console.log(err) );
                    } 
                } )
        }else{
            return res.status(400).send();
        }
    }else{
        return res.status(400).send();
    }
 })

module.exports = api