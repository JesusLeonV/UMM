const tabs = document.querySelectorAll('.tab');
const loginForm = document.getElementById('loginForm');
const registroForm = document.getElementById('registroForm');
const busquedaForm = document.getElementById('busquedaForm');
const vuelosLista = document.getElementById('vuelosLista');
const reservasLista = document.getElementById('reservasLista');
const usuarioActivo = document.getElementById('usuarioActivo');
const modalReserva = document.getElementById('modalReserva');
const modalVuelo = document.getElementById('modalVuelo');
const reservaForm = document.getElementById('reservaForm');
const cerrarModal = document.getElementById('cerrarModal');
const limpiarBusqueda = document.getElementById('limpiarBusqueda');
const loginMensaje = document.getElementById('loginMensaje');
const registroMensaje = document.getElementById('registroMensaje');
const reservaMensaje = document.getElementById('reservaMensaje');

let usuario = JSON.parse(localStorage.getItem('aerovistaUsuario')) || null;
let vueloSeleccionado = null;

function mensaje(elemento, texto, tipo = 'error') {
    elemento.textContent = texto;
    elemento.className = `message ${tipo}`;
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function actualizarUsuario() {
    usuarioActivo.textContent = usuario ? usuario.nombre : 'Invitado';
}

function activarTab(tab) {
    tabs.forEach(item => item.classList.toggle('active', item.dataset.tab === tab));
    loginForm.classList.toggle('active-form', tab === 'login');
    registroForm.classList.toggle('active-form', tab === 'registro');
}

async function pedirJson(url, opciones = {}) {
    const respuesta = await fetch(url, opciones);
    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Ocurrio un error');
    }

    return datos;
}

function tarjetaVuelo(vuelo) {
    const card = document.createElement('div');
    card.className = 'flight-card';
    card.innerHTML = `
        <div class="flight-top">
            <span>${vuelo.codigo}</span>
            <strong>$${vuelo.precio}</strong>
        </div>
        <div class="route">
            <div><b>${vuelo.origen}</b><small>Origen</small></div>
            <div class="plane-line"></div>
            <div><b>${vuelo.destino}</b><small>Destino</small></div>
        </div>
        <div class="flight-meta">
            <span>${vuelo.fecha}</span>
            <span>${vuelo.hora}</span>
            <span>${vuelo.asientos} asientos</span>
            <span>${vuelo.estado}</span>
        </div>
        <button ${vuelo.asientos < 1 ? 'disabled' : ''}>Reservar</button>
    `;

    card.querySelector('button').addEventListener('click', () => abrirReserva(vuelo));
    return card;
}

async function cargarVuelos(params = '') {
    vuelosLista.innerHTML = '<div class="empty">Cargando vuelos...</div>';
    const datos = await pedirJson(`/api/vuelos${params}`);
    vuelosLista.innerHTML = '';

    if (!datos.vuelos.length) {
        vuelosLista.innerHTML = '<div class="empty">No encontramos vuelos para esa busqueda.</div>';
        return;
    }

    datos.vuelos.forEach(vuelo => vuelosLista.appendChild(tarjetaVuelo(vuelo)));
}

async function cargarReservas() {
    if (!usuario) {
        reservasLista.className = 'reservations empty';
        reservasLista.textContent = 'Inicia sesion para ver tus reservas.';
        return;
    }

    const datos = await pedirJson(`/api/reservas/${usuario.id}`);
    reservasLista.className = 'reservations';
    reservasLista.innerHTML = '';

    if (!datos.reservas.length) {
        reservasLista.className = 'reservations empty';
        reservasLista.textContent = 'Todavia no tienes reservas confirmadas.';
        return;
    }

    datos.reservas.forEach(reserva => {
        const item = document.createElement('div');
        item.className = 'reservation-card';
        item.innerHTML = `
            <strong>${reserva.codigo}</strong>
            <span>${reserva.vuelo.origen} a ${reserva.vuelo.destino}</span>
            <span>${reserva.pasajeros} pasajero(s)</span>
            <b>$${reserva.total}</b>
        `;
        reservasLista.appendChild(item);
    });
}

function abrirReserva(vuelo) {
    if (!usuario) {
        activarTab('login');
        mensaje(loginMensaje, 'Inicia sesion antes de reservar');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    vueloSeleccionado = vuelo;
    modalVuelo.textContent = `${vuelo.codigo}: ${vuelo.origen} a ${vuelo.destino} por $${vuelo.precio}`;
    reservaMensaje.textContent = '';
    modalReserva.classList.remove('hidden');
}

tabs.forEach(tab => tab.addEventListener('click', () => activarTab(tab.dataset.tab)));

registroForm.addEventListener('submit', async evento => {
    evento.preventDefault();
    const nombre = document.getElementById('registroNombre').value.trim();
    const email = document.getElementById('registroEmail').value.trim();
    const contrasena = document.getElementById('registroContrasena').value;

    if (nombre.length < 3) return mensaje(registroMensaje, 'El nombre debe tener minimo 3 caracteres');
    if (!validarEmail(email)) return mensaje(registroMensaje, 'Ingresa un correo valido');
    if (contrasena.length < 6) return mensaje(registroMensaje, 'La contrasena debe tener minimo 6 caracteres');

    try {
        const datos = await pedirJson('/api/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, contrasena })
        });
        usuario = datos.usuario;
        localStorage.setItem('aerovistaUsuario', JSON.stringify(usuario));
        registroForm.reset();
        actualizarUsuario();
        await cargarReservas();
        mensaje(registroMensaje, 'Cuenta creada correctamente', 'success');
    } catch (error) {
        mensaje(registroMensaje, error.message);
    }
});

loginForm.addEventListener('submit', async evento => {
    evento.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const contrasena = document.getElementById('loginContrasena').value;

    if (!validarEmail(email)) return mensaje(loginMensaje, 'Ingresa un correo valido');
    if (!contrasena) return mensaje(loginMensaje, 'Ingresa tu contrasena');

    try {
        const datos = await pedirJson('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, contrasena })
        });
        usuario = datos.usuario;
        localStorage.setItem('aerovistaUsuario', JSON.stringify(usuario));
        loginForm.reset();
        actualizarUsuario();
        await cargarReservas();
        mensaje(loginMensaje, 'Sesion iniciada', 'success');
    } catch (error) {
        mensaje(loginMensaje, error.message);
    }
});

busquedaForm.addEventListener('submit', evento => {
    evento.preventDefault();
    const origen = document.getElementById('origen').value.trim();
    const destino = document.getElementById('destino').value.trim();
    const params = new URLSearchParams({ origen, destino }).toString();
    cargarVuelos(`?${params}`);
});

limpiarBusqueda.addEventListener('click', () => {
    busquedaForm.reset();
    cargarVuelos();
});

cerrarModal.addEventListener('click', () => modalReserva.classList.add('hidden'));

reservaForm.addEventListener('submit', async evento => {
    evento.preventDefault();
    const pasajeros = Number(document.getElementById('pasajeros').value);

    if (!vueloSeleccionado) return;
    if (!Number.isInteger(pasajeros) || pasajeros < 1) return mensaje(reservaMensaje, 'Ingresa una cantidad valida');

    try {
        await pedirJson('/api/reservas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuarioId: usuario.id, vueloId: vueloSeleccionado.id, pasajeros })
        });
        modalReserva.classList.add('hidden');
        reservaForm.reset();
        document.getElementById('pasajeros').value = 1;
        await cargarVuelos();
        await cargarReservas();
    } catch (error) {
        mensaje(reservaMensaje, error.message);
    }
});

actualizarUsuario();
cargarVuelos();
cargarReservas();
