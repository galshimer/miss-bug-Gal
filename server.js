import express from "express"
import cookieParser from "cookie-parser"

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

app.get('/api/bug', (req, res) => {
    const filterBy = {
        txt: req.query.txt,
        severity: +req.query.severity,
        description: req.query.description,
        sortBy: req.query.sortBy || 'createdAt', 
        sortDir: req.query.sortDir || '1', 
        pageIdx: req.query.pageIdx ? +req.query.pageIdx : 0
    }

    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(500).send('Cannot get bugs')
        })
})

app.post('/api/bug', (req, res) => {
    const bugToSave = {
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity
    }

    bugService.save(bugToSave)
        .then(bug => res.send(bug))
        .catch((err) => {
            loggerService.error('Cannot save bug', err)
            res.status(500).send('Cannot save bug', err)
        })
})

app.put('/api/bug', (req, res) => {
    const bugToSave = {
        _id: req.body._id,
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity
    }

    bugService.save(bugToSave)
        .then(bug => res.send(bug))
        .catch((err) => {
            loggerService.error('Cannot save car', err)
            res.status(500).send('Cannot save car', err)
        })
})

app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    console.log('bugId:', bugId)

    let visitedBugs = req.cookies.visitedBugs ? JSON.parse(req.cookies.visitedBugs) : []

    if (!visitedBugs.includes(bugId)) {
        if (visitedBugs.length >= 3) {
            return res.status(401).send('Wait for a bit')
        }
        visitedBugs.push(bugId)
    }

    res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 7 * 1000 })

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch((err) => {
            loggerService.error('Cannot get bug', err)
            res.status(500).send('Cannot get bug')
        })
})

app.delete('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => res.send(`Bug (${bugId}) removed!`))
        .catch((err) => {
            loggerService.error('Cannot remove bug', err)
            res.status(500).send('Cannot remove bug', err)
        })

})

app.listen(3030, () => console.log('Server ready at port 3030!'))