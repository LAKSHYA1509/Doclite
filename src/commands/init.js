const fs = require('fs').promises; 
const path = require('path');     

async function initializeReadme() {
    console.log('Running Doclite init command...'); 

    const readmePath = path.join(process.cwd(), 'README.md');
    console.log(`Checking for README at: ${readmePath}`); 

    try {

        await fs.access(readmePath);

        console.log('✔️ README.md already exists in this directory.');

    } catch (error) {

        if (error.code === 'ENOENT') {
            console.log('ℹ️ No README.md found. Ready to create one.');

        } else {

            console.error('❌ Error checking for README.md:', error.message);
        }
    }
}

module.exports = { initializeReadme };