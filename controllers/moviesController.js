const Movie = require('../models/Movie')
const jwtHelpers = require("../utils/jwtHelpers")

exports.create = async (req, res) => {
    const {name, category, description} = req.body
    const movie = Movie({
        name, 
        category,
        description
    })
    try {
        await movie.save()
        res.json({
            success: true,
            data: movie
        })
    } catch(e) {
        console.log(e);
        res.status(500).json({
            message: "Something went wrong!"
        })
    }
    
}

exports.find = async (req, res) => {
    const {id} = req.params
    const movie = await Movie.findById(id).select('-reviews')
    if (movie) {
        return res.json({
            success: true,
            data: movie
        })
    } else {
        return res.status(404).send()
    }
}

exports.update = async (req, res) => {
    const {id} = req.params
    const {name, category, description} = req.body
    const movie = await Movie.updateOne(
        { _id: id },
        {
            $set: {
                name, category, description
            }
        }
    )
    res.json({
        message: "success"
    })
    
}

exports.delete = async (req, res) => {
    const {id} = req.params
    await Movie.deleteOne({_id: id})
    res.json({
        message: "success"
    })
    
}

exports.list = async (req, res) => {
    const page = req.query?.page || 1
    const limit = 20
    const skip = (page - 1) * limit
    const movies = await Movie.find().select('-reviews').skip(skip)
    const total = await Movie.countDocuments()
    const pages = Math.ceil(total / limit)
    res.json({
        success: true,
        pages: pages,
        data: movies
    })
}

exports.reviews = async (req, res) => {
    const {id} = req.params
    console.log(id)
    const movie = await Movie.findById(id).select("-reviews._id").populate("reviews.user", "name")
    if (movie) {
        return res.json({
            success: true,
            data: movie.reviews
        })
    } else {
        return res.status(404).send()
    }
}

exports.Addreview = async (req, res) => {
    const {id} = req.params
    const {comment, rate} = req.body
    const movie = await Movie.findById(id)
    if (!movie) {
        return res.status(404).send()
    }
    const isRated = movie.reviews.findIndex(m => m.user == req.userId)

    if (isRated > -1) return res.status(403).json({"message": "Review is already added."})

    const totlaRate = movie.reviews.reduce((sum, review) => sum + review.rate, 0)
    const finalRate = (totlaRate + rate) / (movie.reviews.length + 1)

    await Movie.updateOne(
        { _id: id },
        {
            $set: {
                rate: finalRate
            },
            $push: {
                reviews: {
                    user: req.userId, comment, rate
                }
            }
        }
    )

    return res.json({
        success: true,
    })
}