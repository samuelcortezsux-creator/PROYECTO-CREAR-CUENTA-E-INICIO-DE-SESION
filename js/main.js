/* ================================================
EXPRESIONES REGULARES Y SU EXPLICACIÓN
================================================

1. CORREO ELECTRÓNICO: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    - ^ : inicio de la cadena
    - [a-zA-Z0-9._%+-]+ : uno o más caracteres alfanuméricos o símbolos permitidos antes del @
    - @ : símbolo arroba obligatorio
    - [a-zA-Z0-9.-]+ : dominio (ejemplo: gmail, yahoo)
    - \. : punto literal
    - [a-zA-Z]{2,} : extensión del dominio (com, es, org) mínimo 2 letras
    - $ : fin de la cadena

2. NOMBRE: /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/
    - Solo permite letras (mayúsculas y minúsculas)
    - Incluye vocales acentuadas y ñ
    - Permite espacios para nombres compuestos

3. CONTRASEÑA SEGURA: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/
    - (?=.*[a-z]) : debe contener al menos una letra minúscula
    - (?=.*[A-Z]) : debe contener al menos una letra mayúscula
    - (?=.*\d) : debe contener al menos un dígito
    - (?=.*[\W_]) : debe contener al menos un carácter especial
    - .{6,} : longitud mínima de 6 caracteres

4. CELULAR: /^[0-9]{7,12}$/
    - Solo números del 0-9
    - Entre 7 y 12 dígitos
*/

// ================================================
// EXPRESIONES REGULARES
// ================================================

const regex = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    name: /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/,
    phone: /^[0-9]{7,12}$/
};

// ================================================
// SISTEMA DE ALMACENAMIENTO (LocalStorage)
// ================================================
// Simula una base de datos usando el almacenamiento del navegador
// Los datos persisten incluso después de cerrar la página

let users = JSON.parse(localStorage.getItem('users')) || [];
let loginAttempts = JSON.parse(localStorage.getItem('loginAttempts')) || {};

// ================================================
// FUNCIONES AUXILIARES
// ================================================

/**
 * Cambia entre módulos (registro, login, recuperación)
 * @param {string} moduleName - Nombre del módulo a mostrar
 */
function showModule(moduleName) {
    document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
    document.getElementById(moduleName + 'Module').classList.add('active');
    clearMessages();
}

/**
 * Limpia todos los mensajes de error y validación
 */
function clearMessages() {
    document.querySelectorAll('.message').forEach(m => {
        m.classList.remove('show');
        m.textContent = '';
    });
    document.querySelectorAll('.error-message').forEach(e => e.classList.remove('show'));
    document.querySelectorAll('input').forEach(i => {
        i.classList.remove('error', 'success');
    });
}

/**
 * Muestra un mensaje al usuario
 * @param {string} elementId - ID del elemento donde mostrar el mensaje
 * @param {string} message - Texto del mensaje
 * @param {string} type - Tipo de mensaje (success, error, warning)
 */
function showMessage(elementId, message, type) {
    const msgElement = document.getElementById(elementId);
    msgElement.textContent = message;
    msgElement.className = 'message show ' + type;
}

// ================================================
// MÓDULO 1: REGISTRO DE CUENTA
// ================================================
// Valida todos los campos con expresiones regulares
// Almacena el nuevo usuario en localStorage

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    clearMessages();

    // Obtener valores de los campos
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('registerPassword').value;

    let isValid = true;

    // Validar nombre con regex
    if (!regex.name.test(fullName)) {
        document.getElementById('fullName').classList.add('error');
        document.getElementById('nameError').classList.add('show');
        isValid = false;
    } else {
        document.getElementById('fullName').classList.add('success');
    }

    // Validar email con regex
    if (!regex.email.test(email)) {
        document.getElementById('registerEmail').classList.add('error');
        document.getElementById('emailError').classList.add('show');
        isValid = false;
    } else {
        // Verificar si el email ya existe en el sistema
        if (users.find(u => u.email === email)) {
            showMessage('registerMessage', 'Este correo ya está registrado', 'error');
            isValid = false;
        } else {
            document.getElementById('registerEmail').classList.add('success');
        }
    }

    // Validar teléfono con regex
    if (!regex.phone.test(phone)) {
        document.getElementById('phone').classList.add('error');
        document.getElementById('phoneError').classList.add('show');
        isValid = false;
    } else {
        document.getElementById('phone').classList.add('success');
    }

    // Validar contraseña con regex (seguridad)
    if (!regex.password.test(password)) {
        document.getElementById('registerPassword').classList.add('error');
        document.getElementById('passwordError').classList.add('show');
        isValid = false;
    } else {
        document.getElementById('registerPassword').classList.add('success');
    }

    // Si todas las validaciones pasaron, crear la cuenta
    if (isValid) {
        // Crear objeto de nuevo usuario
        const newUser = {
            name: fullName,
            email: email,
            phone: phone,
            password: password,
            blocked: false  // Indica si la cuenta está bloqueada
        };

        // Agregar usuario al array y guardar en localStorage
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        showMessage('registerMessage', '¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.', 'success');
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
            this.reset();
            showModule('login');
        }, 2000);
    }
});

// ================================================
// MÓDULO 2: INICIO DE SESIÓN
// ================================================
// Valida credenciales y controla intentos fallidos
// Bloquea la cuenta después de 3 intentos incorrectos

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    clearMessages();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Buscar usuario en el sistema
    const user = users.find(u => u.email === email);

    if (!user) {
        showMessage('loginMessage', 'Usuario o contraseña incorrectos.', 'error');
        return;
    }

    // Verificar si la cuenta está bloqueada
    if (user.blocked) {
        showMessage('loginMessage', 'Cuenta bloqueada por intentos fallidos.', 'error');
        document.getElementById('recoverLink').style.display = 'block';
        return;
    }

    // Validar contraseña
    if (user.password === password) {
        // ✅ Login exitoso
        loginAttempts[email] = 0;
        localStorage.setItem('loginAttempts', JSON.stringify(loginAttempts));
        
        showMessage('loginMessage', `¡Bienvenido al sistema, ${user.name}!`, 'success');
        this.reset();
    } else {
        // ❌ Contraseña incorrecta - incrementar intentos
        loginAttempts[email] = (loginAttempts[email] || 0) + 1;
        localStorage.setItem('loginAttempts', JSON.stringify(loginAttempts));

        const remainingAttempts = 3 - loginAttempts[email];
        
        if (loginAttempts[email] >= 3) {
            // Bloquear cuenta después de 3 intentos fallidos
            const userIndex = users.findIndex(u => u.email === email);
            users[userIndex].blocked = true;
            localStorage.setItem('users', JSON.stringify(users));
            
            showMessage('loginMessage', 'Cuenta bloqueada por intentos fallidos.', 'error');
            document.getElementById('recoverLink').style.display = 'block';
        } else {
            showMessage('loginMessage', 'Usuario o contraseña incorrectos.', 'error');
            document.getElementById('attemptsInfo').textContent = 
                `Intentos restantes: ${remainingAttempts}`;
        }
    }
});

// ================================================
// MÓDULO 3: RECUPERACIÓN DE CONTRASEÑA
// ================================================
// Permite crear una nueva contraseña
// Desbloquea la cuenta y reinicia los intentos fallidos

document.getElementById('recoverForm').addEventListener('submit', function(e) {
    e.preventDefault();
    clearMessages();

    const email = document.getElementById('recoverEmail').value.trim();
    const newPassword = document.getElementById('newPassword').value;

    let isValid = true;

    // Validar email con regex
    if (!regex.email.test(email)) {
        document.getElementById('recoverEmail').classList.add('error');
        document.getElementById('recoverEmailError').classList.add('show');
        isValid = false;
    }

    // Validar nueva contraseña con regex
    if (!regex.password.test(newPassword)) {
        document.getElementById('newPassword').classList.add('error');
        document.getElementById('newPasswordError').classList.add('show');
        isValid = false;
    }

    if (isValid) {
        // Buscar usuario en el sistema
        const userIndex = users.findIndex(u => u.email === email);

        if (userIndex === -1) {
            showMessage('recoverMessage', 'No se encontró una cuenta con este correo.', 'error');
            return;
        }

        // Actualizar contraseña y desbloquear cuenta
        users[userIndex].password = newPassword;
        users[userIndex].blocked = false;
        localStorage.setItem('users', JSON.stringify(users));

        // Reiniciar intentos fallidos a 0
        loginAttempts[email] = 0;
        localStorage.setItem('loginAttempts', JSON.stringify(loginAttempts));

        showMessage('recoverMessage', 
            'Contraseña actualizada. Ahora puede iniciar sesión.', 'success');

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
            this.reset();
            showModule('login');
        }, 2000);
    }
});

// ================================================
// FUNCIONALIDAD: MOSTRAR/OCULTAR CONTRASEÑA
// ================================================
// Permite al usuario ver la contraseña mientras la escribe

document.getElementById('showRegisterPassword').addEventListener('change', function() {
    const passwordInput = document.getElementById('registerPassword');
    passwordInput.type = this.checked ? 'text' : 'password';
});

document.getElementById('showLoginPassword').addEventListener('change', function() {
    const passwordInput = document.getElementById('loginPassword');
    passwordInput.type = this.checked ? 'text' : 'password';
});

document.getElementById('showNewPassword').addEventListener('change', function() {
    const passwordInput = document.getElementById('newPassword');
    passwordInput.type = this.checked ? 'text' : 'password';
});