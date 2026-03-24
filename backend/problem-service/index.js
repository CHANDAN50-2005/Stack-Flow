import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/online-judge-problems';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const problemSchema = new mongoose.Schema({
  order: { type: Number, default: 0 },
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: { type: Boolean, default: false }
  }]
});

const Problem = mongoose.model('Problem', problemSchema);

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB (Problem Service)');
    await seedDatabase();
  })
  .catch(err => console.error('MongoDB connection error:', err));

const seedDatabase = async () => {
  try {
    const initialProblems = [
      {
        order: 1,
        title: '1. Two Sum',
        description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
        difficulty: 'Easy',
        examples: [
          { input: '[2,7,11,15]\n9', output: '[0,1]', explanation: 'Because 2 + 7 == 9, we return [0, 1].' },
          { input: '[3,2,4]\n6', output: '[1,2]', explanation: '3 + 2 + 4 = 9, but we need target 6. 2 + 4 = 6, so return [1, 2].' }
        ],
        testCases: [
          { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
          { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: true },
          { input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: true }
        ]
      },
      {
        order: 2,
        title: '9. Palindrome Number',
        description: 'Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.\n\nAn integer is a palindrome when it reads the same backward as forward. For example, `121` is a palindrome while `123` is not.',
        difficulty: 'Easy',
        examples: [
          { input: '121', output: 'true', explanation: '121 reads as 121 from left to right and from right to left.' },
          { input: '-121', output: 'false', explanation: 'From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.' }
        ],
        testCases: [
          { input: '121', expectedOutput: 'true', isHidden: false },
          { input: '-121', expectedOutput: 'false', isHidden: false },
          { input: '10', expectedOutput: 'false', isHidden: true },
          { input: '12321', expectedOutput: 'true', isHidden: true }
        ]
      },
      {
        order: 3,
        title: '13. Roman to Integer',
        description: 'Roman numerals are represented by seven different symbols: I, V, X, L, C, D and M.\n\nSymbol Value:\nI: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000.\n\nGiven a roman numeral, convert it to an integer.',
        difficulty: 'Easy',
        examples: [
          { input: '"III"', output: '3', explanation: 'III = 3.' },
          { input: '"LVIII"', output: '58', explanation: 'L = 50, V= 5, III = 3.' }
        ],
        testCases: [
          { input: '"III"', expectedOutput: '3', isHidden: false },
          { input: '"IV"', expectedOutput: '4', isHidden: false },
          { input: '"IX"', expectedOutput: '9', isHidden: true },
          { input: '"LVIII"', expectedOutput: '58', isHidden: true },
          { input: '"MCMXCIV"', expectedOutput: '1994', isHidden: true }
        ]
      },
      {
        order: 4,
        title: '20. Valid Parentheses',
        description: 'Given a string `s` containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
        difficulty: 'Easy',
        examples: [
          { input: '"()"', output: 'true', explanation: '' },
          { input: '"()[]{}"', output: 'true', explanation: '' },
          { input: '"(]"', output: 'false', explanation: '' }
        ],
        testCases: [
          { input: '"()"', expectedOutput: 'true', isHidden: false },
          { input: '"()[]{}"', expectedOutput: 'true', isHidden: false },
          { input: '"(]"', expectedOutput: 'false', isHidden: true },
          { input: '"([)]"', expectedOutput: 'false', isHidden: true },
          { input: '"{[]}"', expectedOutput: 'true', isHidden: true }
        ]
      },
      {
        order: 5,
        title: '21. Merge Two Sorted Lists',
        description: 'You are given the heads of two sorted linked lists `list1` and `list2`.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.',
        difficulty: 'Easy',
        examples: [
          { input: '[1,2,4]\n[1,3,4]', output: '[1,1,2,3,4,4]', explanation: '' }
        ],
        testCases: [
          { input: '[1,2,4]\n[1,3,4]', expectedOutput: '[1,1,2,3,4,4]', isHidden: false },
          { input: '[]\n[]', expectedOutput: '[]', isHidden: false },
          { input: '[]\n[0]', expectedOutput: '[0]', isHidden: true }
        ]
      },
      {
        order: 6,
        title: '26. Remove Duplicates from Sorted Array',
        description: 'Given an integer array `nums` sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same.\n\nReturn the number of unique elements.',
        difficulty: 'Easy',
        examples: [
          { input: '[1,1,2]', output: '2', explanation: 'The function should return k = 2, with the first two elements of nums being 1 and 2 respectively.' }
        ],
        testCases: [
          { input: '[1,1,2]', expectedOutput: '2', isHidden: false },
          { input: '[0,0,1,1,1,2,2,3,3,4]', expectedOutput: '5', isHidden: false }
        ]
      },
      {
        order: 7,
        title: '58. Length of Last Word',
        description: 'Given a string `s` consisting of words and spaces, return the length of the last word in the string.\n\nA word is a maximal substring consisting of non-space characters only.',
        difficulty: 'Easy',
        examples: [
          { input: '"Hello World"', output: '5', explanation: 'The last word is "World" with length 5.' }
        ],
        testCases: [
          { input: '"Hello World"', expectedOutput: '5', isHidden: false },
          { input: '"   fly me   to   the moon  "', expectedOutput: '4', isHidden: false },
          { input: '"luffy is still joyboy"', expectedOutput: '6', isHidden: true }
        ]
      },
      {
        order: 8,
        title: '344. Reverse String',
        description: 'Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.',
        difficulty: 'Easy',
        examples: [
          { input: '["h","e","l","l","o"]', output: '["o","l","l","e","h"]', explanation: '' },
          { input: '["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]', explanation: '' }
        ],
        testCases: [
          { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]', isHidden: false },
          { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]', isHidden: false }
        ]
      }
    ];

    console.log('Syncing problems with database...');
    await Problem.deleteMany({});
    for (const p of initialProblems) {
      await Problem.create(p);
    }
    console.log('Database synced!');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

// Routes
app.get('/', async (req, res) => {
  try {
    const problems = await Problem.find().sort({ order: 1 }).select('-testCases.isHidden -testCases.expectedOutput');
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin only (needs proper JWT middleware in prod)
app.post('/', async (req, res) => {
  try {
    const newProblem = new Problem(req.body);
    await newProblem.save();
    res.status(201).json(newProblem);
  } catch (err) {
    res.status(400).json({ message: 'Error creating problem', error: err });
  }
});


app.listen(PORT, () => {
  console.log(`Problem Service running on port ${PORT}`);
});
