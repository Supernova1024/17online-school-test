const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const events = require('events');
const nodemailer = require('nodemailer');
const passport = require('passport');

const userRouter	= express.Router();
const PDFDocument =	require('pdfkit');
const userModel = mongoose.model('User');
const tqModel = mongoose.model('Devtestquestion');
const tpModel = mongoose.model('Testparam');
const performanceModel = mongoose.model('Performance');
//libraries and middlewares
const config = require('./../../config/config.js');
const responseGenerator = require('./../../libs/responseGenerator');
const auth = require("./../../middlewares/auth");
const eventEmitter = new events.EventEmitter();
const randomstring = require("randomstring");

const invoice = {
	shipping: {
		name: "John Doe",
		address: "1234 Main Street",
		city: "San Francisco",
		state: "CA",
		country: "US",
		postal_code: 94111
	},
	items: [
		{
			item: "TC 100",
			description: "Toner Cartridge",
			quantity: 2,
			amount: 6000
		},
		{
			item: "USB_EXT",
			description: "USB Cable Extender",
			quantity: 1,
			amount: 2000
		}
	],
	subtotal: 8000,
	paid: 0,
	invoice_nr: 1234
};

function createInvoice(invoice, path) {
	let doc = new PDFDocument({ margin: 50 });

	generateHeader(doc);
	generateCustomerInformation(doc, invoice);
	generateInvoiceTable(doc, invoice);
	generateFooter(doc);

	doc.end();
	doc.pipe(fs.createWriteStream(path));
}

function generateHeader(doc) {
	doc
		.image("logo.png", 50, 45, { width: 50 })
		.fillColor("#444444")
		.fontSize(20)
		.text("ACME Inc.", 110, 57)
		.fontSize(10)
		.text("123 Main Street", 200, 65, { align: "right" })
		.text("New York, NY, 10025", 200, 80, { align: "right" })
		.moveDown();
}

function generateFooter(doc) {
	doc
		.fontSize(10)
		.text(
			"Payment is due within 15 days. Thank you for your business.",
			50,
			780,
			{ align: "center", width: 500 }
		);
}

function generateCustomerInformation(doc, invoice) {
	const shipping = invoice.shipping;

	doc
		.text(`Invoice Number: ${invoice.invoice_nr}`, 50, 200)
		.text(`Invoice Date: ${new Date()}`, 50, 215)
		.text(`Balance Due: ${invoice.subtotal - invoice.paid}`, 50, 130)

		.text(shipping.name, 300, 200)
		.text(shipping.address, 300, 215)
		.text(`${shipping.city}, ${shipping.state}, ${shipping.country}`, 300, 130)
		.moveDown();
}

function generateTableRow(doc, y, c1, c2, c3, c4, c5) {
	doc
		.fontSize(10)
		.text(c1, 50, y)
		.text(c2, 150, y)
		.text(c3, 280, y, { width: 90, align: "right" })
		.text(c4, 370, y, { width: 90, align: "right" })
		.text(c5, 0, y, { align: "right" });
}

function generateInvoiceTable(doc, invoice) {
	let i,
		invoiceTableTop = 330;

	for (i = 0; i < invoice.items.length; i++) {
		const item = invoice.items[i];
		const position = invoiceTableTop + (i + 1) * 30;
		generateTableRow(
			doc,
			position,
			item.item,
			item.description,
			item.amount / item.quantity,
			item.quantity,
			item.amount
		);
	}
}

eventEmitter.on('forgot-pass',(data)=>{
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: config.username,
			pass: config.pass
		}
	});
	let mailOptions = {
		from: 'ERUD8 <noreply@erud8.com>', // sender address
		to: data.email, // receivers email
		subject: 'Forgot Password', // Subject line
		html: `<p> OTP - ${data.otp}
				</p>` // plain text body
	};

	transporter.sendMail(mailOptions,	(err, info)=> {
		if (err)
			console.log(err);
		else
			console.log("Mail successfully sent" + info);
	});
});

module.exports.controller=(app)=>{

	//userRouter for user signup
	userRouter.post('/signup',(req,res)=>{
		userModel.findOne({'email': req.body.email},	(err, result)=> {
			if (err) {
				const myResponse = responseGenerator.generate(true, "Error registering your profile.Please try again!", 500, null);
				res.send(myResponse);
			} else if (result) {
				const myResponse = responseGenerator.generate(true, "User already exists", 409, null);
				//console.log(result);
				res.send(myResponse);
			} 
			else{

				const newUser = new userModel({
					name					: req.body.name,
					email				: req.body.email,
					role				: req.body.role,	// registered as Instructor
					password			: req.body.password,
					institution			: req.body.institution,
					department			: req.body.department
				});// end new user 

				//hashing the password using bcrypt
				bcrypt.genSalt(10,	(err, salt)=> {
					bcrypt.hash(newUser.password, salt,	(err, hash)=> {
						newUser.password = hash;
						newUser.save(function (err, newUser) {
							if (err) {
								const response = responseGenerator.generate(true, "Error registering your profile.Please try again!", 500, null);
								res.send(response);
							} else {
								tpModel.findOneAndUpdate(
									{
										'param': req.body.token
									}, 
									{
										$push:{
											registered_users: {
												id: newUser._id,
												name: newUser.name
											}
										}
									},
									{
										new:true
									},
									(err, user)=> {
				 						if (err)	throw err;
				 						// const response = responseGenerator.generate(false, "Account created successfully! Now you can Login!!", 200, user);
										// res.send(response);
										let payload = newUser.toObject();
			 							delete payload.password;
			 							let token=jwt.sign(payload, config.jwtsecret, { expiresIn: '2h' });
			 							res.json({
			 								error:false,
			 								token:token
			 							});
				 					}
				 				);
							}
						});
					});
				});
			}
		});//end signup route
	});
 	//route for login with jwt token encapsulation
 	userRouter.post('/login',(req,res)=>{
 		userModel.findOne({email:req.body.email},(err,foundUser)=>{
 			if(foundUser){
 				bcrypt.compare(req.body.password, foundUser.password, (err, isMatch) =>{
 					if(err)	throw err;

 					else if(isMatch){

 						foundUser.updated = Date.now();
						foundUser.save();
 						if (!req.body.test_token) {
 							let payload = foundUser.toObject();
	 						delete payload.password;
	 						let token=jwt.sign(payload, config.jwtsecret, { expiresIn: '2h' });
	 						res.json({
	 							error:false,
	 							token:token
	 						});
 						} else {
 							tpModel.findOneAndUpdate(
								{
									'param': req.body.test_token,
									'registered_users.id': {$nin:[foundUser._id]}
								}, 
								{
									$push:{
										registered_users: {
											id: foundUser._id,
											name: foundUser.name
										}
									}
								},
								{
									new:true
								},
								(err, tp)=> {
									console.log("tp", tp)
									console.log("err", err)
			 						if (err)	throw err;
			 						let payload = foundUser.toObject();
			 						delete payload.password;
			 						let token=jwt.sign(payload, config.jwtsecret, { expiresIn: '2h' });
			 						if (tp) {
			 							res.json({
				 							error:false,
				 							token:token,
				 							tp: true
				 						});	
			 						} else {
			 							res.json({
				 							error:false,
				 							token:token,
				 							tp: false
				 						});
			 						};				 						
			 					}
			 				);
 						}
 					}

 					else{
 						const myResponse = responseGenerator.generate(true,"Incorrect password",500,null);
 						res.send(myResponse);
 					}
 				});

 			}else if(foundUser==null || foundUser==undefined || foundUser.email==undefined){
 				const myResponse = responseGenerator.generate(true,"User does not exist!",404,null);
 				res.send(myResponse);
 			}else{

 				const myResponse = responseGenerator.generate(true,"Error logging you in! Please try again."+err,500,null);
 				res.send(myResponse);
 			}
 		});
 	});//end of login route

 	//route to send otp
 	userRouter.post('/forgotpassword',(req,res)=>{

 		userModel.findOne({email:req.body.email},(err,foundUser)=>{
 			if(err){
 				throw err;
 			}else if(foundUser == null){
 				const myResponse = responseGenerator.generate(true,"Email not registered!",404,null);
 				res.send(myResponse);
 			}else{
 				req.session.otp=randomstring.generate({ length: 6,charset: 'numeric '});
 				req.session.email = foundUser.email;
 				console.log(req.session.email);
 				eventEmitter.emit('forgot-pass', {email:req.session.email,otp:req.session.otp});
 				const myResponse = responseGenerator.generate(false,"OTP sent to the registerd email",200,req.session.otp);
 				res.send(myResponse);
 			}
 		});

 	});//end otp route

 	//route to send otp
 	userRouter.post('/checkpassword',(req,res)=>{
 		userModel.findOne({_id: req.body.userid},(err,foundUser)=>{
 			bcrypt.compare(req.body.password, foundUser.password, (err, isMatch) =>{
					if(err)	throw err;

					else if(isMatch){
						const myResponse = responseGenerator.generate(false,"Otp verified",200,null);
						req.session.email = foundUser.email;
						res.send(myResponse);
					} else {
						const myResponse = responseGenerator.generate(true,"Incorrect password",500,null);
						res.send(myResponse);
					}
 			});
 		});
 	});

 	//route to verify otp sent in the mail
 	userRouter.post('/verifyotp',(req,res)=>{
 		if(req.body.otp === req.session.otp){
 			console.log('otp verified');
 			const myResponse = responseGenerator.generate(false,"Otp verified",200,null);
 			res.send(myResponse);
 		}else{
 			console.log('otp doesnt match');
 			const myResponse = responseGenerator.generate(true,"Otp does not match!",400,null);
 			res.send(myResponse);

 		}
 	});// end otp verification route

 	//route to reset the password
 	userRouter.post('/resetpassword',(req,res)=>{
 		console.log(req.session.email);
 		if(req.body.password === req.body.cpassword){
 			let password = req.body.password;
 			bcrypt.genSalt(10,	(err, salt)=> {
 				bcrypt.hash(password, salt,	(err, hash)=> {
 					password=hash;
 					userModel.findOneAndUpdate({email: req.session.email}, {$set:{password:password}},{new:true},(err, docs)=> {

 						if (err)	throw err;
 						else if(docs){

 							const response = responseGenerator.generate(false, "Password changed successfully! Now you can Login!!", 200, null);
 							res.send(response);
 						}
 						else{res.send("");}
 					});
 				});
 			});

 		}

 		else{
 			const response = responseGenerator.generate(true, "Passwords didn't match.", 500, null);
 			res.send(response);
 		}
 	});

	//route to check if the token is valid or not
	userRouter.get('/checktoken',(req,res)=>{
		console.log('req.token', req.query.token);
		tpModel.findOne({
			'param': req.query.token
		},	(err, result) =>{
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else {
				let response = null;
				if (result) {
					response = responseGenerator.generate(false, "Test Details", 200, result._id);
				} else {
					response = responseGenerator.generate(false, "Test Details", 200, result);
				}
				res.send(response);
			}
		});
	});

	//API to get the performances of all users
	userRouter.get('/performance/pdf/:pid',	(req, res) =>{
		console.log('pid', req.params.pid)
			//api to get	performance user specific
		performanceModel.findById(req.params.pid,	(err, performance)=> {
			if (err) {
				let error = responseGenerator.generate(true, "Something is not working, error : " + err, 500, null);
				res.send(error);
		
			} else {
				var myDoc = new PDFDocument({bufferPages: true});

				let buffers = [];
				myDoc.on('data', buffers.push.bind(buffers));
				myDoc.on('end', () => {

					let pdfData = Buffer.concat(buffers);
					res.writeHead(200, {
						'Content-Length': Buffer.byteLength(pdfData),
						'Content-Type': 'application/pdf',
						'Content-disposition': 'attachment;filename=test.pdf',})
					.end(pdfData);

				});

				myDoc.font('Times-Roman')
					.fontSize(12)
					.text(`this is a test text`);
				myDoc.end();
			}
		});
	});

 	app.use('/',userRouter);
};