import { execSync } from 'node:child_process';
import { existsSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendDir = resolve(__dirname, 'backend');

function run(cmd, cwd = __dirname) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

// ── Backend ──────────────────────────────────
console.log('\n📦 Installing backend dependencies...');
run('npm install', backendDir);

if (!existsSync(resolve(backendDir, '.env'))) {
  console.log('\n📝 Creating backend/.env from .env.example...');
  copyFileSync(resolve(backendDir, '.env.example'), resolve(backendDir, '.env'));
}

console.log('\n🔧 Generating Prisma client...');
run('npx prisma generate --schema=prisma/schema.sqlite.prisma', backendDir);

console.log('\n🗄️  Creating database...');
run('npx prisma db push --schema=prisma/schema.sqlite.prisma', backendDir);

// ── Frontend ─────────────────────────────────
console.log('\n📦 Installing frontend dependencies...');
run('npm install', __dirname);

// ── Done ─────────────────────────────────────
console.log('\n✅ Setup complete!');
console.log('   Run "npm start" to launch the app.');
console.log('   Open http://localhost:5173 in your browser.\n');
