const fs = require('fs'); const txt = fs.readFileSync('Front_end/admin.txt', 'utf8'); fs.writeFileSync('Front_end/src/app/features/admin/admin.component.ts', txt, 'utf8');
