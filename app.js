"use strict";
const express = require('express');
const paypal = require('paypal-rest-sdk');
const app = express();
var cors = require('cors');
var nodemailer = require('nodemailer');
const bodyParser = require("body-parser");
const { response } = require('express');

paypal.configure({
    'mode': 'sandbox',
    'client_id': 'AQuAmZBlb52ALuoN4lvb3ZZKoFb7yGFtgT0k5fCGL-cdGmyvdK53bt0OjjUV4_7bh5MzQPRj-6Wnblfo',
    'client_secret': 'EBetYQ2JDtfusDM4OIl3ClE-t6TKPC3jSLNITjVpE8TCWZ1z6m0lbsGNP8Od007Wy0eFzDt0xgs12AuC',
});

var corsOptions = {
    origin: "http://ec2-13-212-49-158.ap-southeast-1.compute.amazonaws.com:8080"
};

var transporter = nodemailer.createTransport({
service: 'gmail',
auth: {
    user: 'nhatnghiaweb@gmail.com',
    pass: 'nhatnghia123456'
}
});
  
app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({ message: "Welcome to Van Nghia Pro." });
});

app.post('/pay',function(req,res){
    const items = req.body.items;
    var total =0;
    for(let i = 0;i<items.length;i++){
        total+=parseFloat(items[i].price)*items[i].quantity;
    }
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://ec2-13-212-49-158.ap-southeast-1.compute.amazonaws.com:8080/NhatNghiaWeb/thanhToanPayPal",
            "cancel_url": "http://ec2-13-212-49-158.ap-southeast-1.compute.amazonaws.com:8080/NhatNghiaWeb/errors"
        },
        "transactions": [{
            "item_list": {
                "items": items
            },
            "amount": {
                "currency": "USD",
                "total": total.toString()
            },
            "description": "Shop Nhat Nghia PayPal"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            res.json(error);
        } else {
            for(let i = 0;i < payment.links.length;i++){
                if(payment.links[i].rel === 'approval_url'){
                    console.log(payment.links[i].href);
                    res.json(payment.links[i].href);
                }
            }
        }
    });
});
app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            res.json(error);
        } else {
            res.json(payment);
        }
    });
});

app.post('/sendMail',(req, res)=>{
    var text = req.body.text;
    var subject = req.body.subject;
    var email = req.body.email;
    var html = req.body.html;
    var mailOptions = {
        from: 'nhatnghiaweb@gmail.com',
        to: email,
        subject: subject,
        text: text,
        html: html,
      };
    transporter.sendMail(mailOptions, function(error,info){
        if (error) {
            res.json('Error' , error);
        } else {
            res.json("Gửi mail thành công");
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
