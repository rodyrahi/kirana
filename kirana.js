const express = require('express');
const app = express();


const fetch = require('node-fetch'); // Import the fetch library




var con = require("./database.js");
const { render } = require('ejs');
const port = 9090;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));



function executeQuery(query) {
  return new Promise((resolve, reject) => {
    con.query(query, (err, result, fields) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}





app.get('/', async (req, res) => {


    res.render('login');

  
});



app.post('/login', async (req, res) => {
  const { name, password } = req.body;
  const result = await executeQuery(`SELECT * FROM shops WHERE name='${name}' AND pass='${password}'`);
  const lists = await executeQuery(`SELECT * FROM customers WHERE shop='${name}'`);


  var now = new Date();
  now = now.getDate() +'/'+now.getMonth() +'/'+now.getFullYear()
  now = now.toString();
  console.log(now);
  
  if (result.length > 0) {

    if (result[0].expiredate === now) {
      console.log('expired');

      res.render('login');
    }else{
      console.log('notexpired' , now , result.expiredate);


      
      res.render('dashboard' , {user:name , lists:lists});

    }
  } else {
    res.render('login');
  }
});



app.get('/:shop', async (req, res) => {


  const shop = req.params.shop

  const result = await executeQuery(`SELECT * FROM shops WHERE name = '${shop}'`)

  if (result.length > 0) {
    res.render('customer' , {shop : shop});

  }
});



app.post('/:shop/list', async (req, res) => {

  const shop = req.params.shop
  
  const customername = req.params.customer


  const {customer , customerno , itemname , itemcount } = req.body 
  console.log(req.body);

  console.log(customer , customerno , itemcount , itemname);

  await executeQuery(`INSERT INTO customers (name, number, items, count , shop) VALUES 
  ('${customer}', '${customerno}', '${itemname}', '${itemcount}' , '${shop}')`)



  res.render('customer' , {shop:shop})
});



app.post('/:number', async (req, res) => {

  const number = req.params.number

 
  const {user} = req.body 

  const result = await executeQuery(`SELECT * FROM customers WHERE number='${number}'`);

  console.log(result);
  if (result.length>0) {
    res.render('shop' , {user:user ,lists: result})
  }

});










const querystring = require('querystring');

app.post('/pay/:customerno', async (req, res) => {
  try {
    
    const number = req.params.customerno
    const { total , user } = req.body;

    const apiUrl = 'https://wapi.kamingo.in/send-message'; // Replace with the actual API URL


    console.log(number);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ number: number, message: `kirana.kamingo.in/payme/${user}/${total}` }),
    });



    if (response.ok) {
      const responseData = await response.json();
      console.log('API Response:', responseData);
      res.json({ status: 'ok', data: responseData }); // Send a JSON response with status 'ok'
    } else {
      console.error('API Error:', response.status);
      res.status(500).json({ status: 'error' }); // Send a JSON response with status 'error'
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ status: 'error' }); // Send a JSON response with status 'error'
  }
});


app.get('/payme/:user/:amount', async (req, res) => {

  const amount = req.params.amount
  const user = req.params.user


  const result = await executeQuery(`SELECT * FROM shops WHERE name='${user}'`);


  console.log(result[0].upi);
  console.log(result);
  if (result.length>0) {
    res.redirect(`upi://pay?pa=${result[0].upi}&pn=PaytmUser&mc=0000&mode=02&purpose=00&orgid=159761&am=${amount}`);
  }

});




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
