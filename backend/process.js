import 'dotenv/config';
import fs from "fs"
import request from "request"
import aws from 'aws-sdk'
import cron from 'node-cron'

aws.config.update({ region: 'us-east-1' })
const sqs = new aws.SQS()

const generateImages = (fileName) => {
  request("https://cataas.com/cat").pipe(
    fs.createWriteStream('imgs/' + fileName + '.png')
  )
}

const proceess = () => {
  sqs.receiveMessage(
    {
      MaxNumberOfMessages: 10, // Cada request vai retornar até 10 mensagens,
      QueueUrl: "https://sqs.us-east-1.amazonaws.com/623994026831/images-queue",
      WaitTimeSeconds: 10
    },
    (err, data) => {
      if(err) {
        console.log(err)
      } else if(data.Messages) {
        console.log("Mensagens recebidas: " + data.Messages.length)
        data.Messages.forEach(el => {
          generateImages(el.MessageId)
          // Mesmo consumindo as mensagens continuam na fila por isso é necessário remove-las
          sqs.deleteMessage(
            {
              QueueUrl: "https://sqs.us-east-1.amazonaws.com/623994026831/images-queue",
              ReceiptHandle: el.ReceiptHandle
            },
            (err, data) => {
              if(err) {
                console.log(err)
              } else {
                console.log("Sucess deleted")
              }
            }
          )
        })
      }
    }
  )
}

cron.schedule('*/5 * * * * *', () => {
  console.log("Processing: ")
  proceess();
})