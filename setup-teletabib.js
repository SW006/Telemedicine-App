#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 TeleTabib Setup Script');
console.log('========================\n');

// Check if we're in the right directory
if (!fs.existsSync('backend') || !fs.existsSync('front-end')) {
  console.error('❌ Please run this script from the TeleTabib root directory');
  process.exit(1);
}

async function runCommand(command, description, cwd = process.cwd()) {
  try {
    console.log(`📦 ${description}...`);
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

async function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description} exists`);
    return true;
  } else {
    console.log(`❌ ${description} missing`);
    return false;
  }
}

async function createEnvFile(filePath, templatePath, description) {
  if (!fs.existsSync(filePath)) {
    if (fs.existsSync(templatePath)) {
      fs.copyFileSync(templatePath, filePath);
      console.log(`✅ Created ${description} from template`);
    } else {
      console.log(`❌ Template ${description} not found`);
    }
  } else {
    console.log(`✅ ${description} already exists`);
  }
}

async function main() {
  try {
    console.log('🔍 Checking prerequisites...\n');

    // Check Node.js version
    const nodeVersion = process.version;
    console.log(`📋 Node.js version: ${nodeVersion}`);
    
    if (parseInt(nodeVersion.slice(1).split('.')[0]) < 16) {
      console.log('⚠️  Warning: Node.js 16+ is recommended');
    }

    // Check if PostgreSQL is available
    try {
      execSync('psql --version', { stdio: 'pipe' });
      console.log('✅ PostgreSQL is available');
    } catch (error) {
      console.log('❌ PostgreSQL not found. Please install PostgreSQL first.');
      console.log('   Visit: https://www.postgresql.org/download/');
      process.exit(1);
    }

    console.log('\n📁 Setting up environment files...\n');

    // Create environment files
    await createEnvFile('backend/.env', 'backend/env.example', 'Backend .env file');
    await createEnvFile('front-end/.env.local', 'front-end/env.local.example', 'Frontend .env.local file');

    console.log('\n📦 Installing dependencies...\n');

    // Install backend dependencies
    await runCommand('npm install', 'Installing backend dependencies', 'backend');

    // Install frontend dependencies
    await runCommand('npm install', 'Installing frontend dependencies', 'front-end');

    console.log('\n🗄️  Setting up database...\n');

    // Check if database setup script exists
    if (fs.existsSync('backend/src/db/setup.js')) {
      await runCommand('node src/db/setup.js', 'Setting up database tables', 'backend');
    } else {
      console.log('❌ Database setup script not found');
    }

    console.log('\n🧪 Running tests...\n');

    // Run backend tests if they exist
    if (fs.existsSync('backend/package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
      if (packageJson.scripts && packageJson.scripts.test) {
        try {
          await runCommand('npm test', 'Running backend tests', 'backend');
        } catch (error) {
          console.log('⚠️  Backend tests failed or not configured');
        }
      }
    }

    console.log('\n🎉 Setup completed successfully!\n');

    console.log('📋 Next steps:');
    console.log('1. Update your .env files with your actual database credentials');
    console.log('2. Start the backend: cd backend && npm start');
    console.log('3. Start the frontend: cd front-end && npm run dev');
    console.log('4. Open http://localhost:3000 in your browser');
    console.log('5. Test the application by creating an account and booking an appointment\n');

    console.log('🔧 Configuration files:');
    console.log('- Backend config: backend/.env');
    console.log('- Frontend config: front-end/.env.local');
    console.log('- Database setup: backend/src/db/setup.js\n');

    console.log('📚 Documentation:');
    console.log('- API Documentation: Check backend/src/routes/');
    console.log('- Frontend Components: Check front-end/src/components/');
    console.log('- Database Schema: Check backend/src/db/setup.js\n');

    console.log('🆘 Need help?');
    console.log('- Check the console output for any errors');
    console.log('- Verify your database connection');
    console.log('- Make sure all required environment variables are set');

  } catch (error) {
    console.error('\n💥 Setup failed:', error.message);
    console.log('\n🆘 Troubleshooting:');
    console.log('1. Make sure you have Node.js 16+ installed');
    console.log('2. Make sure PostgreSQL is running');
    console.log('3. Check your database credentials in .env files');
    console.log('4. Try running individual commands manually');
    process.exit(1);
  }
}

main();
