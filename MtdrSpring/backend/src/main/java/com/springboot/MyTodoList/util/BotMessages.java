package com.springboot.MyTodoList.util;

public enum BotMessages {

    HELLO_MYTODO_BOT(
        "🎉 ¡Bienvenido a MyTodoList Bot! 🎉\n\n" +
        "Esta es tu aplicación personal de gestión de tareas y usuarios a través de Telegram.\n\n" +
        "📋 COMANDOS DISPONIBLES:\n\n" +
        "🔹 TAREAS (Task):\n" +
        "/todolist - Ver todas tus tareas\n" +
        "/additem - Agregar nueva tarea completa\n" +
        "• También puedes escribir directamente el texto de tu tarea\n\n" +
        "👥 USUARIOS:\n" +
        "/users - Ver lista de usuarios registrados\n" +
        "/adduser - Registrar nuevo usuario\n" +
        "/userby username <nombre> - Buscar por nombre de usuario\n" +
        "/userby email <email> - Buscar por correo electrónico\n" +
        "/status <active|inactive> - Filtrar usuarios por estado\n" +
        "/me - Vincular tu chat con tu usuario\n\n" +
        "⚙️ NAVEGACIÓN:\n" +
        "/start - Mostrar este menú principal\n" +
        "/hide - Ocultar el teclado\n\n" +
        "💡 CONSEJOS:\n" +
        "• Usa los botones del teclado para navegación rápida\n" +
        "• Para agregar usuarios, usa el formato:\n" +
        "  username,email,nombre,teléfono,contraseña,estado\n" +
        "• Los comandos funcionan escribiéndolos o usando los botones\n\n" +
        "¡Selecciona una opción del teclado para comenzar!"
    ),
    BOT_REGISTERED_STARTED("Bot registered and started successfully!"),
    ITEM_DONE("✅ ¡Tarea completada! Selecciona /todolist para ver tus tareas, o /start para ir al menú principal."),
    ITEM_UNDONE("🔄 Tarea marcada como pendiente. Selecciona /todolist para ver tus tareas, o /start para ir al menú principal."),
    ITEM_DELETED("🗑️ ¡Tarea eliminada! Selecciona /todolist para ver tus tareas, o /start para ir al menú principal."),
    TYPE_NEW_TODO_ITEM(
        "📝 **CREAR NUEVA TAREA COMPLETA**\n\n" +
        "Escribe los datos de la tarea en el siguiente formato (separados por comas):\n\n" +
        "**Formato:**\n" +
        "`titulo,descripcion,storyId,teamId,priority,status,estimatedHours,startDate,endDate`\n\n" +
        "📋 **Ejemplo:**\n" +
        "`Desarrollar login,Crear pantalla de login con validación,1,2,1,todo,8.5,2025-10-10,2025-10-15`\n\n" +
        "📌 **Campos obligatorios:**\n" +
        "• titulo (texto)\n" +
        "• storyId (número)\n" +
        "• teamId (número)\n\n" +
        "📌 **Campos opcionales (usa 'null' si no aplican):**\n" +
        "• descripcion\n" +
        "• priority (0=baja, 1=media, 2=alta)\n" +
        "• status (todo, in-progress, done)\n" +
        "• estimatedHours (horas estimadas)\n" +
        "• startDate (YYYY-MM-DD)\n" +
        "• endDate (YYYY-MM-DD)\n\n" +
        "✍️ **Escribe tu tarea ahora:**"
    ),
    NEW_ITEM_ADDED("✅ ¡Nueva tarea creada exitosamente! 🎉"),
    TASK_CREATED_DETAILS("📋 **TAREA CREADA:**\n\n"),
    BYE("👋 ¡Hasta pronto! Selecciona /start cuando quieras continuar."),
    
    // Mensajes para AppUser - mejorados
    USERS_TITLE("👥 USUARIOS REGISTRADOS"),
    TYPE_NEW_USER("👤 Para registrar un nuevo usuario, escribe los datos en este formato:\n\n📝 username,email,nombre completo,teléfono,contraseña,estado\n\n📋 Ejemplo:\n🔸 juan123,juan@email.com,Juan Pérez,5551234567,mipassword,active"),
    USER_CREATED("✅ ¡Usuario creado exitosamente! 🎉\nSelecciona /users para ver la lista de usuarios, o /start para ir al menú principal."),
    USER_DELETED("🗑️ Usuario eliminado correctamente. Selecciona /users para ver la lista actualizada, o /start para ir al menú principal."),
    USER_NOT_FOUND("❌ Usuario no encontrado. Verifica que el nombre de usuario o email sean correctos."),
    DUPLICATE_USER("⚠️ Error: Ya existe un usuario con ese nombre de usuario o correo electrónico. Por favor, usa datos únicos."),
    TYPE_YOUR_USERNAME("👋 Escribe tu nombre de usuario para vincularlo con este chat:"),

    // NUEVOS MENSAJES PARA LOGIN/AUTENTICACIÓN
    LOGIN_REQUIRED(
        "🔐 **INICIO DE SESIÓN REQUERIDO**\n\n" +
        "Para usar MyTodoList Bot, primero debes iniciar sesión.\n\n" +
        "👤 **Escribe tu nombre de usuario:**"
    ),
    LOGIN_ENTER_PASSWORD("🔑 **Ahora escribe tu contraseña:**"),
    LOGIN_SUCCESS(
        "✅ **¡INICIO DE SESIÓN EXITOSO!**\n\n" +
        "👤 **Datos de tu cuenta:**\n\n" +
        "🆔 **ID:** {ID}\n" +
        "👤 **Usuario:** {USERNAME}\n" +
        "📧 **Email:** {EMAIL}\n" +
        "📝 **Nombre:** {FULLNAME}\n" +
        "📱 **Teléfono:** {PHONE}\n" +
        "📊 **Estado:** {STATUS}\n\n" +
        "🎉 **¡Bienvenido de nuevo!** Ahora puedes usar todos los comandos del bot.\n" +
        "Usa /start para ver el menú principal."
    ),
    LOGIN_FAILED("❌ **Error de autenticación**\n\nUsuario o contraseña incorrectos. Inténtalo de nuevo escribiendo tu usuario."),
    NOT_AUTHENTICATED("🔒 **Acceso denegado**\n\nDebes iniciar sesión antes de usar este comando.\nEscribe tu usuario para comenzar."),
    LOGOUT_SUCCESS("👋 **Sesión cerrada**\n\nHasta pronto. Escribe tu usuario cuando quieras volver a ingresar.");

    private String message;

    BotMessages(String enumMessage) {
        this.message = enumMessage;
    }

    public String getMessage() {
        return message;
    }
}