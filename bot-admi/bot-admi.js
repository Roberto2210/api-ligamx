// Importar dependencias
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Token del bot de Telegram (reemplaza esto con tu token)
const token = '7482159480:AAFCA26sN7qkjt-xRI_7ijCnpYzJVpNv6eM';
const bot = new TelegramBot(token, { polling: true });

// URL de tu API de CRUD
const apiUrl = 'http://localhost:5000/partidos'; // Cambia por la URL correcta si usas un servidor en línea

// Lista de equipos de la Liga MX con emojis
const teams = [
  { nombre: "América", emoji: "🦅" },
  { nombre: "Chivas", emoji: "🐐" },
  { nombre: "Tigres UANL", emoji: "🐯" },
  { nombre: "Cruz Azul", emoji: "🔵" },
  { nombre: "Pumas UNAM", emoji: "🐆" },
  { nombre: "Monterrey", emoji: "⚡" },
  { nombre: "Toluca", emoji: "😈" },
  { nombre: "Atlas", emoji: "🦊" },
  { nombre: "León", emoji: "🦁" },
  { nombre: "Santos Laguna", emoji: "💚" },
  { nombre: "Pachuca", emoji: "🏔" },
  { nombre: "Querétaro", emoji: "🐓" },
  { nombre: "Necaxa", emoji: "⚡" },
  { nombre: "Mazatlán FC", emoji: "⚓" },
  { nombre: "Juárez", emoji: "🐴" },
  { nombre: "Tijuana", emoji: "🐕" },
  { nombre: "San Luis", emoji: "🏴‍☠️" },
  { nombre: "Puebla", emoji: "🔵⚪" }
];

// Variable para almacenar los datos del partido temporalmente
let partidoTemp = {};

// Función para mostrar la lista de equipos numerados
const getTeamsList = () => {
  return teams.map((team, index) => `${index + 1}. ${team.emoji} ${team.nombre}`).join("\n");
};

// Comando para iniciar la creación de un partido
bot.onText(/\/crear/, (msg) => {
  const chatId = msg.chat.id;
  partidoTemp = {}; // Reinicia los datos previos

  bot.sendMessage(chatId, `Selecciona el equipo local enviando el número correspondiente:\n\n${getTeamsList()}`);

  bot.once('message', (msg) => {
    const indexLocal = parseInt(msg.text) - 1;
    if (indexLocal >= 0 && indexLocal < teams.length) {
      partidoTemp.equipo_local = teams[indexLocal].nombre;
      bot.sendMessage(chatId, `Seleccionaste ${teams[indexLocal].emoji} ${teams[indexLocal].nombre} como equipo local.\n\nAhora selecciona el equipo visitante:\n\n${getTeamsList()}`);

      bot.once('message', (msg) => {
        const indexVisitante = parseInt(msg.text) - 1;
        if (indexVisitante >= 0 && indexVisitante < teams.length) {
          partidoTemp.equipo_visitante = teams[indexVisitante].nombre;
          bot.sendMessage(chatId, `Seleccionaste ${teams[indexVisitante].emoji} ${teams[indexVisitante].nombre} como equipo visitante.\n\nIngresa la fecha del partido (Formato: yyyy-mm-dd):`);

          bot.once('message', (msg) => {
            partidoTemp.fecha = new Date(msg.text);
            bot.sendMessage(chatId, '¿Qué jornada es?');

            bot.once('message', (msg) => {
              partidoTemp.jornada = parseInt(msg.text);
              bot.sendMessage(chatId, '¿Cuántos goles hizo el equipo local?');

              bot.once('message', (msg) => {
                partidoTemp.goles_local = parseInt(msg.text);
                bot.sendMessage(chatId, '¿Cuántos goles hizo el equipo visitante?');

                bot.once('message', (msg) => {
                  partidoTemp.goles_visitante = parseInt(msg.text);
                  bot.sendMessage(chatId, '¿Cuántos corners hizo el equipo local?');

                  bot.once('message', (msg) => {
                    partidoTemp.corners_local = parseInt(msg.text);
                    bot.sendMessage(chatId, '¿Cuántos corners hizo el equipo visitante?');

                    bot.once('message', (msg) => {
                      partidoTemp.corners_visitante = parseInt(msg.text);
                      bot.sendMessage(chatId, '¿Cuántas tarjetas hizo el equipo local?');

                      bot.once('message', (msg) => {
                        partidoTemp.tarjetas_local = parseInt(msg.text);
                        bot.sendMessage(chatId, '¿Cuántas tarjetas hizo el equipo visitante?');

                        bot.once('message', async (msg) => {
                          partidoTemp.tarjetas_visitante = parseInt(msg.text);

                          // Determinar ganador y perdedor
                          if (partidoTemp.goles_local > partidoTemp.goles_visitante) {
                            partidoTemp.ganador = partidoTemp.equipo_local;
                            partidoTemp.perdedor = partidoTemp.equipo_visitante;
                          } else if (partidoTemp.goles_local < partidoTemp.goles_visitante) {
                            partidoTemp.ganador = partidoTemp.equipo_visitante;
                            partidoTemp.perdedor = partidoTemp.equipo_local;
                          } else {
                            partidoTemp.ganador = "Empate";
                            partidoTemp.perdedor = "Empate";
                          }

                          // Enviar los datos del partido a la API
                          try {
                            const response = await axios.post(apiUrl, partidoTemp);
                            bot.sendMessage(chatId, `✅ Partido creado con éxito:\n\n${teams.find(t => t.nombre === partidoTemp.equipo_local).emoji} ${partidoTemp.equipo_local} vs ${teams.find(t => t.nombre === partidoTemp.equipo_visitante).emoji} ${partidoTemp.equipo_visitante}\nFecha: ${partidoTemp.fecha.toLocaleDateString()}\nJornada: ${partidoTemp.jornada}\nGoles: ${partidoTemp.goles_local} - ${partidoTemp.goles_visitante}\nCorners: ${partidoTemp.corners_local} - ${partidoTemp.corners_visitante}\nTarjetas: ${partidoTemp.tarjetas_local} - ${partidoTemp.tarjetas_visitante}\nGanador: ${partidoTemp.ganador}`);
                          } catch (error) {
                            bot.sendMessage(chatId, '❌ Error al crear el partido');
                          }
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        } else {
          bot.sendMessage(chatId, '⚠️ Número inválido. Vuelve a usar /crear para intentarlo de nuevo.');
        }
      });
    } else {
      bot.sendMessage(chatId, '⚠️ Número inválido. Vuelve a usar /crear para intentarlo de nuevo.');
    }
  });

  // Comando para obtener los partidos por jornada
bot.onText(/\/obtener_jornada/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, 'Ingresa el número de la jornada que deseas obtener (por ejemplo, 1 para la jornada 1):');
  
  bot.once('message', async (msg) => {
    const jornada = parseInt(msg.text);

    if (isNaN(jornada) || jornada < 1) {
      bot.sendMessage(chatId, '⚠️ El número de jornada ingresado no es válido. Intenta de nuevo usando /obtener_jornada.');
      return;
    }

    try {
      // Realizamos una petición a la API para obtener los partidos por jornada
      const response = await axios.get(`${apiUrl}?jornada=${jornada}`);
      
      if (response.data.length === 0) {
        bot.sendMessage(chatId, `No se encontraron partidos para la jornada ${jornada}.`);
      } else {
        let mensaje = `Partidos de la jornada ${jornada}:\n\n`;
        
        response.data.forEach(partido => {
          mensaje += `${partido.equipo_local} ${partido.goles_local} - ${partido.goles_visitante} ${partido.equipo_visitante}\n`;
        });
        
        bot.sendMessage(chatId, mensaje);
      }
    } catch (error) {
      bot.sendMessage(chatId, '❌ Error al obtener los partidos. Intenta nuevamente.');
    }
  });
});

  
});

// Función para obtener el emoji del equipo
const getTeamEmoji = (teamName) => {
  const team = teams.find(t => t.nombre === teamName);
  return team ? team.emoji : "⚽";
};

// Comando para generar la tabla de posiciones
bot.onText(/\/tabla/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const response = await axios.get(apiUrl);
    const partidos = response.data;

    // Objeto para almacenar la tabla de posiciones
    let tabla = {};

    // Procesar cada partido
    partidos.forEach(partido => {
      const { equipo_local, equipo_visitante, goles_local, goles_visitante } = partido;

      // Inicializar equipos en la tabla si no existen
      if (!tabla[equipo_local]) {
        tabla[equipo_local] = { puntos: 0, jugados: 0, ganados: 0, empatados: 0, perdidos: 0, gf: 0, gc: 0, dg: 0 };
      }
      if (!tabla[equipo_visitante]) {
        tabla[equipo_visitante] = { puntos: 0, jugados: 0, ganados: 0, empatados: 0, perdidos: 0, gf: 0, gc: 0, dg: 0 };
      }

      // Actualizar estadísticas
      tabla[equipo_local].jugados++;
      tabla[equipo_visitante].jugados++;
      tabla[equipo_local].gf += goles_local;
      tabla[equipo_local].gc += goles_visitante;
      tabla[equipo_visitante].gf += goles_visitante;
      tabla[equipo_visitante].gc += goles_local;

      if (goles_local > goles_visitante) {
        // Victoria local
        tabla[equipo_local].puntos += 3;
        tabla[equipo_local].ganados++;
        tabla[equipo_visitante].perdidos++;
      } else if (goles_local < goles_visitante) {
        // Victoria visitante
        tabla[equipo_visitante].puntos += 3;
        tabla[equipo_visitante].ganados++;
        tabla[equipo_local].perdidos++;
      } else {
        // Empate
        tabla[equipo_local].puntos += 1;
        tabla[equipo_visitante].puntos += 1;
        tabla[equipo_local].empatados++;
        tabla[equipo_visitante].empatados++;
      }

      // Calcular diferencia de goles
      tabla[equipo_local].dg = tabla[equipo_local].gf - tabla[equipo_local].gc;
      tabla[equipo_visitante].dg = tabla[equipo_visitante].gf - tabla[equipo_visitante].gc;
    });

    // Convertir la tabla en un array y ordenarla por puntos y diferencia de goles
    const clasificacion = Object.entries(tabla).map(([equipo, stats]) => ({
      equipo,
      ...stats
    })).sort((a, b) => b.puntos - a.puntos || b.dg - a.dg || b.gf - a.gf);

    // Construir mensaje con la tabla de posiciones
    let mensaje = "🏆 *Tabla de Posiciones Liga MX* 🏆\n\n";
    mensaje += "📊 Pts | J | G | E | P | GF | GC | DG\n";
    mensaje += "-----------------------------------\n";

    clasificacion.forEach((equipo, index) => {
      mensaje += `${index + 1}. ${getTeamEmoji(equipo.equipo)} *${equipo.equipo}*\n`;
      mensaje += `   ${equipo.puntos}pts | ${equipo.jugados} | ${equipo.ganados} | ${equipo.empatados} | ${equipo.perdidos} | ${equipo.gf} | ${equipo.gc} | ${equipo.dg}\n`;
    });

    // Enviar la tabla de posiciones en el bot
    bot.sendMessage(chatId, mensaje, { parse_mode: "Markdown" });

  } catch (error) {
    bot.sendMessage(chatId, "❌ Error al obtener la tabla de posiciones. Intenta de nuevo.");
    console.error("Error al obtener los datos:", error);
  }
});

// Comando para obtener todos los partidos de un equipo específico
bot.onText(/\/partidos_equipo/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, 'Ingrese el nombre del equipo que desea consultar:');
  
  bot.once('message', async (msg) => {
    const equipoBuscado = msg.text.trim();
    
    // Validar si el equipo ingresado existe
    const equipoExiste = teams.some(team => team.nombre.toLowerCase() === equipoBuscado.toLowerCase());
    
    if (!equipoExiste) {
      bot.sendMessage(chatId, '⚠️ Equipo no encontrado. Asegúrate de escribir correctamente el nombre.');
      return;
    }

    try {
      const response = await axios.get(apiUrl);
      const partidos = response.data;

      // Filtrar los partidos donde el equipo ingresado participó
      const partidosEquipo = partidos.filter(p => 
        p.equipo_local.toLowerCase() === equipoBuscado.toLowerCase() || 
        p.equipo_visitante.toLowerCase() === equipoBuscado.toLowerCase()
      );

      if (partidosEquipo.length === 0) {
        bot.sendMessage(chatId, `❌ No se encontraron partidos para *${equipoBuscado}*.`);
        return;
      }

      let mensaje = `📋 *Partidos de ${equipoBuscado}:*\n\n`;

      partidosEquipo.forEach(partido => {
        const emojiLocal = getTeamEmoji(partido.equipo_local);
        const emojiVisitante = getTeamEmoji(partido.equipo_visitante);
        
        mensaje += `📅 *Fecha:* ${new Date(partido.fecha).toLocaleDateString()}\n`;
        mensaje += `⚽ *Resultado:* ${partido.equipo_local} ${emojiLocal} ${partido.goles_local} - ${partido.goles_visitante} ${emojiVisitante} ${partido.equipo_visitante}\n`;
        mensaje += `🎯 *Corners:* ${partido.corners_local} - ${partido.corners_visitante}\n`;
        mensaje += `🟨 *Tarjetas:* ${partido.tarjetas_local} - ${partido.tarjetas_visitante}\n`;
        mensaje += `---------------------------------\n`;
      });

      bot.sendMessage(chatId, mensaje, { parse_mode: "Markdown" });

    } catch (error) {
      bot.sendMessage(chatId, '❌ Error al obtener los partidos. Intenta nuevamente.');
      console.error("Error al obtener los datos:", error);
    }
  });
});


// Comando para obtener las estadísticas de cada equipo
bot.onText(/\/estadisticas/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const response = await axios.get(apiUrl);
    const partidos = response.data;

    // Objeto para almacenar las estadísticas de cada equipo
    let estadisticas = {};

    // Procesar cada partido y actualizar las estadísticas
    partidos.forEach(partido => {
      const { equipo_local, equipo_visitante, goles_local, goles_visitante, tarjetas_local, tarjetas_visitante } = partido;

      // Inicializar equipos en las estadísticas si no existen
      if (!estadisticas[equipo_local]) {
        estadisticas[equipo_local] = { goles: 0, goles_recibidos: 0, tarjetas: 0, partidos: 0 };
      }
      if (!estadisticas[equipo_visitante]) {
        estadisticas[equipo_visitante] = { goles: 0, goles_recibidos: 0, tarjetas: 0, partidos: 0 };
      }

      // Actualizar estadísticas para el equipo local
      estadisticas[equipo_local].goles += goles_local;
      estadisticas[equipo_local].goles_recibidos += goles_visitante;
      estadisticas[equipo_local].tarjetas += tarjetas_local;
      estadisticas[equipo_local].partidos++;

      // Actualizar estadísticas para el equipo visitante
      estadisticas[equipo_visitante].goles += goles_visitante;
      estadisticas[equipo_visitante].goles_recibidos += goles_local;
      estadisticas[equipo_visitante].tarjetas += tarjetas_visitante;
      estadisticas[equipo_visitante].partidos++;
    });

    // Construir mensaje con las estadísticas promedio por equipo
    let mensaje = "📊 *Estadísticas Promedio por Equipo* 📊\n\n";
    mensaje += "Equipo | Prom. Goles | Prom. Goles Recibidos | Prom. Tarjetas\n";
    mensaje += "-------------------------------------------------------------\n";

    Object.entries(estadisticas).forEach(([equipo, stats]) => {
      const promedioGoles = (stats.goles / stats.partidos).toFixed(2);
      const promedioGolesRecibidos = (stats.goles_recibidos / stats.partidos).toFixed(2);
      const promedioTarjetas = (stats.tarjetas / stats.partidos).toFixed(2);

      mensaje += `${getTeamEmoji(equipo)} *${equipo}* | ${promedioGoles} | ${promedioGolesRecibidos} | ${promedioTarjetas}\n`;
    });

    // Enviar las estadísticas
    bot.sendMessage(chatId, mensaje, { parse_mode: "Markdown" });

  } catch (error) {
    bot.sendMessage(chatId, '❌ Error al obtener las estadísticas. Intenta de nuevo.');
    console.error("Error al obtener los datos:", error);
  }
});

// Comando para mostrar el menú con todos los comandos disponibles
bot.onText(/\/menu/, (msg) => {
  const chatId = msg.chat.id;

  const menu = `
    👋 ¡Bienvenido al Bot de Pronósticos de la Liga MX! Aquí están los comandos disponibles:

    1️⃣ /crear - Crear un nuevo partido con estadísticas (goles, corners, tarjetas).
    2️⃣ /obtener_jornada - Obtener los partidos de una jornada específica.
    3️⃣ /tabla - Ver la tabla de posiciones de la Liga MX.
    4️⃣ /partidos_equipo - Ver los partidos de un equipo específico.
    5️⃣ /estadisticas - Ver estadísticas promedio de goles, goles recibidos y tarjetas por equipo.
    
    📊 Para más detalles sobre cada comando, solo escribe el comando correspondiente.
  `;

  bot.sendMessage(chatId, menu);
});

