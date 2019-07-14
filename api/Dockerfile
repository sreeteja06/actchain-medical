#*     _____________  ___  
#     / ___/ ___/ _ \/ _ \ 
#    (__  ) /  /  __/  __/ 
#   /____/_/   \___/\___  
#* File Created: Sunday, 14th July 2019 4:18:40 pm
#* Author: SreeTeja06 (sreeteja.muthyala@gmail.com)#
#* There are two ways to write error-free programs; only the third one works.
#* And remeber it is not a bug, it is an undocumented feature
#
FROM node:10
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "node", "index.js" ]