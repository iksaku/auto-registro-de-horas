const notifier = require('node-notifier');
const puppeteer = require('puppeteer');

let login = {
    id: '1',
    password: 'f$_w69@'
};

let matricula = '1889169';

let options = {};

switch(process.env.NODE_ENV) {
    case 'development':
        options = {
            headless: false,
            args: ['--start-maximized']
        };
        break;
    case 'production':
    default:
        break;
}

if (process.argv[2] === undefined) {
    console.log('Please specify if you want to either login or logout: main.js <login|logout>');
    process.exit(1);
} else if (process.argv[2] !== 'login' && process.argv[2] !== 'logout') {
    console.log('Unknown command \'' + process.argv[2] + '\'');
    process.exit(2);
}

doLogin = process.argv[2] === 'login';

(async () => {
    const browser = await puppeteer.launch(options);

    const page = await browser.newPage();

    await page.goto('http://epsilon.fime.uanl.mx/fsw-master');

    await page.type('#iCuenta', login.id);
    await page.type('#iPassword', login.password);

    await page.click('#bLogin');
    await page.waitForNavigation();

    await page.goto('http://epsilon.fime.uanl.mx/fsw-master/RegistroHoras.aspx');

    await page.type('#text_matricula', matricula);
    await page.click('#button_ingresar');

    await page.waitFor('.bootbox');

    const hasRegistered = (await page.$x('//div[contains(text(), "SALIDA")]')).length > 0;
    let message = '';

    if (doLogin) {
        if (!hasRegistered) {
            await page.evaluate(() => {
                document.querySelector('button[data-bb-handler="main"]').click();
            });

            await page.waitFor('button[data-bb-handler="ok"]');

            /*await page.evaluate(() => {
                document.querySelector('button[data-bb-handler="ok"]').click();
            });*/
        }

        message = '¡Ha sido iniciado tu conteo de horas!'
    } else {
        if (hasRegistered) {
            await page.evaluate(() => {
                document.querySelector('button[data-bb-handler="main"]').click();
            });

            await page.waitFor('button[data-bb-handler="ok"]');

            /*await page.evaluate(() => {
                document.querySelector('button[data-bb-handler="ok"]').click();
            });*/
        }

        message = '¡Has registrado salida!';
    }

    let actionStatus = (await page.$x('//div[contains(text(), "correctamente")]')).length > 0;
    if (!actionStatus) {
        message = '[Error] No ha sido posible registrar ' + (doLogin ? 'entrada' : 'salida') + '.';
    }

    browser.close();

    if (process.env.ALLOW_NOTIFICATIONS) {
        notifier.notify({
            title: 'Auto-Registro de Horas',
            message
        });
    }
})();