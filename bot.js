'use strict'

const botBuilder = require('claudia-bot-builder')
const telegramTemplate = botBuilder.telegramTemplate
const excuse = require('huh')
const confData = require('./conf-data.json')

Array.prototype.random = function () { return this[Math.floor((Math.random()*this.length))] }

module.exports =  botBuilder(message => {
  if (message.text === '/start' || message.text === '/start start')
    return [
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(200).get(),
      'Welcome to HolyJS conference :) \n',
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(400).get(),
      new telegramTemplate.Text(`I am *Igor*, your chatbot friend. You can ask me anything related to the conference!\n\nI'm still not that smart, so check http://holyjs.ru if you have any questions that I can't answer 😉`)
        .addReplyKeyboard([['Schedule'], ['Current talk info'], ['Next talk info'], ['Info'], ['Help']], true, true)
        .get()
    ]

  if (message.text.toLowerCase() === 'schedule' || message.text === '/schedule')
    return [
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(200).get(),
      new telegramTemplate.Text(`There's a lot of the things going on, what do you want to see?`)
      .addReplyKeyboard([['Track 1', 'Track 2'], ['Track 3', 'All tracks'], ['Help'], ['Back to the main menu']], true, true)
      .get()
    ]

  function splitIntoChunks(arr, chunkSize) {
    const newArr = []
    while (arr.length > 0) {
      let chunk = arr.splice(0, chunkSize)
      newArr.push(chunk)
    }
    return newArr
  }

  function showTrack(trackNumber) {
    const data = confData.schedule.filter(item => (item.track === trackNumber || item.track === 'all'))
    const text = data.reduce((prev, item) => {
      let speaker = ''
      if (item.speaker)
        speaker = ` by ${item.speaker} `
      prev += `${item.startTime} - ${item.endTime} - *${item.title}* ${speaker}(*${item.id}*)\n\n`
      return prev
    }, '')

    return [
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(200).get(),
      new telegramTemplate.Text(`*Track ${trackNumber}*`).get(),
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(400).get(),
      new telegramTemplate.Text(text)
        .addReplyKeyboard(splitIntoChunks(data.filter(item => item.type != 'break').map(item => item.id), 4).concat([['Help'], ['Back to the main menu']]), true, true)
        .get(),
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(200).get(),
      'For a quick access to the talk info simply type or select an ID from the brackets'
    ]
  }

  let trackNumber = parseInt(message.text.toLowerCase().replace(/track (\d)/, '$1'), 10)
  if (!isNaN(trackNumber) && trackNumber > 0 && trackNumber < 4)
    return showTrack(trackNumber)

  if (message.text.toLowerCase() === 'all tracks') {
    const text = confData.schedule.reduce((prev, item) => {
      let speaker = ''
      if (item.speaker)
        speaker = ` by ${item.speaker} `
      prev += `${item.startTime} - ${item.endTime} - *${item.title}* ${speaker}(*${item.id}*)\n\n`
      return prev
    }, '')

    return [
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(700).get(),
      new telegramTemplate.Text(text)
        .addReplyKeyboard([['Help'], ['Back to the main menu']])
        .get()
    ]
  }

  if (message.text.toLowerCase() === 'next talk info' || message.text === '/next-talk')
    return [
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(200).get(),
      new telegramTemplate.Text(`Next talk: ...`)
        .addReplyKeyboard([['Help'], ['Back to the main menu']])
        .get()
    ]

  if (message.text.toLowerCase() === 'current talk info' || message.text === '/current-talk')
    return [
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(200).get(),
      new telegramTemplate.Text(`Current talk: ...`)
        .addReplyKeyboard([['Help'], ['Back to the main menu']])
        .get()
    ]

  if (confData.schedule.map(item => item.id.toLowerCase()).indexOf(message.text.toLowerCase()) > -1) {
    const talk = confData.schedule.find(item => item.id.toLowerCase() === message.text.toLowerCase())
    let reply = `*${talk.title}*\n`
    reply += talk.speaker ? `by ${talk.speaker}\n` : ''
    reply += `${talk.date}, ${talk.startTime} - ${talk.endTime} `
    reply += talk.place ? `@ ${talk.place}` : ''
    reply += talk.track !== 'all' ? ` (Track ${talk.track})\n` : '\n'
    return [
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(400).get(),
      new telegramTemplate.Text(reply)
        .addReplyKeyboard([[`About ${talk.speaker}`], [`Follow @${talk.twitter} on twitter`], ['Help'], ['Back to the main menu']], true, true)
        .get(),
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(800).get(),
      talk.description
    ]
  }

  if (message.text.toLowerCase() === 'info' || message.text === '/info')
    return [
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(200).get(),
      new telegramTemplate.Text(`*HolyJS*\n\nDecember 11, Moscow\nRadisson Slavyanskaya Hotel, Square of Europe, 2`).get(),
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(800).get(),
      new telegramTemplate.Text(`There is plenty of frontend conferences held in Russia. However, before this year there weren’t any conferences on the most popular in the world (according to GitHub and RedMonk) programming language, JavaScript, which is mainly associated with frontend.\n\nWe fixed this bug, and now we have HolyJS Moscow, which is the second large-scale conference on JavaScript in 2016. More than 400 JS-developers will come together to discuss questions with JS-experts from all over the world.\n\nIt is guaranteed that all the talks will be on technical topics without any agile, scrum and team management stuff.`)
        .addInlineKeyboard([[{ text: 'HolyJS on facebook', url: 'https://www.facebook.com/holyjs/' }], [{ text: 'HolyJS on VKontakte', url: 'http://vk.com/holyjs' }], [{ text: '@HolyJSconf on twitter', url: 'https://twitter.com/HolyJSconf' }]])
        .get(),
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(600).get(),
      new telegramTemplate.Text(`The conference will include more than 20 technical talks spoken in parallel tracks, lots of new people and communication with colleagues. HolyJS is not only about frontend, it also touches backend, desktop, and other demanded topics of JavaScript world.`)
        .addReplyKeyboard([['List of topics'], ['Website'], ['Location'], ['Help'], ['Back to the main menu']], true, true)
        .get()
    ]

  if (/^Follow @([0-1a-zA-Z_]{1,50}) on twitter$/i.test(message.text.toLowerCase()))
    return [
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(200).get(),
      new telegramTemplate.Text(message.text.toLowerCase().replace(/^Follow @([0-1a-zA-Z_]{1,50}) on twitter$/i, 'https://twitter.com/$1')).get()
    ]

  if (/^About ([0-1a-zA-Z -]{1,100})$/i.test(message.text.toLowerCase())) {
    let name = message.text.toLowerCase().replace(/^About ([0-1a-zA-Z -]{1,100})$/i, '$1')
    let talk = confData.schedule.find(talk => talk.speaker && talk.speaker.toLowerCase() === name.toLowerCase())
    if (talk) {
      let reply = [
        new telegramTemplate.ChatAction('typing').get(),
        new telegramTemplate.Pause(200).get(),
        new telegramTemplate.Text(`*${talk.speaker}*`).get()
      ]
      if (talk.speakerPic) {
        reply.push(new telegramTemplate.ChatAction('upload_photo').get())
        reply.push(new telegramTemplate.Pause(800).get())
        reply.push(new telegramTemplate.Photo(talk.speakerPic).get())
      }
      reply.push(new telegramTemplate.ChatAction('typing').get())
      reply.push(new telegramTemplate.Pause(600).get())
      reply.push(new telegramTemplate.Text(`${talk.aboutSpeaker}`).get())
      return reply
    }
  }

  if (message.text.toLowerCase() === 'list of topics')
    return [
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(1000).get(),
      new telegramTemplate.Text(`- Architecture of modern JS-applications;
      - Node.js: best practices, performance, memory management;
      - JS and ECMAScript specification;
      - The practice of ES6 and ES7;
      - Optimizing JS-applications;
      - Functional programming in JS;
      - Customers-server synchronization;
      - Application Testing;
      - Working with graphics (WebGL, D3.js, etc.);
      - Web API (Bluetooth, Network API, IndexedDB, Web Notifications, etc.);
      - WebAssembly;
      - JS engines;
      - JS on the devices;
      - Progressive Web Apps;
      - Desktop apps (Electron, etc.).`.replace(/ {6}/g, '')).get()
    ]

  if (message.text.toLowerCase() === 'website')
    return [
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(200).get(),
      new telegramTemplate.Text(`http://holyjs.ru`).get()
    ]

  if (message.text.toLowerCase() === 'location'  || message.text === '/location')
    return [
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(400).get(),
      new telegramTemplate.Text('Just a second, sharing you the location').get(),
      new telegramTemplate.ChatAction('find_location').get(),
      new telegramTemplate.Pause(1000).get(),
      new telegramTemplate.Venue(55.741718, 37.566829, 'Radisson Slavyanskaya Hotel', 'Square of Europe, 2, Moscow, Russia').get()
    ]

  if (message.text.toLowerCase() === 'help'  || message.text === '/help')
    return [
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(400).get(),
      new telegramTemplate.Text(['Здравствуйте!', 'Привет.', 'Как поживаешь?', 'Рад тебя видеть.', 'Как дела?'].random() + `\nI am *Igor*, your conference chat bot!\n\nI can help you with a few different things, including the schedule, talks and speakers info, info about the conference, etc. Simply follow the buttons on the keyboard or try to type. Keep in mind I am not that smart yet :) But you can help! Visit my Github repository and send PR to add or improve my skills:`)
        .addInlineKeyboard([[{ text: 'Github repository', url: 'https://github.com/stojanovic/conference-telegram-bot' }]])
        .get(),
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(400).get(),
      new telegramTemplate.Text(`Here's a few things I can help you with`)
        .addReplyKeyboard([['Schedule'], ['Current talk info'], ['Next talk info'], ['Info']], true, true)
        .get()
    ]

  if (message.text.toLowerCase() === 'back to the main menu'  || message.text === 'main menu')
    return [
      new telegramTemplate.ChatAction('typing').get(),
      new telegramTemplate.Pause(200).get(),
      new telegramTemplate.Text(`Here's a few things that I can help you with`)
        .addReplyKeyboard([['Schedule'], ['Current talk info'], ['Next talk info'], ['Info'], ['Help']], true, true)
        .get()
    ]

  return [
    new telegramTemplate.ChatAction('typing').get(),
    new telegramTemplate.Pause(400).get(),
    new telegramTemplate.Text(`Hmm, I can't answer that 🙁 \n*Reason*:\n${excuse.get()}`).get(),
    new telegramTemplate.ChatAction('typing').get(),
    new telegramTemplate.Pause(600).get(),
    new telegramTemplate.Text(`But here's a few things that I can help you with`)
      .addReplyKeyboard([['Schedule'], ['Current talk info'], ['Next talk info'], ['Info'], ['Help']], true, true)
      .get()
  ]
})
