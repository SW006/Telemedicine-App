const { Client } = require('pg');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
};

async function connectToDatabase() {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL database');
        return client;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

async function showTables() {
    const client = await connectToDatabase();
    try {
        const result = await client.query(`
            SELECT table_name, table_type 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);
        
        console.log('\n📊 Tables in medical_booking database:');
        console.log('=====================================');
        result.rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.table_name} (${row.table_type})`);
        });
        console.log(`\n📋 Total tables: ${result.rows.length}`);
    } finally {
        await client.end();
    }
}

async function showTableData(tableName, limit = 10) {
    const client = await connectToDatabase();
    try {
        // Check if table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = $1
            );
        `, [tableName]);
        
        if (!tableCheck.rows[0].exists) {
            console.log(`❌ Table '${tableName}' does not exist`);
            return;
        }

        // Get table structure
        const columns = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = $1
            ORDER BY ordinal_position;
        `, [tableName]);

        console.log(`\n🏗️ Structure of table '${tableName}':`);
        console.log('=======================================');
        columns.rows.forEach(col => {
            console.log(`• ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
        });

        // Get sample data
        const data = await client.query(`SELECT * FROM ${tableName} LIMIT $1`, [limit]);
        console.log(`\n📋 Sample data from '${tableName}' (first ${limit} rows):`);
        console.log('=====================================');
        
        if (data.rows.length === 0) {
            console.log('📭 No data found in this table');
        } else {
            console.table(data.rows);
            console.log(`\n📊 Showing ${data.rows.length} of potentially more rows`);
        }
        
    } finally {
        await client.end();
    }
}

async function runCustomQuery(query) {
    const client = await connectToDatabase();
    try {
        console.log(`\n🔍 Executing query: ${query}`);
        console.log('=====================================');
        
        const result = await client.query(query);
        
        if (result.command === 'SELECT' && result.rows.length > 0) {
            console.table(result.rows);
            console.log(`\n📊 Found ${result.rows.length} rows`);
        } else if (result.command === 'SELECT') {
            console.log('📭 No rows returned');
        } else {
            console.log(`✅ Query executed successfully. ${result.rowCount} rows affected.`);
        }
        
    } catch (error) {
        console.error('❌ Query failed:', error.message);
    } finally {
        await client.end();
    }
}

async function getDatabaseStats() {
    const client = await connectToDatabase();
    try {
        console.log('\n📊 Database Statistics:');
        console.log('=====================');

        // Database size
        const dbSize = await client.query(`
            SELECT pg_size_pretty(pg_database_size($1)) as size;
        `, [process.env.DB_NAME]);
        console.log(`💾 Database size: ${dbSize.rows[0].size}`);

        // Table count
        const tableCount = await client.query(`
            SELECT COUNT(*) as count FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
        console.log(`📋 Total tables: ${tableCount.rows[0].count}`);

        // Version
        const version = await client.query('SELECT version();');
        console.log(`🐘 PostgreSQL version: ${version.rows[0].version.split(',')[0]}`);

        // Connection info
        console.log(`🌐 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
        console.log(`👤 User: ${process.env.DB_USER}`);
        console.log(`📊 Database: ${process.env.DB_NAME}`);

    } finally {
        await client.end();
    }
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

if (!command) {
    console.log('🗄️ TeleTabib Database Administration Tool');
    console.log('========================================');
    console.log('\nUsage:');
    console.log('  node db-admin.js tables              - List all tables');
    console.log('  node db-admin.js show <table>        - Show table structure and data');
    console.log('  node db-admin.js query "<sql>"       - Run custom SQL query');
    console.log('  node db-admin.js stats               - Show database statistics');
    console.log('\nExamples:');
    console.log('  node db-admin.js show users');
    console.log('  node db-admin.js query "SELECT COUNT(*) FROM appointments"');
    process.exit(0);
}

switch (command.toLowerCase()) {
    case 'tables':
        showTables();
        break;
    case 'show':
        if (!args[1]) {
            console.error('❌ Please specify a table name');
            console.log('Usage: node db-admin.js show <table_name>');
            process.exit(1);
        }
        showTableData(args[1]);
        break;
    case 'query':
        if (!args[1]) {
            console.error('❌ Please provide a SQL query');
            console.log('Usage: node db-admin.js query "SELECT * FROM table"');
            process.exit(1);
        }
        runCustomQuery(args[1]);
        break;
    case 'stats':
        getDatabaseStats();
        break;
    default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Run "node db-admin.js" to see available commands');
        process.exit(1);
}