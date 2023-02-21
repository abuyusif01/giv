const fs = require('fs');
const PDFDocument = require('pdfkit-table');
const converter = require('number-to-words');
const { spawn } = require('child_process');

const normalFont = 'Times-Roman';
var _tcost = 0;

var storage = {};
const pdfConfig = {
    margin: 30,
    font: "Times-Roman",
    startPoint: 30,
    fontSize: 10,
    titleFontSize: 14,
    paperSize: "A4",
    colLength: 300,
    tableLength: 600,
    indTableLength: 90,
}

const currency_map = {
    "USD": "$",
    "DOLLAR": "$",
    "$": "$",
    "EUR": "€",
    "EURO": "€",
    "€": "€",
    "GBP": "£",
    "INR": "₹",
    "AUD": "$",
    "CAD": "$",
    "SGD": "$",
    "CHF": "CHF",
    "MYR": "RM",
    "JPY": "¥",
    "CNY": "¥",
    "HKD": "$",
    "NZD": "$",
    "THB": "฿",
    "PHP": "₱",
}

const banks_info = {
    "EUR": {

        "BENEFICIARY": "GLOBAL INTELLECT VENTURES SDN BHD",
        "ACCOUNT NUMBER": "873194813507 (EURO ACCOUNT)",
        "BANK NAME": "STANDARD CHARTERED BANK MALAYSIA BERHAD",
        "BRANCH": "SCB JALAN IPOH NO. 33-35 JALAN IPOH, GF, 51200 KUALA LUMPUR",
        "SWIFT CODE": "SCBLMYKXXXX",
    },
    "USD": {
        "BENEFICIARY": "GLOBAL INTELLECT VENTURES SDN BHD",
        "ACCOUNT NUMBER": "701-1507818 (USD ACCOUNT)",
        "BANK NAME": "OCBC BANK MALAYSIA BERHAD",
        "BRANCH": "MENARA OCBC, NO 18, JALAN TUN PERAK, 50050 KUALA LUMPUR",
        "SWIFT CODE": "OCBCMYKLXXX",
    },

}
var db_col = {
    "inumber": '',
    "name": '',
    "addr": '',
    "tel": '',
    "email": '',
    "product": '',
    "size": '',
    "price": '',
    "ucontainer": '',
    "ncontainer": '',
    "depo": '',
    "currency": '',
    "delivery": '',
    "tcost": '',
    "date": '',
    "swiftcode": '',
}


const justNumbers = (str) => {
    return parseFloat(str.match(/[\d\.]+/))
}


const toCaps = (str) => {
    return str.toUpperCase();
}


const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}


const date = new Date();
let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();
let currentDate = `${day < 10 ? "0" + day : day}-${month < 10 ? "0" + month : month}-${year}`;

const generateEntry0 = (doc, invoice) => {

    doc.fontSize(12).font('Times-Bold')
        .text(invoice._name.toUpperCase(), 30, 120, { align: 'left' }) // name
        .font('Times-Roman')
        .text(invoice._addr, pdfConfig.startPoint, 140, { align: 'left' }) // address
        .text("Tel: " + invoice._tel, pdfConfig.startPoint, 155, { align: 'left' }) // tel
        .text("EMAIL: " + invoice._email, pdfConfig.startPoint, 170, { align: 'left' }) // email
        .text("DATE: " + currentDate, 0, 125, { align: 'right' }) // date

}


const generateEntry1 = (doc, invoice, section, section_number, x = 0) => {

    let text = ""
    section == "sc" ?
        text = `SC/${section_number}/${month < 10 ? "0" + month : month}/${year}` :
        text = `PI/${section_number}/${month < 10 ? "0" + month : month}/${year}`

    doc.fontSize(10).font('Times-Roman');

    section == "pi" ?

        doc
            .moveDown(5.5).fontSize(14)
            .font('Times-Bold')
            .text("PROFOMA INVOICE: " + `${text}`, {
                underline: true,
                align: 'center',
            }).moveDown(0.5) :

        doc
            .moveDown(5.5).fontSize(14)
            .font('Times-Bold')
            .text("SALES CONTRACT: " + `${text}`, {
                underline: true,
                align: 'center',
            }).moveDown(0.5)

    doc.moveTo(30, doc.y)
        .lineTo(doc.page.width - 25, doc.y)
        .stroke().moveDown(0.7);

    _tcost = parseFloat(justNumbers(invoice._price) * justNumbers(invoice._ucontainer) * justNumbers(invoice._ncontainer)).toFixed(2);
    isNaN(_tcost) ? _tcost = 0 : _tcost = _tcost;

    const tableJson = {
        "headers": [

            {
                "label": "PRODUCTS",
                "property": "_product",
                "width": 90
            },
            {
                "label": "PACKING SIZE",
                "property": "_size",
                "width": 90
            },
            {
                "label": "PRICES CIF DAKAR",
                "property": "_price",
                "width": 90
            },
            {
                "label": "UNIT / CONTAINER",
                "property": "_ucontainer",
                "width": 90
            },
            {
                "label": "NO OF CONTAINER",
                "property": "_ncontainer",
                "width": 90
            },
            {
                "label": "TOTAL COST (CURRENCY)",
                "property": "_tcost",
                "width": 90
            },

        ],
        "datas": [
            {
                "_product": toCaps(invoice._product).replaceAll(", ", "\n").replaceAll(",", "\n"),
                "_size": toCaps(invoice._size),
                "_price": toCaps(invoice._price),
                "_ucontainer": toCaps(invoice._ucontainer),
                "_ncontainer": toCaps(invoice._ncontainer),
                "_tcost": `bold: ${currency_map[toCaps(invoice._currency)] || "$"} ${Intl.NumberFormat('en-US').format(_tcost || 0)}`,
            },

            {
                "_tcost": `bold: ${currency_map[toCaps(invoice._currency)] || "$"} ${Intl.NumberFormat('en-US').format(_tcost || 0)}`,
            }

        ],
    };




    // doc.table(tableJson);
    doc.table(tableJson, {
        columnSpacing: 10,
        padding: 5,
        align: "center",

        hideHeadr: true,
        fillOpacity: 100,


        prepareHeader: () => {
            doc.font("Helvetica-Bold").fontSize(8)
        },
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {

            const { x, y, width, height } = rectCell;
            if (indexColumn === 0) {
                doc
                    .lineWidth(.5)
                    .moveTo(x, y - 40)
                    .lineTo(x, y + height)
                    .stroke();
            }


            if (indexColumn === 4 || indexColumn === 5) {
                doc
                    .lineWidth(.5)
                    .moveTo(x + width, y - 40)
                    .lineTo(x + width, y + height)
                    .stroke();

            }

            if (indexRow == 0) {
                doc
                    .lineWidth(.5)

                    .moveTo(x + width, y - 40)
                    .lineTo(x + width, y + height)
                    .stroke();
            }
            isNaN(parseInt(_tcost)) ? _tcost = 0 : _tcost = _tcost;
            if (indexRow === 1 && indexColumn === 0) {
                doc.
                    font("Helvetica-Bold").
                    text(`TOTAL: ${converter.toWords(parseInt(_tcost))
                        .toUpperCase()} ${"(" + invoice._currency + ")"}`,
                        x + 5,
                        y + height - 15,
                        {
                            align: 'left'
                        }
                    )
            }

            doc.font("Helvetica").fontSize(8);
            indexColumn === 0 && doc.addBackground(rectRow, '#F2F2F2', 0.15);

        },
    });

    x == 0 ? doc
        .font('Helvetica')
        .fontSize(10)
        .text(`* Bank charges from customer side should be paid by customer\n * Bargaining is not allowed after the contract has been signed\n * The company is only responsible for payment made to its account in Malaysia and provide by us and customers\nare advice to double confirmed the banking details by telephone before making payment.`, { align: 'left' }) :
        doc
            .font('Helvetica-Bold')
            .fontSize(10).fillColor('black')
            .text('TERMS & CONDITIONS', {
                align: 'left',
                underline: true,
            })
            .font('Helvetica')
            .text(`1) Buyer to sign acceptance and return signed contract to Seller within 48 hours of the issue date.Once confirmed, this contract cannot be cancelled or altered.\n2) All local charges at destination including demurrages, detention, clearing, transportation, duties, taxes etc.to be paid by the Buyer at their cost.\n3) Weight, quantity and technical parameters declared by manufacturer is final.Any claim on quantity / weight variation is permissible only if supported by an internationally accredited surveyor report.\n4) If any Pre - shipment inspection is required by the Buyer / Destination country, Buyer has to bear the applicable costs & notify Seller within 7 working days from the date of this Contract; else it will be deemed that no Inspection is required for this Contract.\n5) For FOB shipment, Buyer will provide forwarder or shipping line nomination within 10 days from the date of this contract.\n6) For FOB shipment, if Vessel booking is not received within 3 working days of seller's notification of cargo readiness, seller will have the right to nominateany shipping line of his choice and charge relevant freight to Buyer.\n7) The title/ownership of the goods covered by this contract will pass to Buyer when Seller has received full payment. Notwithstanding such retention of title, risk of loss shall pass from Seller to Buyer according to the trade term agreed as per INCOTERMS 2010 and amendments thereupon. Seller will assume no further responsibility or cost once the title has been passed on to Buyer.\n8) Buyer to notify visible quality defects within defects within 15 days of the cargo arrival at destination port, supported by an internationally accredited surveyor. Any dispute or claim cannot be used to hold or refuse payment for this contract.\n9) The Seller will not be liable for any indirect or consequential loss sustained by the Buyer and claim value (if cargo is insured) shall not exceed the total invoice value of the contract.\n10) If the Buyer fails to perform as per the Contract terms, Seller reserves the right to recall or resell the cargo without further approval from the buyer. Any advance payment received under this contract will be utilized by seller to offset the losses or costs incurred therein.\n11) This contract is subject to ICC Force Majeure Clause 2003 and any change in Government policy that may affect execution of this contract will be accepted by Buyer.\n12) Any dispute that cannot be settled mutually will be referred to the Malaysia Arbitration Centre subject to its rules and Malaysia laws.\n13) This Contract will be deemed accepted by the buyer even if the signed copy is not received but the advance payment or the L/C has been received by Seller.`, { align: 'left' })
}

const generateEntry2 = (doc, invoice) => {
    _tcost = invoice._price * invoice._ucontainer * invoice._ncontainer;
    let x1 = parseInt(invoice._depo)
    let x2 = parseFloat(_tcost * x1 / 100).toFixed(2)
    let x3 = parseInt(100 - x1)



    let dx1 = parseInt(invoice._delivery.split(",")[0] || 1)
    let dx2 = parseInt(invoice._delivery.split(",")[1] || 0)

    let dxfinal = dx2 ? dx1 + " - " + dx2 + " WEEK(s)" : dx1 + " WEEK(s)"
    let _currency = invoice._currency in currency_map ? invoice._currency : "USD"

    let beneficiary = banks_info[_currency]["BENEFICIARY"]
    let account_number = banks_info[_currency]["ACCOUNT NUMBER"]
    let bank_name = banks_info[_currency]["BANK NAME"]
    let brank = banks_info[_currency]["BRANCH"]
    let swift_code = banks_info[_currency]["SWIFT CODE"]

    doc
        .moveDown(2)
        .fontSize(12)
        .font('Helvetica')
        .fillColor('black')
        .text("TERMS & CONDITIONS", {
            underline: true,
            align: 'center',
        });

    doc.moveDown(-0.8);

    const tableJson = {
        "headers": [
            {
                "property": "_tcname",
                "width": 90
            },
            {
                "property": "_tcvalue",
                "width": 450
            },
        ],
        "datas": [
            {
                "_tcname": "VALIDITY",
                "_tcvalue": "2 DAYS (SIGNED & RETURNED) AND PAYMENT SLIP PROVIDED OTHERWISE, \nTHE MANAGEMENT HAD RIGHT TO ADJUST THE PRICE ACCORDING TO THE MARKET PRICE. ",
            },
            {
                "_tcname": "PAYMENT",
                "_tcvalue": `${x1}% DEPOSIT ( ${invoice._currency} ${x2} ) & ${x3}% BALANCE TO BE PAID AFTER RECEIVING BL COPY BY EMAIL/FAX`,
            },
            {
                "_tcname": "DELIVERY",
                "_tcvalue": `${dxfinal} FROM THE DATE WE RECEIVED THE DEPOSIT`,
            },
            {
                "_tcname": `bold:BENEFICIARY`,
                "_tcvalue": `bold:${beneficiary}`,
            },
            {
                "_tcname": "bold:ACCOUNT NUMBER ",
                "_tcvalue": `bold:${account_number}`,
            },
            {
                "_tcname": "bold:BANK NAME ",
                "_tcvalue": `bold:${bank_name}`,
            },
            {
                "_tcname": "bold:BRANCH ",
                "_tcvalue": `bold:${brank}`,
            },
            {
                "_tcname": "bold:SWIFT CODE ",
                "_tcvalue": `bold:${swift_code}`,
            }
        ],
    };

    doc.table(tableJson, {
        columnSpacing: 10,
        padding: 5,
        align: "center",
        fillOpacity: 10,

        prepareHeader: () => {
            doc.font("Helvetica-Bold").fontSize(8)
        },
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
            doc.font("Helvetica").fontSize(8);
            indexColumn === 0 && doc.addBackground(rectRow, 'white', 0.15);
        },
    });
}


const generateHeader = (doc) => {

    doc.image('./static/images/logo.png', pdfConfig.startPoint, 40, { width: 60 })
        .fillColor('#444444')
        .fontSize(22).font('Times-Bold')
        .text('GLOBAL INTELLECT VENTURES SDN. BHD.', 90, 57)
        .fontSize(pdfConfig.fontSize).font('Times-Roman')
        .text('(961531-U)', 0, 75, { align: 'right' })
        .fontSize(pdfConfig.fontSize).font('Times-Roman')
        .text('(Member of Global Intellect Group)', 60, 80, { align: 'center' })
        .moveDown();
    // x, y
    doc.moveTo(0, doc.y)
        .lineTo(doc.page.width, doc.y)
        .stroke();

    doc.moveDown(0.5);
}

const signatureEntry = (doc, x = 1) => {

    x == 0 ? doc.image('./static/images/signature.jpeg', 50, 740, { width: 120 }) :
        doc.image('./static/images/signature.jpeg', 50, 720, { width: 120 });

    doc
        .moveDown(1)
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('black')
        .text("BUYER: ", 300, doc.page.height - 105, { align: 'center' })
}

const generateFooter = (doc) => {
    doc.page.margins.bottom = 0;
    doc
        .font(normalFont)
        .fontSize(
            10,
        ).text(
            `2-56 Block H Platinum Walk, Jalan Langkawi Setapak 53300 K.L Wilayah Persekutuan, Malaysia 
            Tel: +603-4131 6330 Fax: +603-4131 6444 E-mail: globalintellectventures@gmail.com, info@globalintellectventures.com 
            www.globalintellectventures.com`,
            -15,
            doc.page.height - 40,
            { align: 'center', width: 600 },
        );

}


const createInvoice = async (invoice, connection, res, x = 0) => {
    let doc = new PDFDocument({
        margin: pdfConfig.margin,
        size: pdfConfig.paperSize,
        font: pdfConfig.font,
    });

    let sql = "SELECT _inumber FROM invoice WHERE _inumber=(SELECT MAX(_inumber) FROM invoice);"
    connection.query(sql, async function (err, result) {

        try {
            if (err) throw err;
            generateHeader(doc); // Invoke `generateHeader` function.
            generateEntry0(doc, invoice); // Invoke `generateEntry0` function.
            generateEntry1(doc, invoice, "pi", result[0]._inumber); // Invoke `generateEntry1` function.
            generateEntry2(doc, invoice);
            signatureEntry(doc)
            generateFooter(doc);

            doc.addPage();
            generateHeader(doc);
            generateEntry0(doc, invoice); // Invoke `generateEntry0` function.
            generateEntry1(doc, invoice, "sc", result[0]._inumber, 1);
            signatureEntry(doc, 0) // Invoke `generateEntry1` function.
            generateFooter(doc); // Invoke `generateFooter` function.
            doc.end();
            x == 0 ? insertInvoice(invoice, connection) : null;
        } catch (error) {

            // await res.send("Invoice Number is not defined. Please contact the administrator.")
            res.send(error)
        }

    });


    try {
        let x = invoice._inumber.length // if invoice._inumber is not defined then it will throw an error
        var path = `./static/pdf/${invoice._inumber}_${invoice._name}_${invoice._product}_${invoice._seller}.pdf`;
        doc.pipe(fs.createWriteStream(path));
        await sleep(500);
        res.download(path);

    } catch (error) {

        connection.query(sql, async (err, result) => {
            if (err) throw err;
            var _inumber = result[0]._inumber;
            var path = `./static/pdf/${_inumber}_${invoice._name}_${invoice._product}_${invoice._seller}.pdf`;
            doc.pipe(fs.createWriteStream(path));
            await sleep(500);
            res.download(path);

        })
    }
}


const insertInvoice = async (invoice, connection) => {
    const {
        _pi,
        _name,
        _addr,
        _tel,
        _email,
        _product,
        _size,
        _price,
        _ucontainer,
        _ncontainer,
        _depo,
        _delivery,
        _seller,
    } = invoice;

    let _currency = invoice._currency in currency_map ? invoice._currency : "USD"
    let _swiftcode = banks_info[_currency]["SWIFT CODE"]
    let _date = currentDate;
    _tcost = invoice._price * invoice._ucontainer;

    let sql = `INSERT INTO invoice (_inumber, _name, _addr, _tel, _email, _product, _size, _price, _ucontainer, _ncontainer, _depo, _delivery, _currency, _swiftcode, _tcost, _seller, _date) VALUES ('${_pi}', '${_name}', '${_addr}', '${_tel}', '${_email}', '${_product}', '${_size}', '${_price}', '${_ucontainer}', '${_ncontainer}', '${_depo}', '${_delivery}', '${_currency}', '${_swiftcode}', '${_tcost}', '${_seller}', '${_date}') ON DUPLICATE KEY UPDATE _inumber='${_pi}', _name='${_name}', _addr='${_addr}', _tel='${_tel}', _email='${_email}', _product='${_product}', _size='${_size}', _price='${_price}', _ucontainer='${_ucontainer}', _ncontainer='${_ncontainer}', _depo='${_depo}', _delivery='${_delivery}', _currency='${_currency}', _swiftcode='${_swiftcode}', _tcost='${_tcost}', _seller='${_seller}', _date='${_date}'`;

    connection.query(sql, (err, result) => {
        if (err) {
            // console.log(err);
        }
    });
}


const retrievInvoice = async (inumber, connection, res,) => {
    try {
        let sql = `SELECT * FROM invoice WHERE _inumber = ${inumber}`;
        connection.query(sql, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                createInvoice(result[0], connection, res, 1);
            }
        });
    } catch (error) {
        res.send("Invoice not found")
    }
}

// CREATE TABLE invoice (
//     _inumber INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
//     _name VARCHAR(255), 
//     _addr VARCHAR(255), 
//     _tel VARCHAR(255), 
//     _email VARCHAR(255), 
//     _product VARCHAR(255), 
//     _size VARCHAR(255), 
//     _price VARCHAR(255), 
//     _ucontainer VARCHAR(255), 
//     _ncontainer VARCHAR(255), 
//     _depo VARCHAR(255), 
//     _currency VARCHAR(255), 
//     _delivery VARCHAR(255), 
//     _tcost VARCHAR(255), 
//     _date VARCHAR(255), 
//     _swiftcode VARCHAR(255),
//     _seller VARCHAR(255) 
// );

module.exports = {
    generateEntry0,
    generateEntry1,
    generateEntry2,
    generateHeader,
    generateFooter,
    createInvoice,
    pdfConfig,
    insertInvoice,
    retrievInvoice,
    storage,
    sleep
}

// INSERT INTO invoice (_inumber, _name, _addr, _tel, _email, _product, _size, _price, _ucontainer, _ncontainer, _depo, _currency, _delivery, _tcost, _date, _swiftcode, _seller)
// VALUES ('4965', 'John Doe', '123 Main St', '555-555-5555', 'johndoe@email.com', 'Widget', 'Medium', '100.00', '20ft', 'ABCD1234567', 'Los Angeles', 'USD', 'Ground', '10.00', '2023-02-16', 'ABCD1234', 'ABC Corp');


