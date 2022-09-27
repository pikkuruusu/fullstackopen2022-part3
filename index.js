require('dotenv').config()
const { response } = require('express')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person.js')

const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan('tiny', {
    skip: (req, res) => req.method === 'POST'
}))

app.get('/', (request, response) => {
    response.send('<p>Persons api</p>')
})

app.get('/info', (request, response) => {
    Person.countDocuments({}, (err, count) => {
        response.send(`<p>Phonebook has info for ${count} people</p>
            <p>${new Date()}</p>`)
    })
})

app.get('/api/persons', (request, response) => {
    Person
        .find({})
        .then(persons => {
            response.json(persons)
        })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if(person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
morgan.token('body', (req, res) => JSON.stringify(req.body))

app.post('/api/persons/', (request, response, next) => {
    const body = request.body

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true})
        .then(updatedNote => {
            response.json(updatedNote)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message})
    } else if (error.code && error.code == 11000) {
        return response.status(409).send({error: 'Name already in database.'})
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})