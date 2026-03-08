Proyecto: Aplicacion web del tiempo
Rol del agente: Desarrollador web experto con 12 años de experiencia.
Objetivo: Crear una aplicacion web que muestre el tiempo de cualquier ciudad del mundo de forma sencilla y agradable para el usuario, rapida, consumiendo la API externa y dando la posibilidad de ver el tiempo actual y el tiempo de los proximos 24 horas y dando la posibilidad de buscar cualquier ciudad del mundo en el localstorage para poder verlas posterioresmente.

url de api a consumir: [open-meteo.com](https://open-meteo.com/)

Funcionalidades:
- Buscar ciudad
input para buscar la ciudad
boton para buscar
mensaje si la ciudad no existe
dar sugerencias de ciudad mientras escribimos

Clima actual
Nombre de la ciudad
Temperatura actual
Descripcion del clima (nublado, soleado, lluvia, etc)
sensacion termica
humedad
velocidad del viento

clima por horas
nombre de la ciudad
temperatura
descripcion del clima
Icono representativo del clima por horas
hora
boton para guardar la ciudad

localidades guardadas
nombre de la ciudad
boton para eliminar la ciudad
lista de localidades guardadas
eliminar localidad
evitar que se repitan las localidades guardadas

consideraciones importantes
la parte de gestionar las localidades, asi como la parte de anadir localidades debe hacerse desde una ventana modal
aparte tendre el buscador para buscar el tiempo de nuevas localidades
el diseno de la ventana modal debe ser el mismo que el diseno de las aplicaciones
una vez que tenga guardadas las localidades, podre ir dando clic en cada una de ellas
para ver el tiempo actual y el tiempo de los proximos 24 hotas

stack
html
css(sin frameworks)
js (vainilla, sin frameworks)

preferencias
basate en las imagenes de diseño para crear la aplicacion y en el html del diseno que tienes en la carpeta design del proyecto

preferencias de estilos
eliminar tailwindcss y pasarlo todo a css nativo
colores(los del diseño)
uso de medidas con rem, usando font size base de 10px
usar buenas practicas de maquetacion css y si es necesario usa flexbox y css grid layout
usa el font size en rem, usando un font size base de 10px
que la webapp sea responsive

preferencias de codigo
no anadas dependencias externas
html5 debe ser semantico
no uses alert, confirm, prompt,todo el feedback debe ser visual en el dom
no uses innerHTML, todo el contenido debe ser insertado con appendChild, o previamente creando un elemento con document.createElement
cuidado con olvidar prevenir el default de los eventos en submits o clicks
prioriza el codigo legible y mantenible
prioriza que el codigo sea sencillo de entender
si el agente duda, que revise las especificaciones del proyecto y sino que pregunte al usuario