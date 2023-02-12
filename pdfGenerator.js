const fs = require('fs');
const { moveDown } = require('pdfkit');
const PDFDocument = require('pdfkit-table');


const normalFont = 'Times-Roman';


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


const entry0 = {
    name: 'Entry 0',
    items: [
        {
            name: 'Abubakar Abubakar Yusif',
            addr: "Mahallah Uthman, Block D. IIUM",
            tel: "01139997142",
            email: 'abuyusif01@gmail.com',
        },
        {
            name: 'Item 1',
            price: 20,
            quantity: 2,
        },
        {
            name: 'Item 2',
            price: 30,
            quantity: 3,
        },
    ],
};


const entry1 = {
    items: [
        {
            product: 'Product 1',
            size: 20,
            price: 2,
            unit_container: 2,
            no_container: 2,

        },
        {
            product: 'Product 2',
            size: 30,
            price: 3,
            unit_container: 3,
            no_container: 3,
        },
    ],
}


const generateEntry0 = (doc, entry0) => {

    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let currentDate = `${day}-${month}-${year}`;

    doc.fontSize(14).font('Times-Bold')
        .text(entry0.items[0].name.toUpperCase(), 30, 120, { align: 'left' })
        .font('Times-Roman')
        .text(entry0.items[0].addr, pdfConfig.startPoint, 140, { align: 'left' })
        .text("Tel: " + entry0.items[0].tel, pdfConfig.startPoint, 155, { align: 'left' })
        .text("EMAIL: " + entry0.items[0].email, pdfConfig.startPoint, 170, { align: 'left' })
        .text("DATE: " + currentDate, 0, 125, { align: 'right' })


}

const generateEntry1 = (doc, entry1, x = 0) => {


    let month = new Date().getMonth() + 1;
    let year = new Date().getFullYear();

    doc.fontSize(10).font('Times-Roman');
    doc
        .moveDown(5.5).fontSize(14)
        .font('Times-Bold')
        .text("PROFOMA INVOICE: " + `PI/PI_number/${month}/${year}`, {
            underline: true,
            align: 'center',
        }).moveDown(0.5);

    doc.moveTo(30, doc.y)
        .lineTo(doc.page.width - 25, doc.y)
        .stroke().moveDown(0.7);


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

                "_product": "PRODUCT NAME: \nBRAND: \nORIGIN: ",
                "_size": "",
                "_price": "USD XXX / CARTON OR JERRY CAN",
                "_ucontainer": "NUMBER OF CARTON OR JERRY CAN INSIDE A CONTAINER",
                "_ncontainer": "NUMBER OF CONTAINER",
                "_tcost": "bold:TOTAL AMOUNT (UNIT PRICE *NUMBER OF CARTON OR JERRY CAN)",
            },

            {
                "_product": "200000",
                "_tcost": "Free product",
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


            doc.font("Helvetica").fontSize(8);
            indexColumn === 0 && doc.addBackground(rectRow, '#F2F2F2', 0.15);
        },
    });

    x == 0 ? doc
        .font('Helvetica')
        .fontSize(10)
        .text(`* Bank charges from customer side should be paid by customer\n* Bargaining is not allowed after the contract has been signed\n* The company is only responsible for payment made to its account in Malaysia and provide by us and customers\nare advice to double confirmed the banking details by telephone before making payment.`, { align: 'left' }) :
        doc
            .font('Helvetica-Bold')
            .fontSize(10).fillColor('black')
            .text('TERMS & CONDITIONS', {
                align: 'left',
                underline: true,
            })
            .font('Helvetica')
            .text(`1) Buyer to sign acceptance and return signed contract to Seller within 48 hours of the issue date. Once confirmed, this contract cannot be cancelled or altered.\n2) All local charges at destination including demurrages, detention, clearing, transportation, duties, taxes etc. to be paid by the Buyer at their cost.\n3) Weight, quantity and technical parameters declared by manufacturer is final. Any claim on quantity/weight variation is permissible only if supported by an internationally accredited surveyor report.\n4) If any Pre-shipment inspection is required by the Buyer/Destination country, Buyer has to bear the applicable costs & notify Seller within 7 working days from the date of this Contract; else it will be deemed that no Inspection is required for this Contract.\n5) For FOB shipment, Buyer will provide forwarder or shipping line nomination within 10 days from the date of this contract. \n6) For FOB shipment, if Vessel booking is not received within 3 working days of seller's notification of cargo readiness, seller will have the right to nominateany shipping line of his choice and charge relevant freight to Buyer.\n7) The title/ownership of the goods covered by this contract will pass to Buyer when Seller has received full payment. Notwithstanding such retention of title, risk of loss shall pass from Seller to Buyer according to the trade term agreed as per INCOTERMS 2010 and amendments thereupon. Seller will assume no further responsibility or cost once the title has been passed on to Buyer.\n8) Buyer to notify visible quality defects within defects within 15 days of the cargo arrival at destination port, supported by an internationally accredited surveyor. Any dispute or claim cannot be used to hold or refuse payment for this contract.\n9) The Seller will not be liable for any indirect or consequential loss sustained by the Buyer and claim value (if cargo is insured) shall not exceed the total invoice value of the contract.\n10) If the Buyer fails to perform as per the Contract terms, Seller reserves the right to recall or resell the cargo without further approval from the buyer. Any advance payment received under this contract will be utilized by seller to offset the losses or costs incurred therein.\n11) This contract is subject to ICC Force Majeure Clause 2003 and any change in Government policy that may affect execution of this contract will be accepted by Buyer.\n12) Any dispute that cannot be settled mutually will be referred to the Malaysia Arbitration Centre subject to its rules and Malaysia laws.\n13) This Contract will be deemed accepted by the buyer even if the signed copy is not received but the advance payment or the L/C has been received by Seller.`, { align: 'left' })
}

const generateEntry2 = (doc, entry2) => {
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
                "_tcvalue": "X% DEPOSIT (X% DEPOSIT AMOUNT) & X% BALANCE TO BE PAID AFTER RECEIVING BL COPY BY EMAIL/FAX",
            },
            {
                "_tcname": "DELIVERY",
                "_tcvalue": "X-X WEEKS FROM THE DATE WE RECEIVED THE DEPOSIT",
            },
            {
                "_tcname": "bold:BENEFICIARY",
                "_tcvalue": "bold:Free product",
            },
            {
                "_tcname": "bold:ACCOUNT NUMBER ",
                "_tcvalue": "bold:Free product",
            },
            {
                "_tcname": "bold:BANK NAME ",
                "_tcvalue": "bold:Free product",
            },
            {
                "_tcname": "bold:BRANCH ",
                "_tcvalue": "bold:Free product",
            },
            {
                "_tcname": "bold:SWIFT CODE ",
                "_tcvalue": "bold:Free product",
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
    signatureEntry(doc);

}


const generateHeader = (doc) => {

    doc.image('./static/images/logo.png', pdfConfig.startPoint, 40, { width: 60 })
        .fillColor('#444444')
        .fontSize(23).font('Times-Roman')
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

    x == 0 ? doc.image('./static/images/signature.jpeg', 50, 740 , { width: 120 }) :
        doc.image('./static/images/signature.jpeg', 50, 720 , { width: 120 });

    doc
        .moveDown(1)
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('black')
        .text("SELLER: ", 300, doc.page.height - 105, { align: 'center' })
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


const createInvoice = (invoice, path) => {
    let doc = new PDFDocument({
        margin: pdfConfig.margin,
        size: pdfConfig.paperSize,
        font: pdfConfig.font,
    });

    generateHeader(doc); // Invoke `generateHeader` function.

    generateEntry0(doc, entry0); // Invoke `generateEntry0` function.
    generateEntry1(doc, entry1); // Invoke `generateEntry1` function.
    generateEntry2(doc, entry1); // Invoke `generateEntry2` function.
    generateFooter(doc); // Invoke `generateFooter` function.

    doc.addPage();
    generateHeader(doc);
    generateEntry0(doc, entry0); // Invoke `generateEntry0` function.
    generateEntry1(doc, entry1, 1);
    signatureEntry(doc, 0) // Invoke `generateEntry1` function.

    generateFooter(doc); // Invoke `generateFooter` function.

    doc.end();
    doc.pipe(fs.createWriteStream(path));
}

module.exports = {
    generateEntry0,
    generateEntry1,
    generateEntry2,
    generateHeader,
    generateFooter,
    createInvoice,
    pdfConfig
}
