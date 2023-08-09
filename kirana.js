const express = require('express');
const app = express();





var con = require("./database.js");
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


    res.render('home');

  
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

      res.render('home');
    }else{
      console.log('notexpired' , now , result.expiredate);


      
      res.render('shop' , {user:name , lists:lists});

    }
  } else {
    res.render('home');
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


  const {customer , customerno , itemname , itemcount } = req.body 
  console.log(req.body);

  console.log(customer , customerno , itemcount , itemname);

  await executeQuery(`INSERT INTO customers (name, number, items, count , shop) VALUES 
  ('${customer}', '${customerno}', '${itemname}', '${itemcount}' , '${shop}')`)

});






app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
