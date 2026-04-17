const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('./authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

// STATIC FRONTEND SERVING
app.use(express.static(path.join(__dirname, 'smart/client/dist')));

// AUTHENTICATION
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, baseId: user.baseId },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
  
  res.json({ token, user: { id: user.id, username: user.username, role: user.role, baseId: user.baseId } });
});

// MASTERS
app.get('/api/bases', authMiddleware, async (req, res) => {
  const bases = await prisma.base.findMany();
  res.json(bases);
});

app.post('/api/bases', authMiddleware, roleMiddleware(['ADMIN']), async (req, res) => {
  const { name, location } = req.body;
  try {
    const newBase = await prisma.base.create({
      data: { name, location }
    });
    res.json(newBase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', authMiddleware, roleMiddleware(['ADMIN']), async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, role: true, baseId: true, base: true }
  });
  res.json(users);
});

app.post('/api/users', authMiddleware, roleMiddleware(['ADMIN']), async (req, res) => {
  const { username, password, role, baseId } = req.body;
  
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        passwordHash,
        role,
        baseId: baseId ? parseInt(baseId) : null
      },
      select: { id: true, username: true, role: true, baseId: true }
    });
    res.json(newUser);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Identification protocols breached: Username already exists in the system.' });
    }
    res.status(500).json({ error: 'System processing error: ' + err.message });
  }
});

app.get('/api/assets', authMiddleware, async (req, res) => {
  const assets = await prisma.asset.findMany();
  res.json(assets);
});

// TRANSACTIONS

app.post('/api/transactions/purchase', authMiddleware, roleMiddleware(['ADMIN', 'LOGISTICS']), async (req, res) => {
  const { assetId, toBaseId, quantity, reference } = req.body;
  if (quantity <= 0) return res.status(400).json({ error: 'Quantity must be positive' });
  
  try {
    const tx = await prisma.transaction.create({
      data: {
        assetId,
        toBaseId,
        type: 'PURCHASE',
        quantity,
        reference,
        userId: req.user.id
      }
    });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions/transfer', authMiddleware, roleMiddleware(['ADMIN', 'COMMANDER', 'LOGISTICS']), async (req, res) => {
  const { assetId, fromBaseId, toBaseId, quantity, reference } = req.body;
  
  if (req.user.role !== 'ADMIN' && req.user.baseId !== fromBaseId) {
    return res.status(403).json({ error: 'You can only transfer from your assigned base' });
  }

  try {
    // We could check balance here, but for MVP we log the transfer.
    const tx = await prisma.transaction.create({
      data: {
        assetId,
        fromBaseId,
        toBaseId,
        type: 'TRANSFER',
        quantity,
        reference,
        userId: req.user.id
      }
    });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions/assign', authMiddleware, roleMiddleware(['ADMIN', 'COMMANDER']), async (req, res) => {
  const { assetId, fromBaseId, quantity, reference, type } = req.body; // type = 'ASSIGN' | 'EXPEND'
  
  if (req.user.role !== 'ADMIN' && req.user.baseId !== fromBaseId) {
    return res.status(403).json({ error: 'You can only assign/expend from your assigned base' });
  }

  try {
    const tx = await prisma.transaction.create({
      data: {
        assetId,
        fromBaseId,
        toBaseId: null,
        type: type, // ASSIGN or EXPEND
        quantity,
        reference,
        userId: req.user.id
      }
    });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DASHBOARD (Inventory calculations based on Ledger)
app.get('/api/inventory/dashboard', authMiddleware, async (req, res) => {
  // Option: pass baseId as query filter
  const baseFilterId = req.query.baseId ? parseInt(req.query.baseId) : null;
  // If Commander, enforce their base 
  let targetBaseId = baseFilterId;
  if (req.user.role === 'COMMANDER') {
    targetBaseId = req.user.baseId;
  }

  // Generate aggregate dashboard data by Base and Asset
  const bases = await prisma.base.findMany();
  const assets = await prisma.asset.findMany();
  const transactions = await prisma.transaction.findMany();

  const results = [];

  for (let base of bases) {
    if (targetBaseId && base.id !== targetBaseId) continue;

    for (let asset of assets) {
      // Calculate balances for this specific Asset at this Base
      const txns = transactions.filter(t => t.assetId === asset.id);
      let purchases = 0, transfersIn = 0, transfersOut = 0, assigned = 0, expended = 0;

      for (let t of txns) {
        if (t.toBaseId === base.id) {
          if (t.type === 'PURCHASE') purchases += t.quantity;
          if (t.type === 'TRANSFER') transfersIn += t.quantity;
        }
        if (t.fromBaseId === base.id) {
          if (t.type === 'TRANSFER') transfersOut += t.quantity;
          if (t.type === 'ASSIGN') assigned += t.quantity;
          if (t.type === 'EXPEND') expended += t.quantity;
        }
      }

      // Business logic: Balance = Purchases + Transfer In - Transfer Out - Expenditures
      // Whether "Assigned" deducts from balance or not is up to policy, for this MVP we track it independently but do not deduct from closing.
      const openingBalance = 0; // if we want date ranges
      const netMovement = purchases + transfersIn - transfersOut;
      const closingBalance = openingBalance + netMovement - expended;

      if (purchases + transfersIn + transfersOut + assigned + expended > 0 || closingBalance > 0) {
        results.push({
          base: base.name,
          assetName: asset.name,
          assetType: asset.type,
          purchases,
          transfersIn,
          transfersOut,
          expended,
          assigned,
          closingBalance,
          netMovement
        });
      }
    }
  }

  res.json(results);
});


app.get('/api/inventory/movements', authMiddleware, async (req, res) => {
    // Provides detailed movement breakdown
    const movements = await prisma.transaction.findMany({
        include: {
            asset: true,
            fromBase: true,
            toBase: true,
            user: true
        },
        orderBy: { date: 'desc'}
    })
    res.json(movements);
});

// 🚀 Health Check / Welcome Route
app.get('/health', (req, res) => {
  res.send("Welcome to MAMS Backend Server 🚀");
});

// Wildcard route to serve React's index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'smart/client/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
