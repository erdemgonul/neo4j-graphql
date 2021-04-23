const concurrently = require('concurrently')

const {
  API_DIR,
  TEMPLATE_DIR,
  runner,
  concurrentOpts,
  templateName,
} = require('./common')

const jobs = [
  {
    name: 'api',
    command: `cd ${API_DIR} && npm run start:dev`,
    prefixColor: 'green',
  },
]

if (templateName === 'Flutter') {
  jobs.push({
    name: templateName,
    command: `cd ${TEMPLATE_DIR} && flutter run`,
    prefixColor: 'blue',
  })
} else {
  jobs.push({
    name: templateName,
    command: `cd ${TEMPLATE_DIR} && npm run start`,
    prefixColor: 'blue',
  })
}

concurrently(jobs, concurrentOpts).catch((e) => {
  console.error(e.message)
})
