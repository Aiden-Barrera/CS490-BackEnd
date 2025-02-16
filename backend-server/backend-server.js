import express from 'express'
import cors from 'cors'
import db from './database.js'

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())

// Endpoint 
app.get('/api/message', (req, res) => {
  res.json({message: "Hello this is a message"})
})

app.get('/actor/:id', async (req, res) => {
  try {
    const {id} = req.params
    const [rows] = await db.query('select first_name, last_name from actor where actor_id = ?', [id])

    res.json(rows)
  } catch (error){
    console.log('Error fetching user:', user)
    res.status(500).json({message: 'Server error'})
  }
})

// Fetch Top 5 movies from the Sakila DB
app.get('/movies/top5Movies', async (req, res) => {
  try{
    const [rows] = await db.query('select FC.film_id, F.title, C.name, count(R.inventory_id) as rented from inventory as I, film as F, rental as R, film_category as FC, category as C where R.inventory_id = I.inventory_id and I.film_id = F.film_id and F.film_id = FC.film_id and C.category_id = FC.category_id group by FC.film_id, FC.category_id order by rented desc limit 5;')

    res.json(rows)
  } catch (error){
    console.log('Error fetching top 5 movies')
    res.status(500).json({message : 'Server error'})
  }
})

// Fetch top 5 actors/actresses from movies 
app.get('/movies/top5Actors', async (req, res) => {
  try {
    const [rows] = await db.query('select FA.actor_id, A.first_name, A.last_name, count(FA.film_id) as movies from film_actor as FA, actor as A where FA.actor_id = A.actor_id group by FA.actor_id order by movies desc limit 5;')
  
    res.json(rows)
  } catch (error){
    console.log("Error fetching top 5 actors")
    res.status(500).json({message: 'Server error'})
  }
})

app.get('/customers/all', async (req, res) => {
  try {
    const [rows] = await db.query('select C.customer_id, C.first_name, C.last_name, C.email, A.phone, A.address, A.district, A.postal_code, C.create_date from customer as C, address as A where C.address_id = A.address_id')

    res.json(rows)
  } catch (error){
    console.log("Error fetching all customers")
    res.status(500).json({message:'Server error'})
  }
})

app.get('/movieDescription/:id', async (req, res) => {
  try{
    const {id} = req.params
    const [rows] = await db.query('select FC.film_id, F.title, F.description, F.release_year, F.rating, C.name, F.special_features from film_category as FC, film as F, category as C where FC.film_id = ? and      FC.film_id = F.film_id and C.category_id = FC.category_id;', [id])

    res.json(rows)
  } catch (error){
    console.log("Error fetching Movie Description")
    res.status(500).json({message:'Server Error'})
  }
})

app.get('/actorDescription/:id', async (req, res) => {
  try {
    const {id} = req.params
    const [rows] = await db.query('select FA.film_id, F.title, count(R.inventory_id) as rental_count from film_actor as FA, film as F, rental as R, inventory as I where FA.actor_id = ? and FA.film_id = F.film_id and FA.film_id = I.film_id and I.inventory_id = R.inventory_id group by FA.film_id order by rental_count desc limit 5;', [id])

    res.json(rows)
  } catch (error){
    console.log("Error fetching Actor description")
    res.status(500).json({message:"Server Error"})
  }
})

app.post('/customers/add', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, address, district, postal_code } = req.body
    const [customerAddress] = await db.query(`insert into address (address, district, city_id, phone, postal_code, location) 
      values (?, ?, (select city_id from city order by rand() limit 1), ?, ?, ST_GeomFromText('POINT(10 20)'));`, [address, district, phone, postal_code])

    const address_id = customerAddress.insertId

    const [customerInfo] = await db.query(`insert into customer (first_name, last_name, email, address_id, store_id) 
      values (?, ?, ?, ?, (select store_id from store order by rand() limit 1));`, [first_name, last_name, email, address_id])

    res.json({ message: "Customer Successfully Added" })

  } catch (error){
    console.log('Error adding new customer')
    res.status(500).json({message: "Serer Error"})
  }
})

app.get('/movies/all', async (req, res) => {
  try {
    const [rows] = await db.query(`select FC.film_id, F.title, A.first_name, A.last_name, C.name, F.release_year, F.rating from film_category as FC, film as F, category as C, film_actor       as FA, actor as A where FC.film_id = F.film_id and FA.film_id = FC.film_id and FA.actor_id = A.actor_id and C.category_id = FC.category_id;`)

    res.json(rows)
  } catch (error) {
    console.log('Error getting all films')
    res.status(500).json({message: "Server Error"})
  }
})

app.get('/movies/copies/:id', async (req, res) => {
  try {
    const {id} = req.params
    const [rows] = await db.query(`select count(I.inventory_id) as copies from inventory as I, film as F where I.film_id = F.film_id and F.film_id = ? 
      group by F.film_id;`, [id])

    res.json(rows)
  } catch (error) {
    console.log('Error getting film copies')
    res.status(500).json({message: 'Server Error'})
  }
})

app.get('/customers/validate/:id', async (req, res) => {
  try {
    const {id} = req.params
    const [rows] = await db.query('select customer_id from customer where customer_id = ?', [id])

    res.json(rows)
  } catch (error) {
    console.log('Error getting customer_id')
  }
})

app.get('/customers/info/:id', async (req, res) => {
  try {
    const {id} = req.params
    const [rows] = await db.query('select C.customer_id, C.first_name, C.last_name, C.email, A.phone, A.address, A.district, A.postal_code, C.create_date from customer as C, address as A      where C.address_id = A.address_id and C.customer_id = ?', [id])

    res.json(rows)
  } catch (error){
    console.log("Error fetching all customers")
    res.status(500).json({message:'Server error'})
  }

})

app.get('/customers/info/rentHistory/:id', async (req, res) => {
  try{
    const {id} = req.params
    const [rows] = await db.query(`select R.rental_id, C.customer_id, C.first_name, C.last_name, F.title, R.rental_date, R.return_date from customer as C, payment as P, rental as R, inventory as I, Film as F where C.customer_id = ? and C.customer_id = P.customer_id and P.rental_id = R.rental_id and R.inventory_id = I.inventory_id and I.film_id = F.film_id;`, [id])

    res.json(rows)
  } catch (error){
    console.log('Error getting customer info')
    res.status(500).json({message: "Server error"})
  }
})

app.listen(port, () => {
  console.log(`Backend Server running at http://localhost:${port}`)
})
