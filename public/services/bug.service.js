
import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'

const STORAGE_KEY = 'bugDB'
const BASE_URL = '/api/bug/'

_createBugs()

export const bugService = {
    query,
    getById,
    save,
    remove,
}


function query(filterBy = {}) {
    return axios.get(BASE_URL, { params: filterBy })
        .then(res => res.data)
}

function getById(bugId) {
    return axios.get(BASE_URL + bugId)
        .then(res => res.data)
}

function remove(bugId) {
    return axios.get(BASE_URL + bugId + '/remove')
        .then(res => res.data)
}

function save(bug) {
    const url = BASE_URL + 'save'
    let queryParams = `?title=${bug.title}&severity=${bug.severity}&description=${bug.description}`
    if (bug._id) queryParams += `&_id=${bug._id}`
    return axios.get(url + queryParams).then(res => res.data)
}

function _createBugs() {
    let bugs = utilService.loadFromStorage(STORAGE_KEY)
    if (!bugs || !bugs.length) {
        bugs = [
            {
                title: "Infinite Loop Detected",
                severity: 4,
                description: "problem when clicking Save",
                _id: "1NF1N1T3"
            },
            {
                title: "Keyboard Not Found",
                severity: 3,
                description: "problem when clicking Save",
                _id: "K3YB0RD"
            },
            {
                title: "404 Coffee Not Found",
                severity: 2,
                description: "problem when clicking Save",
                _id: "C0FF33"
            },
            {
                title: "Unexpected Response",
                severity: 1,
                description: "problem when clicking Save",
                _id: "G0053"
            }
        ]
        utilService.saveToStorage(STORAGE_KEY, bugs)
    }



}
