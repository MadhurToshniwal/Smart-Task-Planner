const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
const initDatabase = async () => {
  try {
    // Create goals table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(50) DEFAULT 'medium',
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tasks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        goal_id INTEGER REFERENCES goals(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        priority VARCHAR(50) DEFAULT 'medium',
        due_date DATE,
        ai_generated BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ PostgreSQL tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

// Goal model functions
const Goal = {
  async create(goalData) {
    const { title, description, priority, category } = goalData;
    const result = await pool.query(
      'INSERT INTO goals (title, description, priority, category) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, priority, category]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query('SELECT * FROM goals ORDER BY created_at DESC');
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM goals WHERE id = $1', [id]);
    return result.rows[0];
  },

  async update(id, updateData) {
    const fields = Object.keys(updateData).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [id, ...Object.values(updateData)];
    const result = await pool.query(
      `UPDATE goals SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM goals WHERE id = $1', [id]);
  }
};

// Task model functions
const Task = {
  async create(taskData) {
    const { goal_id, title, description, priority, due_date, ai_generated } = taskData;
    const result = await pool.query(
      'INSERT INTO tasks (goal_id, title, description, priority, due_date, ai_generated) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [goal_id, title, description, priority, due_date, ai_generated]
    );
    return result.rows[0];
  },

  async findByGoalId(goalId) {
    const result = await pool.query('SELECT * FROM tasks WHERE goal_id = $1 ORDER BY created_at ASC', [goalId]);
    return result.rows;
  },

  async update(id, updateData) {
    const fields = Object.keys(updateData).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [id, ...Object.values(updateData)];
    const result = await pool.query(
      `UPDATE tasks SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  }
};

module.exports = { pool, initDatabase, Goal, Task };