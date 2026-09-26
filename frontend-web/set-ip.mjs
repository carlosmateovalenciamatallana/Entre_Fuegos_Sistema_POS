import os from 'os';
import fs from 'fs';
import path from 'path';
import qrcode from 'qrcode-terminal';

// 1. Detectar la IP de la máquina (Hotspot, WiFi, etc.)
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const ip = getLocalIP();
const envPath = path.join(process.cwd(), '.env.local');

// 2. Actualizar el archivo .env.local para el Backend (Puerto 3000)
let envContent = '';
if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent
        .split('\n')
        .filter(line => !line.startsWith('NEXT_PUBLIC_API_URL='))
        .join('\n');
}

const newLine = `NEXT_PUBLIC_API_URL=http://${ip}:3000`;
envContent = envContent ? `${envContent.trim()}\n${newLine}\n` : `${newLine}\n`;
fs.writeFileSync(envPath, envContent);

// 3. Generar el QR para el Frontend (Puerto 3001)
const frontendUrl = `http://${ip}:3001`;

console.log(`\n🔥 [ENTRE FUEGOS - SISTEMA INICIADO] 🔥`);
console.log(`📡 Conectando Backend en: http://${ip}:3000`);
console.log(`📱 Escanea este QR para abrir el POS en los celulares:\n`);

// Dibujamos el QR en la consola
qrcode.generate(frontendUrl, { small: true });

console.log(`\n(O ingresa manualmente a: ${frontendUrl})\n`);