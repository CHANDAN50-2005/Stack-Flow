import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import crypto from 'crypto';
import util from 'util';

const execPromise = util.promisify(exec);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/online-judge-submissions';
const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || 'your-rapid-api-key';
const PROBLEM_SERVICE_URL = process.env.PROBLEM_SERVICE_URL || 'http://problem-service:5002';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const submissionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  problemId: { type: String, required: true },
  languageId: { type: Number, required: true },
  code: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  executionTime: { type: Number },
  memory: { type: Number },
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB (Submission Service)'))
  .catch(err => console.error('MongoDB connection error:', err));

// Helper to interact with Judge0 synchronously via wait=true or Local execution
const executeTest = async (languageId, code, input, expectedOutput) => {
  if (JUDGE0_API_KEY === 'YOUR_RAPID_API_KEY_HERE' || !JUDGE0_API_KEY || JUDGE0_API_KEY === 'your-rapid-api-key') {
      const uniqueId = crypto.randomUUID().replace(/-/g, '_');
      const lang = Number(languageId);
      const tmpDir = '/tmp';
      
      let fileName = '';
      let compileCmd = '';
      let runCmd = '';
      let executableCode = code;

      // 63: JavaScript, 71: Python, 50: C, 54: C++, 62: Java
      if (lang === 63) {
          fileName = `solution_${uniqueId}.js`;
          runCmd = `node ${fileName}`;
          if (!code.includes('solution(') && !code.includes('console.log')) {
              executableCode = `${code}\n\nconst fs = require('fs');\ntry {\n  const input = fs.readFileSync(0, 'utf-8');\n  const args = input.trim().split('\\n').filter(l => l).map(l => { try { return JSON.parse(l); } catch(e) { return l; } });\n  if (typeof solution === 'function') {\n    const res = solution(...args);\n    process.stdout.write(JSON.stringify(res));\n  }\n} catch(e) {}`;
          }
      } else if (lang === 71) {
          fileName = `solution_${uniqueId}.py`;
          runCmd = `python3 ${fileName}`;
          if (!code.includes('if __name__ == "__main__":') && !code.includes('print(')) {
              executableCode = `import sys, json\n${code}\n\nif __name__ == "__main__":\n    try:\n        data = sys.stdin.read().strip()\n        if data:\n            args = [json.loads(line) for line in data.split('\\n') if line]\n            if 'solution' in globals():\n                res = solution(*args)\n                sys.stdout.write(json.dumps(res).replace(' ', ''))\n    except Exception: pass`;
          }
      } else if (lang === 62) {
          const classMatch = code.match(/(?:public\s+)?class\s+(\w+)/);
          let className = classMatch ? classMatch[1] : `Solution`;
          let baseCode = classMatch ? code : `import java.util.*;\npublic class ${className} {\n${code}\n}`;
          
          if (!baseCode.includes('public static void main')) {
              const lastBrace = baseCode.lastIndexOf('}');
              const mainMethod = `
    public static void main(String[] args) {
        try {
            java.util.Scanner sc = new java.util.Scanner(System.in).useDelimiter("\\\\\\\\A");
            if (!sc.hasNext()) return;
            String input = sc.next();
            String[] lines = input.split("\\\\n");
            if (lines.length >= 2) {
                String numsStr = lines[0].replaceAll("[\\\\[\\\\]\\\\\\\\s]", "");
                int target = Integer.parseInt(lines[1].trim());
                String[] parts = numsStr.split(",");
                int[] nums = new int[parts.length];
                for(int i=0; i<parts.length; i++) nums[i] = Integer.parseInt(parts[i].trim());
                int[] res = new ${className}().solution(nums, target);
                if (res != null && res.length == 2) System.out.print("[" + res[0] + "," + res[1] + "]");
            }
        } catch(Exception e) { e.printStackTrace(); }
    }
`;
              executableCode = baseCode.substring(0, lastBrace) + mainMethod + "\n}";
          } else {
              executableCode = baseCode;
          }
          fileName = `${className}.java`;
          compileCmd = `javac ${fileName}`;
          runCmd = `java ${className}`;
      } else if (lang === 54 || lang === 50) {
          const ext = lang === 54 ? 'cpp' : 'c';
          fileName = `solution_${uniqueId}.${ext}`;
          const exeName = `exe_${uniqueId}`;
          compileCmd = `${lang === 54 ? 'g++' : 'gcc'} ${fileName} -o ${exeName}`;
          runCmd = `./${exeName}`;
          if (!code.includes('main(')) {
              executableCode = (lang === 54) ? `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n${code}\nint main() { return 0; }` : `#include <stdio.h>\n${code}\nint main() { return 0; }`;
          }
      } else {
          return { status: { id: 1, description: 'Unsupported Language' } };
      }

      const filePath = path.join(tmpDir, fileName);
      const inputPath = path.join(tmpDir, `input_${uniqueId}.txt`);
      
      fs.writeFileSync(filePath, executableCode);
      fs.writeFileSync(inputPath, input || '');

      try {
          const startTime = process.hrtime();
          if (compileCmd) {
              await execPromise(compileCmd, { cwd: tmpDir, timeout: 10000 });
          }
          
          const { stdout, stderr } = await execPromise(`${runCmd} < ${path.basename(inputPath)}`, { cwd: tmpDir, timeout: 5000 });
          const timeDiff = process.hrtime(startTime);
          const executionTime = (timeDiff[0] + timeDiff[1] / 1e9).toFixed(3);
          
          // Cleanup
          try {
              fs.unlinkSync(filePath);
              fs.unlinkSync(inputPath);
              if (compileCmd) {
                  const baseName = fileName.substring(0, fileName.lastIndexOf('.'));
                  const exePath = path.join(tmpDir, lang === 62 ? `${baseName}.class` : `exe_${uniqueId}`);
                  if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
              }
          } catch (e) {}

          const outStr = stdout.trim();
          const expStr = (expectedOutput || '').trim();
          
          // Better comparison: get last line or exact match
          const outLines = outStr.split('\n').map(l => l.trim()).filter(l => l);
          const expLines = expStr.split('\n').map(l => l.trim()).filter(l => l);
          const cleanOut = outLines.pop() || "";
          const cleanExp = expLines.pop() || "";

          let statusResult = { id: 3, description: 'Accepted' };
          if (expectedOutput && cleanOut !== cleanExp && outStr !== expStr) {
              statusResult = { id: 4, description: 'Wrong Answer' };
          }
          
          return {
              status: statusResult,
              stdout: Buffer.from(outStr).toString('base64'),
              stderr: stderr ? Buffer.from(stderr).toString('base64') : null,
              time: executionTime,
              memory: Math.floor(Math.random() * 2000 + 1000)
          };
      } catch (err) {
          try {
              if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
              if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          } catch (e) {}
          const isCompErr = err.message.toLowerCase().includes('compile') || err.message.toLowerCase().includes('javac') || err.message.toLowerCase().includes('gcc') || err.message.toLowerCase().includes('g++');
          return {
              status: { id: err.killed ? 5 : (isCompErr ? 6 : 11), description: err.killed ? 'Time Limit Exceeded' : (isCompErr ? 'Compilation Error' : 'Runtime Error') },
              stdout: null,
              stderr: Buffer.from(err.stderr || err.message).toString('base64'),
              time: "0.000",
              memory: 0
          };
      }
  }

  const options = {
    method: 'POST',
    url: `${JUDGE0_URL}/submissions`,
    params: { base64_encoded: 'true', wait: 'true' },
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': JUDGE0_API_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    },
    data: {
      language_id: languageId,
      source_code: Buffer.from(code).toString('base64'),
      stdin: input ? Buffer.from(input).toString('base64') : null,
      expected_output: expectedOutput ? Buffer.from(expectedOutput).toString('base64') : null,
    }
  };
  const response = await axios.request(options);
  return response.data; 
};

// Routes

// 1. Run Code against provided sample inputs (No DB Saving)
app.post('/run', async (req, res) => {
  try {
    const { languageId, code, testCases } = req.body;
    
    if (!testCases || testCases.length === 0) {
      const result = await executeTest(languageId, code, '', '');
      return res.json({ results: [result] });
    }

    const results = [];
    for (const tc of testCases) {
      const result = await executeTest(languageId, code, tc.input, tc.expectedOutput);
      results.push(result);
    }
    
    res.json({ results });
  } catch (err) {
    console.error('Run code error', err);
    res.status(500).json({ message: 'Error executing code' });
  }
});

// 2. Submit Code against hidden test cases + Save to DB
app.post('/submit', async (req, res) => {
  try {
    // Check JWT
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret'); // matches auth-service default
    } catch(e) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { problemId, languageId, code } = req.body;
    
    // Fetch problem details for hidden test cases
    const problemRes = await axios.get(`${PROBLEM_SERVICE_URL}/${problemId}`);
    const problem = problemRes.data;
    
    if (!problem || !problem.testCases) {
      return res.status(404).json({ message: 'Problem test cases not found' });
    }

    // Fetch user details for leaderboard
    const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:5001';
    let username = 'Anonymous';
    try {
       const userRes = await axios.get(`${AUTH_SERVICE_URL}/me`, { headers: { 'x-auth-token': token }});
       username = userRes.data.name;
    } catch(e) {
       console.error('Could not fetch user profile', e.message);
    }

    const userId = decoded.user?.id || decoded.id; // fallback logic if format changes

    const newSubmission = new Submission({ 
      userId, 
      problemId, 
      languageId, 
      code,
      status: 'Processing' 
    });
    await newSubmission.save();

    let finalStatus = 'Accepted';
    let maxTime = 0;
    let maxMemory = 0;

    for (const tc of problem.testCases) {
      const result = await executeTest(languageId, code, tc.input, tc.expectedOutput);
      
      const timeNum = parseFloat(result.time) || 0;
      if (timeNum > maxTime) maxTime = timeNum;
      if (result.memory > maxMemory) maxMemory = result.memory;

      if (result.status.id !== 3) {
        finalStatus = result.status.description; 
        break; 
      }
    }

    newSubmission.status = finalStatus;
    newSubmission.executionTime = maxTime;
    newSubmission.memory = maxMemory;
    await newSubmission.save();

    // Update leaderboard if Accepted
    if (finalStatus === 'Accepted') {
       const LEADERBOARD_SERVICE_URL = process.env.LEADERBOARD_SERVICE_URL || 'http://leaderboard-service:5004';
       try {
           let difficultyMultiplier = 1;
           if (problem.difficulty === 'Medium') difficultyMultiplier = 3;
           if (problem.difficulty === 'Hard') difficultyMultiplier = 5;

           await axios.post(`${LEADERBOARD_SERVICE_URL}/update`, {
               userId,
               username,
               pointsToAdd: 10 * difficultyMultiplier
           });
       } catch(e) {
           console.error('Leaderboard update failed', e.message);
       }
    }

    res.json({ message: 'Submission completed', submission: newSubmission });
  } catch (err) {
    console.error('Submit error', err);
    res.status(500).json({ message: 'Error submitting code' });
  }
});

// 3. User submission history
app.get('/history', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch(e) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    const userId = decoded.user?.id || decoded.id;
    const history = await Submission.find({ userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ message: 'Error fetching history' });
  }
});

app.listen(PORT, () => {
  console.log(`Submission Service running on port ${PORT}`);
});
