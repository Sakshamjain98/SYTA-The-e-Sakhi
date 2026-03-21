const weights = require('../weights.json');

function cleanSentence(text) {
  if (!text) return [];
  let line = text.trim().toLowerCase();
  line = line.replace(/@[\w_]+/g, '');
  line = line.replace(/[.*%$^0-9#!\[\]\\?&\/\)\(\+\-<>]/g, '');
  const tokens = line.split(/\s+/).filter(Boolean);
  return tokens;
}

function encodeSentence(all_words, sentence_tokens) {
  const bag = new Array(all_words.length).fill(0);
  const s = sentence_tokens;
  for (let i = 0; i < all_words.length; i++) {
    const w = all_words[i];
    for (let j = 0; j < s.length; j++) {
      if (w === s[j]) {
        bag[i] = 1;
        break;
      }
    }
  }
  return bag;
}

function dotProduct(matrix, vector) {
  // matrix: rows x cols, vector: cols
  const rows = matrix.length;
  const cols = matrix[0].length;
  const out = new Array(rows).fill(0);
  for (let i = 0; i < rows; i++) {
    let sum = 0;
    for (let j = 0; j < cols; j++) {
      sum += matrix[i][j] * vector[j];
    }
    out[i] = sum;
  }
  return out;
}

function addBias(vec, bias) {
  const out = new Array(vec.length);
  for (let i = 0; i < vec.length; i++) {
    // bias may be [[x]] or [x]
    const b = Array.isArray(bias[i]) ? (Array.isArray(bias[i][0]) ? bias[i][0] : bias[i][0]) : bias[i];
    out[i] = vec[i] + (typeof b === 'number' ? b : 0);
  }
  return out;
}

function relu(vec) {
  return vec.map((v) => (v > 0 ? v : 0));
}

function softmax(vec) {
  const max = Math.max(...vec);
  const exps = vec.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

exports.handler = async function (req, res) {
  try {
    const method = req.method || req.httpMethod || 'GET';
    let input = '';
    if (method === 'POST') {
      input = req.body?.input_mood || '';
    } else {
      // GET
      input = req.query?.input_mood || req.query?.q || '';
    }

    const all_words = weights.words || [];
    const classes = weights.classes || [];
    const W1 = weights.weight1 || [];
    const W2 = weights.weight2 || [];
    const b1 = weights.bias1 || [];
    const b2 = weights.bias2 || [];

    const tokens = cleanSentence(input);
    const x = encodeSentence(all_words, tokens);

    // Forward pass
    const l1_in = dotProduct(W1, x);
    const l1 = relu(addBias(l1_in, b1));
    const l2_in = dotProduct(W2, l1);
    const l2 = softmax(addBias(l2_in, b2));

    // prepare results
    const threshold = 0.1;
    const results = [];
    for (let i = 0; i < l2.length; i++) {
      if (l2[i] > threshold) {
        results.push({ label: classes[i] || `class_${i}`, score: l2[i] });
      }
    }
    // sort by score desc
    results.sort((a, b) => b.score - a.score);

    const response = {
      mood: input,
      Analytics_of_Prediction: results,
    };

    // Vercel's Node handler
    if (res && typeof res.json === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.json(response);
      return;
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (err) {
    console.error('mood api error', err);
    if (res && typeof res.status === 'function') {
      res.status(500).json({ error: String(err) });
      return;
    }
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
