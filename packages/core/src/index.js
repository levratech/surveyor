"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const build_1 = require("./commands/build");
const command = process.argv[2];
if (command === 'build') {
    (0, build_1.build)().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
else {
    console.log('Usage: svy build');
    process.exit(1);
}
