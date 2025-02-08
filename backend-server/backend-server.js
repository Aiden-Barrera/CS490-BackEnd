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
    const [rows] = await db.query('select customer_id, first_name, last_name, email from customer')

    res.json(rows)
  } catch (error){
    console.log("Error fetching all customers")
    res.status(500).json({message:'Server error'})
  }
})

app.listen(port, () => {
  console.log(`Backend Server running at http://localhost:${port}`)
})
