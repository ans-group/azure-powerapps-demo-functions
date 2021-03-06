// Import Modules
const faker = require('faker')
const moment = require('moment')
const { v1: uuid } = require('uuid')
const STORAGE = require('./modules/ms-storage')

// Create the module objects
const storage = new STORAGE()

// set the faker js locale and seed
faker.locale = 'en_GB'
faker.seed(1337)

const main = async function (context, timer) {
  // Export AD Users
  const usersData = new Array(2000).fill(0).map(_ => {
    const name = `${faker.name.firstName()} ${faker.name.lastName()}`
    const email = `${name.replace(/\s/g, '.')}@${faker.internet.domainName()}`
    return {
      displayName: name,
      givenName: name.split(' ')[0],
      id: uuid(),
      jobTitle: faker.name.jobTitle(),
      mail: email,
      mobilePhone: faker.phone.phoneNumber(),
      officeLocation: 'Head Office',
      surname: name.split(' ')[name.split(' ').length - 1],
      userPrincipalName: email
    }
  })

  // Get Teams Activity Report Location
  const teamsData = usersData.map((user, i) => ({
    ...user,
    lastActivityDate: i % 200 === 0 ? getLastActivity(5, 10) : getLastActivity(2, 4),
    reportRefreshDate: moment().format('YYYY-MM-DD'),
    isDeleted: false,
    deletedDate: null,
    teamChatMessageCount: i % 200 === 0 ? getRandomInteger(0, 5) : getRandomInteger(80, 2500),
    privateChatMessageCount: i % 200 === 0 ? getRandomInteger(0, 5) : getRandomInteger(80, 2500),
    callCount: i % 200 === 0 ? getRandomInteger(0, 5) : getRandomInteger(10, 70),
    meetingCount: i % 200 === 0 ? getRandomInteger(0, 5) : getRandomInteger(10, 70),
    reportPeriod: '7',
    hasOtherAction: false
  }))

  // Write user data to Blob
  const userBlobId = await storage.uploadBlob('user-json', 'user_data.json', JSON.stringify({ value: usersData }))

  // Write user data to Blob
  const teamsBlobId = await storage.uploadBlob('teams-json', 'teams_activity_data.json', JSON.stringify({ value: teamsData }))

  // Log Blob Upload Response Id
  context.log('User JSON Blob Upload Id: ' + userBlobId)
  context.log('Teams JSON Blob Upload Id: ' + teamsBlobId)

  // End
  context.done()
}

function getLastActivity (from, to) {
  return moment().subtract(getRandomInteger(from, to), 'days').format('YYYY-MM-DD')
}

function getRandomInteger (from, to) {
  return Math.round(Math.random() * (to - from) + from)
}

module.exports = main
