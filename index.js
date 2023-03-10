const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mall'
});
connection.connect()
const client = new Client();
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});
client.on('ready', () => {
    console.log('Start')
    let numbers = []
    connection.query("SELECT DISTINCT(phone) FROM push1 WHERE is_has is null and  phone NOT IN (SELECT SUBSTR(message_to,1,12) FROM messages WHERE messages.is_send='1')", function (error, results, fields) {
        if (error) throw error;
        numbers = results
        numbers.forEach(({ phone }, index) => {
            setTimeout(async () => {
                const result = await client.getNumberId(`${phone}@c.us`)
                if (result != null) {
                    const msg = `التخفيضات الصيفية تعود من جديد بموروكمول ابتداء من يوم غد الخميس 28 يوليوز!

استفيدوا من تخفيضات حصرية تصل إلى 70% بالعديد من العلامات التجارية واستمتعوا باثمنة منخفضة. 
                
التخفيضات الصيفية بموروكمول، موعدكم الكبير مع العروض المذهلة!
            

Les SOLDES D’ÉTÉ sont de retour au MOROCCO MALL à partir de demain jeudi 28 Juillet. 

Venez profiter de réductions exceptionnelles allant jusqu'à -70% dans de nombreuses enseignes et faites-vous plaisir à petits prix !

Les soldes d’été au Morocco Mall, c’est le grand rdv des bonnes affaires.

                `
                    const media = await MessageMedia.fromFilePath('./DPL ANNIVERSAIRE_market.pdf');
                    const pdfSend = await client.sendMessage(`${phone}@c.us`,media)
                    const messagepdf = {
                        message_id: pdfSend.id.id,
                        message_from: pdfSend.from,
                        message_to: pdfSend.to,
                        message_body: "Content",
                    }
                    var sql = "INSERT INTO messages SET ?";
                    connection.query(sql, [messagepdf], function (err, result) {
                        if (err) throw err;
                        console.log("Send Message");
                    })
                    const res = await client.sendMessage(`${phone}@c.us`, msg)
                    const message = {
                        message_id: res.id.id,
                        message_from: res.from,
                        message_to: res.to,
                    }
                    var sql = "INSERT INTO messages SET ?";
                    connection.query(sql, [message], function (err, result) {
                        if (err) throw err;
                        console.log("Send Message");

                    });
                } else {
                    let query = "UPDATE push1 SET is_has=0 WHERE phone =?"
                    connection.query(query, phone, (err, result) => {
                        if (err) { throw err }
                        console.log(result)
                    })
                    console.log('No whatsapp')
                }
            }, 20000 * index)
        });
    })

});
client.on('message', async (msg) => {
    const message = {
        message_id: msg.id.id,
        message_from: msg.from,
        message_to: msg.to,
        message_body: msg.body,
    }
    var sql = "INSERT INTO retourmessages SET ?";
    connection.query(sql, [message], function (err, result) {
        if (err) console.log(err);
        console.log("Reaply Message");
    });
})
client.on('message_ack', (msg, ack) => {
    if (ack == -1) {
        $query = "UPDATE MESSAGES SET is_send=-1 WHERE message_id=?"
        connection.query(sql, msg.id.id, (err, result) => {
            if (err) { throw err }
            console.log(result)
        })
    }
    if (ack == 0) {
        $query = "UPDATE MESSAGES SET is_send=0 WHERE message_id=?"
        connection.query(sql, msg.id.id, (err, result) => {
            if (err) { throw err }
            console.log(result)
        })

    }
    if (ack == 1) {
        let query = "UPDATE MESSAGES SET is_send=1 WHERE message_id=?"
        let id = msg.id.id
        connection.query(query, id, (err, result) => {
            if (err) { throw err }
            console.log(result)
        })
    }
    if (ack == 2) {
        let query = "UPDATE MESSAGES SET is_delevried=1 WHERE message_id=?"
        let id = msg.id.id
        connection.query(query, id, (err, result) => {
            if (err) { throw err }
            console.log(result)
        })
    }
    if (ack == 3) {
        let query = "UPDATE MESSAGES SET is_read=1 WHERE message_id=?"
        let id = msg.id.id
        connection.query(query, id, (err, result) => {
            if (err) { throw err }
            console.log(result)
        })
    }
    if (ack == 4) {
        console.log(`Etape 4 : ${msg.id.id}`)
    }
});
client.initialize();