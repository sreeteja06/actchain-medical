/*
 * SPDX-License-Identifier: Apache-2.0
 *     _____________  ___  
      / ___/ ___/ _ \/ _ \ 
     (__  ) /  /  __/  __/ 
    /____/_/   \___/\___  
 * File Created: Tuesday, 20th August 2019 2:00:07 pm
 * Author: SreeTeja06 (sreeteja.muthyala@gmail.com)

 */

let axios = require( 'axios' );

let authenticate = async ( req, res, next ) => {
    try {
        const token = req.header( 'x-auth' );
        if(!token){
            res.status( 401 ).send();
        }
        const productName = "meditrack";
        let orgName = '';
        if ( req.query.orgName ) {
            orgName = req.query.orgName;
        } else {
            orgName = req.body.orgName;
        }
        let url = "http://actchain-auth-service:4001/access/username?productName=" + productName + "&organization="+orgName
        let result = await axios.get( url, {
            headers: { 'x-auth': token }
        } )
        console.log(result.data);
        req.username = result.data;
        next();
    } catch ( e ) {
        if ( e.response.status === 401 ){
            res.status( 401 ).send();
        }
        console.log( e.stack )
        res.status( 500 ).send();
    }
};

module.exports = { authenticate };