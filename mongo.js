const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Please provide a password! node mongo.js password')
    process.exit(1)
}

if (process.argv.length === 4) {
    console.log('Please provide two arguments name and number')
    process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://staffan-admin:${password}@cluster0.zhxag6z.mongodb.net/?retryWrites=true&w=majority`

mongoose.connect(url)
    .then(() => console.log('Connected'))
    .catch((err) => console.log(err))

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
    Person
        .find({})
        .then((result) => {
            console.log('phonebook:')
            result.forEach((person) => 
                console.log(`${person.name} ${person.number}`))
            mongoose.connection.close()
        })
        .catch((err) => console.log(err))
} else {
    const person = new Person({
        name: name,
        number: number
    })

    person.save()
        .then(() => {
            console.log('person saved')
            mongoose.connection.close()
        })
        .catch((err) => console.log(err))
}