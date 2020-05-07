const chalk = require('chalk')
const path = require('path')
const http = require('http')
const express = require('express')

const socketService = require('./service/socketService')

const app = express()
const server = http.createServer(app)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

server.listen(port, () => {
    console.log('\n---------------------------------------------------')
    console.log('|' + chalk.blue(' Express server is up and running on port: ' +  chalk.green(port) +' ! ') + '|');
    console.log('---------------------------------------------------\n')    
})

socketService.init(server)
