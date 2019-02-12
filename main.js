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
    let message = "Ya has iniciado tu conteo de horas...";

    if (!hasRegistered) {
        await page.evaluate(() => {
            document.querySelector('button[data-bb-handler="main"]').click();
        });

        await page.waitFor('button[data-bb-handler="ok"]');

        await page.evaluate(() => {
            document.querySelector('button[data-bb-handler="ok"]').click();
        });

        message = '¡Ha sido iniciado tu conteo de horas!'
    }

    browser.close();

    notifier.notify({
        title: 'Auto-Registro de Horas',
        message
    });
})();