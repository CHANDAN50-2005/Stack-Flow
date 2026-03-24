import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5004;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/online-judge-leaderboard';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const leaderboardSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  points: { type: Number, default: 0 },
  problemsSolved: { type: Number, default: 0 },
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB (Leaderboard Service)'))
  .catch(err => console.error('MongoDB connection error:', err));


app.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const rankings = await Leaderboard.find()
      .sort({ points: -1, problemsSolved: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Leaderboard.countDocuments();

    res.json({
        rankings,
        totalPages: Math.ceil(total / limit),
        currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to update score (called internally by Submission service ideally via message broker)
app.post('/update', async (req, res) => {
    try {
        const { userId, username, pointsToAdd } = req.body;
        
        let board = await Leaderboard.findOne({ userId });
        if(!board) {
            board = new Leaderboard({ userId, username, points: pointsToAdd, problemsSolved: 1 });
        } else {
            board.points += pointsToAdd;
            board.problemsSolved += 1;
        }

        await board.save();
        res.json(board);

    } catch (err) {
        res.status(500).json({ message: 'Error updating leaderboard' });
    }
});

app.listen(PORT, () => {
  console.log(`Leaderboard Service running on port ${PORT}`);
});
