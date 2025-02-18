// Importar dependencias
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Configuración de MongoDB directamente en el código
const MONGO_URI = "mongodb+srv://ikermiguel2210:t3xWmaX8ypUlpVQp@cluster0.9aray.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Inicializar la app
const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Conectar a MongoDB
const conectarDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("Error en la conexión a MongoDB:", error);
    process.exit(1);
  }
};
conectarDB();

// Definir el modelo de Partido
const PartidoSchema = new mongoose.Schema({
  equipo_local: { type: String, required: true },
  equipo_visitante: { type: String, required: true },
  fecha: { type: Date, required: true },
  jornada: { type: Number, default: 0 },
  goles_local: { type: Number, default: 0 },
  goles_visitante: { type: Number, default: 0 },
  corners_local: { type: Number, default: 0 },
  corners_visitante: { type: Number, default: 0 },
  tarjetas_local: { type: Number, default: 0 },
  tarjetas_visitante: { type: Number, default: 0 },
  ganador: { type: String, default: "Empate" },
  perdedor: { type: String, default: "Empate" },
});

// Middleware para calcular ganador y perdedor antes de guardar
PartidoSchema.pre("save", function (next) {
  if (this.goles_local > this.goles_visitante) {
    this.ganador = this.equipo_local;
    this.perdedor = this.equipo_visitante;
  } else if (this.goles_visitante > this.goles_local) {
    this.ganador = this.equipo_visitante;
    this.perdedor = this.equipo_local;
  } else {
    this.ganador = "Empate";
    this.perdedor = "Empate";
  }
  next();
});

const Partido = mongoose.model("Partido", PartidoSchema);

// Rutas
app.get("/partidos", async (req, res) => {
  try {
    const partidos = await Partido.find();
    res.json(partidos);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo partidos" });
  }
});

app.post("/partidos", async (req, res) => {
  try {
    const nuevoPartido = new Partido(req.body);
    await nuevoPartido.save();
    res.status(201).json(nuevoPartido);
  } catch (error) {
    res.status(400).json({ message: "Error guardando partido" });
  }
});

app.put("/partidos/:id", async (req, res) => {
  try {
    const partidoActualizado = await Partido.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!partidoActualizado) {
      return res.status(404).json({ message: "Partido no encontrado" });
    }
    res.json(partidoActualizado);
  } catch (error) {
    res.status(400).json({ message: "Error actualizando partido" });
  }
});

app.delete("/partidos/:id", async (req, res) => {
  try {
    const partidoEliminado = await Partido.findByIdAndDelete(req.params.id);
    if (!partidoEliminado) {
      return res.status(404).json({ message: "Partido no encontrado" });
    }
    res.json({ message: "Partido eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando partido" });
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
