const fs = require('fs');
const path = require('path');

const clientSrc = path.join(__dirname, 'client', 'src');
const serverSrc = path.join(__dirname, 'server', 'src');

const report = {
    violations: [],
    scores: {
        architecture: 100,
        portalIsolation: 100,
        backend: 100,
        frontend: 100,
        socket: 100,
        security: 100,
        performance: 100,
        database: 100,
        realTime: 100,
        documentation: 100
    }
};

function addViolation(phase, severity, files, cause, fix, risk) {
    report.violations.push({ phase, severity, files, cause, fix, risk });
    
    // Deduct points based on severity
    let deduction = severity === 'Critical' ? 10 : severity === 'High' ? 5 : severity === 'Medium' ? 2 : 1;
    if (phase === 'Phase 1 - Portal Isolation') report.scores.portalIsolation -= deduction;
    if (phase === 'Phase 2 - Shared Logic') report.scores.backend -= deduction;
    if (phase === 'Phase 3 - API') report.scores.security -= deduction;
    if (phase === 'Phase 4 - Database') report.scores.database -= deduction;
    if (phase === 'Phase 5 - Socket.IO') report.scores.socket -= deduction;
    if (phase === 'Phase 7 - Frontend') report.scores.frontend -= deduction;
    if (phase === 'Phase 8 - Service Layer') report.scores.architecture -= deduction;
    if (phase === 'Phase 9 - Security') report.scores.security -= deduction;
    if (phase === 'Phase 10 - Performance') report.scores.performance -= deduction;
    if (phase === 'Phase 11 - Documentation') report.scores.documentation -= deduction;
}

function scanDir(dir, extension, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            scanDir(filePath, extension, fileList);
        } else if (filePath.endsWith(extension)) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

// ─── PHASE 1: PORTAL ISOLATION AUDIT ──────────────────────────────────────────
function auditPortalIsolation() {
    const jsxFiles = scanDir(path.join(clientSrc, 'components'), '.jsx');
    jsxFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const filename = path.basename(file);
        
        let isAdmin = filename.includes('Admin') || file.includes('admin');
        let isDriver = filename.includes('Driver') || file.includes('driver');
        let isPassenger = !isAdmin && !isDriver; // Assuming others are passenger
        
        // Exclude generic components from strict passenger checking
        if (['Navbar.jsx', 'Layout.jsx', 'Home.jsx', 'ContactUs.jsx', 'Hero.jsx', 'LandingPage.jsx'].includes(filename)) {
            isPassenger = false;
        }

        const lines = content.split('\n');
        lines.forEach((line, i) => {
            if (line.startsWith('import ')) {
                if (isPassenger && (line.includes('Driver') || line.includes('Admin')) && !line.includes('DriverRegister')) {
                    addViolation('Phase 1 - Portal Isolation', 'High', file, `Passenger component imports ${line.trim()}`, 'Move shared logic to generic component or duplicate if distinct', 'Medium');
                }
                if (isDriver && (line.includes('Passenger') || line.includes('Admin'))) {
                    addViolation('Phase 1 - Portal Isolation', 'High', file, `Driver component imports ${line.trim()}`, 'Remove cross-portal import', 'Medium');
                }
                if (isAdmin && (line.includes('Passenger') || line.includes('Driver') && !line.includes('DriverManagement'))) {
                    addViolation('Phase 1 - Portal Isolation', 'High', file, `Admin component imports ${line.trim()}`, 'Remove cross-portal import', 'Medium');
                }
            }
        });
    });
}

// ─── PHASE 2: SHARED LOGIC & PHASE 8: SERVICE LAYER ──────────────────────────
function auditBackendLogic() {
    const routesDir = path.join(serverSrc, 'routes');
    const routeFiles = scanDir(routesDir, '.js');
    
    routeFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('const newRide = new Ride') || content.includes('Ride.findByIdAndUpdate(') || content.includes('Wallet.updateOne')) {
            addViolation('Phase 8 - Service Layer', 'Medium', file, 'Business logic/DB calls inside route handler', 'Extract logic to dedicated Service class', 'Low');
        }
    });

    const serverFile = path.join(serverSrc, 'server.js');
    if (fs.existsSync(serverFile)) {
        const content = fs.readFileSync(serverFile, 'utf8');
        if (content.includes('app.post(') || content.includes('app.get(')) {
            // Count direct routes in server.js
            const routeCount = (content.match(/app\.(post|get|put|delete)\(/g) || []).length;
            if (routeCount > 5) {
                addViolation('Phase 8 - Service Layer', 'High', serverFile, `${routeCount} direct routes in server.js`, 'Move all routes to dedicated files in src/routes', 'Low');
            }
        }
    }
}

// ─── PHASE 3 & 9: API AND SECURITY ──────────────────────────────────────────
function auditSecurity() {
    const routesDir = path.join(serverSrc, 'routes');
    const routeFiles = scanDir(routesDir, '.js');
    
    routeFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('router.post(') || content.includes('router.put(')) {
            if (!content.includes('authMiddleware') && !file.includes('authRoutes')) {
                addViolation('Phase 9 - Security', 'High', file, 'Route modifying data without authMiddleware', 'Add authMiddleware to protect endpoint', 'High');
            }
        }
    });
}

// ─── PHASE 4: DATABASE ──────────────────────────────────────────────────────
function auditDatabase() {
    const modelsDir = path.join(serverSrc, 'models');
    const modelFiles = scanDir(modelsDir, '.js');
    
    modelFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        if (!content.includes('timestamps: true')) {
            addViolation('Phase 4 - Database', 'Medium', file, 'Schema missing timestamps', 'Add { timestamps: true } to schema options', 'Low');
        }
    });
}

// Run audits
auditPortalIsolation();
auditBackendLogic();
auditSecurity();
auditDatabase();

fs.writeFileSync('audit_report.json', JSON.stringify(report, null, 2));
console.log("Audit complete. Report generated at audit_report.json");
