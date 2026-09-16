import fs from 'fs';

const src = fs.readFileSync('src/App.jsx', 'utf8').replace(/\r\n/g, '\n').split('\n');
const grab = (a, b) => src.slice(a - 1, b).join('\n');

fs.writeFileSync('tmp_onboarding.jsx', grab(971, 1818));
fs.writeFileSync('tmp_shell_start.jsx', grab(1824, 2176));
fs.writeFileSync('tmp_montar.jsx', grab(2234, 2641));
fs.writeFileSync('tmp_pedidos.jsx', grab(2648, 2769));
fs.writeFileSync('tmp_turno.jsx', grab(2774, 2909));
fs.writeFileSync('tmp_freelas.jsx', grab(2911, 3068));
fs.writeFileSync('tmp_kanban.jsx', grab(3072, 3265));
fs.writeFileSync('tmp_relatorios.jsx', grab(3267, 3444));
fs.writeFileSync('tmp_aprovacao.jsx', grab(3449, 3603));
console.log('extracted');
