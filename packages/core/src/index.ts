import { build } from './commands/build';

const command = process.argv[2];

if (command === 'build') {
  build().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  console.log('Usage: svy build');
  process.exit(1);
}
