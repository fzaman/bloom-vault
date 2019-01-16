import * as http from 'http'
import * as express from 'express'
import * as bodyParser from 'body-parser'

import {env} from './src/environment'

import { persistError } from './src/logger'

import { tokenRouter } from './src/routes/token'

const app = express()
const server = http.createServer(app)
const port = 3001
server.listen(port)
app.use(bodyParser.json({limit: '10mb'}))

// coors
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')

  if(req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  return next()
})

tokenRouter(app)

app.get('*', (req, res, next) => res.status(404).end())
app.post('*', (req, res, next) => res.status(404).end())

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(err)
  res.status(500).json({error: 'Something went wrong'})
  persistError(err.message, err.stack!)
})

console.log(`Starting server in ${env.pipelineStage} mode`)
console.log(`Local:  http://localhost:${port}/`)

process.on('unhandledRejection', error => {
  if(error) {
    console.log(error)
    persistError(error.message, error.stack)
  }
});