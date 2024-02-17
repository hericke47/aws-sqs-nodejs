import 'dotenv/config';
import path from 'node:path'
import express from 'express'
import aws from 'aws-sdk'

const app = express()
const folder = path.resolve(process.env.PWD, '..', 'frontend')

app.use(express.static(folder))
app.use(express.json())

aws.config.update({ region: 'us-east-1' })
const sqs = new aws.SQS()

app.post('/request_images', (req, res) => {
  const qtdImagens = parseInt(req.body.qteImagens)


  for (let index = 0; index < qtdImagens; index++) {
    sqs.sendMessage(
      {
        MessageBody: "Gerar imagens!",
        QueueUrl: "https://sqs.us-east-1.amazonaws.com/623994026831/images-queue"
      },
      (err, data) => {
        if(err) {
          console.log(err)
        } else {
          console.log("Success", data.MessageId)
        }
      }
    )

  }

  res.json({
    body: req.body,
    ok: true
  })
})

app.listen(3000, () => {
  console.log("Server started on port 3000")
})