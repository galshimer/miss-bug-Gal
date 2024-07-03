import { log } from "console"
import { utilService } from "./util.service.js"
import fs from 'fs'


const bugs = utilService.readJsonFile('data/bug.json')

export const bugService = {
    query,
    getById,
    remove,
    save
}
const PAGE_SIZE = 3

function query(filterBy = { txt: '' }) {
    return Promise.resolve(bugs)
        .then(bugs => {
            if (filterBy.txt) {
                const regExp = new RegExp(filterBy.txt, 'i')
                bugs = bugs.filter(bug => regExp.test(bug.title))
            }
            if (filterBy.severity) {
                bugs = bugs.filter(bug => bug.severity >= filterBy.severity)
            }
            if (filterBy.sortBy) {
                const sortDir = filterBy.sortDir === '-1' ? -1 : 1
                bugs.sort((a, b) => {
                    if (a[filterBy.sortBy] > b[filterBy.sortBy]) return sortDir
                    if (a[filterBy.sortBy] < b[filterBy.sortBy]) return -sortDir
                    return 0
                })
            }
            if (filterBy.pageIdx !== undefined) {
                const startIdx = filterBy.pageIdx * PAGE_SIZE
                bugs = bugs.slice(startIdx, startIdx + PAGE_SIZE)
            }
            return bugs
        })
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('Cannot find bug - ' + bugId)
    return Promise.resolve(bug)
}

function remove(bugId, loggedinUser) {
    const bugIdx = bugs.findIndex(bug => bug._id === bugId)
    if (bugIdx < 0) return Promise.reject('Cannot find bug - ' + bugId)

    const bug = bug[bugIdx]
    if (!loggedinUser.isAdmin &&
        bug.owner._id !== loggedinUser._id) {
        return Promise.reject('Not your bug')
    }
    bugs.splice(bugIdx, 1)
    return _saveBugsToFile().then(() => `bug (${bugId}) removed!`)
}

function save(bugToSave, loggedinUser) {
    if (bugToSave._id) {
        const bugToUpdate = bugs.find(bug => bug._id === bugToSave._id)
        if (!loggedinUser.isAdmin &&
            bugToUpdate.owner._id !== loggedinUser._id) {
            return Promise.reject('Not your bug')
        }
       bugToUpdate.title = bugToSave.title
       bugToUpdate.description = bugToSave.description
       bugToUpdate.severity = bugToSave.severity
    } else {
        bugToSave._id = utilService.makeId()
        bugToSave.owner = loggedinUser
        bugs.unshift(bugToSave)
    }

    return _saveBugsToFile().then(() => bugToSave)
}

function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 4)
        fs.writeFile('data/bug.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to cars file', err)
                return reject(err)
            }
            resolve()
        })
    })
}