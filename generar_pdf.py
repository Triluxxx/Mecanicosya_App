#!/usr/bin/env python3
"""Genera PDF de documentación de MecánicosYa"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)
from reportlab.platypus.flowables import KeepTogether
import os

OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "MecanicosYa-Documentacion.pdf")

# ── Colors ──
ORANGE = HexColor("#FF6B35")
DARK = HexColor("#111827")
GRAY = HexColor("#9CA3AF")
GREEN = HexColor("#10B981")
WHITE = white
LIGHT_GRAY = HexColor("#F3F4F6")

# ── Styles ──
styles = getSampleStyleSheet()

title_style = ParagraphStyle('Title2', parent=styles['Title'], fontSize=26, textColor=ORANGE, spaceAfter=6)
h1_style = ParagraphStyle('H1', parent=styles['Heading1'], fontSize=18, textColor=ORANGE, spaceBefore=20, spaceAfter=8)
h2_style = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=14, textColor=DARK, spaceBefore=14, spaceAfter=6)
h3_style = ParagraphStyle('H3', parent=styles['Heading3'], fontSize=12, textColor=ORANGE, spaceBefore=10, spaceAfter=4)
normal = ParagraphStyle('Normal2', parent=styles['Normal'], fontSize=10, leading=14, textColor=HexColor("#1F2937"))
code_style = ParagraphStyle('Code', parent=styles['Normal'], fontSize=9, fontName='Courier', leading=12, textColor=HexColor("#374151"), leftIndent=20)
bullet = ParagraphStyle('Bullet', parent=normal, leftIndent=20, bulletIndent=10, spaceBefore=2, spaceAfter=2)
green_style = ParagraphStyle('Green', parent=normal, textColor=GREEN)

def hr():
    return HRFlowable(width="100%", thickness=1, color=ORANGE, spaceAfter=10, spaceBefore=10)

def make_table(headers, rows, col_widths=None):
    data = [headers] + rows
    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ORANGE),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_GRAY),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#D1D5DB")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [LIGHT_GRAY, WHITE]),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]))
    return t

def tag(label, color=GREEN):
    return f'<font color="{color}"><b>{label}</b></font>'

def build_pdf():
    story = []

    # ── Cover ──
    story.append(Spacer(1, 3*cm))
    story.append(Paragraph("MecánicosYa", title_style))
    story.append(Paragraph("Documentación Técnica del Proyecto", h2_style))
    story.append(Paragraph("Plataforma de mecánicos de motos a domicilio", ParagraphStyle('Sub', parent=normal, fontSize=12, textColor=GRAY)))
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph("Versión 1.0 · Expo SDK 54 · React Native 0.81", normal))
    story.append(Paragraph("Mayo 2026", normal))
    story.append(Spacer(1, 1*cm))
    story.append(hr())

    # ── Índice ──
    story.append(Paragraph("Índice", h1_style))
    story.append(Paragraph("1. Arquitectura del proyecto", normal))
    story.append(Paragraph("2. Flujo de autenticación", normal))
    story.append(Paragraph("3. Base de datos local (AsyncStorage)", normal))
    story.append(Paragraph("4. Pantallas de autenticación", normal))
    story.append(Paragraph("5. Pantallas del cliente", normal))
    story.append(Paragraph("6. Pantallas del mecánico", normal))
    story.append(Paragraph("7. Pantallas compartidas", normal))
    story.append(Paragraph("8. Usuarios demo precargados", normal))
    story.append(Paragraph("9. Componentes reutilizables", normal))
    story.append(Paragraph("10. Sistema de diseño (theme)", normal))
    story.append(Paragraph("11. Build & despliegue", normal))
    story.append(PageBreak())

    # ── 1. Arquitectura ──
    story.append(Paragraph("1. Arquitectura del proyecto", h1_style))
    story.append(Paragraph("El proyecto sigue una arquitectura limpia (Clean Architecture) con 3 capas:", normal))
    story.append(Paragraph(f"• <b>data/</b> — Acceso a datos (AsyncStorage, repositorios)", bullet))
    story.append(Paragraph(f"• <b>domain/</b> — Entidades e interfaces (legacy, mantenido por compatibilidad)", bullet))
    story.append(Paragraph(f"• <b>presentation/</b> — UI: pantallas, componentes, navegación, tema", bullet))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("Estructura de archivos:", h2_style))
    story.append(Paragraph("""<font face="Courier" size="8">
src/<br/>
├── data/local/<br/>
│   └── Database.ts          ← BD local con AsyncStorage<br/>
├── store/<br/>
│   ├── useAuthStore.ts      ← Auth (login, registro, sesión)<br/>
│   └── useAppStore.ts       ← Estado global (legacy)<br/>
└── presentation/<br/>
    ├── components/           ← Componentes reutilizables<br/>
    │   ├── MechanicCard.tsx<br/>
    │   ├── SOSButton.tsx<br/>
    │   ├── StarRating.tsx<br/>
    │   └── Logo.tsx<br/>
    ├── navigation/<br/>
    │   ├── types.ts          ← Tipos de rutas<br/>
    │   └── AppNavigator.tsx  ← Navegación con auth flow<br/>
    └── screens/<br/>
        ├── auth/             ← Login, OTP, Registro<br/>
        ├── client/           ← Home, Historial, Perfil<br/>
        ├── mechanic/         ← Panel, Historial, Perfil<br/>
        └── (compartidas)     ← SOS, Tracking, Pago, Reseña<br/>
</font>""", code_style))
    story.append(PageBreak())

    # ── 2. Flujo de autenticación ──
    story.append(Paragraph("2. Flujo de autenticación", h1_style))
    story.append(Paragraph("El sistema usa autenticación por número de teléfono con OTP simulado:", normal))
    story.append(Paragraph("""<font face="Courier" size="8">
App abre → ¿Hay sesión guardada?<br/>
  ├─ NO  → LoginScreen (ingresa teléfono)<br/>
  │         └─ OTPScreen (código 6 dígitos)<br/>
  │              ├─ Usuario NUEVO → RegisterScreen<br/>
  │              │    ├─ Elige rol: Cliente 🏍️ o Mecánico 🔧<br/>
  │              │    └─ Si mecánico → MechanicRegisterScreen<br/>
  │              └─ Usuario EXISTENTE → App principal<br/>
  └─ SÍ  → App según rol<br/>
            ├─ Cliente → ClientTabs<br/>
            └─ Mecánico → MechanicTabs<br/>
</font>""", code_style))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("Estados de Zustand:", h2_style))
    story.append(Paragraph("• <b>isLoading</b> — Pantalla de splash mientras carga", bullet))
    story.append(Paragraph("• <b>isAuthenticated</b> — Si hay sesión activa", bullet))
    story.append(Paragraph("• <b>isMechanic</b> — Determina qué tabs mostrar", bullet))
    story.append(Paragraph("• <b>user</b> — Datos completos del usuario logueado", bullet))
    story.append(PageBreak())

    # ── 3. Base de datos ──
    story.append(Paragraph("3. Base de datos local (AsyncStorage)", h1_style))
    story.append(Paragraph("Se usa AsyncStorage como BD clave-valor. Cada tabla es una clave con un array JSON.", normal))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("Tablas:", h2_style))

    story.append(make_table(
        ['Clave', 'Tipo', 'Descripción'],
        [
            ['@mecanicosya:users', 'User[]', 'Usuarios (clientes + mecánicos)'],
            ['@mecanicosya:requests', 'ServiceRequest[]', 'Solicitudes de servicio'],
            ['@mecanicosya:currentUser', 'User', 'Sesión activa (un solo objeto)'],
            ['@mecanicosya:otpCodes', '{phone, code, expiresAt}', 'Códigos OTP temporales'],
        ],
        [5*cm, 4*cm, 7*cm]
    ))

    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("Modelo de Usuario:", h2_style))
    story.append(Paragraph("""<font face="Courier" size="8">
interface User {<br/>
  id, phone, role ('client'|'mechanic'), name, email, photo<br/>
  // Cliente<br/>
  vehicle: string  (moto)<br/>
  // Mecánico<br/>
  ruc, verified, specialties[], yearsExperience, pricePerHour<br/>
  bio, vehicleTypes[], latitude, longitude<br/>
  status ('online'|'offline'|'busy')<br/>
  rating, totalReviews, totalServices, createdAt<br/>
}<br/>
</font>""", code_style))

    story.append(Paragraph("Modelo de ServiceRequest:", h2_style))
    story.append(Paragraph("""<font face="Courier" size="8">
interface ServiceRequest {<br/>
  id, userId, mechanicId, mechanicName, mechanicPhoto<br/>
  status, problemDescription, userLocation, userAddress<br/>
  estimatedCost, finalCost, paymentMethod, paymentStatus<br/>
  rating, review, createdAt, completedAt<br/>
}<br/>
</font>""", code_style))

    story.append(Paragraph("Funciones principales:", h2_style))
    story.append(Paragraph("• findUserByPhone / findUserById → búsqueda por teléfono o ID", bullet))
    story.append(Paragraph("• createUser / updateUser → registro y edición", bullet))
    story.append(Paragraph("• getAvailableMechanics → mecánicos con status='online'", bullet))
    story.append(Paragraph("• createRequest / updateRequest / getHistory → ciclo de vida del servicio", bullet))
    story.append(Paragraph("• generateOTP / verifyOTP → autenticación mock (código visible en UI)", bullet))
    story.append(Paragraph("• seedDemoMechanics → precarga 5 mecánicos iniciales", bullet))
    story.append(PageBreak())

    # ── 4. Pantallas de autenticación ──
    story.append(Paragraph("4. Pantallas de autenticación", h1_style))

    story.append(Paragraph("LoginScreen", h2_style))
    story.append(Paragraph("• Input de teléfono con formato +591 XXX XXXXX", bullet))
    story.append(Paragraph("• Botones rápidos: Cliente demo (70000001) / Mecánico demo (70011111)", bullet))
    story.append(Paragraph("• Llama a sendOTP() → genera código y navega a OTP", bullet))

    story.append(Paragraph("OTPScreen", h2_style))
    story.append(Paragraph("• 6 inputs individuales para el código", bullet))
    story.append(Paragraph("• Auto-submit al completar los 6 dígitos", bullet))
    story.append(Paragraph("• Banner mostrando el código (simula SMS para pruebas)", bullet))
    story.append(Paragraph("• Botón reenviar con countdown de 30s", bullet))
    story.append(Paragraph("• Si usuario nuevo → RegisterScreen / si existe → App principal", bullet))

    story.append(Paragraph("RegisterScreen", h2_style))
    story.append(Paragraph("• Selector de rol: Cliente 🏍️ / Mecánico 🔧", bullet))
    story.append(Paragraph("• Campo nombre completo", bullet))
    story.append(Paragraph("• Si es cliente: campo modelo de moto", bullet))
    story.append(Paragraph("• Si es mecánico: navega a MechanicRegisterScreen", bullet))

    story.append(Paragraph("MechanicRegisterScreen", h2_style))
    story.append(Paragraph("• RUC opcional → si se ingresa, activa insignia verificada ✅", bullet))
    story.append(Paragraph("• Selección de especialidades (13 opciones: Motor 2T/4T, frenos, cadena, etc.)", bullet))
    story.append(Paragraph("• Tipos de moto que atiende (8 opciones: Deportiva, Naked, Scooter...)", bullet))
    story.append(Paragraph("• Años de experiencia + Precio por hora (Bs.)", bullet))
    story.append(Paragraph("• Bio / descripción", bullet))
    story.append(PageBreak())

    # ── 5. Cliente ──
    story.append(Paragraph("5. Pantallas del cliente", h1_style))

    story.append(Paragraph("ClientHomeScreen", h2_style))
    story.append(Paragraph("• Header con foto y logo", bullet))
    story.append(Paragraph("• Saludo personalizado + modelo de moto", bullet))
    story.append(Paragraph("• Botón SOS animado central → busca mecánicos cercanos", bullet))
    story.append(Paragraph("• Grid de problemas comunes (motor, eléctrico, llantas, batería)", bullet))
    story.append(Paragraph("• Último servicio completado", bullet))

    story.append(Paragraph("ClientHistoryScreen", h2_style))
    story.append(Paragraph("• Resumen: total servicios, dinero gastado, rating dado", bullet))
    story.append(Paragraph("• Lista de solicitudes con estado (completado/cancelado/pendiente)", bullet))
    story.append(Paragraph("• Botón calificar para servicios completados sin reseña", bullet))
    story.append(Paragraph("• Pull-to-refresh", bullet))

    story.append(Paragraph("ClientProfileScreen", h2_style))
    story.append(Paragraph("• Foto, nombre, teléfono, rol", bullet))
    story.append(Paragraph("• Edición inline de nombre y modelo de moto", bullet))
    story.append(Paragraph("• Menú: servicios, pagos, ayuda", bullet))
    story.append(Paragraph("• Cerrar sesión", bullet))
    story.append(PageBreak())

    # ── 6. Mecánico ──
    story.append(Paragraph("6. Pantallas del mecánico", h1_style))

    story.append(Paragraph("MechanicHomeScreen", h2_style))
    story.append(Paragraph("• Toggle Online/Offline (Switch) — actualiza estado en BD", bullet))
    story.append(Paragraph("• Stats: pendientes, completados, rating", bullet))
    story.append(Paragraph("• Lista de nuevas solicitudes con botones Aceptar / Rechazar", bullet))
    story.append(Paragraph("• Servicios activos con botón Marcar completado", bullet))
    story.append(Paragraph("• Auto-refresh cada 5 segundos", bullet))

    story.append(Paragraph("MechanicHistoryScreen", h2_style))
    story.append(Paragraph("• Total servicios completados, dinero ganado, rating", bullet))
    story.append(Paragraph("• Lista de servicios con estado, fecha y reseña recibida", bullet))

    story.append(Paragraph("MechanicProfileScreen", h2_style))
    story.append(Paragraph("• Insignia verificada ✅ si tiene RUC", bullet))
    story.append(Paragraph("• RUC visible en perfil", bullet))
    story.append(Paragraph("• Stats: servicios, rating, precio/hr", bullet))
    story.append(Paragraph("• Especialidades y tipos de moto (tags)", bullet))
    story.append(Paragraph("• Edición de nombre, precio/hr, bio", bullet))
    story.append(Paragraph("• Cerrar sesión", bullet))
    story.append(PageBreak())

    # ── 7. Compartidas ──
    story.append(Paragraph("7. Pantallas compartidas", h1_style))

    story.append(Paragraph("SOSScreen", h2_style))
    story.append(Paragraph("• Busca mecánicos disponibles desde BD (getAvailableMechanics)", bullet))
    story.append(Paragraph("• Mapa placeholder con ubicación", bullet))
    story.append(Paragraph("• Lista de mecánicos con MechanicCard", bullet))
    story.append(Paragraph("• Confirmación de solicitud con alerta", bullet))
    story.append(Paragraph("• Crea ServiceRequest en BD y navega a Tracking", bullet))

    story.append(Paragraph("MechanicDetailScreen", h2_style))
    story.append(Paragraph("• Perfil público del mecánico", bullet))
    story.append(Paragraph("• Insignia verificada si tiene RUC", bullet))
    story.append(Paragraph("• Especialidades, tipos de moto, reseñas simuladas", bullet))
    story.append(Paragraph("• Métricas: distancia, ETA, precio/hr", bullet))
    story.append(Paragraph("• Botón Solicitar ahora", bullet))

    story.append(Paragraph("TrackingScreen", h2_style))
    story.append(Paragraph("• Simula seguimiento en 5 pasos automáticos (4s c/u)", bullet))
    story.append(Paragraph("• ETA countdown", bullet))
    story.append(Paragraph("• Mapa placeholder animado", bullet))
    story.append(Paragraph("• Cancelar servicio (solo antes de 'en camino')", bullet))
    story.append(Paragraph("• Al completar → navega a Payment", bullet))

    story.append(Paragraph("PaymentScreen", h2_style))
    story.append(Paragraph("• Desglose: servicio + comisión 5% = total", bullet))
    story.append(Paragraph("• 3 métodos: Efectivo, Tarjeta, Transferencia", bullet))
    story.append(Paragraph("• Actualiza BD (status='completed', paymentStatus='paid')", bullet))
    story.append(Paragraph("• Opción de ir a Review o al inicio", bullet))

    story.append(Paragraph("ReviewScreen", h2_style))
    story.append(Paragraph("• Estrellas interactivas (1-5)", bullet))
    story.append(Paragraph("• Tags predefinidos (Puntual, Profesional, etc.)", bullet))
    story.append(Paragraph("• Comentario libre", bullet))
    story.append(Paragraph("• Guarda rating + review en BD", bullet))
    story.append(PageBreak())

    # ── 8. Usuarios demo ──
    story.append(Paragraph("8. Usuarios demo precargados", h1_style))
    story.append(Paragraph("Al iniciar la app por primera vez, se ejecuta seedDemoMechanics() que inserta:", normal))
    story.append(Spacer(1, 0.3*cm))

    story.append(make_table(
        ['Teléfono', 'Nombre', 'Especialidad', 'Precio/hr', 'RUC', 'Verificado'],
        [
            ['70011111', 'Carlos Mendoza', 'Motor, Transmisión', 'Bs. 80', 'Sí', tag('✓')],
            ['70022222', 'Roberto Flores', 'Electricidad, Diag.', 'Bs. 70', 'No', '✗'],
            ['70033333', 'Miguel Quispe', 'Llantas, Suspensión', 'Bs. 65', 'Sí', tag('✓')],
            ['70044444', 'Andrés Torrico', 'Motor 2T, Carburador', 'Bs. 55', 'No', '✗'],
            ['70055555', 'Jorge Vargas', 'Motor 4T, Inyección', 'Bs. 95', 'Sí', tag('✓')],
        ],
        [3*cm, 3.5*cm, 3.5*cm, 2*cm, 2*cm, 2*cm]
    ))

    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("Cliente demo: al ingresar 70000001 se crea un usuario nuevo (sin precarga).", normal))
    story.append(PageBreak())

    # ── 9. Componentes ──
    story.append(Paragraph("9. Componentes reutilizables", h1_style))

    story.append(Paragraph("MechanicCard", h2_style))
    story.append(Paragraph("• Tarjeta horizontal con foto, nombre, insignia verificada", bullet))
    story.append(Paragraph("• Rating con estrellas, años de experiencia", bullet))
    story.append(Paragraph("• Especialidades en tags naranjas", bullet))
    story.append(Paragraph("• Métricas: distancia, ETA, precio/hr", bullet))
    story.append(Paragraph("• Botón Solicitar opcional", bullet))
    story.append(Paragraph("• Prop: compact (reduce especialidades mostradas)", bullet))

    story.append(Paragraph("SOSButton", h2_style))
    story.append(Paragraph("• Botón circular rojo de 160px con texto SOS", bullet))
    story.append(Paragraph("• 2 anillos concéntricos animados pulsando (pulse infinito)", bullet))
    story.append(Paragraph("• Sombra roja para efecto de profundidad", bullet))
    story.append(Paragraph("• Prop: disabled (gris + sin animación)", bullet))

    story.append(Paragraph("StarRating", h2_style))
    story.append(Paragraph("• SVG stars con fill naranja", bullet))
    story.append(Paragraph("• Modo interactivo: touch para seleccionar rating", bullet))
    story.append(Paragraph("• Props: rating, maxStars, size, interactive, onRate", bullet))

    story.append(Paragraph("Logo", h2_style))
    story.append(Paragraph("• SVG personalizado: hexágono naranja + llave inglesa + pin ubicación", bullet))
    story.append(Paragraph("• Texto: MecánicosYa + tagline", bullet))
    story.append(Paragraph("• Props: size ('sm'|'md'|'lg'), showText", bullet))
    story.append(PageBreak())

    # ── 10. Tema ──
    story.append(Paragraph("10. Sistema de diseño (theme)", h1_style))

    story.append(Paragraph("Paleta de colores:", h2_style))
    story.append(make_table(
        ['Variable', 'Hex', 'Uso'],
        [
            ['primary', '#FF6B35', 'Botones, acentos, SOS'],
            ['primaryDark', '#E55A25', 'Hover/pressed'],
            ['background', '#111827', 'Fondo principal (dark)'],
            ['surface', '#1F2937', 'Tarjetas, cards'],
            ['card', '#374151', 'Cards secundarios'],
            ['text', '#F9FAFB', 'Texto principal'],
            ['textSecondary', '#9CA3AF', 'Texto secundario'],
            ['sos', '#EF4444', 'Botón SOS'],
            ['success', '#10B981', 'Completado, verificado'],
            ['warning', '#F59E0B', 'Estrellas, pendiente'],
            ['info', '#3B82F6', 'En progreso, tags azules'],
            ['border', '#374151', 'Bordes de cards'],
            ['star', '#F59E0B', 'Estrellas SVG'],
        ],
        [4*cm, 4*cm, 8*cm]
    ))

    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("Espaciado:", h2_style))
    story.append(Paragraph("xs=4, sm=8, md=16, lg=24, xl=32, xxl=48", normal))
    story.append(Paragraph("Radios:", h2_style))
    story.append(Paragraph("sm=8, md=12, lg=16, xl=24, full=9999", normal))
    story.append(Paragraph("Fuentes:", h2_style))
    story.append(Paragraph("xs=11, sm=13, md=15, lg=18, xl=22, xxl=28, hero=36", normal))
    story.append(PageBreak())

    # ── 11. Build ──
    story.append(Paragraph("11. Build & despliegue", h1_style))

    story.append(Paragraph("Stack técnico:", h2_style))
    story.append(make_table(
        ['Tecnología', 'Versión'],
        [
            ['Expo SDK', '54.0.34'],
            ['React Native', '0.81.5'],
            ['React', '19.1.0'],
            ['TypeScript', '5.3.3'],
            ['React Navigation', '6.x (Native Stack + Bottom Tabs)'],
            ['Zustand', '4.5.4 (state management)'],
            ['AsyncStorage', '2.2.0 (BD local)'],
            ['expo-linear-gradient', '15.0.8'],
            ['react-native-svg', '15.12.1'],
        ],
        [8*cm, 8*cm]
    ))

    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("Build con EAS:", h2_style))
    story.append(Paragraph("• Perfil: preview → APK para distribución interna", bullet))
    story.append(Paragraph("• Comando: eas build -p android --profile preview", bullet))
    story.append(Paragraph("• Keystore: generado en la nube por Expo", bullet))
    story.append(Paragraph("• Tiempo promedio: 7 minutos", bullet))

    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("Proyecto Expo:", h2_style))
    story.append(Paragraph("• URL: expo.dev/accounts/jerikareyna/projects/mecanicosya", normal))
    story.append(Paragraph("• Owner: @jerikareyna", normal))

    story.append(Spacer(1, 1*cm))
    story.append(hr())
    story.append(Paragraph("© 2026 MecánicosYa — Plataforma de mecánicos de motos a domicilio", ParagraphStyle('Footer', parent=normal, textColor=GRAY, alignment=1)))

    # ── Build PDF ──
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
        title="MecánicosYa - Documentación",
        author="MecánicosYa Team",
    )
    doc.build(story)
    print(f"✅ PDF generado: {OUTPUT}")

if __name__ == "__main__":
    build_pdf()
