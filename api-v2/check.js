/*
 *     _____________  ___  
      / ___/ ___/ _ \/ _ \ 
     (__  ) /  /  __/  __/ 
    /____/_/   \___/\___  
 * File Created: Wednesday, 17th July 2019 9:56:05 am
 * Author: SreeTeja06 (sreeteja.muthyala@gmail.com)

 * There are two ways to write error-free programs; only the third one works.
 * And remeber it is not a bug, it is an undocumented feature
 */
const regUser = require( './helpers/regUser' );
const query = require( './helpers/query' );
const invoke = require( './helpers/invoke' );
const blockListener = require( './helpers/blockListener' );

// regUser('bayer', 'bayerUser')
let args = ["002"];
query('queryHistoryForKey', args, 'ourchannel', 'test3', 'bayer', 'bayerUser');

args = ['002', 'citric', 'bayer', '10/09/1998', 'hyderabad', 'temp', '45', 'lesser'];
args = JSON.stringify( args );
res = invoke( 'createMedicine', args, 'ourchannel', 'test3', 'bayer', 'bayerUser',true );
console.log(res);
// blockListener( 'ourchannel', 'bayer', 'bayerUser' );

// args = ['002', 'citric', 'bayer', '10/09/1998', 'hyderabad', 'temp', '45', 'lesser'];
// args = JSON.stringify( args );
// res = invoke( 'createMedicine', args, 'ourchannel', 'test3', 'bayer', 'bayerUser' );
