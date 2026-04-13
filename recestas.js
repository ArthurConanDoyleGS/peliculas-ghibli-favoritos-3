const contenedorPeliculas = document.getElementById("peliculas");
const contenedorFavoritas = document.getElementById("favoritas");
const buscador = document.getElementById("buscador");
const url = "https://ghibliapi.vercel.app/films";
const CLAVE_FAVORITAS = "ghibli_favoritas";

let listaPeliculas = [];
let favoritas = [];

function cargarFavoritasDesdeLocalStorage() {
  const favoritasGuardadas = localStorage.getItem(CLAVE_FAVORITAS);

  if (favoritasGuardadas) {
    favoritas = JSON.parse(favoritasGuardadas);
  } else {
    favoritas = [];
  }
}

function guardarFavoritasEnLocalStorage() {
  localStorage.setItem(CLAVE_FAVORITAS, JSON.stringify(favoritas));
}

function esFavorita(id) {
  return favoritas.some(function (pelicula) {
    return pelicula.id === id;
  });
}

function crearTarjetaHTML(pelicula, esSeccionFavoritas = false) {
  const imagen = pelicula.image || "https://via.placeholder.com/300x450?text=Sin+imagen";
  const titulo = pelicula.title || "Sin título";
  const director = pelicula.director || "Desconocido";
  const anio = pelicula.release_date || "No disponible";
  const puntuacion = pelicula.rt_score || "N/A";

  let botonHTML = "";

  if (esSeccionFavoritas) {
    botonHTML = `
      <button class="boton boton-eliminar" data-id="${pelicula.id}">
        Eliminar de favoritas
      </button>
    `;
  } else {
    botonHTML = esFavorita(pelicula.id)
      ? `
        <button class="boton boton-guardada" data-id="${pelicula.id}" disabled>
          Ya es favorita
        </button>
      `
      : `
        <button class="boton boton-favorita" data-id="${pelicula.id}">
          Añadir a favoritas
        </button>
      `;
  }

  return `
    <article class="tarjeta">
      <div class="imagen-contenedor">
        <img src="${imagen}" alt="Póster de ${titulo}">
      </div>

      <div class="contenido-tarjeta">
        <h3>${titulo}</h3>
        <p><strong>Director:</strong> ${director}</p>
        <p><strong>Año:</strong> ${anio}</p>
        <p><strong>Puntuación:</strong> ${puntuacion}</p>

        <div class="acciones">
          ${botonHTML}
        </div>
      </div>
    </article>
  `;
}

function mostrarPeliculas(datos) {
  if (datos.length === 0) {
    contenedorPeliculas.innerHTML = `
      <p class="mensaje">No se encontraron películas con ese título.</p>
    `;
    return;
  }

  let html = "";

  datos.forEach(function (pelicula) {
    html += crearTarjetaHTML(pelicula, false);
  });

  contenedorPeliculas.innerHTML = html;
}

function mostrarFavoritas() {
  if (favoritas.length === 0) {
    contenedorFavoritas.innerHTML = `
      <p class="mensaje">Todavía no has añadido películas favoritas.</p>
    `;
    return;
  }

  let html = "";

  favoritas.forEach(function (pelicula) {
    html += crearTarjetaHTML(pelicula, true);
  });

  contenedorFavoritas.innerHTML = html;
}

function anyadirFavorita(idPelicula) {
  const peliculaSeleccionada = listaPeliculas.find(function (pelicula) {
    return pelicula.id === idPelicula;
  });

  if (!peliculaSeleccionada || esFavorita(idPelicula)) {
    return;
  }

  favoritas.push(peliculaSeleccionada);
  guardarFavoritasEnLocalStorage();
  mostrarFavoritas();
  aplicarFiltroActual();
}

function eliminarFavorita(idPelicula) {
  favoritas = favoritas.filter(function (pelicula) {
    return pelicula.id !== idPelicula;
  });

  guardarFavoritasEnLocalStorage();
  mostrarFavoritas();
  aplicarFiltroActual();
}

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function aplicarFiltroActual() {
  const texto = normalizarTexto(buscador.value);

  const peliculasFiltradas = listaPeliculas.filter(function (pelicula) {
    return normalizarTexto(pelicula.title).includes(texto);
  });

  mostrarPeliculas(peliculasFiltradas);
}

function cargarPeliculas() {
  fetch(url)
    .then(function (respuesta) {
      if (!respuesta.ok) {
        throw new Error("No se pudo conectar con la API");
      }
      return respuesta.json();
    })
    .then(function (datos) {
      listaPeliculas = datos;
      aplicarFiltroActual();
    })
    .catch(function (error) {
      contenedorPeliculas.innerHTML = `
        <p class="mensaje error">Error al cargar las películas. Inténtalo de nuevo más tarde.</p>
      `;
      console.error(error);
    });
}

buscador.addEventListener("input", function () {
  aplicarFiltroActual();
});

contenedorPeliculas.addEventListener("click", function (evento) {
  if (evento.target.classList.contains("boton-favorita")) {
    const idPelicula = evento.target.dataset.id;
    anyadirFavorita(idPelicula);
  }
});

contenedorFavoritas.addEventListener("click", function (evento) {
  if (evento.target.classList.contains("boton-eliminar")) {
    const idPelicula = evento.target.dataset.id;
    eliminarFavorita(idPelicula);
  }
});

cargarFavoritasDesdeLocalStorage();
mostrarFavoritas();
cargarPeliculas();