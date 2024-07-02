
import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'

const STORAGE_KEY = 'bugDB'
const BASE_URL = '/api/bug/'

// _createBugs()

export const bugService = {
    query,
    get,
    save,
    remove,
    getDefaultFilter
}

function query(filterBy = {}, sortBy = {}) {
    return axios.get(BASE_URL, { params: { ...filterBy, ...sortBy } })
        .then(res => res.data)
}

function get(bugId) {
    return axios.get(BASE_URL + bugId)
        .then(res => res.data)
        .then(bug => _setNextPrevBugId(bug))        
}

function remove(bugId) {
    return axios.delete(BASE_URL + bugId)
        .then(res => res.data)
}

function save(bug) {
    if (bug._id) {
        return axios.put(BASE_URL, bug).then(res => res.data)
    } else {
        return axios.post(BASE_URL, bug).then(res => res.data)
    }
}

function getDefaultFilter() {
    return {
        title: '',
        severity: '',
        description: '',
        sortBy: 'createdAt',
        sortDir: '1',
        pageIdx: 0
    }
}

function _setNextPrevBugId(bug) {
    return query().then((bugs) => {
        const bugsIdx = bugs.findIndex((currBug) => currBug._id === bug._id)
        const nextBug = bugs[bugsIdx + 1] ? bugs[bugsIdx + 1] : bugs[0]
        const prevBug = bugs[bugsIdx - 1] ? bugs[bugsIdx - 1] : bugs[bugs.length - 1]
        bugs.nextBugId = nextBug._id
        bugs.prevBugId = prevBug._id
        return bugs
    })
}

