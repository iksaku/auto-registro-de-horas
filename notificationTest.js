const notifier = require('node-notifier');

notifier.notify({
    title: 'Test Title',
    message: 'Test Message',
    sound: true
});