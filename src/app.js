/**
 *   @name app  Entrada al aplicativo
 *   @description  Levanta API (Themisto). Se configura los middlewares, y las rutas del servicio.
 *   @type API  -> Themisto
 */ 
'use strict'

// IMPORTS
const config = require('../conf/config');
const express = require('express');
const app = express();

// Atributes del APP
const PORT = config.themisto.port;

// RUTAS
const routes_input = require('./routers/input.router');

// API's MiddleWares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, Origin, X-Requested-With,Content-Type,Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,OPTIONS');
    res.header('Allow','GET,POST,PUT,DELETE,OPTIONS');

    next();
});
app.use('/api',routes_input);

//Run Server
app.listen(PORT, ( ) => {
    console.log(` # Themisto Server running on port ${PORT} ... `);
});